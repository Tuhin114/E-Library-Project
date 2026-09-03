import crypto from "crypto";
import Fee from "../models/Fee.js";
import Payment from "../models/Payment.js";
import razorpay from "../config/razorpay.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { FEE_STATUS } from "../constants/feeStatus.js";
import { PAYMENT_STATUS } from "../constants/paymentStatus.js";
import { NOTIFICATION_CATEGORIES, NOTIFICATION_TYPES } from "../constants/notificationTypes.js";
import * as feeService from "./feeService.js";
import * as notificationService from "./notificationService.js";

// Phase 9 M2 — Razorpay Payment Links (a hosted page), not Checkout.js
// embedded in this app's own UI. A hosted link is the smallest real
// integration that's still a genuine gateway flow (real card/UPI entry
// on Razorpay's own page) without this app touching raw payment data.
// Test mode only — this app never sets a live key anywhere.
export const createCheckoutSession = async (feeId, requester) => {
  if (!env.razorpay.keyId || !env.razorpay.keySecret) {
    throw new ApiError(
      503,
      "Payment gateway is not configured on this server (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET missing)",
    );
  }

  const fee = await Fee.findById(feeId).populate("student", "name email").populate("book", "title");
  if (!fee) throw new ApiError(404, "Fee not found");

  const isOwner = fee.student._id.toString() === requester._id.toString();
  if (!isOwner) {
    throw new ApiError(403, "You do not have access to this fee");
  }

  if (fee.status !== FEE_STATUS.OUTSTANDING) {
    throw new ApiError(409, `Cannot pay a fee that is ${fee.status}, not outstanding`);
  }

  // Reuse an existing still-open payment link for this fee instead of
  // creating a new one on every click (closed tab, changed their mind).
  const existingPending = await Payment.findOne({
    fee: fee._id,
    status: PAYMENT_STATUS.PENDING,
  }).sort({ createdAt: -1 });

  if (existingPending) {
    const existingLink = await razorpay.paymentLink.fetch(existingPending.paymentLinkId);
    if (existingLink.status === "created") {
      return { paymentLinkId: existingLink.id, url: existingLink.short_url };
    }
  }

  // Amount is in the smallest currency unit (paise for INR), same
  // convention Razorpay uses everywhere in its API.
  const amountInPaise = Math.round(fee.amount * 100);

  const link = await razorpay.paymentLink.create({
    amount: amountInPaise,
    currency: "INR",
    accept_partial: false,
    description: `${fee.type} fee — "${fee.book.title}"`,
    customer: {
      name: fee.student.name,
      email: fee.student.email,
    },
    notify: { sms: false, email: true },
    reference_id: fee._id.toString(),
    callback_url: `${env.clientUrl}/payments/callback`,
    callback_method: "get",
    notes: {
      feeId: fee._id.toString(),
      studentId: fee.student._id.toString(),
    },
  });

  await Payment.create({
    fee: fee._id,
    student: fee.student._id,
    paymentLinkId: link.id,
    status: PAYMENT_STATUS.PENDING,
    amount: fee.amount,
  });

  return { paymentLinkId: link.id, url: link.short_url };
};

// Maps a Payment Link webhook event to this app's own PAYMENT_STATUS
// vocabulary. "payment_link.paid" is the one that actually matters —
// it's what marks the Fee paid; the others are tracked on the audit
// log for completeness only.
const EVENT_STATUS_MAP = {
  "payment_link.paid": PAYMENT_STATUS.PAID,
  "payment_link.expired": PAYMENT_STATUS.EXPIRED,
  "payment_link.cancelled": PAYMENT_STATUS.CANCELLED,
};

// Verifies the webhook signature against the raw request body — see
// app.js's route-specific express.raw() middleware, mounted ahead of
// the global express.json(). Razorpay's signature is an HMAC-SHA256 of
// the exact raw bytes it sent, keyed with the webhook secret, so a
// re-serialized JSON object is not guaranteed to reproduce those bytes.
export const verifyWebhookSignature = (rawBody, signatureHeader) => {
  if (!env.razorpay.webhookSecret) {
    throw new ApiError(503, "Webhook secret is not configured on this server");
  }
  if (!signatureHeader) {
    throw new ApiError(400, "Missing X-Razorpay-Signature header");
  }

  const expectedSignature = crypto
    .createHmac("sha256", env.razorpay.webhookSecret)
    .update(rawBody)
    .digest("hex");

  const signatureBuffer = Buffer.from(signatureHeader);
  const expectedBuffer = Buffer.from(expectedSignature);

  const isValid =
    signatureBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(signatureBuffer, expectedBuffer);

  if (!isValid) {
    throw new ApiError(400, "Webhook signature verification failed");
  }

  return JSON.parse(rawBody.toString("utf8"));
};

export const handleWebhookEvent = async (event) => {
  const mappedStatus = EVENT_STATUS_MAP[event.event];

  // Events this endpoint isn't subscribed to handling logic for
  // (Razorpay only sends what's checked in the dashboard, but this
  // stays defensive either way). A webhook endpoint should never 4xx
  // on an event it simply doesn't act on.
  if (!mappedStatus) return { handled: false };

  const paymentLinkId = event.payload?.payment_link?.entity?.id;
  if (!paymentLinkId) return { handled: false };

  const payment = await Payment.findOne({ paymentLinkId });
  if (!payment) {
    console.error(`[paymentService] Webhook for unknown payment link ${paymentLinkId}`);
    return { handled: false };
  }

  payment.status = mappedStatus;
  payment.razorpayPaymentId =
    event.payload?.payment?.entity?.id || payment.razorpayPaymentId;
  payment.lastWebhookPayload = event.payload;
  await payment.save();

  if (mappedStatus !== PAYMENT_STATUS.PAID) {
    return { handled: true };
  }

  const fee = await feeService.markFeePaidFromWebhook(payment.fee, {
    paidBy: payment.student,
  });

  // Reuses Tier 1's notification system rather than building a third
  // "payment received" channel from scratch. Links to /fees, where
  // M1's "Download Receipt" button (now that the fee is PAID) is the
  // actual receipt-delivery moment — this app's emailService has no
  // attachment support to embed the PDF directly in the email itself.
  await notificationService.notify({
    user: fee.student,
    category: NOTIFICATION_CATEGORIES.ACCOUNT,
    type: NOTIFICATION_TYPES.FEE_PAID,
    title: "Payment received",
    message: `Your payment of $${fee.amount.toFixed(2)} for "${fee.book.title}" was received. Your receipt is ready to download.`,
    link: "/fees",
    relatedEntity: { kind: "Fee", id: fee._id },
  });

  return { handled: true };
};

import mongoose from "mongoose";
import {
  PAYMENT_STATUS,
  PAYMENT_STATUS_VALUES,
  PAYMENT_PROVIDER,
  PAYMENT_PROVIDER_VALUES,
} from "../constants/paymentStatus.js";

const paymentSchema = new mongoose.Schema(
  {
    fee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fee",
      required: true,
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: PAYMENT_PROVIDER_VALUES,
      default: PAYMENT_PROVIDER.RAZORPAY,
    },
    // Razorpay's Payment Link id (e.g. "plink_..."). The webhook's join
    // key back to this Payment, since the webhook payload identifies
    // the link, not our Fee id directly.
    paymentLinkId: {
      type: String,
      required: true,
      unique: true,
    },
    // Populated once the link's underlying payment exists
    // (Razorpay's "pay_..." id). Null until then.
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: PAYMENT_STATUS_VALUES,
      default: PAYMENT_STATUS.PENDING,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
    },
    lastWebhookPayload: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Payment", paymentSchema);

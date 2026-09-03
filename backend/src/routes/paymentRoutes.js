import { Router } from "express";
import * as paymentController from "../controllers/paymentController.js";

// No `authenticate` here by design — Razorpay is the caller, not a
// logged-in user. Signature verification (inside
// paymentService.verifyWebhookSignature) is what authenticates this
// request instead of a Bearer token.
const router = Router();

router.post("/webhook", paymentController.razorpayWebhook);

export default router;

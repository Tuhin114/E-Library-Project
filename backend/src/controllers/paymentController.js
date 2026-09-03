import * as paymentService from "../services/paymentService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// req.body arrives as a raw Buffer here, not parsed JSON — see app.js's
// route-specific express.raw() middleware, mounted ahead of the global
// express.json(). No ApiResponse envelope: Razorpay only reads the HTTP
// status code (2xx = stop retrying; anything else = retry later).
export const razorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const event = paymentService.verifyWebhookSignature(req.body, signature);
  await paymentService.handleWebhookEvent(event);
  res.status(200).json({ status: "ok" });
});

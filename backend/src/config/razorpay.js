import Razorpay from "razorpay";
import { env } from "./env.js";

const razorpay = new Razorpay({
  key_id: env.razorpay.keyId || "rzp_test_placeholder",
  key_secret: env.razorpay.keySecret || "placeholder",
});

export default razorpay;

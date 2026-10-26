const mongoose = require("mongoose");

// One row per Stripe Checkout session we have acted on. The unique sessionId is what makes
// fulfilment idempotent: the browser return and the webhook can both fire, only one wins.
const stripePaymentSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    kind: { type: String, enum: ["visit", "plan"], required: true },
    status: { type: String, enum: ["processing", "fulfilled", "refunded", "failed"], default: "processing" },
    amount: Number, // in EGP
    detail: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("StripePayment", stripePaymentSchema);

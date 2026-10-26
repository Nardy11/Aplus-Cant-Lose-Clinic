// Card payments (Stripe Checkout).
//
// Rules this module enforces:
//  1. The server decides the price. The browser only says WHAT it wants to buy.
//  2. A payment is only acted on after Stripe says it is paid, either because the browser came
//     back (confirmCheckout asks Stripe) or because Stripe called the webhook. Never because a
//     URL was opened.
//  3. Acting on a payment is idempotent (see Models/stripePayment.js).
const mongoose = require("mongoose");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
const Doctor = require("../Models/doctor");
const Patient = require("../Models/patient");
const Appointment = require("../Models/appointments");
const HPackages = require("../Models/hpackages");
const StripePayment = require("../Models/stripePayment");

const frontend = () => process.env.FRONTEND_URL || "http://localhost:3000";
const toMinor = (egp) => Math.round(Number(egp) * 100); // EGP -> piasters
const isId = (v) => mongoose.Types.ObjectId.isValid(v);

const visitTime = (d) =>
  new Date(d).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Africa/Cairo" });

// Session price: doctor's hourly rate + 10% clinic markup, minus the payer's plan discount on sessions.
function visitPrice(doctor, payer) {
  const base = Number(doctor.rate || 0) * 1.1;
  const plan = payer && payer.hPStatus === "Subscribed" && payer.hPackage && typeof payer.hPackage === "object" ? payer.hPackage : null;
  const discount = plan ? Number(plan.doctorDisc || 0) : 0;
  return { amount: Math.round(base * (1 - discount / 100)), base: Math.round(base), discount };
}

// The payer may buy for themselves or for a family member who has their own account.
function canBuyFor(payer, recipient) {
  if (!payer || !recipient) return false;
  if (String(payer._id) === String(recipient._id)) return true;
  return (payer.family || []).some((f) => f.pid && String(f.pid) === String(recipient._id));
}

const fail = (res, status, error) => res.status(status).json({ error });

// POST /checkout/visit  { appointmentId, payerId, forUsername?, description? }
async function createVisitCheckout(req, res) {
  try {
    const { appointmentId, payerId, forUsername, description } = req.body || {};
    if (!isId(appointmentId) || !isId(payerId)) return fail(res, 400, "Missing appointment or patient.");

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment || appointment.pID || appointment.status !== "Not_Reserved") return fail(res, 409, "That time was just taken. Pick another.");
    if (new Date(appointment.startDate) <= new Date()) return fail(res, 409, "That time has passed. Pick another.");

    const [doctor, payer] = await Promise.all([Doctor.findById(appointment.drID), Patient.findById(payerId).populate("hPackage")]);
    if (!doctor || !payer) return fail(res, 404, "Doctor or patient not found.");

    const recipient = forUsername && forUsername !== payer.username ? await Patient.findOne({ username: forUsername }) : payer;
    if (!canBuyFor(payer, recipient)) return fail(res, 403, "You can only book for yourself or a linked family member.");

    const { amount } = visitPrice(doctor, payer);
    if (amount <= 0) return fail(res, 400, "This visit has no price set.");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      client_reference_id: String(payer._id),
      line_items: [
        {
          price_data: {
            currency: "egp",
            product_data: { name: `Video visit with Dr. ${doctor.name}`, description: visitTime(appointment.startDate) },
            unit_amount: toMinor(amount),
          },
          quantity: 1,
        },
      ],
      metadata: {
        kind: "visit",
        appointmentId: String(appointment._id),
        payerId: String(payer._id),
        recipientId: String(recipient._id),
        description: String(description || "Video visit").slice(0, 400),
      },
      expires_at: Math.floor(Date.now() / 1000) + 31 * 60,
      success_url: `${frontend()}/payment/return?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontend()}/appointmentPatientss/${doctor._id}`,
    });
    return res.json({ url: session.url });
  } catch (e) {
    console.error("createVisitCheckout:", e.message);
    return fail(res, 500, "Card payment couldn't start. Try again.");
  }
}

// POST /checkout/plan  { packageId, recipientId, payerId }
async function createPlanCheckout(req, res) {
  try {
    const { packageId, recipientId, payerId } = req.body || {};
    if (!isId(packageId) || !isId(recipientId) || !isId(payerId)) return fail(res, 400, "Missing plan or patient.");

    const [plan, payer, recipient] = await Promise.all([HPackages.findById(packageId), Patient.findById(payerId), Patient.findById(recipientId)]);
    if (!plan || !payer || !recipient) return fail(res, 404, "Plan or patient not found.");
    if (!canBuyFor(payer, recipient)) return fail(res, 403, "You can only buy a plan for yourself or a linked family member.");
    if (!(Number(plan.rate) > 0)) return fail(res, 400, "This plan has no price set.");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      client_reference_id: String(payer._id),
      line_items: [
        {
          price_data: {
            currency: "egp",
            product_data: { name: `${plan.type} plan`, description: `One year, for ${recipient.name}` },
            unit_amount: toMinor(plan.rate),
          },
          quantity: 1,
        },
      ],
      metadata: { kind: "plan", packageId: String(plan._id), payerId: String(payer._id), recipientId: String(recipient._id) },
      expires_at: Math.floor(Date.now() / 1000) + 31 * 60,
      success_url: `${frontend()}/payment/return?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontend()}/ViewHealthPackage`,
    });
    return res.json({ url: session.url });
  } catch (e) {
    console.error("createPlanCheckout:", e.message);
    return fail(res, 500, "Card payment couldn't start. Try again.");
  }
}

// Acts on a PAID session exactly once. Returns { status, kind }.
async function fulfil(session) {
  if (session.payment_status !== "paid") return { status: "unpaid" };
  const kind = session.metadata && session.metadata.kind;
  if (kind !== "visit" && kind !== "plan") return { status: "ignored" };

  let record;
  try {
    record = await StripePayment.create({ sessionId: session.id, kind, amount: session.amount_total / 100 });
  } catch (e) {
    if (e.code !== 11000) throw e;
    // Someone (the webhook or the browser return) already took this payment. Wait briefly if still running.
    for (let i = 0; i < 10; i += 1) {
      const prev = await StripePayment.findOne({ sessionId: session.id });
      if (prev && prev.status !== "processing") return { status: prev.status === "fulfilled" ? "ok" : prev.status, kind };
      await new Promise((r) => setTimeout(r, 400));
    }
    return { status: "processing", kind };
  }

  const done = async (status, detail) => {
    record.status = status;
    record.detail = detail;
    await record.save();
    return { status: status === "fulfilled" ? "ok" : status, kind };
  };

  try {
    const m = session.metadata;
    if (kind === "plan") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      await Patient.updateOne({ _id: m.recipientId }, { $set: { hPackage: m.packageId, hPStatus: "Subscribed", SubDate: today } });
      const plan = await HPackages.findById(m.packageId);
      await Patient.updateOne(
        { _id: m.recipientId },
        { $push: { notifications: { message: `Your ${plan ? plan.type : ""} plan is active.`, type: "info", entityType: "HealthPackage", entityId: String(m.packageId) } } }
      );
      return done("fulfilled");
    }

    // Visit: claim the slot atomically so two people paying for it can't both get it.
    const appointment = await Appointment.findOneAndUpdate(
      { _id: m.appointmentId, status: "Not_Reserved", $or: [{ pID: { $exists: false } }, { pID: null }] },
      { $set: { pID: m.recipientId, status: "upcoming", Description: m.description || "Video visit" } },
      { new: true }
    );
    if (!appointment) {
      if (session.payment_intent) await stripe.refunds.create({ payment_intent: session.payment_intent });
      return done("refunded", "Slot was taken before payment completed; refunded automatically.");
    }

    const amount = session.amount_total / 100;
    const [doctor, recipient] = await Promise.all([Doctor.findByIdAndUpdate(appointment.drID, { $inc: { wallet: amount } }, { new: true }), Patient.findById(m.recipientId)]);
    if (doctor) {
      await Doctor.updateOne(
        { _id: doctor._id },
        {
          $push: {
            walletTransactions: { amount, balanceAfter: doctor.wallet, direction: "credit", type: "appointment_payment", description: `Appointment payment from ${recipient ? recipient.name : "patient"}` },
            notifications: { message: `${recipient ? recipient.name : "A patient"} booked a visit on ${visitTime(appointment.startDate)}.`, type: "AppointmentScheduled", entityType: "Appointment", entityId: String(appointment._id) },
          },
        }
      );
    }
    await Patient.updateOne(
      { _id: m.recipientId },
      { $push: { notifications: { message: `Your visit with Dr. ${doctor ? doctor.name : ""} on ${visitTime(appointment.startDate)} is booked.`, type: "AppointmentScheduled", entityType: "Appointment", entityId: String(appointment._id) } } }
    );
    return done("fulfilled");
  } catch (e) {
    console.error("fulfil failed for", session.id, e);
    await done("failed", e.message);
    throw e;
  }
}

// GET /checkout/confirm/:sessionId  (the browser came back from Stripe)
async function confirmCheckout(req, res) {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    const result = await fulfil(session);
    if (result.status === "unpaid") return res.status(402).json({ status: "unpaid" });
    return res.json(result);
  } catch (e) {
    console.error("confirmCheckout:", e.message);
    return fail(res, 404, "We couldn't find that payment.");
  }
}

// POST /api/stripe/webhook  (Stripe calls this; body must be the RAW bytes for signature checking)
async function stripeWebhook(req, res) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return res.status(503).send("Webhook secret is not configured.");
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers["stripe-signature"], secret);
  } catch (e) {
    return res.status(400).send(`Signature check failed: ${e.message}`);
  }
  try {
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      await fulfil(event.data.object);
    }
    return res.json({ received: true });
  } catch (e) {
    // 500 makes Stripe retry later; fulfil() is idempotent, so retries are safe.
    return res.status(500).send("Could not process the payment yet.");
  }
}

module.exports = { createVisitCheckout, createPlanCheckout, confirmCheckout, stripeWebhook, visitPrice, fulfil };

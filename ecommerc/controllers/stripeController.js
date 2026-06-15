import Stripe from "stripe";
import { prisma } from "../db/conn.js";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const EXCHANGE_RATES = {
  YER: 1600, // 1 USD = 1600 YER
};

function toStripeAmount(amount, currency) {
  const rate = EXCHANGE_RATES[currency];
  if (rate) {
    return Math.max(Math.round((amount / rate) * 100), 50);
  }
  return Math.max(Math.round(amount * 100), 50);
}

export const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency, orderId, saveCard } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    const intentOptions = {
      amount: toStripeAmount(amount, currency),
      currency: "usd",
      payment_method_types: ["card"],
      metadata: { userId: req.user.id, orderId: orderId || "" },
    };

    if (saveCard) {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });
      if (user?.email) {
        const customers = await stripe.customers.list({
          email: user.email,
          limit: 1,
        });
        const customer = customers.data[0] ||
          await stripe.customers.create({
            email: user.email,
            name: user.name,
            metadata: { userId: req.user.id },
          });
        intentOptions.customer = customer.id;
        intentOptions.setup_future_usage = "off_session";
      }
    }

    const paymentIntent = await stripe.paymentIntents.create(intentOptions);

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const savePaymentMethod = async (req, res) => {
  try {
    const { paymentMethodId } = req.body;
    if (!paymentMethodId) {
      return res.status(400).json({ success: false, message: "Missing paymentMethodId" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user?.email) {
      return res.status(400).json({ success: false, message: "User email not found" });
    }

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customer = customers.data[0];
    if (!customer) {
      customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: req.user.id },
      });
    }

    await stripe.paymentMethods.attach(paymentMethodId, { customer: customer.id });
    await stripe.customers.update(customer.id, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    res.json({ success: true, message: "Card saved for future payments" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).json({ success: false, message: err.message });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object;
      await prisma.order.updateMany({
        where: { paymentId: session.id },
        data: { paymentStatus: "succeeded", paidAt: new Date() },
      });
      await prisma.cartItem.deleteMany({
        where: { cart: { userId: session.metadata?.userId } },
      });
      break;
    }
    case "checkout.session.async_payment_failed": {
      const session = event.data.object;
      await prisma.order.updateMany({
        where: { paymentId: session.id },
        data: { paymentStatus: "failed" },
      });
      break;
    }
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      await prisma.order.updateMany({
        where: { paymentId: paymentIntent.id },
        data: { paymentStatus: "succeeded", paidAt: new Date() },
      });
      break;
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      await prisma.order.updateMany({
        where: { paymentId: paymentIntent.id },
        data: { paymentStatus: "failed" },
      });
      break;
    }
  }

  res.json({ received: true });
};

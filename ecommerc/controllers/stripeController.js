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
    const { amount, currency } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: toStripeAmount(amount, currency),
      currency: "usd",
      metadata: { userId: req.user.id },
    });

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

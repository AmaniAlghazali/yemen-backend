import axios from "axios";
import Stripe from "stripe";
import { prisma } from "../db/conn.js";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const TABBY_API_URL = "https://api.tabby.ai/api/v2";
const TABBY_API_KEY = process.env.TABBY_API_KEY || "";

const TAMARA_API_URL = "https://api.tamara.co";
const TAMARA_API_KEY = process.env.TAMARA_API_KEY || "";

const PAYPAL_API_URL =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || "";
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || "";

const EXCHANGE_RATES = {
  YER: 1600, // 1 USD = 1600 YER
};

function toStripeAmount(price, currency) {
  const rate = EXCHANGE_RATES[currency];
  if (rate) {
    return Math.max(Math.round((price / rate) * 100), 50);
  }
  return Math.max(Math.round(price * 100), 50);
}

const availableMethods = [
  { id: "credit_card", name: "Credit / Debit Card", icon: "💳", enabled: !!stripe },
  { id: "tabby", name: "Tabby", icon: "🐱", enabled: !!TABBY_API_KEY },
  { id: "tamara", name: "Tamara", icon: "🌸", enabled: !!TAMARA_API_KEY },
  { id: "paypal", name: "PayPal", icon: "🅿️", enabled: !!(PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET) },
  { id: "cod", name: "Cash on Delivery", icon: "💵", enabled: true },
];

export const getAvailablePaymentMethods = async (req, res) => {
  res.status(200).json({ success: true, methods: availableMethods });
};

let paypalAccessToken = null;
let paypalTokenExpiry = 0;

async function getPaypalAccessToken() {
  if (paypalAccessToken && Date.now() < paypalTokenExpiry) {
    return paypalAccessToken;
  }
  const auth = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
  ).toString("base64");
  const { data } = await axios.post(
    `${PAYPAL_API_URL}/v1/oauth2/token`,
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  paypalAccessToken = data.access_token;
  paypalTokenExpiry = Date.now() + data.expires_in * 1000;
  return paypalAccessToken;
}

export const createPaymentSession = async (req, res) => {
  try {
    const { paymentMethod, amount, currency, orderId, items, shippingInfo } = req.body;

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Payment method is required",
      });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    switch (paymentMethod) {
      case "credit_card": {
        if (!stripe) {
          return res.status(400).json({
            success: false,
            message: "Card payment is not configured",
          });
        }
        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          payment_method_types: ["card"],
          line_items: (items || []).map((item) => ({
            price_data: {
              currency: "usd",
              product_data: {
                name: item.title || "Order item",
              },
              unit_amount: toStripeAmount(item.price, currency),
            },
            quantity: item.quantity || 1,
          })),
          metadata: { userId: req.user.id, orderId },
          customer_email: req.user.email,
          success_url: `${req.headers.origin || "http://localhost:5173"}/cart?payment_success=true&order=${orderId}`,
          cancel_url: `${req.headers.origin || "http://localhost:5173"}/cart?payment_cancelled=true`,
        });
        await prisma.order.update({
          where: { id: orderId },
          data: { paymentId: session.id },
        });
        return res.status(200).json({
          success: true,
          checkoutUrl: session.url,
          sessionId: session.id,
          paymentMethod: "credit_card",
        });
      }

      case "tabby": {
        if (!TABBY_API_KEY) {
          return res.status(400).json({
            success: false,
            message: "Tabby is not configured",
          });
        }
        const tabbySession = await axios.post(
          `${TABBY_API_URL}/checkout`,
          {
            payment: {
              amount: amount,
              currency: currency || "AED",
              description: `Order ${orderId}`,
              buyer: {
                email: req.user.email,
                phone: shippingInfo?.mobileNo || "",
                name: req.user.name,
              },
              shipping_address: {
                city: shippingInfo?.city || "",
                address: shippingInfo?.address || "",
                zip: shippingInfo?.zipCode || "",
              },
              order: {
                reference_id: orderId,
                items: items?.map((item) => ({
                  title: item.title,
                  quantity: item.quantity,
                  unit_price: item.price,
                })),
              },
            },
          },
          {
            headers: {
              Authorization: `Bearer ${TABBY_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );
        await prisma.order.update({
          where: { id: orderId },
          data: { paymentId: tabbySession.data.id },
        });
        return res.status(200).json({
          success: true,
          sessionId: tabbySession.data.id,
          checkoutUrl: tabbySession.data.configuration.available_products?.installments?.[0]?.web_url,
          paymentMethod: "tabby",
        });
      }

      case "tamara": {
        if (!TAMARA_API_KEY) {
          return res.status(400).json({
            success: false,
            message: "Tamara is not configured",
          });
        }
        const tamaraSession = await axios.post(
          `${TAMARA_API_URL}/checkout`,
          {
            order_reference_id: orderId,
            total_amount: { amount: String(amount), currency: currency || "SAR" },
            description: `Order ${orderId}`,
            items: items?.map((item) => ({
              reference_id: item.productId,
              name: item.title,
              quantity: item.quantity,
              unit_price: { amount: String(item.price), currency: currency || "SAR" },
            })),
            consumer: {
              email: req.user.email,
              phone: shippingInfo?.mobileNo || "",
              first_name: req.user.name?.split(" ")[0] || "",
              last_name: req.user.name?.split(" ").slice(1).join(" ") || "",
            },
            shipping_address: {
              city: shippingInfo?.city || "",
              line1: shippingInfo?.address || "",
              country_code: shippingInfo?.country || "SA",
            },
          },
          {
            headers: {
              Authorization: `Bearer ${TAMARA_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );
        await prisma.order.update({
          where: { id: orderId },
          data: { paymentId: tamaraSession.data.checkout_id },
        });
        return res.status(200).json({
          success: true,
          sessionId: tamaraSession.data.checkout_id,
          checkoutUrl: tamaraSession.data.checkout_url,
          paymentMethod: "tamara",
        });
      }

      case "paypal": {
        if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
          return res.status(400).json({
            success: false,
            message: "PayPal is not configured",
          });
        }
        const accessToken = await getPaypalAccessToken();
        const paypalOrder = await axios.post(
          `${PAYPAL_API_URL}/v2/checkout/orders`,
          {
            intent: "CAPTURE",
            purchase_units: [
              {
                reference_id: orderId,
                amount: {
                  currency_code: currency || "USD",
                  value: amount.toFixed(2),
                },
                items: items?.map((item) => ({
                  name: item.title,
                  quantity: String(item.quantity),
                  unit_amount: {
                    currency_code: currency || "USD",
                    value: item.price.toFixed(2),
                  },
                })),
              },
            ],
            payer: {
              email_address: req.user.email,
              name: {
                given_name: req.user.name?.split(" ")[0] || "",
                surname: req.user.name?.split(" ").slice(1).join(" ") || "",
              },
            },
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        const approvalLink = paypalOrder.data.links?.find(
          (l) => l.rel === "payer-action"
        )?.href;
        await prisma.order.update({
          where: { id: orderId },
          data: { paymentId: paypalOrder.data.id },
        });
        return res.status(200).json({
          success: true,
          sessionId: paypalOrder.data.id,
          checkoutUrl: approvalLink,
          paymentMethod: "paypal",
        });
      }

      case "cod": {
        return res.status(200).json({
          success: true,
          paymentMethod: "cod",
          message: "Cash on delivery selected, order will be processed",
        });
      }

      default:
        return res.status(400).json({
          success: false,
          message: `Unsupported payment method: ${paymentMethod}`,
        });
    }
  } catch (error) {
    console.error("Payment session error:", error);
    return res.status(500).json({
      success: false,
      message: error.response?.data?.message || error.message,
    });
  }
};

export const confirmPayment = async (req, res) => {
  try {
    const { paymentMethod, orderId, paymentId, paypalOrderId } = req.body;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    switch (paymentMethod) {
      case "credit_card": {
        if (!stripe) {
          return res.status(400).json({ success: false, message: "Card payment not configured" });
        }
        const intent = await stripe.paymentIntents.retrieve(paymentId);
        const status = intent.status === "succeeded" ? "succeeded" : "failed";
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: status,
            paymentId: paymentId,
            paidAt: status === "succeeded" ? new Date() : undefined,
          },
        });
        return res.status(200).json({ success: true, paymentStatus: status });
      }

      case "paypal": {
        const accessToken = await getPaypalAccessToken();
        const capture = await axios.post(
          `${PAYPAL_API_URL}/v2/checkout/orders/${paypalOrderId}/capture`,
          {},
          { headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" } }
        );
        const status = capture.data.status === "COMPLETED" ? "succeeded" : "failed";
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: status,
            paidAt: status === "succeeded" ? new Date() : undefined,
          },
        });
        return res.status(200).json({ success: true, paymentStatus: status });
      }

      case "tabby":
      case "tamara":
        await prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: "processing" },
        });
        return res.status(200).json({ success: true, paymentStatus: "processing" });

      case "cod":
        await prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: "pending" },
        });
        return res.status(200).json({ success: true, paymentStatus: "pending" });

      default:
        return res.status(400).json({ success: false, message: "Unsupported payment method" });
    }
  } catch (error) {
    console.error("Payment confirmation error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const tabbyWebhook = async (req, res) => {
  try {
    const event = req.body;
    if (event.status === "authorized" || event.status === "completed") {
      await prisma.order.updateMany({
        where: { paymentId: event.id },
        data: { paymentStatus: "succeeded", paidAt: new Date() },
      });
    } else if (event.status === "rejected" || event.status === "expired") {
      await prisma.order.updateMany({
        where: { paymentId: event.id },
        data: { paymentStatus: "failed" },
      });
    }
    res.json({ received: true });
  } catch (error) {
    console.error("Tabby webhook error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const tamaraWebhook = async (req, res) => {
  try {
    const event = req.body;
    if (event.event_type === "order_approved" || event.event_type === "order_captured") {
      await prisma.order.updateMany({
        where: { paymentId: event.order_id },
        data: { paymentStatus: "succeeded", paidAt: new Date() },
      });
    } else if (event.event_type === "order_declined" || event.event_type === "order_cancelled") {
      await prisma.order.updateMany({
        where: { paymentId: event.order_id },
        data: { paymentStatus: "failed" },
      });
    }
    res.json({ received: true });
  } catch (error) {
    console.error("Tamara webhook error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const paypalWebhook = async (req, res) => {
  try {
    const event = req.body;
    if (event.event_type === "CHECKOUT.ORDER.APPROVED") {
      const orderId = event.resource?.purchase_units?.[0]?.reference_id;
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: "processing" },
        });
      }
    } else if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
      const orderId = event.resource?.purchase_units?.[0]?.reference_id;
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: "succeeded", paidAt: new Date() },
        });
      }
    }
    res.json({ received: true });
  } catch (error) {
    console.error("PayPal webhook error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

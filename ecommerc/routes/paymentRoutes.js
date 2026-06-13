import express from "express";
import { isAuthenticatedUser } from "../util/userAuth.js";
import {
  createPaymentSession,
  confirmPayment,
  getAvailablePaymentMethods,
  tabbyWebhook,
  tamaraWebhook,
  paypalWebhook,
} from "../controllers/paymentController.js";

const paymentRouter = express.Router();

paymentRouter.get("/methods", isAuthenticatedUser, getAvailablePaymentMethods);
paymentRouter.post("/create-session", isAuthenticatedUser, createPaymentSession);
paymentRouter.post("/confirm", isAuthenticatedUser, confirmPayment);

paymentRouter.post("/tabby/webhook", express.raw({ type: "application/json" }), tabbyWebhook);
paymentRouter.post("/tamara/webhook", express.raw({ type: "application/json" }), tamaraWebhook);
paymentRouter.post("/paypal/webhook", express.raw({ type: "application/json" }), paypalWebhook);

export default paymentRouter;

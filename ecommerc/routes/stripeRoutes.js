import express from "express";
import { isAuthenticatedUser } from "../util/userAuth.js";
import { createPaymentIntent, savePaymentMethod } from "../controllers/stripeController.js";

const stripeRouter = express.Router();

stripeRouter.post(
  "/create-payment-intent",
  isAuthenticatedUser,
  createPaymentIntent,
);

stripeRouter.post(
  "/save-payment-method",
  isAuthenticatedUser,
  savePaymentMethod,
);

export default stripeRouter;

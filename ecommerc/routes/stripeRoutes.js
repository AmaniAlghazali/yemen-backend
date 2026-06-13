import express from "express";
import { isAuthenticatedUser } from "../util/userAuth.js";
import { createPaymentIntent } from "../controllers/stripeController.js";

const stripeRouter = express.Router();

stripeRouter.post(
  "/create-payment-intent",
  isAuthenticatedUser,
  createPaymentIntent,
);

export default stripeRouter;

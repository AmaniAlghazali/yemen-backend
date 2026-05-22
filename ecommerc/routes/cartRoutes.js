import express from "express";
import { isAuthenticatedUser } from "../util/userAuth.js";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cartControllers.js";

const cartRouter = express.Router();

cartRouter.get("/", isAuthenticatedUser, getCart);
cartRouter.post("/add", isAuthenticatedUser, addToCart);
cartRouter.put("/update/:productId", isAuthenticatedUser, updateCartItem);
cartRouter.delete("/remove/:productId", isAuthenticatedUser, removeFromCart);
cartRouter.delete("/clear", isAuthenticatedUser, clearCart);

export default cartRouter;

import express from "express";
import upload from "../util/multer.js";
import { isAdmin, isAuthenticatedUser } from "../util/userAuth.js";
import {
  createOrderController,
  deleteOrder,
  getAllOrders,
  getSingleOrder,
  myOrderDetails,
  updateOrderStatus,
  updateOrderelement
} from "../controllers/OrderControllers.js";
const orderRouter = express.Router();

orderRouter.post("/create-order", isAuthenticatedUser, createOrderController);
orderRouter.get(
  "/order-details/:id",
  isAuthenticatedUser,
  isAdmin("admin"),
  getSingleOrder,
);
orderRouter.get("/my-order", isAuthenticatedUser, myOrderDetails);
orderRouter.get(
  "/all-orders",
  isAuthenticatedUser,
  isAdmin("admin"),
  getAllOrders,
);
orderRouter.put(
  "/update-order-status/:id",
  isAuthenticatedUser,
  isAdmin("admin"),
  updateOrderStatus,
);
orderRouter.put(
  "/update-order-element/:id",
  isAuthenticatedUser,
  upload.single("image"),
  isAdmin("admin"),
  updateOrderelement,
);
orderRouter.delete(
  "/delete-order/:id",
  isAuthenticatedUser,
  isAdmin("admin"),
  deleteOrder
);
export default orderRouter;

import express from "express";
import {
  createProducts,
  deleteProductController,
  getAllProducts,
  getProductDetail,
  updateProductController,
} from "../controllers/productController.js";
import { isAdmin, isAuthenticatedUser } from "../util/userAuth.js";

const productsRouter = express.Router();

productsRouter.post(
  "/create-product",
  isAuthenticatedUser,
  isAdmin("admin"),
  createProducts
);

productsRouter.get("/get-all-products", getAllProducts);
productsRouter.get("/product-detail/:id", getProductDetail);

productsRouter.put(
  "/update-product/:id", 
  isAuthenticatedUser,
  isAdmin("admin"),
  updateProductController
);

productsRouter.delete(
  "/delete-product/:id",
  isAuthenticatedUser,
  isAdmin("admin"),
  deleteProductController,
);

export default productsRouter;

// post ( to set the data in database and save that data in database )
// get ( to retrieve the data from database )
// put / patch ( put is use to update the data from database, patch will also update the product but it will update whole product)
// delete ( to delete something from database)

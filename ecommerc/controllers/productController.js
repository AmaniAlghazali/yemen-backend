import Product from "../models/productModel.js";
import ApiFeatures from "../util/ApiFeatures.js";
import { uploadToCloudinary } from "../util/cloudinary.js";
import fs from "fs";
// CREATE PRODUCT
export const createProducts = async (req, res) => {
  try {
    const { title, description, price, stock, category } = req.body;

    let imageData = null; // Store both url and public_id here
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path, "products");
      
      // Capture both pieces of data returned by Cloudinary
      imageData = {
        public_id: result.public_id,
        url: result.secure_url
      };

      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }

    // Save matching your exact schema requirements
    const product = await Product.create({
      title,
      description,
      price,
      stock,
      category,
      images: imageData ? [imageData] : [] // Passes both public_id and url
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server Error during creation",
      error: error.message,
    });
  }
};
// ****************************************
export const getAllProducts = async (req, res) => {
  try {
    const apiFunctionality = new ApiFeatures(Product.find(), req.query)
      .search()
      .filter()
      .pagination();

    let products = await apiFunctionality.query;

    // Check length because find() always returns an array
    if (!products) {
      return res.status(404).json({
        success: false,
        message: "No products found matching that criteria",
      });
    }

    return res.status(200).json({
      success: true,
      count: products.length, // Helpful to see how many were found
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message, // error.message is cleaner than the whole object
    });
  }
};
// **********************************
export const getProductDetail = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error,
    });
  }
};

// to edit the product detail

export const updateProductController = async (req, res) => {
  try {
    const { title, description, price, stock, category } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (req.file) {
      const result = await uploadToCloudinary(req.file.path, "products");
      
      // Update with both public_id and url to satisfy validation
      product.images = [{
        public_id: result.public_id,
        url: result.secure_url
      }];

      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }

    product.title = title;
    product.description = description;
    product.price = price;
    product.stock = stock;
    product.category = category;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const deleteProductController = async (req, res) => {
  try {
    const { id } = req.params; // Get ID from URL

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        // Use 404 for "Not Found"
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      deletedId: id, // Sending this back is helpful for the frontend
    });
  } catch (error) {
    console.error("Delete Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error while deleting product",
      error: error.message,
    });
  }
};

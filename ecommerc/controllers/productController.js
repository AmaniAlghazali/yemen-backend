import Product from "../models/productModel.js";
import ApiFeatures from "../util/ApiFeatures.js";
import { uploadToCloudinaryFromBuffer } from "../util/cloudinary.js";

export const createProducts = async (req, res) => {
  try {
    const { title, description, price, stock, category } = req.body;

    let imageData = null;
    if (req.file) {
      const result = await uploadToCloudinaryFromBuffer(req.file.buffer, "products");

      imageData = {
        public_id: result.public_id,
        url: result.secure_url
      };
    }

    const product = await Product.create({
      title,
      description,
      price,
      stock,
      category,
      images: imageData ? [imageData] : []
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server Error during creation",
      error: error.message,
    });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const apiFunctionality = new ApiFeatures(Product.find(), req.query)
      .search()
      .filter()
      .pagination();

    let products = await apiFunctionality.query;

    if (!products) {
      return res.status(404).json({
        success: false,
        message: "No products found matching that criteria",
      });
    }

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

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

export const updateProductController = async (req, res) => {
  try {
    const { title, description, price, stock, category } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (req.file) {
      const result = await uploadToCloudinaryFromBuffer(req.file.buffer, "products");

      product.images = [{
        public_id: result.public_id,
        url: result.secure_url
      }];
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
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const deleteProductController = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      deletedId: id,
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

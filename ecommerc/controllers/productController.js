import { prisma } from "../db/conn.js";
import ApiFeatures from "../util/ApiFeatures.js";
import { uploadToCloudinaryFromBuffer } from "../util/cloudinary.js";

const base64ToBuffer = (dataUrl) => {
  const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches) return null;
  return Buffer.from(matches[2], "base64");
};

export const createProducts = async (req, res) => {
  try {
    const { title, description, price, stock, category, image } = req.body;

    const data = {
      title,
      description,
      price: Number(price),
      stock: Number(stock) || 1,
      category,
    };

    if (image) {
      const buffer = base64ToBuffer(image);
      if (buffer) {
        const result = await uploadToCloudinaryFromBuffer(buffer, "products");
        data.images = { create: [{ publicId: result.public_id, url: result.secure_url }] };
      }
    }

    const product = await prisma.product.create({
      data,
      include: { images: true },
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
    const queryArgs = { where: {}, include: { images: true } };
    const apiFunctionality = new ApiFeatures(queryArgs, req.query)
      .search()
      .filter()
      .pagination();

    const products = await prisma.product.findMany(queryArgs);

    if (!products || products.length === 0) {
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
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { images: true, reviews: true },
    });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "product not found",
      });
    }
    return res.status(200).json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ success: false, error });
  }
};

export const updateProductController = async (req, res) => {
  try {
    const { title, description, price, stock, category, image } = req.body;
    const existing = await prisma.product.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const updateData = {
      title,
      description,
      price: Number(price),
      stock: Number(stock),
      category,
    };

    if (image) {
      const buffer = base64ToBuffer(image);
      if (buffer) {
        const result = await uploadToCloudinaryFromBuffer(buffer, "products");
        await prisma.productImage.deleteMany({ where: { productId: existing.id } });
        await prisma.productImage.create({
          data: { publicId: result.public_id, url: result.secure_url, productId: existing.id },
        });
      }
    }

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: updateData,
      include: { images: true },
    });

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
    await prisma.product.delete({ where: { id } });
    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      deletedId: id,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Error while deleting product",
      error: error.message,
    });
  }
};

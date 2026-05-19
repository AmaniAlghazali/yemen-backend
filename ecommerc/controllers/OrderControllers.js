import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import { uploadToCloudinary } from "../util/cloudinary.js";
export const createOrderController = async (req, res, next) => {
  try {
    // 1. Extract flat fields sent via FormData
    const {
      address,
      mobileNo,
      city,
      country,
      zipCode,
      productName,
      productPrice,
      quantity,
      productId,
      paymentId,
      paymentStatus,
      taxPrice,
      shippingCost,
      totalPrice,
      orderStatus,
      fallbackImageUrl // In case no custom file is uploaded
    } = req.body;

    // 2. Handle Image: Use uploaded file, or fall back to product image url
    let finalImageUrl = fallbackImageUrl || "https://placehold.co/400";
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path, "orders");
      finalImageUrl = result.secure_url;
    }

    // 3. Build the structured object your Mongoose Schema expects
    const orderData = {
      shippingInfo: {
        address,
        mobileNo: Number(mobileNo),
        city,
        country,
        zipCode: Number(zipCode),
      },
      orderItems: [
        {
          name: productName,
          price: Number(productPrice),
          quantity: Number(quantity),
          image: finalImageUrl,
          product: productId,
        },
      ],
      paymentInfo: {
        id: paymentId || `pay_mock_${Date.now()}`, // fallback if empty
        status: paymentStatus || "succeeded",
      },
      taxPrice: Number(taxPrice) || 0,
      shippingCost: Number(shippingCost) || 0,
      totalPrice: Number(totalPrice) || 0,
      orderStatus: orderStatus || "Processing",
      paidAt: new Date(),
      user: req.user._id, // Associated authenticated user
    };

    // 4. Save to Database
    const order = await Order.create(orderData);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};
export const getSingleOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email",
    );
    if (!order) {
      return res.status(400).json({
        success: false,
        message: "Order not found",
      });
    }
    return res.status(200).json({
      success: true,
      order,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const myOrderDetails = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    if (!orders) {
      return res.status(400).json({
        success: false,
        message: "No orders found for this user",
      });
    }
    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const getAllOrders = async (req, res) => {
  try {
    // ✅ CHANGE THIS LINE: Add .populate("user", "name email")
    const orders = await Order.find().populate("user", "name email");

    if (!orders || orders.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No orders found",
      });
    }

    let totalAmount = 0;
    orders.forEach((order) => {
      totalAmount = totalAmount + (order.totalPrice || 0);
    });

    return res.status(200).json({
      success: true,
      totalAmount,
      orders,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    if (req.body.status === "Delivered" && order.orderStatus !== "Delivered") {
      for (const item of order.orderItems) {
        await updatestock(item.product, item.quantity);
      }
      order.deliveredAt = Date.now();
    }

    // ✅ This allows you to change it to "Pending" or anything else
    order.orderStatus = req.body.status;

    await order.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

async function updatestock(id, quantity) {
  const product = await Product.findById(id);

  if (!product) throw new Error("Product not found");

  // Ensure we use the correct property name from your Schema (likely 'stock')
  if (product.stock < quantity) throw new Error("Insufficient stock");

  product.stock -= quantity;
  await product.save({ validateBeforeSave: false });
}

export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.orderStatus !== "Delivered") {
      return res.status(400).json({
        success: false,
        message: "You cannot delete an order until it is Delivered",
      });
    }

    await Order.deleteOne({ _id: req.params.id });
    return res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message, // ✅ Fixed 'err' to 'error'
    });
  }
};
export const updateOrderelement = async (req, res, next) => {
  try {
    const orderId = req.params.id;

    const { 
      address, 
      mobileNo, 
      city, 
      country, 
      zipCode, 
      taxPrice, 
      shippingCost, 
      totalPrice,
      existingImageUrl 
    } = req.body;

    // 2. Update this block to use your custom uploadToCloudinary wrapper function
    let finalImageUrl = existingImageUrl; 
    if (req.file) {
      // Pass the temporary file path and the destination folder name ("orders")
      const result = await uploadToCloudinary(req.file.path, "orders");
      finalImageUrl = result.secure_url; // Secure URL returned by Cloudinary
    }

    // 3. Reconstruct and update the database document
    const updatedData = {
      shippingInfo: {
        address,
        mobileNo: Number(mobileNo),
        city,
        country,
        zipCode: Number(zipCode),
      },
      taxPrice: Number(taxPrice),
      shippingCost: Number(shippingCost),
      totalPrice: Number(totalPrice),
    };

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.orderItems && order.orderItems.length > 0) {
      order.orderItems[0].image = finalImageUrl;
    }

    order.shippingInfo = updatedData.shippingInfo;
    order.taxPrice = updatedData.taxPrice;
    order.shippingCost = updatedData.shippingCost;
    order.totalPrice = updatedData.totalPrice;

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      order,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};
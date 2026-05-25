import { prisma } from "../db/conn.js";
import { uploadToCloudinaryFromBuffer } from "../util/cloudinary.js";

export const createOrderController = async (req, res, next) => {
  try {
    const {
      shippingInfo,
      items,
      paymentId,
      paymentStatus,
      taxPrice,
      shippingCost,
      totalPrice,
      orderStatus,
    } = req.body;

    if (!shippingInfo || !items || !items.length) {
      return res.status(400).json({
        success: false,
        message: "Missing shipping info or order items",
      });
    }

    const order = await prisma.order.create({
      data: {
        shippingAddress: shippingInfo.address,
        shippingMobileNo: Number(shippingInfo.mobileNo),
        shippingCity: shippingInfo.city,
        shippingCountry: shippingInfo.country,
        shippingZipCode: Number(shippingInfo.zipCode),
        paymentId: paymentId || `pay_mock_${Date.now()}`,
        paymentStatus: paymentStatus || "succeeded",
        taxPrice: Number(taxPrice) || 0,
        shippingCost: Number(shippingCost) || 0,
        totalPrice: Number(totalPrice) || 0,
        orderStatus: orderStatus || "Processing",
        paidAt: new Date(),
        userId: req.user.id,
        items: {
          create: items.map((item) => ({
            name: item.title || item.name,
            price: Number(item.price),
            quantity: Number(item.quantity),
            image: item.image || "https://placehold.co/400",
            productId: item.productId || item.product,
          })),
        },
      },
      include: { items: true },
    });

    await prisma.cartItem.deleteMany({
      where: { cart: { userId: req.user.id } },
    });

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
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: true,
      },
    });
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
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: true },
    });
    if (!orders || orders.length === 0) {
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
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: true,
      },
    });

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
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true },
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (req.body.status === "Delivered" && order.orderStatus !== "Delivered") {
      for (const item of order.items) {
        await updateStock(item.productId, item.quantity);
      }
    }

    await prisma.order.update({
      where: { id: req.params.id },
      data: { orderStatus: req.body.status },
    });

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

async function updateStock(productId, quantity) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("Product not found");
  if (product.stock < quantity) throw new Error("Insufficient stock");

  await prisma.product.update({
    where: { id: productId },
    data: { stock: product.stock - quantity },
  });
}

export const deleteOrder = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
    });
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

    await prisma.order.delete({ where: { id: req.params.id } });
    return res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
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
      existingImageUrl,
    } = req.body;

    let finalImageUrl = existingImageUrl;
    if (req.file) {
      const result = await uploadToCloudinaryFromBuffer(req.file.buffer, "orders");
      finalImageUrl = result.secure_url;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        shippingAddress: address,
        shippingMobileNo: Number(mobileNo),
        shippingCity: city,
        shippingCountry: country,
        shippingZipCode: Number(zipCode),
        taxPrice: Number(taxPrice),
        shippingCost: Number(shippingCost),
        totalPrice: Number(totalPrice),
      },
    });

    if (finalImageUrl && order.items.length > 0) {
      await prisma.orderItem.update({
        where: { id: order.items[0].id },
        data: { image: finalImageUrl },
      });
    }

    const updatedOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};

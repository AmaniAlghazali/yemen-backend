import { prisma } from "../db/conn.js";
import { sendToken } from "../util/jwtToken.js";
import { sendEmail } from "../util/sendMail.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import cloudinary from "../util/cloudinary.js";

export const isAuthenticatedUser = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please login to access this resource",
      });
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await prisma.user.findUnique({ where: { id: decodedData.id } });

    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: "User no longer exists",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Authentication failed: Invalid or expired token",
    });
  }
};

export const isAdmin = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user.role}) is not allowed to access this resource`,
      });
    }
    next();
  };
};

export const resgisterUserController = async (req, res) => {
  try {
    const { name, email, password, avatar } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "This email is already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const profilePublicId = avatar ? "local" : "id";
    const profileUrl = avatar || "url";

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        profilePublicId,
        profileUrl,
      },
    });

    const { password: _, ...userData } = user;
    sendToken(userData, 201, res);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const loginUserController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter email & password" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const { password: _, ...userData } = user;
    sendToken(userData, 200, res);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const userProfileController = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });
    const { password: _, ...userData } = user;
    res.status(200).json({ success: true, user: userData });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error loading profile" });
  }
};

export const getUserPhotoByEmail = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.params.email } });
    if (!user) {
      return res.status(200).json({ success: false, message: "User not found", url: null });
    }
    const url = user.profileUrl;
    if (!url || url === "url") {
      return res.status(200).json({ success: false, message: "No profile photo", url: null });
    }
    res.status(200).json({ success: true, url });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserProfileController = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!req.body.oldPassword) {
      return res.status(400).json({ success: false, message: "Current password is required to update profile" });
    }

    const isMatched = await bcrypt.compare(req.body.oldPassword, user.password);
    if (!isMatched) {
      return res.status(401).json({ success: false, message: "Incorrect current password" });
    }

    const updateData = {};
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.email) updateData.email = req.body.email;
    if (req.body.avatar) {
      updateData.profilePublicId = "local";
      updateData.profileUrl = req.body.avatar;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
    });

    const { password: _, ...userData } = updatedUser;

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: userData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePasswordController = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ success: false, message: "All password fields are required" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    const isMatched = await bcrypt.compare(oldPassword, user.password);
    if (!isMatched) {
      return res.status(401).json({ success: false, message: "Incorrect current password" });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as your current password. Please choose a different one.",
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUserProfileController = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.cartItem.deleteMany({ where: { cart: { userId } } });
    await prisma.cart.deleteMany({ where: { userId } });
    await prisma.orderItem.deleteMany({ where: { order: { userId } } });
    await prisma.order.deleteMany({ where: { userId } });
    await prisma.review.deleteMany({ where: { userId } });
    await prisma.productImage.deleteMany({ where: { product: { userId } } });
    await prisma.product.deleteMany({ where: { userId } });

    await prisma.user.delete({ where: { id: userId } });

    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });
    return res.status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPasswordRequestController = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.body.email } });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    const resetPasswordExpire = new Date(Date.now() + 30 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken, resetPasswordExpire },
    });

    const frontendUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get("host")}`;
    const resetPasswordUrl = `${frontendUrl}/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\n If you did not request this email, please ignore it.`;

    try {
      await sendEmail({
        email: user.email,
        subject: `Password Recovery`,
        message,
      });

      res
        .status(200)
        .json({ success: true, message: `Email sent to: ${user.email}` });

    } catch (error) {
      await prisma.user.update({
        where: { id: user.id },
        data: { resetPasswordToken: null, resetPasswordExpire: null },
      });

      return res.status(500).json({ success: false, message: error.message });
    }

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPasswordController = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken,
        resetPasswordExpire: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset token is invalid or has expired",
      });
    }

    if (req.body.password !== req.body.confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpire: null,
      },
    });

    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
    const { password: _, ...userData } = updatedUser;
    sendToken(userData, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const contactController = async (req, res) => {
  try {
    const { name, email, subject, message, lat, lng } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "Name, email, and message are required" });
    }

    const locationData = (lat && lng) ? { lat: Number(lat), lng: Number(lng) } : {};
    await prisma.contactMessage.create({
      data: { name, email, subject: subject || "Order Inquiry", message, ...locationData },
    });

    try {
      await sendEmail({
        email: process.env.SMTP_MAIL,
        subject: `Contact Form: ${subject} - from ${name}`,
        message: `From: ${name} (${email})\n\nSubject: ${subject}\n\nMessage:\n${message}`,
      });
    } catch (emailErr) {
      console.log("Email send failed (DB saved ok):", emailErr.message);
    }

    res.status(200).json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getContactMessages = async (req, res) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    if (!users || users.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Users not found",
      });
    }

    const usersWithoutPassword = users.map(({ password, ...u }) => u);

    return res.status(200).json({
      success: true,
      users: usersWithoutPassword,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error,
    });
  }
};

export const combineData = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalOrders = await prisma.order.count();
    const allProducts = await prisma.product.findMany({ select: { stock: true } });
    const allOrders = await prisma.order.findMany({ select: { totalPrice: true } });

    let totalProducts = allProducts.length;
    let outOfStock = 0;
    let lowStock = 0;
    let inStock = 0;

    allProducts.forEach((product) => {
      if (product.stock === 0) {
        outOfStock++;
      } else if (product.stock <= 5) {
        lowStock++;
        inStock++;
      } else {
        inStock++;
      }
    });

    const totalRevenue = allOrders.reduce((accumulator, order) => {
      return accumulator + (order.totalPrice || 0);
    }, 0);

    return res.status(200).json({
      success: true,
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      outOfStock,
      lowStock,
      inStock,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Server encountered an error aggregating dashboard cards.",
      error: error.message,
    });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const userId = req.params.id;

    const data = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (role !== undefined) data.role = role;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
    });

    const { password: _, ...userData } = updatedUser;

    res.status(200).json({
      success: true,
      message: "User parameters updated successfully!",
      user: userData,
    });
  } catch (error) {
    console.error("Error in updateUserProfile backend:", error);

    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "This email address is already registered to another account.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error while modifying user parameters.",
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user && req.user.id === userId) {
      return res.status(400).json({
        success: false,
        message: "Security restriction: You cannot delete your own active administrator account.",
      });
    }

    await prisma.cartItem.deleteMany({ where: { cart: { userId } } });
    await prisma.cart.deleteMany({ where: { userId } });
    await prisma.orderItem.deleteMany({ where: { order: { userId } } });
    await prisma.order.deleteMany({ where: { userId } });
    await prisma.review.deleteMany({ where: { userId } });
    await prisma.productImage.deleteMany({ where: { product: { userId } } });
    await prisma.product.deleteMany({ where: { userId } });

    await prisma.user.delete({ where: { id: userId } });

    res.status(200).json({
      success: true,
      message: "User account evicted and deleted from database successfully.",
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }
    console.error("Error in deleteUser backend:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while executing account deletion.",
    });
  }
};

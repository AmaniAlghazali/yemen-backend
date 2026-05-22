import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import ContactMessage from "../models/contactModel.js";
import { sendToken } from "../util/jwtToken.js";
import { sendEmail } from "../util/sendMail.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import cloudinary from "../util/cloudinary.js";


// ==========================================
// MIDDLEWARES
// ==========================================

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
   
    req.user = await User.findById(decodedData.id);

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

// ==========================================
// USER CONTROLLERS
// ==========================================

// Register User
export const resgisterUserController = async (req, res) => {
  try {
    const { name, email, password, avatar } = req.body;
    const profile = avatar
      ? { public_id: "local", url: avatar }
      : { public_id: "id", url: "url" };
    const user = await User.create({
      name,
      email,
      password,
      profile,
    });

    sendToken(user, 201, res);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Login User
export const loginUserController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter email & password" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    sendToken(user, 200, res);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get User Profile (Self)
export const userProfileController = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error loading profile" });
  }
};
// Get User Photo by Email (Public - for Login page preview)
export const getUserPhotoByEmail = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(200).json({ success: false, message: "User not found", url: null });
    }
    const url = user.profile?.url;
    if (!url || url === "url") {
      return res.status(200).json({ success: false, message: "No profile photo", url: null });
    }
    res.status(200).json({ success: true, url });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Update User Profile
export const updateUserProfileController = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatched = await user.comparePassword(req.body.oldPassword);
    if (!isMatched) {
      return res.status(401).json({ success: false, message: "Incorrect current password" });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    // Store avatar URL directly (no Cloudinary upload)
    if (req.body.avatar) {
      user.profile = {
        public_id: "local",
        url: req.body.avatar, // base64 data URL
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Update Password
export const updatePasswordController = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    // 1. Verify current password is correct
    const isMatched = await user.comparePassword(oldPassword);
    if (!isMatched) {
      return res.status(401).json({ success: false, message: "Incorrect current password" });
    }

    // 2. THE NEW CHECK: Prevent using the same password again
    if (oldPassword === newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "New password cannot be the same as your current password. Please choose a different one." 
      });
    }

    // 3. Confirm match
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete User Account
export const deleteUserProfileController = async (req, res) => {

    try {
    // user = await User.findByIdAndDelete(req.params.id);

    let user = await User.findByIdAndDelete(req.user._id);

    // Clear cookie if you use them
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

// Logout
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

// Reset Password Request (Forgot Password)

export const resetPasswordRequestController = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const resetToken = user.resetPassword();
    await user.save({ validateBeforeSave: false });

    // ===========================================
    // THIS IS THE FIX - USE FRONTEND URL!
    // ===========================================
    const resetPasswordUrl = `http://localhost:5173/password/reset/${resetToken}`;
    // ===========================================

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
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ success: false, message: error.message });
    }

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Reset Password
export const resetPasswordController = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
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

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    sendToken(user, 200, res);
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

    const location = (lat && lng) ? { lat: Number(lat), lng: Number(lng) } : undefined;
    await ContactMessage.create({ name, email, subject, message, location });

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
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req,res) => {
    try {
        const users = await User.find();
        if(!users){
            return res.status(400).json({
                success : false,
                message : "Users not found"
            })
        }

        return res.status(200).json({
            success : true,
            users
        })
    } catch (error) {
        return res.status(500).json({
            success : false,
            error
        })
    }
}
export const combineData = async (req, res) => {
  try {
    // 1. Fetch total counts from database
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const allProducts = await Product.find({}); // Get all products to calculate stock variables
    const allOrders = await Order.find({});   // Get all orders to calculate total revenue

    // 2. Loop through products to count stock status
    let totalProducts = allProducts.length;
    let outOfStock = 0;
    let lowStock = 0;
    let inStock = 0;

    allProducts.forEach((product) => {
      if (product.stock === 0) {
        outOfStock++;
      } else if (product.stock <= 5) { // Items with 5 or fewer items are considered "low stock"
        lowStock++;
        inStock++;
      } else {
        inStock++;
      }
    });

    // 3. Calculate your grand total revenue safely
    const totalRevenue = allOrders.reduce((accumulator, order) => {
      return accumulator + (order.totalPrice || 0);
    }, 0);

    // 4. Return everything inside a single unified payload matching your frontend keys
    return res.status(200).json({
      success: true,
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      outOfStock,
      lowStock,
      inStock
    });

  } catch (error) {
    console.error("Dashboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Server encountered an error aggregating dashboard cards.",
      error: error.message
    });
  }
};
export const updateUserProfile = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const userId = req.params.id;

    // Find user and update with new data fields
    // { new: true, runValidators: true } ensures it returns the updated document and checks validation rules
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, role },
      { new: true, runValidators: true }
    );

    // Safety check if user doesn't exist in DB
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "User parameters updated successfully!",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error in updateUserProfile backend:", error);
    
    // Catch duplicate email errors from MongoDB unique index configuration
    if (error.code === 11000) {
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

// ==========================================
// 2. DELETE USER ACCOUNT (ADMIN)
// ==========================================
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevention guard: Stop an admin from accidentally deleting their own account
    if (req.user && req.user._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: "Security restriction: You cannot delete your own active administrator account.",
      });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "User account evicted and deleted from database successfully.",
    });
  } catch (error) {
    console.error("Error in deleteUser backend:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while executing account deletion.",
    });
  }
};

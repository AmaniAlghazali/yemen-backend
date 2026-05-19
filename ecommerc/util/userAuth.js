import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const isAuthenticatedUser = async (req, res, next) => {
  try {
  const token =
  req.cookies?.token ||
  req.headers.authorization?.split(" ")[1];
  console.log("HEADERS:", req.headers);
  console.log("COOKIES:", req.cookies);
    if (!token) return res.status(401).json({ message: "No token found" });

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token Data:", decodedData); // Should show your user ID

    req.user = await User.findById(decodedData.id);
    console.log("User found in DB:", req.user ? "Yes" : "No");

    next();
  } catch (error) {
    console.log("Middleware Error:", error.message);
    return res.status(401).json({ success: false, message: "Auth Failed" });
  }
};

export const isAdmin = (...roles) => {
  return (req, res, next) => {
    console.log("User Role from DB:", req.user.role); // Debugging line
    // console.log("Allowed Roles:", roles);
    if (!roles.includes(req.user.role)) {
      return res.status(400).json({
        success: false,
        message: "You are not an admin, not allowed to access this",
      });
    }
    console.log(roles);
    next();
  };
};

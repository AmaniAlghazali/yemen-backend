import jwt from "jsonwebtoken";
import { prisma } from "../db/conn.js";

export const isAuthenticatedUser = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token found" });

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await prisma.user.findUnique({ where: { id: decodedData.id } });

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Auth Failed" });
  }
};

export const isAdmin = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(400).json({
        success: false,
        message: "You are not an admin, not allowed to access this",
      });
    }
    next();
  };
};

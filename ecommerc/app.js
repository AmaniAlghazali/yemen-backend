import "./env.js";
import express from "express";
const app = express();
import cors from "cors";
import Connection from "./db/conn.js";
import productsRouter from "./routes/productRoutes.js";
import userRouter from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
import orderRouter from "./routes/orderRoutes.js";
import storeRouter from "./routes/storeRoutes.js";
import cartRouter from "./routes/cartRoutes.js";
import stripeRouter from "./routes/stripeRoutes.js";
import paymentRouter from "./routes/paymentRoutes.js";
import { stripeWebhook } from "./controllers/stripeController.js";

app.use(cors({
    origin: function (origin, callback) {
        if (!origin ||
            origin.startsWith("http://localhost") ||
            origin.startsWith("http://192.168.") ||
            origin.startsWith("http://10.") ||
            origin.startsWith("http://172.") ||
            origin.endsWith(".vercel.app") ||
            origin.endsWith(".exp.direct")) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.post("/api/v1/payments/webhook", express.raw({ type: "application/json" }), stripeWebhook);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

Connection().catch((err) => {
  console.error("Database connection failed:", err);
});

app.use("/api/v1/products", productsRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/store", storeRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/payments", stripeRouter);
app.use("/api/v1/payments", paymentRouter);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
    stripeKeyPrefix: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 12) + "..." : null,
  });
});

app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ success: false, message: "API route not found" });
  }
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

export default app;

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

app.use(cors({
    origin: function (origin, callback) {
        if (!origin ||
            origin.startsWith("http://localhost") ||
            origin.endsWith(".vercel.app")) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

Connection();

app.use("/api/v1/products", productsRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/store", storeRouter);
app.use("/api/v1/cart", cartRouter);

export default app;

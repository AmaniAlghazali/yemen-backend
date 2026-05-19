import "./env.js"; // <-- CRITICAL: This MUST be Line 1!

import express from "express";
const app = express();
import cors from "cors";
import Connection from "./db/conn.js";
import productsRouter from "./routes/productRoutes.js";
import userRouter from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
import orderRouter from "./routes/orderRoutes.js";

// --- CORS CONFIGURATION ---
app.use(cors({
    origin: "http://localhost:5173", 
    credentials: true,                
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({limit:"50mb"}));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

Connection();

app.use("/api/v1/products", productsRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/orders", orderRouter);

const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
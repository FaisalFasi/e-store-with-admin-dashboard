import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

// Importing the routes from the routes folder
import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentRoutes from "./routes/payment.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
// import chatbotRoutes from "./routes/chatbot.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8800;

const __dirname = path.resolve();

// here limit is set to 5mb, so the user can upload files upto 5mb
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
// trust proxy is set to 1, so that the app will trust the first proxy that it encounters and it will calculate the correct IP address of the user
app.set("trust proxy", 1);

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);
// app.use("/api/chatbot", chatbotRoutes);

// Serve static assets if in production mode, like the frontend build folder in this case
// it will optimize the build folder and serve it as static assets
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static(path.join(__dirname, "/frontend/dist")));
  // if user visit any route other than the api routes, it will serve the index.html file
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

// Connect to the database and 0.0.0.0 means it will listen on all the network interfaces available on the server
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server is running on http://:" + PORT);
  connectDB();
});

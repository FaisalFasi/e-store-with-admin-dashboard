import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db/db.js";

// Importing the routes from the routes folder
import authRoutes from "./routes/auth.route.js";

dotenv.config();

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 8800;

app.use("/api/auth", authRoutes);

// Connect to the database
app.listen(PORT, () => {
  console.log("Server is running on http://:" + PORT);
  connectDB();
});

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/database.js";
import expenseRoutes from "./src/Routes/expenseRoutes.js";
import salesRoutes from "./src/Routes/salesRoutes.js";
import orderRoutes from "./src/Routes/orderRoutes.js";
import categoryRoutes from "./src/Routes/categoryRoutes.js";
import authRoutes from "./src/Routes/authRoutes.js";
import userRoutes from "./src/Routes/userRoutes.js";
import customCardRoutes from "./src/Routes/customCardRoutes.js";
import customInHandRoutes from "./src/Routes/customInHandRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import User from "./src/Models/userModel.js";
import bcrypt from "bcryptjs";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://ttdashboard.onrender.com",
      "https://ttdashboard04.onrender.com",
    ],
    credentials: true,
  }),
);
app.use(express.json());

// Logging middleware for debugging
app.use((req, res, next) => {
  console.log(`🌐 [${req.method}] ${req.url}`, {
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl,
    path: req.path,
    headers: {
      authorization: req.headers.authorization ? "Bearer ***" : "NONE",
      "content-type": req.headers["content-type"],
    },
  });
  next();
});

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/expense", expenseRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/custom-cards", customCardRoutes);
app.use("/api/custom-inhand", customInHandRoutes);

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "T Dashboard API is running!" });
});

// 404 fallback
app.use((req, res) => {
  console.log(`404 - Route not found: [${req.method}] ${req.url}`);
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Available routes:");
  console.log("- GET /api/categories");
  console.log("- POST /api/categories");
  console.log("- PUT /api/categories/:categoryName");
  console.log("- DELETE /api/categories/:categoryName");
  console.log("- GET /api/categories/subcategories");
  console.log("- POST /api/categories/subcategories");
  console.log(
    "- PUT /api/categories/subcategories/:categoryName/:subCategoryName",
  );
  console.log(
    "- DELETE /api/categories/subcategories/:categoryName/:subCategoryName",
  );
});

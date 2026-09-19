import express from "express";
import {
  createSales,
  getMonthlySales,
  getSalesPieChartData,
  getYearlySalesSummary,
  getMonthlySalesData,
  getYearlySalesData,
  getMonthlySalesTotal,
  getYearlySalesTotal,
  getDateRangeSalesTotal,
  updateSales,
  deleteSales,
  getDateRangeSales,
  getDateRangeSalesPieChartData,
  getDateRangeSalesData,
} from "../Controllers/salesController.js";
import { getDailySalesData } from "../Controllers/dailySalesController.js";
import { getYearlyCombinedSalesData } from "../Controllers/yearlySalesController.js";
import { requireStaffOrAbove, requireAdmin } from "../MIddlewares/roleMiddleware.js";
import { authenticateToken } from "../MIddlewares/authMiddleware.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve("./uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname.replace(/\s+/g, "_"));
  },
});

function fileFilter(req, file, cb) {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/jpg",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images, PDFs, and Word files are allowed!"), false);
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

router.post("/add-sales", authenticateToken, requireStaffOrAbove, upload.single("file"), createSales);
router.get("/monthly-sales", authenticateToken, requireStaffOrAbove, getMonthlySales);
router.get("/sales-pie-chart-data", authenticateToken, requireStaffOrAbove, getSalesPieChartData);
router.get("/yearly-sales", authenticateToken, requireStaffOrAbove, getYearlySalesSummary);
router.get("/monthly-sales-data", authenticateToken, requireStaffOrAbove, getMonthlySalesData);
router.get("/yearly-sales-data", authenticateToken, requireStaffOrAbove, getYearlySalesData);
router.delete("/delete-sales/:id", authenticateToken, requireAdmin, deleteSales);
router.put("/update-sales/:id", authenticateToken, requireAdmin, upload.single("file"), updateSales);

// Date range filter routes
router.get("/date-range-sales", authenticateToken, requireStaffOrAbove, getDateRangeSales);
router.get("/date-range-sales-pie-chart-data", authenticateToken, requireStaffOrAbove, getDateRangeSalesPieChartData);
router.get("/date-range-sales-data", authenticateToken, requireStaffOrAbove, getDateRangeSalesData);

// Total sales amount routes
router.get("/monthly-sales-total", authenticateToken, requireStaffOrAbove, getMonthlySalesTotal);
router.get("/yearly-sales-total", authenticateToken, requireStaffOrAbove, getYearlySalesTotal);
router.get("/date-range-sales-total", authenticateToken, requireStaffOrAbove, getDateRangeSalesTotal);

// Daily sales data route
router.get("/daily-sales-data", authenticateToken, requireStaffOrAbove, getDailySalesData);

// Yearly combined sales + orders route
router.get("/yearly-combined-sales", authenticateToken, requireStaffOrAbove, getYearlyCombinedSalesData);

export default router;

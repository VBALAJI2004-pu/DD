import express from "express";
import {
  createOrder,
  getMonthlyOrders,
  getYearlyOrdersSummary,
  getMonthlyOrderData,
  getYearlyOrderData,
  getMonthlyOrdersTotal,
  getYearlyOrdersTotal,
  getDateRangeOrdersTotal,
  updateOrder,
  deleteOrder,
  getDateRangeOrders,
  getDateRangeOrderData,
} from "../Controllers/orderController.js";
import { authenticateToken } from "../MIddlewares/authMiddleware.js";
import { requireAccountantOrAdmin, requireAdmin } from "../MIddlewares/roleMiddleware.js";
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
    const safeName = path
      .basename(file.originalname || "upload")
      .replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${uniqueSuffix}-${safeName}`);
  },
});

function fileFilter(req, file, cb) {
  const allowedAttachmentTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/jpg",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const allowedReceiptTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
    "application/pdf",
  ];

  if (file.fieldname === "paymentReceipt") {
    if (allowedReceiptTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Payment receipt must be JPG, JPEG, PNG, WEBP, or PDF."), false);
    }
    return;
  }

  if (allowedAttachmentTypes.includes(file.mimetype)) {
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

// Order routes - Restricted to Accountant and Admin (Staff cannot access)
router.post(
  "/add-order",
  authenticateToken,
  requireAccountantOrAdmin,
  (req, res, next) => {
    upload.fields([
      { name: "file", maxCount: 1 },
      { name: "paymentReceipt", maxCount: 1 },
    ])(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  createOrder
);
router.get("/monthly-orders", authenticateToken, requireAccountantOrAdmin, getMonthlyOrders);
router.get("/monthly-order-data", authenticateToken, requireAccountantOrAdmin, getMonthlyOrderData);
router.get("/yearly-orders", authenticateToken, requireAccountantOrAdmin, getYearlyOrdersSummary);
router.get("/yearly-order-data", authenticateToken, requireAccountantOrAdmin, getYearlyOrderData);
router.delete("/delete-order/:id", authenticateToken, requireAdmin, deleteOrder);
router.put("/update-order/:id", authenticateToken, requireAdmin, upload.single("file"), updateOrder);

// Date range filter routes
router.get("/date-range-orders", authenticateToken, requireAccountantOrAdmin, getDateRangeOrders);
router.get("/date-range-order-data", authenticateToken, requireAccountantOrAdmin, getDateRangeOrderData);

// Total orders amount routes
router.get("/monthly-orders-total", authenticateToken, requireAccountantOrAdmin, getMonthlyOrdersTotal);
router.get("/yearly-orders-total", authenticateToken, requireAccountantOrAdmin, getYearlyOrdersTotal);
router.get("/date-range-orders-total", authenticateToken, requireAccountantOrAdmin, getDateRangeOrdersTotal);

export default router;

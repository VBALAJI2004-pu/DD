import express from "express";
import {
  createExpense,
  getMonthlyExpense,
  getLoansAndInterestsMonthlyTotals,
  getExpensePieChartData,
  getYearlyExpenseSummary,
  getMonthlyExpenseData,
  getExpenseCategories,
  deleteExpense,
  updateExpense,
  getDateRangeExpense,
  getDateRangeLoansExpense,
  getDateRangePieChartData,
  getDateRangeExpenseData,
  debugAttachments,
  debugAllExpenses,
} from "../Controllers/expenseController.js";
import { requireAccountantOrAdmin, requireAdmin } from "../MIddlewares/roleMiddleware.js";
import { authenticateToken } from "../MIddlewares/authMiddleware.js";
import multer from "multer";
import path from "path";
import fs from "fs";

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

router.post("/add-expense", authenticateToken, requireAccountantOrAdmin, upload.fields([
  { name: 'billAttachment', maxCount: 1 },
  { name: 'paymentAttachment', maxCount: 1 }
]), createExpense);
router.get("/monthly-expense", authenticateToken, requireAccountantOrAdmin, getMonthlyExpense);
router.get("/loans-expense", authenticateToken, requireAccountantOrAdmin, getLoansAndInterestsMonthlyTotals);
router.get("/expense-pie-chart-data", authenticateToken, requireAccountantOrAdmin, getExpensePieChartData);
router.get("/yearly-expense", authenticateToken, requireAccountantOrAdmin, getYearlyExpenseSummary);
router.get("/monthly-expense-data", authenticateToken, requireAccountantOrAdmin, getMonthlyExpenseData);
router.get("/categories", authenticateToken, requireAccountantOrAdmin, getExpenseCategories);
router.get("/download/:filename", authenticateToken, (req, res) => {
  const { filename } = req.params;
  const filePath = path.resolve("./uploads", filename);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }
  
  // Get file stats for proper headers
  const stat = fs.statSync(filePath);
  const fileExtension = path.extname(filename).toLowerCase();
  
  // Set content type based on file extension
  let contentType = 'application/octet-stream';
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fileExtension)) {
    contentType = `image/${fileExtension.slice(1)}`;
  } else if (fileExtension === '.pdf') {
    contentType = 'application/pdf';
  } else if (['.doc', '.docx'].includes(fileExtension)) {
    contentType = 'application/msword';
  }
  
  // Set appropriate headers
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Length', stat.size);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Cache-Control', 'no-cache');
  
  // Send the file
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('File download error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to download file' });
      }
    }
  });
});
router.delete("/delete-expense/:id", authenticateToken, requireAdmin, deleteExpense);
router.put("/update-expense/:id", authenticateToken, requireAdmin, upload.fields([
  { name: 'billAttachment', maxCount: 1 },
  { name: 'paymentAttachment', maxCount: 1 }
]), updateExpense);

// Date range filter routes
router.get("/date-range-expense", authenticateToken, requireAccountantOrAdmin, getDateRangeExpense);
router.get("/date-range-loans-expense", authenticateToken, requireAccountantOrAdmin, getDateRangeLoansExpense);
router.get("/date-range-pie-chart-data", authenticateToken, requireAccountantOrAdmin, getDateRangePieChartData);
router.get("/date-range-expense-data", authenticateToken, requireAccountantOrAdmin, getDateRangeExpenseData);

// Debug endpoints
router.get("/debug-attachments", authenticateToken, requireAccountantOrAdmin, debugAttachments);
router.get("/debug-all-expenses", authenticateToken, requireAccountantOrAdmin, debugAllExpenses);

export default router;

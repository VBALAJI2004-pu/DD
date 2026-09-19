import express from "express";
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getSubCategories,
  addSubCategory,
  updateSubCategory,
  deleteSubCategory
} from "../Controllers/categoryController.js";
import { authenticateToken } from "../MIddlewares/authMiddleware.js";
import { requireAdmin } from "../MIddlewares/roleMiddleware.js";

const router = express.Router();

// Category routes
router.get("/", authenticateToken, requireAdmin, getCategories);
router.post("/", authenticateToken, requireAdmin, addCategory);
router.put("/:categoryName", authenticateToken, requireAdmin, updateCategory);
router.delete("/:categoryName", authenticateToken, requireAdmin, deleteCategory);

// Subcategory routes
router.get("/subcategories", authenticateToken, requireAdmin, getSubCategories);
router.get("/subcategories/:categoryName", authenticateToken, requireAdmin, getSubCategories);
router.post("/subcategories", authenticateToken, requireAdmin, addSubCategory);
router.put("/subcategories/:categoryName/:subCategoryName", authenticateToken, requireAdmin, updateSubCategory);
router.delete("/subcategories/:categoryName/:subCategoryName", authenticateToken, requireAdmin, deleteSubCategory);

export default router;

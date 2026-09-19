import express from "express";
import {
  getCustomInHand,
  saveCustomInHand,
  updateCustomInHand,
  deleteCustomInHand,
} from "../Controllers/customInHandController.js";
import { authenticateToken } from "../MIddlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, getCustomInHand);
router.post("/", authenticateToken, saveCustomInHand);
router.put("/", authenticateToken, updateCustomInHand);
router.delete("/", authenticateToken, deleteCustomInHand);

export default router;

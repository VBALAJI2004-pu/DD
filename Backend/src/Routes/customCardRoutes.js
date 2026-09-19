import express from "express";
import {
  getCustomCards,
  createCustomCard,
  updateCustomCard,
  deleteCustomCard,
} from "../Controllers/customCardController.js";
import { authenticateToken } from "../MIddlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, getCustomCards);
router.post("/", authenticateToken, createCustomCard);
router.put("/:cardId", authenticateToken, updateCustomCard);
router.delete("/:cardId", authenticateToken, deleteCustomCard);

export default router;

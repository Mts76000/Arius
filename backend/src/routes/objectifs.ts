import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getObjectifsHandler,
  createObjectifHandler,
  updateObjectifHandler,
  deleteObjectifHandler,
} from "../controllers/objectifController.js";

const router = Router();

// Objectifs CRUD
router.get("/", requireAuth, getObjectifsHandler);
router.post("/", requireAuth, createObjectifHandler);
router.put("/:id", requireAuth, updateObjectifHandler);
router.delete("/:id", requireAuth, deleteObjectifHandler);

export default router;

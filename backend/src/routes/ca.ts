import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getCAHandler,
  createCAHandler,
  updateCAHandler,
  deleteCAHandler,
  getCAStatsHandler,
  getCAEntrepriseHandler,
} from "../controllers/caController.js";

const router = Router();

// CA CRUD
router.get("/", requireAuth, getCAHandler);
router.post("/", requireAuth, createCAHandler);

// CA Stats & Analytics
router.get("/stats", requireAuth, getCAStatsHandler);
router.get("/entreprise/:entreprise_id", requireAuth, getCAEntrepriseHandler);

router.put("/:id", requireAuth, updateCAHandler);
router.delete("/:id", requireAuth, deleteCAHandler);

export default router;

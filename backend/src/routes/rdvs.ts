import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listMyRdvs,
  listByEntreprise,
  get,
  create,
  update,
  remove,
} from "../controllers/rdvController.js";

const router = Router();

// RDVs CRUD
router.get("/rdvs", requireAuth, listMyRdvs);
router.get("/entreprises/:id/rdvs", requireAuth, listByEntreprise);
router.get("/rdvs/:id", requireAuth, get);
router.post("/rdvs", requireAuth, create);
router.put("/rdvs/:id", requireAuth, update);
router.delete("/rdvs/:id", requireAuth, remove);

export default router;

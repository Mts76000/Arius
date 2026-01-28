import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listByEntreprise,
  get,
  create,
  update,
  remove,
  search,
  getTemplates,
  getDashboard,
} from "../controllers/noteController.js";

const router = Router();

// Notes CRUD
router.get("/entreprises/:id/notes", requireAuth, listByEntreprise);
router.get("/notes/:id", requireAuth, get);
router.post("/notes", requireAuth, create);
router.put("/notes/:id", requireAuth, update);
router.delete("/notes/:id", requireAuth, remove);

// Notes utilities
router.get("/notes/search", requireAuth, search);
router.get("/templates/notes", requireAuth, getTemplates);
router.get("/dashboard/clients-suivi", requireAuth, getDashboard);

export default router;

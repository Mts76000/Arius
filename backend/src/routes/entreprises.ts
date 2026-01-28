import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  list,
  get,
  create,
  update,
  remove,
} from "../controllers/entrepriseController.js";

const router = Router();

// Entreprises CRUD
router.get("/", requireAuth, list);
router.get("/:id", requireAuth, get);
router.post("/", requireAuth, create);
router.put("/:id", requireAuth, update);
router.delete("/:id", requireAuth, remove);

export default router;

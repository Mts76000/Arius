import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getProfil,
  updateProfil,
  changerMotdepasse,
} from "../controllers/profilController.js";

const router = Router();

router.get("/profil", requireAuth, getProfil);
router.patch("/profil", requireAuth, updateProfil);
router.post("/changer-motdepasse", requireAuth, changerMotdepasse);

export default router;

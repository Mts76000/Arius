import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { google, login, me, register } from "../controllers/authController.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", google);
router.get("/me", requireAuth, me);

export default router;

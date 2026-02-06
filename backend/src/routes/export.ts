import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { downloadExport } from "../controllers/exportController.js";

const router = Router();

router.get("/export/rgpd", requireAuth, downloadExport);

export default router;

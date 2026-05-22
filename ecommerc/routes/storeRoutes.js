import express from "express";
const router = express.Router();
import { getStoreSettings, updateStoreSettings } from "../controllers/storeController.js";
import { isAuthenticatedUser, isAdmin } from "../util/userAuth.js";

router.get("/settings", getStoreSettings);
router.put("/settings", isAuthenticatedUser, isAdmin("admin"), updateStoreSettings);

export default router;

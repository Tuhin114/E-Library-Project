import { Router } from "express";
import * as librarySettingsController from "../controllers/librarySettingsController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { updateSettingsSchema } from "../validators/librarySettingsValidator.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

// Purely operational configuration — librarian-only, both reads and
// writes. Nothing here is exposed to students.
router.use(authenticate, authorize(ROLES.LIBRARIAN));

router.get("/", librarySettingsController.getSettings);
router.patch("/", validateRequest(updateSettingsSchema), librarySettingsController.updateSettings);

export default router;

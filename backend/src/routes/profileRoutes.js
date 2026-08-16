import { Router } from "express";
import * as profileController from "../controllers/profileController.js";
import { authenticate } from "../middleware/authenticate.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { validateParams } from "../middleware/validateParams.js";
import { uploadAvatarMiddleware } from "../middleware/uploadMiddleware.js";
import {
  updateProfileSchema,
  savedSearchSchema,
  savedSearchParamSchema,
} from "../validators/profileValidator.js";

const router = Router();

router.use(authenticate);

router.patch("/profile", validateRequest(updateProfileSchema), profileController.updateProfile);

// Multipart route — no validateRequest (body isn't JSON), just the
// file-type/size middleware, same pattern as the book cover route.
router.post("/profile/avatar", uploadAvatarMiddleware, profileController.uploadAvatar);
router.delete("/profile/avatar", profileController.removeAvatar);

router.get("/saved-searches", profileController.getSavedSearches);
router.post(
  "/saved-searches",
  validateRequest(savedSearchSchema),
  profileController.createSavedSearch,
);
router.delete(
  "/saved-searches/:id",
  validateParams(savedSearchParamSchema),
  profileController.deleteSavedSearch,
);

export default router;

import { Router } from "express";
import * as resourceController from "../controllers/resourceController.js";
import { authenticate } from "../middleware/authenticate.js";
import { validateParams } from "../middleware/validateParams.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { validateQuery } from "../middleware/validateQuery.js";
import { uploadResourceFileMiddleware } from "../middleware/uploadMiddleware.js";
import {
  createResourceSchema,
  updateResourceSchema,
  resourceIdParamSchema,
  resourceQuerySchema,
} from "../validators/resourceValidator.js";

const router = Router();

router.use(authenticate);

// Reads — any authenticated role; private/public is enforced in the
// service layer (resourceService.assertResourceReadable).
router.get(
  "/",
  validateQuery(resourceQuerySchema),
  resourceController.getResources,
);
router.get(
  "/:id",
  validateParams(resourceIdParamSchema),
  resourceController.getResourceById,
);

// Create — any authenticated role (student, faculty, librarian),
// unlike Book creation which is librarian-only.
router.post(
  "/",
  validateRequest(createResourceSchema),
  resourceController.createResource,
);

// Update/delete/file management — owner or librarian, enforced in the
// service layer.
router.patch(
  "/:id",
  validateParams(resourceIdParamSchema),
  validateRequest(updateResourceSchema),
  resourceController.updateResource,
);
router.delete(
  "/:id",
  validateParams(resourceIdParamSchema),
  resourceController.deleteResource,
);
router.post(
  "/:id/file",
  validateParams(resourceIdParamSchema),
  uploadResourceFileMiddleware,
  resourceController.uploadResourceFile,
);
router.delete(
  "/:id/file",
  validateParams(resourceIdParamSchema),
  resourceController.deleteResourceFile,
);

export default router;

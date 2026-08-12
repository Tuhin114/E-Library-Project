import { Router } from "express";
import * as publisherController from "../controllers/publisherController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validateParams } from "../middleware/validateParams.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  createPublisherSchema,
  updatePublisherSchema,
  publisherIdParamSchema,
} from "../validators/publisherValidator.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.use(authenticate);

router.get("/", publisherController.getPublishers);
router.get("/slug/:slug", publisherController.getPublisherBySlug);
router.get(
  "/:id",
  validateParams(publisherIdParamSchema),
  publisherController.getPublisherById,
);

router.post(
  "/",
  authorize(ROLES.LIBRARIAN),
  validateRequest(createPublisherSchema),
  publisherController.createPublisher,
);
router.patch(
  "/:id",
  authorize(ROLES.LIBRARIAN),
  validateRequest(updatePublisherSchema),
  publisherController.updatePublisher,
);
router.delete(
  "/:id",
  authorize(ROLES.LIBRARIAN),
  validateParams(publisherIdParamSchema),
  publisherController.deletePublisher,
);

export default router;

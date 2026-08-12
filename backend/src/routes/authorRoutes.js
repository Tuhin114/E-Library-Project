import { Router } from "express";
import * as authorController from "../controllers/authorController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validateParams } from "../middleware/validateParams.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  createAuthorSchema,
  updateAuthorSchema,
  authorIdParamSchema,
} from "../validators/authorValidator.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.use(authenticate);

router.get("/", authorController.getAuthors);
router.get("/slug/:slug", authorController.getAuthorBySlug);
router.get(
  "/:id",
  validateParams(authorIdParamSchema),
  authorController.getAuthorById,
);

router.post(
  "/",
  authorize(ROLES.LIBRARIAN),
  validateRequest(createAuthorSchema),
  authorController.createAuthor,
);
router.patch(
  "/:id",
  authorize(ROLES.LIBRARIAN),
  validateRequest(updateAuthorSchema),
  authorController.updateAuthor,
);
router.delete(
  "/:id",
  authorize(ROLES.LIBRARIAN),
  validateParams(authorIdParamSchema),
  authorController.deleteAuthor,
);

export default router;

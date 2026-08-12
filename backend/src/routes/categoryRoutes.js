import { Router } from "express";
import * as categoryController from "../controllers/categoryController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validateParams } from "../middleware/validateParams.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema,
} from "../validators/categoryValidator.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.use(authenticate);

router.get("/", categoryController.getCategories);
router.get("/slug/:slug", categoryController.getCategoryBySlug);
router.get(
  "/:id",
  validateParams(categoryIdParamSchema),
  categoryController.getCategoryById,
);

router.post(
  "/",
  authorize(ROLES.LIBRARIAN),
  validateRequest(createCategorySchema),
  categoryController.createCategory,
);
router.patch(
  "/:id",
  authorize(ROLES.LIBRARIAN),
  validateRequest(updateCategorySchema),
  categoryController.updateCategory,
);
router.delete(
  "/:id",
  authorize(ROLES.LIBRARIAN),
  validateParams(categoryIdParamSchema),
  categoryController.deleteCategory,
);

export default router;

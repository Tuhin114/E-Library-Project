import { Router } from "express";
import * as bookCopyController from "../controllers/bookCopyController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validateParams } from "../middleware/validateParams.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  copyIdParamSchema,
  updateCopySchema,
} from "../validators/bookCopyValidator.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.use(authenticate, authorize(ROLES.LIBRARIAN));

router.patch(
  "/:id",
  validateParams(copyIdParamSchema),
  validateRequest(updateCopySchema),
  bookCopyController.updateCopy,
);
router.delete(
  "/:id",
  validateParams(copyIdParamSchema),
  bookCopyController.deleteCopy,
);

export default router;

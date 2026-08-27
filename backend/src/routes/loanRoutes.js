import { Router } from "express";
import * as loanController from "../controllers/loanController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validateParams } from "../middleware/validateParams.js";
import { validateQuery } from "../middleware/validateQuery.js";
import { loanIdParamSchema, loanQuerySchema } from "../validators/loanValidator.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.use(authenticate);

// Listing every loan is librarian-only; a single loan is accessible by
// its owning student too — same ownership-vs-role split physicalRequest
// routes already use for GET /:id.
router.get(
  "/",
  authorize(ROLES.LIBRARIAN),
  validateQuery(loanQuerySchema),
  loanController.listLoans,
);

router.get("/:id", validateParams(loanIdParamSchema), loanController.getLoan);

export default router;

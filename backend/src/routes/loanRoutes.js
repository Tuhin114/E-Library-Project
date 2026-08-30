import { Router } from "express";
import * as loanController from "../controllers/loanController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validateParams } from "../middleware/validateParams.js";
import { validateQuery } from "../middleware/validateQuery.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  loanIdParamSchema,
  loanQuerySchema,
  returnLoanSchema,
  reportLostSchema,
} from "../validators/loanValidator.js";
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

router.patch(
  "/:id/return",
  authorize(ROLES.LIBRARIAN),
  validateParams(loanIdParamSchema),
  validateRequest(returnLoanSchema),
  loanController.returnLoan,
);

// M2 (Phase 7) — no role restriction: ownership (or librarian) is
// checked in loanService.renewLoan, same pattern GET /:id already
// uses. No request body needed — every renewal input (extension
// length, max count) comes from LibrarySettings, not the caller.
router.patch(
  "/:id/renew",
  validateParams(loanIdParamSchema),
  loanController.renewLoan,
);

// M3 (Phase 7) — librarian-only, same as return: reporting a loan lost
// is a staff-initiated action, never something a student self-reports
// through this endpoint.
router.patch(
  "/:id/report-lost",
  authorize(ROLES.LIBRARIAN),
  validateParams(loanIdParamSchema),
  validateRequest(reportLostSchema),
  loanController.reportLoanLost,
);

router.patch(
  "/:id/test-due-date",
  authorize(ROLES.LIBRARIAN),
  validateParams(loanIdParamSchema),
  loanController.setLoanDueDateForTesting,
);

export default router;

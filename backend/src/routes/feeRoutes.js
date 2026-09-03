import { Router } from "express";
import * as feeController from "../controllers/feeController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validateParams } from "../middleware/validateParams.js";
import { validateQuery } from "../middleware/validateQuery.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { feeIdParamSchema, feeQuerySchema, finalizeFeeSchema, waiveFeeSchema } from "../validators/feeValidator.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  authorize(ROLES.LIBRARIAN),
  validateQuery(feeQuerySchema),
  feeController.listFees,
);

router.get("/:id", validateParams(feeIdParamSchema), feeController.getFee);

router.get(
  "/:id/receipt",
  validateParams(feeIdParamSchema),
  feeController.downloadFeeReceipt,
);

// Phase 9 M2 — deliberate breaking change: before this milestone,
// PATCH /:id/pay was reachable by either the owning student or a
// librarian, and instantly flipped the fee to PAID either way. That
// instant-flip-by-the-student path is exactly what a genuine payment
// gateway replaces — a student paying their own fee now goes through
// POST /:id/checkout (below) and only becomes PAID once the webhook
// confirms the sandboxed payment actually completed. This route stays,
// unchanged in behavior, for the one case it was always meant for: a
// librarian recording a real in-person payment at the desk, which has
// no gateway involved by design.
router.patch(
  "/:id/pay",
  authorize(ROLES.LIBRARIAN),
  validateParams(feeIdParamSchema),
  feeController.payFee,
);

// Phase 9 M2 — student/faculty only, the self-serve checkout path.
// Ownership is checked inside paymentService, same pattern used
// elsewhere in this app.
router.post(
  "/:id/checkout",
  authorize(ROLES.STUDENT, ROLES.FACULTY),
  validateParams(feeIdParamSchema),
  feeController.checkoutFee,
);

// M3 (Phase 7) — both librarian-only: confirming/adjusting a
// PENDING_REVIEW fee's amount, and waiving a fee outright.
router.patch(
  "/:id/finalize",
  authorize(ROLES.LIBRARIAN),
  validateParams(feeIdParamSchema),
  validateRequest(finalizeFeeSchema),
  feeController.finalizeFee,
);

router.patch(
  "/:id/waive",
  authorize(ROLES.LIBRARIAN),
  validateParams(feeIdParamSchema),
  validateRequest(waiveFeeSchema),
  feeController.waiveFee,
);

export default router;

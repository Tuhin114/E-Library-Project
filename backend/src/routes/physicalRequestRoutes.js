import { Router } from "express";
import * as physicalRequestController from "../controllers/physicalRequestController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validateParams } from "../middleware/validateParams.js";
import { validateQuery } from "../middleware/validateQuery.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  createRequestSchema,
  approveRequestSchema,
  rejectRequestSchema,
  requestIdParamSchema,
  requestQuerySchema,
  collectRequestSchema,
  referenceCodeParamSchema,
} from "../validators/physicalRequestValidator.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.use(authenticate);

// Any non-librarian (student/faculty) can request and manage their own
// requests; only a librarian can see the full queue or decide on one.
router.post(
  "/",
  authorize(ROLES.STUDENT, ROLES.FACULTY),
  validateRequest(createRequestSchema),
  physicalRequestController.createRequest,
);

router.get(
  "/",
  authorize(ROLES.LIBRARIAN),
  validateQuery(requestQuerySchema),
  physicalRequestController.listRequests,
);

router.get(
  "/lookup/:referenceCode",
  authorize(ROLES.LIBRARIAN),
  validateParams(referenceCodeParamSchema),
  physicalRequestController.lookupRequestByReferenceCode,
);

router.get(
  "/:id",
  validateParams(requestIdParamSchema),
  physicalRequestController.getRequest,
);

router.get(
  "/:id/receipt",
  validateParams(requestIdParamSchema),
  physicalRequestController.downloadRequestReceipt,
);

router.patch(
  "/:id/approve",
  authorize(ROLES.LIBRARIAN),
  validateParams(requestIdParamSchema),
  validateRequest(approveRequestSchema),
  physicalRequestController.approveRequest,
);

router.patch(
  "/:id/reject",
  authorize(ROLES.LIBRARIAN),
  validateParams(requestIdParamSchema),
  validateRequest(rejectRequestSchema),
  physicalRequestController.rejectRequest,
);

router.patch(
  "/:id/cancel",
  authorize(ROLES.STUDENT, ROLES.FACULTY),
  validateParams(requestIdParamSchema),
  physicalRequestController.cancelRequest,
);

router.patch(
  "/:id/collect",
  authorize(ROLES.LIBRARIAN),
  validateParams(requestIdParamSchema),
  validateRequest(collectRequestSchema),
  physicalRequestController.collectRequest,
);

export default router;

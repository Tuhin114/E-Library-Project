import { Router } from "express";
import * as bookController from "../controllers/bookController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validateParams } from "../middleware/validateParams.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { validateQuery } from "../middleware/validateQuery.js";
import {
  uploadCoverMiddleware,
  uploadDigitalFileMiddleware,
} from "../middleware/uploadMiddleware.js";
import {
  createBookSchema,
  updateBookSchema,
  bookIdParamSchema,
  bookQuerySchema,
} from "../validators/bookValidator.js";
import {
  bookCoverParamSchema,
  bookDigitalFileParamSchema,
  bookFileStreamQuerySchema,
} from "../validators/bookFileValidator.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.use(authenticate);

// Reads — any authenticated role (student, faculty, librarian)
router.get("/", validateQuery(bookQuerySchema), bookController.getBooks);
router.get(
  "/:id",
  validateParams(bookIdParamSchema),
  bookController.getBookById,
);

// Mutations — librarian only
router.post(
  "/",
  authorize(ROLES.LIBRARIAN),
  validateRequest(createBookSchema),
  bookController.createBook,
);
router.patch(
  "/:id",
  authorize(ROLES.LIBRARIAN),
  validateRequest(updateBookSchema),
  bookController.updateBook,
);
router.delete(
  "/:id",
  authorize(ROLES.LIBRARIAN),
  validateParams(bookIdParamSchema),
  bookController.deleteBook,
);

// Digital file management — librarian only
router.post(
  "/:id/cover",
  authorize(ROLES.LIBRARIAN),
  validateParams(bookCoverParamSchema),
  uploadCoverMiddleware,
  bookController.uploadCoverImage,
);
router.delete(
  "/:id/cover",
  authorize(ROLES.LIBRARIAN),
  validateParams(bookCoverParamSchema),
  bookController.deleteCoverImage,
);
router.post(
  "/:id/files/:type",
  authorize(ROLES.LIBRARIAN),
  validateParams(bookDigitalFileParamSchema),
  uploadDigitalFileMiddleware,
  bookController.uploadDigitalFile,
);
router.delete(
  "/:id/files/:type",
  authorize(ROLES.LIBRARIAN),
  validateParams(bookDigitalFileParamSchema),
  bookController.deleteDigitalFile,
);

// Digital file access — any authenticated role; visibility/status and
// download-vs-read restrictions are enforced in the service layer.
router.get(
  "/:id/files/:type/stream",
  validateParams(bookDigitalFileParamSchema),
  validateQuery(bookFileStreamQuerySchema),
  bookController.streamBookFile,
);

export default router;

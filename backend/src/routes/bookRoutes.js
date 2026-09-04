import { Router } from "express";
import * as bookController from "../controllers/bookController.js";
import * as reviewController from "../controllers/reviewController.js";
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
  remoteFileUrlSchema,
} from "../validators/bookFileValidator.js";
import {
  createReviewSchema,
  reviewQuerySchema,
} from "../validators/reviewValidator.js";
import * as discussionController from "../controllers/discussionController.js";
import {
  createDiscussionSchema,
  discussionQuerySchema,
} from "../validators/discussionValidator.js";
import * as bookCopyController from "../controllers/bookCopyController.js";
import {
  addCopiesSchema,
  copyQuerySchema,
} from "../validators/bookCopyValidator.js";
import * as waitlistController from "../controllers/waitlistController.js";
import { ROLES } from "../constants/roles.js";
import { createRateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

const remoteFileImportLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many remote file imports. Please try again later.",
});

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
router.post(
  "/:id/cover/url",
  authorize(ROLES.LIBRARIAN),
  validateParams(bookCoverParamSchema),
  validateRequest(remoteFileUrlSchema),
  remoteFileImportLimiter,
  bookController.importCoverImageFromUrl,
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
router.post(
  "/:id/files/:type/url",
  authorize(ROLES.LIBRARIAN),
  validateParams(bookDigitalFileParamSchema),
  validateRequest(remoteFileUrlSchema),
  remoteFileImportLimiter,
  bookController.importDigitalFileFromUrl,
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

// Reviews — any authenticated role; ownership/moderation is enforced
// in the service layer. Edit/delete-by-review-id live in reviewRoutes.
router.get(
  "/:id/reviews",
  validateParams(bookIdParamSchema),
  validateQuery(reviewQuerySchema),
  reviewController.getBookReviews,
);
router.post(
  "/:id/reviews",
  validateParams(bookIdParamSchema),
  validateRequest(createReviewSchema),
  reviewController.createReview,
);

// Discussions — any authenticated role; ownership/moderation is
// enforced in the service layer. Reply/delete-by-id live in
// discussionRoutes and discussionReplyRoutes.
router.get(
  "/:id/discussions",
  validateParams(bookIdParamSchema),
  validateQuery(discussionQuerySchema),
  discussionController.getBookDiscussions,
);
router.post(
  "/:id/discussions",
  validateParams(bookIdParamSchema),
  validateRequest(createDiscussionSchema),
  discussionController.createDiscussion,
);

// Physical copy inventory — librarian only. Edit/delete-by-copy-id
// live in copyRoutes, same split reviews/discussions already use.
router.get(
  "/:id/copies",
  authorize(ROLES.LIBRARIAN),
  validateParams(bookIdParamSchema),
  validateQuery(copyQuerySchema),
  bookCopyController.listCopies,
);
router.post(
  "/:id/copies",
  authorize(ROLES.LIBRARIAN),
  validateParams(bookIdParamSchema),
  validateRequest(addCopiesSchema),
  bookCopyController.addCopies,
);
router.get(
  "/:id/inventory",
  authorize(ROLES.LIBRARIAN),
  validateParams(bookIdParamSchema),
  bookCopyController.getInventorySummary,
);

// Waitlist — join is any authenticated role (student/faculty); the
// queue-for-a-book view is librarian only, same split every other
// book-scoped mutation-vs-visibility pair here already uses.
router.post(
  "/:id/waitlist",
  validateParams(bookIdParamSchema),
  waitlistController.joinWaitlist,
);
router.get(
  "/:id/waitlist",
  authorize(ROLES.LIBRARIAN),
  validateParams(bookIdParamSchema),
  waitlistController.getWaitlistForBook,
);

export default router;

import { Router } from "express";
import * as readingController from "../controllers/readingController.js";
import { authenticate } from "../middleware/authenticate.js";
import { validateParams } from "../middleware/validateParams.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  readingBookParamSchema,
  bookmarkIdParamSchema,
  progressBodySchema,
  bookmarkBodySchema,
} from "../validators/readingValidator.js";

const router = Router();

router.use(authenticate);

router.get(
  "/books/:bookId/progress",
  validateParams(readingBookParamSchema),
  readingController.getProgress,
);
router.put(
  "/books/:bookId/progress",
  validateParams(readingBookParamSchema),
  validateRequest(progressBodySchema),
  readingController.upsertProgress,
);

router.get(
  "/books/:bookId/bookmarks",
  validateParams(readingBookParamSchema),
  readingController.getBookmarks,
);
router.post(
  "/books/:bookId/bookmarks",
  validateParams(readingBookParamSchema),
  validateRequest(bookmarkBodySchema),
  readingController.addBookmark,
);
router.delete(
  "/bookmarks/:bookmarkId",
  validateParams(bookmarkIdParamSchema),
  readingController.deleteBookmark,
);

export default router;

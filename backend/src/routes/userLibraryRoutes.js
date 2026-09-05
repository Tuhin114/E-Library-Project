import { Router } from "express";
import * as userLibraryController from "../controllers/userLibraryController.js";
import { authenticate } from "../middleware/authenticate.js";
import { validateParams } from "../middleware/validateParams.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { favoriteBookParamSchema } from "../validators/userLibraryValidator.js";
import { validateQuery } from "../middleware/validateQuery.js";
import { myRequestQuerySchema } from "../validators/physicalRequestValidator.js";
import { loanQuerySchema } from "../validators/loanValidator.js";
import { feeQuerySchema } from "../validators/feeValidator.js";
import {
  createSavedListSchema,
  updateSavedListSchema,
  savedListIdParamSchema,
  savedListItemParamSchema,
} from "../validators/savedListValidator.js";

const router = Router();

router.use(authenticate);

router.get("/favorites", userLibraryController.getFavorites);

router.post(
  "/favorites/:bookId",
  validateParams(favoriteBookParamSchema),
  userLibraryController.addFavorite,
);

router.delete(
  "/favorites/:bookId",
  validateParams(favoriteBookParamSchema),
  userLibraryController.removeFavorite,
);

router.get("/recently-viewed", userLibraryController.getRecentlyViewed);

router.get("/continue-reading", userLibraryController.getContinueReading);

router.get("/recommendations", userLibraryController.getRecommendations);

router.get("/activity", userLibraryController.getActivity);

router.get(
  "/requests",
  validateQuery(myRequestQuerySchema),
  userLibraryController.getMyRequests,
);

router.get(
  "/loans",
  validateQuery(loanQuerySchema),
  userLibraryController.getMyLoans,
);

router.get(
  "/fees",
  validateQuery(feeQuerySchema),
  userLibraryController.getMyFees,
);

router.get("/waitlist", userLibraryController.getMyWaitlist);

// Phase 10 M3 — Saved Lists (titled collections of Resources).
router.get("/saved-lists", userLibraryController.getSavedLists);

router.post(
  "/saved-lists",
  validateRequest(createSavedListSchema),
  userLibraryController.createSavedList,
);

router.get(
  "/saved-lists/:listId",
  validateParams(savedListIdParamSchema),
  userLibraryController.getSavedListById,
);

router.patch(
  "/saved-lists/:listId",
  validateParams(savedListIdParamSchema),
  validateRequest(updateSavedListSchema),
  userLibraryController.updateSavedList,
);

router.delete(
  "/saved-lists/:listId",
  validateParams(savedListIdParamSchema),
  userLibraryController.deleteSavedList,
);

router.post(
  "/saved-lists/:listId/items/:resourceId",
  validateParams(savedListItemParamSchema),
  userLibraryController.addItemToSavedList,
);

router.delete(
  "/saved-lists/:listId/items/:resourceId",
  validateParams(savedListItemParamSchema),
  userLibraryController.removeItemFromSavedList,
);

export default router;

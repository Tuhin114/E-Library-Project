import { Router } from "express";
import * as userLibraryController from "../controllers/userLibraryController.js";
import { authenticate } from "../middleware/authenticate.js";
import { validateParams } from "../middleware/validateParams.js";
import { favoriteBookParamSchema } from "../validators/userLibraryValidator.js";
import { validateQuery } from "../middleware/validateQuery.js";
import { myRequestQuerySchema } from "../validators/physicalRequestValidator.js";
import { loanQuerySchema } from "../validators/loanValidator.js";
import { feeQuerySchema } from "../validators/feeValidator.js";

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

export default router;

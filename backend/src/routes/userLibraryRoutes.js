import { Router } from "express";
import * as userLibraryController from "../controllers/userLibraryController.js";
import { authenticate } from "../middleware/authenticate.js";
import { validateParams } from "../middleware/validateParams.js";
import { favoriteBookParamSchema } from "../validators/userLibraryValidator.js";

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

export default router;

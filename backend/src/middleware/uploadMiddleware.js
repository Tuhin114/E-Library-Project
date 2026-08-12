import multer from "multer";
import { ApiError } from "../utils/ApiError.js";
import {
  FILE_LIMITS,
  DIGITAL_FILE_TYPES,
} from "../constants/fileUploadLimits.js";

// Memory storage — files are buffered in RAM only long enough to stream
// straight to Cloudinary. Nothing ever touches local disk, and nothing is
// ever persisted to MongoDB except the resulting metadata.
const storage = multer.memoryStorage();

const buildMulterInstance = (type) => {
  const limits = FILE_LIMITS[type];
  if (!limits) {
    throw new Error(`Unknown upload type: ${type}`);
  }

  return multer({
    storage,
    limits: { fileSize: limits.maxSizeMB * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (!limits.allowedMimeTypes.includes(file.mimetype)) {
        return cb(
          new ApiError(
            400,
            `Invalid file type for ${type}. Allowed: ${limits.allowedMimeTypes.join(", ")}`,
          ),
        );
      }
      cb(null, true);
    },
  }).single("file");
};

/**
 * Static middleware for the cover-image upload route — type is fixed,
 * so the multer instance can be built once at module load.
 */
export const uploadCoverMiddleware = buildMulterInstance("cover");

/**
 * The PDF/EPUB upload route takes `:type` as a dynamic URL param, so the
 * correct multer instance (with the right mime/size rules) has to be
 * selected at request time rather than at module load.
 */
export const uploadDigitalFileMiddleware = (req, res, next) => {
  const { type } = req.params;

  if (!DIGITAL_FILE_TYPES.includes(type)) {
    return next(
      new ApiError(
        400,
        `Invalid file type. Must be one of: ${DIGITAL_FILE_TYPES.join(", ")}`,
      ),
    );
  }

  return buildMulterInstance(type)(req, res, next);
};

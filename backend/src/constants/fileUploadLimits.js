/**
 * Server-side source of truth for allowed file types and max sizes per
 * upload category. Mirrored on the frontend at
 * frontend/src/constants/fileUploadLimits.js for client-side pre-validation
 * — but this backend copy is the one that's actually enforced, since
 * client-side checks can always be bypassed.
 */
export const FILE_LIMITS = {
  cover: {
    maxSizeMB: 5,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    cloudinaryResourceType: "image",
    cloudinaryFolder: "e-library/covers",
  },
  pdf: {
    maxSizeMB: 50,
    allowedMimeTypes: ["application/pdf"],
    cloudinaryResourceType: "raw",
    cloudinaryFolder: "e-library/pdfs",
  },
  epub: {
    maxSizeMB: 50,
    allowedMimeTypes: ["application/epub+zip"],
    cloudinaryResourceType: "raw",
    cloudinaryFolder: "e-library/epubs",
  },
};

export const DIGITAL_FILE_TYPES = ["pdf", "epub"];

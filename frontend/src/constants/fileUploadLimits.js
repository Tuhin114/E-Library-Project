// FILE PATH: frontend/src/constants/fileUploadLimits.js
// STATUS: NEW FILE

/**
 * Mirrors backend/src/constants/fileUploadLimits.js for client-side
 * pre-validation (fast feedback before a request even goes out). The
 * backend copy is the one that's actually enforced.
 */
export const FILE_LIMITS = {
  cover: {
    maxSizeMB: 5,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    accept: ".jpg,.jpeg,.png,.webp",
  },
  pdf: {
    maxSizeMB: 50,
    allowedMimeTypes: ["application/pdf"],
    accept: ".pdf",
  },
  epub: {
    maxSizeMB: 50,
    allowedMimeTypes: ["application/epub+zip"],
    accept: ".epub",
  },
};

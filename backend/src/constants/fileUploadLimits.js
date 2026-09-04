/**
 * Server-side source of truth for allowed file types/sizes per upload
 * category. Mirrored on the frontend for pre-validation; this copy is
 * the one actually enforced.
 */
export const FILE_LIMITS = {
  cover: {
    maxSizeMB: 5,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    cloudinaryResourceType: "image",
    cloudinaryFolder: "e-library/covers",
  },
  avatar: {
    maxSizeMB: 2,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    cloudinaryResourceType: "image",
    cloudinaryFolder: "e-library/avatars",
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
  // Phase 10 M1 — e-journals, research papers and notes. PDF-only for
  // now; kept as its own entry (not aliased to `pdf`) so it gets its
  // own Cloudinary folder.
  resource: {
    maxSizeMB: 50,
    allowedMimeTypes: ["application/pdf"],
    cloudinaryResourceType: "raw",
    cloudinaryFolder: "e-library/resources",
  },
};

export const DIGITAL_FILE_TYPES = ["pdf", "epub"];

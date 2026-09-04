/**
 * Strips the raw Cloudinary url/publicId from a resource's file before
 * it reaches any client-facing response, same reasoning as
 * sanitizeBook.js: those two fields are enough to fetch the file
 * directly, forever, bypassing auth and the private/public check
 * resourceService enforces on the read path.
 */
const sanitizeFile = (file) =>
  file?.url
    ? {
        available: true,
        format: file.format,
        sizeBytes: file.sizeBytes,
        originalName: file.originalName,
        uploadedAt: file.uploadedAt,
      }
    : { available: false };

export const serializeResource = (resourceDoc) => {
  const resource =
    typeof resourceDoc.toObject === "function"
      ? resourceDoc.toObject()
      : resourceDoc;

  return {
    ...resource,
    file: sanitizeFile(resource.file),
  };
};

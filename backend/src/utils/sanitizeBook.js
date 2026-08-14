/**
 * Strips raw Cloudinary url/publicId from a book's digitalFiles before
 * it reaches any client-facing response. Those two fields are enough
 * to fetch the file directly, forever, bypassing auth and the
 * download/visibility restrictions enforced in bookService.getFileStream
 * (Milestone 3) — so no response that embeds a Book, whether fetched
 * directly or populated through another resource, should ever include
 * them.
 */
const sanitizeDigitalFile = (file) =>
  file?.url
    ? {
        available: true,
        format: file.format,
        sizeBytes: file.sizeBytes,
        originalName: file.originalName,
        uploadedAt: file.uploadedAt,
      }
    : { available: false };

export const serializeBook = (bookDoc) => {
  const book =
    typeof bookDoc.toObject === "function" ? bookDoc.toObject() : bookDoc;

  return {
    ...book,
    digitalFiles: {
      pdf: sanitizeDigitalFile(book.digitalFiles?.pdf),
      epub: sanitizeDigitalFile(book.digitalFiles?.epub),
    },
  };
};

import cloudinary from "../config/cloudinary.js";
import { ApiError } from "./ApiError.js";

/**
 * Streams an in-memory file buffer (from multer's memoryStorage) directly
 * to Cloudinary — no temp file ever written to disk.
 */
export const uploadBuffer = (
  buffer,
  { folder, resourceType = "auto", publicId },
) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType, public_id: publicId },
      (error, result) => {
        if (error) {
          reject(
            new ApiError(
              502,
              "File upload to storage failed. Please try again.",
            ),
          );
          return;
        }
        resolve(result);
      },
    );
    uploadStream.end(buffer);
  });
};

/**
 * Deletes a previously uploaded asset by its Cloudinary public_id.
 * Failures are logged and swallowed rather than thrown — a storage cleanup
 * failure (e.g. replacing a file, or deleting a book) shouldn't block the
 * primary database operation that triggered it.
 */
export const deleteAsset = async (publicId, resourceType = "image") => {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      `Failed to delete Cloudinary asset "${publicId}":`,
      error.message,
    );
  }
};

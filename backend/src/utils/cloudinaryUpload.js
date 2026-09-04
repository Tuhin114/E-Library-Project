import cloudinary from "../config/cloudinary.js";
import { ApiError } from "./ApiError.js";

/**
 * Upload an in-memory buffer directly to Cloudinary.
 *
 * Images:
 *   upload_stream()
 *
 * PDF / EPUB:
 *   upload_chunked_stream()
 *
 * Chunked upload is more reliable for larger raw files.
 */
export const uploadBuffer = (
  buffer,
  { folder, resourceType = "auto", publicId },
) => {
  return new Promise((resolve, reject) => {
    if (!Buffer.isBuffer(buffer)) {
      reject(new ApiError(400, "Invalid file buffer"));
      return;
    }

    if (buffer.length === 0) {
      reject(new ApiError(400, "Cannot upload an empty file"));
      return;
    }

    const uploadOptions = {
      folder,
      resource_type: resourceType,
      public_id: publicId,

      /*
       * Cloudinary will process the upload asynchronously in chunks.
       * 6 MB is a safe chunk size and is within Cloudinary's supported
       * chunked-upload range.
       */
      ...(resourceType === "raw" && {
        chunk_size: 6 * 1024 * 1024,
      }),
    };

    const handleResult = (error, result) => {
      if (error) {
        /*
         * IMPORTANT:
         * Do not hide Cloudinary's actual error anymore.
         *
         * This will make errors such as:
         * - invalid credentials
         * - upload timeout
         * - file too large
         * - invalid resource type
         * - connection errors
         *
         * visible in the backend log.
         */
        console.error("[cloudinary] Upload failed:", {
          message: error.message,
          http_code: error.http_code,
          name: error.name,
          resourceType,
          folder,
          publicId,
          fileSizeBytes: buffer.length,
        });

        reject(
          new ApiError(
            error.http_code || 502,
            `File upload to storage failed: ${
              error.message || "Unknown Cloudinary error"
            }`,
          ),
        );

        return;
      }

      if (!result) {
        reject(new ApiError(502, "Cloudinary returned an empty upload result"));
        return;
      }

      resolve(result);
    };

    let uploadStream;

    try {
      /*
       * PDF and EPUB are stored as Cloudinary `raw` resources.
       *
       * Use chunked streaming for those files because they can be
       * significantly larger than cover images.
       */
      if (resourceType === "raw") {
        uploadStream = cloudinary.uploader.upload_chunked_stream(
          uploadOptions,
          handleResult,
        );
      } else {
        uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          handleResult,
        );
      }
    } catch (error) {
      reject(
        new ApiError(
          error.http_code || 502,
          `File upload to storage failed: ${
            error.message || "Unable to initialize Cloudinary upload"
          }`,
        ),
      );

      return;
    }

    uploadStream.on?.("error", (error) => {
      /*
       * The callback above normally receives Cloudinary errors,
       * but stream-level errors can happen before that callback.
       */
      console.error("[cloudinary] Upload stream error:", error);
    });

    /*
     * Send the complete validated buffer into Cloudinary.
     *
     * No temporary file is written to disk.
     */
    uploadStream.end(buffer);
  });
};

/**
 * Deletes a previously uploaded Cloudinary asset.
 *
 * Cleanup failures are intentionally swallowed because deleting
 * an old asset should never make an otherwise successful database
 * operation fail.
 */
export const deleteAsset = async (publicId, resourceType = "image") => {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  } catch (error) {
    console.error(
      `Failed to delete Cloudinary asset "${publicId}":`,
      error.message,
    );
  }
};

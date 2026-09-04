import axios from "axios";
import Book from "../models/Book.js";
import Category from "../models/Category.js";
import Author from "../models/Author.js";
import Publisher from "../models/Publisher.js";
import Favorite from "../models/Favorite.js";
import RecentlyViewed from "../models/RecentlyViewed.js";
import { deleteCopiesForBook } from "./bookCopyService.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadBuffer, deleteAsset } from "../utils/cloudinaryUpload.js";
import { serializeBook } from "../utils/sanitizeBook.js";
import {
  FILE_LIMITS,
  DIGITAL_FILE_TYPES,
} from "../constants/fileUploadLimits.js";
import { BOOK_STATUS } from "../constants/bookStatus.js";
import { BOOK_VISIBILITY } from "../constants/bookVisibility.js";
import { ROLES } from "../constants/roles.js";
import {
  buildBookExactFilters,
  buildBookSearchRegex,
  buildBookSort,
} from "../utils/buildBookQuery.js";
import { getPaginationParams, buildPaginationMeta } from "../utils/paginate.js";
import { fetchRemoteFile } from "../utils/remoteFileFetcher.js";

const assertReferencesExist = async ({ category, authors, publisher }) => {
  const checks = [];

  if (category) {
    checks.push(
      Category.exists({ _id: category }).then((exists) => {
        if (!exists)
          throw new ApiError(404, "Selected category does not exist");
      }),
    );
  }

  if (publisher) {
    checks.push(
      Publisher.exists({ _id: publisher }).then((exists) => {
        if (!exists)
          throw new ApiError(404, "Selected publisher does not exist");
      }),
    );
  }

  if (authors && authors.length > 0) {
    checks.push(
      Author.countDocuments({ _id: { $in: authors } }).then((count) => {
        if (count !== authors.length) {
          throw new ApiError(404, "One or more selected authors do not exist");
        }
      }),
    );
  }

  await Promise.all(checks);
};

const BOOK_POPULATE = [
  { path: "category", select: "name slug" },
  { path: "authors", select: "name slug" },
  { path: "publisher", select: "name slug" },
  { path: "uploadedBy", select: "name email" },
];

// A non-librarian can only ever read published books — used both for
// direct-by-id fetches and for the file-streaming path below, so the
// rule lives in exactly one place.
const assertBookReadable = (book, user) => {
  if (user.role !== ROLES.LIBRARIAN && book.status !== BOOK_STATUS.PUBLISHED) {
    throw new ApiError(404, "Book not found");
  }
};

export const createBook = async (payload, userId) => {
  const existingIsbn = await Book.findOne({ isbn: payload.isbn.trim() });
  if (existingIsbn) {
    throw new ApiError(409, "A book with this ISBN already exists");
  }

  await assertReferencesExist(payload);

  const book = await Book.create({
    ...payload,
    isbn: payload.isbn.trim(),
    uploadedBy: userId,
  });

  return serializeBook(await book.populate(BOOK_POPULATE));
};

export const listBooks = async (query, user) => {
  const filter = buildBookExactFilters(query);

  // Non-librarians only ever see published books — overrides whatever
  // status the client asked for, since draft/archived books shouldn't
  // be discoverable outside catalog management.
  if (user.role !== ROLES.LIBRARIAN) {
    filter.status = BOOK_STATUS.PUBLISHED;
  }

  const sort = buildBookSort(query.sort);
  const { page, limit, skip } = getPaginationParams(query);

  const searchTerm = query.search?.trim();

  if (searchTerm) {
    const regex = buildBookSearchRegex(searchTerm);

    const [matchingAuthorIds, matchingCategoryIds, matchingPublisherIds] =
      await Promise.all([
        Author.find({ name: regex }).distinct("_id"),
        Category.find({ name: regex }).distinct("_id"),
        Publisher.find({ name: regex }).distinct("_id"),
      ]);

    filter.$or = [
      { title: regex },
      { subtitle: regex },
      { isbn: regex },
      { tags: regex },
      ...(matchingAuthorIds.length
        ? [{ authors: { $in: matchingAuthorIds } }]
        : []),
      ...(matchingCategoryIds.length
        ? [{ category: { $in: matchingCategoryIds } }]
        : []),
      ...(matchingPublisherIds.length
        ? [{ publisher: { $in: matchingPublisherIds } }]
        : []),
    ];
  }

  const [books, totalItems] = await Promise.all([
    Book.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(BOOK_POPULATE)
      .lean(),
    Book.countDocuments(filter),
  ]);

  return {
    books: books.map(serializeBook),
    pagination: buildPaginationMeta({ page, limit, totalItems }),
  };
};

export const getBookById = async (id, user) => {
  const book = await Book.findById(id).populate(BOOK_POPULATE).lean();
  if (!book) throw new ApiError(404, "Book not found");

  assertBookReadable(book, user);

  return serializeBook(book);
};

export const updateBook = async (id, payload) => {
  const book = await Book.findById(id);
  if (!book) throw new ApiError(404, "Book not found");

  if (payload.isbn && payload.isbn.trim() !== book.isbn) {
    const existingIsbn = await Book.findOne({
      isbn: payload.isbn.trim(),
      _id: { $ne: id },
    });
    if (existingIsbn)
      throw new ApiError(409, "A book with this ISBN already exists");
  }

  await assertReferencesExist(payload);

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined) {
      book[key] = key === "isbn" ? value.trim() : value;
    }
  });

  await book.save();
  return serializeBook(await book.populate(BOOK_POPULATE));
};

export const deleteBook = async (id) => {
  const book = await Book.findById(id);
  if (!book) throw new ApiError(404, "Book not found");

  // Runs first and throws before any other cleanup starts if a copy is
  // currently issued/reserved — avoids deleting the book out from under
  // a physical loan that isn't reflected anywhere else in the app yet.
  await deleteCopiesForBook(id);

  const cleanupTasks = [];
  if (book.coverImage?.publicId) {
    cleanupTasks.push(
      deleteAsset(
        book.coverImage.publicId,
        FILE_LIMITS.cover.cloudinaryResourceType,
      ),
    );
  }
  if (book.digitalFiles?.pdf?.publicId) {
    cleanupTasks.push(
      deleteAsset(
        book.digitalFiles.pdf.publicId,
        FILE_LIMITS.pdf.cloudinaryResourceType,
      ),
    );
  }
  if (book.digitalFiles?.epub?.publicId) {
    cleanupTasks.push(
      deleteAsset(
        book.digitalFiles.epub.publicId,
        FILE_LIMITS.epub.cloudinaryResourceType,
      ),
    );
  }
  cleanupTasks.push(Favorite.deleteMany({ book: id }));
  cleanupTasks.push(RecentlyViewed.deleteMany({ book: id }));

  await Promise.all(cleanupTasks);

  await book.deleteOne();
};

const isValidEpubBuffer = (buffer) => {
  if (buffer.length < 30) return false;
  if (
    buffer[0] !== 0x50 ||
    buffer[1] !== 0x4b ||
    buffer[2] !== 0x03 ||
    buffer[3] !== 0x04
  )
    return false;

  // EPUB requires an uncompressed `mimetype` file as the first ZIP entry.
  const filenameLength = buffer.readUInt16LE(26);
  const extraLength = buffer.readUInt16LE(28);
  const filename = buffer.subarray(30, 30 + filenameLength).toString("utf8");
  if (filename !== "mimetype") return false;

  const dataStart = 30 + filenameLength + extraLength;
  const compressedSize = buffer.readUInt32LE(18);
  const uncompressedSize = buffer.readUInt32LE(22);
  if (compressedSize !== 20 || uncompressedSize !== 20) return false;
  if (dataStart + 20 > buffer.length) return false;

  return (
    buffer.subarray(dataStart, dataStart + 20).toString("utf8") ===
    "application/epub+zip"
  );
};

const detectBufferFileType = (buffer) => {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  )
    return "cover";
  if (
    buffer.length >= 8 &&
    buffer
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  )
    return "cover";
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  )
    return "cover";
  if (buffer.length >= 5 && buffer.subarray(0, 5).toString("ascii") === "%PDF-")
    return "pdf";
  if (isValidEpubBuffer(buffer)) return "epub";
  return "unknown";
};

const ensureExtension = (filename, type) => {
  const fallback = type === "cover" ? "cover-image" : `book.${type}`;
  const safe = String(filename || fallback)
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 180);
  if (type === "cover") return safe;
  return /\.(pdf|epub)$/i.test(safe) ? safe : `${safe}.${type}`;
};

const replaceStoredFile = async (book, type, file) => {
  const limits = FILE_LIMITS[type];

  if (!limits) {
    throw new ApiError(400, `Unsupported file type: ${type}`);
  }

  /*
   * IMPORTANT:
   * Older Book documents may not have digitalFiles populated.
   *
   * Mongoose schema defaults only apply when creating documents;
   * they do not magically repair old documents where the field is
   * missing.
   */
  if (!book.digitalFiles) {
    book.digitalFiles = {};
  }

  /*
   * Make sure the requested nested file object exists too.
   */
  if (!book.digitalFiles[type]) {
    book.digitalFiles[type] = {};
  }

  const existing = type === "cover" ? book.coverImage : book.digitalFiles[type];

  /*
   * ---------------------------------------------------------------
   * STEP 1 — Upload the NEW file first
   * ---------------------------------------------------------------
   *
   * Never delete the existing Cloudinary asset before the new
   * upload and database update succeed.
   */
  let result;

  try {
    result = await uploadBuffer(file.buffer, {
      folder: limits.cloudinaryFolder,
      resourceType: limits.cloudinaryResourceType,
      publicId: `book-${book._id}-${type}-${Date.now()}`,
    });
  } catch (error) {
    throw error;
  }

  const metadata = {
    url: result.secure_url,
    publicId: result.public_id,
    format: result.format,
    sizeBytes: result.bytes,
    originalName: file.originalname,
    uploadedAt: new Date(),
  };

  /*
   * ---------------------------------------------------------------
   * STEP 2 — Update MongoDB
   * ---------------------------------------------------------------
   */
  try {
    if (type === "cover") {
      book.coverImage = metadata;
    } else {
      /*
       * digitalFiles is guaranteed to exist above.
       */
      book.digitalFiles[type] = metadata;
    }

    await book.save();
  } catch (error) {
    /*
     * MongoDB failed after Cloudinary upload.
     *
     * Delete the NEW Cloudinary asset so it doesn't become an
     * orphaned file.
     */
    try {
      await deleteAsset(result.public_id, limits.cloudinaryResourceType);
    } catch (cleanupError) {
      console.error(
        `[bookService] Failed to clean up new ${type} asset after database failure:`,
        cleanupError.message,
      );
    }

    throw error;
  }

  /*
   * ---------------------------------------------------------------
   * STEP 3 — Delete OLD Cloudinary asset
   * ---------------------------------------------------------------
   *
   * Only do this AFTER MongoDB successfully points to the new file.
   */
  if (existing?.publicId && existing.publicId !== result.public_id) {
    try {
      await deleteAsset(existing.publicId, limits.cloudinaryResourceType);
    } catch (error) {
      /*
       * The replacement itself succeeded.
       *
       * Don't turn a successful upload into a failed API request
       * simply because cleanup of the old Cloudinary asset failed.
       */
      console.error(
        `[bookService] Failed to delete previous ${type} asset:`,
        error.message,
      );
    }
  }

  return serializeBook(await book.populate(BOOK_POPULATE));
};

export const uploadCoverImage = async (bookId, file) => {
  const book = await Book.findById(bookId);
  if (!book) throw new ApiError(404, "Book not found");

  /*
   * Upload the replacement FIRST.
   *
   * This is important:
   * if Cloudinary upload fails, the existing cover remains untouched.
   */
  const result = await uploadBuffer(file.buffer, {
    folder: FILE_LIMITS.cover.cloudinaryFolder,
    resourceType: FILE_LIMITS.cover.cloudinaryResourceType,
    publicId: `book-${bookId}-cover-${Date.now()}`,
  });

  const previousPublicId = book.coverImage?.publicId;

  book.coverImage = {
    url: result.secure_url,
    publicId: result.public_id,
    format: result.format,
    sizeBytes: result.bytes,
    originalName: file.originalname,
    uploadedAt: new Date(),
  };

  try {
    await book.save();
  } catch (error) {
    /*
     * MongoDB save failed after Cloudinary upload.
     *
     * Remove the newly uploaded asset so we don't leave
     * an orphaned Cloudinary file.
     */
    try {
      await deleteAsset(
        result.public_id,
        FILE_LIMITS.cover.cloudinaryResourceType,
      );
    } catch (cleanupError) {
      console.error(
        "Failed to clean up replacement cover after database failure:",
        cleanupError.message,
      );
    }

    throw error;
  }

  /*
   * Delete the OLD asset only after the database successfully
   * points to the new one.
   */
  if (previousPublicId) {
    try {
      await deleteAsset(
        previousPublicId,
        FILE_LIMITS.cover.cloudinaryResourceType,
      );
    } catch (error) {
      /*
       * Do not fail the request here.
       *
       * The database already references the new file, so the old
       * Cloudinary asset is only an orphan that can be cleaned up later.
       */
      console.error(
        "Failed to delete previous cover from Cloudinary:",
        error.message,
      );
    }
  }

  return serializeBook(await book.populate(BOOK_POPULATE));
};

export const deleteCoverImage = async (bookId) => {
  const book = await Book.findById(bookId);
  if (!book) throw new ApiError(404, "Book not found");

  const existingPublicId = book.coverImage?.publicId;

  /*
   * Remove the database reference first.
   *
   * If Cloudinary deletion fails, the database will no longer expose
   * the deleted/removed cover as the active cover.
   */
  book.coverImage = {};
  await book.save();

  if (existingPublicId) {
    try {
      await deleteAsset(
        existingPublicId,
        FILE_LIMITS.cover.cloudinaryResourceType,
      );
    } catch (error) {
      console.error("Failed to delete cover from Cloudinary:", error.message);
    }
  }

  return serializeBook(await book.populate(BOOK_POPULATE));
};

export const uploadDigitalFile = async (bookId, type, file) => {
  /*
   * Validate the type here as well.
   *
   * The route should already validate it, but the service should
   * not rely exclusively on route-level validation.
   */
  if (!DIGITAL_FILE_TYPES.includes(type)) {
    throw new ApiError(400, "Unsupported digital file type");
  }

  const book = await Book.findById(bookId);
  if (!book) {
    throw new ApiError(404, "Book not found");
  }

  /*
   * Older Book documents may not have digitalFiles at all.
   *
   * Initialize it before accessing digitalFiles[type].
   */
  if (!book.digitalFiles) {
    book.digitalFiles = {
      pdf: {},
      epub: {},
    };
  }

  /*
   * It is also possible for an older document to have digitalFiles
   * but only one of the nested fields.
   */
  if (!book.digitalFiles.pdf) {
    book.digitalFiles.pdf = {};
  }

  if (!book.digitalFiles.epub) {
    book.digitalFiles.epub = {};
  }

  const existing = book.digitalFiles[type];

  /*
   * Upload the replacement BEFORE deleting the existing asset.
   *
   * This prevents a failed remote URL upload / Cloudinary upload
   * from destroying the current PDF/EPUB.
   */
  const result = await uploadBuffer(file.buffer, {
    folder: FILE_LIMITS[type].cloudinaryFolder,

    resourceType: FILE_LIMITS[type].cloudinaryResourceType,

    publicId: `book-${bookId}-${type}-${Date.now()}`,
  });

  const previousPublicId = existing?.publicId;

  book.digitalFiles[type] = {
    url: result.secure_url,
    publicId: result.public_id,
    format: result.format,
    sizeBytes: result.bytes,
    originalName: file.originalname,
    uploadedAt: new Date(),
  };

  try {
    await book.save();
  } catch (error) {
    /*
     * Database failed after Cloudinary upload.
     *
     * Delete the NEW asset to prevent an orphan.
     */
    try {
      await deleteAsset(
        result.public_id,
        FILE_LIMITS[type].cloudinaryResourceType,
      );
    } catch (cleanupError) {
      console.error(
        `Failed to clean up replacement ${type} after database failure:`,
        cleanupError.message,
      );
    }

    throw error;
  }

  /*
   * Delete the previous file only after the database has successfully
   * switched to the new file.
   */
  if (previousPublicId) {
    try {
      await deleteAsset(
        previousPublicId,
        FILE_LIMITS[type].cloudinaryResourceType,
      );
    } catch (error) {
      /*
       * Don't fail the upload because the old Cloudinary asset
       * could not be deleted.
       */
      console.error(
        `Failed to delete previous ${type} from Cloudinary:`,
        error.message,
      );
    }
  }

  return serializeBook(await book.populate(BOOK_POPULATE));
};

export const importFileFromUrl = async (bookId, type, url) => {
  if (type !== "cover" && !DIGITAL_FILE_TYPES.includes(type)) {
    throw new ApiError(400, `Invalid file type: ${type}`);
  }

  const book = await Book.findById(bookId);

  if (!book) {
    throw new ApiError(404, "Book not found");
  }

  /*
   * Remote URL is downloaded by the backend.
   *
   * remoteFileFetcher performs:
   * - HTTP/HTTPS validation
   * - DNS resolution
   * - private IP blocking
   * - redirect validation
   * - timeout
   * - maximum-size enforcement
   */
  const remoteFile = await fetchRemoteFile({
    url,
    type,
  });

  const limits = FILE_LIMITS[type];

  /*
   * Verify the actual bytes instead of trusting:
   * - URL extension
   * - Content-Type
   * - user input
   */
  const detectedType = detectBufferFileType(remoteFile.buffer);

  if (detectedType !== type) {
    throw new ApiError(
      400,
      `The downloaded file is not a valid ${type.toUpperCase()} file`,
    );
  }

  const originalName = ensureExtension(remoteFile.originalName, type);

  return replaceStoredFile(book, type, {
    buffer: remoteFile.buffer,

    originalname: originalName,

    mimetype: limits.allowedMimeTypes[0],

    size: remoteFile.buffer.length,
  });
};

export const deleteDigitalFile = async (bookId, type) => {
  if (!DIGITAL_FILE_TYPES.includes(type)) {
    throw new ApiError(400, "Invalid file type. Must be one of: pdf, epub");
  }

  const book = await Book.findById(bookId);

  if (!book) {
    throw new ApiError(404, "Book not found");
  }

  /*
   * Older documents may not have digitalFiles.
   *
   * There is nothing to delete in that case.
   */
  if (!book.digitalFiles) {
    book.digitalFiles = {};
    await book.save();

    return serializeBook(await book.populate(BOOK_POPULATE));
  }

  const existing = book.digitalFiles[type];

  /*
   * Nothing uploaded for this file type.
   */
  if (!existing?.publicId) {
    book.digitalFiles[type] = {};

    await book.save();

    return serializeBook(await book.populate(BOOK_POPULATE));
  }

  const existingPublicId = existing.publicId;

  /*
   * Remove the database reference first.
   */
  book.digitalFiles[type] = {};

  await book.save();

  /*
   * Then clean up Cloudinary.
   *
   * If Cloudinary cleanup fails, the database is still in the
   * correct state and the old asset is merely an orphan that
   * can be cleaned up separately.
   */
  try {
    await deleteAsset(
      existingPublicId,
      FILE_LIMITS[type].cloudinaryResourceType,
    );
  } catch (error) {
    console.error(
      `[bookService] Failed to delete ${type} asset from Cloudinary:`,
      error.message,
    );
  }

  return serializeBook(await book.populate(BOOK_POPULATE));
};

// Streams a digital file through the backend instead of ever handing
// the client a direct Cloudinary URL. Download requests against a
// restricted-visibility book are blocked for non-librarians — read
// access still goes through (inline), only the "keep a copy" path is
// gated.
export const getFileStream = async (
  bookId,
  type,
  user,
  { download = false } = {},
) => {
  if (!DIGITAL_FILE_TYPES.includes(type)) {
    throw new ApiError(400, "Invalid file type");
  }

  const book = await Book.findById(bookId).lean();
  if (!book) throw new ApiError(404, "Book not found");

  assertBookReadable(book, user);

  const fileMeta = book.digitalFiles?.[type];
  if (!fileMeta?.url) {
    throw new ApiError(
      404,
      `No ${type.toUpperCase()} file available for this book`,
    );
  }

  if (
    download &&
    book.visibility === BOOK_VISIBILITY.RESTRICTED &&
    user.role !== ROLES.LIBRARIAN
  ) {
    throw new ApiError(
      403,
      "Downloading this title is restricted. You can read it online instead.",
    );
  }

  let response;
  try {
    response = await axios.get(fileMeta.url, { responseType: "stream" });
  } catch (error) {
    throw new ApiError(502, "Failed to retrieve the file. Please try again.");
  }

  return {
    stream: response.data,
    contentType: FILE_LIMITS[type].allowedMimeTypes[0],
    contentLength: response.headers["content-length"],
    filename: fileMeta.originalName || `${book.title}.${type}`,
  };
};

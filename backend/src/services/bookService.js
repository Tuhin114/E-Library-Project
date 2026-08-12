import Book from "../models/Book.js";
import Category from "../models/Category.js";
import Author from "../models/Author.js";
import Publisher from "../models/Publisher.js";
import Favorite from "../models/Favorite.js";
import RecentlyViewed from "../models/RecentlyViewed.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadBuffer, deleteAsset } from "../utils/cloudinaryUpload.js";
import { FILE_LIMITS } from "../constants/fileUploadLimits.js";
import {
  buildBookExactFilters,
  buildBookSearchRegex,
  buildBookSort,
} from "../utils/buildBookQuery.js";
import { getPaginationParams, buildPaginationMeta } from "../utils/paginate.js";

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

  return book.populate(BOOK_POPULATE);
};

export const listBooks = async (query) => {
  const filter = buildBookExactFilters(query);
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
    books,
    pagination: buildPaginationMeta({ page, limit, totalItems }),
  };
};

export const getBookById = async (id) => {
  const book = await Book.findById(id).populate(BOOK_POPULATE).lean();
  if (!book) throw new ApiError(404, "Book not found");
  return book;
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
  return book.populate(BOOK_POPULATE);
};

export const deleteBook = async (id) => {
  const book = await Book.findById(id);
  if (!book) throw new ApiError(404, "Book not found");

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
  // Referential cleanup — a deleted book should disappear from every
  // user's favorites and recently-viewed history, not linger as a
  // dangling reference that populate() silently drops.
  cleanupTasks.push(Favorite.deleteMany({ book: id }));
  cleanupTasks.push(RecentlyViewed.deleteMany({ book: id }));

  await Promise.all(cleanupTasks);

  await book.deleteOne();
};

export const uploadCoverImage = async (bookId, file) => {
  const book = await Book.findById(bookId);
  if (!book) throw new ApiError(404, "Book not found");

  if (book.coverImage?.publicId) {
    await deleteAsset(
      book.coverImage.publicId,
      FILE_LIMITS.cover.cloudinaryResourceType,
    );
  }

  const result = await uploadBuffer(file.buffer, {
    folder: FILE_LIMITS.cover.cloudinaryFolder,
    resourceType: FILE_LIMITS.cover.cloudinaryResourceType,
    publicId: `book-${bookId}-cover-${Date.now()}`,
  });

  book.coverImage = {
    url: result.secure_url,
    publicId: result.public_id,
    format: result.format,
    sizeBytes: result.bytes,
    originalName: file.originalname,
    uploadedAt: new Date(),
  };

  await book.save();
  return book.populate(BOOK_POPULATE);
};

export const deleteCoverImage = async (bookId) => {
  const book = await Book.findById(bookId);
  if (!book) throw new ApiError(404, "Book not found");

  if (book.coverImage?.publicId) {
    await deleteAsset(
      book.coverImage.publicId,
      FILE_LIMITS.cover.cloudinaryResourceType,
    );
  }

  book.coverImage = {};
  await book.save();
  return book.populate(BOOK_POPULATE);
};

export const uploadDigitalFile = async (bookId, type, file) => {
  const book = await Book.findById(bookId);
  if (!book) throw new ApiError(404, "Book not found");

  const existing = book.digitalFiles?.[type];
  if (existing?.publicId) {
    await deleteAsset(
      existing.publicId,
      FILE_LIMITS[type].cloudinaryResourceType,
    );
  }

  const result = await uploadBuffer(file.buffer, {
    folder: FILE_LIMITS[type].cloudinaryFolder,
    resourceType: FILE_LIMITS[type].cloudinaryResourceType,
    publicId: `book-${bookId}-${type}-${Date.now()}`,
  });

  book.digitalFiles[type] = {
    url: result.secure_url,
    publicId: result.public_id,
    format: result.format,
    sizeBytes: result.bytes,
    originalName: file.originalname,
    uploadedAt: new Date(),
  };

  await book.save();
  return book.populate(BOOK_POPULATE);
};

export const deleteDigitalFile = async (bookId, type) => {
  const book = await Book.findById(bookId);
  if (!book) throw new ApiError(404, "Book not found");

  const existing = book.digitalFiles?.[type];
  if (existing?.publicId) {
    await deleteAsset(
      existing.publicId,
      FILE_LIMITS[type].cloudinaryResourceType,
    );
  }

  book.digitalFiles[type] = {};
  await book.save();
  return book.populate(BOOK_POPULATE);
};

import mongoose from "mongoose";
import Author from "../models/Author.js";
import { ApiError } from "../utils/ApiError.js";
import { generateSlug, appendSlugSuffix } from "../utils/slugify.js";

const buildUniqueSlug = async (name) => {
  const baseSlug = generateSlug(name);
  let slug = baseSlug;
  let attempt = 0;

  while (await Author.exists({ slug })) {
    attempt += 1;
    if (attempt > 5) {
      throw new ApiError(
        500,
        "Could not generate a unique slug, please try again",
      );
    }
    slug = appendSlugSuffix(baseSlug);
  }

  return slug;
};

const BOOK_COUNT_STAGES = [
  {
    $lookup: {
      from: "books",
      localField: "_id",
      foreignField: "authors",
      as: "_books",
    },
  },
  { $addFields: { bookCount: { $size: "$_books" } } },
  { $project: { _books: 0 } },
];

export const createAuthor = async (payload, userId) => {
  const slug = await buildUniqueSlug(payload.name);

  return Author.create({
    name: payload.name.trim(),
    bio: payload.bio?.trim() || "",
    nationality: payload.nationality?.trim() || "",
    birthDate: payload.birthDate || null,
    slug,
    createdBy: userId,
  });
};

export const getAuthors = async () => {
  return Author.aggregate([{ $sort: { name: 1 } }, ...BOOK_COUNT_STAGES]);
};

export const getAuthorById = async (id) => {
  const [author] = await Author.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    ...BOOK_COUNT_STAGES,
  ]);
  if (!author) throw new ApiError(404, "Author not found");
  return author;
};

export const getAuthorBySlug = async (slug) => {
  const [author] = await Author.aggregate([
    { $match: { slug } },
    ...BOOK_COUNT_STAGES,
  ]);
  if (!author) throw new ApiError(404, "Author not found");
  return author;
};

export const updateAuthor = async (id, payload) => {
  const author = await Author.findById(id);
  if (!author) throw new ApiError(404, "Author not found");

  if (payload.name && payload.name.trim() !== author.name) {
    author.name = payload.name.trim();
    author.slug = await buildUniqueSlug(payload.name);
  }
  if (payload.bio !== undefined) author.bio = payload.bio.trim();
  if (payload.nationality !== undefined)
    author.nationality = payload.nationality.trim();
  if (payload.birthDate !== undefined) author.birthDate = payload.birthDate;

  await author.save();
  return author;
};

export const deleteAuthor = async (id) => {
  const author = await Author.findById(id);
  if (!author) throw new ApiError(404, "Author not found");

  await author.deleteOne();
};

import mongoose from "mongoose";
import Category from "../models/Category.js";
import { ApiError } from "../utils/ApiError.js";
import { generateSlug, appendSlugSuffix } from "../utils/slugify.js";

const buildUniqueSlug = async (name) => {
  const baseSlug = generateSlug(name);
  let slug = baseSlug;
  let attempt = 0;

  while (await Category.exists({ slug })) {
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

// Reused by every read query below — one $lookup against Book, keyed on
// Category._id, plus $addFields to turn the joined array into a count and
// $project to drop the (potentially large) joined array itself from the
// response.
const BOOK_COUNT_STAGES = [
  {
    $lookup: {
      from: "books",
      localField: "_id",
      foreignField: "category",
      as: "_books",
    },
  },
  { $addFields: { bookCount: { $size: "$_books" } } },
  { $project: { _books: 0 } },
];

export const createCategory = async ({ name, description }, userId) => {
  const existing = await Category.findOne({ name: name.trim() });
  if (existing) {
    throw new ApiError(409, "A category with this name already exists");
  }

  const slug = await buildUniqueSlug(name);

  return Category.create({
    name: name.trim(),
    description: description?.trim() || "",
    slug,
    createdBy: userId,
  });
};

export const getCategories = async () => {
  return Category.aggregate([{ $sort: { name: 1 } }, ...BOOK_COUNT_STAGES]);
};

export const getCategoryById = async (id) => {
  const [category] = await Category.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    ...BOOK_COUNT_STAGES,
  ]);
  if (!category) throw new ApiError(404, "Category not found");
  return category;
};

export const getCategoryBySlug = async (slug) => {
  const [category] = await Category.aggregate([
    { $match: { slug } },
    ...BOOK_COUNT_STAGES,
  ]);
  if (!category) throw new ApiError(404, "Category not found");
  return category;
};

export const updateCategory = async (id, { name, description }) => {
  const category = await Category.findById(id);
  if (!category) throw new ApiError(404, "Category not found");

  if (name && name.trim() !== category.name) {
    const existing = await Category.findOne({
      name: name.trim(),
      _id: { $ne: id },
    });
    if (existing)
      throw new ApiError(409, "A category with this name already exists");
    category.name = name.trim();
    category.slug = await buildUniqueSlug(name);
  }

  if (description !== undefined) {
    category.description = description.trim();
  }

  await category.save();
  return category;
};

export const deleteCategory = async (id) => {
  const category = await Category.findById(id);
  if (!category) throw new ApiError(404, "Category not found");

  await category.deleteOne();
};

import mongoose from "mongoose";
import Publisher from "../models/Publisher.js";
import { ApiError } from "../utils/ApiError.js";
import { generateSlug, appendSlugSuffix } from "../utils/slugify.js";

const buildUniqueSlug = async (name) => {
  const baseSlug = generateSlug(name);
  let slug = baseSlug;
  let attempt = 0;

  while (await Publisher.exists({ slug })) {
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
      foreignField: "publisher",
      as: "_books",
    },
  },
  { $addFields: { bookCount: { $size: "$_books" } } },
  { $project: { _books: 0 } },
];

export const createPublisher = async (payload, userId) => {
  const existing = await Publisher.findOne({ name: payload.name.trim() });
  if (existing)
    throw new ApiError(409, "A publisher with this name already exists");

  const slug = await buildUniqueSlug(payload.name);

  return Publisher.create({
    name: payload.name.trim(),
    description: payload.description?.trim() || "",
    website: payload.website?.trim() || "",
    country: payload.country?.trim() || "",
    slug,
    createdBy: userId,
  });
};

export const getPublishers = async () => {
  return Publisher.aggregate([{ $sort: { name: 1 } }, ...BOOK_COUNT_STAGES]);
};

export const getPublisherById = async (id) => {
  const [publisher] = await Publisher.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    ...BOOK_COUNT_STAGES,
  ]);
  if (!publisher) throw new ApiError(404, "Publisher not found");
  return publisher;
};

export const getPublisherBySlug = async (slug) => {
  const [publisher] = await Publisher.aggregate([
    { $match: { slug } },
    ...BOOK_COUNT_STAGES,
  ]);
  if (!publisher) throw new ApiError(404, "Publisher not found");
  return publisher;
};

export const updatePublisher = async (id, payload) => {
  const publisher = await Publisher.findById(id);
  if (!publisher) throw new ApiError(404, "Publisher not found");

  if (payload.name && payload.name.trim() !== publisher.name) {
    const existing = await Publisher.findOne({
      name: payload.name.trim(),
      _id: { $ne: id },
    });
    if (existing)
      throw new ApiError(409, "A publisher with this name already exists");
    publisher.name = payload.name.trim();
    publisher.slug = await buildUniqueSlug(payload.name);
  }

  if (payload.description !== undefined)
    publisher.description = payload.description.trim();
  if (payload.website !== undefined) publisher.website = payload.website.trim();
  if (payload.country !== undefined) publisher.country = payload.country.trim();

  await publisher.save();
  return publisher;
};

export const deletePublisher = async (id) => {
  const publisher = await Publisher.findById(id);
  if (!publisher) throw new ApiError(404, "Publisher not found");

  await publisher.deleteOne();
};

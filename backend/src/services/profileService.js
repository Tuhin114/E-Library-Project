import User from "../models/User.js";
import SavedSearch from "../models/SavedSearch.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadBuffer, deleteAsset } from "../utils/cloudinaryUpload.js";
import { FILE_LIMITS } from "../constants/fileUploadLimits.js";

/**
 * Updates name/bio for the authenticated user. Only assigns fields
 * actually present on the payload so a partial update never clobbers
 * the other one with undefined.
 */
export const updateProfile = async (userId, { name, bio }) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  if (name !== undefined) user.name = name;
  if (bio !== undefined) user.bio = bio;

  await user.save();
  return user.toJSON();
};

export const uploadAvatar = async (userId, file) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  if (user.avatar?.publicId) {
    await deleteAsset(
      user.avatar.publicId,
      FILE_LIMITS.avatar.cloudinaryResourceType,
    );
  }

  const result = await uploadBuffer(file.buffer, {
    folder: FILE_LIMITS.avatar.cloudinaryFolder,
    resourceType: FILE_LIMITS.avatar.cloudinaryResourceType,
    publicId: `user-${userId}-avatar-${Date.now()}`,
  });

  user.avatar = { url: result.secure_url, publicId: result.public_id };
  await user.save();
  return user.toJSON();
};

export const removeAvatar = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  if (user.avatar?.publicId) {
    await deleteAsset(
      user.avatar.publicId,
      FILE_LIMITS.avatar.cloudinaryResourceType,
    );
  }

  user.avatar = { url: null, publicId: null };
  await user.save();
  return user.toJSON();
};

export const listSavedSearches = async (userId) =>
  SavedSearch.find({ user: userId }).sort({ createdAt: -1 });

export const createSavedSearch = async (userId, { name, queryParams }) =>
  SavedSearch.create({ user: userId, name, queryParams: queryParams || {} });

/**
 * Ownership-scoped delete — the query itself excludes anyone else's
 * saved search, so a user can't delete another user's row by guessing
 * its ID (same pattern as bookmark deletion in Phase 3).
 */
export const deleteSavedSearch = async (userId, savedSearchId) => {
  const deleted = await SavedSearch.findOneAndDelete({
    _id: savedSearchId,
    user: userId,
  });
  if (!deleted) throw new ApiError(404, "Saved search not found");
};

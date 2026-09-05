import SavedList from "../models/SavedList.js";
import SavedListItem from "../models/SavedListItem.js";
import Resource from "../models/Resource.js";
import { ApiError } from "../utils/ApiError.js";
import { serializeResource } from "../utils/sanitizeResource.js";
import { isResourceVisibleTo } from "./resourceService.js";

const RESOURCE_POPULATE = { path: "uploadedBy", select: "name email role" };

// Saved lists are entirely personal (private-only this milestone, see
// SavedList.js) — a non-owner shouldn't be able to tell one exists at
// all, same 404-not-403 reasoning resourceService already applies to
// private resources.
const assertOwnsList = (list, user) => {
  if (list.owner.toString() !== user._id.toString()) {
    throw new ApiError(404, "Saved list not found");
  }
};

const getOwnedList = async (listId, user) => {
  const list = await SavedList.findById(listId);
  if (!list) throw new ApiError(404, "Saved list not found");
  assertOwnsList(list, user);
  return list;
};

export const createSavedList = async (user, payload) => {
  const list = await SavedList.create({ ...payload, owner: user._id });
  return list.toObject();
};

export const listSavedLists = async (user) => {
  const lists = await SavedList.find({ owner: user._id })
    .sort({ createdAt: -1 })
    .lean();

  // itemCount is computed here, not stored on SavedList, so
  // SavedListItem stays the single source of truth instead of a
  // denormalized counter that could silently drift.
  const counts = await SavedListItem.aggregate([
    { $match: { list: { $in: lists.map((list) => list._id) } } },
    { $group: { _id: "$list", count: { $sum: 1 } } },
  ]);
  const countByListId = new Map(
    counts.map((entry) => [entry._id.toString(), entry.count]),
  );

  return lists.map((list) => ({
    ...list,
    itemCount: countByListId.get(list._id.toString()) || 0,
  }));
};

export const getSavedListById = async (listId, user) => {
  const list = await getOwnedList(listId, user);

  const rawItems = await SavedListItem.find({ list: list._id })
    .sort({ createdAt: -1 })
    .populate({ path: "resource", populate: RESOURCE_POPULATE })
    .lean();

  // A saved item's resource may have since been deleted (filtered by
  // resourceService's own cascade not even reaching here, but this is
  // a second line of defense, same spirit as Favorite's
  // .filter(Boolean) for a deleted book) or flipped private by an
  // owner other than the list's own owner — either way it's silently
  // dropped from the response rather than erroring or leaking a
  // private resource's content to someone who can no longer see it.
  const items = rawItems
    .filter((item) => item.resource && isResourceVisibleTo(item.resource, user))
    .map((item) => ({
      itemId: item._id,
      addedAt: item.createdAt,
      resource: serializeResource(item.resource),
    }));

  return { ...list.toObject(), items };
};

export const updateSavedList = async (listId, user, payload) => {
  const list = await getOwnedList(listId, user);

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined) list[key] = value;
  });

  await list.save();
  return list.toObject();
};

export const deleteSavedList = async (listId, user) => {
  const list = await getOwnedList(listId, user);
  await SavedListItem.deleteMany({ list: list._id });
  await list.deleteOne();
};

// Saving a resource to a list is a read operation from the resource's
// point of view — reuses resourceService's own visibility rule so you
// can only save something you could otherwise see (public, your own,
// or you're a librarian), not fingerprint a private resource's
// existence by trying to add it to a list.
export const addItemToList = async (listId, resourceId, user) => {
  const list = await getOwnedList(listId, user);

  const resource = await Resource.findById(resourceId).lean();
  if (!resource || !isResourceVisibleTo(resource, user)) {
    throw new ApiError(404, "Resource not found");
  }

  try {
    await SavedListItem.create({
      list: list._id,
      resource: resourceId,
      addedBy: user._id,
    });
  } catch (error) {
    // Duplicate key — the unique (list, resource) index caught a
    // re-add, most likely a double-click race. Surface it as a normal
    // 409 rather than a raw Mongo error, same pattern
    // userLibraryService.addFavorite already uses for Favorite.
    if (error.code === 11000) {
      throw new ApiError(409, "This resource is already in that list");
    }
    throw error;
  }
};

export const removeItemFromList = async (listId, resourceId, user) => {
  const list = await getOwnedList(listId, user);

  const result = await SavedListItem.findOneAndDelete({
    list: list._id,
    resource: resourceId,
  });
  if (!result) throw new ApiError(404, "That resource is not in this list");
};

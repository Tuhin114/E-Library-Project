import Resource from "../models/Resource.js";
import { ApiError } from "../utils/ApiError.js";
import { ROLES } from "../constants/roles.js";
import { RESOURCE_VISIBILITY } from "../constants/resourceVisibility.js";
import { FILE_LIMITS } from "../constants/fileUploadLimits.js";
import { uploadBuffer, deleteAsset } from "../utils/cloudinaryUpload.js";
import { serializeResource } from "../utils/sanitizeResource.js";
import {
  buildResourceExactFilters,
  buildResourceSearchRegex,
  buildResourceSort,
} from "../utils/buildResourceQuery.js";
import {
  getPaginationParams,
  buildPaginationMeta,
} from "../utils/paginate.js";

const RESOURCE_POPULATE = { path: "uploadedBy", select: "name email role" };

const isSameUser = (userId, otherId) => userId.toString() === otherId.toString();

// A private resource is only readable by its owner or a librarian —
// the single place this rule lives, reused by every read path
// (direct-by-id fetch and, later, file streaming).
const assertResourceReadable = (resource, user) => {
  const ownerId = resource.uploadedBy?._id || resource.uploadedBy;
  const isOwner = isSameUser(ownerId, user._id);

  if (
    resource.visibility === RESOURCE_VISIBILITY.PRIVATE &&
    !isOwner &&
    user.role !== ROLES.LIBRARIAN
  ) {
    throw new ApiError(404, "Resource not found");
  }
};

// Owner or librarian can modify. A private resource that isn't the
// requester's own still 404s here rather than 403ing — the same
// "don't confirm it exists" reasoning assertResourceReadable applies
// on the read path applies here too, otherwise a 403-vs-404 split
// would leak the existence of someone else's private upload.
const assertCanModify = (resource, user) => {
  const isOwner = isSameUser(resource.uploadedBy, user._id);

  if (isOwner || user.role === ROLES.LIBRARIAN) return;

  if (resource.visibility === RESOURCE_VISIBILITY.PRIVATE) {
    throw new ApiError(404, "Resource not found");
  }

  throw new ApiError(403, "You are not authorized to modify this resource");
};

export const createResource = async (payload, userId) => {
  const resource = await Resource.create({
    ...payload,
    uploadedBy: userId,
  });

  return serializeResource(await resource.populate(RESOURCE_POPULATE));
};

export const listResources = async (query, user) => {
  const filter = buildResourceExactFilters(query);

  if (query.mine) {
    filter.uploadedBy = user._id;
  } else {
    // Everyone sees public resources; a requester additionally sees
    // their own, whatever its visibility. Librarians get no
    // read-everything shortcut here — visiting someone else's private
    // upload still requires the owner to have made it public, same as
    // any other role.
    filter.$or = [
      { visibility: RESOURCE_VISIBILITY.PUBLIC },
      { uploadedBy: user._id },
    ];
  }

  const sort = buildResourceSort(query.sort);
  const { page, limit, skip } = getPaginationParams(query);

  const searchTerm = query.search?.trim();
  if (searchTerm) {
    const regex = buildResourceSearchRegex(searchTerm);
    const searchOr = [
      { title: regex },
      { subject: regex },
      { tags: regex },
      { authors: regex },
    ];

    // filter.$or may already be set above for visibility scoping —
    // combine both conditions with $and instead of letting the second
    // $or silently overwrite the first.
    if (filter.$or) {
      filter.$and = [{ $or: filter.$or }, { $or: searchOr }];
      delete filter.$or;
    } else {
      filter.$or = searchOr;
    }
  }

  const [resources, totalItems] = await Promise.all([
    Resource.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(RESOURCE_POPULATE)
      .lean(),
    Resource.countDocuments(filter),
  ]);

  return {
    resources: resources.map(serializeResource),
    pagination: buildPaginationMeta({ page, limit, totalItems }),
  };
};

export const getResourceById = async (id, user) => {
  const resource = await Resource.findById(id)
    .populate(RESOURCE_POPULATE)
    .lean();
  if (!resource) throw new ApiError(404, "Resource not found");

  assertResourceReadable(resource, user);

  return serializeResource(resource);
};

export const updateResource = async (id, user, payload) => {
  const resource = await Resource.findById(id);
  if (!resource) throw new ApiError(404, "Resource not found");

  assertCanModify(resource, user);

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined) resource[key] = value;
  });

  await resource.save();
  return serializeResource(await resource.populate(RESOURCE_POPULATE));
};

export const deleteResource = async (id, user) => {
  const resource = await Resource.findById(id);
  if (!resource) throw new ApiError(404, "Resource not found");

  assertCanModify(resource, user);

  if (resource.file?.publicId) {
    await deleteAsset(
      resource.file.publicId,
      FILE_LIMITS.resource.cloudinaryResourceType,
    );
  }

  await resource.deleteOne();
};

export const uploadResourceFile = async (id, user, file) => {
  const resource = await Resource.findById(id);
  if (!resource) throw new ApiError(404, "Resource not found");

  assertCanModify(resource, user);

  if (resource.file?.publicId) {
    await deleteAsset(
      resource.file.publicId,
      FILE_LIMITS.resource.cloudinaryResourceType,
    );
  }

  const result = await uploadBuffer(file.buffer, {
    folder: FILE_LIMITS.resource.cloudinaryFolder,
    resourceType: FILE_LIMITS.resource.cloudinaryResourceType,
    publicId: `resource-${id}-file-${Date.now()}`,
  });

  resource.file = {
    url: result.secure_url,
    publicId: result.public_id,
    format: result.format,
    sizeBytes: result.bytes,
    originalName: file.originalname,
    uploadedAt: new Date(),
  };

  await resource.save();
  return serializeResource(await resource.populate(RESOURCE_POPULATE));
};

export const deleteResourceFile = async (id, user) => {
  const resource = await Resource.findById(id);
  if (!resource) throw new ApiError(404, "Resource not found");

  assertCanModify(resource, user);

  if (resource.file?.publicId) {
    await deleteAsset(
      resource.file.publicId,
      FILE_LIMITS.resource.cloudinaryResourceType,
    );
  }

  resource.file = {};
  await resource.save();
  return serializeResource(await resource.populate(RESOURCE_POPULATE));
};

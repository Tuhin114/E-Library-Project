import LibrarySettings from "../models/LibrarySettings.js";

export const getSettings = async () => {
  let settings = await LibrarySettings.findOne();
  if (!settings) {
    settings = await LibrarySettings.create({});
  }
  return settings;
};

export const updateSettings = async (librarianId, payload) => {
  const settings = await getSettings();

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined) settings[key] = value;
  });
  settings.updatedBy = librarianId;

  await settings.save();
  return settings;
};

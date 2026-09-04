import axiosInstance from "./axiosInstance";

const BASE_URL = "/books";

export const fetchBooks = (params = {}) =>
  axiosInstance.get(BASE_URL, { params });
export const fetchBookById = (id) => axiosInstance.get(`${BASE_URL}/${id}`);
export const createBook = (payload) => axiosInstance.post(BASE_URL, payload);
export const updateBook = (id, payload) =>
  axiosInstance.patch(`${BASE_URL}/${id}`, payload);
export const deleteBook = (id) => axiosInstance.delete(`${BASE_URL}/${id}`);

export const uploadCoverImage = (id, file) => {
  const formData = new FormData();
  formData.append("file", file);
  return axiosInstance.post(`${BASE_URL}/${id}/cover`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const importCoverImageFromUrl = (id, url) =>
  axiosInstance.post(`${BASE_URL}/${id}/cover/url`, { url });

export const deleteCoverImage = (id) =>
  axiosInstance.delete(`${BASE_URL}/${id}/cover`);

export const uploadDigitalFile = (id, type, file) => {
  const formData = new FormData();
  formData.append("file", file);
  return axiosInstance.post(`${BASE_URL}/${id}/files/${type}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const importDigitalFileFromUrl = (id, type, url) =>
  axiosInstance.post(`${BASE_URL}/${id}/files/${type}/url`, { url });

export const deleteDigitalFile = (id, type) =>
  axiosInstance.delete(`${BASE_URL}/${id}/files/${type}`);

// responseType: 'blob' — react-pdf/react-reader take an object URL, not
// a raw network URL (they can't attach the Authorization header a
// direct fetch to this route needs).
export const fetchBookFile = (id, type, { download = false } = {}) =>
  axiosInstance.get(`${BASE_URL}/${id}/files/${type}/stream`, {
    params: { download: download ? "true" : "false" },
    responseType: "blob",
  });

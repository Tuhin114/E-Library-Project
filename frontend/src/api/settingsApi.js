import axiosInstance from "./axiosInstance";

export const fetchSettings = () => axiosInstance.get("/settings");

export const updateSettings = (payload) => axiosInstance.patch("/settings", payload);

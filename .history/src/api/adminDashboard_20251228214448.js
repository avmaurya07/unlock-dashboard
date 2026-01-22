import api from "./client";

export const getAdminSummary = (params) =>
  api.get("/api/admin/dashboard/summary", { params });

export const getListingsByType = (params) =>
  api.get("/api/admin/dashboard/listings-by-type", { params });

export const getListingsTrends = (params) =>
  api.get("/api/admin/dashboard/listings-trends", { params });

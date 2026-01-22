import api from "./client";

export const getAdminListings = (params) =>
  api.get("/api/admin/listings", { params });

export const getAdminListingById = (id) =>
  api.get(`/api/admin/listings/${id}`);

export const approveAdminListing = (id) =>
  api.patch(`/api/admin/listings/${id}/approve`);

export const rejectAdminListing = (id, reason) =>
  api.patch(`/api/admin/listings/${id}/reject`, { reason });

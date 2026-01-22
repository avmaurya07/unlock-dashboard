import api from "./client";

// GET /api/admin/users?q=&role=&status=&page=&limit=
export const getAdminUsers = (params) =>
  api.get("/api/admin/users", { params });

// PATCH /api/admin/users/:id/block  body: { blocked: true/false }
export const setUserBlocked = (userId, blocked) =>
  api.patch(`/api/admin/users/${userId}/block`, { blocked });

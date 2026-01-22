import api from "./client";

// GET /api/admin/publishers?status=active&q=abc&page=1&limit=20
export const getAdminPublishers = (params) =>
  api.get("/api/admin/publishers", { params });

// PATCH /api/admin/publishers/:id/suspend  body: { suspend: true/false }
export const setPublisherSuspended = (publisherId, suspend) =>
  api.patch(`/api/admin/publishers/${publisherId}/suspend`, { suspend });

// PATCH /api/admin/publishers/:id/extend-subscription
// body can be: { months: 3 } OR { days: 10 } OR { setExpiry: "2026-01-01" }
export const extendPublisherSubscription = (publisherId, payload) =>
  api.patch(`/api/admin/publishers/${publisherId}/extend-subscription`, payload);

// OPTIONAL: PATCH /api/admin/publishers/:id/service-plan  body: { active: true/false }
export const setPublisherServicePlan = (publisherId, active) =>
  api.patch(`/api/admin/publishers/${publisherId}/service-plan`, { active });

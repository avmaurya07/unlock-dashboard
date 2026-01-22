import api from "./client";

export const listFundingCalls = (params) =>
  api.get("/api/publisher/funding-calls", { params });

export const createFundingCall = (payload) =>
  api.post("/api/publisher/funding-calls", payload);

export const updateFundingCall = (id, payload) =>
  api.patch(`/api/publisher/funding-calls/${id}`, payload);

export const deleteFundingCall = (id) =>
  api.delete(`/api/publisher/funding-calls/${id}`);

export const toggleFundingCallActive = (id) =>
  api.post(`/api/publisher/funding-calls/${id}/toggle`);


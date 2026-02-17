import api from "./client";

export const getPlans = () => api.get("/api/subscription/plans");

export const createOrder = (durationInMonths) =>
  api.post("/api/subscription/create-order", { durationInMonths });

export const verifyPayment = (payload) => api.post("/api/subscription/verify", payload);

export default { getPlans, createOrder, verifyPayment };

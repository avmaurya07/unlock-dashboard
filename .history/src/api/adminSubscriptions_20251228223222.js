import api from "./client";

// GET current pricing config
// Expected: { config: { plans: {3: 999, 6: 1799, 9: 2499}, serviceListingYearlyFee: 499, currency: "INR" } }
export const getSubscriptionConfig = () =>
  api.get("/api/admin/subscriptions/config");

// UPDATE pricing config
// Body: { plans: {3: 999, 6: 1799, 9: 2499}, serviceListingYearlyFee: 499, currency: "INR" }
export const updateSubscriptionConfig = (payload) =>
  api.put("/api/admin/subscriptions/config", payload);

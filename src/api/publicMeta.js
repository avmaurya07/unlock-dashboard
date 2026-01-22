import api from "./client";

export const getPublicChallengeCategories = () =>
  api.get("/api/public/challenge-categories");

export const getPublicOrganizerTypes = () =>
  api.get("/api/public/organizer-types");

export const getPublicStartupStages = () =>
  api.get("/api/public/startup-stages");


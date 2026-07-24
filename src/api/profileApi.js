import apiClient from "./apiClient";

export const profileAPI = {
  // Get User Profile by User ID
  getUserById: (userId) =>
    apiClient.get("/api/auth/getUserById", {
      params: { userId },
    }),
};

import apiClient from "./apiClient";

const hsnSacAPI = {
  getAll: async (orgId, branch) => {
    const response = await apiClient.get("/api/commonmaster/getHsnByOrgId", {
      params: { orgId, branch },
    });
    return Array.isArray(response) ? response : response?.data ?? [];
  },

  getById: async (id) => {
    const response = await apiClient.get("/api/commonmaster/getHSNById", {
      params: { id },
    });
    return response;
  },

  createUpdate: async (data) => {
    const response = await apiClient.put(
      "/api/commonmaster/createUpdateHSN",
      data
    );
    return response;
  },
};

export default hsnSacAPI;

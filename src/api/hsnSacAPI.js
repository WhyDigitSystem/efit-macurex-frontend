import apiClient from "./apiClient";

const hsnSacAPI = {
  getAll: async (orgId, branch) => {
    try {
      const res = await apiClient.get("/api/commonmaster/getHsnByOrgId", {
        params: { orgId, branch },
      });
      console.log("HSN/SAC API response:", res);
      const list =
        res?.paramObjectsMap?.hsnList ||
        res?.paramObjectsMap?.hsnVO ||
        res?.data ||
        [];
      return Array.isArray(list) ? list : [];
    } catch (error) {
      console.error("Error fetching HSN/SAC:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get("/api/commonmaster/getHSNById", {
        params: { id },
      });
      return res;
    } catch (error) {
      console.error("Error fetching HSN/SAC by ID:", error);
      throw error;
    }
  },

  createUpdate: async (data) => {
    try {
      const res = await apiClient.put(
        "/api/commonmaster/createUpdateHSN",
        data
      );
      return res;
    } catch (error) {
      console.error("Error saving HSN/SAC:", error);
      throw error;
    }
  },
};

export default hsnSacAPI;

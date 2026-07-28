import apiClient from "./apiClient";

const itemGradeAPI = {
  getAll: async (orgId, branch) => {
    try {
      const res = await apiClient.get("/api/commonmaster/getGradeMasterByOrgId", {
        params: { orgId, branch },
      });
      return res?.paramObjectsMap?.gradeMasterList || [];
    } catch (error) {
      console.error("Error fetching item grades:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get("/api/commonmaster/getGradeMasterById", {
        params: { id },
      });
      return res?.paramObjectsMap?.gradeMasterVO || null;
    } catch (error) {
      console.error("Error fetching item grade by ID:", error);
      throw error;
    }
  },

  save: async (payload) => {
    try {
      const res = await apiClient.put("/api/commonmaster/createUpdateGradeMaster", payload);
      return res;
    } catch (error) {
      console.error("Error saving item grade:", error);
      throw error;
    }
  },
};

export default itemGradeAPI;

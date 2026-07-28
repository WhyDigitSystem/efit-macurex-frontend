import apiClient from "./apiClient";

const itemGradeAPI = {
  getAll: async (orgId) => {
    try {
      const res = await apiClient.get(`/api/commonmaster/itemGrade?orgid=${orgId}`);
      return res?.paramObjectsMap?.itemGradeVO || [];
    } catch (error) {
      console.error("Error fetching item grades:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get(`/api/commonmaster/itemGrade/${id}`);
      return res?.paramObjectsMap?.ItemGrade || null;
    } catch (error) {
      console.error("Error fetching item grade by ID:", error);
      throw error;
    }
  },

  save: async (payload) => {
    try {
      const res = await apiClient.post("/api/commonmaster/createUpdateItemGrade", payload);
      return res;
    } catch (error) {
      console.error("Error saving item grade:", error);
      throw error;
    }
  },
};

export default itemGradeAPI;

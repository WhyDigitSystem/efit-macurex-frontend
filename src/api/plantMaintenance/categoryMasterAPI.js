import apiClient from "../apiClient";

export const APPLICABLE_FOR_OPTIONS = [
  "MACHINE",
  "TOOL",
  "EQUIPMENT",
  "VEHICLE",
  "INSTRUMENT",
  "OTHER",
];

export const categoryMasterAPI = {
  getCategories: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/plantMaintenance/category?orgid=${orgId}`
      );
      return res?.paramObjectsMap?.categoryVOList || res?.data || [];
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },

  getCategoryById: async (categoryId) => {
    try {
      const res = await apiClient.get(
        `/api/plantMaintenance/category/${categoryId}`
      );
      return res?.paramObjectsMap?.categoryVO || null;
    } catch (error) {
      console.error("Error fetching category by ID:", error);
      throw error;
    }
  },

  createUpdateCategory: async (categoryDTO) => {
    try {
      const res = await apiClient.post(
        "/api/plantMaintenance/createUpdateCategory",
        categoryDTO
      );
      return res;
    } catch (error) {
      console.error("Error creating/updating category:", error);
      throw error;
    }
  },

  getCategoryHistory: async (categoryId) => {
    try {
      const res = await apiClient.get(
        `/api/plantMaintenance/category/${categoryId}/history`
      );
      return res?.paramObjectsMap?.categoryHistoryVOList || [];
    } catch (error) {
      console.error("Error fetching category history:", error);
      throw error;
    }
  },
};

export default categoryMasterAPI;

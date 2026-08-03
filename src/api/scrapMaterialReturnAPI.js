// scrapMaterialReturnAPI.js
import apiClient from "./apiClient";

const scrapMaterialReturnAPI = {
  // Get Scrap/Material Return/Rejection records by Organization + Branch
  getScrapMaterialReturnByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        "/api/commonmaster/getScrapMaterialReturnByOrgId",
        { params: { branch, orgId } },
      );
      return res?.paramObjectsMap?.scrapMaterialReturnVO || [];
    } catch (error) {
      console.error("Error fetching scrap/material return records:", error);
      throw error;
    }
  },

  getScrapMaterialReturnById: async (id) => {
    try {
      const res = await apiClient.get(
        "/api/commonmaster/getScrapMaterialReturnById",
        { params: { id } },
      );
      return res?.paramObjectsMap?.scrapMaterialReturnVO || null;
    } catch (error) {
      console.error("Error fetching scrap/material return by ID:", error);
      throw error;
    }
  },

  // Create / Update a scrap/rejection record (header + detail + summary in a
  // single transaction server-side; stock records are not altered).
  createUpdateScrapMaterialReturn: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/commonmaster/updateCreateScrapMaterialReturn",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving scrap/material return record:", error);
      throw error;
    }
  },
};

export default scrapMaterialReturnAPI;

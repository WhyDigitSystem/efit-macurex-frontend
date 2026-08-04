// dcForCapitalItemsAPI.js
import apiClient from "./apiClient";

const dcForCapitalItemsAPI = {
  // Get DC For Capital Items by Organization + Branch
  getDcForCapitalItemsByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        "/api/commonmaster/getDcForCapitalItemsByOrgId",
        { params: { branch, orgId } },
      );
      return res?.paramObjectsMap?.dcForCapitalItemsVO || [];
    } catch (error) {
      console.error("Error fetching DC for capital items:", error);
      throw error;
    }
  },

  getDcForCapitalItemsById: async (id) => {
    try {
      const res = await apiClient.get(
        "/api/commonmaster/getDcForCapitalItemsById",
        { params: { id } },
      );
      return res?.paramObjectsMap?.dcForCapitalItemsVO || null;
    } catch (error) {
      console.error("Error fetching DC for capital items by ID:", error);
      throw error;
    }
  },

  // Create / Update a DC record linked to capital items and the indent. Header,
  // outgoing items and summary are saved in a single transaction; the backend is
  // expected to maintain complete DC history.
  createUpdateDcForCapitalItems: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/commonmaster/updateCreateDcForCapitalItems",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving DC for capital items:", error);
      throw error;
    }
  },
};

export default dcForCapitalItemsAPI;
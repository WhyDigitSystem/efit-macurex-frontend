// dailyInspectionCumRejectionDataAPI.js
import apiClient from "../apiClient";

// Daily Inspection Cum Rejection Data API
// Mirrors the quality API convention used in this app.
// The backend persists the header and inspection details in a
// single transaction (server-side validation).

const dailyInspectionCumRejectionDataAPI = {
  // Get Daily Inspection Cum Rejection Data by Organization ID
  getDICRByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/quality/getDICRByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      const list = res?.paramObjectsMap?.dicrVO;
      return Array.isArray(list) ? list : list ? [list] : [];
    } catch (error) {
      console.error("Error fetching DICR:", error);
      throw error;
    }
  },

  // Get Daily Inspection Cum Rejection Data by ID
  getDICRById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/quality/getDICRById?id=${id}`,
      );
      return res?.paramObjectsMap?.dicrVO || null;
    } catch (error) {
      console.error("Error fetching DICR by ID:", error);
      throw error;
    }
  },

  // Create / Update Daily Inspection Cum Rejection Data
  createUpdateDICR: async (payload) => {
    try {
      const res = await apiClient.put(
        `/api/quality/updateCreateDICR`,
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving DICR:", error);
      throw error;
    }
  },
};

export default dailyInspectionCumRejectionDataAPI;
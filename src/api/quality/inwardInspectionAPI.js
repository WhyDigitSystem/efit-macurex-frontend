// inwardInspectionAPI.js
import apiClient from "../apiClient";

/* Inward Inspection API
   Mirrors the quality API convention used in this app.
   The backend persists the header, inspection details, measurements,
   summary and attached supplier reports in a single transaction and
   keeps the complete inspection history with approval tracking
   (server-side validation). */
const inwardInspectionAPI = {
  // Get Inward Inspections by Organization ID
  getInwardInspectionByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/quality/getInwardInspectionByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.inwardInspectionVO || [];
    } catch (error) {
      console.error("Error fetching inward inspections:", error);
      throw error;
    }
  },

  // Get Inward Inspection by ID
  getInwardInspectionById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/quality/getInwardInspectionById?id=${id}`,
      );
      return res?.paramObjectsMap?.inwardInspectionVO || null;
    } catch (error) {
      console.error("Error fetching inward inspection by ID:", error);
      throw error;
    }
  },

  // Create / Update Inward Inspection
  createUpdateInwardInspection: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/quality/updateCreateInwardInspection",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving inward inspection:", error);
      throw error;
    }
  },
};

export default inwardInspectionAPI;

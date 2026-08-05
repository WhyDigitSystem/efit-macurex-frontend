import apiClient from "../apiClient";

/* BOM Correction Request/Note API
   Mirrors the commonmaster API convention used across this app.
   The backend persists the header + change details + approval records in a
   single transaction, links the record to the FG part and customer and keeps
   the complete correction history with approval tracking for audit purposes
   (server-side validation). */
const bomCorrectionRequestAPI = {
  getByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getBomCorrectionRequestByOrgId?orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.bomCorrectionRequestList || [];
    } catch (error) {
      console.error("Error fetching BOM correction requests:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getBomCorrectionRequestById?id=${id}`,
      );
      return res?.paramObjectsMap?.bomCorrectionRequestVO || null;
    } catch (error) {
      console.error("Error fetching BOM correction request by id:", error);
      throw error;
    }
  },

  createUpdate: async (data) => {
    try {
      const res = await apiClient.post(
        "/api/commonmaster/createUpdateBomCorrectionRequest",
        data,
      );
      return res;
    } catch (error) {
      console.error("Error saving BOM correction request:", error);
      throw error;
    }
  },
};

export default bomCorrectionRequestAPI;
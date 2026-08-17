// inProcessInspectionAPI.js
import apiClient from "../apiClient";

// In-Process Inspection API
// Mirrors the quality API convention used in this app.
// The backend persists the header, in-process details and summary in a
// single transaction ... (server-side validation).

const inProcessInspectionAPI = {
  // Get In-Process Inspections by Organization ID
  getInProcessInspectionByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/quality/getInProcessInspectionByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      const list = res?.paramObjectsMap?.inProcessInspectionVO;
      return Array.isArray(list) ? list : list ? [list] : [];
    } catch (error) {
      console.error("Error fetching in-process inspections:", error);
      throw error;
    }
  },

  // Get In-Process Inspection by ID
  getInProcessInspectionById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/quality/getInProcessInspectionById?id=${id}`,
      );
      return res?.paramObjectsMap?.inProcessInspectionVO || null;
    } catch (error) {
      console.error("Error fetching in-process inspection by ID:", error);
      throw error;
    }
  },

  // Create / Update In-Process Inspection
  createUpdateInProcessInspection: async (payload) => {
    try {
      const res = await apiClient.put(
        `/api/quality/updateCreateInProcessInspection`,
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving in-process inspection:", error);
      throw error;
    }
  },
};

export default inProcessInspectionAPI;
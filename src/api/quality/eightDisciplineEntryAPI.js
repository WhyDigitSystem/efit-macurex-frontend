// eightDisciplineEntryAPI.js
import apiClient from "../apiClient";

/* 8-Discipline Entry API
   Mirrors the quality API convention used in this app.
   The backend persists the header, all discipline tabs (D1-D8) and the
   summary in a single transaction and keeps the complete 8D history with
   corrective and preventive actions (server-side validation). */
const eightDisciplineEntryAPI = {
  // Get 8D entries by Organization ID
  getEightDisciplineByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/quality/getEightDisciplineEntryByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      const list = res?.paramObjectsMap?.eightDisciplineEntryVO;
      return Array.isArray(list) ? list : list ? [list] : [];
    } catch (error) {
      console.error("Error fetching 8D entries:", error);
      throw error;
    }
  },

  // Get 8D Entry by ID
  getEightDisciplineById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/quality/getEightDisciplineEntryById?id=${id}`,
      );
      return res?.paramObjectsMap?.eightDisciplineEntryVO || null;
    } catch (error) {
      console.error("Error fetching 8D entry by ID:", error);
      throw error;
    }
  },

  // Create / Update 8D Entry
  // payload = header + discipline1..discipline8 + summary (single transaction)
  createUpdateEightDiscipline: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/quality/updateCreateEightDisciplineEntry",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving 8D entry:", error);
      throw error;
    }
  },
};

export default eightDisciplineEntryAPI;

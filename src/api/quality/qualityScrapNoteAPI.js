// qualityScrapNoteAPI.js
import apiClient from "../apiClient";

/* Quality Scrap Note API
   Mirrors the commonmaster/dev API convention used across this app.
   The backend persists the header, scrap detail items and the scrap
   summary in a single transaction and keeps the complete scrap record
   history for audit and quality tracking (server-side validation). */
const qualityScrapNoteAPI = {
  // Get Quality Scrap Notes by Organization ID
  getQualityScrapNoteByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/dev/getQualityScrapNoteByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.qualityScrapNoteVO || [];
    } catch (error) {
      console.error("Error fetching quality scrap notes:", error);
      throw error;
    }
  },

  // Create / Update Quality Scrap Note
  createUpdateQualityScrapNote: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/dev/updateCreateQualityScrapNote",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving quality scrap note:", error);
      throw error;
    }
  },
};

export default qualityScrapNoteAPI;

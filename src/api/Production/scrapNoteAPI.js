import apiClient from "../apiClient";

/* Scrap Note API
   Mirrors the commonmaster API convention used across this app.
   The backend persists the header, scrap details, reason details and the
   scrap summary in a single transaction and keeps the complete scrap record
   history with approvals (server-side validation). */
const scrapNoteAPI = {
  // Get Scrap Notes by Organization ID
  getByOrgId: async (orgId, branchId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getScrapNoteByOrgId?orgId=${orgId}&branchId=${branchId}`,
      );
      return (
        res?.paramObjectsMap?.scrapNoteList ||
        res?.paramObjectsMap?.scrapNotes ||
        []
      );
    } catch (error) {
      console.error("Error fetching scrap notes:", error);
      throw error;
    }
  },

  // Get Scrap Note by ID
  getById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getScrapNoteById?id=${id}`,
      );
      return res?.paramObjectsMap?.scrapNoteVO || null;
    } catch (error) {
      console.error("Error fetching scrap note by id:", error);
      throw error;
    }
  },

  // Create / Update Scrap Note
  createUpdate: async (payload) => {
    try {
      const res = await apiClient.post(
        "/api/commonmaster/createUpdateScrapNote",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving scrap note:", error);
      throw error;
    }
  },

  // BOM options for the BOM ID dropdown (graceful empty fallback)
  getBOMs: async (orgId, branchId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getBomByOrgId?orgId=${orgId}&branchId=${branchId}`,
      );
      return res?.paramObjectsMap?.bomList || [];
    } catch (error) {
      console.error("Error fetching BOMs:", error);
      return [];
    }
  },

  // Scrap master options for the Scrap ID dropdown (graceful empty fallback)
  getScrapMasters: async (orgId, branchId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getScrapMasterByOrgId?orgId=${orgId}&branchId=${branchId}`,
      );
      return res?.paramObjectsMap?.scrapMasterList || [];
    } catch (error) {
      console.error("Error fetching scrap masters:", error);
      return [];
    }
  },
};

export default scrapNoteAPI;
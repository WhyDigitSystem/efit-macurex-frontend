// engineeringChangeNoteAPI.js
import apiClient from "../apiClient";

/* Engineering Change Note (ECN) API
   Mirrors the commonmaster/dev API convention used across this app.
   The backend persists the ECN header, part details, reason, remarks,
   change-required grids, process changes, inspections, stores/logistics,
   stock, documents, validations, conclusion, PDF attachments and the CFT
   approval workflow in a single transaction with complete change history
   for approval tracking (server-side validation). */
const engineeringChangeNoteAPI = {
  // Get Engineering Change Notes by Organization ID
  getEcnByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/dev/getEngineeringChangeNoteByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.engineeringChangeNoteEntryVO || [];
    } catch (error) {
      console.error("Error fetching engineering change notes:", error);
      throw error;
    }
  },

  // Create / Update Engineering Change Note
  createUpdateEcn: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/dev/updateCreateEngineeringChangeNote",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving engineering change note:", error);
      throw error;
    }
  },
};

export default engineeringChangeNoteAPI;

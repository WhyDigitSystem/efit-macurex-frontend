// inspectionRequisitionNoteAPI.js
import apiClient from "../apiClient";

/* Inspection Requisition Note API
   Mirrors the commonmaster/dev API convention used across this app.
   The backend persists the header, inspection request details and the
   manager approval workflow (Purchase/TDC/Quality/Production + request
   & approve) in a single transaction and keeps the complete inspection
   request history with approval tracking (server-side validation). */
const inspectionRequisitionNoteAPI = {
  // Get Inspection Requisition Notes by Organization ID
  getIrnByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/dev/getInspectionRequisitionNoteByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.inspectionRequisitionNoteEntryVO || [];
    } catch (error) {
      console.error("Error fetching inspection requisition notes:", error);
      throw error;
    }
  },

  // Create / Update Inspection Requisition Note
  createUpdateIrn: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/dev/updateCreateInspectionRequisitionNote",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving inspection requisition note:", error);
      throw error;
    }
  },
};

export default inspectionRequisitionNoteAPI;

// supplierChangeRequestAPI.js
import apiClient from "../apiClient";

/* Supplier Change Request (SCR) API
   Mirrors the commonmaster/dev API convention used across this app.
   The backend persists the header, reason-for-change, impact-of-change
   and the MACUREX CFT authorization signatures in a single transaction
   and keeps the complete change history with approval tracking
   (server-side validation). */
const supplierChangeRequestAPI = {
  // Get Supplier Change Requests by Organization ID
  getScrByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/dev/getSupplierChangeRequestByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.supplierChangeRequestEntryVO || [];
    } catch (error) {
      console.error("Error fetching supplier change requests:", error);
      throw error;
    }
  },

  // Create / Update Supplier Change Request
  createUpdateScr: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/dev/updateCreateSupplierChangeRequest",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving supplier change request:", error);
      throw error;
    }
  },
};

export default supplierChangeRequestAPI;

// salesOrderShortCloseAPI.js
import apiClient from "../apiClient";

/* Sales Order Short-Close API
   Mirrors the transaction/dev API convention used in this app.
   The backend persists the header, short-close detail items and the
   short-close summary in a single transaction and keeps the complete
   short-close history for audit purposes (server-side validation). */
const salesOrderShortCloseAPI = {
  // Get Sales Order Short-Closes by Organization ID
  getSalesOrderShortCloseByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/dev/getSalesOrderShortCloseByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.salesOrderShortCloseVO || [];
    } catch (error) {
      console.error("Error fetching sales order short-closes:", error);
      throw error;
    }
  },

  // Create / Update Sales Order Short-Close
  createUpdateSalesOrderShortClose: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/dev/updateCreateSalesOrderShortClose",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving sales order short-close:", error);
      throw error;
    }
  },
};

export default salesOrderShortCloseAPI;

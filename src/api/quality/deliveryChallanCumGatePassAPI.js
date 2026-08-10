// deliveryChallanCumGatePassAPI.js
import apiClient from "../apiClient";

/* Delivery Challan Cum Gate Pass API
   Mirrors the commonmaster/dev API convention used across this app.
   The backend persists the header, gate pass detail items and the gate
   pass summary in a single transaction and keeps the complete gate pass
   history for audit purposes (server-side validation). */
const deliveryChallanCumGatePassAPI = {
  // Get Delivery Challan Cum Gate Passes by Organization ID
  getDcgpByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/dev/getDeliveryChallanCumGatePassByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.deliveryChallanCumGatePassEntryVO || [];
    } catch (error) {
      console.error("Error fetching delivery challan cum gate passes:", error);
      throw error;
    }
  },

  // Create / Update Delivery Challan Cum Gate Pass
  createUpdateDcgp: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/dev/updateCreateDeliveryChallanCumGatePass",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving delivery challan cum gate pass:", error);
      throw error;
    }
  },
};

export default deliveryChallanCumGatePassAPI;

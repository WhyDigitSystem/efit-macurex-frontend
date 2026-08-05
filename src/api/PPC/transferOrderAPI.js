import apiClient from "../apiClient";

/* Transfer Order API
   Mirrors the commonmaster API convention used across this app.
   The backend persists the header + transfer details in a single transaction,
   links the record to the supplier/contract and keeps the complete transfer
   order history for audit purposes (server-side validation). */
const transferOrderAPI = {
  getByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getTransferOrderByOrgId?orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.transferOrderList || [];
    } catch (error) {
      console.error("Error fetching transfer orders:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getTransferOrderById?id=${id}`,
      );
      return res?.paramObjectsMap?.transferOrderVO || null;
    } catch (error) {
      console.error("Error fetching transfer order by id:", error);
      throw error;
    }
  },

  createUpdate: async (data) => {
    try {
      const res = await apiClient.post(
        "/api/commonmaster/createUpdateTransferOrder",
        data,
      );
      return res;
    } catch (error) {
      console.error("Error saving transfer order:", error);
      throw error;
    }
  },
};

export default transferOrderAPI;
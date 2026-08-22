import apiClient from "../apiClient";

/* Stock Order API
   Mirrors the commonmaster API convention used across this app.
   The backend persists the header, stock details and the summary
   in a single transaction and keeps the complete stock order
   history for audit purposes (server-side validation). */
const stockOrderAPI = {
  // Get Stock Orders by Organization ID
  getByOrgId: async (orgId, branchId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getStockOrderByOrgId?orgId=${orgId}&branchId=${branchId}`,
      );
      return (
        res?.paramObjectsMap?.stockOrderList ||
        res?.paramObjectsMap?.stockOrders ||
        []
      );
    } catch (error) {
      console.error("Error fetching stock orders:", error);
      throw error;
    }
  },

  // Get Stock Order by ID
  getById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getStockOrderById?id=${id}`,
      );
      return res?.paramObjectsMap?.stockOrderVO || null;
    } catch (error) {
      console.error("Error fetching stock order by id:", error);
      throw error;
    }
  },

  // Create / Update Stock Order
  createUpdate: async (payload) => {
    try {
      const res = await apiClient.post(
        "/api/commonmaster/createUpdateStockOrder",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving stock order:", error);
      throw error;
    }
  },
};

export default stockOrderAPI;
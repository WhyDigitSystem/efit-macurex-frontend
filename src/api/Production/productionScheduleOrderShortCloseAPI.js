import apiClient from "../apiClient";

/* Production Schedule Order Short Close API
   Mirrors the commonmaster API convention used across this app.
   The backend persists the header, production order details and the
   summary in a single transaction and keeps the complete short-close
   record history with reasons (server-side validation). */
const productionScheduleOrderShortCloseAPI = {
  // Get Short Close records by Organization ID
  getByOrgId: async (orgId, branchId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getProductionScheduleOrderShortCloseByOrgId?orgId=${orgId}&branchId=${branchId}`,
      );
      return (
        res?.paramObjectsMap?.productionScheduleOrderShortCloseList ||
        res?.paramObjectsMap?.shortCloseList ||
        []
      );
    } catch (error) {
      console.error(
        "Error fetching production schedule order short closes:",
        error,
      );
      throw error;
    }
  },

  // Get Short Close record by ID
  getById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getProductionScheduleOrderShortCloseById?id=${id}`,
      );
      return (
        res?.paramObjectsMap?.productionScheduleOrderShortCloseVO ||
        res?.paramObjectsMap?.shortCloseVO ||
        null
      );
    } catch (error) {
      console.error(
        "Error fetching production schedule order short close by id:",
        error,
      );
      throw error;
    }
  },

  // Create / Update Short Close record
  createUpdate: async (payload) => {
    try {
      const res = await apiClient.post(
        "/api/commonmaster/createUpdateProductionScheduleOrderShortClose",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving production schedule order short close:", error);
      throw error;
    }
  },
};

export default productionScheduleOrderShortCloseAPI;
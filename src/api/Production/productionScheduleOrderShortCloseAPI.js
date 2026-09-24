import apiClient from "../apiClient";

const productionScheduleOrderShortCloseAPI = {
  /* ---------------- List by Org + Branch ---------------- */
  getByOrgIdAndBranch: async ({ branch, orgId }) => {
    try {
      const res = await apiClient.get(
        `/api/purchaseOrder/getProductionSchOrderShortCloseByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      return (
        res?.paramObjectsMap?.productionSchOrderShortCloseResponseVO || []
      );
    } catch (error) {
      console.error("Error fetching Short Close records:", error);
      throw error;
    }
  },

  /* ---------------- Get by Id ---------------- */
  getById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/purchaseOrder/getProductionSchOrderShortCloseById?id=${id}`,
      );
      return (
        res?.paramObjectsMap?.productionSchOrderShortCloseResponseVO || null
      );
    } catch (error) {
      console.error("Error fetching Short Close by id:", error);
      throw error;
    }
  },

  /* ---------------- Doc Id ---------------- */
  getDocId: async ({ financialYear, orgId }) => {
    try {
      const res = await apiClient.get(
        `/api/purchaseOrder/getProductionSchOrderShortCloseDocId?financialYear=${financialYear}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.productionSchOrderShortCloseDocId || "";
    } catch (error) {
      console.error("Error fetching Short Close Doc Id:", error);
      throw error;
    }
  },

  /* ---------------- Item Code dropdown ---------------- */
  getItems: async ({ branch, orgId }) => {
    try {
      const res = await apiClient.get(
        `/api/purchaseOrder/getItemDetailsFromProductionShortClose?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.mapp || [];
    } catch (error) {
      console.error("Error fetching items:", error);
      throw error;
    }
  },

  /* ---------------- Schedule Order No dropdown ---------------- */
  getScheduleOrders: async ({ branch, orgId }) => {
    try {
      const res = await apiClient.get(
        `/api/purchaseOrder/getSchOrderNoProductionShortClose?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.mapp || [];
    } catch (error) {
      console.error("Error fetching schedule orders:", error);
      throw error;
    }
  },

  /* ---------------- Save (create / update) ---------------- */
  createUpdate: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/purchaseOrder/createUpdateProductionSchOrderShortClose",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving Short Close:", error);
      throw error;
    }
  },
};

export default productionScheduleOrderShortCloseAPI;
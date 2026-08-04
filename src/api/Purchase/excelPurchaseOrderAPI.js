import apiClient from "../apiClient";

/* Excel Purchase Order API
   Mirrors the Local Purchase Order API convention.
   Server-side validation happens in the backend; this client sends a single
   transactional payload (header + item details + tax details + terms) so the
   full PO and its history are persisted atomically. */
const excelPurchaseOrderAPI = {
  getByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getExcelPurchaseOrderByOrgId?orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.excelPurchaseOrderList || [];
    } catch (error) {
      console.error("Error fetching excel purchase orders:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getExcelPurchaseOrderById?id=${id}`,
      );
      return res?.paramObjectsMap?.excelPurchaseOrderVO || null;
    } catch (error) {
      console.error("Error fetching excel purchase order by id:", error);
      throw error;
    }
  },

  createUpdate: async (data) => {
    try {
      const res = await apiClient.post(
        "/api/commonmaster/createUpdateExcelPurchaseOrder",
        data,
      );
      return res;
    } catch (error) {
      console.error("Error saving excel purchase order:", error);
      throw error;
    }
  },
};

export default excelPurchaseOrderAPI;
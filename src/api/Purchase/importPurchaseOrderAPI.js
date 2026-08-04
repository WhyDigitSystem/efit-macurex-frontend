import apiClient from "../apiClient";

/* Import Purchase Order API
   Mirrors the Local Purchase Order API convention.
   The backend persists the header + PO details + tax details + terms in a
   single transaction, links the record to the supplier/indent and keeps the
   complete PO history for audit purposes. */
const importPurchaseOrderAPI = {
  getByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getImportPurchaseOrderByOrgId?orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.importPurchaseOrderList || [];
    } catch (error) {
      console.error("Error fetching import purchase orders:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getImportPurchaseOrderById?id=${id}`,
      );
      return res?.paramObjectsMap?.importPurchaseOrderVO || null;
    } catch (error) {
      console.error("Error fetching import purchase order by id:", error);
      throw error;
    }
  },

  createUpdate: async (data) => {
    try {
      const res = await apiClient.post(
        "/api/commonmaster/createUpdateImportPurchaseOrder",
        data,
      );
      return res;
    } catch (error) {
      console.error("Error saving import purchase order:", error);
      throw error;
    }
  },
};

export default importPurchaseOrderAPI;
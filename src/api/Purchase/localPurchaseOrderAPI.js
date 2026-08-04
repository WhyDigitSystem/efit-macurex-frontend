import apiClient from "../apiClient";

const localPurchaseOrderAPI = {
  getByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getLocalPurchaseOrderByOrgId?orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.localPurchaseOrderList || [];
    } catch (error) {
      console.error("Error fetching local purchase orders:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getLocalPurchaseOrderById?id=${id}`,
      );
      return res?.paramObjectsMap?.localPurchaseOrderVO || null;
    } catch (error) {
      console.error("Error fetching local purchase order by id:", error);
      throw error;
    }
  },

  createUpdate: async (data) => {
    try {
      const res = await apiClient.post(
        "/api/commonmaster/createUpdateLocalPurchaseOrder",
        data,
      );
      return res;
    } catch (error) {
      console.error("Error saving local purchase order:", error);
      throw error;
    }
  },

  uploadAttachment: async (poId, file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("poId", poId);

      const res = await apiClient.post(
        "/api/commonmaster/uploadLocalPurchaseOrderAttachment",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return res;
    } catch (error) {
      console.error("Error uploading local purchase order attachment:", error);
      throw error;
    }
  },
};

export default localPurchaseOrderAPI;

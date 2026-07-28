import apiClient from "../apiClient";

export const purchaseIndentAPI = {
  getPurchaseIndentById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/purchasemaster/getPurchaseIndentById?id=${id}`,
      );
      return res?.paramObjectsMap?.purchaseIndentVO || null;
    } catch (error) {
      console.error("Error fetching purchase indent by ID:", error);
      throw error;
    }
  },

  getPurchaseIndentByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/purchasemaster/getPurchaseIndentByOrgId?orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.purchaseIndentList || [];
    } catch (error) {
      console.error("Error fetching purchase indent list:", error);
      throw error;
    }
  },

  updateCreatePurchaseIndent: async (purchaseIndentDTO) => {
    try {
      const res = await apiClient.put(
        "/api/purchasemaster/updateCreatePurchaseIndent",
        purchaseIndentDTO,
      );
      return res;
    } catch (error) {
      console.error("Error creating/updating purchase indent:", error);
      throw error;
    }
  },

  // Uploads a single attachment for a given indent row; swap for your real
  // multipart upload endpoint (e.g. FormData with the file + indent id)
  uploadAttachment: async (indentId, file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("indentId", indentId);

      const res = await apiClient.post(
        "/api/purchasemaster/uploadPurchaseIndentAttachment",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return res;
    } catch (error) {
      console.error("Error uploading attachment:", error);
      throw error;
    }
  },
};

export default purchaseIndentAPI;

import apiClient from "../apiClient";

export const goodsReceivedNoteAPI = {
  getGrnById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/purchasemaster/getGrnById?id=${id}`,
      );
      return res?.paramObjectsMap?.grnVO || null;
    } catch (error) {
      console.error("Error fetching GRN by ID:", error);
      throw error;
    }
  },

  getGrnByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/purchasemaster/getGrnByOrgId?orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.grnList || [];
    } catch (error) {
      console.error("Error fetching GRN list:", error);
      throw error;
    }
  },

  updateCreateGrn: async (grnDTO) => {
    try {
      const res = await apiClient.put(
        "/api/purchasemaster/updateCreateGrn",
        grnDTO,
      );
      return res;
    } catch (error) {
      console.error("Error creating/updating GRN:", error);
      throw error;
    }
  },

  // Uploads a single invoice copy against a saved GRN id
  uploadInvoiceCopy: async (grnId, file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("grnId", grnId);

      const res = await apiClient.post(
        "/api/purchasemaster/uploadGrnInvoiceCopy",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return res;
    } catch (error) {
      console.error("Error uploading invoice copy:", error);
      throw error;
    }
  },
};

export default goodsReceivedNoteAPI;

// rejectionInvoiceAPI.js
import apiClient from "../apiClient";

export const rejectionInvoiceAPI = {
  // Get Rejection Invoices by Organization ID
  getInvoiceByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getRejectionInvoiceByOrgId?orgId=${orgId}`,
      );

      return res?.paramObjectsMap?.invoiceList || [];
    } catch (error) {
      console.error("Error fetching rejection invoices:", error);
      throw error;
    }
  },

  // Create / Update Rejection Invoice
  createUpdateInvoice: async (payload) => {
    try {
      const res = await apiClient.post(
        `/api/commonmaster/createUpdateRejectionInvoice`,
        payload,
      );

      return res;
    } catch (error) {
      console.error("Error saving rejection invoice:", error);
      throw error;
    }
  },
};

export default rejectionInvoiceAPI;

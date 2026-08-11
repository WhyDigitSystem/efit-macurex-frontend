import apiClient from "../apiClient";

/* Proforma Invoice API
   Mirrors the sales module API convention used in this app.
   The backend persists the header, product details, tax details and
   terms & conditions in a single transaction and keeps the complete
   proforma invoice history (server-side validation). */
const proformaInvoiceAPI = {
  // Get Proforma Invoices by Organization ID
  getProformaInvoiceByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/sales/getProformaInvoiceByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.proformaInvoiceVO || [];
    } catch (error) {
      console.error("Error fetching proforma invoices:", error);
      throw error;
    }
  },

  // Get Proforma Invoice by ID
  getProformaInvoiceById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/sales/getProformaInvoiceById?id=${id}`,
      );
      return res?.paramObjectsMap?.proformaInvoiceVO || null;
    } catch (error) {
      console.error("Error fetching proforma invoice by ID:", error);
      throw error;
    }
  },

  // Create / Update Proforma Invoice
  createUpdateProformaInvoice: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/sales/updateCreateProformaInvoice",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving proforma invoice:", error);
      throw error;
    }
  },
};

export default proformaInvoiceAPI;
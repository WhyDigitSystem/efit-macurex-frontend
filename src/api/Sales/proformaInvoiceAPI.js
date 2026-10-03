import apiClient from "../apiClient";

const proformaInvoiceAPI = {
  // Get Tax Value by HSN Code
  getTaxValue: async (hsn, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/rejectionInvoice/getTaxValue?hsn=${hsn}&orgId=${orgId}`,
      );
      return res;
    } catch (error) {
      console.error("Error fetching tax value:", error);
      throw error;
    }
  },

  // Get Proforma Invoices by Organization ID and Branch
  getProformaInvoiceByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/rejectionInvoice/getProformaInvoiceByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      const responseData = res?.paramObjectsMap?.proformaInvoiceResponseVO;
      return Array.isArray(responseData) ? responseData : [];
    } catch (error) {
      console.error("Error fetching proforma invoices:", error);
      throw error;
    }
  },

  // Get Proforma Invoice by ID
  getProformaInvoiceById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/rejectionInvoice/getProformaInvoiceById?id=${id}`,
      );
      return res?.paramObjectsMap?.proformaInvoiceResponseVO || null;
    } catch (error) {
      console.error("Error fetching proforma invoice by ID:", error);
      throw error;
    }
  },

  // 👇 NEW — Get Proforma Invoice DocId
  getProformaInvoiceDocId: async (financialYear, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/rejectionInvoice/getProformaInvoiceDocId?financialYear=${financialYear}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.invoiceDocId || null;
    } catch (error) {
      console.error("Error fetching proforma invoice docId:", error);
      throw error;
    }
  },

  // Create / Update Proforma Invoice
  createUpdateProformaInvoice: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/rejectionInvoice/createUpdateProformaInvoice",
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
import apiClient from "../apiClient";

const docketInvoiceDetailsAPI = {
  getAll: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        "/api/transaction/getDocketInvoiceByOrgId",
        {
          params: { orgId, branch },
        },
      );
      return res?.paramObjectsMap?.docketInvoiceResponseDTO || [];
    } catch (error) {
      console.error("Error fetching Docket/Invoice Details records:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get("/api/transaction/getDocketInvoiceById", {
        params: { id },
      });
      return res?.paramObjectsMap?.docketInvoiceResponseDTO || null;
    } catch (error) {
      console.error("Error fetching Docket/Invoice Details by ID:", error);
      throw error;
    }
  },

  createUpdate: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/transaction/updateCreateDocketInvoice",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving Docket/Invoice Details:", error);
      throw error;
    }
  },
  // GET /api/transaction/getDocketInvoiceDocId
  getDocketInvoiceDocId: async ({ financialYear, orgId, screenCode }) => {
    try {
      const params = new URLSearchParams({
        financialYear: String(financialYear),
        orgId: String(orgId),
        screenCode,
      });

      const response = await apiClient.get(
        `/api/transaction/getDocketInvoiceDocId?${params.toString()}`,
      );

      return response?.paramObjectsMap?.invoiceDocId || "";
    } catch (error) {
      console.error("Error fetching docket invoice doc id:", error);
      throw error;
    }
  },
};

export default docketInvoiceDetailsAPI;

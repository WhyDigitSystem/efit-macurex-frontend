import apiClient from "../apiClient";

const salesReturnAPI = {
  /* ---- List / CRUD ---- */
  getSalesReturnByOrgId: async (orgId, branchId) => {
    try {
      const response = await apiClient.get(
        `/api/transaction/getSalesReturnByOrgId?orgId=${orgId}&branchId=${branchId}`,
      );
      return response;
    } catch (error) {
      console.error("Error fetching sales returns:", error);
      throw error;
    }
  },

  getSalesReturnById: async (id) => {
    try {
      const response = await apiClient.get(
        `/api/transaction/getSalesReturnById?id=${id}`,
      );
      return response;
    } catch (error) {
      console.error("Error fetching sales return:", error);
      throw error;
    }
  },

  createUpdateSalesReturn: async (payload) => {
    try {
      const response = await apiClient.post(
        `/api/transaction/createUpdateSalesReturn`,
        payload,
      );
      return response;
    } catch (error) {
      console.error("Error saving sales return:", error);
      throw error;
    }
  },

  getSalesReturnDocId: async (orgId, branchId, financialYear) => {
    try {
      const response = await apiClient.get(
        `/api/transaction/getSalesReturnDocId?orgId=${orgId}&branchId=${branchId}&financialYear=${financialYear}`,
      );
      return response?.paramObjectsMap?.docId || "";
    } catch (error) {
      console.error("Error fetching sales return doc id:", error);
      throw error;
    }
  },

  /* ---- Lookups ---- */
  getCustomerDetails: async (orgId, branchId) => {
    try {
      const response = await apiClient.get(
        `/api/transaction/getCustomerDetailsForSalesReturn?orgId=${orgId}&branchId=${branchId}`,
      );
      return response?.paramObjectsMap?.customerDetailsList || [];
    } catch (error) {
      console.error("Error fetching customer details:", error);
      throw error;
    }
  },

  getItemDetails: async (orgId, branchId, customerId) => {
    try {
      const response = await apiClient.get(
        `/api/transaction/getItemDetailsForSalesReturn?orgId=${orgId}&branchId=${branchId}&customerId=${customerId}`,
      );
      return response?.paramObjectsMap?.itemDetailsList || [];
    } catch (error) {
      console.error("Error fetching item details:", error);
      throw error;
    }
  },

  getInvoiceDetailsByCustomer: async (orgId, branchId, customerId) => {
    try {
      const response = await apiClient.get(
        `/api/transaction/getInvoiceDetailsForSalesReturn?orgId=${orgId}&branchId=${branchId}&customerId=${customerId}`,
      );
      return response?.paramObjectsMap?.invoiceDetailsList || [];
    } catch (error) {
      console.error("Error fetching invoice details:", error);
      throw error;
    }
  },

  getGatePassByOrgId: async (orgId, branchId) => {
    try {
      const response = await apiClient.get(
        `/api/transaction/getGatePassByOrgId?orgId=${orgId}&branchId=${branchId}`,
      );
      return response?.paramObjectsMap?.gatePassList || [];
    } catch (error) {
      console.error("Error fetching gate pass list:", error);
      throw error;
    }
  },
};

export default salesReturnAPI;

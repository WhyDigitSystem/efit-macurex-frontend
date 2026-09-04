import apiClient from "../apiClient";

const salesReturnAPI = {
  /* ---- List / CRUD ---- */
  getSalesReturnByOrgId: async (orgId, branchId) => {
    try {
      const response = await apiClient.get(
        `api/transaction/getSalesReturnByOrgIdAndBranch?branch=${branchId}&orgId=${orgId}`,
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
      const response = await apiClient.put(
        `/api/transaction/createUpdateSalesReturn`,
        payload,
      );
      return response;
    } catch (error) {
      console.error("Error saving sales return:", error);
      throw error;
    }
  },

  getSalesReturnDocId: async (orgId, financialYear) => {
    try {
      const response = await apiClient.get(
        `/api/transaction/getSalesReturnDocId?financialYear=${financialYear}&orgId=${orgId}`,
      );
      return response?.paramObjectsMap?.salesReturnDocId || "";
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

  getSalesRejectionInvoiceForSalesReturn: async (orgId, branchId) => {
    try {
      const response = await apiClient.get(
        `/api/transaction/getSalesRejectionInvoiceforSalesReturn?branch=${branchId}&orgId=${orgId}`,
      );
      return response?.paramObjectsMap?.salesRejectionInvoice || [];
    } catch (error) {
      console.error("Error fetching sales rejection invoice dropdown:", error);
      return [];
    }
  },

  getCustomerDetailsForSalesRejectionInvoice: async (orgId, branchId) => {
    try {
      const response = await apiClient.get(
        `/api/transaction/getCustomerDetailsforSalesRejectionInvoice?branch=${branchId}&orgId=${orgId}`,
      );
      return response?.paramObjectsMap?.customerDetails || [];
    } catch (error) {
      console.error("Error fetching customer details For sales return:", error);
      return [];
    }
  },

  getGateInwardForSalesReturn: async (orgId, branchId, customer, invno, type) => {
    try {
      const response = await apiClient.get(
        `/api/transaction/getGateInwardForSalesReturn?branch=${branchId}&customer=${customer}&invno=${encodeURIComponent(invno || "")}&orgId=${orgId}&type=${encodeURIComponent(type || "")}`,
      );
      return response?.paramObjectsMap?.gateInwardDetails || [];
    } catch (error) {
      console.error("Error fetching gate inward for sales return:", error);
      return [];
    }
  },

  getCurrencyForSalesRejectionInvoice: async (orgId, branchId, customer) => {
    try {
      const response = await apiClient.get(
        `/api/transaction/getCurrencyforSalesRejectionInv?branch=${branchId}&customer=${customer}&orgId=${orgId}`,
      );
      return response?.paramObjectsMap?.currencyDetails || [];
    } catch (error) {
      console.error("Error fetching currency for sales return:", error);
      return [];
    }
  },

  getLocationBySalesReturnOrgId: async (orgId, branchId) => {
    try {
      const response = await apiClient.get(
        `/api/commonmaster/getLocationByOrgId?branch=${branchId}&orgId=${orgId}`,
      );
      return (
        response?.paramObjectsMap?.transportList ||
        response?.paramObjectsMap?.locationList ||
        []
      );
    } catch (error) {
      console.error("Error fetching locations for sales return:", error);
      return [];
    }
  },

  getSalesRejectionInvoiceItemDetailsForSalesReturn: async (orgId, branchId, invoiceNo) => {
    try {
      const response = await apiClient.get(
        `/api/transaction/getSalesRejectionInvoiceItemDetailsForSalesRetuen?branch=${branchId}&invoiceNo=${encodeURIComponent(invoiceNo || "")}&orgId=${orgId}`,
      );
      return response?.paramObjectsMap?.itemDetails || [];
    } catch (error) {
      console.error("Error fetching sales rejection invoice item details:", error);
      return [];
    }
  },

  getItemDetailsForSalesReturn: async (orgId, branchId) => {
    try {
      const response = await apiClient.get(
        `/api/transaction/getItemDetailsForSalesReturn?branch=${branchId}&orgId=${orgId}`,
      );
      return response?.paramObjectsMap?.itemDetails || [];
    } catch (error) {
      console.error("Error fetching item details for sales return:", error);
      return [];
    }
  },
};

export default salesReturnAPI;

// src/api/Sales/salesContract.js

import apiClient from "../apiClient";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const orderAcceptanceAPI = {
  getCustomerDropdown: async (orgId, branchId, ctype) => {
    try {
      const response = await apiClient.get(
        `/api/dhinesh/getCustomerDropdownbySalesContract?orgId=${orgId}&branch=${branchId}&ctype=${ctype}`,
      );
      return response;
    } catch (error) {
      console.error("Error fetching customers:", error);
      throw error;
    }
  },

  getQuotationDropdown: async (
    orgId,
    branchId,
    ctype,
    customerCode,
    recId,
    oldQuotationNo,
  ) => {
    try {
      let url = `/api/dhinesh/getQuotationDropdownbySalesContract?branch=${branchId}&ctype=${ctype}&customerCode=${customerCode}&orgId=${orgId}`;

      if (recId && recId !== 0) {
        url += `&recId=${recId}`;
      }

      if (oldQuotationNo) {
        url += `&oldQuotationNo=${oldQuotationNo}`;
      }

      const response = await apiClient.get(url);
      return response;
    } catch (error) {
      console.error("Error fetching quotations:", error);
      throw error;
    }
  },

  getQuotationItems: async (orgId, branchId, quotationNo) => {
    try {
      const response = await apiClient.get(
        `/api/dhinesh/getQuotationItemDropdownbySalesContract?branch=${branchId}&orgId=${orgId}&quotationNo=${quotationNo}`,
      );
      return response;
    } catch (error) {
      console.error("Error fetching quotation items:", error);
      throw error;
    }
  },

  getFinishedGoodsItems: async (orgId, branchId) => {
    try {
      const response = await apiClient.get(
        `/api/dhinesh/getFinishedGoodsItemsbySalesContract?branch=${branchId}&orgId=${orgId}`,
      );
      return response;
    } catch (error) {
      console.error("Error fetching finished goods items:", error);
      throw error;
    }
  },

  // Create or update sales contract with FormData
  createUpdateOrderAcceptance: async (formData) => {
    try {
      const response = await apiClient.put(
        `${API_BASE_URL}/api/orderAcceptance/createUpdateOrderAcceptance`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response;
    } catch (error) {
      console.error("Error creating/updating order acceptance:", error);
      throw error;
    }
  },

  // Get order acceptance by ID
  getOrderAcceptanceById: async (orderAcceptanceId) => {
    try {
      const response = await apiClient.get(
        `/api/orderAcceptance/getOrderAcceptanceById?id=${orderAcceptanceId}`,
      );
      return response;
    } catch (error) {
      console.error("Error fetching order acceptance:", error);
      throw error;
    }
  },

  // Get all sales contracts by OrgId and BranchId
  getOrderAcceptances: async (orgId, branchId) => {
    try {
      const response = await apiClient.get(
        `/api/orderAcceptance/getOrderAcceptanceByOrgId?orgId=${orgId}&branch=${branchId}`,
      );
      return response;
    } catch (error) {
      console.error("Error fetching order acceptances:", error);
      throw error;
    }
  },
  // GET /api/orderAcceptance/getOrderAcceptanceDocId
  getOrderAcceptanceDocId: async ({ financialYear, orgId, screenCode }) => {
    try {
      const params = new URLSearchParams({
        financialYear: String(financialYear),
        orgId: String(orgId),
        screenCode,
      });

      const response = await apiClient.get(
        `/api/orderAcceptance/getOrderAcceptanceDocId?${params.toString()}`,
      );

      return response?.paramObjectsMap?.invoiceDocId || "";
    } catch (error) {
      console.error("Error fetching order acceptance doc id:", error);
      throw error;
    }
  },
};

export default orderAcceptanceAPI;

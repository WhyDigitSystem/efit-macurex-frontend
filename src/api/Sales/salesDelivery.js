// src/api/Sales/salesDelivery.js

import apiClient from "../apiClient";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const salesDeliveryAPI = {
  getCustomerDropdown: async (orgId, branchId) => {
    try {
      const response = await apiClient.get(
        `/api/transaction/getCustomerDetails?orgId=${orgId}&branch=${branchId}`,
      );
      return response;
    } catch (error) {
      console.error("Error fetching customers:", error);
      throw error;
    }
  },

  getContractNoDetails: async (orgId, branchId) => {
    try {
      const response = await apiClient.get(
        `/api/transaction/getContractNoDropdown?orgId=${orgId}&branch=${branchId}`,
      );
      return response;
    } catch (error) {
      console.error("Error fetching contract numbers:", error);
      throw error;
    }
  },

  getItemDetails: async (orgId, branchId, docId) => {
    try {
      const response = await apiClient.get(
        `/api/transaction/getItemDropdownBySalesDeliverySchedule?orgId=${orgId}&branch=${branchId}&docId=${docId}`,
      );
      return response;
    } catch (error) {
      console.error("Error fetching item details:", error);
      throw error;
    }
  },

  // Create or update sales delivery with FormData
  createUpdateSalesDelivery: async (formData) => {
    try {
      const response = await apiClient.put(
        `${API_BASE_URL}/api/transaction/createUpdateSalesDeliverySchedule`,
        formData,
      );
      return response;
    } catch (error) {
      console.error("Error creating/updating sales delivery:", error);
      throw error;
    }
  },

  // Get sales contract by ID
  getSalesDeliveryById: async (salesDeliveryId) => {
    try {
      const response = await apiClient.get(
        `/api/transaction/getSalesDeliveryScheduleById?id=${salesDeliveryId}`,
      );
      return response;
    } catch (error) {
      console.error("Error fetching sales contract:", error);
      throw error;
    }
  },

  // Get all sales contracts by OrgId and BranchId
  getSalesDelivery: async (orgId, branchId) => {
    try {
      const response = await apiClient.get(
        `/api/transaction/getSalesDeliveryScheduleByOrgId?orgId=${orgId}&branch=${branchId}`,
      );
      return response;
    } catch (error) {
      console.error("Error fetching sales contracts:", error);
      throw error;
    }
  },
  // GET /api/transaction/getSalesDeliveryScheduleDocId
  getSalesDeliveryScheduleDocId: async ({
    financialYear,
    orgId,
    screenCode,
  }) => {
    try {
      const params = new URLSearchParams({
        financialYear: String(financialYear),
        orgId: String(orgId),
        screenCode,
      });

      const response = await apiClient.get(
        `/api/transaction/getSalesDeliveryScheduleDocId?${params.toString()}`,
      );

      return response?.paramObjectsMap?.invoiceDocId || "";
    } catch (error) {
      console.error("Error fetching sales delivery schedule doc id:", error);
      throw error;
    }
  },
};

export default salesDeliveryAPI;

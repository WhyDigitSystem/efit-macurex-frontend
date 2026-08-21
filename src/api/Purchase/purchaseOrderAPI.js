// src/api/Purchase/purchaseOrderAPI.js

import apiClient from "../apiClient";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const purchaseOrderAPI = {
  /* ================================================================
     CREATE / UPDATE PURCHASE ORDER
  ================================================================ */

  createUpdatePurchaseOrder: async (purchaseOrderData, files = []) => {
    try {
      const formData = new FormData();

      const purchaseOrderBlob = new Blob([JSON.stringify(purchaseOrderData)], {
        type: "application/json",
      });

      formData.append(
        "purchaseOrder",
        purchaseOrderBlob,
        "purchaseOrderDTO.json",
      );

      files.forEach((file) => {
        if (file) {
          formData.append("files", file, file.name);
        }
      });

      const response = await apiClient.put(
        `${API_BASE_URL}/api/purchaseOrder/createUpdatePurchaseOrder`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return response?.data ?? response;
    } catch (error) {
      console.error(
        "Error saving purchase order:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     GET PURCHASE ORDER BY ID
  ================================================================ */

  getPurchaseOrderById: async (id, type) => {
    try {
      const response = await apiClient.get(
        `/api/purchaseOrder/getPurchaseOrderById`,
        {
          params: {
            id,
            type,
          },
        },
      );

      return response?.data ?? response;
    } catch (error) {
      console.error(
        "Error fetching purchase order:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     GET PURCHASE ORDERS BY ORG
  ================================================================ */

  getPurchaseOrderByOrgId: async (orgId, branchId) => {
    try {
      const response = await apiClient.get(
        `/api/purchaseOrder/getPurchaseOrderByOrgId`,
        {
          params: {
            branch: branchId,
            orgId,
          },
        },
      );

      return response?.data ?? response;
    } catch (error) {
      console.error(
        "Error fetching purchase orders:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     GET PURCHASE ORDER DOCUMENT NUMBER
  ================================================================ */

  getPurchaseOrderDocId: async ({ financialYear, orgId, screenCode, type }) => {
    try {
      const response = await apiClient.get(
        `/api/purchaseOrder/getPurchaseOrderDocId`,
        {
          params: {
            financialYear,
            orgId,
            screenCode,
            type,
          },
        },
      );

      const data = response?.data ?? response;

      return data?.paramObjectsMap?.invoiceDocId || "";
    } catch (error) {
      console.error(
        "Error fetching purchase order doc id:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     VIEW ATTACHMENT
  ================================================================ */

  getViewFileUrl: (filePath) => {
    if (!filePath) {
      return "";
    }

    const cleanPath = String(filePath).replace(/^\/+/, "");

    return `${API_BASE_URL}/api/purchaseOrder/viewFile/${cleanPath}`;
  },

  /* ================================================================
     SUPPLIER DETAILS
  ================================================================ */

  getSupplierDetails: async (orgId, branchId) => {
    try {
      const response = await apiClient.get(
        `/api/purchaseOrder/getSupplierDetails`,
        {
          params: {
            branch: branchId,
            orgId,
          },
        },
      );

      return response?.data ?? response;
    } catch (error) {
      console.error(
        "Error fetching supplier details:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     LOCAL ITEM DETAILS - INDENT REQUIRED = NO
  ================================================================ */

  getItemDetailsResponsePurchaseLocal: async (branch, orgId) => {
    try {
      const response = await apiClient.get(
        `/api/purchaseOrder/getItemDetailsResponsePurchaseLocal`,
        {
          params: {
            branch,
            orgId,
          },
        },
      );

      console.log("LOCAL ITEM DETAILS API RAW RESPONSE:", response);

      return response?.data ?? response;
    } catch (error) {
      console.error(
        "Error fetching local item details:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     IMPORT ITEM DETAILS - INDENT REQUIRED = NO
  ================================================================ */

  getItemDetailsResponsePurchaseImport: async (branch, orgId) => {
    try {
      const response = await apiClient.get(
        `/api/purchaseOrder/getItemDetailsResponsePurchaseImport`,
        {
          params: {
            branch,
            orgId,
          },
        },
      );

      console.log("IMPORT ITEM DETAILS API RAW RESPONSE:", response);

      return response?.data ?? response;
    } catch (error) {
      console.error(
        "Error fetching import item details:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     EXCHANGE RATE
  ================================================================ */

  getExchangeRateDetails: async (branch, currencyId, orgId) => {
    try {
      const response = await apiClient.get(
        `/api/purchaseOrder/getExchangeRateDetails`,
        {
          params: {
            branch,
            currency: currencyId,
            orgId,
          },
        },
      );

      return response?.data ?? response;
    } catch (error) {
      console.error(
        "Error fetching exchange rate:",
        error?.response?.data || error,
      );

      throw error;
    }
  },
};

export default purchaseOrderAPI;

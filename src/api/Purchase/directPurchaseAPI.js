import apiClient from "../apiClient";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const directPurchaseAPI = {
  /* ================================================================
     CREATE / UPDATE DIRECT PURCHASE
  ================================================================ */

  createUpdateDirectPurchase: async (directPurchaseData, files = []) => {
    try {
      const formData = new FormData();

      const directPurchaseBlob = new Blob(
        [JSON.stringify(directPurchaseData)],
        { type: "application/json" },
      );

      formData.append(
        "directPurchase",
        directPurchaseBlob,
        "directPurchaseDTO.json",
      );

      files.forEach((file) => {
        if (file) {
          formData.append("files", file, file.name);
        }
      });

      const response = await apiClient.put(
        `${API_BASE_URL}/api/purchaseOrder/createUpdateDirectPurchase`,
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
        "Error saving direct purchase:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     GET DIRECT PURCHASE BY ID
  ================================================================ */

  getDirectPurchaseById: async (id) => {
    try {
      const response = await apiClient.get(
        `/api/purchaseOrder/getDirectPurchaseById`,
        {
          params: { id },
        },
      );

      return response?.data ?? response;
    } catch (error) {
      console.error(
        "Error fetching direct purchase:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     GET DIRECT PURCHASES BY ORG
  ================================================================ */

  getDirectPurchaseByOrgId: async (branch, orgId) => {
    try {
      const response = await apiClient.get(
        `/api/purchaseOrder/getDirectPurchaseByOrgId`,
        {
          params: { branch, orgId },
        },
      );

      return response?.data ?? response;
    } catch (error) {
      console.error(
        "Error fetching direct purchases:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     GET DIRECT PURCHASE DOCUMENT NUMBER
  ================================================================ */

  getDirectPurchaseDocId: async (financialYear, orgId) => {
    try {
      const response = await apiClient.get(
        `/api/purchaseOrder/getDirectPurchaseDocId`,
        {
          params: { financialYear, orgId },
        },
      );

      const data = response?.data ?? response;

      return data?.paramObjectsMap?.invoiceDocId || "";
    } catch (error) {
      console.error(
        "Error fetching direct purchase doc id:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     ISSUE TO
  ================================================================ */

  getIssueTo: async (branch, orgId) => {
    try {
      const response = await apiClient.get(`/api/purchaseOrder/getIssueTo`, {
        params: { branch, orgId },
      });

      const data = response?.data ?? response;

      return data?.paramObjectsMap?.mapp || [];
    } catch (error) {
      console.error("Error fetching Issue To:", error?.response?.data || error);

      throw error;
    }
  },

  /* ================================================================
     SUPPLIER DETAILS
  ================================================================ */

  getSupplierDetails: async (branch, orgId) => {
    try {
      const response = await apiClient.get(
        `/api/purchaseOrder/getSupplierDetails`,
        {
          params: { branch, orgId },
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
     VIEW ATTACHMENT
  ================================================================ */

  getViewFileUrl: (filePath) => {
    if (!filePath) {
      return "";
    }

    const cleanPath = String(filePath).replace(/^\/+/, "");

    return `${API_BASE_URL}/api/purchaseOrder/viewDirectPurchaseFile/${cleanPath}`;
  },
};

export default directPurchaseAPI;

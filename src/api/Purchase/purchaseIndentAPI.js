// api/Purchase/purchaseIndentAPI.js
import apiClient from "../apiClient";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const purchaseIndentAPI = {
  updateCreatePurchaseIndent: async (formData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/purchaseservice/createUpdatePurchaseIndent`,
        formData,
      );

      return response.data;
    } catch (error) {
      console.error("Error saving purchase indent:", error);
      console.error("Status:", error.response?.status);
      console.error("Backend response:", error.response?.data);
      throw error;
    }
  },

  // GET method - Get Purchase Indents by OrgId and Branch
  getPurchaseIndentByOrgId: async (orgId, branchId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/purchaseservice/getPurchaseIndentByOrgId`,
        {
          params: {
            orgId: orgId,
            branch: branchId,
          },
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching purchase indents:", error);
      throw error;
    }
  },

  // GET method - Get Purchase Indent by ID for editing
  getPurchaseIndentById: async (id) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/purchaseservice/getPurchaseIndentById`,
        {
          params: {
            id: id,
          },
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching purchase indent:", error);
      throw error;
    }
  },

  // GET method - Download file
  downloadFile: async (filePath) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/files/download`, {
        params: {
          path: filePath,
        },
        responseType: "blob",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error downloading file:", error);
      throw error;
    }
  },

  // GET /api/develop/getPurchaseIndentDocId (adjust screenCode/path if your
  // backend exposes a different doc-numbering endpoint for indents)
  getPurchaseIndentDocId: async ({ financialYear, orgId, screenCode }) => {
    try {
      const params = new URLSearchParams({
        financialYear,
        orgId,
        screenCode,
      });

      const res = await apiClient.get(
        `/api/develop/getPurchaseIndentDocId?${params.toString()}`,
      );

      return res?.paramObjectsMap?.invoiceDocId || "";
    } catch (error) {
      console.error("Error fetching purchase indent doc id:", error);
      throw error;
    }
  },
  // GET method - Get item dropdown for Purchase Indent (Indent No. selection on PO)
  getPurchaseIndentItemDropdown: async (branch, orgId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/purchaseservice/getPurchaseIndentItemDropdown`,
        {
          params: {
            branch: branch,
            orgId: orgId,
          },
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching purchase indent item dropdown:", error);
      throw error;
    }
  },
};

export default purchaseIndentAPI;

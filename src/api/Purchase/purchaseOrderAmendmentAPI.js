import apiClient from "../apiClient";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
  let token =
    localStorage.getItem("user.token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    JSON.parse(localStorage.getItem("user") || "{}")?.token;

  if (token) token = token.replace("Bearer ", "");

  return token ? { Authorization: `Bearer ${token}` } : {};
};

const purchaseOrderAmendmentAPI = {
  getAll: async (orgId) => {
    try {
      const res = await apiClient.get(
        "/api/develop/getPurchaseOrderAmendmentByOrgId",
        {
          params: { orgId: Number(orgId) },
        },
      );
      return res?.paramObjectsMap?.purchaseOrderAmendmentResponseVO || [];
    } catch (error) {
      console.error("Error fetching PO amendments:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get(
        "/api/develop/getPurchaseOrderAmendmentById",
        {
          params: { id: Number(id) },
        },
      );
      return (
        res?.paramObjectsMap?.purchaseOrderAmendmentResponseVO || null
      );
    } catch (error) {
      console.error("Error fetching PO amendment by id:", error);
      throw error;
    }
  },

  getItemCodeDropdown: async (branch, docId, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/develop/getPurchaseOrderAmendmentItemCodeDropdown",
        {
          params: {
            branch: Number(branch),
            docId,
            orgId: Number(orgId),
          },
        },
      );
      return res?.paramObjectsMap?.itemCodeDropdown || [];
    } catch (error) {
      console.error("Error fetching PO Amendment item code dropdown:", error);
      throw error;
    }
  },

  getDocId: async ({ financialYear, orgId, screenCode }) => {
    try {
      const res = await apiClient.get(
        "/api/develop/getPurchaseOrderAmendmentDocId",
        {
          params: {
            financialYear,
            orgId: Number(orgId),
            screenCode,
          },
        },
      );
      return res?.paramObjectsMap?.purchaseOrderAmendmentDocId || "";
    } catch (error) {
      console.error("Error fetching PO Amendment doc id:", error);
      throw error;
    }
  },

  getRevisionNo: async ({ branch, orgId, purchaseOrderNumber }) => {
    try {
      const res = await apiClient.get(
        "/api/develop/getPurchaseOrderAmdRevisionNo",
        {
          params: {
            branch: Number(branch),
            orgId: Number(orgId),
            purchaseOrderNumber,
          },
        },
      );
      return res?.paramObjectsMap?.revisionNo ?? 0;
    } catch (error) {
      console.error("Error fetching PO Amendment revision no:", error);
      throw error;
    }
  },

  getPurchaseOrderDropdownForPurchaseOrderAmendment: async ({
    branch,
    customerId,
    orgId,
  }) => {
    try {
      const res = await apiClient.get(
        "/api/purchasedeliveryschedule/getPurchaseOrderDropdownForPurchaseOrderAmendment",
        {
          params: {
            branch: Number(branch),
            customerId: Number(customerId),
            orgId: Number(orgId),
          },
        },
      );
      return res?.paramObjectsMap?.purchaseOrderDropdown || [];
    } catch (error) {
      console.error(
        "Error fetching PO dropdown for PO Amendment:",
        error,
      );
      throw error;
    }
  },

  createUpdate: async (formData) => {
    try {
      const response = await apiClient.post(
        `${API_BASE_URL}/api/develop/updateCreatePurchaseOrderAmendment`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return response;
    } catch (error) {
      console.error("Error creating/updating PO amendment:", error);
      throw error;
    }
  },

  getCurrencyExchangeRateforPurchaseOrderAmendment: async (branch, docId, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/develop/getCurrencyExchangeRateforPurchaseOrderAmendment",
        {
          params: {
            branch: Number(branch),
            docId,
            orgId: Number(orgId),
          },
        },
      );
      return res?.paramObjectsMap?.currencyDetails || [];
    } catch (error) {
      console.error(
        "Error fetching currency exchange rate for PO Amendment:",
        error,
      );
      throw error;
    }
  },

  getUnitMasterByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        "/api/commonmaster/getUnitMasterByOrgId",
        {
          params: { orgId: Number(orgId) },
        },
      );
      return res?.paramObjectsMap?.unitMasterList || [];
    } catch (error) {
      console.error("Error fetching unit master by org:", error);
      throw error;
    }
  },

  getListValuesGroup: async (listDescription, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/commonmaster/getListValuesGroup",
        {
          params: {
            listDescription,
            orgId: Number(orgId),
          },
        },
      );
      return res?.paramObjectsMap?.listValues || [];
    } catch (error) {
      console.error(
        "Error fetching list values group:",
        error,
      );
      throw error;
    }
  },
};

export default purchaseOrderAmendmentAPI;

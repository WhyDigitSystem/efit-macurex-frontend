// api/Purchase/purchaseOrderAPI.js
import apiClient from "../apiClient";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const purchaseOrderAPI = {
  // PUT /api/purchaseOrder/createUpdatePurchaseOrder (multipart/form-data)
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
        if (file) formData.append("files", file, file.name);
      });

      const response = await apiClient.put(
        `${API_BASE_URL}/api/purchaseOrder/createUpdatePurchaseOrder`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return response;
    } catch (error) {
      console.error("Error saving purchase order:", error);
      throw error;
    }
  },

  // GET /api/purchaseOrder/getPurchaseOrderById?id=&type=
  getPurchaseOrderById: async (id, type) => {
    try {
      const response = await apiClient.get(
        `/api/purchaseOrder/getPurchaseOrderById?id=${id}&type=${type}`,
      );
      return response;
    } catch (error) {
      console.error("Error fetching purchase order:", error);
      throw error;
    }
  },

  // GET /api/purchaseOrder/getPurchaseOrderByOrgId?branch=&orgId=
  getPurchaseOrderByOrgId: async (orgId, branchId) => {
    try {
      const response = await apiClient.get(
        `/api/purchaseOrder/getPurchaseOrderByOrgId?branch=${branchId}&orgId=${orgId}`,
      );
      return response;
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      throw error;
    }
  },

  // GET /api/purchaseOrder/getPurchaseOrderDocId?financialYear=&orgId=&screenCode=&type=
  getPurchaseOrderDocId: async ({ financialYear, orgId, screenCode, type }) => {
    try {
      const params = new URLSearchParams({
        financialYear: String(financialYear),
        orgId: String(orgId),
        screenCode,
        type,
      });

      const response = await apiClient.get(
        `/api/purchaseOrder/getPurchaseOrderDocId?${params.toString()}`,
      );

      return response?.paramObjectsMap?.invoiceDocId || "";
    } catch (error) {
      console.error("Error fetching purchase order doc id:", error);
      throw error;
    }
  },

  // GET /api/purchaseOrder/viewFile/** - builds the viewable URL for an attachment
  getViewFileUrl: (filePath) => {
    if (!filePath) return "";
    // filePath may already include leading slashes from the backend - normalize
    const cleanPath = String(filePath).replace(/^\/+/, "");
    return `${API_BASE_URL}/api/purchaseOrder/viewFile/${cleanPath}`;
  },
  // GET /api/purchaseOrder/getSupplierDetails?branch=&orgId=
  getSupplierDetails: async (orgId, branchId) => {
    try {
      const response = await apiClient.get(
        `/api/purchaseOrder/getSupplierDetails?branch=${branchId}&orgId=${orgId}`,
      );
      return response;
    } catch (error) {
      console.error("Error fetching supplier details:", error);
      throw error;
    }
  },
};

export default purchaseOrderAPI;

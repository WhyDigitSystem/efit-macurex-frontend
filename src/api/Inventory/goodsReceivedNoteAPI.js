import apiClient from "../apiClient";

export const goodsReceivedNoteAPI = {
  getGrnById: async (id) => {
    try {
      const res = await apiClient.get(`/api/grn/getGrnById?id=${id}`);
      // API returns { paramObjectsMap: { grnVO: { ...single GRN... } } }
      return res?.paramObjectsMap?.grnVO || null;
    } catch (error) {
      console.error("Error fetching GRN by ID:", error);
      throw error;
    }
  },

  getGrnByOrgId: async (branch, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/grn/getGrnByOrgId?branch=${branch}&orgId=${orgId}`
      );
      return res?.paramObjectsMap?.grnVO || [];
    } catch (error) {
      console.error("Error fetching GRN list:", error);
      throw error;
    }
  },

  getSupplierDetailsForGrn: async (branch, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/grn/getSupplierDetailsForGrn?branch=${branch}&orgId=${orgId}`
      );
      return res;
    } catch (error) {
      console.error("Error fetching supplier details for GRN:", error);
      throw error;
    }
  },

  getGatePassDocIdDetails: async (branch, orgId, supplierCode) => {
    try {
      const res = await apiClient.get(
        `/api/grn/getGatePassDocIdDetails?branch=${branch}&orgId=${orgId}&supplierCode=${supplierCode}`
      );
      return res;
    } catch (error) {
      console.error("Error fetching gate pass details:", error);
      throw error;
    }
  },

  getPurchaseOrderNoBasedDocId: async (branch, gatePass, orgId, supplierCode) => {
    try {
      const res = await apiClient.get(
        `/api/grn/getPurchaseOrderNoBasedDocId?branch=${branch}&gatePass=${gatePass}&orgId=${orgId}&supplierCode=${supplierCode}`
      );
      return res;
    } catch (error) {
      console.error("Error fetching purchase order details:", error);
      throw error;
    }
  },

  getPoNumberBasedItemDetails: async (branch, orgId, purchaseOrderNo) => {
    try {
      const res = await apiClient.get(
        `/api/grn/getPoNmberBasedItemDetails?branch=${branch}&orgId=${orgId}&purchaseOrderNo=${encodeURIComponent(purchaseOrderNo)}`
      );
      return res;
    } catch (error) {
      console.error("Error fetching PO item details:", error);
      throw error;
    }
  },

  getPurchaseOrderNumberImportGrn: async (branch, orgId, supplierCode) => {
    try {
      const res = await apiClient.get(
        `/api/grn/getPurchaseOrderNumberImportGrn?branch=${branch}&orgId=${orgId}&supplierCode=${supplierCode}`
      );
      return res;
    } catch (error) {
      console.error("Error fetching import PO numbers:", error);
      throw error;
    }
  },

  getItemDetailsForImportGrn: async (branch, orgId, purchaseOrderNo, supplierCode) => {
    try {
      const res = await apiClient.get(
        `/api/grn/getItemDetailsForImportGrn?branch=${branch}&orgId=${orgId}&purchaseOrderNo=${encodeURIComponent(purchaseOrderNo)}&supplierCode=${supplierCode}`
      );
      return res;
    } catch (error) {
      console.error("Error fetching import item details:", error);
      throw error;
    }
  },

  getTaxValue: async (hsn, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/rejectionInvoice/getTaxValue?hsn=${hsn}&orgId=${orgId}`
      );
      return res;
    } catch (error) {
      console.error("Error fetching tax value:", error);
      throw error;
    }
  },

  getExchangeRateDetails: async (branch, currency, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/purchaseOrder/getExchangeRateDetails?branch=${branch}&currency=${currency}&orgId=${orgId}`
      );
      return res;
    } catch (error) {
      console.error("Error fetching exchange rate details:", error);
      throw error;
    }
  },

  getGrnDocId: async (financialYear, orgId, type = "Local") => {
    try {
      const res = await apiClient.get(
        `/api/grn/getGrnDocId?financialYear=${financialYear}&orgId=${orgId}&type=${type}`
      );
      return res;
    } catch (error) {
      console.error("Error fetching GRN docId:", error);
      throw error;
    }
  },

  getScheduleDocIdDetails: async (branch, orgId, supplier) => {
    try {
      const res = await apiClient.get(
        `/api/grn/getScheduleDocIdDetails?branch=${branch}&orgId=${orgId}&supplier=${supplier}`
      );
      return res;
    } catch (error) {
      console.error("Error fetching schedule details:", error);
      throw error;
    }
  },

  updateCreateGrn: async (grnDTO, files = []) => {
    try {
      const formData = new FormData();

      formData.append(
        "grn",
        new Blob([JSON.stringify(grnDTO)], { type: "application/json" })
      );

      (files || []).forEach((f) => {
        if (f) formData.append("files", f);
      });

      const res = await apiClient.put(
        "/api/grn/createUpdateGrn",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return res;
    } catch (error) {
      console.error("Error creating/updating GRN:", error);
      throw error;
    }
  },

  uploadInvoiceCopy: async (grnId, file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("grnId", grnId);

      const res = await apiClient.post(
        "/api/purchasemaster/uploadGrnInvoiceCopy",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return res;
    } catch (error) {
      console.error("Error uploading invoice copy:", error);
      throw error;
    }
  },
};

export default goodsReceivedNoteAPI;
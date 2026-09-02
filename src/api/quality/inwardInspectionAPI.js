import apiClient from "../apiClient";

const inwardInspectionAPI = {
  getInwardInspectionByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/inwardinspection/getInwardInspectionByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.inwardInspectionVO || [];
    } catch (error) {
      console.error("Error fetching inward inspections:", error);
      throw error;
    }
  },

  getInwardInspectionById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/inwardinspection/getInwardInspectionById?id=${id}`,
      );
      return res?.paramObjectsMap?.inwardInspectionVO || null;
    } catch (error) {
      console.error("Error fetching inward inspection by ID:", error);
      throw error;
    }
  },

  createUpdateInwardInspection: async (payload) => {
    try {
      const isFormData = payload instanceof FormData;
      const config = {
        headers: isFormData ? {
          "Content-Type": "multipart/form-data",
        } : {},
      };

      const res = await apiClient.put(
        "/api/inwardinspection/createUpdateInwardInspection",
        payload,
        config,
      );
      return res;
    } catch (error) {
      console.error("Error saving inward inspection:", error);
      throw error;
    }
  },

  getInwardInspectionDocId: async (financialYear, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/inwardinspection/getInwardInspectionDocId?financialYear=${financialYear}&orgId=${orgId}`,
      );
      return res;
    } catch (error) {
      console.error("Error fetching inward inspection doc ID:", error);
      throw error;
    }
  },

  getSupplierDetailsShortClose: async (branch, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/purchaseOrder/getSupplierDetailsShortClose?branch=${branch}&orgId=${orgId}`,
      );
      return res;
    } catch (error) {
      console.error("Error fetching supplier details:", error);
      throw error;
    }
  },

  getGrnNoDetails: async (branch, orgId, supplierCode) => {
    try {
      const res = await apiClient.get(
        `/api/inwardinspection/getMirnGrnNo?branch=${branch}&orgId=${orgId}&supplierCode=${supplierCode}`,
      );
      return res;
    } catch (error) {
      console.error("Error fetching GRN details:", error);
      throw error;
    }
  },

  getGrnItemDetails: async (branch, orgId, purchaseOrderNo, supplierCode) => {
    try {
      const res = await apiClient.get(
        `/api/inwardinspection/getMirnGrnNoItemDetails?branch=${branch}&orgId=${orgId}&purchaseOrderNo=${encodeURIComponent(purchaseOrderNo)}&supplierCode=${supplierCode}`,
      );
      return res;
    } catch (error) {
      console.error("Error fetching GRN item details:", error);
      throw error;
    }
  },
};

export default inwardInspectionAPI;
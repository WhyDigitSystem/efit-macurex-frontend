import apiClient from "../apiClient";

const bomMasterAPI = {

  getBillOfMaterialByOrgId: async (branch, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/purchaseOrder/getBillOfMaterialByOrgId",
        { params: { branch, orgId } },
      );
      return res?.paramObjectsMap?.billOfMaterialResponseVO || [];
    } catch (error) {
      console.error("Error fetching BOM list:", error);
      throw error;
    }
  },

  getBillOfMaterialById: async (id) => {
    try {
      const res = await apiClient.get(
        "/api/purchaseOrder/getBillOfMaterialById",
        { params: { id } },
      );
      return res?.paramObjectsMap?.billOfMaterialResponseVO || null;
    } catch (error) {
      console.error("Error fetching Bill of Material by id:", error);
      throw error;
    }
  },

  getGridDetailsFromBom: async (branch, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/purchaseOrder/getGridDetailsFromBom",
        { params: { branch, orgId } },
      );
      return res?.paramObjectsMap?.mapp || [];
    } catch (error) {
      console.error("Error fetching grid details from BOM:", error);
      throw error;
    }
  },

  createUpdateBillOfMaterial: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/purchaseOrder/createUpdateBillOfMaterial",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving Bill of Material:", error);
      throw error;
    }
  },

  getBillOfMaterialDocId: async (financialYear, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/purchaseOrder/getBillOfMaterialDocId",
        { params: { financialYear, orgId } },
      );
      return res?.paramObjectsMap?.billOfMaterialDocId || "";
    } catch (error) {
      console.error("Error fetching BOM doc id:", error);
      throw error;
    }
  },

  getFgAndSfgItemDetails: async (branch, orgId, type) => {
    try {
      const res = await apiClient.get(
        "/api/purchaseOrder/getFgAndSfgItemDetails",
        { params: { branch, orgId, type } },
      );
      return res?.paramObjectsMap?.mapp || [];
    } catch (error) {
      console.error("Error fetching FG/SFG item details:", error);
      throw error;
    }
  },

  getFillDetailsOf: async (branch, fgItem, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/purchaseOrder/getFillDetailsOf",
        { params: { branch, fgItem, orgId } },
      );
      return res?.paramObjectsMap?.mapp || [];
    } catch (error) {
      console.error("Error fetching fill details of:", error);
      throw error;
    }
  },

  // src/api/bomMasterAPI.js  (add inside the existing object)
  getScrapDetailsItem: async (branch, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/purchaseOrder/getScrapDetailsItem",
        { params: { branch, orgId } },
      );
      return res?.paramObjectsMap?.mapp || [];
    } catch (error) {
      console.error("Error fetching scrap details items:", error);
      throw error;
    }
  },
};

export default bomMasterAPI;
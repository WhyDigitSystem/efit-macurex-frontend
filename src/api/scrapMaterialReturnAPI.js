// scrapMaterialReturnAPI.js
import apiClient from "./apiClient";

const BASE = "/api/vendorComplaintEntry";

const scrapMaterialReturnAPI = {
  /* ------------------------- CRUD ------------------------- */

  // List by Organization + Branch
  getScrapMaterialReturnByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `${BASE}/getScrapMaterialReturnRejectionByOrgId`,
        { params: { branch, orgId } },
      );
      return res?.paramObjectsMap?.scrapMaterialReturnRejectionList || [];
    } catch (error) {
      console.error("Error fetching scrap/material return records:", error);
      throw error;
    }
  },

  // NOTE: server returns { status:false, "... Not Found" } for unknown ids.
  // The VO key below is a guess - verify against a real saved record.
  getScrapMaterialReturnById: async (id) => {
    try {
      const res = await apiClient.get(
        `${BASE}/getScrapMaterialReturnRejectionById`,
        { params: { id } },
      );
      if (!res?.status) return null;
      const pm = res?.paramObjectsMap || {};
      return (
        pm.scrapMaterialReturnRejectionVO ||
        pm.scrapMaterialReturnRejection ||
        null
      );
    } catch (error) {
      console.error("Error fetching scrap/material return by ID:", error);
      throw error;
    }
  },

  getDocId: async (financialYear, orgId) => {
    try {
      const res = await apiClient.get(
        `${BASE}/getScrapMaterialReturnRejectionDocId`,
        { params: { financialYear, orgId } },
      );
      return res?.paramObjectsMap?.docId || "";
    } catch (error) {
      console.error("Error fetching scrap/material return doc id:", error);
      throw error;
    }
  },

  createUpdateScrapMaterialReturn: async (payload) => {
    try {
      const res = await apiClient.put(
        `${BASE}/updateCreateScrapMaterialReturnRejection`,
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving scrap/material return record:", error);
      throw error;
    }
  },

  /* ------------------------- Dropdowns ------------------------- */

  // [{ id, valuesDescription }]
  getEntryFor: async (orgId) => {
    const res = await apiClient.get("/api/commonmaster/getListValuesGroup", {
      params: { listDescription: "ENTRY FOR", orgId },
    });
    return res?.paramObjectsMap?.listValues || [];
  },

  // [{ id, vendorCode, supplierName }]
  getVendors: async (branch, orgId) => {
    const res = await apiClient.get(
      `${BASE}/getVendorCodeDropdownForSupplierChangeRequest`,
      { params: { branch, orgId } },
    );
    return res?.paramObjectsMap?.vendorCode || [];
  },

  // [{ id, locationId, locationName, ... }]
  getToLocations: async (branch, orgId) => {
    const res = await apiClient.get("/api/commonmaster/getLocationByOrgId", {
      params: { branch, orgId },
    });
    return res?.paramObjectsMap?.transportList || [];
  },

  // [{ id, locationId, locationName }]
  getVendorLocations: async (branch, orgId) => {
    const res = await apiClient.get(
      `${BASE}/getScrapLocationDropdownForDailyInspectionCumRejection`,
      { params: { branch, orgId } },
    );
    return res?.paramObjectsMap?.rejectionLocationList || [];
  },
};

export default scrapMaterialReturnAPI;

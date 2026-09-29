import apiClient from "../apiClient";

const VCE = "/api/vendorComplaintEntry";
const CM = "/api/commonmaster";
const SC = "/api/subContract";

// The backend answers 200 with { status: false, ... } when nothing is found,
// so "not found" must be treated as an empty result, not as a crash.
const getMap = (res) => res?.paramObjectsMap || {};

const firstArray = (map) => Object.values(map).find(Array.isArray) || [];

// Pick the list under a known key, fall back to the first array in the map
const listFrom = (res, ...keys) => {
  const map = getMap(res);
  for (const k of keys) if (Array.isArray(map[k])) return map[k];
  return firstArray(map);
};

const dailyInspectionCumRejectionDataAPI = {
  // List screen. Returns [] when the backend says "No ... Found".
  getDICRByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `${VCE}/getDailyInspectionCumRejectionDataByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      if (Array.isArray(res)) return res;
      if (res?.status === false) return [];
      return listFrom(res);
    } catch (error) {
      console.error("Error fetching DICR:", error);
      throw error;
    }
  },

  // Edit screen. Returns null when not found (Master falls back to the row).
  getDICRById: async (id) => {
    try {
      const res = await apiClient.get(
        `${VCE}/getDailyInspectionCumRejectionDataById?id=${id}`,
      );
      if (res?.status === false) return null;
      const entry = Object.entries(getMap(res)).find(
        ([k, v]) =>
          k !== "message" && k !== "errorMessage" && v && typeof v === "object",
      );
      const value = entry?.[1];
      return Array.isArray(value) ? value[0] || null : value || null;
    } catch (error) {
      console.error("Error fetching DICR by ID:", error);
      throw error;
    }
  },

  // Document number for a new record. "" when the backend has none yet.
  getDICRDocId: async (financialYear, orgId) => {
    try {
      const res = await apiClient.get(
        `${VCE}/getDailyInspectionCumRejectionDataDocId?financialYear=${financialYear}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.docId || "";
    } catch (error) {
      console.error("Error fetching DICR doc id:", error);
      return "";
    }
  },

  createUpdateDICR: async (payload) => {
    try {
      return await apiClient.put(
        `${VCE}/updateCreateDailyInspectionCumRejectionData`,
        payload,
      );
    } catch (error) {
      console.error("Error saving DICR:", error);
      throw error;
    }
  },

  /* ---------------- Dropdowns ---------------- */

  // FG Item Code -> paramObjectsMap.itemDetails
  // [{ itemId, itemCode, itemDescription, unitId, ... }]
  getFgItems: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `${SC}/getFGItemsforBOMCorrectionRequestNote?branch=${branch}&orgId=${orgId}`,
      );
      return listFrom(res, "itemDetails");
    } catch (error) {
      console.error("Error fetching FG items:", error);
      throw error;
    }
  },

  getFromLocations: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `${VCE}/getFromLocationDropdownForDailyInspectionCumRejection?branch=${branch}&orgId=${orgId}`,
      );
      return listFrom(res, "fromLocationList");
    } catch (error) {
      console.error("Error fetching from locations:", error);
      throw error;
    }
  },

  getReworkLocations: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `${VCE}/getReworkLocationDropdownForDailyInspectionCumRejection?branch=${branch}&orgId=${orgId}`,
      );
      return listFrom(res, "reworkLocationList");
    } catch (error) {
      console.error("Error fetching rework locations:", error);
      throw error;
    }
  },

  getRejectionLocations: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `${VCE}/getRejectionLocationDropdownForDailyInspectionCumRejection?branch=${branch}&orgId=${orgId}`,
      );
      return listFrom(res, "rejectionLocationList");
    } catch (error) {
      console.error("Error fetching rejection locations:", error);
      throw error;
    }
  },

  // The scrap endpoint currently returns its list under "rejectionLocationList"
  getScrapLocations: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `${VCE}/getScrapLocationDropdownForDailyInspectionCumRejection?branch=${branch}&orgId=${orgId}`,
      );
      return listFrom(res, "scrapLocationList", "rejectionLocationList");
    } catch (error) {
      console.error("Error fetching scrap locations:", error);
      throw error;
    }
  },

  // To Location -> generic location master
  getToLocations: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `${CM}/getLocationByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.transportList || [];
    } catch (error) {
      console.error("Error fetching to locations:", error);
      throw error;
    }
  },

  // Belongs To
  getBelongsTo: async (orgId) => {
    try {
      const res = await apiClient.get(
        `${CM}/getListValuesGroup?listDescription=${encodeURIComponent("BELONGS TO")}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.listValues || [];
    } catch (error) {
      console.error("Error fetching belongs to values:", error);
      throw error;
    }
  },
};

export default dailyInspectionCumRejectionDataAPI;

import apiClient from "../apiClient";

const QSN = "/api/vendorComplaintEntry";
const CM = "/api/commonmaster";
const EM = "/api/efitmaster";

const qualityScrapNoteAPI = {
  // Returns a plain array (not wrapped in paramObjectsMap)
  getQualityScrapNoteByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `${QSN}/getQualityScrapNoteByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      return Array.isArray(res)
        ? res
        : res?.paramObjectsMap?.qualityScrapNoteVO || [];
    } catch (error) {
      console.error("Error fetching quality scrap notes:", error);
      throw error;
    }
  },

  getQualityScrapNoteDocId: async (financialYear, orgId) => {
    try {
      const res = await apiClient.get(
        `${QSN}/getQualityScrapNoteDocId?financialYear=${financialYear}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.docId || "";
    } catch (error) {
      console.error("Error fetching scrap note doc id:", error);
      throw error;
    }
  },

  createUpdateQualityScrapNote: async (payload) => {
    try {
      return await apiClient.put(
        `${QSN}/updateCreateQualityScrapNote`,
        payload,
      );
    } catch (error) {
      console.error("Error saving quality scrap note:", error);
      throw error;
    }
  },

  // From / To Location
  getLocations: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `${CM}/getLocationByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.transportList || [];
    } catch (error) {
      console.error("Error fetching locations:", error);
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

  // Department
  getDepartments: async (orgId) => {
    try {
      const res = await apiClient.get(
        `${EM}/getAllDepartmentByOrgId?orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.departmentVO || [];
    } catch (error) {
      console.error("Error fetching departments:", error);
      throw error;
    }
  },
};

export default qualityScrapNoteAPI;

import apiClient from "../apiClient";

/* Material Planning API */
const materialPlanningAPI = {
  /* ---------------- Doc ID ---------------- */
  getDocId: async ({ financialYear, orgId }) => {
    try {
      const res = await apiClient.get(
        `/api/subContract/getMaterialPlanningDocId?financialYear=${financialYear}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.materialPlanningDocId || "";
    } catch (error) {
      console.error("Error fetching Material Planning DocId:", error);
      throw error;
    }
  },

  /* ---------------- List by Org ---------------- */
  getByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getMaterialPlanningByOrgId?orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.materialPlanningList || [];
    } catch (error) {
      console.error("Error fetching material planning records:", error);
      throw error;
    }
  },

  /* ---------------- List by Org + Branch ---------------- */
  getByOrgIdAndBranch: async ({ branch, orgId }) => {
    try {
      const res = await apiClient.get(
        `/api/subContract/getMaterialPlanningByOrgIdAndBranch?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.materialPlanning || [];
    } catch (error) {
      console.error(
        "Error fetching material planning by org & branch:",
        error,
      );
      throw error;
    }
  },

  /* ---------------- Get by Id ---------------- */
  getById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/subContract/getMaterialPlanningById?id=${id}`,
      );
      return res?.paramObjectsMap?.materialPlanning || null;
    } catch (error) {
      console.error("Error fetching material planning by id:", error);
      throw error;
    }
  },

  /* ---------------- Save (create / update) ---------------- */
  createUpdate: async (data) => {
    try {
      const res = await apiClient.put(
        "/api/subContract/createUpdateMaterialPlanning",
        data,
      );
      return res;
    } catch (error) {
      console.error("Error saving material planning:", error);
      throw error;
    }
  },
};

export default materialPlanningAPI;
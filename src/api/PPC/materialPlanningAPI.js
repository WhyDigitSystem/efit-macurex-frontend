import apiClient from "../apiClient";

/* Material Planning API
   Mirrors the commonmaster API convention used across this app.
   The backend persists the planning header + execution records in a single
   transaction, links the record to the selected MRP Type / date range and
   keeps the complete planning history for audit purposes (server-side
   validation). */
const materialPlanningAPI = {
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

  getById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getMaterialPlanningById?id=${id}`,
      );
      return res?.paramObjectsMap?.materialPlanningVO || null;
    } catch (error) {
      console.error("Error fetching material planning by id:", error);
      throw error;
    }
  },

  createUpdate: async (data) => {
    try {
      const res = await apiClient.post(
        "/api/commonmaster/createUpdateMaterialPlanning",
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
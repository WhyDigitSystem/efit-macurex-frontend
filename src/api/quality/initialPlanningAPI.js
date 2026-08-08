import apiClient from "../apiClient";

export const initialPlanningAPI = {
  getInitialPlannings: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/quality/initialplanning?orgid=${orgId}`
      );
      return res?.paramObjectsMap?.initialPlanningVOList || res?.data || [];
    } catch (error) {
      console.error("Error fetching initial plannings:", error);
      throw error;
    }
  },

  getInitialPlanningById: async (planningId) => {
    try {
      const res = await apiClient.get(
        `/api/quality/initialplanning/${planningId}`
      );
      return res?.paramObjectsMap?.initialPlanningVO || null;
    } catch (error) {
      console.error("Error fetching initial planning by ID:", error);
      throw error;
    }
  },

  createUpdateInitialPlanning: async (planningDTO) => {
    try {
      const res = await apiClient.post(
        "/api/quality/createUpdateInitialPlanning",
        planningDTO
      );
      return res;
    } catch (error) {
      console.error("Error creating/updating initial planning:", error);
      throw error;
    }
  },

  getInitialPlanningHistory: async (planningId) => {
    try {
      const res = await apiClient.get(
        `/api/quality/initialplanning/${planningId}/history`
      );
      return res?.paramObjectsMap?.initialPlanningHistoryVOList || [];
    } catch (error) {
      console.error("Error fetching initial planning history:", error);
      throw error;
    }
  },
};

export default initialPlanningAPI;

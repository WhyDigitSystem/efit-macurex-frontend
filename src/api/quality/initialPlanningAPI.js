import apiClient from "../apiClient";

export const initialPlanningAPI = {
  getInitialPlannings: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/initialPlanning/getInitialPlanningByOrgId?orgId=${orgId}`
      );
      return res?.paramObjectsMap?.initialPlanningVO || [];
    } catch (error) {
      console.error("Error fetching initial plannings:", error);
      throw error;
    }
  },

  getInitialPlanningById: async (planningId) => {
    try {
      const res = await apiClient.get(
        `/api/initialPlanning/getInitialPlanningById?id=${planningId}`
      );
      return res?.paramObjectsMap?.initialPlanningVO || null;
    } catch (error) {
      console.error("Error fetching initial planning by ID:", error);
      throw error;
    }
  },

  createUpdateInitialPlanning: async (planningDTO) => {
    try {
      const res = await apiClient.put(
        "/api/initialPlanning/updateCreateInitialPlanning",
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

  getInitialPlanningDocId: async (financialYear, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/initialPlanning/getInitialPlanningDocId?financialYear=${financialYear}&orgId=${orgId}`
      );
      return res;
    } catch (error) {
      console.error("Error fetching initial planning doc ID:", error);
      throw error;
    }
  },

  getItemDropdownForInitialPlanning: async (itemType, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/initialPlanning/getItemDropdownForInitialPlanning?itemType=${itemType}&orgId=${orgId}`
      );
      return res?.paramObjectsMap?.itemList || [];
    } catch (error) {
      console.error("Error fetching item dropdown:", error);
      throw error;
    }
  },

  getParameterDropdownForInitialPlanning: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/initialPlanning/getParameterDropdownForInitialPlanning?orgId=${orgId}`
      );
      return res?.paramObjectsMap?.parameterList || [];
    } catch (error) {
      console.error("Error fetching parameter dropdown:", error);
      throw error;
    }
  },
};

export default initialPlanningAPI;
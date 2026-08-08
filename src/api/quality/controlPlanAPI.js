import apiClient from "../apiClient";

export const controlPlanAPI = {
  getControlPlans: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/quality/controlplan?orgid=${orgId}`
      );
      return res?.paramObjectsMap?.controlPlanVOList || res?.data || [];
    } catch (error) {
      console.error("Error fetching control plans:", error);
      throw error;
    }
  },

  getControlPlanById: async (planId) => {
    try {
      const res = await apiClient.get(`/api/quality/controlplan/${planId}`);
      return res?.paramObjectsMap?.controlPlanVO || null;
    } catch (error) {
      console.error("Error fetching control plan by ID:", error);
      throw error;
    }
  },

  createUpdateControlPlan: async (planDTO) => {
    try {
      const res = await apiClient.post(
        "/api/quality/createUpdateControlPlan",
        planDTO
      );
      return res;
    } catch (error) {
      console.error("Error creating/updating control plan:", error);
      throw error;
    }
  },

  getControlPlanHistory: async (planId) => {
    try {
      const res = await apiClient.get(
        `/api/quality/controlplan/${planId}/history`
      );
      return res?.paramObjectsMap?.controlPlanHistoryVOList || [];
    } catch (error) {
      console.error("Error fetching control plan history:", error);
      throw error;
    }
  },

  getProcessSheets: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/quality/processsheet?orgid=${orgId}`
      );
      return res?.paramObjectsMap?.processSheetVOList || res?.data || [];
    } catch (error) {
      console.error("Error fetching process sheets:", error);
      throw error;
    }
  },

  getMachineFixtures: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/quality/machinefixture?orgid=${orgId}`
      );
      return res?.paramObjectsMap?.machineFixtureVOList || res?.data || [];
    } catch (error) {
      console.error("Error fetching machine/fixtures:", error);
      throw error;
    }
  },
};

export default controlPlanAPI;

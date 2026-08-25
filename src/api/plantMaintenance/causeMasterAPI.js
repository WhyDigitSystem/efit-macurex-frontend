import apiClient from "../apiClient";

export const MAINTENANCE_TYPES = [
  "PREVENTIVE",
  "CORRECTIVE",
  "PREDICTIVE",
  "BREAKDOWN",
  "ROUTINE",
  "EMERGENCY",
];

export const causeMasterAPI = {
  getCauses: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/plantMaintenance/cause?orgid=${orgId}`
      );
      return res?.paramObjectsMap?.causeVOList || res?.data || [];
    } catch (error) {
      console.error("Error fetching causes:", error);
      throw error;
    }
  },

  getCauseById: async (causeId) => {
    try {
      const res = await apiClient.get(
        `/api/plantMaintenance/cause/${causeId}`
      );
      return res?.paramObjectsMap?.causeVO || null;
    } catch (error) {
      console.error("Error fetching cause by ID:", error);
      throw error;
    }
  },

  createUpdateCause: async (causeDTO) => {
    try {
      const res = await apiClient.post(
        "/api/plantMaintenance/createUpdateCause",
        causeDTO
      );
      return res;
    } catch (error) {
      console.error("Error creating/updating cause:", error);
      throw error;
    }
  },

  getCauseHistory: async (causeId) => {
    try {
      const res = await apiClient.get(
        `/api/plantMaintenance/cause/${causeId}/history`
      );
      return res?.paramObjectsMap?.causeHistoryVOList || [];
    } catch (error) {
      console.error("Error fetching cause history:", error);
      throw error;
    }
  },
};

export default causeMasterAPI;

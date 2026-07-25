import apiClient from "./apiClient";

export const stateAPI = {
  getStates: async (orgId) => {
    try {
      const res = await apiClient.get(`/api/commonmaster/state?orgid=${orgId}`);
      return res?.paramObjectsMap?.stateVO || [];
    } catch (error) {
      console.error("Error fetching states:", error);
      throw error;
    }
  },

  getStateById: async (stateId) => {
    try {
      const res = await apiClient.get(`/api/commonmaster/state/${stateId}`);
      return res?.paramObjectsMap?.stateVO || null;
    } catch (error) {
      console.error("Error fetching state by ID:", error);
      throw error;
    }
  },

  getStatesByCountry: async (countryId, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/state/country?country=${countryId}&orgid=${orgId}`,
      );
      return res?.paramObjectsMap?.stateVO || [];
    } catch (error) {
      console.error("Error fetching states by country:", error);
      throw error;
    }
  },

  createUpdateState: async (stateDTO) => {
    try {
      const res = await apiClient.post("/api/commonmaster/state", stateDTO);
      return res;
    } catch (error) {
      console.error("Error creating/updating state:", error);
      throw error;
    }
  },
};

export default stateAPI;

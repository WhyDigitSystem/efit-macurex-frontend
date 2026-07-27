import apiClient from "./apiClient";

export const cityAPI = {
  getCities: async (orgId) => {
    try {
      const res = await apiClient.get(`/api/commonmaster/city?orgid=${orgId}`);
      return res?.paramObjectsMap?.cityVO || [];
    } catch (error) {
      console.error("Error fetching cities:", error);
      throw error;
    }
  },

  getCityById: async (cityId) => {
    try {
      const res = await apiClient.get(`/api/commonmaster/city/${cityId}`);
      return res?.paramObjectsMap?.cityVO || null;
    } catch (error) {
      console.error("Error fetching city by ID:", error);
      throw error;
    }
  },

  getCitiesByState: async (orgId, stateId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/city/state?orgid=${orgId}&state=${stateId}`,
      );
      return res?.paramObjectsMap?.cityVO || [];
    } catch (error) {
      console.error("Error fetching cities by state:", error);
      throw error;
    }
  },

  saveCity: async (payload) => {
    try {
      const res = await apiClient.post('/api/commonmaster/createUpdateCity', payload);
      return res;
    } catch (error) {
      console.error("Error saving city:", error);
      throw error;
    }
  },
};

export default cityAPI;
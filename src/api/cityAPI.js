import apiClient from "./apiClient";

export const cityAPI = {
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
};

export default cityAPI;

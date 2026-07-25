import apiClient from "./apiClient";

export const countryAPI = {
  getCountries: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/country?orgid=${orgId}`,
      );
      return res?.paramObjectsMap?.countryVO || [];
    } catch (error) {
      console.error("Error fetching countries:", error);
      throw error;
    }
  },

  getCountryById: async (countryId) => {
    try {
      const res = await apiClient.get(`/api/commonmaster/country/${countryId}`);
      return res?.paramObjectsMap?.Country || null;
    } catch (error) {
      console.error("Error fetching country by ID:", error);
      throw error;
    }
  },

  createUpdateCountry: async (countryDTO) => {
    try {
      const res = await apiClient.post(
        "/api/commonmaster/createUpdateCountry",
        countryDTO,
      );
      return res;
    } catch (error) {
      console.error("Error creating/updating country:", error);
      throw error;
    }
  },
};

export default countryAPI;

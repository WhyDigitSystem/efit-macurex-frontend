import apiClient from "./apiClient";

export const currencyAPI = {
  // Get Currency List
  getCurrencies: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/currency?orgid=${orgId}`,
      );

      console.log("Currency API Raw Response:", res);

      // If apiClient returns response.data
      return res?.paramObjectsMap?.currencyVO || [];
    } catch (error) {
      console.error("Error fetching currencies:", error);
      throw error;
    }
  },

  // Get Currency By ID
  getCurrencyById: async (currencyId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/currency/${currencyId}`,
      );
      return res?.paramObjectsMap?.currencyVO || null;
    } catch (error) {
      console.error("Error fetching currency by ID:", error);
      throw error;
    }
  },

  // Create / Update Currency
  createUpdateCurrency: async (currencyDTO) => {
    try {
      const res = await apiClient.put(
        "/api/commonmaster/createUpdateCurrency",
        currencyDTO,
      );
      return res;
    } catch (error) {
      console.error("Error creating/updating currency:", error);
      throw error;
    }
  },
};

export default currencyAPI;

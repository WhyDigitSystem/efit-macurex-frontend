import apiClient from "./apiClient";

export const exchangeRateAPI = {
  getExchangeRateById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getExchangeRateById?id=${id}`,
      );
      return res?.paramObjectsMap?.exchangeRateVO || null;
    } catch (error) {
      console.error("Error fetching exchange rate by ID:", error);
      throw error;
    }
  },

  getExchangeRateByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getExchangeRateByOrgId?orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.exchangeRateList || [];
    } catch (error) {
      console.error("Error fetching exchange rate list:", error);
      throw error;
    }
  },

  // Currency master lookup, used to populate the Currency Symbol dropdown
  getCurrencies: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getCurrenciesByOrgId?orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.currencyList || [];
    } catch (error) {
      console.error("Error fetching currencies:", error);
      throw error;
    }
  },

  updateCreateExchangeRate: async (exchangeRateDTO) => {
    try {
      const res = await apiClient.put(
        "/api/commonmaster/updateCreateExchangeRate",
        exchangeRateDTO,
      );
      return res;
    } catch (error) {
      console.error("Error creating/updating exchange rate:", error);
      throw error;
    }
  },
};

export default exchangeRateAPI;

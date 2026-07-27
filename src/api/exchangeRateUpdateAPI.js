import apiClient from "./apiClient";

export const exchangeRateUpdateAPI = {
  getExchangeRateUpdateById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getExchangeRateUpdateById?id=${id}`,
      );
      return res?.paramObjectsMap?.exchangeRateUpdateVO || null;
    } catch (error) {
      console.error("Error fetching exchange rate update by ID:", error);
      throw error;
    }
  },

  getExchangeRateUpdateByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getExchangeRateUpdateByOrgId?orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.exchangeRateUpdateList || [];
    } catch (error) {
      console.error("Error fetching exchange rate update list:", error);
      throw error;
    }
  },

  // Currency master lookup, used to populate the Currency Name dropdown
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

  updateCreateExchangeRateUpdate: async (exchangeRateUpdateDTO) => {
    try {
      const res = await apiClient.put(
        "/api/commonmaster/updateCreateExchangeRateUpdate",
        exchangeRateUpdateDTO,
      );
      return res;
    } catch (error) {
      console.error("Error creating/updating exchange rate update:", error);
      throw error;
    }
  },
};

export default exchangeRateUpdateAPI;

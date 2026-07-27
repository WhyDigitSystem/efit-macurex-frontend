import apiClient from "./apiClient";

export const dailyExchangeRateAPI = {
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

  // month / year are optional filters - pass "" to skip a filter
  getExchangeRateByOrgId: async (month, year, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getExchangeRateByOrgId?month=${month}&year=${year}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.exchangeRateList || [];
    } catch (error) {
      console.error("Error fetching exchange rate list:", error);
      throw error;
    }
  },

  updateCreateExchangeRate: async (exchangeRateDTO) => {
    try {
      const res = await apiClient.put(
        "/api/commonmaster/updateCreateExchangeRateMaster",
        exchangeRateDTO,
      );
      return res;
    } catch (error) {
      console.error("Error creating/updating exchange rate:", error);
      throw error;
    }
  },
};

export default dailyExchangeRateAPI;

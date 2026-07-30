import apiClient from "./apiClient";

const dailyExchangeRateAPI = {
  getDailyExRateById: async (id) => {
    try {
      const res = await apiClient.get("/api/commonmaster/getDailyExRateById", {
        params: { id },
      });
      return res?.paramObjectsMap?.dailyExchangeRateVO || null;
    } catch (error) {
      console.error("Error fetching exchange rate by ID:", error);
      throw error;
    }
  },

  getDailyExRateByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get("/api/commonmaster/getDailyExRateByOrgId", {
        params: { orgId, branch },
      });
      return res?.paramObjectsMap?.dailyExchangeRateVO || [];
    } catch (error) {
      console.error("Error fetching exchange rate list:", error);
      throw error;
    }
  },

  updateCreateDailyExRate: async (dto) => {
    try {
      const res = await apiClient.put("/api/commonmaster/updateCreateDailyExRate", dto);
      return res;
    } catch (error) {
      console.error("Error creating/updating exchange rate:", error);
      throw error;
    }
  },
};

export default dailyExchangeRateAPI;

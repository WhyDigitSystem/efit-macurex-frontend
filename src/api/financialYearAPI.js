import apiClient from "./apiClient";

export const financialYearAPI = {
  // Get Financial Years by Organization ID
  getFinancialYearByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getFinancialYearByOrgId?orgId=${orgId}`,
      );

      console.log("Financial Year API Response:", res);

      return res?.paramObjectsMap?.branchList || [];
    } catch (error) {
      console.error("Error fetching financial years:", error);
      throw error;
    }
  },

  // Get Financial Year by ID
  getFinancialYearById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/geFinancialYearById?id=${id}`,
      );

      console.log("Financial Year By ID:", res);

      return (
        res?.paramObjectsMap?.financialYear ||
        res?.paramObjectsMap?.branch ||
        null
      );
    } catch (error) {
      console.error("Error fetching financial year:", error);
      throw error;
    }
  },

  // Create / Update Financial Year
  createUpdateFinancialYear: async (payload) => {
    try {
      const res = await apiClient.post(
        `/api/commonmaster/createUpdateFinancialYear`,
        payload,
      );

      return res;
    } catch (error) {
      console.error("Error saving financial year:", error);
      throw error;
    }
  },
};

export default financialYearAPI;

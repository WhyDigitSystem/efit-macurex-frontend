import apiClient from "./apiClient";

export const unitMasterAPI = {
  // Get all Unit Masters by Branch & Organization
  getUnits: async (branch, orgId) => {
    const res = await apiClient.get(
      `/api/commonmaster/getUnitMasterByOrgId?branch=${branch}&orgId=${orgId}`,
    );

    console.log("Unit API Response:", res);

    return res?.paramObjectsMap?.unitMasterList || [];
  },

  // Get Unit Master by ID
  getUnitById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getUnitMasterById?id=${id}`,
      );

      console.log("Get Unit By ID Response:", res);

      // Update this key if your backend returns a different one
      return (
        res?.paramObjectsMap?.unitMaster ||
        res?.paramObjectsMap?.unitMasterVO ||
        res?.paramObjectsMap?.unitDTO ||
        null
      );
    } catch (error) {
      console.error("Error fetching unit master by ID:", error);
      throw error;
    }
  },

  // Create or Update Unit Master
  saveUnit: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/commonmaster/createUpdateUnitMaster",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving unit master:", error);
      throw error;
    }
  },
};

export default unitMasterAPI;

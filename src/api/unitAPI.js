import apiClient from "./apiClient";

export const unitMasterAPI = {
  // Get all Unit Masters by Branch & Organization
  getUnits: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getUnitMasterByOrgId?orgId=${orgId}`,
      );

      console.log("Unit API Full Response:", res);

      // Check multiple possible response structures
      const units =
        res?.paramObjectsMap?.unitMasterList ||
        res?.data?.paramObjectsMap?.unitMasterList ||
        res?.unitMasterList ||
        res?.data ||
        [];

      console.log("Processed units:", units);
      return units;
    } catch (error) {
      console.error("Error fetching units:", error);
      throw error;
    }
  },

  // Get Unit Master by ID - expects numeric ID
  getUnitById: async (id) => {
    try {
      console.log(`Fetching unit with numeric ID: ${id}`);

      const res = await apiClient.get(
        `/api/commonmaster/getUnitMasterById?id=${id}`,
      );

      console.log("Get Unit By ID Full Response:", res);

      // Extract the unit data from the response
      const unit = res?.paramObjectsMap?.unitMasterVO || null;

      console.log("Extracted unit data:", unit);

      if (!unit) {
        console.warn("No unit data found in response");
        return null;
      }

      return unit;
    } catch (error) {
      console.error("Error fetching unit master by ID:", error);
      throw error;
    }
  },

  // Create or Update Unit Master
  saveUnit: async (payload) => {
    try {
      console.log("Saving unit payload:", payload);
      const res = await apiClient.put(
        "/api/commonmaster/createUpdateUnitMaster",
        payload,
      );
      console.log("Save unit response:", res);
      return res;
    } catch (error) {
      console.error("Error saving unit master:", error);
      throw error;
    }
  },
};

export default unitMasterAPI;
import apiClient from "./apiClient";

export const unitConversionAPI = {
  // Get all Unit Conversions by Branch & Organization
  getUnitConversion: async (branch, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getUomConversionByOrgId?branchId=${branch}&orgId=${orgId}`,
      );

      console.log("Unit Conversion List Response:", res);

      return res?.paramObjectsMap?.uomConversionVO || [];
    } catch (error) {
      console.error("Error fetching unit conversions:", error);
      throw error;
    }
  },

  // Get Unit Conversion by ID - CORRECTED
  getUnitConversionById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getUomConversionById?id=${id}`,
      );

      console.log("Get Unit Conversion By ID Response:", res);

      // Return the full response or the specific VO
      return res?.paramObjectsMap?.uomConversionVO || res || null;
    } catch (error) {
      console.error("Error fetching unit conversion by ID:", error);
      throw error;
    }
  },

  // Create or Update Unit Conversion - CORRECTED
  saveUnitConversion: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/commonmaster/createUpdateUomConversion",
        payload,
      );
      
      console.log("Save Unit Conversion Response:", res);
      return res;
    } catch (error) {
      console.error("Error saving unit conversion:", error);
      throw error;
    }
  },
};

export default unitConversionAPI;
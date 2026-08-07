// engineeringChangeRecordAPI.js
import apiClient from "../apiClient";

export const engineeringChangeRecordAPI = {
  // Get Engineering Change Records by Organization ID
  getEcrByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/dev/getEngineeringChangeRecordByOrgId?branch=${branch}&orgId=${orgId}`,
      );

      return res?.paramObjectsMap?.engineeringChangeRecordEntryVO || [];
    } catch (error) {
      console.error("Error fetching engineering change records:", error);
      throw error;
    }
  },

  // Create / Update Engineering Change Record
  createUpdateEcr: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/dev/updateCreateEngineeringChangeRecord",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving engineering change record:", error);
      throw error;
    }
  },
};

export default engineeringChangeRecordAPI;

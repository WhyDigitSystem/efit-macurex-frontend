import apiClient from "./apiClient";

const holidayAPI = {
  getAll: async (orgId, branch) => {
    try {
      const res = await apiClient.get("api/commonmaster/getHolidayMasterByOrgId", {
        params: { orgId, branch },
      });
      return res?.paramObjectsMap?.holidayMasterVO || [];
    } catch (error) {
      console.error("Error fetching holidays:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get("api/commonmaster/getHolidayMasterById", {
        params: { id },
      });
      return res?.paramObjectsMap?.holidayMasterVO || null;
    } catch (error) {
      console.error("Error fetching holiday by ID:", error);
      throw error;
    }
  },

  createUpdate: async (data) => {
    try {
      const res = await apiClient.put("api/commonmaster/updateCreateHolidayMaster", data);
      return res;
    } catch (error) {
      console.error("Error saving holiday:", error);
      throw error;
    }
  },
};

export default holidayAPI;

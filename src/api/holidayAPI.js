import apiClient from "./apiClient";

const holidayAPI = {
  getAll: async (orgId) => {
    const response = await apiClient.get("/api/commonmaster/getHoliday", {
      params: { orgId },
    });
    return Array.isArray(response) ? response : response?.data ?? [];
  },

  getById: async (id) => {
    const response = await apiClient.get("/api/commonmaster/getHolidayById", {
      params: { id },
    });
    return response;
  },

  createUpdate: async (data) => {
    const response = await apiClient.put(
      "/api/commonmaster/createUpdateHoliday",
      data
    );
    return response;
  },
};

export default holidayAPI;

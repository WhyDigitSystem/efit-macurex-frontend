import apiClient from "./apiClient";

const calendarAPI = {
  getAll: async (orgId, branch) => {
    const response = await apiClient.get("/api/commonmaster/getCalendar", {
      params: { orgId, branch },
    });
    return Array.isArray(response) ? response : response?.data ?? [];
  },

  getById: async (id) => {
    const response = await apiClient.get("/api/commonmaster/getCalendarById", {
      params: { id },
    });
    return response;
  },

  createUpdate: async (data) => {
    const response = await apiClient.put(
      "/api/commonmaster/createUpdateCalendar",
      data
    );
    return response;
  },
};

export default calendarAPI;

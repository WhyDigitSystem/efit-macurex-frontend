import apiClient from "./apiClient";

const servicesAccountingAPI = {
  getAll: async (orgId) => {
    const response = await apiClient.get("/api/commonmaster/getServicesAccounting", {
      params: { orgId },
    });
    return Array.isArray(response) ? response : response?.data ?? [];
  },

  getById: async (id) => {
    const response = await apiClient.get("/api/commonmaster/getServicesAccountingById", {
      params: { id },
    });
    return response;
  },

  createUpdate: async (data) => {
    const response = await apiClient.put(
      "/api/commonmaster/createUpdateServicesAccounting",
      data
    );
    return response;
  },

  checkUnique: async (serviceName, orgId) => {
    const response = await apiClient.get("/api/commonmaster/checkServiceNameUnique", {
      params: { serviceName, orgId },
    });
    return response;
  },
};

export default servicesAccountingAPI;

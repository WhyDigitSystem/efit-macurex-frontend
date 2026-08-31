import apiClient from "./apiClient";

const servicesAccountingAPI = {
  // Get all services with pagination/filter
  getAll: async (branchId, orgId) => {
    try {
      const response = await apiClient.get(
        `/api/commonmaster/getServiceAccMasterByOrgId?branchId=${branchId}&orgId=${orgId}`
      );
      console.log("Get All Services Response:", response);

      // Return the full response object, not just the array
      return response;
    } catch (error) {
      console.error("Error fetching services:", error);
      throw error;
    }
  },

  // Get service by ID
  getById: async (id) => {
    try {
      const response = await apiClient.get(
        `/api/commonmaster/getServiceAccMasterById?id=${id}`
      );
      return response;
    } catch (error) {
      console.error("Error fetching service by ID:", error);
      throw error;
    }
  },

  // Create or Update service
  createUpdate: async (data) => {
    try {
      const response = await apiClient.put(
        "/api/commonmaster/updateCreateServiceAccMaster",
        data
      );
      console.log("Create/Update Service Response:", response);
      return response;
    } catch (error) {
      console.error("Error creating/updating service:", error);
      throw error;
    }
  },
};

export default servicesAccountingAPI;
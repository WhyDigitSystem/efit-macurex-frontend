import apiClient from "../apiClient";

const engineeringDeviationRequestAPI = {
  // Get Engineering Deviation Requests by Organization ID
  getEdrByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/toolmaster/getEngineeringDeviationByOrgId?orgId=${orgId}`
      );
      return res;
    } catch (error) {
      console.error("Error fetching engineering deviation requests:", error);
      throw error;
    }
  },

  // Get Engineering Deviation by ID
  getEngineeringDeviationById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/toolmaster/getEngineeringDeviationById?id=${id}`
      );
      return res;
    } catch (error) {
      console.error("Error fetching engineering deviation by ID:", error);
      throw error;
    }
  },

  // Get Engineering Deviation Document ID
  getEngineeringDeviationDocId: async (financialYear, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/toolmaster/getEngineeringDeviationDocId?financialYear=${financialYear}&orgId=${orgId}`
      );
      return res;
    } catch (error) {
      console.error("Error fetching engineering deviation docId:", error);
      throw error;
    }
  },

  // Create / Update Engineering Deviation Request with multipart/form-data
  createUpdateEdr: async (formData) => {
    try {
      const res = await apiClient.post(
        "/api/toolmaster/updateCreateEngineeringDeviation",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return res;
    } catch (error) {
      console.error("Error saving engineering deviation request:", error);
      throw error;
    }
  },
};

export default engineeringDeviationRequestAPI;
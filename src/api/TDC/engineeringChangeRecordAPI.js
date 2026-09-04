// engineeringChangeRecordAPI.js
import apiClient from "../apiClient";

const engineeringChangeRecordAPI = {

  // Get a single Engineering Change Record by ID
  getEcrById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/toolmaster/getEngineeringChangeRecordById?id=${id}`,
      );
      return res?.paramObjectsMap?.engineeringChangeRecordVO || null;
    } catch (error) {
      console.error("Error fetching engineering change record by id:", error);
      throw error;
    }
  },

  // Generate the Engineering Change Record Doc Id (ECR No)
  getEcrDocId: async (orgId) => {
    try {
      const financialYear = localStorage.getItem("finYear") || String(new Date().getFullYear());
      const res = await apiClient.get(
        `/api/toolmaster/getEngineeringChangeRecordDocId?financialYear=${financialYear}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.engineeringChangeRecordDocId || "";
    } catch (error) {
      console.error("Error generating engineering change record doc id:", error);
      throw error;
    }
  },

  // Get Engineering Change Records by Organization ID (toolmaster endpoint)
  getEngineeringChangeRecordByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/toolmaster/getEngineeringChangeRecordByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.engineeringChangeRecordVO || [];
    } catch (error) {
      console.error("Error fetching engineering change records:", error);
      throw error;
    }
  },

  // Create / Update Engineering Change Record (multipart: JSON blob + files)
  createUpdateEcr: async (formData) => {
    try {
      const res = await apiClient.post(
        "/api/toolmaster/updateCreateEngineeringChangeRecord",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return res;
    } catch (error) {
      console.error("Error saving engineering change record:", error);
      throw error;
    }
  },
};

export default engineeringChangeRecordAPI;

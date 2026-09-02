import apiClient from "../apiClient";

/* Reason Master API
   Follows the Production module API convention (like machineMasterAPI).
   The backend persists the header record in a single transaction, keeps
   the complete reason record history and applies server-side validation. */
const reasonMasterAPI = {
  // Get all Reason Masters by org
  getAll: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/reasonmaster/getReasonMasterByOrgId?orgId=${orgId}`,
      );
      return (
        res?.paramObjectsMap?.reasonMasterResponseVO ||
        res?.paramObjectsMap?.reasonMasterList ||
        res?.paramObjectsMap?.reasonList ||
        []
      );
    } catch (error) {
      console.error("Error fetching reason masters:", error);
      throw error;
    }
  },

  // Get Reason Master by ID
  getById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/reasonmaster/getReasonMasterById?id=${id}`,
      );
      return res?.paramObjectsMap?.reasonMasterVO || null;
    } catch (error) {
      console.error("Error fetching reason master by id:", error);
      throw error;
    }
  },

  // Create / Update Reason Master
  createUpdate: async (payload) => {
    try {
      const res = await apiClient.put("/api/reasonmaster/createUpdateReasonMaster", payload);
      return res;
    } catch (error) {
      console.error("Error saving reason master:", error);
      throw error;
    }
  },
};

export default reasonMasterAPI;
import apiClient from "../apiClient";

/* Reason Master API
   Follows the Production module API convention (like machineMasterAPI).
   The backend persists the header record in a single transaction, keeps
   the complete reason record history and applies server-side validation. */
const reasonMasterAPI = {
  // Get all Reason Masters by org/branch
  getAll: async (orgId, branchId) => {
    try {
      const res = await apiClient.get("/api/reasonMaster/getAll", {
        params: { orgId, branch: branchId },
      });
      return (
        res?.paramObjectsMap?.reasonMasterList ||
        res?.paramObjectsMap?.reasonList ||
        res?.paramObjectsMap?.reasonMasterVO ||
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
      const res = await apiClient.get("/api/reasonMaster/getById", {
        params: { id },
      });
      return res?.paramObjectsMap?.reasonMasterVO || null;
    } catch (error) {
      console.error("Error fetching reason master by id:", error);
      throw error;
    }
  },

  // Create / Update Reason Master
  createUpdate: async (payload) => {
    try {
      const res = await apiClient.put("/api/reasonMaster/createUpdate", payload);
      return res;
    } catch (error) {
      console.error("Error saving reason master:", error);
      throw error;
    }
  },

  // Reason (type/group) options for the mandatory Reason dropdown
  getReasonOptions: async (orgId, branchId) => {
    try {
      const res = await apiClient.get("/api/reasonMaster/getReasonOptions", {
        params: { orgId, branch: branchId },
      });
      return (
        res?.paramObjectsMap?.reasonList ||
        res?.paramObjectsMap?.reasonMasterList ||
        []
      );
    } catch (error) {
      console.error("Error fetching reason options:", error);
      return [];
    }
  },
};

export default reasonMasterAPI;
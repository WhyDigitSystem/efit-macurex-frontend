// problemSolvingEntryAPI.js
import apiClient from "../apiClient";

// Problem Solving Entry API
// Mirrors the quality API convention used in this app.
// The backend persists the header, root causes, corrective actions, problem
// actions and summary in a single transaction ... (server-side validation).

const problemSolvingEntryAPI = {
  // Get Problem Solving Entries by Organization ID
  getProblemSolvingEntryByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/quality/getProblemSolvingEntryByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      const list = res?.paramObjectsMap?.problemSolvingEntryVO;
      return Array.isArray(list) ? list : list ? [list] : [];
    } catch (error) {
      console.error("Error fetching problem solving entries:", error);
      throw error;
    }
  },

  // Get Problem Solving Entry by ID
  getProblemSolvingEntryById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/quality/getProblemSolvingEntryById?id=${id}`,
      );
      return res?.paramObjectsMap?.problemSolvingEntryVO || null;
    } catch (error) {
      console.error("Error fetching problem solving entry by ID:", error);
      throw error;
    }
  },

  // Create / Update Problem Solving Entry
  createUpdateProblemSolvingEntry: async (payload) => {
    try {
      const res = await apiClient.put(
        `/api/quality/updateCreateProblemSolvingEntry`,
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving problem solving entry:", error);
      throw error;
    }
  },
};

export default problemSolvingEntryAPI;
// problemSolvingEntryAPI.js
import apiClient from "../apiClient";

// Problem Solving Entry API
// Uses the /api/initialPlanning controller (per swagger) with a single
// transaction for header + root causes + corrective actions + actions.

const problemSolvingEntryAPI = {
  // Get Problem Solving Entries by Organization ID
  getProblemSolvingEntryByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/initialPlanning/getProblemSolvingEntryByOrgId?branch=${branch}&orgId=${orgId}`,
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
        `/api/initialPlanning/getProblemSolvingEntryById?id=${id}`,
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
        `/api/initialPlanning/updateCreateProblemSolvingEntry`,
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving problem solving entry:", error);
      throw error;
    }
  },

  // Get auto-generated Doc Id for a new Problem Solving Entry
  getProblemSolvingEntryDocId: async ({ financialYear, orgId }) => {
    try {
      const res = await apiClient.get(
        `/api/initialPlanning/getProblemSolvingEntryDocId?financialYear=${financialYear}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.problemSolvingEntryDocId || "";
    } catch (error) {
      console.error("Error fetching problem solving entry doc id:", error);
      throw error;
    }
  },

  // Team Member dropdown filtered by branch + department
  getTeamMemberDropdown: async (branch, department, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/initialPlanning/getTeamMemberDropdownForProblemSolvingEntry?branch=${branch}&department=${department}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.teamMemberList || [];
    } catch (error) {
      console.error("Error fetching team member dropdown:", error);
      throw error;
    }
  },
};

export default problemSolvingEntryAPI;
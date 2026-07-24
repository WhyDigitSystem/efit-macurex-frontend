// branchAPI.js
import apiClient from "./apiClient";

export const branchAPI = {
  // Get Branches by Organization ID
  getBranchByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getBranchByOrgId?orgId=${orgId}`,
      );

      return res?.paramObjectsMap?.branchList || [];
    } catch (error) {
      console.error("Error fetching branches:", error);
      throw error;
    }
  },
};

export default branchAPI;

import apiClient from "../apiClient";

export const issueAPI = {
  getIssueById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/inventorymaster/getIssueById?id=${id}`,
      );
      return res?.paramObjectsMap?.issueVO || null;
    } catch (error) {
      console.error("Error fetching issue by ID:", error);
      throw error;
    }
  },

  getIssueByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/inventorymaster/getIssueByOrgId?orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.issueList || [];
    } catch (error) {
      console.error("Error fetching issue list:", error);
      throw error;
    }
  },

  updateCreateIssue: async (issueDTO) => {
    try {
      const res = await apiClient.put(
        "/api/inventorymaster/updateCreateIssue",
        issueDTO,
      );
      return res;
    } catch (error) {
      console.error("Error creating/updating issue:", error);
      throw error;
    }
  },
};

export default issueAPI;

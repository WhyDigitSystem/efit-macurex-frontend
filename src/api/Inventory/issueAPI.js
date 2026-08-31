import apiClient from "../apiClient";

export const issueAPI = {
  getIssueById: async (id) => {
    try {
      const res = await apiClient.get("/api/develop/getIssuesById", {
        params: { id: Number(id) },
      });
      return res?.paramObjectsMap?.issuesVO || null;
    } catch (error) {
      console.error("Error fetching issue by ID:", error);
      throw error;
    }
  },

  getIssueByOrgId: async (branch, orgId) => {
    try {
      const res = await apiClient.get("/api/develop/getIssuesByOrgId", {
        params: { branch: Number(branch), orgId: Number(orgId) },
      });
      return res?.paramObjectsMap?.issuesResponseVO || [];
    } catch (error) {
      console.error("Error fetching issue list:", error);
      throw error;
    }
  },

  updateCreateIssue: async (issueDTO) => {
    try {
      const res = await apiClient.put("/api/develop/createUpdateIssues", issueDTO);
      return res;
    } catch (error) {
      console.error("Error creating/updating issue:", error);
      throw error;
    }
  },

  getIssueFromLocations: async (branch, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/develop/getIssueFromLocationDropdown",
        {
          params: { branch: Number(branch), orgId: Number(orgId) },
        },
      );
      return res?.paramObjectsMap?.locationList || [];
    } catch (error) {
      console.error("Error fetching Issue From location dropdown:", error);
      throw error;
    }
  },

  getIssueToLocations: async (branch, issueFrom, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/develop/getIssueToLocationDropdown",
        {
          params: {
            branch: Number(branch),
            issueFrom: Number(issueFrom),
            orgId: Number(orgId),
          },
        },
      );
      return res?.paramObjectsMap?.locationList || [];
    } catch (error) {
      console.error("Error fetching Issue To location dropdown:", error);
      throw error;
    }
  },

  getIssueIndentNos: async (branch, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/develop/getIssueIndentNoDropdown",
        {
          params: { branch: Number(branch), orgId: Number(orgId) },
        },
      );
      return res?.paramObjectsMap?.indentNoList || [];
    } catch (error) {
      console.error("Error fetching Issue Indent No dropdown:", error);
      throw error;
    }
  },

  getIssueItemCodes: async (branch, indentNo, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/develop/getIssueItemCodeDropdown",
        {
          params: {
            branch: Number(branch),
            indentNo: String(indentNo),
            orgId: Number(orgId),
          },
        },
      );
      return res?.paramObjectsMap?.itemCodeList || [];
    } catch (error) {
      console.error("Error fetching Issue Item Code dropdown:", error);
      throw error;
    }
  },
};

export default issueAPI;

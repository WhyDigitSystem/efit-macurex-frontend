// src/api/Inventory/issueAPI.js

import apiClient from "../apiClient";

export const issueAPI = {
  // ============================================================
  // GET ISSUE DOC ID  (new record only)
  // GET /api/develop/getIssuesDocId?financialYear=&orgId=
  // ============================================================
  getIssuesDocId: async ({ orgId, financialYear }) => {
    try {
      const res = await apiClient.get("/api/develop/getIssuesDocId", {
        params: {
          orgId: Number(orgId),
          financialYear: String(financialYear),
        },
      });

      return res?.paramObjectsMap?.issuesDocId || "";
    } catch (error) {
      console.error(
        "Error fetching Issues Doc ID:",
        error?.response?.data || error,
      );
      throw error;
    }
  },

  // ============================================================
  // GET ISSUE BY ID
  // Returns the record itself (issuesVO). If the backend uses a
  // different key, the first object/array value of the map is used.
  // ============================================================
  getIssueById: async (id) => {
    try {
      const res = await apiClient.get("/api/develop/getIssuesById", {
        params: { id: Number(id) },
      });

      console.log("Issue by ID response:", res);

      const map = res?.paramObjectsMap || {};

      let record =
        map.issuesVO ??
        map.issuesResponseVO ??
        Object.values(map).find((v) => v && typeof v === "object");

      if (Array.isArray(record)) record = record[0];

      return record || null;
    } catch (error) {
      console.error(
        "Error fetching issue by ID:",
        error?.response?.data || error,
      );
      throw error;
    }
  },

  // ============================================================
  // GET ISSUE LIST
  // ============================================================
  getIssueByOrgId: async (branch, orgId) => {
    try {
      const res = await apiClient.get("/api/develop/getIssuesByOrgId", {
        params: { branch: Number(branch), orgId: Number(orgId) },
      });

      return res?.paramObjectsMap?.issuesResponseVO || [];
    } catch (error) {
      console.error(
        "Error fetching issue list:",
        error?.response?.data || error,
      );
      throw error;
    }
  },

  // ============================================================
  // CREATE / UPDATE ISSUE
  // PUT /api/develop/createUpdateIssues
  // ============================================================
  updateCreateIssue: async (issueDTO) => {
    try {
      const res = await apiClient.put(
        "/api/develop/createUpdateIssues",
        issueDTO,
        { headers: { "Content-Type": "application/json" } },
      );
      return res;
    } catch (error) {
      console.error(
        "Error creating/updating issue:",
        error?.response?.data || error,
      );
      throw error;
    }
  },

  // ============================================================
  // DROPDOWNS
  // ============================================================
  getIssueFromLocations: async (branch, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/develop/getIssueFromLocationDropdown",
        { params: { branch: Number(branch), orgId: Number(orgId) } },
      );
      return res?.paramObjectsMap?.locationList || [];
    } catch (error) {
      console.error("Error fetching Issue From dropdown:", error);
      throw error;
    }
  },

  // issueFrom = the "id" of the selected Issue From location
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
      console.error("Error fetching Issue To dropdown:", error);
      throw error;
    }
  },

  getIssueIndentNos: async (branch, orgId) => {
    try {
      const res = await apiClient.get("/api/develop/getIssueIndentNoDropdown", {
        params: { branch: Number(branch), orgId: Number(orgId) },
      });
      return res?.paramObjectsMap?.indentNoList || [];
    } catch (error) {
      console.error("Error fetching Indent No dropdown:", error);
      throw error;
    }
  },

  // indentNo = the indentNo STRING of the selected indent
  getIssueItemCodes: async (branch, indentNo, orgId) => {
    try {
      const res = await apiClient.get("/api/develop/getIssueItemCodeDropdown", {
        params: {
          branch: Number(branch),
          indentNo: String(indentNo),
          orgId: Number(orgId),
        },
      });
      return res?.paramObjectsMap?.itemCodeList || [];
    } catch (error) {
      console.error("Error fetching Item Code dropdown:", error);
      throw error;
    }
  },
};

export default issueAPI;

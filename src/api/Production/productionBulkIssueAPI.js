import apiClient from "../apiClient";

const productionBulkIssueAPI = {
  getByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        "/api/subContract/getProductionBulkIssuesByOrgIdAndBranch",
        { params: { branch, orgId } },
      );

      return res;
    } catch (error) {
      console.error("Error fetching production bulk issues:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get(
        "/api/subContract/getProductionBulkIssuesById",
        { params: { id } },
      );

      return (
        res?.paramObjectsMap?.productionBulkIssuesVO ||
        res?.paramObjectsMap ||
        null
      );
    } catch (error) {
      console.error("Error fetching production bulk issue by id:", error);
      throw error;
    }
  },

  // CREATE / UPDATE
  // Backend Swagger requires PUT
  createUpdate: async (data) => {
    try {
      const res = await apiClient.put(
        "/api/subContract/createUpdateProductionBulkIssues",
        data,
      );

      return res;
    } catch (error) {
      console.error("Error saving production bulk issue:", error);
      throw error;
    }
  },

  getDocId: async ({ financialYear, orgId }) => {
    try {
      const res = await apiClient.get(
        "/api/subContract/getProductionBulkIssuesDocId",
        {
          params: {
            financialYear,
            orgId,
          },
        },
      );

      return res?.paramObjectsMap?.docId || "";
    } catch (error) {
      console.error("Error fetching production bulk issue doc id:", error);
      throw error;
    }
  },

  /** FG/SFG item picker for the header. */
  getFgItems: async (branch, orgId) => {
    try {
      if (!branch || !orgId) return [];

      const res = await apiClient.get(
        "/api/subContract/getFGItemsforBOMCorrectionRequestNote",
        {
          params: {
            branch,
            orgId,
          },
        },
      );

      return res?.paramObjectsMap?.itemDetails || [];
    } catch (error) {
      console.error("Error fetching FG items:", error);
      return [];
    }
  },

  /** Indents with item/unit/qty available for selected FG item. */
  getIndentsForItem: async (branch, itemId, orgId) => {
    try {
      if (!branch || !itemId || !orgId) return [];

      const res = await apiClient.get(
        "/api/subContract/getIndentByItemForProductionBulkIssues",
        {
          params: {
            branch,
            itemId,
            orgId,
          },
        },
      );

      return res?.paramObjectsMap?.indentList || [];
    } catch (error) {
      console.error("Error fetching indents for item:", error);
      return [];
    }
  },
};

export default productionBulkIssueAPI;

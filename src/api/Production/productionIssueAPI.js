import apiClient from "../apiClient";

/* =========================================================================
 * Production Issue API
 * Base path: /api/purchaseOrder
 * ========================================================================= */

const productionIssueAPI = {
  /* -----------------------------------------------------------------------
   * GET PRODUCTION ISSUES BY ORGANIZATION
   * GET /api/purchaseOrder/getProductionIssueByOrgId
   * --------------------------------------------------------------------- */
  getByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        "/api/purchaseOrder/getProductionIssueByOrgId",
        {
          params: {
            branch,
            orgId,
          },
        },
      );

      return res;
    } catch (error) {
      console.error("Error fetching production issues:", error);
      throw error;
    }
  },

  /* -----------------------------------------------------------------------
   * GET PRODUCTION ISSUE BY ID
   * GET /api/purchaseOrder/getProductionIssueById
   * --------------------------------------------------------------------- */
  getById: async (id) => {
    try {
      const res = await apiClient.get(
        "/api/purchaseOrder/getProductionIssueById",
        {
          params: {
            id,
          },
        },
      );

      return (
        res?.paramObjectsMap?.productionIssueVO || res?.paramObjectsMap || null
      );
    } catch (error) {
      console.error("Error fetching production issue by id:", error);
      throw error;
    }
  },

  /* -----------------------------------------------------------------------
   * CREATE / UPDATE PRODUCTION ISSUE
   *
   * Swagger:
   * PUT /api/purchaseOrder/createUpdateProductionIssue
   *
   * IMPORTANT:
   * This was previously POST, which caused:
   * 405 Method Not Allowed
   * --------------------------------------------------------------------- */
  createUpdate: async (data) => {
    try {
      const res = await apiClient.put(
        "/api/purchaseOrder/createUpdateProductionIssue",
        data,
      );

      return res;
    } catch (error) {
      console.error("Error saving production issue:", error);
      throw error;
    }
  },

  /* -----------------------------------------------------------------------
   * GET PRODUCTION ISSUE DOCUMENT ID
   * GET /api/purchaseOrder/getProductionIssueDocId
   * --------------------------------------------------------------------- */
  getDocId: async ({ financialYear, orgId }) => {
    try {
      const res = await apiClient.get(
        "/api/purchaseOrder/getProductionIssueDocId",
        {
          params: {
            financialYear,
            orgId,
          },
        },
      );

      return res?.paramObjectsMap?.productionIssueDocId || "";
    } catch (error) {
      console.error("Error fetching production issue doc id:", error);
      throw error;
    }
  },

  /* -----------------------------------------------------------------------
   * GET FG / SFG ITEMS
   * GET /api/purchaseOrder/getFgPartNoDetails
   * --------------------------------------------------------------------- */
  getFgItems: async (branch, orgId) => {
    try {
      if (!branch || !orgId) {
        return [];
      }

      const res = await apiClient.get("/api/purchaseOrder/getFgPartNoDetails", {
        params: {
          branch,
          orgId,
        },
      });

      return res?.paramObjectsMap?.mapp || [];
    } catch (error) {
      console.error("Error fetching FG item details:", error);
      return [];
    }
  },

  /* -----------------------------------------------------------------------
   * GET INDENTS FOR FG ITEM
   * GET /api/purchaseOrder/getIndentNoForProductionIssue
   * --------------------------------------------------------------------- */
  getIndentsForFgItem: async (branch, fgItem, orgId) => {
    try {
      if (!branch || !fgItem || !orgId) {
        return [];
      }

      const res = await apiClient.get(
        "/api/purchaseOrder/getIndentNoForProductionIssue",
        {
          params: {
            branch,
            fgItem,
            orgId,
          },
        },
      );

      return res?.paramObjectsMap?.mapp || [];
    } catch (error) {
      console.error("Error fetching indent numbers for FG item:", error);
      return [];
    }
  },

  /* -----------------------------------------------------------------------
   * GET INDENT DETAILS
   * GET /api/purchaseOrder/getIndentNoDetailsForProductionIssue
   * --------------------------------------------------------------------- */
  getIndentDetails: async (branch, indentNo, orgId) => {
    try {
      if (!branch || !indentNo || !orgId) {
        return [];
      }

      const res = await apiClient.get(
        "/api/purchaseOrder/getIndentNoDetailsForProductionIssue",
        {
          params: {
            branch,
            indentNo,
            orgId,
          },
        },
      );

      return res?.paramObjectsMap?.mapp || [];
    } catch (error) {
      console.error("Error fetching indent details:", error);
      return [];
    }
  },

  /* -----------------------------------------------------------------------
   * GET GRN DETAILS FOR ITEM
   * GET /api/purchaseOrder/getGrnNoForProductionIssue
   * --------------------------------------------------------------------- */
  getGrnForItem: async (branch, item, orgId) => {
    try {
      if (!branch || !item || !orgId) {
        return [];
      }

      const res = await apiClient.get(
        "/api/purchaseOrder/getGrnNoForProductionIssue",
        {
          params: {
            branch,
            item,
            orgId,
          },
        },
      );

      return res?.paramObjectsMap?.mapp || [];
    } catch (error) {
      console.error("Error fetching GRN numbers for item:", error);
      return [];
    }
  },
};

export default productionIssueAPI;

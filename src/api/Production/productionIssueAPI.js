import apiClient from "../apiClient";

/* =========================================================================
 * Production Issue API
 * Base path: /api/purchaseOrder
 * ========================================================================= */

const productionIssueAPI = {
  /* GET /api/purchaseOrder/getProductionIssueByOrgId */
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
   *
   * The backend returns paramObjectsMap.productionIssueResponseVO as an
   * ARRAY (it can contain more than one issue), so the entry whose id
   * matches the requested id is picked — never blindly the first one.
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

      if (res?.status === false) return null;

      const map = res?.paramObjectsMap || {};

      const found =
        map.productionIssueResponseVO ??
        map.productionIssueVO ??
        map.productionIssue ??
        map.productionIssueDTO ??
        (map.id ? map : null);

      if (!found) return null;

      const list = Array.isArray(found) ? found : [found];

      const match =
        list.find((item) => String(item?.id) === String(id)) ||
        (list.length === 1 ? list[0] : null);

      console.log("getProductionIssueById ->", match);

      return match || null;
    } catch (error) {
      console.error("Error fetching production issue by id:", error);
      throw error;
    }
  },

  /* PUT /api/purchaseOrder/createUpdateProductionIssue */
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

  /* GET /api/purchaseOrder/getProductionIssueDocId */
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

  /* GET /api/purchaseOrder/getFgPartNoDetails */
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

  /* GET /api/purchaseOrder/getIndentNoForProductionIssue */
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

  /* GET /api/purchaseOrder/getIndentNoDetailsForProductionIssue */
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

  /* GET /api/purchaseOrder/getGrnNoForProductionIssue */
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

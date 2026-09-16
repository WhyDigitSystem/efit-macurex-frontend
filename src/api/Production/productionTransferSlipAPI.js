import apiClient from "../apiClient";

const productionTransferSlipAPI = {
  // ============================================================================
  // PRODUCTION TRANSFER SLIP - LIST
  // ============================================================================

  getByOrgId: async (branch, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/purchaseOrder/getProductionTransferSlipByOrgId",
        {
          params: {
            branch: Number(branch),
            orgId: Number(orgId),
          },
        },
      );

      console.log("Production Transfer Slip API Response:", res);

      return (
        res?.paramObjectsMap?.productionTransferSlipResponseVO ||
        res?.paramObjectsMap?.productionTransferSlipList ||
        res?.paramObjectsMap?.productionTransferSlipVO ||
        res?.paramObjectsMap?.mapp ||
        []
      );
    } catch (error) {
      console.error("Error fetching Production Transfer Slip list:", error);
      throw error;
    }
  },

  // ============================================================================
  // PRODUCTION TRANSFER SLIP - GET BY ID
  // ============================================================================

  getById: async (id) => {
    try {
      const res = await apiClient.get(
        "/api/purchaseOrder/getProductionTransferSlipById",
        {
          params: {
            id: Number(id),
          },
        },
      );

      return (
        res?.paramObjectsMap?.productionTransferSlipVO ||
        res?.paramObjectsMap?.productionTransferSlip ||
        res?.paramObjectsMap?.mapp?.[0] ||
        null
      );
    } catch (error) {
      console.error("Error fetching Production Transfer Slip by ID:", error);
      throw error;
    }
  },

  // ============================================================================
  // CREATE / UPDATE
  // ============================================================================

  createUpdate: async (data) => {
    try {
      const res = await apiClient.put(
        "/api/purchaseOrder/createUpdateProductionTransferSlip",
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      return res;
    } catch (error) {
      console.error("Error saving Production Transfer Slip:", error);
      throw error;
    }
  },

  // ============================================================================
  // FG PART NO
  // ============================================================================

  getFgPartNoDetails: async (branch, orgId) => {
    try {
      const res = await apiClient.get("/api/purchaseOrder/getFgPartNoDetails", {
        params: {
          branch: Number(branch),
          orgId: Number(orgId),
        },
      });

      return res?.paramObjectsMap?.mapp || [];
    } catch (error) {
      console.error("Error fetching FG Part No details:", error);
      throw error;
    }
  },

  // ============================================================================
  // SFG PART NO
  // ============================================================================

  getSfgPartNoDetails: async (branch, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/purchaseOrder/getSfgPartNoDetails",
        {
          params: {
            branch: Number(branch),
            orgId: Number(orgId),
          },
        },
      );

      return res?.paramObjectsMap?.mapp || [];
    } catch (error) {
      console.error("Error fetching SFG Part No details:", error);
      throw error;
    }
  },

  // ============================================================================
  // SCHEDULE ORDER NO
  // ============================================================================

  getSchNoFromTransferSlip: async (branch, fgItem, orgId, sfgItem) => {
    try {
      const res = await apiClient.get(
        "/api/purchaseOrder/getSchNoFromTransferSlip",
        {
          params: {
            branch: Number(branch),
            fgItem: Number(fgItem),
            orgId: Number(orgId),
            sfgItem: Number(sfgItem),
          },
        },
      );

      console.log("getSchNoFromTransferSlip:", res);

      return res?.paramObjectsMap?.mapp || [];
    } catch (error) {
      console.error("Error fetching Sch Order No:", error);

      throw error;
    }
  },

  // ============================================================================
  // BOM NO
  // ============================================================================

  getBomNoFromTransferSlip: async (branch, fgItem, orgId, sfgItem) => {
    try {
      const res = await apiClient.get(
        "/api/purchaseOrder/getBomNoFromTransferSlip",
        {
          params: {
            branch: Number(branch),
            fgItem: Number(fgItem),
            orgId: Number(orgId),
            sfgItem: Number(sfgItem),
          },
        },
      );

      return res?.paramObjectsMap?.mapp || [];
    } catch (error) {
      console.error("Error fetching BOM No:", error);
      throw error;
    }
  },

  // ============================================================================
  // BOM DETAILS
  // ============================================================================

  getBomNoFromTransferSlipDetails: async (bom, branch, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/purchaseOrder/getBomNoFromTransferSlipDetails",
        {
          params: {
            bom: Number(bom),
            branch: Number(branch),
            orgId: Number(orgId),
          },
        },
      );

      return res?.paramObjectsMap?.mapp || [];
    } catch (error) {
      console.error("Error fetching BOM details:", error);
      throw error;
    }
  },

  // ============================================================================
  // SCRAP ID
  // ============================================================================

  getListValuesGroup: async (listDescription, orgId) => {
    try {
      const res = await apiClient.get("/api/commonmaster/getListValuesGroup", {
        params: {
          listDescription,
          orgId: Number(orgId),
        },
      });

      return res?.paramObjectsMap?.listValues || [];
    } catch (error) {
      console.error("Error fetching Scrap ID list:", error);
      throw error;
    }
  },

  // ============================================================================
  // PRODUCTION TRANSFER SLIP DOC ID
  //
  // GET
  // /api/purchaseOrder/getProductionTransferSlipDocId
  //
  // Example:
  // financialYear=2026
  // orgId=1000000017
  //
  // Returns:
  // BLR/PTS/26-27/00001
  // ============================================================================

  getProductionTransferSlipDocId: async (financialYear, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/purchaseOrder/getProductionTransferSlipDocId",
        {
          params: {
            financialYear: String(financialYear),
            orgId: Number(orgId),
          },
        },
      );

      return res?.paramObjectsMap?.productionTransferSlipDocId || "";
    } catch (error) {
      console.error("Error fetching Production Transfer Slip Doc ID:", error);
      throw error;
    }
  },
};

export default productionTransferSlipAPI;

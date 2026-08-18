import apiClient from "../apiClient";

const salesContractAmendmentAPI = {
  getAll: async (orgId, branch) => {
    try {
      const res = await apiClient.get("/api/salescontractamendment/getAll", {
        params: { orgId, branch },
      });
      return (
        res?.paramObjectsMap?.salesContractAmendmentVO ||
        res?.paramObjectsMap?.amendmentList ||
        res?.paramObjectsMap?.salesContractAmendments ||
        []
      );
    } catch (error) {
      console.error("Error fetching SC amendments:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get("/api/salescontractamendment/getById", {
        params: { id },
      });
      return res?.paramObjectsMap?.salesContractAmendmentVO || null;
    } catch (error) {
      console.error("Error fetching SC amendment by id:", error);
      throw error;
    }
  },

  getItems: async (orgId) => {
    try {
      const res = await apiClient.get("/api/commonmaster/getItems", {
        params: { orgId },
      });
      return res?.paramObjectsMap?.itemList || [];
    } catch (error) {
      console.error("Error fetching items:", error);
      throw error;
    }
  },

  // Get items for the selected sales contract (used by the Item Code dropdown)
  getItemDropdown: async (orgId, branch, salesContractNo) => {
    try {
      const res = await apiClient.get("/api/transaction/getSalesContractAmdItemDropdown", {
        params: { orgId, branch, salesContractNo },
      });
      return res?.paramObjectsMap?.itemList || [];
    } catch (error) {
      console.error("Error fetching contract items:", error);
      throw error;
    }
  },

  // Get all branches (used by the Plant ID dropdown)
  getBranches: async (orgId) => {
    try {
      const res = await apiClient.get("/api/commonmaster/getBranchByOrgId", {
        params: { orgId },
      });
      return res?.paramObjectsMap?.branchList || [];
    } catch (error) {
      console.error("Error fetching branches:", error);
      throw error;
    }
  },

  // Get contract numbers (used by the Contract No dropdown)
  getContractNoDropdown: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        "/api/transaction/getSalesContractAmdContractNoDropdown",
        { params: { orgId, branch } },
      );
      return res?.paramObjectsMap?.contractList || [];
    } catch (error) {
      console.error("Error fetching contract numbers:", error);
      throw error;
    }
  },

  // Get the revision number for a selected item on a sales contract (used by Revision No)
  getRevisionNo: async (orgId, branch, salesContractNo, item) => {
    try {
      const res = await apiClient.get("/api/transaction/getSalesContractAmdRevisionNo", {
        params: { orgId, branch, salesContractNo, item },
      });
      return res?.paramObjectsMap?.revisionNo ?? null;
    } catch (error) {
      console.error("Error fetching revision number:", error);
      throw error;
    }
  },

  createUpdate: async (data) => {
    try {
      const res = await apiClient.post(
        "/api/transaction/updateCreateSalesContractAmendment",
        data,
      );
      return res;
    } catch (error) {
      console.error("Error saving SC amendment:", error);
      throw error;
    }
  },
};

export default salesContractAmendmentAPI;

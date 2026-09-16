import apiClient from "./apiClient";

const advEntryAPI = {
  // Get ADV Entries by Organization + Branch
  getAdvForStoresByOrgIdAndBranch: async (branch, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/subContract/getAdvForStoresByOrgIdAndBranch",
        { params: { branch, orgId } },
      );
      return res?.paramObjectsMap?.advForStores || [];
    } catch (error) {
      console.error("Error fetching ADV For Stores list:", error);
      throw error;
    }
  },

  getAdvForStoresById: async (id) => {
    try {
      const res = await apiClient.get(
        "/api/subContract/getAdvForStoresById",
        { params: { id } },
      );
      return res?.paramObjectsMap?.advForStores || null;
    } catch (error) {
      console.error("Error fetching ADV For Stores by id:", error);
      throw error;
    }
  },

  createUpdateAdvForStores: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/subContract/createUpdateAdvForStores",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving ADV For Stores entry:", error);
      throw error;
    }
  },

  /* -------- Lookup endpoints used by the ADV Entry form -------- */

  // Party / Customer list for the "Party Id" dropdown
  getCustomerForSupplierRateContract: async (branch, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/subContract/getCustomerForSupplierRateContract",
        { params: { branch, orgId } },
      );
      return res?.paramObjectsMap?.customerList || [];
    } catch (error) {
      console.error("Error fetching customer list:", error);
      throw error;
    }
  },

  // FG / SFG items for the "Incoming Part No" dropdown
  getFGAndSFGItems: async (branch, orgId) => {
    try {
      const res = await apiClient.get("/api/subContract/getFGAndSFGItems", {
        params: { branch, orgId },
      });
      return res?.paramObjectsMap?.itemDetails || [];
    } catch (error) {
      console.error("Error fetching FG/SFG items:", error);
      throw error;
    }
  },

  // Latest BOM for a given item (used to populate the "BOM Id" dropdown)
  getLatestBomDropdown: async (branch, itemId, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/subContract/getLatestBomDropdown",
        { params: { branch, itemId, orgId } },
      );
      return res?.paramObjectsMap?.bomDetails || [];
    } catch (error) {
      console.error("Error fetching latest BOM dropdown:", error);
      throw error;
    }
  },

  // BOM line items (used to populate Item Code / Description / Unit / BOM Qty
  // in the ADV Details grid for the selected BOM doc)
  getBomDetailsByDocId: async (branch, docId, orgId) => {
    try {
      const res = await apiClient.get("/api/subContract/getBomDetailsByDocId", {
        params: { branch, docId, orgId },
      });
      return res?.paramObjectsMap?.bomDetails || [];
    } catch (error) {
      console.error("Error fetching BOM details:", error);
      throw error;
    }
  },

  getAdvForStoresDocId: async (financialYear, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/subContract/getAdvForStoresDocId",
        { params: { financialYear, orgId } },
      );
      return res?.paramObjectsMap?.advForStoresDocId || "";
    } catch (error) {
      console.error("Error fetching ADV doc id:", error);
      throw error;
    }
  },
};

export default advEntryAPI;
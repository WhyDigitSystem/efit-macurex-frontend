import apiClient from "../apiClient";

const stockTransferChallanAPI = {
  getAll: async (orgId, branch) => {
    try {
      const res = await apiClient.get("/api/dev/getStockTransferChallanByOrgId", {
        params: { orgId, branch },
      });
      return res?.paramObjectsMap?.stockTransferChallanList || [];
    } catch (error) {
      console.error("Error fetching Stock Transfer Challan records:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get("/api/dev/getStockTransferChallanById", {
        params: { id },
      });
      return res?.paramObjectsMap?.stockTransferChallanVO || null;
    } catch (error) {
      console.error("Error fetching Stock Transfer Challan by ID:", error);
      throw error;
    }
  },

  createUpdate: async (payload) => {
    try {
      const res = await apiClient.post("/api/dev/createUpdateStockTransferChallan", payload);
      return res;
    } catch (error) {
      console.error("Error saving Stock Transfer Challan:", error);
      throw error;
    }
  },

  getPlants: async (orgId) => {
    try {
      const res = await apiClient.get("/api/dev/getPlantMasterByOrgId", {
        params: { orgId },
      });
      return res?.paramObjectsMap?.plantList || [];
    } catch (error) {
      console.error("Error fetching plants:", error);
      throw error;
    }
  },

  getLocations: async (orgId) => {
    try {
      const res = await apiClient.get("/api/dev/getLocationByOrgId", {
        params: { orgId },
      });
      return res?.paramObjectsMap?.locationList || [];
    } catch (error) {
      console.error("Error fetching locations:", error);
      throw error;
    }
  },

  getCustomers: async (orgId) => {
    try {
      const res = await apiClient.get("/api/dev/getCustomerMasterByOrgId", {
        params: { orgId },
      });
      return res?.paramObjectsMap?.customerList || [];
    } catch (error) {
      console.error("Error fetching customers:", error);
      throw error;
    }
  },

  getGSTStates: async () => {
    try {
      const res = await apiClient.get("/api/dev/getGSTStateMaster", {});
      return res?.paramObjectsMap?.gstStateList || [];
    } catch (error) {
      console.error("Error fetching GST states:", error);
      throw error;
    }
  },

  getItems: async (orgId) => {
    try {
      const res = await apiClient.get("/api/dev/getItemMasterByOrgId", {
        params: { orgId },
      });
      return res?.paramObjectsMap?.itemMasterList || [];
    } catch (error) {
      console.error("Error fetching items:", error);
      throw error;
    }
  },

  getUnits: async (orgId) => {
    try {
      const res = await apiClient.get("/api/dev/getUnitMasterByOrgId", {
        params: { orgId },
      });
      return res?.paramObjectsMap?.unitList || [];
    } catch (error) {
      console.error("Error fetching units:", error);
      throw error;
    }
  },

  getTaxCodes: async (orgId) => {
    try {
      const res = await apiClient.get("/api/dev/getTaxMasterByOrgId", {
        params: { orgId },
      });
      return res?.paramObjectsMap?.taxList || [];
    } catch (error) {
      console.error("Error fetching tax codes:", error);
      throw error;
    }
  },

  getLedgerAccounts: async (orgId) => {
    try {
      const res = await apiClient.get("/api/dev/getLedgerAccountByOrgId", {
        params: { orgId },
      });
      return res?.paramObjectsMap?.ledgerAccountList || [];
    } catch (error) {
      console.error("Error fetching ledger accounts:", error);
      throw error;
    }
  },
};

export default stockTransferChallanAPI;
import apiClient from "../apiClient";

const otherSalesInvoiceAPI = {
  getAll: async (orgId, branch) => {
    try {
      const res = await apiClient.get("/api/dev/getOtherSalesInvoiceByOrgId", {
        params: { orgId, branch },
      });
      return res?.paramObjectsMap?.otherSalesInvoiceList || [];
    } catch (error) {
      console.error("Error fetching Other Sales Invoice records:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get("/api/dev/getOtherSalesInvoiceById", {
        params: { id },
      });
      return res?.paramObjectsMap?.otherSalesInvoiceVO || null;
    } catch (error) {
      console.error("Error fetching Other Sales Invoice by ID:", error);
      throw error;
    }
  },

  createUpdate: async (payload) => {
    try {
      const res = await apiClient.post("/api/dev/createUpdateOtherSalesInvoice", payload);
      return res;
    } catch (error) {
      console.error("Error saving Other Sales Invoice:", error);
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

export default otherSalesInvoiceAPI;

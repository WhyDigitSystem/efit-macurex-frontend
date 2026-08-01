import apiClient from "../apiClient";

const docketInvoiceDetailsAPI = {
  getAll: async (orgId, branch) => {
    try {
      const res = await apiClient.get("/api/dev/getDocketInvoiceDetailsByOrgId", {
        params: { orgId, branch },
      });
      return res?.paramObjectsMap?.docketInvoiceDetailsList || [];
    } catch (error) {
      console.error("Error fetching Docket/Invoice Details records:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get("/api/dev/getDocketInvoiceDetailsById", {
        params: { id },
      });
      return res?.paramObjectsMap?.docketInvoiceDetailsVO || null;
    } catch (error) {
      console.error("Error fetching Docket/Invoice Details by ID:", error);
      throw error;
    }
  },

  createUpdate: async (payload) => {
    try {
      const res = await apiClient.post("/api/dev/createUpdateDocketInvoiceDetails", payload);
      return res;
    } catch (error) {
      console.error("Error saving Docket/Invoice Details:", error);
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

  getTransportNames: async (orgId) => {
    try {
      const res = await apiClient.get("/api/dev/getTransportMasterByOrgId", {
        params: { orgId },
      });
      return res?.paramObjectsMap?.transportList || [];
    } catch (error) {
      console.error("Error fetching transport names:", error);
      throw error;
    }
  },
};

export default docketInvoiceDetailsAPI;

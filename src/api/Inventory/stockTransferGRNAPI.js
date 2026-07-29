import apiClient from "../apiClient";

const stockTransferGRNAPI = {
  getAll: async (orgId, branch) => {
    try {
      const res = await apiClient.get("/api/dev/getStockTransferGRNMasterByOrgId", {
        params: { orgId, branch },
      });
      return res?.paramObjectsMap?.stockTransferGRNMasterList || [];
    } catch (error) {
      console.error("Error fetching Stock Transfer GRN records:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get("/api/dev/getStockTransferGRNMasterById", {
        params: { id },
      });
      return res?.paramObjectsMap?.stockTransferGRNMasterVO || null;
    } catch (error) {
      console.error("Error fetching Stock Transfer GRN by ID:", error);
      throw error;
    }
  },

  createUpdate: async (payload) => {
    try {
      const res = await apiClient.post("/api/dev/createUpdateStockTransferGRNMaster", payload);
      return res;
    } catch (error) {
      console.error("Error saving Stock Transfer GRN:", error);
      throw error;
    }
  },

  cancelGRN: async (id, cancelRemarks) => {
    try {
      const res = await apiClient.put("/api/dev/cancelStockTransferGRNMaster", null, {
        params: { id, cancelRemarks },
      });
      return res;
    } catch (error) {
      console.error("Error cancelling Stock Transfer GRN:", error);
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

  getSuppliers: async (orgId) => {
    try {
      const res = await apiClient.get("/api/dev/getPartyMasterByOrgId", {
        params: { orgId },
      });
      return res?.paramObjectsMap?.partyList || [];
    } catch (error) {
      console.error("Error fetching suppliers:", error);
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

  getPurchaseOrders: async (orgId, branch) => {
    try {
      const res = await apiClient.get("/api/dev/getPurchaseOrderByOrgId", {
        params: { orgId, branch },
      });
      return res?.paramObjectsMap?.purchaseOrderList || [];
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      throw error;
    }
  },

  uploadAttachment: async (formData) => {
    try {
      const res = await apiClient.post("/api/dev/uploadStockTransferGRNAttachment", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res;
    } catch (error) {
      console.error("Error uploading attachment:", error);
      throw error;
    }
  },

  downloadAttachment: async (attachmentId) => {
    try {
      const res = await apiClient.get("/api/dev/downloadStockTransferGRNAttachment", {
        params: { attachmentId },
        responseType: "blob",
      });
      return res;
    } catch (error) {
      console.error("Error downloading attachment:", error);
      throw error;
    }
  },
};

export default stockTransferGRNAPI;

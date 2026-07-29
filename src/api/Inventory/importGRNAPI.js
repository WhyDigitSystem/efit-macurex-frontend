import apiClient from "../apiClient";

const importGRNAPI = {
  getAll: async (orgId, branch) => {
    try {
      const res = await apiClient.get("/api/dev/getGRNMasterByOrgId", {
        params: { orgId, branch },
      });
      return res?.paramObjectsMap?.grnMasterList || [];
    } catch (error) {
      console.error("Error fetching GRN records:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get("/api/dev/getGRNMasterById", {
        params: { id },
      });
      return res?.paramObjectsMap?.grnMasterVO || null;
    } catch (error) {
      console.error("Error fetching GRN by ID:", error);
      throw error;
    }
  },

  createUpdate: async (payload) => {
    try {
      const res = await apiClient.post("/api/dev/createUpdateGRNMaster", payload);
      return res;
    } catch (error) {
      console.error("Error saving GRN:", error);
      throw error;
    }
  },

  cancelGRN: async (id, cancelRemarks) => {
    try {
      const res = await apiClient.put("/api/dev/cancelGRNMaster", null, {
        params: { id, cancelRemarks },
      });
      return res;
    } catch (error) {
      console.error("Error cancelling GRN:", error);
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

  getPendingPOItems: async (poId) => {
    try {
      const res = await apiClient.get("/api/dev/getPendingPOItems", {
        params: { poId },
      });
      return res?.paramObjectsMap?.pendingItemList || [];
    } catch (error) {
      console.error("Error fetching pending PO items:", error);
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

  uploadAttachment: async (formData) => {
    try {
      const res = await apiClient.post("/api/dev/uploadGRNAttachment", formData, {
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
      const res = await apiClient.get("/api/dev/downloadGRNAttachment", {
        params: { attachmentId },
        responseType: "blob",
      });
      return res;
    } catch (error) {
      console.error("Error downloading attachment:", error);
      throw error;
    }
  },

  getGatePassList: async (orgId) => {
    try {
      const res = await apiClient.get("/api/dev/getGatePassByOrgId", {
        params: { orgId },
      });
      return res?.paramObjectsMap?.gatePassList || [];
    } catch (error) {
      console.error("Error fetching gate passes:", error);
      throw error;
    }
  },

  getTransporterList: async (orgId) => {
    try {
      const res = await apiClient.get("/api/dev/getTransporterByOrgId", {
        params: { orgId },
      });
      return res?.paramObjectsMap?.transporterList || [];
    } catch (error) {
      console.error("Error fetching transporters:", error);
      throw error;
    }
  },

  getForwarderList: async (orgId) => {
    try {
      const res = await apiClient.get("/api/dev/getForwarderByOrgId", {
        params: { orgId },
      });
      return res?.paramObjectsMap?.forwarderList || [];
    } catch (error) {
      console.error("Error fetching forwarders:", error);
      throw error;
    }
  },
};

export default importGRNAPI;

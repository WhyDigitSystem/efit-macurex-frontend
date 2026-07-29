import apiClient from "../apiClient";

const directPurchaseAPI = {
  getAll: async (orgId, branch) => {
    try {
      const res = await apiClient.get("/api/dev/getDirectPurchaseMasterByOrgId", {
        params: { orgId, branch },
      });
      return res?.paramObjectsMap?.directPurchaseMasterList || [];
    } catch (error) {
      console.error("Error fetching Direct Purchase records:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get("/api/dev/getDirectPurchaseMasterById", {
        params: { id },
      });
      return res?.paramObjectsMap?.directPurchaseMasterVO || null;
    } catch (error) {
      console.error("Error fetching Direct Purchase by ID:", error);
      throw error;
    }
  },

  createUpdate: async (payload) => {
    try {
      const res = await apiClient.post("/api/dev/createUpdateDirectPurchaseMaster", payload);
      return res;
    } catch (error) {
      console.error("Error saving Direct Purchase:", error);
      throw error;
    }
  },

  cancelDirectPurchase: async (id, cancelRemarks) => {
    try {
      const res = await apiClient.put("/api/dev/cancelDirectPurchaseMaster", null, {
        params: { id, cancelRemarks },
      });
      return res;
    } catch (error) {
      console.error("Error cancelling Direct Purchase:", error);
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

  getGSTStates: async () => {
    try {
      const res = await apiClient.get("/api/dev/getGSTStateMaster", {});
      return res?.paramObjectsMap?.gstStateList || [];
    } catch (error) {
      console.error("Error fetching GST states:", error);
      throw error;
    }
  },

  getItemList: async (orgId) => {
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

  uploadAttachment: async (formData) => {
    try {
      const res = await apiClient.post("/api/dev/uploadDirectPurchaseAttachment", formData, {
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
      const res = await apiClient.get("/api/dev/downloadDirectPurchaseAttachment", {
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

export default directPurchaseAPI;

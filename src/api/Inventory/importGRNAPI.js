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
};

export default importGRNAPI;

import apiClient from "./apiClient";

const salesZoneAPI = {
  getSalesZoneById: async (id) => {
    try {
      const res = await apiClient.get("/api/commonmaster/getSalesZoneMasterById", {
        params: { id },
      });
      return res?.paramObjectsMap?.salesZoneMasterVO || null;
    } catch (error) {
      console.error("Error fetching sales zone by ID:", error);
      throw error;
    }
  },

  getSalesZoneByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get("/api/commonmaster/getSalesZoneMasterByOrgId", {
        params: { orgId, branch },
      });
      return res?.paramObjectsMap?.salesZoneMasterList || [];
    } catch (error) {
      console.error("Error fetching sales zone list:", error);
      throw error;
    }
  },

  updateCreateSalesZone: async (salesZoneDTO) => {
    try {
      const res = await apiClient.put(
        "/api/commonmaster/createUpdateSalesZoneMaster",
        salesZoneDTO,
      );
      return res;
    } catch (error) {
      console.error("Error creating/updating sales zone:", error);
      throw error;
    }
  },
};

export default salesZoneAPI;

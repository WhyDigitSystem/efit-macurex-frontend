import apiClient from "./apiClient";

export const salesZoneAPI = {
  getSalesZoneById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getSalesZoneById?id=${id}`,
      );
      return res?.paramObjectsMap?.salesZoneVO || null;
    } catch (error) {
      console.error("Error fetching sales zone by ID:", error);
      throw error;
    }
  },

  getSalesZoneByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getSalesZoneByOrgId?orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.salesZoneList || [];
    } catch (error) {
      console.error("Error fetching sales zone list:", error);
      throw error;
    }
  },

  updateCreateSalesZone: async (salesZoneDTO) => {
    try {
      const res = await apiClient.put(
        "/api/commonmaster/updateCreateSalesZoneMaster",
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

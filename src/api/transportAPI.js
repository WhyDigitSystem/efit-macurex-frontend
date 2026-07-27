import apiClient from "./apiClient";

export const transportAPI = {
  getTransportById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getTransportById?id=${id}`,
      );
      return res?.paramObjectsMap?.transportVO || null;
    } catch (error) {
      console.error("Error fetching transport by ID:", error);
      throw error;
    }
  },

  getTransportByOrgId: async (branch, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getTransportByOrgId?branch=${branch}&orgId=${orgId}`,
      );

      return res?.paramObjectsMap?.transportList || [];
    } catch (error) {
      console.error("Error fetching transport list:", error);
      throw error;
    }
  },

  updateCreateTransport: async (transportMasterDTO) => {
    try {
      const res = await apiClient.put(
        "/api/commonmaster/updateCreateTransportMaster",
        transportMasterDTO,
      );
      return res;
    } catch (error) {
      console.error("Error creating/updating transport:", error);
      throw error;
    }
  },
};

export default transportAPI;

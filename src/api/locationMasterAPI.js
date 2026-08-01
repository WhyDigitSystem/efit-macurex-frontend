import apiClient from "./apiClient";

const locationMasterAPI = {
  getLocationMasterByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get("/api/commonmaster/getLocationByOrgId", {
        params: { orgId, branch },
      });
      return res?.paramObjectsMap?.transportList || [];
    } catch (error) {
      console.error("Error fetching location master list:", error);
      throw error;
    }
  },

  getLocationMasterById: async (id) => {
    try {
      const res = await apiClient.get("/api/commonmaster/getLocationMasterById", {
        params: { id },
      });
      return res?.paramObjectsMap?.locationVO || null;
    } catch (error) {
      console.error("Error fetching location master by ID:", error);
      throw error;
    }
  },

  createUpdateLocationMaster: async (locationDTO) => {
    try {
      const res = await apiClient.put(
        "/api/commonmaster/updateCreateLocationMaster",
        locationDTO,
      );
      return res;
    } catch (error) {
      console.error("Error creating/updating location master:", error);
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
};

export default locationMasterAPI;

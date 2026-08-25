import apiClient from "../apiClient";

export const activityMasterAPI = {
  getActivities: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/plantMaintenance/activity?orgid=${orgId}`
      );
      return res?.paramObjectsMap?.activityVOList || res?.data || [];
    } catch (error) {
      console.error("Error fetching activities:", error);
      throw error;
    }
  },

  getActivityById: async (activityId) => {
    try {
      const res = await apiClient.get(
        `/api/plantMaintenance/activity/${activityId}`
      );
      return res?.paramObjectsMap?.activityVO || null;
    } catch (error) {
      console.error("Error fetching activity by ID:", error);
      throw error;
    }
  },

  createUpdateActivity: async (activityDTO) => {
    try {
      const res = await apiClient.post(
        "/api/plantMaintenance/createUpdateActivity",
        activityDTO
      );
      return res;
    } catch (error) {
      console.error("Error creating/updating activity:", error);
      throw error;
    }
  },

  getActivityHistory: async (activityId) => {
    try {
      const res = await apiClient.get(
        `/api/plantMaintenance/activity/${activityId}/history`
      );
      return res?.paramObjectsMap?.activityHistoryVOList || [];
    } catch (error) {
      console.error("Error fetching activity history:", error);
      throw error;
    }
  },
};

export default activityMasterAPI;

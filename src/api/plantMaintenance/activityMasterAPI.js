import apiClient from "../apiClient";

export const activityMasterAPI = {
  /* ---------------- List by org ---------------- */
  getByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/develop/getActivityMasterByOrgId?orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.activityMasterResponseVO || [];
    } catch (error) {
      console.error("Error fetching activities:", error);
      throw error;
    }
  },

  /* ---------------- Get by id ---------------- */
  getById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/develop/getActivityMasterById?id=${id}`,
      );
      return res?.paramObjectsMap?.activityMasterVO || null;
    } catch (error) {
      console.error("Error fetching activity by ID:", error);
      throw error;
    }
  },

  /* ---------------- Save (create / update) ---------------- */
  createUpdateActivity: async (activityDTO) => {
    try {
      const res = await apiClient.put(
        "/api/develop/createUpdateActivityMaster",
        activityDTO,
      );
      return res;
    } catch (error) {
      console.error("Error creating/updating activity:", error);
      throw error;
    }
  },

  /* ---------------- Back-compat aliases ---------------- */
  getActivities: async (orgId) => {
    return activityMasterAPI.getByOrgId(orgId);
  },
  getActivityById: async (id) => {
    return activityMasterAPI.getById(id);
  },
};

export default activityMasterAPI;
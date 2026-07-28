import apiClient from "../apiClient";

export const internalIndentAPI = {
  getInternalIndentById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/inventorymaster/getInternalIndentById?id=${id}`,
      );
      return res?.paramObjectsMap?.internalIndentVO || null;
    } catch (error) {
      console.error("Error fetching internal indent by ID:", error);
      throw error;
    }
  },

  getInternalIndentByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/inventorymaster/getInternalIndentByOrgId?orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.internalIndentList || [];
    } catch (error) {
      console.error("Error fetching internal indent list:", error);
      throw error;
    }
  },

  updateCreateInternalIndent: async (internalIndentDTO) => {
    try {
      const res = await apiClient.put(
        "/api/inventorymaster/updateCreateInternalIndent",
        internalIndentDTO,
      );
      return res;
    } catch (error) {
      console.error("Error creating/updating internal indent:", error);
      throw error;
    }
  },
};

export default internalIndentAPI;

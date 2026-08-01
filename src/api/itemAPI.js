import apiClient from "./apiClient";

export const itemAPI = {
  getItems: async (orgId, branch) => {
    try {
      const res = await apiClient.get(`/api/itemMaster/getItemMasterByOrgId?orgId=${orgId}&branchId=${branch}`);
      return res?.paramObjectsMap?.itemMasterVO || [];
    } catch (error) {
      console.error("Error fetching states:", error);
      throw error;
    }
  },

  getItemById: async (id) => {
    try {
      const res = await apiClient.get("/api/itemMaster/getItemMasterById", {
        params: { id },
      });
      return res?.paramObjectsMap?.itemMasterVO || null;
    } catch (error) {
      console.error("Error fetching item Item by ID:", error);
      throw error;
    }
  },

  createUpdateItem: async (itemDTO) => {
    try {
      const res = await apiClient.put("/api/itemMaster/updateCreateItemMaster", itemDTO);
      return res;
    } catch (error) {
      console.error("Error creating/updating item:", error);
      throw error;
    }
  },
};

export default itemAPI;

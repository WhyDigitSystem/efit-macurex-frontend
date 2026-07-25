import apiClient from "./apiClient";

export const docTypeMappingAPI = {
  getDocTypeMappingById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getDocTypeMappingById?id=${id}`,
      );
      return res?.paramObjectsMap?.docTypeMappingVO || null;
    } catch (error) {
      console.error("Error fetching doc type mapping by ID:", error);
      throw error;
    }
  },

  // branchCode / year are optional filters - pass "" to skip a filter
  getDocTypeMappingByOrgId: async (branchCode, year, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getDocTypeMappingByOrgId?branchCode=${branchCode}&year=${year}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.docTypeMappingList || [];
    } catch (error) {
      console.error("Error fetching doc type mapping list:", error);
      throw error;
    }
  },

  updateCreateDocTypeMapping: async (docTypeMappingDTO) => {
    try {
      const res = await apiClient.put(
        "/api/commonmaster/updateCreateDocTypeMapping",
        docTypeMappingDTO,
      );
      return res;
    } catch (error) {
      console.error("Error creating/updating doc type mapping:", error);
      throw error;
    }
  },
};

export default docTypeMappingAPI;

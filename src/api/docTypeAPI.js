import apiClient from "./apiClient";

export const docTypeAPI = {
  getDocTypeById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getDocTypeById?id=${id}`,
      );
      return res?.paramObjectsMap?.docTypeVO || null;
    } catch (error) {
      console.error("Error fetching doc type by ID:", error);
      throw error;
    }
  },

  getDocTypeByOrgId: async (branchCode, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getDocTypeByOrgId?branchCode=${branchCode}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.docTypeList || [];
    } catch (error) {
      console.error("Error fetching doc type list:", error);
      throw error;
    }
  },

  updateCreateDocType: async (docTypeMasterDTO) => {
    try {
      const res = await apiClient.put(
        "/api/commonmaster/updateCreateDocTypeMaster",
        docTypeMasterDTO,
      );
      return res;
    } catch (error) {
      console.error("Error creating/updating doc type:", error);
      throw error;
    }
  },
};

export default docTypeAPI;

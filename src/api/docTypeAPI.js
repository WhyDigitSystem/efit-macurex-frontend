import apiClient from "./apiClient";

export const docTypeAPI = {
  getDocumentTypeById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getDocumentTypeMasterById?id=${id}`,
      );
      return res?.paramObjectsMap?.documentTypeMasterVO || null;
    } catch (error) {
      console.error("Error fetching document type by ID:", error);
      throw error;
    }
  },

  getDocumentTypeByOrgId: async (branch, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getDocumentTypeMasterByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.documentTypeMasterList || [];
    } catch (error) {
      console.error("Error fetching document type list:", error);
      throw error;
    }
  },

  updateCreateDocumentType: async (documentTypeMasterDTO) => {
    try {
      const res = await apiClient.put(
        "/api/commonmaster/createUpdateDocumentTypeMaster",
        documentTypeMasterDTO,
      );
      return res;
    } catch (error) {
      console.error("Error creating/updating document type:", error);
      throw error;
    }
  },
};

export default docTypeAPI;

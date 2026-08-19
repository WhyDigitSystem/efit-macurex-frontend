import apiClient from "./apiClient";

const docTypeAPI = {
  // GET /api/commonmaster/getAllScreenCode?orgId=...
  getAllScreenCode: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getAllScreenCode?orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.finScreen || [];
    } catch (error) {
      console.error("Error fetching screen codes:", error);
      throw error;
    }
  },

  // GET /api/commonmaster/getAllDocumentTypeMasterByOrgId?orgId=...
  getAllDocumentTypeMasterByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getAllDocumentTypeMasterByOrgId?orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.documentTypeMasterList || [];
    } catch (error) {
      console.error("Error fetching document type list:", error);
      throw error;
    }
  },

  // GET /api/commonmaster/getDocumentTypeMasterById?id=...
  getDocumentTypeMasterById: async (id) => {
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

  // PUT /api/commonmaster/createUpdateDocumentTypeMaster
  createUpdateDocumentType: async (documentTypeMasterDTO) => {
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

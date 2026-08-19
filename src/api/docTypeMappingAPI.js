import apiClient from "./apiClient";

const docTypeMappingAPI = {
  getDocumentTypeMappingById: async (id) => {
    try {
      const res = await apiClient.get(
        "/api/commonmaster/getDocumentTypeMappingById",
        {
          params: { id },
        },
      );
      return res?.paramObjectsMap?.documentTypeMappingMasterVO || null;
    } catch (error) {
      console.error("Error fetching doc type mapping by ID:", error);
      throw error;
    }
  },

  getDocumentTypeMappingByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        "/api/commonmaster/getDocumentTypeMappingByOrgId",
        {
          params: { orgId, branch },
        },
      );
      // API returns an array under this key, one entry per branch+finYear mapping
      return res?.paramObjectsMap?.documentTypeMappingResponseVO || [];
    } catch (error) {
      console.error("Error fetching doc type mapping list:", error);
      throw error;
    }
  },

  updateCreateDocumentTypeMapping: async (dto) => {
    try {
      const res = await apiClient.put(
        "/api/commonmaster/updateCreateDocumentTypeMapping",
        dto,
      );
      return res;
    } catch (error) {
      console.error("Error creating/updating doc type mapping:", error);
      throw error;
    }
  },
  // GET /api/commonmaster/getPendingDocumentTypeMapping
  getPendingDocumentTypeMapping: async ({
    branch,
    branchCode,
    finYear,
    finYearIdentifier,
    orgId,
  }) => {
    try {
      const params = new URLSearchParams({
        branch,
        branchCode,
        finYear,
        finYearIdentifier,
        orgId,
      });

      const res = await apiClient.get(
        `/api/commonmaster/getPendingDocumentTypeMapping?${params.toString()}`,
      );

      return res?.paramObjectsMap?.documentTypeMappingVO || [];
    } catch (error) {
      console.error("Error fetching pending document type mapping:", error);
      throw error;
    }
  },
};

export default docTypeMappingAPI;

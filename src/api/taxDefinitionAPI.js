import apiClient from "./apiClient";

export const taxDefinitionAPI = {
  // Get Tax Definition By ID
  getTaxDefinitionById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getTaxDefinitionById?id=${id}`,
      );
      return res?.paramObjectsMap?.taxDefinitionVO || null;
    } catch (error) {
      console.error("Error fetching tax definition by ID:", error);
      throw error;
    }
  },

  // Get Tax Definition List By Organization
  getTaxDefinitionByOrgId: async (branch, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getTaxDefinitionByOrgId?branch=${branch}&orgId=${orgId}`,
      );

      return res?.paramObjectsMap?.taxList || [];
    } catch (error) {
      console.error("Error fetching tax definition list:", error);
      throw error;
    }
  },

  // Create / Update Tax Definition
  updateCreateTaxDefinition: async (taxDefinitionDTO) => {
    try {
      const res = await apiClient.put(
        "/api/commonmaster/updateCreateTaxDefinition",
        taxDefinitionDTO,
      );

      return res?.paramObjectsMap?.taxDefinitionVO || res;
    } catch (error) {
      console.error("Error creating/updating tax definition:", error);
      throw error;
    }
  },
};

export default taxDefinitionAPI;

import apiClient from "../apiClient";

export const physicalStockReconciliationAPI = {
  getReconciliationById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/inventorymaster/getPhysicalStockReconciliationById?id=${id}`,
      );
      return res?.paramObjectsMap?.physicalStockReconciliationVO || null;
    } catch (error) {
      console.error(
        "Error fetching physical stock reconciliation by ID:",
        error,
      );
      throw error;
    }
  },

  getReconciliationByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/inventorymaster/getPhysicalStockReconciliationByOrgId?orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.physicalStockReconciliationList || [];
    } catch (error) {
      console.error(
        "Error fetching physical stock reconciliation list:",
        error,
      );
      throw error;
    }
  },

  updateCreateReconciliation: async (reconciliationDTO) => {
    try {
      const res = await apiClient.put(
        "/api/inventorymaster/updateCreatePhysicalStockReconciliation",
        reconciliationDTO,
      );
      return res;
    } catch (error) {
      console.error(
        "Error creating/updating physical stock reconciliation:",
        error,
      );
      throw error;
    }
  },
};

export default physicalStockReconciliationAPI;

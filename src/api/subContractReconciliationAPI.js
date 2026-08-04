// subContractReconciliationAPI.js
import apiClient from "./apiClient";

const subContractReconciliationAPI = {
  // Get Sub Contract Reconciliations by Organization + Branch
  getSubContractReconciliationByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        "/api/commonmaster/getSubContractReconciliationByOrgId",
        { params: { branch, orgId } },
      );
      return res?.paramObjectsMap?.subContractReconciliationVO || [];
    } catch (error) {
      console.error("Error fetching sub contract reconciliations:", error);
      throw error;
    }
  },

  getSubContractReconciliationById: async (id) => {
    try {
      const res = await apiClient.get(
        "/api/commonmaster/getSubContractReconciliationById",
        { params: { id } },
      );
      return res?.paramObjectsMap?.subContractReconciliationVO || null;
    } catch (error) {
      console.error("Error fetching sub contract reconciliation by ID:", error);
      throw error;
    }
  },

  // Create / Update a sub contract reconciliation record linked to the
  // subcontractor location. Header, detail and summary records are saved in a
  // single transaction; the backend is expected to maintain complete
  // reconciliation history.
  createUpdateSubContractReconciliation: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/commonmaster/updateCreateSubContractReconciliation",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving sub contract reconciliation:", error);
      throw error;
    }
  },
};

export default subContractReconciliationAPI;
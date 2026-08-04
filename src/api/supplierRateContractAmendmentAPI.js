// supplierRateContractAmendmentAPI.js
import apiClient from "./apiClient";

const supplierRateContractAmendmentAPI = {
  // Get Supplier Rate Contract Amendments by Organization + Branch
  getSupplierRateContractAmendmentByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        "/api/commonmaster/getSupplierRateContractAmendmentByOrgId",
        { params: { branch, orgId } },
      );
      return res?.paramObjectsMap?.supplierRateContractAmendmentVO || [];
    } catch (error) {
      console.error("Error fetching supplier rate contract amendments:", error);
      throw error;
    }
  },

  getSupplierRateContractAmendmentById: async (id) => {
    try {
      const res = await apiClient.get(
        "/api/commonmaster/getSupplierRateContractAmendmentById",
        { params: { id } },
      );
      return res?.paramObjectsMap?.supplierRateContractAmendmentVO || null;
    } catch (error) {
      console.error(
        "Error fetching supplier rate contract amendment by ID:",
        error,
      );
      throw error;
    }
  },

  // Create / Update a supplier rate contract amendment linked to the original
  // contract. Header, details and summary are saved in a single transaction;
  // the backend is expected to maintain full amendment history with revision
  // tracking.
  createUpdateSupplierRateContractAmendment: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/commonmaster/updateCreateSupplierRateContractAmendment",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving supplier rate contract amendment:", error);
      throw error;
    }
  },
};

export default supplierRateContractAmendmentAPI;
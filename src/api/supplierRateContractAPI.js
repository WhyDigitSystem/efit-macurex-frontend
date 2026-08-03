// supplierRateContractAPI.js
import apiClient from "./apiClient";

const supplierRateContractAPI = {
  // Get Supplier Rate Contracts by Organization + Branch
  getSupplierRateContractByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        "/api/commonmaster/getSupplierRateContractByOrgId",
        { params: { branch, orgId } },
      );
      return res?.paramObjectsMap?.supplierRateContractVO || [];
    } catch (error) {
      console.error("Error fetching supplier rate contracts:", error);
      throw error;
    }
  },

  getSupplierRateContractById: async (id) => {
    try {
      const res = await apiClient.get(
        "/api/commonmaster/getSupplierRateContractById",
        { params: { id } },
      );
      return res?.paramObjectsMap?.supplierRateContractVO || null;
    } catch (error) {
      console.error("Error fetching supplier rate contract by ID:", error);
      throw error;
    }
  },

  // Create / Update a Supplier Rate Contract. Header, item, tax and terms
  // records are persisted in a single transaction; the backend is expected
  // to maintain the full contract history for audit purposes.
  createUpdateSupplierRateContract: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/commonmaster/updateCreateSupplierRateContract",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving supplier rate contract:", error);
      throw error;
    }
  },
};

export default supplierRateContractAPI;

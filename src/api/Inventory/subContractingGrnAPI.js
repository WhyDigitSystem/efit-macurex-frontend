// subContractingGrnAPI.js
import apiClient from "../apiClient";

export const subContractingGrnAPI = {
  // Get Sub Contracting GRNs by Organization ID
  getGrnByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getSubContractingGrnByOrgId?orgId=${orgId}`,
      );

      return res?.paramObjectsMap?.grnList || [];
    } catch (error) {
      console.error("Error fetching sub contracting GRNs:", error);
      throw error;
    }
  },

  // Create / Update Sub Contracting GRN
  createUpdateGrn: async (payload) => {
    try {
      const res = await apiClient.post(
        `/api/commonmaster/createUpdateSubContractingGrn`,
        payload,
      );

      return res;
    } catch (error) {
      console.error("Error saving sub contracting GRN:", error);
      throw error;
    }
  },
};

export default subContractingGrnAPI;

import apiClient from "./apiClient";

export const partyAccountMappingAPI = {
  getMappingById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getPartyAccountMappingById?id=${id}`,
      );
      return res?.paramObjectsMap?.partyAccountMappingVO || null;
    } catch (error) {
      console.error("Error fetching party account mapping by ID:", error);
      throw error;
    }
  },

  getMappingByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getPartyAccountMappingByOrgId?orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.partyAccountMappingList || [];
    } catch (error) {
      console.error("Error fetching party account mapping list:", error);
      throw error;
    }
  },

  // Party master lookup, used to populate the Party Id / Party Name dropdowns
  getParties: async (orgId, category) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getPartiesByCategory?orgId=${orgId}&category=${category}`,
      );
      return res?.paramObjectsMap?.partyList || [];
    } catch (error) {
      console.error("Error fetching parties:", error);
      throw error;
    }
  },

  // Chart of accounts lookup, used to populate the Account Name dropdown
  getAccounts: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getAccountsByOrgId?orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.accountList || [];
    } catch (error) {
      console.error("Error fetching accounts:", error);
      throw error;
    }
  },

  updateCreateMapping: async (partyAccountMappingDTO) => {
    try {
      const res = await apiClient.put(
        "/api/commonmaster/updateCreatePartyAccountMapping",
        partyAccountMappingDTO,
      );
      return res;
    } catch (error) {
      console.error("Error creating/updating party account mapping:", error);
      throw error;
    }
  },
};

export default partyAccountMappingAPI;

import apiClient from "./apiClient";

export const partyAccountMappingAPI = {
  getMappingById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getMappingOfPartyToAccById?id=${id}`,
      );
      return res?.paramObjectsMap?.mappingOfPartyToAccVO || null;
    } catch (error) {
      console.error("Error fetching party account mapping by ID:", error);
      throw error;
    }
  },

  getMappingByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getMappingOfPartyToAccByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.mappingOfPartyToAccVO || [];
    } catch (error) {
      console.error("Error fetching party account mapping list:", error);
      throw error;
    }
  },

  // Party master lookup, used to populate the Party dropdown.
  // Returns the partyList with partyId / partyName for the given branch + category.
  getParties: async (orgId, category, branch) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getPartyforMappingOfPartyToAcc?branch=${branch}&category=${category}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.partyList || [];
    } catch (error) {
      console.error("Error fetching parties:", error);
      throw error;
    }
  },

  // Chart of accounts lookup, used to populate the Account Name dropdown.
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

  updateCreateMapping: async (mappingOfPartyToAccDTO) => {
    try {
      const res = await apiClient.put(
        "/api/commonmaster/updateCreateMappingOfPartyToAcc",
        mappingOfPartyToAccDTO,
      );
      return res;
    } catch (error) {
      console.error("Error creating/updating party account mapping:", error);
      throw error;
    }
  },
};

export default partyAccountMappingAPI;
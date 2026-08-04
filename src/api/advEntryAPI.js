// advEntryAPI.js
import apiClient from "./apiClient";

const advEntryAPI = {
  // Get ADV Entries by Organization + Branch
  getAdvByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get("/api/commonmaster/getAdvByOrgId", {
        params: { branch, orgId },
      });
      return res?.paramObjectsMap?.advVO || [];
    } catch (error) {
      console.error("Error fetching ADV entries:", error);
      throw error;
    }
  },

  getAdvById: async (id) => {
    try {
      const res = await apiClient.get("/api/commonmaster/getAdvById", {
        params: { id },
      });
      return res?.paramObjectsMap?.advVO || null;
    } catch (error) {
      console.error("Error fetching ADV entry by ID:", error);
      throw error;
    }
  },

  // Create / Update an ADV record linked to the BOM and Party. Header,
  // details and summary are saved in a single transaction; the backend is
  // expected to maintain complete ADV history.
  createUpdateAdv: async (payload) => {
    try {
      const res = await apiClient.put("/api/commonmaster/updateCreateAdv", {
        ...payload,
      });
      return res;
    } catch (error) {
      console.error("Error saving ADV entry:", error);
      throw error;
    }
  },
};

export default advEntryAPI;
import apiClient from "../apiClient";

/* Opening Stock Entry API
   Follows the inventory API convention used across this app. The backend
   persists the opening stock header + stock detail lines + summary in a
   single transaction, links the record to the plant, location and item
   details and keeps the complete opening stock history for audit &
   reporting (server-side validation).
   NOTE: endpoint paths follow the app naming convention - confirm against
   the backend swagger before going live. */
const openingStockEntryAPI = {
  getByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/inventory/getOpeningStockEntryByOrgId?orgId=${orgId}&branch=${branch}`,
      );
      return res?.paramObjectsMap?.openingStockEntryVO || [];
    } catch (error) {
      console.error("Error fetching opening stock entries:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/inventory/getOpeningStockEntryById?id=${id}`,
      );
      return res?.paramObjectsMap?.openingStockEntryVO || null;
    } catch (error) {
      console.error("Error fetching opening stock entry by id:", error);
      throw error;
    }
  },

  createUpdate: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/inventory/updateCreateOpeningStockEntry",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving opening stock entry:", error);
      throw error;
    }
  },
};

export default openingStockEntryAPI;
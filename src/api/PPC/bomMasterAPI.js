import apiClient from "../apiClient";

/* Bill of Material (BOM) Master API
   Mirrors the commonmaster API convention used across this app.
   The backend persists the BOM header + material details + summary records
   in a single transaction, links the record to the FG/SFG item and revision
   and keeps the complete BOM history with material & scrap references for
   audit purposes (server-side validation). */
const bomMasterAPI = {
  getByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getBomMasterByOrgId?orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.bomMasterList || [];
    } catch (error) {
      console.error("Error fetching BOM master records:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getBomMasterById?id=${id}`,
      );
      return res?.paramObjectsMap?.bomMasterVO || null;
    } catch (error) {
      console.error("Error fetching BOM master by id:", error);
      throw error;
    }
  },

  createUpdate: async (data) => {
    try {
      const res = await apiClient.post(
        "/api/commonmaster/createUpdateBomMaster",
        data,
      );
      return res;
    } catch (error) {
      console.error("Error saving BOM master:", error);
      throw error;
    }
  },
};

export default bomMasterAPI;
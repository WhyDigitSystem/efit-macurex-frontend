import apiClient from "../apiClient";

const scrapNoteAPI = {
  /* ---------------- List by Org + Branch ---------------- */
  getByOrgIdAndBranch: async ({ branch, orgId }) => {
    try {
      const res = await apiClient.get(
        `/api/purchaseOrder/getScrapNoteByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.scrapNoteResponseVO || [];
    } catch (error) {
      console.error("Error fetching Scrap Notes:", error);
      throw error;
    }
  },

  /* ---------------- Get by Id ---------------- */
  getById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/purchaseOrder/getScrapNoteById?id=${id}`,
      );
      return res?.paramObjectsMap?.scrapNoteResponseVO || null;
    } catch (error) {
      console.error("Error fetching Scrap Note by id:", error);
      throw error;
    }
  },

  /* ---------------- Doc Id ---------------- */
  getDocId: async ({ financialYear, orgId }) => {
    try {
      const res = await apiClient.get(
        `/api/purchaseOrder/getScrapNoteDocId?financialYear=${financialYear}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.scrapNoteDocId || "";
    } catch (error) {
      console.error("Error fetching Scrap Note Doc Id:", error);
      throw error;
    }
  },

  /* ---------------- FG Part No dropdown ---------------- */
  getFgPartNoOptions: async ({ branch, orgId }) => {
    try {
      const res = await apiClient.get(
        `/api/purchaseOrder/getFgPartNoDetails?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.mapp || [];
    } catch (error) {
      console.error("Error fetching FG Part No options:", error);
      throw error;
    }
  },

  /* ---------------- Schedule Order No dropdown ---------------- */
  getScheduleOrderOptions: async ({ branch, orgId }) => {
    try {
      const res = await apiClient.get(
        `/api/purchaseOrder/getSchNoFromScrapNote?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.mapp || [];
    } catch (error) {
      console.error("Error fetching schedule order options:", error);
      throw error;
    }
  },

  /* ---------------- BOM Id dropdown ---------------- */
  getBomOptions: async ({ branch, orgId }) => {
    try {
      const res = await apiClient.get(
        `/api/purchaseOrder/getBomNoFromScrapNote?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.mapp || [];
    } catch (error) {
      console.error("Error fetching BOM options:", error);
      throw error;
    }
  },

  /* ---------------- Scrap Part No dropdown ---------------- */
  getScrapPartNoOptions: async ({ branch, orgId }) => {
    try {
      const res = await apiClient.get(
        `/api/purchaseOrder/getScrapPartNo?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.mapp || [];
    } catch (error) {
      console.error("Error fetching scrap part numbers:", error);
      throw error;
    }
  },

  /* ---------------- Item Code dropdown (per BOM) ---------------- */
  getItemsByBom: async ({ bom, branch, orgId }) => {
    try {
      const res = await apiClient.get(
        `/api/purchaseOrder/getScrapNoteItemDetails?bom=${bom}&branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.mapp || [];
    } catch (error) {
      console.error("Error fetching scrap note items:", error);
      throw error;
    }
  },

  /* ---------------- Save (create / update) ---------------- */
  createUpdate: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/purchaseOrder/createUpdateScrapNote",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving Scrap Note:", error);
      throw error;
    }
  },
};

export default scrapNoteAPI;
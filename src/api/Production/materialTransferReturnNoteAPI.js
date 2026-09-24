import apiClient from "../apiClient";

const materialTransferReturnNoteAPI = {
  /* ---------------- List by Org + Branch ---------------- */
  getByOrgIdAndBranch: async ({ branch, orgId }) => {
    try {
      const res = await apiClient.get(
        `/api/purchaseOrder/getMaterialTransferReturnNoteByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.materialTransferReturnNoteResponseVO || [];
    } catch (error) {
      console.error("Error fetching Material Transfer/Return Notes:", error);
      throw error;
    }
  },

  /* ---------------- Get by Id ---------------- */
  getById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/purchaseOrder/getMaterialTransferReturnNoteById?id=${id}`,
      );
      return res?.paramObjectsMap?.materialTransferReturnNoteResponseVO || null;
    } catch (error) {
      console.error("Error fetching MTRN by id:", error);
      throw error;
    }
  },

  /* ---------------- Doc Id ---------------- */
  getDocId: async ({ financialYear, orgId }) => {
    try {
      const res = await apiClient.get(
        `/api/purchaseOrder/getMaterialTransferReturnNoteDocId?financialYear=${financialYear}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.materialTransferReturnNoteDocId || "";
    } catch (error) {
      console.error("Error fetching MTRN Doc Id:", error);
      throw error;
    }
  },

  /* ---------------- List-of-values (Belongs To) ---------------- */
  getListValuesGroup: async (listDescription, orgId) => {
    try {
      const res = await apiClient.get("/api/commonmaster/getListValuesGroup", {
        params: { listDescription, orgId },
      });
      return res?.paramObjectsMap?.listValues || [];
    } catch (error) {
      console.error(
        `Error fetching list values group "${listDescription}":`,
        error,
      );
      throw error;
    }
  },

  /* ---------------- FG / SFG Items ---------------- */
  getFgAndSfg: async ({ branch, orgId }) => {
    try {
      const res = await apiClient.get(
        `/api/purchaseOrder/getFgAndSfgFromMaterialTransferReturnNote?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.mapp || [];
    } catch (error) {
      console.error("Error fetching FG/SFG items:", error);
      throw error;
    }
  },

  /* ---------------- Schedule Orders ---------------- */
  getScheduleOrders: async ({ branch, orgId }) => {
    try {
      const res = await apiClient.get(
        `/api/purchaseOrder/getSchNoFromMaterialTransferReturnNote?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.mapp || [];
    } catch (error) {
      console.error("Error fetching schedule orders:", error);
      throw error;
    }
  },

  /* ---------------- Schedule Order Items ---------------- */
  getScheduleItems: async ({ branch, orgId, schNo }) => {
    try {
      const res = await apiClient.get(
        `/api/purchaseOrder/getSchNoItemDetailsFromMaterialTransferReturnNote?branch=${branch}&orgId=${orgId}&schNo=${encodeURIComponent(
          schNo,
        )}`,
      );
      return res?.paramObjectsMap?.mapp || [];
    } catch (error) {
      console.error("Error fetching schedule items:", error);
      throw error;
    }
  },

  /* ---------------- Suppliers ---------------- */
  getSuppliers: async ({ branch, orgId }) => {
    try {
      const res = await apiClient.get(
        `/api/purchaseOrder/getSupplierDetails?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.mapp || [];
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      throw error;
    }
  },

  /* ---------------- Save (create / update) ---------------- */
  createUpdate: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/purchaseOrder/createUpdateMaterialTransferReturnNote",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving Material Transfer/Return Note:", error);
      throw error;
    }
  },
};

export default materialTransferReturnNoteAPI;
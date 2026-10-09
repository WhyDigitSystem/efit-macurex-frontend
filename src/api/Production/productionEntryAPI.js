import apiClient from "../apiClient";

const BASE = "/api/productionEntry";

const productionEntryAPI = {
  // ---------- List / Single ----------
  getByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `${BASE}/getProductionEntryByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.productionEntryResponseVO || [];
    } catch (error) {
      console.error("Error fetching production entries:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get(
        `${BASE}/getProductionEntryById?id=${id}`,
      );
      return res?.paramObjectsMap?.productionEntryResponseVO || null;
    } catch (error) {
      console.error("Error fetching production entry by id:", error);
      throw error;
    }
  },

  // ---------- Save (PUT) ----------
  createUpdate: async (data) => {
    try {
      const res = await apiClient.put(
        `${BASE}/createUpdateProductionEntry`,
        data,
      );
      return res;
    } catch (error) {
      console.error("Error saving production entry:", error);
      throw error;
    }
  },

  // ---------- Doc Id ----------
  getDocId: async (financialYear, orgId) => {
    const res = await apiClient.get(
      `${BASE}/getProductionEntryDocId?financialYear=${financialYear}&orgId=${orgId}`,
    );
    return res?.paramObjectsMap?.productionEntryDocId || "";
  },

  // ---------- FG item dependent lookups ----------
  getBomNo: async (branch, fgItem, orgId) => {
    const res = await apiClient.get(
      `${BASE}/getBomNoFromProductionEntry?branch=${branch}&fgItem=${fgItem}&orgId=${orgId}`,
    );
    return res?.paramObjectsMap?.mapp || [];
  },

  getSchNo: async (branch, fgItem, orgId) => {
    const res = await apiClient.get(
      `${BASE}/getSchNoFromProductionEntry?branch=${branch}&fgItem=${fgItem}&orgId=${orgId}`,
    );
    return res?.paramObjectsMap?.mapp || [];
  },

  getProcessSheets: async (branch, fgItem, orgId) => {
    const res = await apiClient.get(
      `${BASE}/getProcessSheetProductionEntry?branch=${branch}&fgItem=${fgItem}&orgId=${orgId}`,
    );
    return res?.paramObjectsMap?.mapp || [];
  },

  getProcessSheetOperations: async (branch, orgId, processSheet) => {
    const res = await apiClient.get(
      `${BASE}/getProcessSheetOpreationDetailsProductionEntry?branch=${branch}&orgId=${orgId}&processSheet=${encodeURIComponent(processSheet)}`,
    );
    return res?.paramObjectsMap?.mapp || [];
  },

  // ---------- Master lookups used by the form ----------
  getFgItems: async (branch, orgId) => {
    const res = await apiClient.get(
      `/api/purchaseOrder/getFgPartNoDetails?branch=${branch}&orgId=${orgId}`,
    );
    return res?.paramObjectsMap?.mapp || [];
  },

  getReasons: async (orgId) => {
    const res = await apiClient.get(
      `/api/reasonmaster/getReasonMasterByOrgId?orgId=${orgId}`,
    );
    return res?.paramObjectsMap?.reasonMasterResponseVO || [];
  },

  getScrapItems: async (branch, orgId) => {
    const res = await apiClient.get(
      `/api/purchaseOrder/getScrapItemDetails?branch=${branch}&orgId=${orgId}`,
    );
    return res?.paramObjectsMap?.mapp || [];
  },

  getBranches: async (orgId) => {
    const res = await apiClient.get(
      `/api/commonmaster/getBranchByOrgId?orgId=${orgId}`,
    );
    return res?.paramObjectsMap?.branchList || [];
  },

  getListValues: async (listDescription, orgId) => {
    const res = await apiClient.get(
      `/api/commonmaster/getListValuesGroup?listDescription=${encodeURIComponent(listDescription)}&orgId=${orgId}`,
    );
    return res?.paramObjectsMap?.listValues || [];
  },

  getTools: async (branch, orgId) => {
    const res = await apiClient.get(
      `/api/toolmaster/getToolMasterByOrgId?branch=${branch}&orgId=${orgId}`,
    );
    return res?.paramObjectsMap?.toolMasterList || [];
  },
};

export default productionEntryAPI;

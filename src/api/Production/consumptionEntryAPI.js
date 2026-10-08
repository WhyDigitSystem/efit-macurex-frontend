import apiClient from "../apiClient";

const unwrap = (response) => response?.data ?? response;

/* Pull the first matching key out of paramObjectsMap */
const pick = (data, keys) => {
  const map = data?.paramObjectsMap || {};
  for (const k of keys) {
    if (map[k] !== undefined && map[k] !== null) return map[k];
  }
  return undefined;
};

const consumptionEntryAPI = {
  /* ---------------- CREATE / UPDATE ---------------- */
  updateCreateConsumptionEntry: async (payload) => {
    try {
      const response = await apiClient.put(
        `/api/purchaseOrder/createUpdateConsumptionEntry`,
        payload,
      );
      return unwrap(response);
    } catch (error) {
      console.error(
        "Error saving consumption entry:",
        error?.response?.data || error,
      );
      throw error;
    }
  },

  /* ---------------- GET BY ID ---------------- */
  getConsumptionEntryById: async (id) => {
    try {
      const response = await apiClient.get(
        `/api/purchaseOrder/getConsumptionEntryById`,
        { params: { id } },
      );
      const data = unwrap(response);
      if (data?.status === false) {
        throw new Error(
          data?.paramObjectsMap?.errorMessage || "Consumption Entry Not Found",
        );
      }
      // Real response key: paramObjectsMap.consumptionEntryResponseVO
      let result = pick(data, [
        "consumptionEntryResponseVO",
        "consumptionEntryVO",
        "consumptionEntry",
        "consumptionEntryResponseDTO",
      ]);
      if (result === undefined) {
        // last resort: first object in the map that looks like the entry
        result = Object.values(data?.paramObjectsMap || {}).find(
          (v) => v && typeof v === "object" && !Array.isArray(v) && v.id,
        );
      }
      return Array.isArray(result) ? result[0] : result;
    } catch (error) {
      console.error(
        "Error fetching consumption entry:",
        error?.response?.data || error,
      );
      throw error;
    }
  },

  /* ---------------- GET LIST ---------------- */
  getConsumptionEntryByOrgId: async (branch, orgId) => {
    try {
      const response = await apiClient.get(
        `/api/purchaseOrder/getConsumptionEntryByOrgId`,
        { params: { branch, orgId } },
      );
      const data = unwrap(response);
      // "Not Found" comes back as status:false - treat as empty list
      if (data?.status === false) return [];

      let list = pick(data, [
        "consumptionEntryResponseVO",
        "consumptionEntryResponseVOList",
        "consumptionEntryVO",
        "consumptionEntryVOs",
        "consumptionEntryList",
        "consumptionEntry",
        "mapp",
      ]);
      if (list === undefined) {
        list = Object.values(data?.paramObjectsMap || {}).find(Array.isArray);
      }
      return Array.isArray(list) ? list : list ? [list] : [];
    } catch (error) {
      console.error(
        "Error fetching consumption entries:",
        error?.response?.data || error,
      );
      throw error;
    }
  },

  /* ---------------- DOC ID ---------------- */
  getConsumptionEntryDocId: async (financialYear, orgId) => {
    try {
      const response = await apiClient.get(
        `/api/purchaseOrder/getConsumptionEntryDocId`,
        { params: { financialYear, orgId } },
      );
      return unwrap(response)?.paramObjectsMap?.consumptionEntryDocId || "";
    } catch (error) {
      console.error(
        "Error fetching consumption entry doc id:",
        error?.response?.data || error,
      );
      throw error;
    }
  },

  /* ---------------- FG / SFG ITEMS ---------------- */
  getFgAndSfgItemDetails: async (branch, orgId) => {
    try {
      const response = await apiClient.get(
        `/api/purchaseOrder/getFgAndSfgItemDetailsConsumptionEntry`,
        { params: { branch, orgId } },
      );
      return unwrap(response)?.paramObjectsMap?.mapp || [];
    } catch (error) {
      console.error(
        "Error fetching FG/SFG items:",
        error?.response?.data || error,
      );
      throw error;
    }
  },

  /* ---------------- RM FOR A FG ITEM ---------------- */
  getRawMaterialConsumptionEntry: async (branch, fgItem, orgId) => {
    try {
      const response = await apiClient.get(
        `/api/purchaseOrder/getRawMaterialConsumptionEntry`,
        { params: { branch, fgItem, orgId } },
      );
      return unwrap(response)?.paramObjectsMap?.mapp || [];
    } catch (error) {
      console.error(
        "Error fetching RM consumption:",
        error?.response?.data || error,
      );
      throw error;
    }
  },

  /* ---------------- LIST VALUES (entryType = TYPE) ---------------- */
  getListValuesGroup: async (listDescription, orgId) => {
    try {
      const response = await apiClient.get(
        `/api/commonmaster/getListValuesGroup`,
        { params: { listDescription, orgId } },
      );
      return unwrap(response)?.paramObjectsMap?.listValues || [];
    } catch (error) {
      console.error(
        "Error fetching list values:",
        error?.response?.data || error,
      );
      throw error;
    }
  },

  /* ---------------- LOCATION (/api/commonmaster/getLocationByOrgId) ---------------- */
  // Response: paramObjectsMap.transportList[] -> { id, locationName, ... }
  getLocations: async (branch, orgId) => {
    try {
      const response = await apiClient.get(
        `/api/commonmaster/getLocationByOrgId`,
        { params: { branch, orgId } },
      );
      return unwrap(response)?.paramObjectsMap?.transportList || [];
    } catch (error) {
      console.error(
        "Error fetching locations:",
        error?.response?.data || error,
      );
      return [];
    }
  },

  /* ---------------- PLANT list (/api/commonmaster/getBranchByOrgId) ---------------- */
  // Response: paramObjectsMap.branchList[] -> { id, branchCode, branchName, ... }
  getBranches: async (orgId) => {
    try {
      const response = await apiClient.get(
        `/api/commonmaster/getBranchByOrgId`,
        {
          params: { orgId },
        },
      );
      return unwrap(response)?.paramObjectsMap?.branchList || [];
    } catch (error) {
      console.error("Error fetching branches:", error?.response?.data || error);
      return [];
    }
  },

  /* ---------------- Default plant (logged-in branch from localStorage) ---------------- */
  // Only used to pre-select the Plant dropdown / the list's branch. If your
  // app stores it under different localStorage keys, change them here only.
  getCurrentBranch: () => {
    const idRaw =
      [localStorage.getItem("branchId"), localStorage.getItem("branch")].find(
        (v) => v && !Number.isNaN(Number(v)),
      ) || "";
    const nameRaw =
      localStorage.getItem("branchName") ||
      localStorage.getItem("branchCode") ||
      (Number.isNaN(Number(localStorage.getItem("branch")))
        ? localStorage.getItem("branch")
        : "") ||
      "";
    return { id: idRaw ? Number(idRaw) : 0, name: nameRaw || idRaw };
  },
};

export default consumptionEntryAPI;

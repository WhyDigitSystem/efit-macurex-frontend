import apiClient from "../apiClient";

const assertSuccess = (res, fallbackMessage) => {
  const failed = res?.status === false || res?.statusFlag === "Error";

  if (failed) {
    const backendMessage =
      res?.paramObjectsMap?.errorMessage ||
      res?.paramObjectsMap?.message ||
      res?.errors?.[0]?.shortMessage ||
      res?.errors?.[0]?.longMessage ||
      fallbackMessage;

    const error = new Error(backendMessage);
    error.response = { data: res };
    throw error;
  }

  return res;
};

const zeroKmFailureAPI = {
  // Get Zero Km Failure Entries by Organization ID
  getZeroKmFailureEntryByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/develop/getZeroKmFailureEntryByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      assertSuccess(res, "Failed to fetch Zero Km Failure Entries");

      const map = res?.paramObjectsMap || {};
      const list =
        map.zeroKmFailureEntryResponseVO ||
        map.zeroKmFailureEntryList ||
        map.zeroKmFailureEntryVOList ||
        map.zeroKmFailureEntryVO ||
        map.zeroKmFailureEntry;
      return Array.isArray(list) ? list : list ? [list] : [];
    } catch (error) {
      console.error("Error fetching zero km failure entries:", error);
      throw error;
    }
  },

  // Get Zero Km Failure Entry by ID
  getZeroKmFailureEntryById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/develop/getZeroKmFailureEntryById?id=${id}`,
      );
      assertSuccess(res, "Zero Km Failure Entry not found");

      const map = res?.paramObjectsMap || {};
      const found =
        map.zeroKmFailureEntryResponseVO ||
        map.zeroKmFailureEntryVO ||
        map.zeroKmFailureEntry;
      return Array.isArray(found) ? found[0] || null : found || null;
    } catch (error) {
      console.error("Error fetching zero km failure entry by ID:", error);
      throw error;
    }
  },

  // Get the next Zero Km Failure Entry Doc ID for a financial year
  getZeroKmFailureEntryDocId: async (orgId, financialYear) => {
    try {
      const res = await apiClient.get(
        `/api/develop/getZeroKmFailureEntryDocId?financialYear=${financialYear}&orgId=${orgId}`,
      );
      assertSuccess(res, "Failed to generate Zero Km Failure Entry Doc No");

      return res?.paramObjectsMap?.zeroKmFailureEntryDocId || "";
    } catch (error) {
      console.error("Error generating zero km failure entry doc id:", error);
      throw error;
    }
  },

  createUpdateZeroKmFailureEntry: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/develop/updateCreateZeroKmFailureEntry",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving zero km failure entry:", error);
      throw error;
    }
  },
};

export default zeroKmFailureAPI;

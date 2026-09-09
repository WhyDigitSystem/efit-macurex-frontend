import apiClient from "../apiClient";

/* -------------------------------------------------------------------------- */
/* Helper                                                                     */
/* -------------------------------------------------------------------------- */

const getResponseData = (response) => {
  return response?.data ?? response ?? {};
};

/* -------------------------------------------------------------------------- */
/* Opening Stock Entry API                                                    */
/* -------------------------------------------------------------------------- */

const openingStockEntryAPI = {
  /* ------------------------------------------------------------------------ */
  /* Get Opening Stock Entry List                                             */
  /* ------------------------------------------------------------------------ */

  getByOrgId: async (orgId, branch) => {
    try {
      const response = await apiClient.get(
        "/api/develop/getOpenStockEntryByOrgId",
        {
          params: {
            branch: Number(branch),
            orgId: Number(orgId),
          },
        },
      );

      const res = getResponseData(response);

      console.log(
        "================ OPENING STOCK ENTRY LIST RESPONSE ================",
      );
      console.log("Raw Response:", res);

      const list =
        res?.paramObjectsMap?.openStockEntryResponseVO ||
        res?.paramObjectsMap?.openStockEntryVO ||
        res?.paramObjectsMap?.openStockEntryList ||
        res?.paramObjectsMap?.list ||
        [];

      console.log("Extracted Opening Stock Entry List:", list);
      console.log("Is Array:", Array.isArray(list));
      console.log("Count:", Array.isArray(list) ? list.length : 0);

      return Array.isArray(list) ? list : [];
    } catch (error) {
      console.error("Error fetching Opening Stock Entry list:", error);

      console.error(
        "Opening Stock Entry Error Response:",
        error?.response?.data,
      );

      throw error;
    }
  },

  /* ------------------------------------------------------------------------ */
  /* Get Opening Stock Entry By ID                                            */
  /* ------------------------------------------------------------------------ */

  getById: async (id) => {
    try {
      const response = await apiClient.get(
        "/api/develop/getOpenStockEntryById",
        {
          params: {
            id: Number(id),
          },
        },
      );

      const res = getResponseData(response);

      console.log(
        "================ OPENING STOCK ENTRY BY ID ================",
      );
      console.log("Response:", res);

      return (
        res?.paramObjectsMap?.openStockEntryResponseVO ||
        res?.paramObjectsMap?.openStockEntryResponse ||
        res?.paramObjectsMap?.openStockEntryVO ||
        res?.paramObjectsMap?.openStockEntry ||
        res?.paramObjectsMap?.data ||
        null
      );
    } catch (error) {
      console.error("Error fetching Opening Stock Entry by ID:", error);

      console.error("Opening Stock Entry By ID Error:", error?.response?.data);

      throw error;
    }
  },

  /* ------------------------------------------------------------------------ */
  /* Create / Update Opening Stock Entry                                      */
  /* ------------------------------------------------------------------------ */

  createUpdate: async (payload) => {
    try {
      console.log(
        "================ OPENING STOCK ENTRY SAVE PAYLOAD ================",
      );
      console.log(JSON.stringify(payload, null, 2));

      const response = await apiClient.put(
        "/api/develop/createUpdateOpenStockEntry",
        payload,
      );

      const res = getResponseData(response);

      console.log(
        "================ OPENING STOCK ENTRY SAVE RESPONSE ================",
      );
      console.log(res);

      return res;
    } catch (error) {
      console.error("Error saving Opening Stock Entry:", error);

      console.error(
        "Opening Stock Entry Save Error Response:",
        error?.response?.data,
      );

      throw error;
    }
  },

  /* ------------------------------------------------------------------------ */
  /* Generate Document ID                                                     */
  /* ------------------------------------------------------------------------ */

  getOpenStockEntryDocId: async (financialYear, orgId, screenCode = "OSE") => {
    try {
      const response = await apiClient.get(
        "/api/develop/getOpenStockEntryDocId",
        {
          params: {
            financialYear: String(financialYear),
            orgId: Number(orgId),
            screenCode: String(screenCode),
          },
        },
      );

      const res = getResponseData(response);

      console.log("Opening Stock Entry Doc ID Response:", res);

      return (
        res?.paramObjectsMap?.openStockEntryDocId ||
        res?.paramObjectsMap?.docId ||
        ""
      );
    } catch (error) {
      console.error("Error generating Opening Stock Entry Doc ID:", error);

      console.error("Doc ID Error Response:", error?.response?.data);

      throw error;
    }
  },

  /* ------------------------------------------------------------------------ */
  /* Item Code Dropdown                                                        */
  /* ------------------------------------------------------------------------ */

  getItemCodeDropdown: async (branch, orgId) => {
    try {
      const response = await apiClient.get(
        "/api/develop/getOpenStockEntryItemCodeDropdown",
        {
          params: {
            branch: Number(branch),
            orgId: Number(orgId),
          },
        },
      );

      const res = getResponseData(response);

      console.log("Opening Stock Entry Item Dropdown Response:", res);

      const list =
        res?.paramObjectsMap?.itemCodeList ||
        res?.paramObjectsMap?.itemList ||
        res?.paramObjectsMap?.items ||
        [];

      return Array.isArray(list) ? list : [];
    } catch (error) {
      console.error("Error fetching Opening Stock Entry item dropdown:", error);

      console.error("Item Dropdown Error Response:", error?.response?.data);

      throw error;
    }
  },

  /* ------------------------------------------------------------------------ */
  /* Location Dropdown                                                        */
  /* ------------------------------------------------------------------------ */

  getLocationByOrgId: async (orgId, branch) => {
    try {
      const response = await apiClient.get(
        "/api/commonmaster/getLocationByOrgId",
        {
          params: {
            branch: Number(branch),
            orgId: Number(orgId),
          },
        },
      );

      const res = getResponseData(response);

      console.log("Opening Stock Entry Location Response:", res);

      const list =
        res?.paramObjectsMap?.transportList ||
        res?.paramObjectsMap?.locationList ||
        res?.paramObjectsMap?.locations ||
        [];

      return Array.isArray(list) ? list : [];
    } catch (error) {
      console.error("Error fetching Opening Stock Entry locations:", error);

      console.error("Location Error Response:", error?.response?.data);

      throw error;
    }
  },
};

export default openingStockEntryAPI;

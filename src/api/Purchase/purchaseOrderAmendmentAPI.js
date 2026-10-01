import apiClient from "../apiClient";

const purchaseOrderAmendmentAPI = {
  /**
   * GET ALL PURCHASE ORDER AMENDMENTS
   *
   * GET
   * /api/develop/getPurchaseOrderAmendmentByOrgId
   */
  getAll: async (orgId) => {
    try {
      const res = await apiClient.get(
        "/api/develop/getPurchaseOrderAmendmentByOrgId",
        {
          params: {
            orgId: Number(orgId),
          },
        },
      );

      return res?.paramObjectsMap?.purchaseOrderAmendmentResponseVO || [];
    } catch (error) {
      console.error(
        "Error fetching PO amendments:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /**
   * GET PURCHASE ORDER AMENDMENT BY ID
   *
   * GET
   * /api/develop/getPurchaseOrderAmendmentById
   */
  getById: async (id) => {
    try {
      const res = await apiClient.get(
        "/api/develop/getPurchaseOrderAmendmentById",
        {
          params: {
            id: Number(id),
          },
        },
      );

      return res?.paramObjectsMap?.purchaseOrderAmendmentResponseVO || null;
    } catch (error) {
      console.error(
        "Error fetching PO amendment by id:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /**
   * GET ITEM CODE DROPDOWN
   *
   * IMPORTANT:
   * Backend expects purchaseOrderNumber,
   * NOT docId.
   *
   * GET
   * /api/develop/getPurchaseOrderAmendmentItemCodeDropdown
   */
  getItemCodeDropdown: async (branch, purchaseOrderNumber, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/develop/getPurchaseOrderAmendmentItemCodeDropdown",
        {
          params: {
            branch: Number(branch),
            purchaseOrderNumber,
            orgId: Number(orgId),
          },
        },
      );

      return res?.paramObjectsMap?.itemCodeDropdown || [];
    } catch (error) {
      console.error(
        "Error fetching PO Amendment item code dropdown:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /**
   * GET DOCUMENT ID
   *
   * GET
   * /api/develop/getPurchaseOrderAmendmentDocId
   */
  getDocId: async ({ financialYear, orgId, screenCode }) => {
    try {
      const res = await apiClient.get(
        "/api/develop/getPurchaseOrderAmendmentDocId",
        {
          params: {
            financialYear,
            orgId: Number(orgId),
            screenCode,
          },
        },
      );

      return res?.paramObjectsMap?.purchaseOrderAmendmentDocId || "";
    } catch (error) {
      console.error(
        "Error fetching PO Amendment doc id:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /**
   * GET REVISION NUMBER
   *
   * GET
   * /api/develop/getPurchaseOrderAmdRevisionNo
   */
  getRevisionNo: async ({ branch, orgId, purchaseOrderNumber }) => {
    try {
      const res = await apiClient.get(
        "/api/develop/getPurchaseOrderAmdRevisionNo",
        {
          params: {
            branch: Number(branch),
            orgId: Number(orgId),
            purchaseOrderNumber,
          },
        },
      );

      return res?.paramObjectsMap?.revisionNo ?? 0;
    } catch (error) {
      console.error(
        "Error fetching PO Amendment revision no:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /**
   * GET PURCHASE ORDER DROPDOWN
   *
   * GET
   * /api/develop/getPurchaseOrderDropdownForPurchaseOrderAmendment
   */
  getPurchaseOrderDropdownForPurchaseOrderAmendment: async ({
    branch,
    customerId,
    orgId,
  }) => {
    try {
      const res = await apiClient.get(
        "/api/develop/getPurchaseOrderDropdownForPurchaseOrderAmendment",
        {
          params: {
            branch: Number(branch),
            customerId: Number(customerId),
            orgId: Number(orgId),
          },
        },
      );

      return res?.paramObjectsMap?.purchaseOrderDropdown || [];
    } catch (error) {
      console.error(
        "Error fetching PO dropdown for PO Amendment:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /**
   * CREATE / UPDATE PURCHASE ORDER AMENDMENT
   *
   * POST
   * /api/develop/updateCreatePurchaseOrderAmendment
   *
   * IMPORTANT:
   * Do NOT manually set Content-Type here.
   *
   * Axios/browser automatically creates:
   *
   * multipart/form-data;
   * boundary=---------------------------
   */
  createUpdate: async (formData) => {
    try {
      if (!(formData instanceof FormData)) {
        throw new Error("Purchase Order Amendment request must be FormData.");
      }

      console.log("========== PO AMENDMENT API REQUEST ==========");

      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(key, "FILE:", value.name, value.type, value.size);
        } else if (value instanceof Blob) {
          console.log(key, "BLOB:", value.type, value.size);
        } else {
          console.log(key, value);
        }
      }

      const response = await apiClient.post(
        "/api/develop/updateCreatePurchaseOrderAmendment",
        formData,
      );

      console.log("========== PO AMENDMENT API RESPONSE ==========");

      console.log(response);

      return response;
    } catch (error) {
      console.error("========== PO AMENDMENT API ERROR ==========");

      console.error("Status:", error?.response?.status);

      console.error("Response:", error?.response?.data);

      console.error("Message:", error?.message);

      throw error;
    }
  },

  /**
   * GET CURRENCY EXCHANGE RATE
   *
   * GET
   * /api/develop/getCurrencyExchangeRateforPurchaseOrderAmendment
   */
  getCurrencyExchangeRateforPurchaseOrderAmendment: async (
    branch,
    docId,
    orgId,
  ) => {
    try {
      const res = await apiClient.get(
        "/api/develop/getCurrencyExchangeRateforPurchaseOrderAmendment",
        {
          params: {
            branch: Number(branch),
            docId,
            orgId: Number(orgId),
          },
        },
      );

      return res?.paramObjectsMap?.currencyDetails || [];
    } catch (error) {
      console.error(
        "Error fetching currency exchange rate for PO Amendment:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /**
   * GET UNIT MASTER
   *
   * GET
   * /api/commonmaster/getUnitMasterByOrgId
   */
  getUnitMasterByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        "/api/commonmaster/getUnitMasterByOrgId",
        {
          params: {
            orgId: Number(orgId),
          },
        },
      );

      return res?.paramObjectsMap?.unitMasterList || [];
    } catch (error) {
      console.error(
        "Error fetching unit master by org:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /**
   * GET LIST VALUES
   *
   * GET
   * /api/commonmaster/getListValuesGroup
   */
  getListValuesGroup: async (listDescription, orgId) => {
    try {
      const res = await apiClient.get("/api/commonmaster/getListValuesGroup", {
        params: {
          listDescription,
          orgId: Number(orgId),
        },
      });

      return res?.paramObjectsMap?.listValues || [];
    } catch (error) {
      console.error(
        "Error fetching list values group:",
        error?.response?.data || error,
      );

      throw error;
    }
  },
};

export default purchaseOrderAmendmentAPI;

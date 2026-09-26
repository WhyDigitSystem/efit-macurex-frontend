import apiClient from "../apiClient";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const purchaseBillAPI = {
  /* ================================================================
     CREATE / UPDATE PURCHASE BILL
     PUT /api/purchasedeliveryschedule/createUpdatePurchaseBill
  ================================================================ */

  createUpdatePurchaseBill: async (purchaseBillData) => {
    try {
      const response = await apiClient.put(
        `${API_BASE_URL}/api/purchasedeliveryschedule/createUpdatePurchaseBill`,
        purchaseBillData,
      );

      return response?.data ?? response;
    } catch (error) {
      const errorData = error?.response?.data;

      console.error("Purchase Bill API Error Status:", error?.response?.status);

      console.error("Purchase Bill API Error Response:", errorData);

      console.error(
        "Purchase Bill API Error Message:",
        errorData?.message ||
          errorData?.error ||
          errorData?.paramObjectsMap?.message ||
          errorData?.paramObjectsMap?.errorMessage ||
          "Bad Request",
      );

      throw error;
    }
  },

  /* ================================================================
     GET PURCHASE BILL BY ID
     GET /api/purchasedeliveryschedule/getPurchaseBillById
  ================================================================ */

  getPurchaseBillById: async (id) => {
    try {
      const response = await apiClient.get(
        `/api/purchasedeliveryschedule/getPurchaseBillById`,
        {
          params: {
            id,
          },
        },
      );

      return response?.data ?? response;
    } catch (error) {
      console.error(
        "Error fetching purchase bill:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     GET PURCHASE BILLS BY ORG / BRANCH
     GET /api/purchasedeliveryschedule/getPurchaseBillByOrgId
  ================================================================ */

  getPurchaseBillByOrgId: async (orgId, branch) => {
    try {
      const response = await apiClient.get(
        `/api/purchasedeliveryschedule/getPurchaseBillByOrgId`,
        {
          params: {
            orgId,
            branch,
          },
        },
      );

      return response?.data ?? response;
    } catch (error) {
      console.error(
        "Error fetching purchase bills:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     GET PURCHASE BILL DOCUMENT NUMBER
     GET /api/purchasedeliveryschedule/getPurchaseBillDocId

     Response:
     paramObjectsMap.purchaseBillDocId
  ================================================================ */

  getPurchaseBillDocId: async (orgId, financialYear) => {
    try {
      const response = await apiClient.get(
        `/api/purchasedeliveryschedule/getPurchaseBillDocId`,
        {
          params: {
            orgId,
            financialYear,
          },
        },
      );

      const data = response?.data ?? response;

      return data?.paramObjectsMap?.purchaseBillDocId || "";
    } catch (error) {
      console.error(
        "Error fetching purchase bill doc id:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     SUPPLIERS FOR PURCHASE BILL
     GET /api/purchasedeliveryschedule/getSuppliersForPurchaseBill
  ================================================================ */

  getSuppliersForPurchaseBill: async (orgId, branch) => {
    try {
      const response = await apiClient.get(
        `/api/purchasedeliveryschedule/getSuppliersForPurchaseBill`,
        {
          params: {
            orgId,
            branch,
          },
        },
      );

      return response?.data ?? response;
    } catch (error) {
      console.error(
        "Error fetching suppliers for purchase bill:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     GRN NO DROPDOWN
     GET /api/purchasedeliveryschedule/getGrnNoDropdownforPurchaseBill

     Depends on:
     branch
     orgId
     supplier
  ================================================================ */

  getGrnNoDropdownforPurchaseBill: async (branch, orgId, supplier) => {
    try {
      const response = await apiClient.get(
        `/api/purchasedeliveryschedule/getGrnNoDropdownforPurchaseBill`,
        {
          params: {
            branch,
            orgId,
            supplier,
          },
        },
      );

      return response?.data ?? response;
    } catch (error) {
      console.error(
        "Error fetching GRN No dropdown:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     ITEM DROPDOWN - LOCAL PURCHASE BILL

     GET /api/purchasedeliveryschedule/getItemDropDownForPurchaseBill

     Depends on:
     orgId
     branch
     supplier
     grnNo
  ================================================================ */

  getItemDropDownForPurchaseBill: async (orgId, branch, supplier, grnNo) => {
    try {
      const response = await apiClient.get(
        `/api/purchasedeliveryschedule/getItemDropDownForPurchaseBill`,
        {
          params: {
            orgId,
            branch,
            supplier,
            grnNo,
          },
        },
      );

      return response?.data ?? response;
    } catch (error) {
      console.error(
        "Error fetching item dropdown for purchase bill:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     ITEM DROPDOWN - IMPORT PURCHASE BILL

     GET /api/purchasedeliveryschedule/getImportItemDropDownForPurchaseBill

     Depends on:
     branch
     grnNo
     orgId
     supplier
  ================================================================ */

  getImportItemDropDownForPurchaseBill: async (
    branch,
    grnNo,
    orgId,
    supplier,
  ) => {
    try {
      const response = await apiClient.get(
        `/api/purchasedeliveryschedule/getImportItemDropDownForPurchaseBill`,
        {
          params: {
            branch,
            grnNo,
            orgId,
            supplier,
          },
        },
      );

      return response?.data ?? response;
    } catch (error) {
      console.error(
        "Error fetching import item dropdown for purchase bill:",
        error?.response?.data || error,
      );

      throw error;
    }
  },
};

export default purchaseBillAPI;

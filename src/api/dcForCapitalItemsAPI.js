// dcForCapitalItemsAPI.js
import apiClient from "./apiClient";

const dcForCapitalItemsAPI = {
  /* ==========================================================================
     CRUD — DC For Capital Items record itself
  ========================================================================== */

  // Get DC For Capital Items by Organization + Branch
  getDcForCapitalItemsByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        "/api/subContract/getDeliveryChallanCapitalItemsByOrgIdAndBranch",
        {
          params: {
            branch: Number(branch),
            orgId: Number(orgId),
          },
        },
      );

      console.log("DC For Capital Items List API Response:", res);

      return res?.paramObjectsMap?.deliveryChallanCapitalItems || [];
    } catch (error) {
      console.error("Error fetching DC For Capital Items:", error);
      throw error;
    }
  },

  getDcForCapitalItemsById: async (id) => {
    try {
      const res = await apiClient.get(
        "/api/commonmaster/getDcForCapitalItemsById",
        { params: { id } },
      );
      return res?.paramObjectsMap?.dcForCapitalItemsVO || null;
    } catch (error) {
      console.error("Error fetching DC for capital items by ID:", error);
      throw error;
    }
  },

  // Create / Update a DC record linked to capital items and the indent. Header,
  // outgoing items and summary are saved in a single transaction; the backend is
  // expected to maintain complete DC history.
  createUpdateDcForCapitalItems: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/commonmaster/updateCreateDcForCapitalItems",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving DC for capital items:", error);
      throw error;
    }
  },

  /* ==========================================================================
     Delivery Challan Capital Items — subContract module
     (doc id generation, list, and single-record fetch by the subContract
     naming convention; distinct from the commonmaster CRUD above)
  ========================================================================== */

  // Auto-generated DC No for a new DC For Capital Items record.
  // Response: paramObjectsMap.deliveryChallanCapitalItemsDocId
  getDeliveryChallanCapitalItemsDocId: async (financialYear, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/subContract/getDeliveryChallanCapitalItemsDocId",
        { params: { financialYear, orgId } },
      );
      return res?.paramObjectsMap?.deliveryChallanCapitalItemsDocId || "";
    } catch (error) {
      console.error("Error fetching DC For Capital Items doc id:", error);
      throw error;
    }
  },

  getDeliveryChallanCapitalItemsById: async (id) => {
    try {
      const res = await apiClient.get(
        "/api/subContract/getDeliveryChallanCapitalItemsById",
        { params: { id } },
      );
      return res?.paramObjectsMap || null;
    } catch (error) {
      console.error(
        "Error fetching Delivery Challan Capital Items by id:",
        error,
      );
      throw error;
    }
  },

  // Response: paramObjectsMap.deliveryChallanCapitalItems[]
  getDeliveryChallanCapitalItemsByOrgIdAndBranch: async (branch, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/subContract/getDeliveryChallanCapitalItemsByOrgIdAndBranch",
        { params: { branch, orgId } },
      );
      return res?.paramObjectsMap?.deliveryChallanCapitalItems || [];
    } catch (error) {
      console.error(
        "Error fetching Delivery Challan Capital Items list:",
        error,
      );
      throw error;
    }
  },

  // Create / Update a Delivery Challan for Capital Items record — the real
  // subContract endpoint that persists header + outgoing item details in a
  // single call, matching the backend's exact DTO shape.
  createUpdateDeliveryChallanCapitalItems: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/subContract/createUpdateDeliveryChallanCapitalItems",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving Delivery Challan Capital Items:", error);
      throw error;
    }
  },

  /* ==========================================================================
     Vendor / Supplier lookup — subContract module
     Used for "Vendor Id" (customerCode) and "Vendor Name" (customerName)
  ========================================================================== */

  // Response: paramObjectsMap.customerList[]
  //   { customerId, customerCode, customerName, address, gstStateId,
  //     gstState, gstNo, gstType, igstApplicable }
  getCustomerForSupplierRateContract: async (branch, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/subContract/getCustomerForSupplierRateContract",
        { params: { branch, orgId } },
      );
      return res?.paramObjectsMap?.customerList || [];
    } catch (error) {
      console.error("Error fetching supplier rate contract customers:", error);
      throw error;
    }
  },

  /* ==========================================================================
     Item lookup — transaction module
     Used for "Outgoing Item Code / Description / Unit" in the item table
  ========================================================================== */

  // Response: paramObjectsMap.itemDetails[]
  //   { itemId, itemCode, itemDescription, unitId, unitCode, hsnId,
  //     hsnSacCode, rate, sgstRate, cgstRate, igstRate }
  getItemDetailsForSalesReturn: async (branch, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/transaction/getItemDetailsForSalesReturn",
        { params: { branch, orgId } },
      );
      return res?.paramObjectsMap?.itemDetails || [];
    } catch (error) {
      console.error("Error fetching item details for sales return:", error);
      throw error;
    }
  },

  /* ==========================================================================
     Purchase Indent lookup — purchaseservice module
     Used for "Indent No" (docId)
  ========================================================================== */

  // Response: paramObjectsMap.purchaseIndentResponseVO[]
  //   { id, docId, docDate, belongsTo, department, details[], ... }
  getPurchaseIndentByOrgId: async (branch, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/purchaseservice/getPurchaseIndentByOrgId",
        { params: { branch, orgId } },
      );
      return res?.paramObjectsMap?.purchaseIndentResponseVO || [];
    } catch (error) {
      console.error("Error fetching purchase indents:", error);
      throw error;
    }
  },

  /* ==========================================================================
     List of Values lookup — commonmaster module
     Used for "Belongs To" (BELONGS TO) and "D.C.Type" (D.C.TYPE)
  ========================================================================== */

  // Response: paramObjectsMap.listValues[]  { valuesDescription, id }
  getListValuesGroup: async (listDescription, orgId) => {
    try {
      const res = await apiClient.get("/api/commonmaster/getListValuesGroup", {
        params: { listDescription, orgId },
      });
      return res?.paramObjectsMap?.listValues || [];
    } catch (error) {
      console.error(
        `Error fetching list values for "${listDescription}":`,
        error,
      );
      throw error;
    }
  },
};

export default dcForCapitalItemsAPI;

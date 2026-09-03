import apiClient from "../apiClient";

/* ========================================================================= */
/* STOCK TRANSFER GRN API                                                    */
/* ========================================================================= */

const stockTransferGrnAPI = {
  /* ----------------------------------------------------------------------- */
  /* DOC ID GENERATION                                                       */
  /* ----------------------------------------------------------------------- */

  getStockTransferGrnDocId: async (orgId, financialYear) => {
    return apiClient.get("/api/grn/getStockTransferGrnDocId", {
      params: { orgId, financialYear },
    });
  },

  /* ----------------------------------------------------------------------- */
  /* LIST / SINGLE RECORD                                                    */
  /* ----------------------------------------------------------------------- */

  getStockTransferGrnByOrgId: async (orgId, branch) => {
    return apiClient.get("/api/grn/getStockTransferGrnByOrgId", {
      params: { orgId, branch },
    });
  },

  getStockTransferGrnById: async (id) => {
    return apiClient.get("/api/grn/getStockTransferGrnById", {
      params: { id },
    });
  },

  /* ----------------------------------------------------------------------- */
  /* SUPPLIER                                                                */
  /* ----------------------------------------------------------------------- */

  getSupplierDetailsForGrn: async (branch, orgId) => {
    return apiClient.get("/api/grn/getSupplierDetailsForGrn", {
      params: { branch, orgId },
    });
  },

  /* ----------------------------------------------------------------------- */
  /* GATE PASS                                                               */
  /* ----------------------------------------------------------------------- */

  getGatePassDocIdDetailsForStockTransfer: async (
    branch,
    orgId,
    supplierCode,
  ) => {
    return apiClient.get("/api/grn/getGatePassDocIdDetailsForStockTransfer", {
      params: { branch, orgId, supplierCode },
    });
  },

  /* ----------------------------------------------------------------------- */
  /* PURCHASE ORDER / SCHEDULE                                               */
  /* ----------------------------------------------------------------------- */

  getPurchaseOrderNumberStockTransfer: async (branch, orgId, supplierCode) => {
    return apiClient.get("/api/grn/getPurchaseOrderNumberStockTransfer", {
      params: { branch, orgId, supplierCode },
    });
  },

  getScheduleDocIdStockTransfer: async (
    branch,
    orgId,
    purchaseOrderNo,
    supplierCode,
  ) => {
    return apiClient.get("/api/grn/getScheduleDocIdStockTransfer", {
      params: { branch, orgId, purchaseOrderNo, supplierCode },
    });
  },

  /* ----------------------------------------------------------------------- */
  /* LOCATION                                                                */
  /* ----------------------------------------------------------------------- */

  /*
   * NOTE: endpoint path not confirmed from Swagger — adjust if your
   * backend exposes this differently.
   */
  /* ----------------------------------------------------------------------- */
  /* LOCATION                                                                */
  /* ----------------------------------------------------------------------- */

  getLocationDetails: async (branch, orgId) => {
    return apiClient.get("/api/grn/getLocationDetails", {
      params: {
        branch: Number(branch),
        orgId: Number(orgId),
      },
    });
  },

  /* ----------------------------------------------------------------------- */
  /* CURRENCY                                                                */
  /* ----------------------------------------------------------------------- */

  getCurrency: async (orgid) => {
    return apiClient.get("/api/commonmaster/currency", {
      params: { orgid },
    });
  },

  /* ----------------------------------------------------------------------- */
  /* CREATE / UPDATE                                                         */
  /* ----------------------------------------------------------------------- */

  createUpdateStockTransferGrn: async (payload, files = []) => {
    if (files && files.length > 0) {
      const formData = new FormData();

      formData.append(
        "dto",
        new Blob([JSON.stringify(payload)], { type: "application/json" }),
      );

      files.forEach((file) => formData.append("files", file));

      return apiClient.post("/api/grn/createUpdateStockTransferGrn", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    return apiClient.post("/api/grn/createUpdateStockTransferGrn", payload);
  },

  /* ----------------------------------------------------------------------- */
  /* FILE VIEW                                                               */
  /* ----------------------------------------------------------------------- */

  getViewFileUrl: (filePath) => {
    const base = apiClient?.defaults?.baseURL || "";
    return `${base}/api/grn/viewFile?filePath=${encodeURIComponent(filePath)}`;
  },
};

export default stockTransferGrnAPI;

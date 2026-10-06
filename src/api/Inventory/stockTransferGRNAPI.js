import apiClient from "../apiClient";

const stockTransferGrnAPI = {
  getStockTransferGrnDocId: async (orgId, financialYear) =>
    apiClient.get("/api/grn/getStockTransferGrnDocId", {
      params: { orgId, financialYear },
    }),

  getStockTransferGrnByOrgId: async (orgId, branch) =>
    apiClient.get("/api/grn/getStockTransferGrnByOrgId", {
      params: { orgId, branch },
    }),

  getStockTransferGrnById: async (id) =>
    apiClient.get("/api/grn/getStockTransferGrnById", { params: { id } }),

  getSupplierDetailsForGrn: async (branch, orgId) =>
    apiClient.get("/api/grn/getSupplierDetailsForGrn", {
      params: { branch, orgId },
    }),

  getGatePassDocIdDetailsForStockTransfer: async (
    branch,
    orgId,
    supplierCode,
  ) =>
    apiClient.get("/api/grn/getGatePassDocIdDetailsForStockTransfer", {
      params: { branch, orgId, supplierCode },
    }),

  getPurchaseOrderNumberStockTransfer: async (branch, orgId, supplierCode) =>
    apiClient.get("/api/grn/getPurchaseOrderNumberStockTransfer", {
      params: { branch, orgId, supplierCode },
    }),

  getScheduleDocIdStockTransfer: async (
    branch,
    orgId,
    purchaseOrderNo,
    supplierCode,
  ) =>
    apiClient.get("/api/grn/getScheduleDocIdStockTransfer", {
      params: { branch, orgId, purchaseOrderNo, supplierCode },
    }),

  getLocationDetails: async (branch, orgId) =>
    apiClient.get("/api/grn/getLocationDetails", {
      params: { branch: Number(branch), orgId: Number(orgId) },
    }),

  getCurrency: async (orgid) =>
    apiClient.get("/api/commonmaster/currency", { params: { orgid } }),

  /* Backend: @PutMapping + multipart/form-data
     parts: "stockTransferGrn" (JSON) and "files" (optional) */
  createUpdateStockTransferGrn: async (payload, files = []) => {
    const formData = new FormData();

    formData.append(
      "stockTransferGrn",
      new Blob([JSON.stringify(payload)], { type: "application/json" }),
    );

    (Array.isArray(files) ? files : []).forEach((file) => {
      if (file instanceof File) formData.append("files", file);
    });

    // Explicit method: do not rely on apiClient.put
    return apiClient.request({
      url: "/api/grn/createUpdateStockTransferGrn",
      method: "PUT",
      data: formData,
      // Let the browser set multipart boundary
      headers: { "Content-Type": undefined },
    });
  },

  getViewFileUrl: (filePath) => {
    const base = apiClient?.defaults?.baseURL || "";
    return `${base}/api/grn/viewFile?filePath=${encodeURIComponent(filePath)}`;
  },
};

export default stockTransferGrnAPI;

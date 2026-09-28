import apiClient from "../apiClient";

const stockOrderAPI = {
  // GET /api/subContract/getAllStockOrderByOrgIdAndBranch
  getByOrgId: async (orgId, branchId) => {
    const res = await apiClient.get(
      `/api/subContract/getAllStockOrderByOrgIdAndBranch?branch=${branchId}&orgId=${orgId}`,
    );
    return res?.paramObjectsMap?.stockOrderList || [];
  },

  // GET /api/subContract/getStockOrderById
  getById: async (id) => {
    const res = await apiClient.get(
      `/api/subContract/getStockOrderById?id=${id}`,
    );
    if (!res?.status) return null; // "Stock Order Not Found"
    return (
      res?.paramObjectsMap?.stockOrderVO ||
      res?.paramObjectsMap?.stockOrder ||
      null
    );
  },

  // GET /api/subContract/getStockOrderDocId
  getDocId: async (financialYear, orgId) => {
    const res = await apiClient.get(
      `/api/subContract/getStockOrderDocId?financialYear=${financialYear}&orgId=${orgId}`,
    );
    return res?.paramObjectsMap?.docId || "";
  },

  // PUT /api/subContract/createUpdateStockOrder
  createUpdate: async (payload) => {
    const res = await apiClient.put(
      "/api/subContract/createUpdateStockOrder",
      payload,
    );
    return res;
  },
};

export default stockOrderAPI;

import apiClient from "../apiClient";

const salesOrderAmendmentAPI = {
  getAll: async (orgId, branch) => {
    try {
      const res = await apiClient.get("/api/develop/getSalesOrderAmendmentByOrgId", {
        params: { orgId, branch },
      });
      return res?.paramObjectsMap?.salesOrderAmendmentList || [];
    } catch (error) {
      console.error("Error fetching SO amendments:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get("/api/develop/getSalesOrderAmendmentById", {
        params: { id },
      });
      return res?.paramObjectsMap?.salesOrderAmendment || null;
    } catch (error) {
      console.error("Error fetching SO amendment by id:", error);
      throw error;
    }
  },

  getSalesOrderDetails: async (orgId, branch) => {
    try {
      const res = await apiClient.get("/api/develop/getOrderAcceptanceBySalesOrderAmendment", {
        params: { orgId, branch },
      });
      return res?.paramObjectsMap?.orderAcceptanceList || [];
    } catch (error) {
      console.error("Error fetching order details:", error);
      throw error;
    }
  },

  getRevisionNoDetails: async (orgId, branch, item, salesOrderNo) => {
    try {
      const res = await apiClient.get("/api/develop/getSalesOrderAmdRevisionNo", {
        params: { orgId, branch, item, salesOrderNo },
      });
      return res?.paramObjectsMap?.revisionNo || [];
    } catch (error) {
      console.error("Error fetching order details:", error);
      throw error;
    }
  },

  getItems: async (orgId, branch, docId) => {
    try {
      const res = await apiClient.get("/api/develop/getItemsDetailsbySalesOrderAmendment", {
        params: { orgId, branch, docId },
      });
      return res?.paramObjectsMap?.itemDetails || [];
    } catch (error) {
      console.error("Error fetching items:", error);
      throw error;
    }
  },

  createUpdate: async (data) => {
    try {
      const res = await apiClient.put("/api/develop/createUpdateSalesOrderAmendment", data);
      return res;
    } catch (error) {
      console.error("Error saving SO amendment:", error);
      throw error;
    }
  },
};

export default salesOrderAmendmentAPI;

import apiClient from "../apiClient";

const transportBillAPI = {
  getAll: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        "/api/transportbill/getTransportBillByOrgId",
        {
          params: { orgId, branch },
        },
      );
      return res?.paramObjectsMap?.transportBillList || [];
    } catch (error) {
      console.error("Error fetching Transport Bill records:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get(
        "/api/transportbill/getTransportBillById",
        {
          params: { id },
        },
      );
      return res?.paramObjectsMap?.transportBillVO || null;
    } catch (error) {
      console.error("Error fetching Transport Bill by ID:", error);
      throw error;
    }
  },

  createUpdate: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/transportbill/createUpdateTransportBill",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving Transport Bill:", error);
      throw error;
    }
  },
  // GET /api/transportbill/getTransportBillDocId
  getTransportBillDocId: async ({ financialYear, orgId, screenCode }) => {
    try {
      const params = new URLSearchParams({
        financialYear: String(financialYear),
        orgId: String(orgId),
        screenCode,
      });

      const response = await apiClient.get(
        `/api/transportbill/getTransportBillDocId?${params.toString()}`,
      );

      return response?.paramObjectsMap?.invoiceDocId || "";
    } catch (error) {
      console.error("Error fetching transport bill doc id:", error);
      throw error;
    }
  },
};

export default transportBillAPI;

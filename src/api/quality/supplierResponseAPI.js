// supplierResponseAPI.js
import apiClient from "../apiClient";

// Supplier Response Entry API
// Mirrors the quality API convention used in this app.
// The backend persists the header, response details and summary in a
// single transaction (server-side validation).

const supplierResponseAPI = {
  // Get Supplier Responses by Organization ID
  getSupplierResponseByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/quality/getSupplierResponseByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      const list = res?.paramObjectsMap?.supplierResponseVO;
      return Array.isArray(list) ? list : list ? [list] : [];
    } catch (error) {
      console.error("Error fetching supplier responses:", error);
      throw error;
    }
  },

  // Get Supplier Response by ID
  getSupplierResponseById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/quality/getSupplierResponseById?id=${id}`,
      );
      return res?.paramObjectsMap?.supplierResponseVO || null;
    } catch (error) {
      console.error("Error fetching supplier response by ID:", error);
      throw error;
    }
  },

  // Create / Update Supplier Response
  createUpdateSupplierResponse: async (payload) => {
    try {
      const res = await apiClient.put(
        `/api/quality/updateCreateSupplierResponse`,
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving supplier response:", error);
      throw error;
    }
  },
};

export default supplierResponseAPI;
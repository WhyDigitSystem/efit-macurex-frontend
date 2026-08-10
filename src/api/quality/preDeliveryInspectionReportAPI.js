// preDeliveryInspectionReportAPI.js
import apiClient from "../apiClient";

/* Pre-Delivery Inspection Report API
   Mirrors the quality API convention used in this app.
   The backend persists the header, inspection details and the pre-inspection
   summary in a single transaction and keeps the complete inspection history
   with approval tracking (server-side validation). */
const preDeliveryInspectionReportAPI = {
  // Get Pre-Delivery Inspection Reports by Organization ID
  getPreDeliveryInspectionReportByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/quality/getPreDeliveryInspectionReportByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.preDeliveryInspectionReportVO || [];
    } catch (error) {
      console.error("Error fetching pre-delivery inspection reports:", error);
      throw error;
    }
  },

  // Get Pre-Delivery Inspection Report by ID
  getPreDeliveryInspectionReportById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/quality/getPreDeliveryInspectionReportById?id=${id}`,
      );
      return res?.paramObjectsMap?.preDeliveryInspectionReportVO || null;
    } catch (error) {
      console.error("Error fetching pre-delivery inspection report by ID:", error);
      throw error;
    }
  },

  // Create / Update Pre-Delivery Inspection Report
  createUpdatePreDeliveryInspectionReport: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/quality/updateCreatePreDeliveryInspectionReport",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving pre-delivery inspection report:", error);
      throw error;
    }
  },
};

export default preDeliveryInspectionReportAPI;

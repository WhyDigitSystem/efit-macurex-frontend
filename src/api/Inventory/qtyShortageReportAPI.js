// qtyShortageReportAPI.js
import apiClient from "../apiClient";

export const qtyShortageReportAPI = {
  // Fetch Qty Shortage report rows for the given filters
  getQtyShortageReport: async ({ orgId, fromDate, toDate, partyName }) => {
    try {
      const params = new URLSearchParams({
        orgId,
        ...(fromDate ? { fromDate } : {}),
        ...(toDate ? { toDate } : {}),
        ...(partyName ? { partyName } : {}),
      });

      const res = await apiClient.get(
        `/api/reports/getQtyShortageReport?${params.toString()}`,
      );

      return res?.paramObjectsMap?.reportList || [];
    } catch (error) {
      console.error("Error fetching Qty Shortage report:", error);
      throw error;
    }
  },
};

export default qtyShortageReportAPI;

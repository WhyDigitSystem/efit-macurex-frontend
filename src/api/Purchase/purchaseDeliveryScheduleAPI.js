// purchaseDeliveryScheduleAPI.js
import apiClient from "../apiClient";

export const purchaseDeliveryScheduleAPI = {
  // Get Purchase Delivery Schedules by Organization ID
  getScheduleByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getPurchaseDeliveryScheduleByOrgId?orgId=${orgId}`,
      );

      return res?.paramObjectsMap?.scheduleList || [];
    } catch (error) {
      console.error("Error fetching purchase delivery schedules:", error);
      throw error;
    }
  },

  // Create / Update Purchase Delivery Schedule
  createUpdateSchedule: async (payload) => {
    try {
      const res = await apiClient.post(
        `/api/commonmaster/createUpdatePurchaseDeliverySchedule`,
        payload,
      );

      return res;
    } catch (error) {
      console.error("Error saving purchase delivery schedule:", error);
      throw error;
    }
  },
};

export default purchaseDeliveryScheduleAPI;

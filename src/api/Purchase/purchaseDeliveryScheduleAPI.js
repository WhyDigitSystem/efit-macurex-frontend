// purchaseDeliveryScheduleAPI.js
import apiClient from "../apiClient";

export const purchaseDeliveryScheduleAPI = {
  // Get Purchase Delivery Schedules by Organization ID
  getScheduleByOrgId: async (branch, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/purchasedeliveryschedule/getPurchaseDeliveryScheduleByOrgId?branch=${branch}&orgId=${orgId}`,
      );

      return res;
    } catch (error) {
      console.error("Error fetching purchase delivery schedules:", error);
      throw error;
    }
  },

  // Get Purchase Delivery Schedule by ID
  getPurchaseDeliveryScheduleById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/purchasedeliveryschedule/getPurchaseDeliveryScheduleById?id=${id}`,
      );

      return res;
    } catch (error) {
      console.error("Error fetching purchase delivery schedule by ID:", error);
      throw error;
    }
  },

  // Create / Update Purchase Delivery Schedule
  createUpdateSchedule: async (payload) => {
    try {
      const res = await apiClient.put(
        `/api/purchasedeliveryschedule/updateCreatePurchaseDeliverySchedule`,
        payload,
      );

      return res;
    } catch (error) {
      console.error("Error saving purchase delivery schedule:", error);
      throw error;
    }
  },

  getSupplierDropdownForPurchaseDeliverySchedule: async (branchId, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/purchasedeliveryschedule/getSupplierDropdownForPurchaseDeliverySchedule?branch=${branchId}&orgId=${orgId}`
      );
      return res;
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      throw error;
    }
  },

  // Get Purchase Order numbers for Purchase Delivery Schedule
  getPurchaseOrderNumberForPurchaseDeliverySchedule: async (branchId, custId, docdt, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/purchasedeliveryschedule/getPurchaseOrderNumberForPurchaseDeliverySchedule?branch=${branchId}&custid=${custId}&docdt=${docdt}&orgId=${orgId}`
      );
      return res;
    } catch (error) {
      console.error("Error fetching PO numbers:", error);
      throw error;
    }
  },

  // Get Items for Purchase Delivery Schedule
  getItemsForPurchaseDeliverySchedule: async (branchId, customer, orgId, purchasecontractnumber) => {
    try {
      const res = await apiClient.get(
        `/api/purchasedeliveryschedule/getItemsForPurchaseDeliverySchedule?branch=${branchId}&customer=${customer}&orgId=${orgId}&purchasecontractnumber=${purchasecontractnumber}`
      );
      return res;
    } catch (error) {
      console.error("Error fetching items:", error);
      throw error;
    }
  },

  // Get Employee Dropdown for Purchase Contract
  getEmployeeDropdownPurchaseContract: async (branchId, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/purchasedeliveryschedule/getEmployeeDropdownPurchaseContract?branch=${branchId}&orgId=${orgId}`
      );
      return res;
    } catch (error) {
      console.error("Error fetching employees:", error);
      throw error;
    }
  },

  // Get Purchase Delivery Schedule Doc ID
  getPurchaseDeliveryScheduleDocId: async (financialYear, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/purchasedeliveryschedule/getPurchaseDeliveryScheduleDocId?financialYear=${financialYear}&orgId=${orgId}`
      );
      return res;
    } catch (error) {
      console.error("Error fetching Doc ID:", error);
      throw error;
    }
  },
};

export default purchaseDeliveryScheduleAPI;
// purchaseOrderAPI.js
import apiClient from "../apiClient";

export const poDelScheduleAPI = {
    // Get Supplier Details for Short Close
    getSupplierDetailsShortClose: async (branch, orgId) => {
        try {
            const res = await apiClient.get(
                `/api/purchaseOrder/getSupplierDetailsShortClose?branch=${branch}&orgId=${orgId}`
            );
            return res;
        } catch (error) {
            console.error("Error fetching supplier details:", error);
            throw error;
        }
    },

    // Get Purchase Order No based on Schedule
    getPurchaseOrderNoBasedSchedule: async (branch, orgId, supplier) => {
        try {
            const res = await apiClient.get(
                `/api/purchaseOrder/getPurchaseOrderNobasedSchedule?branch=${branch}&orgId=${orgId}&supplier=${supplier}`
            );
            return res;
        } catch (error) {
            console.error("Error fetching PO numbers:", error);
            throw error;
        }
    },

    // Get Purchase Order No based Schedule Details (Items)
    getPurchaseOrderNoBasedScheduleDetails: async (branch, orgId, purchaseOrderNo, supplier) => {
        try {
            const res = await apiClient.get(
                `/api/purchaseOrder/getPurchaseOrderNobasedScheduleDetails?branch=${branch}&orgId=${orgId}&purchaseOrderNo=${encodeURIComponent(purchaseOrderNo)}&supplier=${supplier}`
            );
            return res;
        } catch (error) {
            console.error("Error fetching PO details:", error);
            throw error;
        }
    },

    // Get Purchase Order Delivery Schedule Short Close Doc ID
    getPurchaseOrderDeliveryScheduleShortCloseDocId: async (financialYear, orgId) => {
        try {
            const res = await apiClient.get(
                `/api/purchaseOrder/getPurchaseOrderDeliveryScheduleShortCloseDocId?financialYear=${financialYear}&orgId=${orgId}`
            );
            return res;
        } catch (error) {
            console.error("Error fetching Doc ID:", error);
            throw error;
        }
    },

    // Get Purchase Order Delivery Schedule Short Close By Org ID
    getPurchaseOrderDeliveryScheduleShortCloseByOrgId: async (branch, orgId) => {
        try {
            const res = await apiClient.get(
                `/api/purchaseOrder/getPurchaseOrderDeliveryScheduleShortCloseByOrgId?branch=${branch}&orgId=${orgId}`
            );
            return res;
        } catch (error) {
            console.error("Error fetching short close records:", error);
            throw error;
        }
    },

    // Get Purchase Order Delivery Schedule Short Close By ID
    getPurchaseOrderDeliveryScheduleShortCloseById: async (id) => {
        try {
            const res = await apiClient.get(
                `/api/purchaseOrder/getPurchaseOrderDeliveryScheduleShortCloseById?id=${id}`
            );
            return res;
        } catch (error) {
            console.error("Error fetching short close record by ID:", error);
            throw error;
        }
    },

    // Create / Update Short Close
    createUpdateShortClose: async (payload) => {
        try {
            const res = await apiClient.put(
                `/api/purchaseOrder/createUpdatePurchaseOrderDeliveryScheduleShortClose`,
                payload
            );
            return res;
        } catch (error) {
            console.error("Error saving short close:", error);
            throw error;
        }
    },
};

export default poDelScheduleAPI;
// src/api/Purchase/purchaseReturn.js
import apiClient from "../apiClient";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const purchaseReturnAPI = {
    getPurchaseReturnDocId: async ({ financialYear, orgId }) => {
        try {
            const params = new URLSearchParams({
                financialYear: String(financialYear),
                orgId: String(orgId),
            });
            const response = await apiClient.get(
                `/api/purchasereturn/getPurchaseReturnDocId?${params.toString()}`
            );
            return response?.paramObjectsMap?.purchaseReturnId || "";
        } catch (error) {
            console.error("Error fetching purchase return doc id:", error);
            throw error;
        }
    },

    getPlantList: async (orgId) => {
        try {
            const response = await apiClient.get(
                `/api/dhinesh/getBranchByOrgId?orgId=${orgId}`
            );
            return response || [];
        } catch (error) {
            console.error("Error fetching plant list:", error);
            throw error;
        }
    },

    getSupplierDetails: async (branchId, orgId) => {
        try {
            const response = await apiClient.get(
                `/api/purchaseOrder/getSupplierDetails?branch=${branchId}&orgId=${orgId}`
            );
            return response?.paramObjectsMap?.mapp || [];
        } catch (error) {
            console.error("Error fetching suppliers:", error);
            throw error;
        }
    },

    getGrnDetails: async (branchId, orgId, supplierId) => {
        try {
            const response = await apiClient.get(
                `/api/purchasereturn/getGrnDetails?branch=${branchId}&orgId=${orgId}&supplierCode=${supplierId}`
            );
            return response?.paramObjectsMap?.mapp || [];
        } catch (error) {
            console.error("Error fetching GRN details:", error);
            throw error;
        }
    },

    getPurchaseBill: async (branchId, grnNo, orgId, supplierId) => {
        try {
            const response = await apiClient.get(
                `/api/purchasereturn/getPurchaseBill?branch=${branchId}&grnNo=${encodeURIComponent(
                    grnNo
                )}&orgId=${orgId}&supplierCode=${supplierId}`
            );
            return response?.paramObjectsMap?.mapp || [];
        } catch (error) {
            console.error("Error fetching purchase bill:", error);
            throw error;
        }
    },

    getPurchaseBillItemDetails: async (
        billNo,
        branchId,
        grnNo,
        orgId,
        supplierId
    ) => {
        try {
            const response = await apiClient.get(
                `/api/purchasereturn/getPurchaseBillItemDetails?billNo=${billNo}&branch=${branchId}&grnNo=${encodeURIComponent(
                    grnNo
                )}&orgId=${orgId}&supplierCode=${supplierId}`
            );
            return response?.paramObjectsMap?.mapp || [];
        } catch (error) {
            console.error("Error fetching purchase bill items:", error);
            throw error;
        }
    },

    getTaxValue: async (hsn, orgId) => {
        try {
            const response = await apiClient.get(
                `/api/rejectionInvoice/getTaxValue?hsn=${hsn}&orgId=${orgId}`
            );
            return response?.paramObjectsMap?.mapp?.[0] || null;
        } catch (error) {
            console.error("Error fetching tax values:", error);
            throw error;
        }
    },

    createUpdatePurchaseReturn: async (payload) => {
        try {
            const response = await apiClient.put(
                `${API_BASE_URL}/api/purchasereturn/createUpdatePurchaseReturn`,
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            return response;
        } catch (error) {
            console.error("Error creating/updating purchase return:", error);
            throw error;
        }
    },

    // ------------------- NEW -------------------
    // Get all Purchase Returns by OrgId and Branch
    getPurchaseReturnByOrgId: async (branchId, orgId) => {
        try {
            const response = await apiClient.get(
                `/api/purchasereturn/getPurchaseReturnByOrgId?branch=${branchId}&orgId=${orgId}`
            );
            return response?.paramObjectsMap?.purchaseReturn || [];
        } catch (error) {
            console.error("Error fetching purchase returns:", error);
            throw error;
        }
    },

    // Get Purchase Return by ID
    getPurchaseReturnById: async (id) => {
        try {
            const response = await apiClient.get(
                `/api/purchasereturn/getPurchaseReturnById?id=${id}`
            );
            return response?.paramObjectsMap?.purchaseReturn || null;
        } catch (error) {
            console.error("Error fetching purchase return by id:", error);
            throw error;
        }
    },
};

export default purchaseReturnAPI;
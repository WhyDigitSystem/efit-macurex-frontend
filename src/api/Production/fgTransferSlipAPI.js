// src/api/Production/fgTransferSlipAPI.js
import apiClient from "../apiClient";

const fgTransferSlipAPI = {
    // ---------- Lookups ----------

    getFgPartNoDetails: async (branch, orgId) => {
        try {
            const res = await apiClient.get(
                "/api/purchaseOrder/getFgPartNoDetails",
                { params: { branch, orgId } }
            );
            return res?.paramObjectsMap?.mapp || [];
        } catch (error) {
            console.error("Error fetching FG part no details:", error);
            throw error;
        }
    },

    getBomFromFgTransferSlip: async (branch, fgItem, orgId) => {
        try {
            const res = await apiClient.get(
                "/api/purchaseOrder/getBomFromFgTransferSlip",
                { params: { branch, fgItem, orgId } }
            );
            return res?.paramObjectsMap?.mapp || [];
        } catch (error) {
            console.error("Error fetching BOM list:", error);
            throw error;
        }
    },

    getSchNoFromFgTransferSlip: async (branch, orgId) => {
        try {
            const res = await apiClient.get(
                "/api/purchaseOrder/getSchNoFromFgTransferSlip",
                { params: { branch, orgId } }
            );
            return res?.paramObjectsMap?.mapp || [];
        } catch (error) {
            console.error("Error fetching Schedule No list:", error);
            throw error;
        }
    },

    getCustomersDetailsFromTransferSlip: async (branch, orgId) => {
        try {
            const res = await apiClient.get(
                "/api/purchaseOrder/getCustomersDetailsFromTransferSlip",
                { params: { branch, orgId } }
            );
            return res?.paramObjectsMap?.mapp || [];
        } catch (error) {
            console.error("Error fetching customer list:", error);
            throw error;
        }
    },

    getBomDetailsFromFgTransferSlip: async (bom, branch, orgId) => {
        try {
            const res = await apiClient.get(
                "/api/purchaseOrder/getBomDetailsFromFgTransferSlip",
                { params: { bom, branch, orgId } }
            );
            return res?.paramObjectsMap?.mapp || [];
        } catch (error) {
            console.error("Error fetching BOM detail rows:", error);
            throw error;
        }
    },

    getScrapItemDetails: async (branch, orgId) => {
        try {
            const res = await apiClient.get(
                "/api/purchaseOrder/getScrapItemDetails",
                { params: { branch, orgId } }
            );
            return res?.paramObjectsMap?.mapp || [];
        } catch (error) {
            console.error("Error fetching scrap items:", error);
            throw error;
        }
    },

    // ---------- Doc ID ----------

    getFgTransferSlipDocId: async (orgId, financialYear) => {
        try {
            const res = await apiClient.get(
                "/api/purchaseOrder/getFgTransferSlipDocId",
                { params: { orgId, financialYear } }
            );
            return res?.paramObjectsMap?.fgTransferSlipDocId || "";
        } catch (error) {
            console.error("Error fetching FG Transfer Slip doc id:", error);
            throw error;
        }
    },

    // ---------- List / By-id ----------

    // GET /api/purchaseOrder/getFgTransferSlipByOrgId
    getFGTransferSlipByOrgId: async (branch, orgId) => {
        try {
            const res = await apiClient.get(
                "/api/purchaseOrder/getFgTransferSlipByOrgId",
                { params: { branch, orgId } }
            );
            const list = res?.paramObjectsMap?.fgTransferSlipResponseVO;
            return Array.isArray(list) ? list : list ? [list] : [];
        } catch (error) {
            console.error("Error fetching FG transfer slip list:", error);
            throw error;
        }
    },

    // GET /api/purchaseOrder/getFgTransferSlipById
    getById: async (id) => {
        try {
            const res = await apiClient.get(
                "/api/purchaseOrder/getFgTransferSlipById",
                { params: { id } }
            );
            return res?.paramObjectsMap?.fgTransferSlipResponseVO || null;
        } catch (error) {
            console.error("Error fetching FG transfer slip by id:", error);
            throw error;
        }
    },

    // ---------- Save ----------

    createUpdateFgTransferSlip: async (payload) => {
        try {
            const res = await apiClient.put(
                "/api/purchaseOrder/createUpdateFgTransferSlip",
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                }
            );
            return res;
        } catch (error) {
            console.error("Error saving FG transfer slip:", error);
            throw error;
        }
    },

    // Alias kept for backward compatibility
    updateCreateFGTransferSlip: async (payload) =>
        fgTransferSlipAPI.createUpdateFgTransferSlip(payload),
};

export default fgTransferSlipAPI;
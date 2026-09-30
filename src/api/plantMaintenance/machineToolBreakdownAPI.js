// src/api/machineToolBreakdownAPI.js
import apiClient from "../apiClient";

const machineToolBreakdownAPI = {
    // GET /api/vendorComplaintEntry/getAuthorizationForBreakdownDocId
    getAuthorizationForBreakdownDocId: async (orgId, financialYear) => {
        try {
            const res = await apiClient.get(
                "/api/vendorComplaintEntry/getAuthorizationForBreakdownDocId",
                {
                    params: { orgId, financialYear },
                }
            );
            return res?.paramObjectsMap?.docId || "";
        } catch (error) {
            console.error(
                "Error fetching authorization for breakdown doc id:",
                error
            );
            throw error;
        }
    },

    // GET /api/vendorComplaintEntry/getMachineToolRectificationDetails
    getMachineToolRectificationDetails: async (branch, orgId) => {
        try {
            const res = await apiClient.get(
                "/api/vendorComplaintEntry/getMachineToolRectificationDetails",
                {
                    params: { branch, orgId },
                }
            );
            return res?.paramObjectsMap?.machineToolRectificationDetails || [];
        } catch (error) {
            console.error(
                "Error fetching machine tool rectification details:",
                error
            );
            throw error;
        }
    },

    // POST /api/vendorComplaintEntry/updateCreateAuthorizationForBreakdown
    updateCreateAuthorizationForBreakdown: async (payload) => {
        try {
            const res = await apiClient.put(
                "/api/vendorComplaintEntry/updateCreateAuthorizationForBreakdown",
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
            console.error(
                "Error creating/updating authorization for breakdown:",
                error
            );
            throw error;
        }
    },

    // GET /api/vendorComplaintEntry/getAuthorizationForBreakdownByOrgId
    getAuthorizationForBreakdownByOrgId: async (branch, orgId) => {
        try {
            const res = await apiClient.get(
                "/api/vendorComplaintEntry/getAuthorizationForBreakdownByOrgId",
                {
                    params: { branch, orgId },
                }
            );
            return res?.paramObjectsMap?.authorizationForBreakdownVO || [];
        } catch (error) {
            console.error(
                "Error fetching authorization for breakdown list:",
                error
            );
            throw error;
        }
    },

    // GET /api/vendorComplaintEntry/getAuthorizationForBreakdownById
    getAuthorizationForBreakdownById: async (id) => {
        try {
            const res = await apiClient.get(
                "/api/vendorComplaintEntry/getAuthorizationForBreakdownById",
                {
                    params: { id },
                }
            );
            return res?.paramObjectsMap?.authorizationForBreakdownVO || null;
        } catch (error) {
            console.error(
                "Error fetching authorization for breakdown by id:",
                error
            );
            throw error;
        }
    },
};

export default machineToolBreakdownAPI;
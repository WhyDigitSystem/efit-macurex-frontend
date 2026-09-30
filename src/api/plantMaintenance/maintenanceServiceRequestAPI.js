// src/api/plantMaintenance/maintenanceServiceRequestAPI.js
import apiClient from "../apiClient";

const maintenanceServiceRequestAPI = {
    // GET /api/develop/getMaintenanceServiceRequestDocId
    getMaintenanceServiceRequestDocId: async (orgId, financialYear) => {
        try {
            const res = await apiClient.get(
                "/api/develop/getMaintenanceServiceRequestDocId",
                {
                    params: { orgId, financialYear },
                }
            );
            return res?.paramObjectsMap?.maintenanceServiceRequestDocId || "";
        } catch (error) {
            console.error(
                "Error fetching maintenance service request doc id:",
                error
            );
            throw error;
        }
    },

    // PUT /api/develop/updateCreateMaintenanceServiceRequest
    updateCreateMaintenanceServiceRequest: async (payload) => {
        try {
            const res = await apiClient.put(
                "/api/develop/updateCreateMaintenanceServiceRequest",
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
                "Error creating/updating maintenance service request:",
                error
            );
            throw error;
        }
    },

    // GET /api/commonmaster/getListValuesGroup  (used for BelongTo, Priority)
    getListValuesGroup: async (listDescription, orgId) => {
        try {
            const res = await apiClient.get(
                "/api/commonmaster/getListValuesGroup",
                {
                    params: { listDescription, orgId },
                }
            );
            return res?.paramObjectsMap?.listValues || [];
        } catch (error) {
            console.error("Error fetching list values group:", error);
            throw error;
        }
    },

    // GET /api/develop/getMaintenanceServiceRequestByOrgId
    getMaintenanceServiceRequestByOrgId: async (orgId) => {
        try {
            const res = await apiClient.get(
                "/api/develop/getMaintenanceServiceRequestByOrgId",
                {
                    params: { orgId },
                }
            );
            return (
                res?.paramObjectsMap?.maintenanceServiceRequestResponseVO || []
            );
        } catch (error) {
            console.error(
                "Error fetching maintenance service request list:",
                error
            );
            throw error;
        }
    },

    // GET /api/develop/getMaintenanceServiceRequestById
    getMaintenanceServiceRequestById: async (id) => {
        try {
            const res = await apiClient.get(
                "/api/develop/getMaintenanceServiceRequestById",
                {
                    params: { id },
                }
            );
            return (
                res?.paramObjectsMap?.maintenanceServiceRequestResponseVO || null
            );
        } catch (error) {
            console.error(
                "Error fetching maintenance service request by id:",
                error
            );
            throw error;
        }
    },
};

export default maintenanceServiceRequestAPI;
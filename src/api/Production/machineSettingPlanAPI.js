import apiClient from "../apiClient";

const machineSettingPlanAPI = {

    // Get all Machine Setting Plans
    getMachineSettingPlans: async (orgId, branchId) => {
        try {
            const response = await apiClient.get(
                `/api/machineSettingPlan/getAll?orgId=${orgId}&branch=${branchId}`
            );
            return response;
        } catch (error) {
            console.error("Error fetching machine setting plans:", error);
            throw error;
        }
    },

    // Get Machine Setting Plan by ID
    getMachineSettingPlanById: async (id) => {
        try {
            const response = await apiClient.get(
                `/api/machineSettingPlan/getById?id=${id}`
            );
            return response;
        } catch (error) {
            console.error("Error fetching machine setting plan:", error);
            throw error;
        }
    },

    // Create or Update Machine Setting Plan
    createUpdateMachineSettingPlan: async (payload) => {
        try {
            const response = await apiClient.put(
                `/api/machineSettingPlan/createUpdate`,
                payload
            );
            return response;
        } catch (error) {
            console.error("Error saving machine setting plan:", error);
            throw error;
        }
    },

    // Get Items
    getItems: async (orgId, branchId) => {
        try {
            const response = await apiClient.get(
                `/api/itemMaster/getItems?orgId=${orgId}&branchId=${branchId}`
            );
            return response;
        } catch (error) {
            console.error("Error fetching items:", error);
            throw error;
        }
    },

    // Get Operations
    getOperations: async (orgId, branchId) => {
        try {
            const response = await apiClient.get(
                `/api/operation/getOperations?orgId=${orgId}&branchId=${branchId}`
            );
            return response;
        } catch (error) {
            console.error("Error fetching operations:", error);
            throw error;
        }
    },

    // Get Machines
    getMachines: async (orgId, branchId) => {
        try {
            const response = await apiClient.get(
                `/api/machine/getMachines?orgId=${orgId}&branchId=${branchId}`
            );
            return response;
        } catch (error) {
            console.error("Error fetching machines:", error);
            throw error;
        }
    },

    // Get Process Sheets
    getProcessSheets: async (orgId, branchId) => {
        try {
            const response = await apiClient.get(
                `/api/processSheet/getAll?orgId=${orgId}&branchId=${branchId}`
            );
            return response;
        } catch (error) {
            console.error("Error fetching process sheets:", error);
            throw error;
        }
    },

    // Get Employees
    getEmployees: async (orgId, branchId) => {
        try {
            const response = await apiClient.get(
                `/api/employee/getByOrgId?orgId=${orgId}`
            );
            return response;
        } catch (error) {
            console.error("Error fetching employees:", error);
            throw error;
        }
    },
};

export default machineSettingPlanAPI;
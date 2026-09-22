import apiClient from "../apiClient";

const machineSettingPlanAPI = {
    /* ---------------- List by Org + Branch ---------------- */
    getByOrgIdAndBranch: async ({ branch, orgId }) => {
        try {
            const res = await apiClient.get(
                `/api/subContract/getMachineSettingPlanByOrgIdAndBranch?branch=${branch}&orgId=${orgId}`,
            );
            return res?.paramObjectsMap?.machineSettingPlan || [];
        } catch (error) {
            console.error("Error fetching machine setting plans:", error);
            throw error;
        }
    },

    /* ---------------- Get by Id ---------------- */
    getById: async (id) => {
        try {
            const res = await apiClient.get(
                `/api/subContract/getMachineSettingPlanById?id=${id}`,
            );
            return res?.paramObjectsMap?.machineSettingPlan || null;
        } catch (error) {
            console.error("Error fetching machine setting plan:", error);
            throw error;
        }
    },

    /* ---------------- Doc Id ---------------- */
    getDocId: async ({ financialYear, orgId }) => {
        try {
            const res = await apiClient.get(
                `/api/subContract/getMachineSettingPlanDocId?financialYear=${financialYear}&orgId=${orgId}`,
            );
            return res?.paramObjectsMap?.docId || "";
        } catch (error) {
            console.error("Error fetching MSP Doc Id:", error);
            throw error;
        }
    },

    /* ---------------- FG / SFG Items ---------------- */
    getFGAndSFGItems: async ({ branch, orgId }) => {
        try {
            const res = await apiClient.get(
                `/api/subContract/getFGAndSFGItems?branch=${branch}&orgId=${orgId}`,
            );
            return res?.paramObjectsMap?.itemDetails || [];
        } catch (error) {
            console.error("Error fetching FG/SFG items:", error);
            throw error;
        }
    },

    /* ---------------- Operation Master (operations + machines) ---------------- */
    getOperationMaster: async (orgId) => {
        try {
            const res = await apiClient.get(
                `/api/initialPlanning/getOperationMasterByOrgId?orgId=${orgId}`,
            );
            return res?.paramObjectsMap?.operationMasterVO || [];
        } catch (error) {
            console.error("Error fetching operation master:", error);
            throw error;
        }
    },

    /* ---------------- Process Sheet Routing ---------------- */
    getProcessSheets: async ({ branch, orgId }) => {
        try {
            const res = await apiClient.get(
                `/api/develop/getProcessSheetCompRoutingByOrgId?branch=${branch}&orgId=${orgId}`,
            );
            return res?.paramObjectsMap?.processSheetCompRoutingResponseVO || [];
        } catch (error) {
            console.error("Error fetching process sheets:", error);
            throw error;
        }
    },

    /* ---------------- All employees ---------------- */
    getEmployees: async (orgId) => {
        try {
            const res = await apiClient.get(
                `/api/efitmaster/getEmployeeMasterByOrgId?orgId=${orgId}`,
            );
            return res?.paramObjectsMap?.employeeMasterVO || [];
        } catch (error) {
            console.error("Error fetching employees:", error);
            throw error;
        }
    },

    /* ---------------- Save (create / update) ---------------- */
    createUpdate: async (payload) => {
        try {
            const res = await apiClient.put(
                "/api/subContract/createUpdateMachineSettingPlan",
                payload,
            );
            return res;
        } catch (error) {
            console.error("Error saving machine setting plan:", error);
            throw error;
        }
    },
};

export default machineSettingPlanAPI;
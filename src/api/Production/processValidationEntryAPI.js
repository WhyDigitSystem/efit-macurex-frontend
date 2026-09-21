import apiClient from "../apiClient";

const processValidationEntryAPI = {
    /* ---------------- List by Org + Branch ---------------- */
    getByOrgIdAndBranch: async ({ branch, orgId }) => {
        try {
            const res = await apiClient.get(
                `/api/subContract/getProcessValidationEntryByOrgIdAndBranch?branch=${branch}&orgId=${orgId}`,
            );
            return res?.paramObjectsMap?.processValidationEntry || [];
        } catch (error) {
            console.error("Error fetching Process Validation Entries:", error);
            throw error;
        }
    },

    /* ---------------- Get by Id ---------------- */
    getById: async (id) => {
        try {
            const res = await apiClient.get(
                `/api/subContract/getProcessValidationEntryById?id=${id}`,
            );
            return res?.paramObjectsMap?.processValidationEntry || null;
        } catch (error) {
            console.error("Error fetching Process Validation Entry by id:", error);
            throw error;
        }
    },

    /* ---------------- Doc Id ---------------- */
    getDocId: async ({ financialYear, orgId }) => {
        try {
            const res = await apiClient.get(
                `/api/subContract/getProcessValidationEntryDocId?financialYear=${financialYear}&orgId=${orgId}`,
            );
            return res?.paramObjectsMap?.processValidationEntryDocId || "";
        } catch (error) {
            console.error("Error fetching Process Validation DocId:", error);
            throw error;
        }
    },

    /* ---------------- Item Codes ---------------- */
    getItemDetails: async ({ branch, orgId }) => {
        try {
            const res = await apiClient.get(
                `/api/transaction/getItemDetailsForSalesReturn?branch=${branch}&orgId=${orgId}`,
            );
            return res?.paramObjectsMap?.itemDetails || [];
        } catch (error) {
            console.error("Error fetching item details:", error);
            throw error;
        }
    },

    /* ---------------- Party Ids (customers) ---------------- */
    getCustomerDetails: async ({ branch, orgId }) => {
        try {
            const res = await apiClient.get(
                `/api/transaction/getCustomerDetails?branch=${branch}&orgId=${orgId}`,
            );
            return res?.paramObjectsMap?.customerDetails || [];
        } catch (error) {
            console.error("Error fetching customer details:", error);
            throw error;
        }
    },

    /* ---------------- Process Sheet Routing ---------------- */
    getProcessSheetRouting: async ({ branch, orgId }) => {
        try {
            const res = await apiClient.get(
                `/api/develop/getProcessSheetCompRoutingByOrgId?branch=${branch}&orgId=${orgId}`,
            );
            return res?.paramObjectsMap?.processSheetCompRoutingResponseVO || [];
        } catch (error) {
            console.error("Error fetching process sheet routing:", error);
            throw error;
        }
    },

    /* ---------------- Control Plans ---------------- */
    getControlPlans: async ({ branch, orgId }) => {
        try {
            const res = await apiClient.get(
                `/api/develop/getControlPlanByOrgId?branch=${branch}&orgId=${orgId}`,
            );
            return res?.paramObjectsMap?.controlPlanResponseVO || [];
        } catch (error) {
            console.error("Error fetching control plans:", error);
            throw error;
        }
    },

    /* ---------------- Save (create / update) ---------------- */
    createUpdate: async (payload) => {
        try {
            const res = await apiClient.put(
                "/api/subContract/createUpdateProcessValidationEntry",
                payload,
            );
            return res;
        } catch (error) {
            console.error("Error saving Process Validation Entry:", error);
            throw error;
        }
    },
};

export default processValidationEntryAPI;
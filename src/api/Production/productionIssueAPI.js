import apiClient from "../apiClient";

const productionIssueAPI = {
    getByOrgId: async (orgId, branchId) => {
        try {
            const res = await apiClient.get(
                `/api/commonmaster/getProductionIssueByOrgId?orgId=${orgId}&branchId=${branchId}`,
            );
            return res?.paramObjectsMap?.productionIssueList || [];
        } catch (error) {
            console.error("Error fetching production issues:", error);
            throw error;
        }
    },

    getById: async (id) => {
        try {
            const res = await apiClient.get(
                `/api/commonmaster/getProductionIssueById?id=${id}`,
            );
            return res?.paramObjectsMap?.productionIssueVO || null;
        } catch (error) {
            console.error("Error fetching production issue by id:", error);
            throw error;
        }
    },

    createUpdate: async (data) => {
        try {
            const res = await apiClient.post(
                "/api/commonmaster/createUpdateProductionIssue",
                data,
            );
            return res;
        } catch (error) {
            console.error("Error saving production issue:", error);
            throw error;
        }
    },

    getDocId: async ({ financialYear, orgId, screenCode, type }) => {
        try {
            const res = await apiClient.get(
                `/api/commonmaster/getProductionIssueDocId`,
                {
                    params: {
                        financialYear,
                        orgId,
                        screenCode,
                        type,
                    },
                },
            );
            const data = res?.data ?? res;
            return data?.paramObjectsMap?.invoiceDocId || "";
        } catch (error) {
            console.error("Error fetching production issue doc id:", error);
            throw error;
        }
    },

    getPlantOptions: async (orgId) => {
        try {
            const res = await apiClient.get(
                `/api/commonmaster/getPlantListByOrgId?orgId=${orgId}`,
            );
            return res?.paramObjectsMap?.plantVO || [];
        } catch (error) {
            console.error("Error fetching plants:", error);
            throw error;
        }
    },

    getLocationOptions: async (orgId, branchId) => {
        try {
            const res = await apiClient.get(
                `/api/commonmaster/getLocationListByOrgBranch?orgId=${orgId}&branchId=${branchId}`,
            );
            return res?.paramObjectsMap?.locationVO || [];
        } catch (error) {
            console.error("Error fetching locations:", error);
            throw error;
        }
    },

    getItemOptions: async (orgId, branchId) => {
        try {
            const res = await apiClient.get(
                `/api/commonmaster/getItemListByOrgBranch?orgId=${orgId}&branchId=${branchId}`,
            );
            return res?.paramObjectsMap?.itemVO || [];
        } catch (error) {
            console.error("Error fetching items:", error);
            throw error;
        }
    },

    getIndentOptions: async (orgId, branchId) => {
        try {
            const res = await apiClient.get(
                `/api/commonmaster/getIndentListByOrgBranch?orgId=${orgId}&branchId=${branchId}`,
            );
            return res?.paramObjectsMap?.indentVO || [];
        } catch (error) {
            console.error("Error fetching indents:", error);
            throw error;
        }
    },

    getScheduleOrderOptions: async (orgId, branchId) => {
        try {
            const res = await apiClient.get(
                `/api/commonmaster/getScheduleOrderListByOrgBranch?orgId=${orgId}&branchId=${branchId}`,
            );
            return res?.paramObjectsMap?.scheduleOrderVO || [];
        } catch (error) {
            console.error("Error fetching schedule orders:", error);
            throw error;
        }
    },

    getUnitOptions: async (orgId, branchId) => {
        try {
            const res = await apiClient.get(
                `/api/commonmaster/getUnitListByOrgBranch?orgId=${orgId}&branchId=${branchId}`,
            );
            return res?.paramObjectsMap?.unitVO || [];
        } catch (error) {
            console.error("Error fetching units:", error);
            throw error;
        }
    },

    getGRNOptions: async (orgId, branchId) => {
        try {
            const res = await apiClient.get(
                `/api/commonmaster/getGRNListByOrgBranch?orgId=${orgId}&branchId=${branchId}`,
            );
            return res?.paramObjectsMap?.grnVO || [];
        } catch (error) {
            console.error("Error fetching GRNs:", error);
            throw error;
        }
    },

    getBelongsToOptions: async (orgId) => {
        try {
            const res = await apiClient.get(
                `/api/commonmaster/getBelongsToList?orgId=${orgId}`,
            );
            return res?.paramObjectsMap?.belongsToVO || [];
        } catch (error) {
            console.error("Error fetching belongs to:", error);
            throw error;
        }
    },

    getIssueTypeOptions: async (orgId) => {
        try {
            const res = await apiClient.get(
                `/api/commonmaster/getIssueTypeList?orgId=${orgId}`,
            );
            return res?.paramObjectsMap?.issueTypeVO || [];
        } catch (error) {
            console.error("Error fetching issue types:", error);
            throw error;
        }
    },
};

export default productionIssueAPI;
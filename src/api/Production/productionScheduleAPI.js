import apiClient from "../apiClient";

const productionScheduleAPI = {
    getByOrgId: async (orgId, branchId) => {
        try {
            const res = await apiClient.get(
                `/api/commonmaster/getProductionScheduleByOrgId?orgId=${orgId}&branchId=${branchId}`,
            );
            return res?.paramObjectsMap?.productionScheduleList || [];
        } catch (error) {
            console.error("Error fetching production schedules:", error);
            throw error;
        }
    },

    getById: async (id) => {
        try {
            const res = await apiClient.get(
                `/api/commonmaster/getProductionScheduleById?id=${id}`,
            );
            return res?.paramObjectsMap?.productionScheduleVO || null;
        } catch (error) {
            console.error("Error fetching production schedule by id:", error);
            throw error;
        }
    },

    // Header, schedule month and schedule details are saved in a single
    // transaction by the backend; complete record history with the monthly
    // breakdown and variance tracking is maintained.
    createUpdate: async (data) => {
        try {
            const res = await apiClient.post(
                "/api/commonmaster/createUpdateProductionSchedule",
                data,
            );
            return res;
        } catch (error) {
            console.error("Error saving production schedule:", error);
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
};

export default productionScheduleAPI;

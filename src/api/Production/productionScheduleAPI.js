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

    getAllForNextThreeMonth: async (branch, orgId) => {
        try {
            const res = await apiClient.get(
                `/api/subContract/getAllProductionScheduleForNextThreeMonthByOrgIdAndBranch?branch=${branch}&orgId=${orgId}`,
            );
            return res?.paramObjectsMap?.productionScheduleForNextThreeMonth || [];
        } catch (error) {
            console.error(
                "Error fetching next-three-month production schedules:",
                error,
            );
            throw error;
        }
    },

    // ✅ NEW: fetch a single record by id
    getByIdForNextThreeMonth: async (id) => {
        try {
            const res = await apiClient.get(
                `/api/subContract/getProductionScheduleForNextThreeMonthById?id=${id}`,
            );
            return res?.paramObjectsMap?.productionScheduleForNextThreeMonth || null;
        } catch (error) {
            console.error(
                "Error fetching next-three-month production schedule by id:",
                error,
            );
            throw error;
        }
    },

    createUpdateForNextThreeMonth: async (data) => {
        try {
            const res = await apiClient.put(
                "/api/subContract/createUpdateProductionScheduleForNextThreeMonth",
                data,
            );
            return res;
        } catch (error) {
            console.error(
                "Error saving next-three-month production schedule:",
                error,
            );
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
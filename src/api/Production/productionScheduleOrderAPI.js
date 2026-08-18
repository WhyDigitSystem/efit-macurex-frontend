import apiClient from "../apiClient";

const productionScheduleOrderAPI = {
    getByOrgId: async (orgId, branchId) => {
        try {
            const res = await apiClient.get(
                `/api/commonmaster/getProductionScheduleOrderByOrgId?orgId=${orgId}&branchId=${branchId}`,
            );
            return res?.paramObjectsMap?.productionScheduleOrderList || [];
        } catch (error) {
            console.error("Error fetching production schedule orders:", error);
            throw error;
        }
    },

    getById: async (id) => {
        try {
            const res = await apiClient.get(
                `/api/commonmaster/getProductionScheduleOrderById?id=${id}`,
            );
            return res?.paramObjectsMap?.productionScheduleOrderVO || null;
        } catch (error) {
            console.error("Error fetching production schedule order by id:", error);
            throw error;
        }
    },

    createUpdate: async (data) => {
        try {
            const res = await apiClient.post(
                "/api/commonmaster/createUpdateProductionScheduleOrder",
                data,
            );
            return res;
        } catch (error) {
            console.error("Error saving production schedule order:", error);
            throw error;
        }
    },
};

export default productionScheduleOrderAPI;
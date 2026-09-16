import apiClient from "./apiClient";

const shiftAPI = {
    getByOrgId: async (orgId) => {
        try {
            const res = await apiClient.get(
                "/api/commonmaster/getShiftByOrgId",
                { params: { orgId } },
            );
            return res?.paramObjectsMap?.shiftVO || [];
        } catch (error) {
            console.error("Error fetching shift list:", error);
            throw error;
        }
    },

    getById: async (id) => {
        try {
            const res = await apiClient.get(
                `/api/commonmaster/getShiftById?id=${id}`,
            );
            return res?.paramObjectsMap?.shiftVO?.[0] ?? null;
        } catch (error) {
            console.error("Error fetching shift by id:", error);
            throw error;
        }
    },

    updateCreateShift: async (payload) => {
        try {
            const res = await apiClient.put(
                "/api/commonmaster/updateCreateShift",
                payload,
            );
            return res;
        } catch (error) {
            console.error("Error saving shift:", error);
            throw error;
        }
    },
};

export default shiftAPI;
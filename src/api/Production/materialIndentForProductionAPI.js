import apiClient from "../apiClient";

const materialIndentForProductionAPI = {
    getByOrgId: async (orgId, branchId) => {
        try {
            const res = await apiClient.get(
                `/api/commonmaster/getMaterialIndentByOrgId?orgId=${orgId}&branchId=${branchId}`,
            );
            return res?.paramObjectsMap?.materialIndentList || [];
        } catch (error) {
            console.error("Error fetching material indents:", error);
            throw error;
        }
    },

    getById: async (id) => {
        try {
            const res = await apiClient.get(
                `/api/commonmaster/getMaterialIndentById?id=${id}`,
            );
            return res?.paramObjectsMap?.materialIndentVO || null;
        } catch (error) {
            console.error("Error fetching material indent by id:", error);
            throw error;
        }
    },

    createUpdate: async (data) => {
        try {
            const res = await apiClient.post(
                "/api/commonmaster/createUpdateMaterialIndent",
                data,
            );
            return res;
        } catch (error) {
            console.error("Error saving material indent:", error);
            throw error;
        }
    },
};

export default materialIndentForProductionAPI;
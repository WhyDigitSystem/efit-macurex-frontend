import apiClient from "./apiClient";

export const partyMasterAPI = {
    getBuyerDetails: async (orgId, branch) => {
        try {
            const res = await apiClient.get(
                `/api/partyMaster/getPurchaseEmployees?orgId=${orgId}&branch=${branch}`,
            );
            return res?.paramObjectsMap?.employees || [];
        } catch (error) {
            console.error("Error fetching parties:", error);
            throw error;
        }
    },

    getPartyById: async (id) => {
        try {
            const res = await apiClient.get(
                `/api/partyMaster/getCustomerById?id=${id}`,
            );
            return res;
        } catch (error) {
            console.error("Error fetching party account mapping by ID:", error);
            throw error;
        }
    },

    getPartyByOrgId: async (orgId, branch) => {
        try {
            const res = await apiClient.get(
                `/api/partyMaster/getCustomerByOrgId?orgId=${orgId}&branch=${branch}`,
            );
            return res?.paramObjectsMap?.customerList || [];
        } catch (error) {
            console.error("Error fetching party account mapping list:", error);
            throw error;
        }
    },

    createUpdatePartyMaster: async (customerDTO) => {
        try {
            const res = await apiClient.put(
                "/api/partyMaster/createUpdateCustomer",
                customerDTO,
            );
            return res;
        } catch (error) {
            console.error("Error creating/updating party account mapping:", error);
            throw error;
        }
    },
};

export default partyMasterAPI;

import apiClient from "../apiClient";

const gateInwardAPI = {
    getByOrgId: async (orgId, branchId) => {
        try {
            const res = await apiClient.get(
                `/api/purchasedeliveryschedule/getGateInwardEntryByOrgId?orgId=${orgId}&branch=${branchId}`,
            );
            return res?.paramObjectsMap?.gateInwardEntryVO || [];
        } catch (error) {
            console.error("Error fetching gate inward entries:", error);
            throw error;
        }
    },

    getById: async (id) => {
        try {
            const res = await apiClient.get(
                `/api/purchasedeliveryschedule/getGateInwardEntryById?id=${id}`,
            );
            return res?.paramObjectsMap?.gateInwardEntryVO || null;
        } catch (error) {
            console.error("Error fetching gate inward by id:", error);
            throw error;
        }
    },

    createUpdate: async (data) => {
        try {
            const res = await apiClient.put(
                "/api/purchasedeliveryschedule/updateCreateGateInwardEntry",
                data,
            );
            return res;
        } catch (error) {
            console.error("Error saving gate inward:", error);
            throw error;
        }
    },

    getCustomerDropdown: async (orgId, branchId) => {
        try {
            const res = await apiClient.get(
                `/api/purchasedeliveryschedule/getCustomerNameDropdownForGateInwardEntry?branch=${branchId}&orgId=${orgId}`,
            );
            return res?.paramObjectsMap?.customerList || [];
        } catch (error) {
            console.error("Error fetching customers for Gate Inward:", error);
            throw error;
        }
    },
};

export default gateInwardAPI;
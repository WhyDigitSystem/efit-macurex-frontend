import apiClient from "../apiClient";

const activitiesCarriedOutAPI = {
    getActivitiesCarriedOutDocId: async (orgId, financialYear) => {
        try {
            const res = await apiClient.get(
                "/api/vendorComplaintEntry/getActivitiesCarriedOutDocId",
                { params: { orgId, financialYear } }
            );
            return res?.paramObjectsMap?.docId || "";
        } catch (error) {
            console.error("Error fetching Activities Carried Out doc id:", error);
            throw error;
        }
    },

    getMachineToolForBreakdown: async (toolCategoryId, orgId, branch) => {
        try {
            const res = await apiClient.get(
                "/api/vendorComplaintEntry/getMachineToolForBreakdown",
                { params: { toolCategoryId, orgId, branch } }
            );
            return res?.paramObjectsMap?.machineToolList || [];
        } catch (error) {
            console.error("Error fetching machine/tool numbers:", error);
            throw error;
        }
    },

    // NEW — PM Check List dropdown
    getPMCheckListDropdown: async (branch, macNo, orgId) => {
        try {
            const res = await apiClient.get(
                "/api/vendorComplaintEntry/getPMCheckListDropdownForActivitiesCarriedOut",
                {
                    params: { branch, MACNO: macNo, orgId },
                }
            );
            return res?.paramObjectsMap?.pmCheckListDropdown || [];
        } catch (error) {
            console.error("Error fetching PM Check List dropdown:", error);
            throw error;
        }
    },

    updateCreateActivitiesCarriedOut: async (payload) => {
        try {
            const res = await apiClient.put(
                "/api/vendorComplaintEntry/updateCreateActivitiesCarriedOut",
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                }
            );
            return res;
        } catch (error) {
            console.error("Error saving Activities Carried Out:", error);
            throw error;
        }
    },
};

export default activitiesCarriedOutAPI;
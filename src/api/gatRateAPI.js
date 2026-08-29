import apiClient from "./apiClient";

export const gstRateApi = {
    getGstRateList: async (orgId) => {
        try {
            const res = await apiClient.get(
                `/api/commonmaster/getGSTRateByOrgId?orgId=${orgId}`
            );
            console.log("GST Rate List API Response:", res);
            return res;
        } catch (error) {
            console.error("Error fetching GST rates:", error);
            throw error;
        }
    },

    // Get GST Rate by ID
    getGSTRateById: async (id) => {
        try {
            const res = await apiClient.get(
                `/api/commonmaster/getGSTRateMasterById?id=${id}`
            );
            console.log("Get GST Rate By ID Raw Response:", res);

            // Try different possible response structures
            let gstRateData = null;

            if (res?.paramObjectsMap?.gSTRateMasterVO) {
                gstRateData = res.paramObjectsMap.gSTRateMasterVO;
            } else if (res?.paramObjectsMap?.gstRateMasterVO) {
                gstRateData = res.paramObjectsMap.gstRateMasterVO;
            } else if (res?.paramObjectsMap?.gstRateVO) {
                gstRateData = res.paramObjectsMap.gstRateVO;
            } else if (res?.paramObjectsMap?.gstRate) {
                gstRateData = res.paramObjectsMap.gstRate;
            } else if (res?.data) {
                gstRateData = res.data;
            } else if (res) {
                gstRateData = res;
            }

            console.log("Extracted GST Rate Data:", gstRateData);
            return gstRateData;
        } catch (error) {
            console.error("Error fetching GST rate by ID:", error);
            throw error;
        }
    },

    // Create or Update GST Rate
    createUpdateGSTRate: async (data) => {
        try {
            const res = await apiClient.put(
                "/api/commonmaster/updateCreateGSTRateMaster",
                data,
            );
            console.log("Create/Update GST Rate Response:", res);
            return res;
        } catch (error) {
            console.error("Error creating/updating GST Rate:", error);
            throw error;
        }
    },
};

export default gstRateApi;
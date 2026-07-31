import apiClient from "./apiClient";

export const gstStateApi = {

  getGstStateList: async (branch,orgId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getGSTStateMasterByOrgId?branch=${branch}&orgId=${orgId}`
      );
      return res?.paramObjectsMap?.gstStateMasterList || [];
    } catch (error) {
      console.error("Error fetching countries:", error);
      throw error;
    }
  },

  getGSTStateById: async (id) => {
    try {
      const res = await apiClient.get(`/api/commonmaster/getGSTStateMasterById?id=${id}`);
      return res?.paramObjectsMap?.gstStateMasterVO || null;
    } catch (error) {
      console.error("Error fetching country by ID:", error);
      throw error;
    }
  },

  createUpdateGstState: async (data) => {
    try {
      const res = await apiClient.put(
        "/api/commonmaster/createUpdateGSTStateMaster",
        data,
      );
      return res;
    } catch (error) {
      console.error("Error creating/updating List Of Values:", error);
      throw error;
    }
  },
};

export default gstStateApi;
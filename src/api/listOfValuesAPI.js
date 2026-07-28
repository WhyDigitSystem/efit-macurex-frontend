import apiClient from "./apiClient";

const listOfValuesAPI = {
  getByOrgId: async (orgId, branchId) => {
    try {
      const res = await apiClient.get("/api/commonmaster/getListOfValuesByOrgId", {
        params: { orgId, branchId },
      });
      return res?.paramObjectsMap?.listOfValues || [];
    } catch (error) {
      console.error("Error fetching list of values:", error);
      throw error;
    }
  },
};

export default listOfValuesAPI;

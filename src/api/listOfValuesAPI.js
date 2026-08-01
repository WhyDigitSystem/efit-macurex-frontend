import apiClient from "./apiClient";

const listOfValuesAPI = {
  getListValuesGroup: async (listDescription, orgId) => {
    try {
      const res = await apiClient.get("/api/commonmaster/getListValuesGroup", {
        params: { listDescription, orgId },
      });
      return res?.paramObjectsMap?.listValues || [];
    } catch (error) {
      console.error("Error fetching list values group:", error);
      throw error;
    }
  },
  getListOfValuesByOrgId: async (branchId, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/commonmaster/getListOfValuesByOrgId",
        { params: { branchId, orgId } },
      );
      return res?.paramObjectsMap?.listOfValues || [];
    } catch (error) {
      console.error("Error fetching List Of Values:", error);
      throw error;
    }
  },
};

export default listOfValuesAPI;

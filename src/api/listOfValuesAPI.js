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
};

export default listOfValuesAPI;

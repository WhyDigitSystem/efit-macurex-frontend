// subContractSupplyScheduleAPI.js
import apiClient from "./apiClient";

const subContractSupplyScheduleAPI = {
  // Get Sub Contract Supply Schedules by Organization + Branch
  getSubContractSupplyScheduleByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        "/api/commonmaster/getSubContractSupplyScheduleByOrgId",
        { params: { branch, orgId } },
      );
      return res?.paramObjectsMap?.subContractSupplyScheduleVO || [];
    } catch (error) {
      console.error("Error fetching sub contract supply schedules:", error);
      throw error;
    }
  },

  getSubContractSupplyScheduleById: async (id) => {
    try {
      const res = await apiClient.get(
        "/api/commonmaster/getSubContractSupplyScheduleById",
        { params: { id } },
      );
      return res?.paramObjectsMap?.subContractSupplyScheduleVO || null;
    } catch (error) {
      console.error("Error fetching sub contract supply schedule by ID:", error);
      throw error;
    }
  },

  // Create / Update a sub contract supply schedule linked to the contract/job
  // order. Header, item details, schedule and summary records are saved in a
  // single transaction; the backend is expected to maintain full scheduling
  // history.
  createUpdateSubContractSupplySchedule: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/commonmaster/updateCreateSubContractSupplySchedule",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving sub contract supply schedule:", error);
      throw error;
    }
  },
};

export default subContractSupplyScheduleAPI;
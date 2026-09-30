import apiClient from "../apiClient";

const initialStageInspectionAPI = {
  getInitialStageInspectionByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/quality/getInitialStageInspectionByOrgId?branch=${branch}&orgId=${orgId}`
      );
      const list = res?.paramObjectsMap?.initialStageInspectionVO;
      return Array.isArray(list) ? list : list ? [list] : [];
    } catch (error) {
      console.error("Error fetching initial stage inspections:", error);
      throw error;
    }
  },

  getInitialStageInspectionById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/quality/getInitialStageInspectionById?id=${id}`
      );
      return res?.paramObjectsMap?.initialStageInspectionVO || null;
    } catch (error) {
      console.error("Error fetching initial stage inspection by ID:", error);
      throw error;
    }
  },

  // NEW — Doc ID
  getInitialStageInspectionDocId: async (orgId, financialYear) => {
    try {
      const res = await apiClient.get(
        "/api/develop/getInitialStageInspectionDocId",
        { params: { orgId, financialYear } }
      );
      return res?.paramObjectsMap?.initialStageInspectionDocId || "";
    } catch (error) {
      console.error("Error fetching initial stage inspection doc id:", error);
      throw error;
    }
  },

  // NEW — Work Order No dropdown
  getWorkOrderNoDropDown: async (branch, orgId, partyId) => {
    try {
      const res = await apiClient.get(
        "/api/develop/getWorkOrderNoDropDownForInitialStageInspection",
        { params: { branch, orgId, partyId } }
      );
      return res?.paramObjectsMap?.workOrderNoList || [];
    } catch (error) {
      console.error("Error fetching work order no list:", error);
      throw error;
    }
  },

  createUpdateInitialStageInspection: async (payload) => {
    try {
      const res = await apiClient.put(
        `/api/quality/updateCreateInitialStageInspection`,
        payload
      );
      return res;
    } catch (error) {
      console.error("Error saving initial stage inspection:", error);
      throw error;
    }
  },
};

export default initialStageInspectionAPI;
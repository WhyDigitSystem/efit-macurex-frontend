import apiClient from "../apiClient";

export const PM_CHECKLIST_FOR_OPTIONS = [
  "PREVENTIVE MAINTENANCE",
  "PREDICTIVE MAINTENANCE",
  "CORRECTIVE MAINTENANCE",
  "BREAKDOWN MAINTENANCE",
  "ROUTINE MAINTENANCE",
  "EMERGENCY MAINTENANCE",
];

export const FREQUENCY_OPTIONS = [
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "QUARTERLY",
  "HALF-YEARLY",
  "YEARLY",
  "AS NEEDED",
];

export const pmChecklistMasterAPI = {
  getChecklists: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/plantMaintenance/pmChecklist?orgid=${orgId}`
      );
      return res?.paramObjectsMap?.pmChecklistVOList || res?.data || [];
    } catch (error) {
      console.error("Error fetching PM checklists:", error);
      throw error;
    }
  },

  getChecklistById: async (checklistId) => {
    try {
      const res = await apiClient.get(
        `/api/plantMaintenance/pmChecklist/${checklistId}`
      );
      return res?.paramObjectsMap?.pmChecklistVO || null;
    } catch (error) {
      console.error("Error fetching PM checklist by ID:", error);
      throw error;
    }
  },

  createUpdateChecklist: async (checklistDTO) => {
    try {
      const res = await apiClient.post(
        "/api/plantMaintenance/createUpdatePmChecklist",
        checklistDTO
      );
      return res;
    } catch (error) {
      console.error("Error creating/updating PM checklist:", error);
      throw error;
    }
  },

  getChecklistHistory: async (checklistId) => {
    try {
      const res = await apiClient.get(
        `/api/plantMaintenance/pmChecklist/${checklistId}/history`
      );
      return res?.paramObjectsMap?.pmChecklistHistoryVOList || [];
    } catch (error) {
      console.error("Error fetching PM checklist history:", error);
      throw error;
    }
  },

  getEmployees: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/efitmaster/getEmployeeMasterByOrgId?orgId=${orgId}`
      );
      return res?.paramObjectsMap?.employeeMasterVO || [];
    } catch (error) {
      console.error("Error fetching employees:", error);
      throw error;
    }
  },

  getMachineToolCategories: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/plantMaintenance/category?orgid=${orgId}`
      );
      return res?.paramObjectsMap?.categoryVOList || res?.data || [];
    } catch (error) {
      console.error("Error fetching machine/tool categories:", error);
      throw error;
    }
  },

  getActivities: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/plantMaintenance/activity?orgid=${orgId}`
      );
      return res?.paramObjectsMap?.activityVOList || res?.data || [];
    } catch (error) {
      console.error("Error fetching activities:", error);
      throw error;
    }
  },
};

export default pmChecklistMasterAPI;

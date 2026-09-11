import apiClient from "../apiClient";

const BASE = "/api/develop";

export const controlPlanAPI = {
  // ---------------------------------------------------------------------------
  // Control Plan List / By Id / Doc No
  // ---------------------------------------------------------------------------
  getControlPlanByOrgId: async (branch, orgId) => {
    try {
      const res = await apiClient.get(`${BASE}/getControlPlanByOrgId`, {
        params: {
          branch: Number(branch),
          orgId: Number(orgId),
        },
      });

      console.log("CONTROL PLAN LIST API RESPONSE:", res);

      // Backend returns controlPlanResponseVO for list API
      const list = res?.paramObjectsMap?.controlPlanResponseVO;

      console.log("CONTROL PLAN LIST:", list);

      return Array.isArray(list) ? list : [];
    } catch (error) {
      console.error("Error fetching control plans:", error);
      return [];
    }
  },

  getControlPlanById: async (id) => {
    try {
      const res = await apiClient.get(`${BASE}/getControlPlanById`, {
        params: {
          id: Number(id),
        },
      });

      return res?.paramObjectsMap?.controlPlanVO || null;
    } catch (error) {
      console.error("Error fetching control plan by ID:", error);
      throw error;
    }
  },

  getControlPlanDocId: async (financialYear, orgId) => {
    try {
      const res = await apiClient.get(`${BASE}/getControlPlanDocId`, {
        params: {
          financialYear: String(financialYear),
          orgId: Number(orgId),
        },
      });

      return res?.paramObjectsMap?.controlPlanDocId || "";
    } catch (error) {
      console.error("Error generating Control Plan Doc Id:", error);
      throw error;
    }
  },

  // ---------------------------------------------------------------------------
  // Create / Update
  // ---------------------------------------------------------------------------
  createUpdateControlPlan: async (controlPlanDTO) => {
    try {
      const res = await apiClient.put(
        `${BASE}/createUpdateControlPlan`,
        controlPlanDTO,
      );

      return res;
    } catch (error) {
      console.error("Error creating/updating control plan:", error);
      throw error;
    }
  },

  // ---------------------------------------------------------------------------
  // FG Item Dropdown
  // ---------------------------------------------------------------------------
  getFGItemDropdown: async (branch, orgId) => {
    try {
      const res = await apiClient.get(
        `${BASE}/getFGItemDropdownforControlPlan`,
        {
          params: {
            branch: Number(branch),
            orgId: Number(orgId),
          },
        },
      );

      return res?.paramObjectsMap?.fgItemList || [];
    } catch (error) {
      console.error("Error fetching FG item dropdown:", error);
      return [];
    }
  },

  // ---------------------------------------------------------------------------
  // Process Sheet Component Routing - Operation Dropdown
  // ---------------------------------------------------------------------------
  getOperationDropdown: async (branch, orgId) => {
    try {
      const res = await apiClient.get(
        `${BASE}/getOperationDropdownforProcessSheetCompRouting`,
        {
          params: {
            branch: Number(branch),
            orgId: Number(orgId),
          },
        },
      );

      return res?.paramObjectsMap?.operationList || [];
    } catch (error) {
      console.error("Error fetching operation dropdown:", error);
      return [];
    }
  },

  // ---------------------------------------------------------------------------
  // Operation Master
  // ---------------------------------------------------------------------------
  getOperationMasterByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        "/api/initialPlanning/getOperationMasterByOrgId",
        {
          params: {
            orgId: Number(orgId),
          },
        },
      );

      return res?.paramObjectsMap?.operationMasterVO || [];
    } catch (error) {
      console.error("Error fetching Operation Master:", error);
      return [];
    }
  },

  // ---------------------------------------------------------------------------
  // Location Dropdown
  // ---------------------------------------------------------------------------
  getLocationDropdownforProcessSheetCompRouting: async (branch, orgId) => {
    try {
      const res = await apiClient.get(
        `${BASE}/getLocationDropdownforProcessSheetCompRouting`,
        {
          params: {
            branch: Number(branch),
            orgId: Number(orgId),
          },
        },
      );

      return res?.paramObjectsMap?.locationList || [];
    } catch (error) {
      console.error(
        "Error fetching location dropdown for Process Sheet Component Routing:",
        error,
      );

      return [];
    }
  },

  // ---------------------------------------------------------------------------
  // Parameter Master
  // ---------------------------------------------------------------------------
  getParameterMaster: async (orgId) => {
    try {
      const res = await apiClient.get(`${BASE}/getParameterMasterByOrgId`, {
        params: {
          orgId: Number(orgId),
        },
      });

      return res?.paramObjectsMap?.parameterMasterResponseVO || [];
    } catch (error) {
      console.error("Error fetching parameter master:", error);
      return [];
    }
  },

  // ---------------------------------------------------------------------------
  // Machine / Fixture Dropdown
  // ---------------------------------------------------------------------------
  getMachineFixtureDropdown: async (branch, orgId) => {
    try {
      const res = await apiClient.get(
        `${BASE}/getcontrolplandropdownforMachineFixtureDropdown`,
        {
          params: {
            branch: Number(branch),
            orgId: Number(orgId),
          },
        },
      );

      return res?.paramObjectsMap?.machineFixtureList || [];
    } catch (error) {
      console.error("Error fetching machine/fixture dropdown:", error);
      return [];
    }
  },
};

export default controlPlanAPI;

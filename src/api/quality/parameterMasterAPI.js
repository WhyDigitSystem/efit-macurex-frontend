import apiClient from "../apiClient";

export const PARAMETER_TYPES = [
  "SURFACE ROUGHNESS",
  "DIMENSIONAL",
  "VISUAL",
  "MATERIAL / HARDNESS",
  "WEIGHT",
  "FUNCTIONAL / PERFORMANCE",
  "TEMPERATURE",
  "PRESSURE",
];

const LIST_GROUP_NAME = "Parameter Master";

export const parameterMasterAPI = {
  getParameters: async (orgId) => {
    try {
      const res = await apiClient.get(`/api/quality/parameter?orgid=${orgId}`);
      return res?.paramObjectsMap?.parameterVOList || res?.data || [];
    } catch (error) {
      console.error("Error fetching parameters:", error);
      throw error;
    }
  },

  getParameterById: async (parameterId) => {
    try {
      const res = await apiClient.get(`/api/quality/parameter/${parameterId}`);
      return res?.paramObjectsMap?.parameterVO || null;
    } catch (error) {
      console.error("Error fetching parameter by ID:", error);
      throw error;
    }
  },

  createUpdateParameter: async (parameterDTO) => {
    try {
      const res = await apiClient.post(
        "/api/quality/createUpdateParameter",
        parameterDTO,
      );
      return res;
    } catch (error) {
      console.error("Error creating/updating parameter:", error);
      throw error;
    }
  },

  getParameterHistory: async (parameterId) => {
    try {
      const res = await apiClient.get(
        `/api/quality/parameter/${parameterId}/history`,
      );
      return res?.paramObjectsMap?.parameterHistoryVOList || [];
    } catch (error) {
      console.error("Error fetching parameter history:", error);
      throw error;
    }
  },

  /* ================================================================
     PARAMETER MASTER (new, /api/develop endpoints)
     Added for ParameterMasterForm / ParameterMasterList — does not
     touch any of the methods above.
  ================================================================ */

  createUpdateParameterMaster: async (parameterMasterDTO) => {
    try {
      const response = await apiClient.put(
        "/api/develop/createUpdateParameterMaster",
        parameterMasterDTO,
      );

      return response?.data ?? response;
    } catch (error) {
      console.error(
        "Error saving parameter master:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  getParameterMasterById: async (id) => {
    try {
      const response = await apiClient.get(
        "/api/develop/getParameterMasterById",
        {
          params: { id },
        },
      );

      const data = response?.data ?? response;

      return data?.paramObjectsMap?.parameterMasterVO || null;
    } catch (error) {
      console.error(
        "Error fetching parameter master by id:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  getParameterMasterByOrgId: async (orgId) => {
    try {
      const response = await apiClient.get(
        "/api/develop/getParameterMasterByOrgId",
        {
          params: { orgId },
        },
      );

      const data = response?.data ?? response;

      return data?.paramObjectsMap?.parameterMasterResponseVO || [];
    } catch (error) {
      console.error(
        "Error fetching parameter masters:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     PARAMETER TYPE DROPDOWN
     (commonmaster/getListValuesGroup -> "Parameter Master" group)
     This is the dynamic, id-based alternative to the static
     PARAMETER_TYPES array above, used by ParameterMasterForm.
  ================================================================ */

  getParameterTypeOptions: async (orgId) => {
    try {
      const response = await apiClient.get(
        "/api/commonmaster/getListValuesGroup",
        {
          params: {
            listDescription: LIST_GROUP_NAME,
            orgId,
          },
        },
      );

      const data = response?.data ?? response;

      const list = data?.paramObjectsMap?.listValues || [];

      return list.map((item) => ({
        value: item.id,
        label: item.valuesDescription,
      }));
    } catch (error) {
      console.error(
        "Error fetching parameter type options:",
        error?.response?.data || error,
      );

      return [];
    }
  },
};

export default parameterMasterAPI;

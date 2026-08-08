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

export const parameterMasterAPI = {
  getParameters: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/quality/parameter?orgid=${orgId}`
      );
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
        parameterDTO
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
        `/api/quality/parameter/${parameterId}/history`
      );
      return res?.paramObjectsMap?.parameterHistoryVOList || [];
    } catch (error) {
      console.error("Error fetching parameter history:", error);
      throw error;
    }
  },
};

export default parameterMasterAPI;

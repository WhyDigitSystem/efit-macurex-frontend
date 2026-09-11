// instrumentCalibrationAPI.js
import apiClient from "../apiClient";

const instrumentCalibrationAPI = {
  // Get Instrument Calibrations by Organization ID
  getInstrumentCalibrationByOrgId: async (branch, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/vendorComplaintEntry/getInstrumentCalibrationByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      const list = res?.paramObjectsMap?.instrumentCalibrationResponseDTO;
      return Array.isArray(list) ? list : list ? [list] : [];
    } catch (error) {
      console.error("Error fetching instrument calibrations:", error);
      throw error;
    }
  },

  // Get Instrument Calibration by ID
  getInstrumentCalibrationById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/vendorComplaintEntry/getInstrumentCalibrationById?id=${id}`,
      );
      return res?.paramObjectsMap?.instrumentCalibrationResponseDTO || null;
    } catch (error) {
      console.error("Error fetching instrument calibration by ID:", error);
      throw error;
    }
  },

  // Create / Update Instrument Calibration
  createUpdateInstrumentCalibration: async (payload) => {
    try {
      const res = await apiClient.put(
        `/api/vendorComplaintEntry/updateCreateInstrumentCalibration`,
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving instrument calibration:", error);
      throw error;
    }
  },

  // Get Machine/Instrument No options filtered by the selected machine master id
  getMachineNo: async (machineId, branch, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/vendorComplaintEntry/getMachineNoForInstrumentCalibration?branch=${branch}&machineId=${machineId}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.machineDetails || [];
    } catch (error) {
      console.error("Error fetching machine no for instrument calibration:", error);
      throw error;
    }
  },
};

export default instrumentCalibrationAPI;
// instrumentCalibrationAPI.js
import apiClient from "../apiClient";

// Instrument Calibration API
// Mirrors the quality API convention used in this app.
// The backend persists the header, calibration details and summary in a
// single transaction ... (server-side validation).

const instrumentCalibrationAPI = {
  // Get Instrument Calibrations by Organization ID
  getInstrumentCalibrationByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/quality/getInstrumentCalibrationByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      const list = res?.paramObjectsMap?.instrumentCalibrationVO;
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
        `/api/quality/getInstrumentCalibrationById?id=${id}`,
      );
      return res?.paramObjectsMap?.instrumentCalibrationVO || null;
    } catch (error) {
      console.error("Error fetching instrument calibration by ID:", error);
      throw error;
    }
  },

  // Create / Update Instrument Calibration
  createUpdateInstrumentCalibration: async (payload) => {
    try {
      const res = await apiClient.put(
        `/api/quality/updateCreateInstrumentCalibration`,
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving instrument calibration:", error);
      throw error;
    }
  },
};

export default instrumentCalibrationAPI;
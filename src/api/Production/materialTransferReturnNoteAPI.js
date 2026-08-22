// materialTransferReturnNoteAPI.js
import apiClient from "../apiClient";

// Material Transfer/Return Note (MTRN) API
// Mirrors the production API convention used in this app
// (/api/commonmaster/* like ProductionTransferSlip / MaterialIndent).
// The backend persists the header, item transfer details and summary in a
// single transaction (server-side validation).

const materialTransferReturnNoteAPI = {
  // Get MTRN records by Organization ID
  getByOrgId: async (orgId, branchId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getMaterialTransferReturnNoteByOrgId?orgId=${orgId}&branchId=${branchId}`,
      );
      const list =
        res?.paramObjectsMap?.materialTransferReturnNoteList ||
        res?.paramObjectsMap?.mtrnList;
      return Array.isArray(list) ? list : list ? [list] : [];
    } catch (error) {
      console.error("Error fetching material transfer/return notes:", error);
      throw error;
    }
  },

  // Get MTRN record by ID
  getById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getMaterialTransferReturnNoteById?id=${id}`,
      );
      return (
        res?.paramObjectsMap?.materialTransferReturnNoteVO ||
        res?.paramObjectsMap?.mtrnVO ||
        null
      );
    } catch (error) {
      console.error("Error fetching material transfer/return note by ID:", error);
      throw error;
    }
  },

  // Create / Update MTRN record
  createUpdate: async (data) => {
    try {
      const res = await apiClient.post(
        "/api/commonmaster/createUpdateMaterialTransferReturnNote",
        data,
      );
      return res;
    } catch (error) {
      console.error("Error saving material transfer/return note:", error);
      throw error;
    }
  },
};

export default materialTransferReturnNoteAPI;
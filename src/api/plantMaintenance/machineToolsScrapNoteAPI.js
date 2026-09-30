// src/api/plantMaintenance/machineToolsScrapNoteAPI.js
import apiClient from "../apiClient";

const machineToolsScrapNoteAPI = {
  // GET /api/vendorComplaintEntry/getMachineToolsScrapNoteDocId
  getMachineToolsScrapNoteDocId: async (orgId, financialYear) => {
    try {
      const res = await apiClient.get(
        "/api/vendorComplaintEntry/getMachineToolsScrapNoteDocId",
        {
          params: { orgId, financialYear },
        }
      );
      return res?.paramObjectsMap?.docId || "";
    } catch (error) {
      console.error(
        "Error fetching machine tools scrap note doc id:",
        error
      );
      throw error;
    }
  },

  // POST /api/vendorComplaintEntry/updateCreateMachineToolsScrapNote (multipart)
  // Expects a pre-built FormData instance:
  //   - "machineToolsScrapNoteVO"  → JSON blob
  //   - "files"                    → one or more File objects
  updateCreateMachineToolsScrapNote: async (formData) => {
    try {
      const res = await apiClient.post(
        "/api/vendorComplaintEntry/updateCreateMachineToolsScrapNote",
        formData,
        {
          headers: {
            Accept: "application/json",
            // Content-Type is auto-set for FormData in modern axios
          },
        }
      );
      return res;
    } catch (error) {
      console.error(
        "Error creating/updating machine tools scrap note:",
        error
      );
      throw error;
    }
  },

  // GET /api/vendorComplaintEntry/getMachineToolsScrapNoteByOrgId
  getMachineToolsScrapNoteByOrgId: async (branch, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/vendorComplaintEntry/getMachineToolsScrapNoteByOrgId",
        {
          params: { branch, orgId },
        }
      );
      return (
        res?.paramObjectsMap?.machineToolsScrapNoteVO ||
        res?.paramObjectsMap?.machineToolsScrapNoteList ||
        []
      );
    } catch (error) {
      console.error(
        "Error fetching machine tools scrap note list:",
        error
      );
      throw error;
    }
  },

  // GET /api/vendorComplaintEntry/getMachineToolsScrapNoteById
  getMachineToolsScrapNoteById: async (id) => {
    try {
      const res = await apiClient.get(
        "/api/vendorComplaintEntry/getMachineToolsScrapNoteById",
        {
          params: { id },
        }
      );
      return (
        res?.paramObjectsMap?.machineToolsScrapNoteVO || null
      );
    } catch (error) {
      console.error(
        "Error fetching machine tools scrap note by id:",
        error
      );
      throw error;
    }
  },
};

export default machineToolsScrapNoteAPI;
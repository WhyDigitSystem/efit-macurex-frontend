// src/api/TDC/engineeringChangeNoteAPI.js

import apiClient from "../apiClient";

const API_BASE_URL = import.meta.env.VITE_API_URL;

/* ================================================================
   ENGINEERING CHANGE NOTE (ECN) API

   Backend contract (confirmed via swagger):

     GET  /api/engineeringchangenote/getEngineeringChangeNoteById
     GET  /api/engineeringchangenote/getEngineeringChangeNoteByOrgId
     GET  /api/engineeringchangenote/getEngineeringChangeNoteDocId
     PUT  /api/engineeringchangenote/createUpdateEngineeringChangeNote
     GET  /api/engineeringchangenote/viewBomFile/**
     GET  /api/engineeringchangenote/viewDrawingFile/**

   IMPORTANT: the save DTO is FLAT (partNo, docId, docDate,
   expectedDateOfCompletion, acceptedByPURMgr, controlPlanReviewedAndUpdated,
   etc.) plus a small set of array sub-DTOs:

     changeRequiredDTO:    [{ anyChanges, estimatedCost, fixtures, leadTime }]
     processChangesDTO:    [{ processChange, layOut, actions, estimatedCost, leadTime }]
     inspectionTestingDTO: [{ newGauge, estimatedCost, leadTime }]
     documentsDTO:         [{ drawing, partNo, issue, remarks }]
     documentsChangesDTO:  [{ stationNo, sopNo, completionDate, remarks }]
     remarksDTO:           [{ indicate1, indicate2 }]

   This does NOT match the nested shape (partDetails / storesLogistics /
   stockAt / validation / cft) the form currently builds internally — the
   form's save handler needs to be remapped to this flat shape before
   calling createUpdateEcn.
================================================================ */

const engineeringChangeNoteAPI = {
  /* ================================================================
     CREATE / UPDATE
  ================================================================ */

  /* ================================================================
   CREATE / UPDATE ENGINEERING CHANGE NOTE
================================================================ */

  createUpdateEcn: async (ecnData, files = []) => {
    try {
      const formData = new FormData();

      const engineeringChangeNoteBlob = new Blob([JSON.stringify(ecnData)], {
        type: "application/json",
      });

      formData.append(
        "engineeringChangeNote",
        engineeringChangeNoteBlob,
        "engineeringChangeNoteDTO.json",
      );

      files.forEach((file) => {
        if (file) {
          formData.append("files", file, file.name);
        }
      });

      const response = await apiClient.put(
        `${API_BASE_URL}/api/engineeringchangenote/createUpdateEngineeringChangeNote`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return response?.data ?? response;
    } catch (error) {
      console.error(
        "Error saving engineering change note:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     GET BY ID
  ================================================================ */

  getEcnById: async (id) => {
    try {
      const response = await apiClient.get(
        `/api/engineeringchangenote/getEngineeringChangeNoteById`,
        {
          params: {
            id,
          },
        },
      );

      return response?.data ?? response;
    } catch (error) {
      console.error(
        "Error fetching engineering change note:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     GET BY ORG / BRANCH
  ================================================================ */

  getEcnByOrgId: async (orgId, branch) => {
    try {
      const response = await apiClient.get(
        `/api/engineeringchangenote/getEngineeringChangeNoteByOrgId`,
        {
          params: {
            branch,
            orgId,
          },
        },
      );

      const data = response?.data ?? response;

      const list =
        data?.paramObjectsMap?.engineeringChangeNoteVO ||
        data?.paramObjectsMap?.mapp ||
        data?.paramObjectsMap?.engineeringChangeNoteEntryVO ||
        (Array.isArray(data) ? data : []);

      return Array.isArray(list) ? list : [];
    } catch (error) {
      console.error(
        "Error fetching engineering change notes:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     DOCUMENT NUMBER
  ================================================================ */

  getEcnDocId: async ({ financialYear, orgId }) => {
    try {
      const response = await apiClient.get(
        `/api/engineeringchangenote/getEngineeringChangeNoteDocId`,
        {
          params: {
            financialYear,
            orgId,
          },
        },
      );

      const data = response?.data ?? response;

      return data?.paramObjectsMap?.engineeringChangeNoteDocId || "";
    } catch (error) {
      console.error(
        "Error fetching engineering change note doc id:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     VIEW ATTACHMENTS
  ================================================================ */

  getViewDrawingFileUrl: (filePath) => {
    if (!filePath) {
      return "";
    }

    const cleanPath = String(filePath).replace(/^\/+/, "");

    return `${API_BASE_URL}/api/engineeringchangenote/viewDrawingFile/${cleanPath}`;
  },

  getViewBomFileUrl: (filePath) => {
    if (!filePath) {
      return "";
    }

    const cleanPath = String(filePath).replace(/^\/+/, "");

    return `${API_BASE_URL}/api/engineeringchangenote/viewBomFile/${cleanPath}`;
  },
};

export default engineeringChangeNoteAPI;

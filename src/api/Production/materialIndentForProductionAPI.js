// src/api/Production/materialIndentForProductionAPI.js

import apiClient from "../apiClient";

/* ================================================================
   MATERIAL INDENT FOR PRODUCTION API

   Confirmed endpoints (swagger):

     GET  /api/purchaseOrder/getMaterialIndentForProductionById
     GET  /api/purchaseOrder/getMaterialIndentForProductionByOrgId
     GET  /api/purchaseOrder/getMaterialIndentForProductionDocId
     GET  /api/purchaseOrder/getFgAndSfgItemDetailsFromMaterial
     GET  /api/purchaseOrder/getFgAndSfgItemDetailsFromMaterialDetails
     GET  /api/efitmaster/getAllDepartmentByOrgId
     GET  /api/efitmaster/getEmployeeMasterByOrgId
     GET  /api/commonmaster/getUnitMasterByOrgId
     GET  /api/commonmaster/getListValuesGroup

   NOTE: no create/update endpoint appeared in the swagger pages shared,
   so createUpdateMaterialIndent below targets the conventional path for
   this controller. If the real one differs, only that one URL needs
   changing — the payload shape is built in the form.
================================================================ */

const materialIndentForProductionAPI = {
  /* ================================================================
     CREATE / UPDATE
  ================================================================ */

  createUpdateMaterialIndent: async (payload) => {
    try {
      const response = await apiClient.put(
        "/api/purchaseOrder/createUpdateMaterialIndentForProduction",
        payload,
      );

      return response?.data ?? response;
    } catch (error) {
      console.error(
        "Error saving material indent:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     GET BY ID
  ================================================================ */

  getMaterialIndentById: async (id) => {
    try {
      const response = await apiClient.get(
        "/api/purchaseOrder/getMaterialIndentForProductionById",
        {
          params: { id },
        },
      );

      const data = response?.data ?? response;

      const record =
        data?.paramObjectsMap?.materialIndentForProductionResponseVO ||
        data?.paramObjectsMap?.materialIndentForProductionVO ||
        data?.paramObjectsMap?.mapp;

      /* Some backends return the single record as a one-item array under
         the same key as the list endpoint - unwrap it either way. */
      if (Array.isArray(record)) return record[0] || null;

      return record || null;
    } catch (error) {
      console.error(
        "Error fetching material indent:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     GET BY ORG / BRANCH
  ================================================================ */

  getMaterialIndentsByOrgId: async (orgId, branch) => {
    try {
      const response = await apiClient.get(
        "/api/purchaseOrder/getMaterialIndentForProductionByOrgId",
        {
          params: { branch, orgId },
        },
      );

      const data = response?.data ?? response;

      const list =
        data?.paramObjectsMap?.materialIndentForProductionResponseVO ||
        data?.paramObjectsMap?.materialIndentForProductionVO ||
        data?.paramObjectsMap?.mapp ||
        (Array.isArray(data) ? data : []);

      return Array.isArray(list) ? list : [];
    } catch (error) {
      console.error(
        "Error fetching material indents:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     DOCUMENT NUMBER
  ================================================================ */

  getMaterialIndentDocId: async ({ financialYear, orgId }) => {
    try {
      const response = await apiClient.get(
        "/api/purchaseOrder/getMaterialIndentForProductionDocId",
        {
          params: { financialYear, orgId },
        },
      );

      const data = response?.data ?? response;

      return data?.paramObjectsMap?.materialIndentForProductionDocId || "";
    } catch (error) {
      console.error(
        "Error fetching material indent doc id:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     FG / SFG HEADER ROWS

     Drives Sch. Order No (docId), FG/SFG Item Code (itemCode),
     Item Description (itemDescription) and Scheduled Date (docDate).
     Each row carries the fgItemId used to fetch the detail lines.
  ================================================================ */

  getFgAndSfgItemDetails: async (branch, orgId) => {
    try {
      const response = await apiClient.get(
        "/api/purchaseOrder/getFgAndSfgItemDetailsFromMaterial",
        {
          params: { branch, orgId },
        },
      );

      const data = response?.data ?? response;

      const list = data?.paramObjectsMap?.mapp || [];

      return Array.isArray(list) ? list : [];
    } catch (error) {
      console.error(
        "Error fetching FG/SFG item details:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     FG / SFG DETAIL LINES

     Called with the fgItemId taken from the header row above.
     Returns the item rows: { itemId, itemCode, qty, itemDescription }
  ================================================================ */

  getFgAndSfgItemDetailLines: async (branch, fgItem, orgId) => {
    try {
      const response = await apiClient.get(
        "/api/purchaseOrder/getFgAndSfgItemDetailsFromMaterialDetails",
        {
          params: { branch, fgItem, orgId },
        },
      );

      const data = response?.data ?? response;

      const list = data?.paramObjectsMap?.mapp || [];

      return Array.isArray(list) ? list : [];
    } catch (error) {
      console.error(
        "Error fetching FG/SFG detail lines:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     DEPARTMENTS
  ================================================================ */

  getDepartments: async (orgId) => {
    try {
      const response = await apiClient.get(
        "/api/efitmaster/getAllDepartmentByOrgId",
        {
          params: { orgId },
        },
      );

      const data = response?.data ?? response;

      const list = data?.paramObjectsMap?.departmentVO || [];

      return Array.isArray(list) ? list : [];
    } catch (error) {
      console.error(
        "Error fetching departments:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     EMPLOYEES (Prepared By / Authorised By)
  ================================================================ */

  getEmployees: async (orgId) => {
    try {
      const response = await apiClient.get(
        "/api/efitmaster/getEmployeeMasterByOrgId",
        {
          params: { orgId },
        },
      );

      const data = response?.data ?? response;

      const list = data?.paramObjectsMap?.employeeMasterVO || [];

      return Array.isArray(list) ? list : [];
    } catch (error) {
      console.error(
        "Error fetching employees:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     UNITS
  ================================================================ */

  getUnits: async (orgId) => {
    try {
      const response = await apiClient.get(
        "/api/commonmaster/getUnitMasterByOrgId",
        {
          params: { orgId },
        },
      );

      const data = response?.data ?? response;

      const list = data?.paramObjectsMap?.unitMasterList || [];

      return Array.isArray(list) ? list : [];
    } catch (error) {
      console.error("Error fetching units:", error?.response?.data || error);

      throw error;
    }
  },

  /* ================================================================
     LIST OF VALUES (Belongs To, etc.)
  ================================================================ */

  getListValuesGroup: async (listDescription, orgId) => {
    try {
      const response = await apiClient.get(
        "/api/commonmaster/getListValuesGroup",
        {
          params: { listDescription, orgId },
        },
      );

      const data = response?.data ?? response;

      const list = data?.paramObjectsMap?.listValues || [];

      return Array.isArray(list) ? list : [];
    } catch (error) {
      console.error(
        `Error fetching list values for "${listDescription}":`,
        error?.response?.data || error,
      );

      throw error;
    }
  },
};

export default materialIndentForProductionAPI;

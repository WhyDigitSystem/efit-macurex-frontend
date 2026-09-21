import apiClient from "../apiClient";

/* BOM Correction Request/Note API */
const bomCorrectionRequestAPI = {
  getDocId: async ({ financialYear, orgId }) => {
    try {
      const res = await apiClient.get(
        `/api/subContract/getBomCorrectionRequestNoteDocId?financialYear=${financialYear}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.bomCorrectionRequestNoteDocId || "";
    } catch (error) {
      console.error("Error fetching BOM Correction Request DocId:", error);
      throw error;
    }
  },

  getFGItems: async (branch, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/subContract/getFGItemsforBOMCorrectionRequestNote?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.itemDetails || [];
    } catch (error) {
      console.error("Error fetching FG items:", error);
      throw error;
    }
  },

  getAllItemsNotFG: async (branch, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/subContract/getAllItemsNotFGforBOMCorrectionRequestNote?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.itemDetails || [];
    } catch (error) {
      console.error("Error fetching non-FG items:", error);
      throw error;
    }
  },

  getEmployeesByDepartment: async ({ branch, department, orgId }) => {
    try {
      const res = await apiClient.get(
        `/api/subContract/getEmployeesByDepartmentforBOMCorrectionRequestNote?branch=${branch}&department=${encodeURIComponent(
          department,
        )}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.employeeList || [];
    } catch (error) {
      console.error(
        `Error fetching employees for department ${department}:`,
        error,
      );
      throw error;
    }
  },

  getByOrgIdAndBranch: async ({ branch, orgId }) => {
    try {
      const res = await apiClient.get(
        `/api/subContract/getBomCorrectionRequestNoteByOrgIdAndBranch?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.bomCorrectionRequestNote || [];
    } catch (error) {
      console.error(
        "Error fetching BOM correction requests by org & branch:",
        error,
      );
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/subContract/getBomCorrectionRequestNoteById?id=${id}`,
      );
      return res?.paramObjectsMap?.bomCorrectionRequestNote || null;
    } catch (error) {
      console.error("Error fetching BOM correction request by id:", error);
      throw error;
    }
  },

  createUpdate: async (data) => {
    try {
      const res = await apiClient.put(
        "/api/subContract/createUpdateBomCorrectionRequestNote",
        data,
      );
      return res;
    } catch (error) {
      console.error("Error saving BOM correction request:", error);
      throw error;
    }
  },
};

export default bomCorrectionRequestAPI;
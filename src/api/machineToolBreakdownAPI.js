// src/api/machineToolBreakdownAPI.js
import apiClient from "./apiClient";

const machineToolBreakdownAPI = {
  // GET /api/commonmaster/getBranchByOrgId
  getBranchByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get("/api/commonmaster/getBranchByOrgId", {
        params: { orgId },
      });
      return res?.paramObjectsMap?.branchList || [];
    } catch (error) {
      console.error("Error fetching branches:", error);
      throw error;
    }
  },

  // GET /api/efitmaster/getAllDepartmentByOrgId
  getAllDepartmentByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        "/api/efitmaster/getAllDepartmentByOrgId",
        {
          params: { orgId },
        }
      );
      return res?.paramObjectsMap?.departmentVO || [];
    } catch (error) {
      console.error("Error fetching departments:", error);
      throw error;
    }
  },

  // GET /api/develop/getToolCategoryByOrgId
  getToolCategoryByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        "/api/develop/getToolCategoryByOrgId",
        {
          params: { orgId },
        }
      );
      return res?.paramObjectsMap?.toolCategoryResponseVO || [];
    } catch (error) {
      console.error("Error fetching tool categories:", error);
      throw error;
    }
  },

  // GET /api/efitmaster/getEmployeeMasterByOrgId
  getEmployeeMasterByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        "/api/efitmaster/getEmployeeMasterByOrgId",
        {
          params: { orgId },
        }
      );
      return res?.paramObjectsMap?.employeeMasterVO || [];
    } catch (error) {
      console.error("Error fetching employees:", error);
      throw error;
    }
  },

  // GET /api/vendorComplaintEntry/getMachineToolForBreakdown
  getMachineToolForBreakdown: async (toolCategoryId, orgId, branch) => {
    try {
      const res = await apiClient.get(
        "/api/vendorComplaintEntry/getMachineToolForBreakdown",
        {
          params: { toolCategoryId, orgId, branch },
        }
      );
      return res?.paramObjectsMap?.machineToolList || [];
    } catch (error) {
      console.error("Error fetching machine tools for breakdown:", error);
      throw error;
    }
  },

  // GET /api/vendorComplaintEntry/getMachineToolBreakdownDocId
  getMachineToolBreakdownDocId: async (orgId, financialYear) => {
    try {
      const res = await apiClient.get(
        "/api/vendorComplaintEntry/getMachineToolBreakdownDocId",
        {
          params: { orgId, financialYear },
        }
      );
      return res?.paramObjectsMap?.docId || "";
    } catch (error) {
      console.error("Error fetching machine tool breakdown doc id:", error);
      throw error;
    }
  },

  // GET /api/vendorComplaintEntry/getMachineToolBreakdownByOrgId
  getMachineToolBreakdownByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        "/api/vendorComplaintEntry/getMachineToolBreakdownByOrgId",
        {
          params: { orgId, branch },
        }
      );
      return res?.paramObjectsMap?.machineToolBreakdownList || [];
    } catch (error) {
      console.error("Error fetching machine tool breakdown list:", error);
      throw error;
    }
  },

  // GET /api/vendorComplaintEntry/getMachineToolBreakdownById
  getMachineToolBreakdownById: async (id) => {
    try {
      const res = await apiClient.get(
        "/api/vendorComplaintEntry/getMachineToolBreakdownById",
        {
          params: { id },
        }
      );
      return res?.paramObjectsMap?.machineToolBreakdownVO || null;
    } catch (error) {
      console.error("Error fetching machine tool breakdown by ID:", error);
      throw error;
    }
  },

  // POST /api/vendorComplaintEntry/updateCreateMachineToolBreakdown
  updateCreateMachineToolBreakdown: async (payload, imageFile = null) => {
    try {
      const formData = new FormData();

      const jsonBlob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });

      formData.append(
        "machineToolBreakdownVO",
        jsonBlob,
        "machineToolBreakdownDTO.json"
      );

      if (imageFile instanceof File) {
        formData.append("images", imageFile);
      }

      const res = await apiClient.post(
        "/api/vendorComplaintEntry/updateCreateMachineToolBreakdown",
        formData,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      return res;
    } catch (error) {
      console.error("Error creating/updating machine tool breakdown:", error);
      throw error;
    }
  },

  // GET /api/commonmaster/getListValuesGroup
  getListValuesGroup: async (listDescription, orgId) => {
    try {
      const res = await apiClient.get("/api/commonmaster/getListValuesGroup", {
        params: { listDescription, orgId },
      });
      return res?.paramObjectsMap?.listValues || [];
    } catch (error) {
      console.error("Error fetching list values group:", error);
      throw error;
    }
  },
};

export default machineToolBreakdownAPI;
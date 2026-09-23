// src/api/machineToolBreakdownAPI.js
import axios from "axios";

const BASE_URL = "http://192.168.0.9:8013/api";

const machineToolBreakdownAPI = {
  // GET /api/commonmaster/getBranchByOrgId
  getBranchByOrgId: async (orgId) => {
    const response = await axios.get(
      `${BASE_URL}/commonmaster/getBranchByOrgId`,
      {
        params: { orgId },
      },
    );

    return response.data?.paramObjectsMap?.branchList || [];
  },

  // GET /api/efitmaster/getAllDepartmentByOrgId
  getAllDepartmentByOrgId: async (orgId) => {
    const response = await axios.get(
      `${BASE_URL}/efitmaster/getAllDepartmentByOrgId`,
      {
        params: { orgId },
      },
    );

    return response.data?.paramObjectsMap?.departmentVO || [];
  },

  // GET /api/develop/getToolCategoryByOrgId
  getToolCategoryByOrgId: async (orgId) => {
    const response = await axios.get(
      `${BASE_URL}/develop/getToolCategoryByOrgId`,
      {
        params: { orgId },
      },
    );

    return response.data?.paramObjectsMap?.toolCategoryResponseVO || [];
  },

  // GET /api/efitmaster/getEmployeeMasterByOrgId
  getEmployeeMasterByOrgId: async (orgId) => {
    const response = await axios.get(
      `${BASE_URL}/efitmaster/getEmployeeMasterByOrgId`,
      {
        params: { orgId },
      },
    );

    return response.data?.paramObjectsMap?.employeeMasterVO || [];
  },

  // GET /api/vendorComplaintEntry/getMachineToolForBreakdown
  getMachineToolForBreakdown: async (toolCategoryId, orgId, branch) => {
    const response = await axios.get(
      `${BASE_URL}/vendorComplaintEntry/getMachineToolForBreakdown`,
      {
        params: {
          toolCategoryId,
          orgId,
          branch,
        },
      },
    );

    return response.data?.paramObjectsMap?.machineToolList || [];
  },

  // GET /api/vendorComplaintEntry/getMachineToolBreakdownDocId
  getMachineToolBreakdownDocId: async (orgId, financialYear) => {
    const response = await axios.get(
      `${BASE_URL}/vendorComplaintEntry/getMachineToolBreakdownDocId`,
      {
        params: {
          orgId,
          financialYear,
        },
      },
    );

    return response.data?.paramObjectsMap?.docId || "";
  },

  // GET /api/vendorComplaintEntry/getMachineToolBreakdownByOrgId
  getMachineToolBreakdownByOrgId: async (orgId, branch) => {
    const response = await axios.get(
      `${BASE_URL}/vendorComplaintEntry/getMachineToolBreakdownByOrgId`,
      {
        params: {
          orgId,
          branch,
        },
      },
    );

    return response.data?.paramObjectsMap?.machineToolBreakdownList || [];
  },

  // GET /api/vendorComplaintEntry/getMachineToolBreakdownById
  getMachineToolBreakdownById: async (id) => {
    const response = await axios.get(
      `${BASE_URL}/vendorComplaintEntry/getMachineToolBreakdownById`,
      {
        params: { id },
      },
    );

    return response.data?.paramObjectsMap?.machineToolBreakdownVO || null;
  },

  updateCreateMachineToolBreakdown: async (payload, imageFile = null) => {
    try {
      const formData = new FormData();

      const jsonBlob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });

      formData.append(
        "machineToolBreakdownVO",
        jsonBlob,
        "machineToolBreakdownDTO.json",
      );

      if (imageFile instanceof File) {
        formData.append("images", imageFile);
      }

      const response = await axios.post(
        `${BASE_URL}/vendorComplaintEntry/updateCreateMachineToolBreakdown`,
        formData,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error(
        "Machine Tool Breakdown API Error:",
        error.response?.data || error.message,
      );

      throw error;
    }
  },
  // GET /api/commonmaster/getListValuesGroup
  getListValuesGroup: async (listDescription, orgId) => {
    const response = await axios.get(
      `${BASE_URL}/commonmaster/getListValuesGroup`,
      {
        params: {
          listDescription,
          orgId,
        },
      },
    );

    return response.data?.paramObjectsMap?.listValues || [];
  },
};

export default machineToolBreakdownAPI;

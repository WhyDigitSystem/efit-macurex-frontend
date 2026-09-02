import apiClient from "../apiClient";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const toolsFixtureAPI = {
  createUpdateToolMaster: async (toolMasterData, files = []) => {
    try {
      const formData = new FormData();

      const toolMasterBlob = new Blob([JSON.stringify(toolMasterData)], {
        type: "application/json",
      });

      formData.append("toolMaster", toolMasterBlob, "toolMasterDTO.json");

      files.forEach((file) => {
        if (file) {
          formData.append("files", file, file.name);
        }
      });

      const response = await apiClient.post(
        `${API_BASE_URL}/api/toolmaster/updateCreateToolMaster`,
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
        "Error saving Tool/Fixture:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     GET TOOL / FIXTURE BY ID

     Swagger: GET /api/toolmaster/getToolMasterById?id=...
  ================================================================ */

  getToolMasterById: async (id) => {
    try {
      const response = await apiClient.get(
        `/api/toolmaster/getToolMasterById`,
        {
          params: {
            id,
          },
        },
      );

      return response?.data ?? response;
    } catch (error) {
      console.error(
        "Error fetching Tool/Fixture:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     GET TOOL / FIXTURE LIST BY ORG

     Swagger: GET /api/toolmaster/getToolMasterByOrgId?branch=...&orgId=...
  ================================================================ */

  getToolMasterByOrgId: async (branch, orgId) => {
    try {
      const response = await apiClient.get(
        `/api/toolmaster/getToolMasterByOrgId`,
        {
          params: {
            branch,
            orgId,
          },
        },
      );

      return response?.data ?? response;
    } catch (error) {
      console.error(
        "Error fetching Tool/Fixture list:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     VIEW ATTACHMENT

     NOTE: This path is not in the swagger doc you shared (only the
     three endpoints above were). It's guessed to mirror
     purchaseOrderAPI.getViewFileUrl — confirm the real path on your
     backend and adjust if it differs.
  ================================================================ */

  getViewFileUrl: (filePath) => {
    if (!filePath) {
      return "";
    }

    const cleanPath = String(filePath).replace(/^\/+/, "");

    return `${API_BASE_URL}/api/toolmaster/viewFile/${cleanPath}`;
  },
};

export default toolsFixtureAPI;

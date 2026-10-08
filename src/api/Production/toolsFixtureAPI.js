import apiClient from "../apiClient";

const toolsFixtureAPI = {
  createUpdateToolMaster: async (toolMasterData, files = []) => {
    try {
      const formData = new FormData();

      const toolMasterBlob = new Blob([JSON.stringify(toolMasterData)], {
        type: "application/json",
      });

      formData.append("toolMasterVO", toolMasterBlob, "toolMasterVO.json");

      if (Array.isArray(files)) {
        files.forEach((file) => {
          if (file instanceof File) {
            formData.append("files", file, file.name);
          }
        });
      }

      const response = await apiClient.post(
        "/api/toolmaster/updateCreateToolMaster",
        formData,
      );

      return response?.data ?? response;
    } catch (error) {
      console.error("================ TOOL MASTER SAVE ERROR ================");
      console.error("Status:", error?.response?.status);
      console.error("Data:", error?.response?.data);
      console.error("Message:", error?.message);
      console.error("Request URL:", error?.config?.url);

      throw error;
    }
  },

  getToolMasterById: async (id) => {
    const response = await apiClient.get("/api/toolmaster/getToolMasterById", {
      params: { id },
    });

    return response?.data ?? response;
  },

  getToolMasterByOrgId: async (branch, orgId) => {
    const response = await apiClient.get(
      "/api/toolmaster/getToolMasterByOrgId",
      {
        params: {
          branch,
          orgId,
        },
      },
    );

    return response?.data ?? response;
  },

  getLocationForToolMaster: async (branch, orgId) => {
    const response = await apiClient.get(
      "/api/toolmaster/getLocationForToolMaster",
      {
        params: {
          branch,
          orgId,
        },
      },
    );

    return response?.data ?? response;
  },

  /*
   * PM Check List Master (used for "PM Check List No" on the Tools tab)
   * GET /api/vendorComplaintEntry/getPMCheckListMasterByOrgId?branch=..&orgId=..
   *
   * Response: paramObjectsMap.pmCheckListMasterVO = [
   *   { id, pmCheckListNo, branch, department, ... }
   * ]
   */
  getPMCheckListMasterByOrgId: async (branch, orgId) => {
    const response = await apiClient.get(
      "/api/vendorComplaintEntry/getPMCheckListMasterByOrgId",
      {
        params: {
          branch,
          orgId,
        },
      },
    );

    return response?.data ?? response;
  },

  getViewFileUrl: (filePath) => {
    if (!filePath) return "";

    const cleanPath = String(filePath).replace(/\\/g, "/").replace(/^\/+/, "");

    /*
     * API_BASE_URL was referenced here but never defined/imported,
     * which throws a ReferenceError when attachments are mapped on
     * edit. Use the axios client's baseURL instead.
     */
    const baseUrl = String(apiClient?.defaults?.baseURL || "").replace(
      /\/+$/,
      "",
    );

    return `${baseUrl}/api/toolmaster/viewFile/${cleanPath}`;
  },
};

export default toolsFixtureAPI;

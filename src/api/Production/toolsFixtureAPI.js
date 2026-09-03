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

      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(key, "FILE:", value.name, value.type, value.size);
        } else {
          console.log(key, value);
        }
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
      console.error("Request Headers:", error?.config?.headers);

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

  getViewFileUrl: (filePath) => {
    if (!filePath) return "";

    const cleanPath = String(filePath).replace(/\\/g, "/").replace(/^\/+/, "");

    return `${API_BASE_URL}/api/toolmaster/viewFile/${cleanPath}`;
  },
};

export default toolsFixtureAPI;

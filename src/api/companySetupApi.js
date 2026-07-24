// companySetupApi.js
import apiClient from "./apiClient";

export const companySetupAPI = {
  // Get Company by ID
  getCompanyById: async (companyId) => {
    try {
      const res = await apiClient.get(`/api/commonmaster/company/${companyId}`);
      return res?.paramObjectsMap?.companyVO?.[0] || null;
    } catch (error) {
      console.error("Error fetching company by ID:", error);
      throw error;
    }
  },

  // Update Company
  updateCompany: async (companyDTO) => {
    try {
      const res = await apiClient.put(
        "/api/commonmaster/updateCompany",
        companyDTO,
      );
      return res;
    } catch (error) {
      console.error("Error updating company:", error);
      throw error;
    }
  },
  // Create / Update Branch
  createUpdateBranch: async (branchDTO) => {
    try {
      const res = await apiClient.post(
        "/api/commonmaster/createUpdateBranch",
        branchDTO,
      );
      return res;
    } catch (error) {
      console.error("Error creating/updating branch:", error);
      throw error;
    }
  },
  // Upload Company Logo
  uploadCompanyLogo: async (id, file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await apiClient.post(
        `/api/commonmaster/uploadCompanyLogoInBloob?id=${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return res;
    } catch (error) {
      console.error("Error uploading company logo:", error);
      throw error;
    }
  },
};

export default companySetupAPI;

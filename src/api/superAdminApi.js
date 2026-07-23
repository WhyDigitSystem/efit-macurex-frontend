import apiClient from "./apiClient";

export const superAdminAPI = {
  getCompanies: async () => {
    try {
      const res = await apiClient.get("/api/commonmaster/company");
      return res?.paramObjectsMap?.companyVO || [];
    } catch (error) {
      console.error("Error fetching companies:", error);
      throw error;
    }
  },

  createCompany: async (companyDTO) => {
    try {
      const res = await apiClient.post("/api/commonmaster/company", companyDTO);
      return res;
    } catch (error) {
      console.error("Error creating company:", error);
      throw error;
    }
  },
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
};

export default superAdminAPI;

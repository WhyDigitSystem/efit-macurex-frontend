import apiClient from "../apiClient";

/* ------------------------------------------------------------------ */
/* Applicable For — loaded from list-of-values                        */

export const APPLICABLE_FOR_LIST_NAME = "BMCATEGORY";

/* ------------------------------------------------------------------ */

export const categoryMasterAPI = {
  /* ---------------- List by Org ---------------- */
  getByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/vendorComplaintEntry/getCategoryMasterByOrgId?orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.categoryMasterVO || [];
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },

  /* ---------------- Get by Id ---------------- */
  getById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/vendorComplaintEntry/getCategoryMasterById?id=${id}`,
      );
      return res?.paramObjectsMap?.categoryMasterVO || null;
    } catch (error) {
      console.error("Error fetching category by id:", error);
      throw error;
    }
  },

  /* ---------------- Save (create / update) ---------------- */
  createUpdateCategory: async (categoryDTO) => {
    try {
      const res = await apiClient.put(
        "/api/vendorComplaintEntry/updateCreateCategoryMaster",
        categoryDTO,
      );
      return res;
    } catch (error) {
      console.error("Error creating/updating category:", error);
      throw error;
    }
  },

  /* ---------------- Kept for back-compat ---------------- */
  getCategories: async (orgId) => {
    return categoryMasterAPI.getByOrgId(orgId);
  },
  getCategoryById: async (categoryId) => {
    return categoryMasterAPI.getById(categoryId);
  },
};

export default categoryMasterAPI;
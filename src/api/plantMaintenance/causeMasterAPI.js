import apiClient from "../apiClient";

/* ------------------------------------------------------------------ */
/* Maintenance Type — loaded from list-of-values                      */

export const MAINTENANCE_TYPE_LIST_NAME = "MAINTENANCE TYPE FOR CAUSE";

/* ------------------------------------------------------------------ */

export const causeMasterAPI = {
  /* ---------------- List-of-values (for Maintenance Type) ---------------- */
  getListValuesGroup: async (listDescription, orgId) => {
    try {
      const res = await apiClient.get("/api/commonmaster/getListValuesGroup", {
        params: { listDescription, orgId },
      });
      return res?.paramObjectsMap?.listValues || [];
    } catch (error) {
      console.error(
        `Error fetching list values group "${listDescription}":`,
        error,
      );
      throw error;
    }
  },

  /* ---------------- List causes by org ---------------- */
  getByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/vendorComplaintEntry/getCauseMasterByOrgId?orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.causeMasterVO || [];
    } catch (error) {
      console.error("Error fetching causes:", error);
      throw error;
    }
  },

  /* ---------------- Get by id ---------------- */
  getById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/vendorComplaintEntry/getCauseMasterById?id=${id}`,
      );
      return res?.paramObjectsMap?.causeMasterVO || null;
    } catch (error) {
      console.error("Error fetching cause by ID:", error);
      throw error;
    }
  },

  /* ---------------- Save (create / update) ---------------- */
  createUpdateCause: async (causeDTO) => {
    try {
      const res = await apiClient.put(
        "/api/vendorComplaintEntry/updateCreateCauseMaster",
        causeDTO,
      );
      return res;
    } catch (error) {
      console.error("Error creating/updating cause:", error);
      throw error;
    }
  },

  /* ---------------- Back-compat aliases ---------------- */
  getCauses: async (orgId) => {
    return causeMasterAPI.getByOrgId(orgId);
  },
  getCauseById: async (id) => {
    return causeMasterAPI.getById(id);
  },
};

export default causeMasterAPI;
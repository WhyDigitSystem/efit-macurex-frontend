import apiClient from "../apiClient";

const purchaseContractAmendmentAPI = {
  /** GET /api/develop/getPurchaseContractAmendmentByOrgId (branch, orgId) */
  getAll: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        "/api/develop/getPurchaseContractAmendmentByOrgId",
        { params: { branch: Number(branch), orgId: Number(orgId) } },
      );
      return res?.paramObjectsMap?.purchaseContractAmendmentResponseVO || [];
    } catch (error) {
      console.error(
        "Error fetching PC amendments:",
        error?.response?.data || error,
      );
      throw error;
    }
  },

  /** GET /api/develop/getPurchaseContractAmendmentById (id) */
  getById: async (id) => {
    try {
      const res = await apiClient.get(
        "/api/develop/getPurchaseContractAmendmentById",
        { params: { id: Number(id) } },
      );
      return res?.paramObjectsMap?.purchaseContractAmendmentResponseVO || null;
    } catch (error) {
      console.error(
        "Error fetching PC amendment by id:",
        error?.response?.data || error,
      );
      throw error;
    }
  },

  /** GET /api/develop/getPurchaseContractAmendmentDocId (financialYear, orgId) */
  getDocId: async ({ financialYear, orgId }) => {
    try {
      const res = await apiClient.get(
        "/api/develop/getPurchaseContractAmendmentDocId",
        { params: { financialYear, orgId: Number(orgId) } },
      );
      return res?.paramObjectsMap?.purchaseContractAmendmentDocId || "";
    } catch (error) {
      console.error(
        "Error fetching PC amendment doc id:",
        error?.response?.data || error,
      );
      throw error;
    }
  },

  /** GET /api/develop/getContractNoDropdownforPurchaseContractAmendment */
  getContractNoDropdown: async ({ branch, customerId, orgId }) => {
    try {
      const res = await apiClient.get(
        "/api/develop/getContractNoDropdownforPurchaseContractAmendment",
        {
          params: {
            branch: Number(branch),
            customerId: Number(customerId),
            orgId: Number(orgId),
          },
        },
      );
      return res?.paramObjectsMap?.contractList || [];
    } catch (error) {
      console.error(
        "Error fetching contract dropdown:",
        error?.response?.data || error,
      );
      throw error;
    }
  },

  /**
   * GET /api/develop/getPurchaseContractAmendmentItemCodeDropdown
   * Backend expects the contract number as `docId`.
   */
  getItemCodeDropdown: async (branch, docId, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/develop/getPurchaseContractAmendmentItemCodeDropdown",
        { params: { branch: Number(branch), docId, orgId: Number(orgId) } },
      );
      return res?.paramObjectsMap?.itemCodeList || [];
    } catch (error) {
      console.error(
        "Error fetching item code dropdown:",
        error?.response?.data || error,
      );
      throw error;
    }
  },

  /**
   * PUT /api/develop/createUpdatePurchaseContractAmendment
   * Backend consumes multipart/form-data:
   *   part "purchaseContractAmendment" = JSON, part "files" = optional files.
   * Do NOT set Content-Type manually; the browser adds the boundary.
   */
  createUpdate: async (formData) => {
    try {
      if (!(formData instanceof FormData)) {
        throw new Error(
          "Purchase Contract Amendment request must be FormData.",
        );
      }
      return await apiClient.put(
        "/api/develop/createUpdatePurchaseContractAmendment",
        formData,
      );
    } catch (error) {
      console.error(
        "Error saving PC amendment:",
        error?.response?.data || error,
      );
      throw error;
    }
  },

  /** GET /api/efitmaster/getEmployeeMasterByOrgId (orgId) */
  getEmployeesByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        "/api/efitmaster/getEmployeeMasterByOrgId",
        {
          params: { orgId: Number(orgId) },
        },
      );
      return res?.paramObjectsMap?.employeeMasterVO || [];
    } catch (error) {
      console.error(
        "Error fetching employees:",
        error?.response?.data || error,
      );
      throw error;
    }
  },

  /** GET /api/commonmaster/getListValuesGroup */
  getListValuesGroup: async (listDescription, orgId) => {
    try {
      const res = await apiClient.get("/api/commonmaster/getListValuesGroup", {
        params: { listDescription, orgId: Number(orgId) },
      });
      return res?.paramObjectsMap?.listValues || [];
    } catch (error) {
      console.error(
        "Error fetching list values:",
        error?.response?.data || error,
      );
      throw error;
    }
  },
};

export default purchaseContractAmendmentAPI;

import apiClient from "../apiClient";

const BASE = "/api/vendorComplaintEntry";

const supplierResponseAPI = {
  getComplaintNoDropdown: async (orgId) => {
    try {
      const res = await apiClient.get(
        `${BASE}/getComplaintNoDropdownForSupplierResponseEntry`,
        {
          params: {
            orgId: Number(orgId),
          },
        },
      );

      return res?.paramObjectsMap?.complaintList || [];
    } catch (error) {
      return [];
    }
  },

  getItemDropDownForSupplierResponseEntry: async (
    branch,
    orgId,
    supplierId,
  ) => {
    try {
      const res = await apiClient.get(
        `${BASE}/getItemDropDownForSupplierResponseEntry`,
        {
          params: {
            branch: Number(branch),
            orgId: Number(orgId),
            supplierId: Number(supplierId),
          },
        },
      );

      return res?.paramObjectsMap?.items || [];
    } catch (error) {
      throw error;
    }
  },

  getSupplierResponseEntryDocId: async (financialYear, orgId) => {
    try {
      const res = await apiClient.get(`${BASE}/getSupplierResponseEntryDocId`, {
        params: {
          financialYear: String(financialYear),
          orgId: Number(orgId),
        },
      });

      return res?.paramObjectsMap?.docId || "";
    } catch (error) {
      throw error;
    }
  },

  getSupplierResponseByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        `${BASE}/getSupplierResponseEntryByOrgId`,
        {
          params: {
            orgId: Number(orgId),
          },
        },
      );

      const list = res?.paramObjectsMap?.supplierResponseEntryVO;

      return Array.isArray(list) ? list : list ? [list] : [];
    } catch (error) {
      throw error;
    }
  },

  getSupplierResponseById: async (id) => {
    try {
      const res = await apiClient.get(`${BASE}/getSupplierResponseEntryById`, {
        params: {
          id: Number(id),
        },
      });

      return res?.paramObjectsMap?.supplierResponseEntryVO || null;
    } catch (error) {
      throw error;
    }
  },

  createUpdateSupplierResponse: async (payload) => {
    try {
      const res = await apiClient.put(
        `${BASE}/updateCreateSupplierResponseEntry`,
        payload,
      );

      return res;
    } catch (error) {
      throw error;
    }
  },
};

export default supplierResponseAPI;

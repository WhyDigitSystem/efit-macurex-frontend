// vendorComplaintAPI.js
import apiClient from "../apiClient";

const vendorComplaintAPI = {
  // Get Vendor Complaints by Organization ID
  getVendorComplaintByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/vendorComplaintEntry/getVendorComplaintEntryByOrgId?orgId=${orgId}`,
      );
      const list = res?.paramObjectsMap?.vendorComplaintEntryVO;
      return Array.isArray(list) ? list : list ? [list] : [];
    } catch (error) {
      console.error("Error fetching vendor complaints:", error);
      throw error;
    }
  },

  // Get Vendor Complaint by ID
  getVendorComplaintById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/vendorComplaintEntry/getVendorComplaintEntryById?id=${id}`,
      );
      return res?.paramObjectsMap?.vendorComplaintEntryVO || null;
    } catch (error) {
      console.error("Error fetching vendor complaint by ID:", error);
      throw error;
    }
  },

  // Create / Update Vendor Complaint
  createUpdateVendorComplaint: async (payload) => {
    try {
      const res = await apiClient.put(
        `/api/vendorComplaintEntry/updateCreateVendorComplaintEntry`,
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving vendor complaint:", error);
      throw error;
    }
  },

  // Get auto-generated Doc Id for a new Vendor Complaint Entry
  getVendorComplaintEntryDocId: async ({ financialYear, orgId }) => {
    try {
      const res = await apiClient.get(
        `/api/vendorComplaintEntry/getVendorComplaintEntryDocId?financialYear=${financialYear}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.docId || "";
    } catch (error) {
      console.error("Error fetching vendor complaint doc id:", error);
      throw error;
    }
  },

  // FG Item dropdown
  getFgItemDropdown: async (branch, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/vendorComplaintEntry/getFgItemDropdownForVendorComplaintEntry?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.itemList || [];
    } catch (error) {
      console.error("Error fetching FG item dropdown:", error);
      throw error;
    }
  },

  // Part No (item) dropdown for the Complaint Detail grid, filtered by supplier
  getItemDropdownBySupplier: async (branch, orgId, supplier) => {
    try {
      const res = await apiClient.get(
        `/api/vendorComplaintEntry/getItemDropdownForVendorComplaintEntry?branch=${branch}&orgId=${orgId}&supplier=${supplier}`,
      );
      return res?.paramObjectsMap?.itemList || [];
    } catch (error) {
      console.error("Error fetching item dropdown by supplier:", error);
      throw error;
    }
  },
};

export default vendorComplaintAPI;
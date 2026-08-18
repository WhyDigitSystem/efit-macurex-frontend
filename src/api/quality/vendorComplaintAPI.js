// vendorComplaintAPI.js
import apiClient from "../apiClient";

// Vendor Complaint Entry API
// Mirrors the quality API convention used in this app.
// The backend persists the header, complaint details and summary in a
// single transaction (server-side validation).

const vendorComplaintAPI = {
  // Get Vendor Complaints by Organization ID
  getVendorComplaintByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/quality/getVendorComplaintByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      const list = res?.paramObjectsMap?.vendorComplaintVO;
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
        `/api/quality/getVendorComplaintById?id=${id}`,
      );
      return res?.paramObjectsMap?.vendorComplaintVO || null;
    } catch (error) {
      console.error("Error fetching vendor complaint by ID:", error);
      throw error;
    }
  },

  // Create / Update Vendor Complaint
  createUpdateVendorComplaint: async (payload) => {
    try {
      const res = await apiClient.put(
        `/api/quality/updateCreateVendorComplaint`,
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving vendor complaint:", error);
      throw error;
    }
  },
};

export default vendorComplaintAPI;
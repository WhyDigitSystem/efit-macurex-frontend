// customerComplaintAPI.js
import apiClient from "../apiClient";

export const customerComplaintAPI = {
  // Get Customer Complaints by Organization ID
  getComplaintByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getCustomerComplaintByOrgId?orgId=${orgId}`,
      );

      return res?.paramObjectsMap?.complaintList || [];
    } catch (error) {
      console.error("Error fetching customer complaints:", error);
      throw error;
    }
  },

  // Create / Update Customer Complaint (status: "Draft" | "Submitted")
  createUpdateComplaint: async (payload) => {
    try {
      const res = await apiClient.post(
        `/api/commonmaster/createUpdateCustomerComplaint`,
        payload,
      );

      return res;
    } catch (error) {
      console.error("Error saving customer complaint:", error);
      throw error;
    }
  },
};

export default customerComplaintAPI;

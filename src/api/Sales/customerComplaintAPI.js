// customerComplaintAPI.js
import apiClient from "../apiClient";

/* Customer Complaint API
   Create/update is a multipart/form-data PUT to /api/dev/updateCreateCustomerComplaint.
   The request carries two parts:
     - images (array[file])     -> appended once per file under the "images" key
     - customerComplaintDTO      -> JSON stringified complaint object (body)
   The backend persists the complaint + images in a single transaction and
   keeps the complete complaint history for audit purposes. */
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

  // Get Department list (used by the Department dropdown)
  getDepartmentList: async () => {
    try {
      const res = await apiClient.get(`/api/dev/getDepartment`);
      return res?.paramObjectsMap?.departmentList || [];
    } catch (error) {
      console.error("Error fetching departments:", error);
      throw error;
    }
  },

  // Get Customer list (used by the Customer ID dropdown)
  getCustomerList: async () => {
    try {
      const res = await apiClient.get(`/api/dev/getCustomer`);
      return res?.paramObjectsMap?.customerList || [];
    } catch (error) {
      console.error("Error fetching customers:", error);
      throw error;
    }
  },

  // Create / Update Customer Complaint
  // payload = { dto: {...customerComplaintDTO}, images: File[] }
  createUpdateComplaint: async (payload) => {
    try {
      const formData = new FormData();

      formData.append(
        "customerComplaintDTO",
        JSON.stringify(payload.dto || {}),
      );

      (payload.images || []).forEach((file) => {
        if (file instanceof File) formData.append("images", file);
      });

      const res = await apiClient.put(
        `/api/dev/updateCreateCustomerComplaint`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      return res;
    } catch (error) {
      console.error("Error saving customer complaint:", error);
      throw error;
    }
  },
};

export default customerComplaintAPI;
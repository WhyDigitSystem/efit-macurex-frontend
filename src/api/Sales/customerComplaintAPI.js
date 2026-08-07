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
  getComplaintByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/dev/getCustomerComplaintByOrgId?branch=${branch}&orgId=${orgId}`,
      );

      const list = res?.paramObjectsMap?.customerComplaintEntryVO;
      return Array.isArray(list) ? list : list ? [list] : [];
    } catch (error) {
      console.error("Error fetching customer complaints:", error);
      throw error;
    }
  },

  // Get Customer Complaint by ID
  getComplaintById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/dev/getCustomerComplaintById?id=${id}`,
      );

      return res?.paramObjectsMap?.customerComplaintEntryVO || null;
    } catch (error) {
      console.error("Error fetching customer complaint by id:", error);
      throw error;
    }
  },

  // Get Customer details (used by the Customer ID dropdown)
  getCustomerList: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/dev/getCustomerDetails?branch=${branch}&orgId=${orgId}`,
      );
      const details = res?.paramObjectsMap?.customerDetails;
      return details ? [details] : [];
    } catch (error) {
      console.error("Error fetching customers:", error);
      throw error;
    }
  },

  // Get Item details (used by the Item Code dropdown)
  getItemList: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/dev/getCustomerComplaintItemDetails?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.itemDetails?.itemDetails || [];
    } catch (error) {
      console.error("Error fetching items:", error);
      throw error;
    }
  },

  // Get Branch list (used by the Plant ID dropdown)
  getBranchList: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getBranchByOrgId?orgId=${orgId}`,
      );

      return res?.paramObjectsMap?.branchList || [];
    } catch (error) {
      console.error("Error fetching branches:", error);
      throw error;
    }
  },

  // Create / Update Customer Complaint
  // payload = { dto: {...customerComplaintDTO}, images: File[] }
  createUpdateComplaint: async (payload) => {
    try {
      const formData = new FormData();

      const dto = { ...(payload.dto || {}) };
      delete dto.images;

      // Backend expects the part name "customerComplaint"
      formData.append(
        "customerComplaint",
        new Blob([JSON.stringify(dto)], { type: "application/json" }),
      );

      (payload.images || []).forEach((file) => {
        if (file instanceof File) {
          formData.append("images", file);
        }
      });

      // apiClient's default "Content-Type: application/json" would override
      // the multipart boundary, so set multipart explicitly here.
      const response = await apiClient.put(
        "/api/dev/updateCreateCustomerComplaint",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      return response;
    } catch (error) {
      console.error("Error saving customer complaint:", error);
      throw error;
    }
  },
};

export default customerComplaintAPI;
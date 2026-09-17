// setUpApprovalAPI.js
import apiClient from "../apiClient";

const BASE = "/api/vendorComplaintEntry";

/* Set Up Approval API
   Base path confirmed from swagger as /api/vendorComplaintEntry (not
   /api/quality). Backend persists header + approval details + parameters
   in a single transaction via updateCreateSetUpApproval. */
const setUpApprovalAPI = {
  // Get Set Up Approvals by Organization ID
  getSetUpApprovalByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `${BASE}/getSetUpApprovalByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.setUpApproval || [];
    } catch (error) {
      console.error("Error fetching set up approvals:", error);
      throw error;
    }
  },

  // Get Set Up Approval by ID
  getSetUpApprovalById: async (id) => {
    try {
      const res = await apiClient.get(`${BASE}/getSetUpApprovalById?id=${id}`);
      return res?.paramObjectsMap?.setUpApproval || null;
    } catch (error) {
      console.error("Error fetching set up approval by ID:", error);
      throw error;
    }
  },

  // Auto-generated Inspection No (new records only)
  getSetUpApprovalDocId: async (orgId, financialYear) => {
    try {
      const res = await apiClient.get(
        `${BASE}/getSetUpApprovalDocId?financialYear=${financialYear}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.docId || "";
    } catch (error) {
      console.error("Error fetching set up approval doc id:", error);
      throw error;
    }
  },

  // FG/SFG item dropdown: {itemId, itemType, drawingNo, itemCode, itemDescription, customerPartNo}
  getFgSfgItemDropdown: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `${BASE}/getFgSfgItemDropdownForSetUpApproval?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.itemDetails || [];
    } catch (error) {
      console.error("Error fetching item dropdown:", error);
      throw error;
    }
  },

  // Process sheet options for the selected item: {processSheetNo, id}
  getProcessSheetNo: async (orgId, branch, item) => {
    try {
      const res = await apiClient.get(
        `${BASE}/getProcessSheetNoForSetUpApproval?branch=${branch}&item=${item}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.processSheetDetails || [];
    } catch (error) {
      console.error("Error fetching process sheet options:", error);
      throw error;
    }
  },

  // Control plan details for the selected item + process sheet.
  // Drives BOTH the header's read-only Control Plan value (controlPlanNo)
  // AND the Approval Details rows (operationNo/description/specification).
  getControlPlanDetails: async (orgId, branch, item, processSheetNo) => {
    try {
      const res = await apiClient.get(
        `${BASE}/getControlPlanDetailsForSetUpApproval?branch=${branch}&item=${item}&orgId=${orgId}&processSheetNo=${encodeURIComponent(
          processSheetNo,
        )}`,
      );
      return res?.paramObjectsMap?.controlPlanDetails || [];
    } catch (error) {
      console.error("Error fetching control plan details:", error);
      throw error;
    }
  },

  // Shift dropdown
  getShiftByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getShiftByOrgId?orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.shiftVO || [];
    } catch (error) {
      console.error("Error fetching shift options:", error);
      throw error;
    }
  },

  // Party/customer dropdown
  getCustomerByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/partyMaster/getCustomerByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.customerList || [];
    } catch (error) {
      console.error("Error fetching customer options:", error);
      throw error;
    }
  },

  // Create / Update Set Up Approval
  createUpdateSetUpApproval: async (payload) => {
    try {
      const res = await apiClient.put(
        `${BASE}/updateCreateSetUpApproval`,
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving set up approval:", error);
      throw error;
    }
  },
};

export default setUpApprovalAPI;

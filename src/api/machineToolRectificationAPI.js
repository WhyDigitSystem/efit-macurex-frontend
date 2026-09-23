import apiClient from "./apiClient";

/**
 * API wrapper for the Machine/Tool Rectification screen.
 * Base path: /api/vendorComplaintEntry/**
 *
 * Follows the same shape as other master/detail API modules:
 * unwrap res.paramObjectsMap.<key>, log + throw on error.
 */
const machineToolRectificationAPI = {
  /**
   * GET /api/vendorComplaintEntry/getMachineToolRectificationById?id=
   * -> paramObjectsMap.machineToolRectificationVO
   */
  getById: async (id) => {
    try {
      const res = await apiClient.get(
        "/api/vendorComplaintEntry/getMachineToolRectificationById",
        { params: { id } },
      );
      return res?.paramObjectsMap?.machineToolRectificationVO || null;
    } catch (error) {
      console.error("getMachineToolRectificationById failed:", error);
      throw error;
    }
  },

  /**
   * GET /api/vendorComplaintEntry/getMachineToolRectificationByOrgId?branch=&orgId=
   * -> paramObjectsMap.machineToolRectificationList
   */
  getByOrgId: async (branch, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/vendorComplaintEntry/getMachineToolRectificationByOrgId",
        { params: { branch, orgId } },
      );
      return res?.paramObjectsMap?.machineToolRectificationList || [];
    } catch (error) {
      console.error("getMachineToolRectificationByOrgId failed:", error);
      throw error;
    }
  },

  /**
   * GET /api/vendorComplaintEntry/getMachineToolRectificationDocId?financialYear=&orgId=
   * -> paramObjectsMap.docId
   * NOTE: unlike most other screens this key is just "docId", not
   * "machineToolRectificationDocId" - confirmed from the sample response.
   */
  getDocId: async (financialYear, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/vendorComplaintEntry/getMachineToolRectificationDocId",
        { params: { financialYear, orgId } },
      );
      return res?.paramObjectsMap?.docId || "";
    } catch (error) {
      console.error("getMachineToolRectificationDocId failed:", error);
      throw error;
    }
  },

  /**
   * GET /api/vendorComplaintEntry/getPrepareByForMachineToolRectification?branch=&department=&orgId=
   * -> paramObjectsMap.prepareBy  ({name, employeeId, id}[])
   * Used for Attend by / Carried Out By / Prepared By / Approved By -
   * all four pull from this same filtered (branch+department) employee list.
   */
  getPrepareBy: async (branch, department, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/vendorComplaintEntry/getPrepareByForMachineToolRectification",
        { params: { branch, department, orgId } },
      );
      return res?.paramObjectsMap?.prepareBy || [];
    } catch (error) {
      console.error("getPrepareByForMachineToolRectification failed:", error);
      throw error;
    }
  },

  /**
   * GET /api/vendorComplaintEntry/getBreakdownDetailsForRectification?branch=&orgId=
   * -> paramObjectsMap.breakdownDetails
   * Selecting a Breakdown No. from this list auto-fills machineToolNo,
   * description, breakdownDate, time, maintenanceType, natureOfProblem,
   * timeTakenForRectification and location.
   */
  getBreakdownDetails: async (branch, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/vendorComplaintEntry/getBreakdownDetailsForRectification",
        { params: { branch, orgId } },
      );
      return res?.paramObjectsMap?.breakdownDetails || [];
    } catch (error) {
      console.error("getBreakdownDetailsForRectification failed:", error);
      throw error;
    }
  },

  /**
   * PUT /api/vendorComplaintEntry/updateCreateMachineToolRectification
   * dto.id present = update, absent = create.
   * NOTE: this DTO is FLAT (no header wrapper) - see MachineToolRectificationForm
   * for the mapping from UI state to this shape.
   */
  updateCreateMachineToolRectification: async (dto) => {
    try {
      const res = await apiClient.put(
        "/api/vendorComplaintEntry/updateCreateMachineToolRectification",
        dto,
      );
      return res;
    } catch (error) {
      console.error("updateCreateMachineToolRectification failed:", error);
      throw error;
    }
  },
};

export default machineToolRectificationAPI;

import apiClient from "../apiClient";

/**
 * NOTE: the original draft of this file called /api/plantMaintenance/**
 * endpoints (pmChecklist, category, activity, createUpdatePmChecklist) which
 * don't match anything in the confirmed swagger. Every method below has been
 * repointed at the real endpoints under /api/vendorComplaintEntry/**,
 * /api/develop/** and /api/efitmaster/**.
 */

export const FREQUENCY_OPTIONS = [
  "Daily",
  "Weekly",
  "Monthly",
  "Quarterly",
  "Half-Yearly",
  "Yearly",
];

export const pmChecklistMasterAPI = {
  /**
   * GET /api/vendorComplaintEntry/getPMCheckListMasterByOrgId?branch=&orgId=
   * -> paramObjectsMap.pmCheckListMasterVO (array)
   * Requires BOTH branch and orgId, same requirement confirmed on other
   * vendorComplaintEntry screens (Machine/Tool Rectification, Internal Indent).
   */
  getChecklists: async (branch, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/vendorComplaintEntry/getPMCheckListMasterByOrgId",
        { params: { branch, orgId } },
      );
      return res?.paramObjectsMap?.pmCheckListMasterVO || [];
    } catch (error) {
      console.error("getPMCheckListMasterByOrgId failed:", error);
      throw error;
    }
  },

  /**
   * GET /api/vendorComplaintEntry/getPMCheckListMasterById?id=
   * -> paramObjectsMap.pmCheckListMasterVO (object)
   */
  getChecklistById: async (id) => {
    try {
      const res = await apiClient.get(
        "/api/vendorComplaintEntry/getPMCheckListMasterById",
        { params: { id } },
      );
      return res?.paramObjectsMap?.pmCheckListMasterVO || null;
    } catch (error) {
      console.error("getPMCheckListMasterById failed:", error);
      throw error;
    }
  },

  /**
   * PUT /api/vendorComplaintEntry/updateCreatePMCheckListMaster
   * body param name is pmCheckListMasterDTO; dto.id present = update.
   */
  createUpdateChecklist: async (dto) => {
    try {
      const res = await apiClient.put(
        "/api/vendorComplaintEntry/updateCreatePMCheckListMaster",
        dto,
      );
      return res;
    } catch (error) {
      console.error("updateCreatePMCheckListMaster failed:", error);
      throw error;
    }
  },

  /**
   * GET /api/vendorComplaintEntry/getPMCheckListMasterDocId?financialYear=&orgId=
   * -> paramObjectsMap.docId (string, e.g. "BLR/PMCLM/2026-2027/00013")
   * Returns the server-generated document number for a new PM Checklist.
   * Called once when the form opens in "create" mode (and again on "New"),
   * never on edit - editing keeps the record's existing doc number.
   * Returns the full response envelope (not just docId) so the caller can
   * check status/statusFlag before using paramObjectsMap.docId.
   */
  getDocId: async (orgId, financialYear) => {
    try {
      const res = await apiClient.get(
        "/api/vendorComplaintEntry/getPMCheckListMasterDocId",
        { params: { orgId, financialYear } },
      );
      return res;
    } catch (error) {
      console.error("getPMCheckListMasterDocId failed:", error);
      throw error;
    }
  },

  /**
   * GET /api/commonmaster/getListValuesGroup?listDescription=CATEGORY&orgId=
   * -> paramObjectsMap.listValues ({valuesDescription, id}[])
   * Detail-row "Category" dropdown. NOTE: this replaces an earlier assumption
   * that Category was a fixed {1, 2} enum - it's actually an org-configurable
   * list-master value, and the ids returned here (e.g. 1000000002,
   * 1000000003) are what must be sent back, not the displayed
   * valuesDescription text ("1", "2").
   */
  getCategories: async (orgId) => {
    try {
      const res = await apiClient.get("/api/commonmaster/getListValuesGroup", {
        params: { listDescription: "CATEGORY", orgId },
      });
      return res?.paramObjectsMap?.listValues || [];
    } catch (error) {
      console.error("getListValuesGroup (CATEGORY) failed:", error);
      throw error;
    }
  },

  /**
   * GET /api/develop/getToolCategoryByOrgId?orgId=
   * -> paramObjectsMap.toolCategoryResponseVO (array), GROUPED:
   * [{ id, apllicableFor, toolCategoryDetailResponseDTO: [{id, category}] }]
   * "PM Check List For" options = the distinct apllicableFor values.
   * "Machine/Tool Category" options = the toolCategoryDetailResponseDTO of
   * whichever group's apllicableFor matches the selected PM Check List For.
   */
  getToolCategoryGroups: async (orgId) => {
    try {
      const res = await apiClient.get("/api/develop/getToolCategoryByOrgId", {
        params: { orgId },
      });
      // Defensive: handle both a raw envelope and an already-unwrapped array,
      // since apiClient's unwrap behavior has been inconsistent across the
      // other master-data endpoints in this project (see departmentAPI note).
      if (Array.isArray(res)) return res;
      return res?.paramObjectsMap?.toolCategoryResponseVO || [];
    } catch (error) {
      console.error("getToolCategoryByOrgId failed:", error);
      throw error;
    }
  },

  /**
   * GET /api/vendorComplaintEntry/getActivityForPMCheckListMaster?department=&orgId=
   * -> paramObjectsMap.activity ({name, id}[])
   * Depends on the header Department selection.
   */
  getActivities: async (department, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/vendorComplaintEntry/getActivityForPMCheckListMaster",
        { params: { department, orgId } },
      );
      return res?.paramObjectsMap?.activity || [];
    } catch (error) {
      console.error("getActivityForPMCheckListMaster failed:", error);
      throw error;
    }
  },

  /**
   * GET /api/vendorComplaintEntry/getMachineToolForBreakdown?branch=&orgId=&toolCategoryId=
   * -> paramObjectsMap.machineToolList ({number, name, location}[])
   * UNCLEAR where this feeds into the PM Checklist form - the confirmed
   * updateCreatePMCheckListMaster DTO only stores a "toolCategory" id, with
   * no field to hold a specific machine/tool selection. Kept here in case a
   * Machine/Tool picker gets added later; not wired into the form yet.
   */
  getMachineToolForBreakdown: async (branch, orgId, toolCategoryId) => {
    try {
      const res = await apiClient.get(
        "/api/vendorComplaintEntry/getMachineToolForBreakdown",
        { params: { branch, orgId, toolCategoryId } },
      );
      return res?.paramObjectsMap?.machineToolList || [];
    } catch (error) {
      console.error("getMachineToolForBreakdown failed:", error);
      throw error;
    }
  },

  /**
   * GET /api/efitmaster/getEmployeeMasterByOrgId?orgId=
   * -> paramObjectsMap.employeeMasterVO (full employee objects)
   * Already correct in the original draft - kept as-is, used for both
   * Prepared By and Approved By.
   */
  getEmployees: async (orgId) => {
    try {
      const res = await apiClient.get(
        "/api/efitmaster/getEmployeeMasterByOrgId",
        { params: { orgId } },
      );
      return res?.paramObjectsMap?.employeeMasterVO || [];
    } catch (error) {
      console.error("getEmployeeMasterByOrgId failed:", error);
      throw error;
    }
  },
};

export default pmChecklistMasterAPI;

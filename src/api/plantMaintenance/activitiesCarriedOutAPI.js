import apiClient from "../apiClient";

/* ---------------------------------------------------------------------------- */
/* Normaliser: raw backend record -> object ActivitiesCarriedOutForm consumes   */

const idOf = (v) => (v && typeof v === "object" ? (v.id ?? "") : (v ?? ""));
const str = (v) => (v === undefined || v === null ? "" : String(v));
const hhmm = (v) => (v ? String(v).slice(0, 5) : ""); // "11:48" or "11:48:00" -> "11:48"

const toFormData = (r) => {
  if (!r) return null;

  const details = r.activitiesCarriedOutDetailsResponseDTO || [];
  const components = r.activitiesCarriedOutComponentDetailsResponseDTO || [];

  return {
    id: r.id,
    plantId: str(idOf(r.branch)),
    department: str(idOf(r.department)),
    checkedBy: str(idOf(r.checkedBy)),
    docId: r.docId || "",
    date: r.docDate || "",
    machineTool: str(idOf(r.selectMachineToolInst)),
    machineToolNo: r.machineToolInstNo || "",
    pmCheckListNo: str(idOf(r.pmCheckListNo)),
    location: str(r.location),
    maintenanceType: str(idOf(r.maintenanceType)),
    fromLocation: str(idOf(r.fromLocation)),
    active: r.active,

    // detail rows have no id in the response -> index-based keys for React
    activityRows: details.map((d, i) => ({
      id: i + 1,
      scheduledActivity: d.scheduledActivity ?? "",
      itemCode: str(idOf(d.item)),
      itemDescription: d.item?.itemDescription || "",
      fromTime: hhmm(d.fromTime),
      toTime: hhmm(d.toTime),
      checkingPoints: d.checkingPoints ?? "",
      parameter: d.parameter ?? "",
      activitiesCarriedOut: d.activitiesCarriedOut ?? "",
      status: d.status ?? "",
      date: d.date ?? "",
      nextActivity: d.nextActivity ?? "",
      noOfHrs: str(d.noOfHrs),
      frequency: d.frequency ?? "",
      nextScheduleD: d.nextScheduleDate ?? "",
    })),

    componentRows: components.map((c, i) => ({
      id: i + 1,
      itemCode: str(idOf(c.item)),
      itemDescription: c.item?.itemDescription || "",
      reqQty: str(c.reqQty),
      rate: str(c.rate),
      amount: str(c.amount),
      remarks: c.remarks ?? "",
    })),
  };
};

const activitiesCarriedOutAPI = {
  toFormData,

  // List -> raw array of records (response body is a bare array)
  getActivitiesCarriedOutByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        "/api/vendorComplaintEntry/getActivitiesCarriedOutByOrgId",
        { params: { orgId, branch } },
      );
      const body = Array.isArray(res?.data) ? res.data : res;
      if (Array.isArray(body)) return body;
      return body?.paramObjectsMap?.activitiesCarriedOutVO || [];
    } catch (error) {
      console.error("Error fetching Activities Carried Out list:", error);
      throw error;
    }
  },

  // Edit -> normalised object for the form
  getActivitiesCarriedOutById: async (id) => {
    try {
      const res = await apiClient.get(
        "/api/vendorComplaintEntry/getActivitiesCarriedOutById",
        { params: { id } },
      );
      const p = res?.paramObjectsMap || res?.data?.paramObjectsMap || {};
      const root = Array.isArray(p.activitiesCarriedOutVO)
        ? p.activitiesCarriedOutVO[0]
        : p.activitiesCarriedOutVO;
      return toFormData(root);
    } catch (error) {
      console.error("Error fetching Activities Carried Out by id:", error);
      throw error;
    }
  },

  getActivitiesCarriedOutDocId: async (orgId, financialYear) => {
    try {
      const res = await apiClient.get(
        "/api/vendorComplaintEntry/getActivitiesCarriedOutDocId",
        { params: { orgId, financialYear } },
      );
      return res?.paramObjectsMap?.docId || "";
    } catch (error) {
      console.error("Error fetching Activities Carried Out doc id:", error);
      throw error;
    }
  },

  getMachineToolForBreakdown: async (toolCategoryId, orgId, branch) => {
    try {
      const res = await apiClient.get(
        "/api/vendorComplaintEntry/getMachineToolForBreakdown",
        { params: { toolCategoryId, orgId, branch } },
      );
      return res?.paramObjectsMap?.machineToolList || [];
    } catch (error) {
      console.error("Error fetching machine/tool numbers:", error);
      throw error;
    }
  },

  // PM Check List dropdown
  getPMCheckListDropdown: async (branch, macNo, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/vendorComplaintEntry/getPMCheckListDropdownForActivitiesCarriedOut",
        {
          params: { branch, MACNO: macNo, orgId },
        },
      );
      return res?.paramObjectsMap?.pmCheckListDropdown || [];
    } catch (error) {
      console.error("Error fetching PM Check List dropdown:", error);
      throw error;
    }
  },

  updateCreateActivitiesCarriedOut: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/vendorComplaintEntry/updateCreateActivitiesCarriedOut",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      );
      return res;
    } catch (error) {
      console.error("Error saving Activities Carried Out:", error);
      throw error;
    }
  },
};

export default activitiesCarriedOutAPI;

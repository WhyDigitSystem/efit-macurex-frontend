// api/Security/Gateoutwardapi.js
import apiClient from "../apiClient";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

/* -------------------------------------------------------------------------- */
/* Context                                                                    */
/* -------------------------------------------------------------------------- */

export const getCtx = () => ({
  orgId: localStorage.getItem("orgId"),
  branchId: localStorage.getItem("branchId"),
  finYear: localStorage.getItem("finYear"),
  userName: localStorage.getItem("userName") || "SYSTEM",
});

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const jsonHeaders = { "Content-Type": "application/json" };

/* Shared GET: returns response.data, throws when backend says status=false */
const get = async (path, params) => {
  try {
    const response = await axios.get(`${API_BASE_URL}${path}`, {
      params,
      headers: jsonHeaders,
    });

    const body = response.data;

    if (body?.status === false) {
      throw new Error(
        body?.paramObjectsMap?.message ||
          body?.errors?.[0]?.shortMessage ||
          "Request failed",
      );
    }

    return body;
  } catch (error) {
    console.error(`Error calling ${path}:`, error);
    throw error;
  }
};

const pickMap = (body) => body?.paramObjectsMap || {};

const firstArray = (map) =>
  Object.values(map || {}).find((v) => Array.isArray(v)) || [];

const firstObject = (map) => {
  const hit = Object.entries(map || {}).find(
    ([k, v]) => k !== "message" && v && typeof v === "object",
  );
  return hit ? hit[1] : {};
};

const idOf = (v) => (v && typeof v === "object" ? v.id : v);

const strId = (v) => {
  const x = idOf(v);
  return x === null || x === undefined || x === "" ? "" : String(x);
};

const nameOf = (v) =>
  v && typeof v === "object"
    ? (v.category ?? v.employeeName ?? v.customerName ?? v.name ?? "")
    : "";

export const withCurrent = (options, value, label) =>
  value && !options.some((o) => String(o.value) === String(value))
    ? [...options, { value: String(value), label: label || String(value) }]
    : options;

export const YES_NO_OPTIONS = [
  { value: "YES", label: "Yes" },
  { value: "NO", label: "No" },
];

/* -------------------------------------------------------------------------- */
/* Time helpers                                                               */
/* -------------------------------------------------------------------------- */

export const nowTime = () => new Date().toTimeString().slice(0, 8); // HH:mm:ss

const pad = (n) => String(n ?? 0).padStart(2, "0");

const formatTime = (t) => {
  if (!t) return "";
  if (typeof t === "string") return t;
  return `${pad(t.hour)}:${pad(t.minute)}:${pad(t.second)}`;
};

export const toTimeObject = (str) => {
  const [hour = "00", minute = "00", second = "00"] = (str || nowTime()).split(
    ":",
  );
  return { hour: pad(hour), minute: pad(minute), second: pad(second), nano: 0 };
};

/* -------------------------------------------------------------------------- */
/* Normaliser                                                                 */
/* -------------------------------------------------------------------------- */

export const normalizeEntry = (raw0) => {
  const raw = (Array.isArray(raw0) ? raw0[0] : raw0) || {};

  const detailKey = Object.keys(raw).find(
    (k) => /detail/i.test(k) && Array.isArray(raw[k]),
  );
  const details = detailKey ? raw[detailKey] : [];

  return {
    id: raw.id,
    docId: raw.docId ?? raw.serialNo ?? "",
    serialNo: raw.serialNo ?? raw.docId ?? "",
    plantId: strId(raw.plantId ?? raw.branch),
    breakDown: (raw.breakDown || "NO").toString().toUpperCase(),
    docDate: (raw.docDate ?? raw.date ?? "").toString().slice(0, 10),
    breakDownNo: raw.breakDownNo ?? "",
    outwardTime: formatTime(raw.outwardTime),
    materialType: strId(raw.materialType),
    materialTypeName: nameOf(raw.materialType),
    materialTakenOutBy: strId(raw.materialTakenOutBy),
    materialTakenOutByName: nameOf(raw.materialTakenOutBy),
    materialSentTo: strId(raw.materialSentTo),
    materialSentToName: nameOf(raw.materialSentTo),
    challanNo: raw.challanNo ?? "",
    vehicleNo: raw.vehicleNo ?? "",
    remarks: raw.remarks ?? "",
    active: raw.active ?? true,
    items: details.map((d) => {
      const rawItem = d.itemCode ?? d.itemId ?? d.item;
      const isObj = rawItem && typeof rawItem === "object";
      return {
        id: d.id,
        itemId: strId(rawItem),
        itemCode: isObj ? (rawItem.itemCode ?? "") : (d.itemCodeName ?? ""),
        itemDescription:
          d.itemDescription ?? (isObj ? (rawItem.itemDescription ?? "") : ""),
        toolNo: d.toolMachineInstrumentNo ?? "",
        toolDesc: d.toolMachineInstrumentNoDesc ?? "",
        unit: strId(d.unit),
        unitName:
          nameOf(d.unit) ||
          (d.unit && typeof d.unit === "object" ? d.unit.primaryUnit : ""),
        quantity: d.quantity ?? "",
      };
    }),
  };
};

/* -------------------------------------------------------------------------- */
/* API                                                                        */
/* -------------------------------------------------------------------------- */

const gateOutwardAPI = {
  /* ------------------------------ Entry ---------------------------------- */

  // GET - list by org
  getGateOutwardList: async (orgId) => {
    const body = await get("/api/develop/getGateOutwardEntryByOrgId", {
      orgId: Number(orgId),
    });
    return firstArray(pickMap(body)).map(normalizeEntry);
  },

  // GET - single record for edit
  getGateOutwardById: async (id) => {
    const body = await get("/api/develop/getGateOutwardEntryById", {
      id: Number(id),
    });
    return normalizeEntry(firstObject(pickMap(body)));
  },

  // GET - auto generated serial no
  getGateOutwardDocId: async ({ financialYear, orgId }) => {
    try {
      const response = await apiClient.get(
        "/api/develop/getGateOutwardEntryDocId",
        {
          params: {
            financialYear,
            orgId: Number(orgId),
          },
        },
      );

      const map = response?.paramObjectsMap || {};
      const hit = Object.entries(map).find(
        ([k, v]) => k !== "message" && typeof v === "string",
      );
      return hit ? hit[1] : "";
    } catch (error) {
      console.error("Error fetching gate outward doc id:", error);
      throw error;
    }
  },

  // PUT - create / update
  createUpdateGateOutward: async (payload) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/develop/createUpdateGateOutwardEntry`,
        payload,
        { headers: jsonHeaders },
      );
      return response.data;
    } catch (error) {
      console.error("Error saving gate outward:", error);
      console.error("Status:", error.response?.status);
      console.error("Backend response:", error.response?.data);
      throw error;
    }
  },

  /* ---------------------------- Dropdowns -------------------------------- */

  getBreakdownNos: async ({ branch, orgId }) => {
    const body = await get(
      "/api/develop/getBreakdownNoDropdownForGateOutwardEntry",
      { branch: Number(branch), orgId: Number(orgId) },
    );
    return (pickMap(body).breakdownNoList || []).map((b) => ({
      value: b.name,
      label: b.name,
    }));
  },

  // Material Type = tool categories (flattened from detail rows)
  getMaterialTypes: async (orgId) => {
    const body = await get("/api/develop/getToolCategoryByOrgId", {
      orgId: Number(orgId),
    });
    return (pickMap(body).toolCategoryResponseVO || []).flatMap((c) =>
      (c.toolCategoryDetailResponseDTO || []).map((d) => ({
        value: String(d.id),
        label: d.category,
      })),
    );
  },

  getCustomers: async ({ branch, orgId }) => {
    const body = await get("/api/partyMaster/getCustomerByOrgId", {
      branch: Number(branch),
      orgId: Number(orgId),
    });
    return (pickMap(body).customerList || []).map((c) => ({
      value: String(c.id),
      label: c.customerName,
    }));
  },

  // breakdown = "YES" | "NO", customer = material sent to (customer id)
  getChallanNos: async ({ branch, breakdown, customer, orgId }) => {
    const body = await get("/api/develop/getChallanNoForGateOutwardEntry", {
      branch: Number(branch),
      breakdown,
      customer: Number(customer),
      orgId: Number(orgId),
    });
    return (pickMap(body).challanNoForGateOutwardEntry || []).map((c) => ({
      value: c.DOCID,
      label: c.DOCID,
      docDate: c.DOCDATE,
      party: c.PARTY,
    }));
  },

  getMachines: async ({ branch, orgId, toolCategoryId }) => {
    const body = await get(
      "/api/vendorComplaintEntry/getMachineToolForBreakdown",
      {
        branch: Number(branch),
        orgId: Number(orgId),
        toolCategoryId: Number(toolCategoryId),
      },
    );
    return (pickMap(body).machineToolList || []).map((m) => ({
      number: m.number,
      name: m.name,
    }));
  },

  getUnits: async (orgId) => {
    const body = await get("/api/efitmaster/getUomByOrgId", {
      orgId: Number(orgId),
    });
    return firstArray(pickMap(body)).map((u) => ({
      value: String(u.id),
      label:
        u.uomCode ??
        u.unitName ??
        u.uomName ??
        u.primaryUnit ??
        u.unit ??
        u.uom ??
        String(u.id),
    }));
  },
};

export default gateOutwardAPI;

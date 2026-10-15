import apiClient from "../apiClient";

/* Process Sheet / Component Routing API  (/api/develop/*)
   getById() returns a NORMALISED object that ProcessSheetCompRoutingForm
   consumes directly in edit mode (header + routingRows + toolFixtureRows +
   machineRows), so the Master/Form never deal with raw backend shapes. */

const pm = (res) => res?.paramObjectsMap || res?.data?.paramObjectsMap || {};

const pick = (obj, ...keys) => {
  for (const k of keys) {
    if (obj?.[k] !== undefined && obj?.[k] !== null) return obj[k];
  }
  return undefined;
};

// { id: 5, ... } -> 5 ; 5 -> 5
const idOf = (v) => (v && typeof v === "object" ? (v.id ?? "") : (v ?? ""));
const str = (v) => (v === undefined || v === null ? "" : String(v));
const isActive = (v) => v === true || v === "Active" || v === "true";

const firstObj = (v) => (Array.isArray(v) ? v[0] : v);

const normalizeRouting = (res) => {
  const p = pm(res);
  const root = firstObj(
    pick(
      p,
      "processSheetCompRoutingVO",
      "processSheetCompRoutingResponseVO",
      "processSheetCompRoutingDTO",
      "processSheetCompRouting",
    ),
  );
  if (!root) return null;

  const detail =
    pick(
      root,
      "processSheetCompRoutingDetailDTO",
      "processSheetCompRoutingDetailVO",
      "processSheetCompRoutingDetailResponseDTO",
      "processSheetCompRoutingDetailsVO",
    ) || [];
  const machines =
    pick(
      root,
      "processSheetCompRoutingMachineDTO",
      "processSheetCompRoutingMachineVO",
      "processSheetCompRoutingMachineResponseDTO",
      "processSheetCompRoutingMachineDetailsVO",
    ) || [];
  const tools =
    pick(
      root,
      "processSheetToolFixtureDetailsDTO",
      "processSheetToolFixtureDetailsVO",
      "processSheetToolFixtureDetailsResponseDTO",
    ) || [];

  return {
    id: root.id,
    docId: pick(root, "docId", "processSheetCompRoutingDocId") || "",
    docDate: pick(root, "docDate", "date") || "",
    createdBy: root.createdBy,
    plantId: str(idOf(pick(root, "branch", "plant", "plantId"))),
    fgSfgItemType: pick(root, "fgSfgItemType") || "",
    fgSfgItemCode: str(idOf(pick(root, "fgSfgItemCode", "fgSfgItem"))),
    itemDescription: pick(root, "itemDescription") || "",
    bomId: str(idOf(pick(root, "bom", "bomId"))),
    drawingNo: pick(root, "drawingNo") || "",
    costRateId: pick(root, "costRateId") || "",
    active: isActive(root.active),
    preparedBy: str(idOf(pick(root, "preparedBy"))),
    routingRows: detail.map((r) => ({
      id: r.id,
      location: str(idOf(r.location)),
      operation: str(idOf(r.operation)),
      description: r.description ?? "",
      outputItemCode: str(idOf(r.outputItemCode)),
      spec: r.spec ?? "",
      noOfToolsFixture: str(r.noOfToolsFixture),
      sequence: str(r.sequence),
      activityConsumCost: str(r.activityConsumCost),
      sourceOfVariation: r.sourceOfVariation ?? "",
      productCharacteristics: r.productCharacteristics ?? "",
      processCharacteristics: r.processCharacteristics ?? "",
    })),
    toolFixtureRows: tools.map((r) => ({
      id: r.id,
      usageType: r.usageType ?? "",
      toolFixtureNo: str(r.toolFixtureNo),
      toolFixtureName: r.toolFixtureName ?? "",
      activityToolFixtureCost: str(r.activityToolFixtureCost),
    })),
    machineRows: machines.map((r) => ({
      id: r.id,
      usageMachine: r.usageMachine ?? "",
      machineNo: str(idOf(r.machineNo)),
      machineName: r.machineName ?? "",
      setupTimeMinutes: str(r.setupTimeMinutes),
      outputPerHour: str(r.outputPerHour),
      machineHourRate: str(r.machineHourRate),
      labourHourMinutes: str(r.labourHourMinutes),
      labourHourRate: str(r.labourHourRate),
    })),
  };
};

const processSheetCompRoutingAPI = {
  /* ---------------- CRUD ---------------- */

  getByOrgId: async (orgId, branch) => {
    const res = await apiClient.get(
      `/api/develop/getProcessSheetCompRoutingByOrgId?branch=${branch}&orgId=${orgId}`,
    );
    const p = pm(res);
    const list =
      pick(
        p,
        "processSheetCompRoutingVO",
        "processSheetCompRoutingResponseVO",
        "processSheetCompRoutingList",
      ) || [];
    // "Not Found" comes back as status:false with no list -> empty grid
    return Array.isArray(list) ? list : [list];
  },

  getById: async (id) => {
    const res = await apiClient.get(
      `/api/develop/getProcessSheetCompRoutingById?id=${id}`,
    );
    return normalizeRouting(res);
  },

  getDocId: async (orgId, financialYear) => {
    const res = await apiClient.get(
      `/api/develop/getProcessSheetCompRoutingDocId?financialYear=${financialYear}&orgId=${orgId}`,
    );
    return pm(res).processSheetCompRoutingDocId || "";
  },

  createUpdate: async (data) => {
    const res = await apiClient.put(
      "/api/develop/updateCreateProcessSheetCompRouting",
      data,
    );
    return res;
  },

  /* ---------------- Lookups ---------------- */

  // type = "FG" | "SFG"  -> [{ itemId, itemCode, itemDescription, drawingNo }]
  getFgSfgItems: async (orgId, branch, type) => {
    const res = await apiClient.get(
      `/api/develop/getFgAndSfgItemDetailsProcessSheetComp?branch=${branch}&orgId=${orgId}&type=${type}`,
    );
    return pm(res).mapp || [];
  },

  // -> billOfMaterialResponseVO: [{ id, docId, ... }]
  getBoms: async (orgId, branch) => {
    const res = await apiClient.get(
      `/api/purchaseOrder/getBillOfMaterialByOrgId?branch=${branch}&orgId=${orgId}`,
    );
    return pm(res).billOfMaterialResponseVO || [];
  },

  // -> transportList: [{ id, locationId, locationName }]
  getLocations: async (orgId, branch) => {
    const res = await apiClient.get(
      `/api/commonmaster/getLocationByOrgId?branch=${branch}&orgId=${orgId}`,
    );
    return pm(res).transportList || [];
  },

  // -> mapp: [{ operationMasterBasicId, operationId, description, ... }]
  getOperations: async (orgId) => {
    const res = await apiClient.get(
      `/api/develop/getOperationDetailsProcessSheetComp?orgId=${orgId}`,
    );
    return pm(res).mapp || [];
  },

  // -> mapp: [{ MachineId, machineInstrumentNo, machineInstrumentName, hourlyRate }]
  getMachines: async (orgId, branch) => {
    const res = await apiClient.get(
      `/api/develop/getMachineDetailsProcessSheetComp?branch=${branch}&orgId=${orgId}`,
    );
    return pm(res).mapp || [];
  },

  // -> employeeMasterVO: [{ id, employeeName, employeeId }]
  getEmployees: async (orgId) => {
    const res = await apiClient.get(
      `/api/efitmaster/getEmployeeMasterByOrgId?orgId=${orgId}`,
    );
    return pm(res).employeeMasterVO || [];
  },
};

export default processSheetCompRoutingAPI;

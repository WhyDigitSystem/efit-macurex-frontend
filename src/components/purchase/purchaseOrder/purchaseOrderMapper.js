/* ========================================================================= */
/* Helpers for turning getPurchaseOrderById response into form state         */
/* ========================================================================= */

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

/** nested object -> its id, otherwise the value itself */
export const idOf = (v) => (isObj(v) ? (v.id ?? "") : (v ?? ""));

const str = (v) => (v === null || v === undefined ? "" : String(v));

/** "2026-07-01T00:00:00" -> "2026-07-01" (needed by <input type="date">) */
const dateOnly = (v) => (v ? String(v).slice(0, 10) : "");

/** "yes" / true / "Yes" -> "Yes", everything else -> "No" */
const yesNo = (v) =>
  v === true || String(v).toLowerCase() === "yes" ? "Yes" : "No";

const looksLikePurchaseOrder = (node) =>
  isObj(node) &&
  node.id !== undefined &&
  node.id !== null &&
  ("poType" in node ||
    "docId" in node ||
    "supplierCode" in node ||
    "orderPlacedDate" in node ||
    "purchaseOrderLocalDetailsResponseDTO" in node ||
    "purchaseOrderImportDetailsResponseDTO" in node);

const findRecord = (node, depth = 0) => {
  if (!node || typeof node !== "object" || depth > 6) return null;

  if (looksLikePurchaseOrder(node)) return node;

  const children = Array.isArray(node) ? node : Object.values(node);

  for (const child of children) {
    if (child && typeof child === "object") {
      const found = findRecord(child, depth + 1);
      if (found) return found;
    }
  }

  return null;
};

/** Pull the PO object out of whatever shape the API returns */
export const extractPurchaseOrder = (response) => {
  const map = response?.paramObjectsMap;

  const known =
    map?.purchaseOrderVO ??
    map?.purchaseOrder ??
    map?.purchaseOrderResponseVO ??
    map?.purchaseOrderDetails ??
    map?.mapp;

  const candidate = Array.isArray(known) ? known[0] : known;

  if (looksLikePurchaseOrder(candidate)) return candidate;

  return findRecord(response);
};

/** first array found under any of the exact keys, else any key matching regex */
const arrayFrom = (vo, exactKeys, regex) => {
  for (const key of exactKeys) {
    if (Array.isArray(vo[key])) return vo[key];
  }

  const key = Object.keys(vo).find(
    (k) => regex.test(k) && Array.isArray(vo[k]),
  );

  return key ? vo[key] : [];
};

/* ------------------------------------------------------------------------- */
/* Rows                                                                      */
/* ------------------------------------------------------------------------- */

const itemIdOf = (d) => {
  const itemObj = isObj(d.item) ? d.item : null;

  return str(itemObj?.itemId ?? itemObj?.id ?? d.itemId ?? d.item ?? "");
};

const mapLocalRow = (d) => {
  const itemObj = isObj(d.item) ? d.item : null;

  return {
    id: d.id ?? 0,
    item: itemIdOf(d),
    itemCode: itemObj?.itemCode ?? d.itemCode ?? "",
    itemDescription: itemObj?.itemDescription ?? d.itemDescription ?? "",
    unitId: d.unitId ?? "",

    indentNo: str(isObj(d.indentNo) ? (d.indentNo.id ?? "") : d.indentNo),
    indentDate: dateOnly(d.indentDate),
    indentQty: d.indentQty ?? "",
    pendingIndentQty: d.pendingIndentQty ?? "",

    customerPartNo:
      d.customerPartNo ??
      itemObj?.customerPartNo ??
      itemObj?.customerPoNo ??
      "",
    hsnCode: d.hsnCode ?? d.hsn ?? itemObj?.hsnCode ?? "",

    taxType: d.taxType ?? "",
    taxPercentage: d.taxPercentage ?? "",
    sgstRate: d.sgstRate ?? "",
    cgstRate: d.cgstRate ?? "",
    igstRate: d.igstRate ?? "",
    sgstAmount: d.sgstAmount ?? 0,
    cgstAmount: d.cgstAmount ?? 0,
    igstAmount: d.igstAmount ?? 0,

    purchaseUnit: idOf(d.purchaseUnit),
    primaryUnit: idOf(d.primaryUnit),

    poQtyInPurchaseUnit: d.poQtyInPurchaseUnit ?? "",
    qtyInPrimaryUnit: d.qtyInPrimaryUnit ?? "",

    rateInInr: d.rateInInr ?? "",
    discount: d.discount ?? "",
    amountInInr: d.amountInInr ?? "",

    deliveryDate: dateOnly(d.deliveryDate),
  };
};

const mapImportRow = (d) => {
  const itemObj = isObj(d.item) ? d.item : null;

  return {
    id: d.id ?? 0,
    item: itemIdOf(d),
    itemCode: itemObj?.itemCode ?? d.itemCode ?? "",
    itemDescription: itemObj?.itemDescription ?? d.itemDescription ?? "",
    customerPartNo:
      d.customerPartNo ??
      itemObj?.customerPartNo ??
      itemObj?.customerPoNo ??
      "",
    unitId: d.unitId ?? "",

    indentNo: str(isObj(d.indentNo) ? (d.indentNo.id ?? "") : d.indentNo),
    indentDate: dateOnly(d.indentDate),
    indentQty: d.indentQty ?? "",

    hsnCode: d.hsnCode ?? d.hsn ?? itemObj?.hsnCode ?? "",

    uom: idOf(d.uom),
    orderQty: d.orderQty ?? "",
    orderRate: d.orderRate ?? "",

    fobRateFc: d.fobRateFc ?? "",
    fobRateInr: d.fobRateInr ?? "",
    fobValueFc: d.fobValueFc ?? "",
    fobValueInr: d.fobValueInr ?? "",
  };
};

/* ------------------------------------------------------------------------- */
/* Whole record                                                              */
/* ------------------------------------------------------------------------- */

export const mapPurchaseOrderForForm = (vo) => {
  const supplier = isObj(vo.supplierCode)
    ? vo.supplierCode
    : isObj(vo.supplier)
      ? vo.supplier
      : null;

  const localRows = arrayFrom(
    vo,
    ["purchaseOrderLocalDetailsResponseDTO", "purchaseOrderLocalDetailsDTO"],
    /local.*detail/i,
  ).filter(() => true);

  const importRows = arrayFrom(
    vo,
    ["purchaseOrderImportDetailsResponseDTO", "purchaseOrderImportDetailsDTO"],
    /import.*detail/i,
  );

  const taxRows = arrayFrom(
    vo,
    [
      "purchaseOrderLocalTaxDetailsResponseDTO",
      "purchaseOrderLocalTaxDetailsDTO",
    ],
    /tax.*detail/i,
  );

  const fileRows = arrayFrom(
    vo,
    [
      "purchaseOrderLocalFileUploadDetailsResponseDTO",
      "purchaseOrderLocalFileUploadDetailsDTO",
    ],
    /file.*detail|attachment/i,
  );

  const form = {
    id: vo.id,

    active: vo.active === true || String(vo.active).toLowerCase() === "active",

    poNo: vo.docId || vo.poNo || "",
    poType: vo.poType || "Local",
    belongsTo: vo.belongsTo || "",
    orderPlacedDate: dateOnly(vo.orderPlacedDate || vo.docDate),
    financialYear: str(vo.financialYear),

    // dropdown values must be plain ids
    branch: str(idOf(vo.branch)),
    department: str(idOf(vo.department)),
    currency: str(idOf(vo.currency)),
    supplierCode: str(
      supplier ? (supplier.supplierId ?? supplier.id) : vo.supplierCode,
    ),

    // supplier auto-fill fields
    supplierName: supplier?.supplierName ?? vo.supplierName ?? "",
    supplierAddress: supplier?.address ?? vo.supplierAddress ?? "",
    supplierState:
      supplier?.stateName ?? supplier?.gstSate ?? vo.supplierState ?? "",
    supplierPinCode: str(supplier?.pinCode ?? vo.supplierPinCode ?? ""),
    gstnNo: supplier?.gstNo ?? vo.gstnNo ?? "",
    supplierRefNo: vo.supplierRefNo ?? "",
    supplierRefDate: dateOnly(vo.supplierRefDate),

    // employees -> id (the form resolves names to ids if the API returns names)
    preparedBy: str(idOf(vo.preparedBy)),
    checkedBy: str(idOf(vo.checkedBy)),
    authorisedBy: str(idOf(vo.authorisedBy)),

    countryOfOrigin: str(idOf(vo.countryOfOrigin)),
    shipMode: str(idOf(vo.shipMode)),

    indentRequired: yesNo(vo.indentRequired),
    isIgstApplicable: yesNo(vo.isIgstApplicable),
    isReverseCharge: yesNo(vo.isReverseCharge),

    createdBy: str(
      isObj(vo.createdBy) ? vo.createdBy.employeeName : vo.createdBy,
    ),

    exchangeRate: vo.exchangeRate ?? 1,
  };

  // copy the remaining plain fields as they are (charges, terms, notes ...)
  const passthrough = [
    "itemType",
    "modeOfDespatch",
    "incoterm",
    "foreCloseNo",
    "portOfLoading",
    "portOfDischarge",
    "freight",
    "freightFc",
    "freightInr",
    "freightType",
    "insurance",
    "insuranceFc",
    "insuranceInr",
    "packingCharges",
    "packingType",
    "bankCharges",
    "surCharges",
    "otherChargesFc",
    "otherChargesInr",
    "totalFobValueFc",
    "totalFobValueInr",
    "totalPoValueFc",
    "totalPoValueInr",
    "lmeRate",
    "paymentTerms",
    "deliveryTerms",
    "termsAndConditions",
    "notes",
    "remarks",
    "amountInWord",
    "cancelRemarks",
  ];

  passthrough.forEach((key) => {
    if (vo[key] !== null && vo[key] !== undefined) {
      form[key] = vo[key];
    }
  });

  return {
    form,
    localRows: localRows.map(mapLocalRow),
    importRows: importRows.map(mapImportRow),
    taxRows: taxRows.map((t, index) => ({
      id: t.id ?? index + 1,
      particulars: t.particulars ?? "",
      tax: t.tax ?? "",
      amount: t.amount ?? "",
      isSystemRow:
        Boolean(t.isSystemRow) ||
        ["Gross Amount", "IGST", "CGST", "SGST"].includes(t.particulars),
    })),
    fileRows: fileRows.map((f) => ({
      name: f.name || f.fileName || "",
      file: null,
      filePath: f.filePath || "",
      id: f.id,
      isExisting: true,
    })),
  };
};

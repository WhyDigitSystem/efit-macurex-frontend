import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import branchAPI from "../../../api/branchAPI";
import currencyAPI from "../../../api/currencyAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";
import purchaseBillAPI from "../../../api/Purchase/purchaseBillAPI";
import { useToast } from "../../Toast/ToastContext";

/* ========================================================================= */
/* DESIGN TOKENS (kept identical to PurchaseOrderForm for visual parity)     */
/* ========================================================================= */

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const cellInputClasses =
  "w-full h-8 px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-2 items-start";

/* ========================================================================= */
/* HELPERS                                                                   */
/* ========================================================================= */

const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const toInteger = (value, fallback = 0) => {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
};

const round2 = (value) =>
  Math.round((toNumber(value) + Number.EPSILON) * 100) / 100;

const money = (value) => round2(value).toFixed(2);

const todayISO = () => new Date().toISOString().slice(0, 10);

// LocalDate fields on the backend reject "" but accept null - always use
// this instead of `formData.x || ""` when building the save payload.
const dateOrNull = (value) => (value ? value : null);

// Pull an id whether the value arrived flat (5) or nested ({ id: 5, ... })
const idOf = (value) => {
  if (value && typeof value === "object") return value.id ?? "";
  return value ?? "";
};

// Works whether the API wrapper returns the raw envelope or an unwrapped array
// envelope: { paramObjectsMap: { listValues: [{ id, valuesDescription }] } }
const listValuesOf = (response) => {
  if (Array.isArray(response)) return response;
  const data = response?.data ?? response;
  return data?.paramObjectsMap?.listValues || [];
};

/* ---- Local tax grid: debit / credit ---- */

// Backend returns "DEBIT" / "CREDIT" for the local tax grid, so store those
const DEBIT = "DEBIT";
const CREDIT = "CREDIT";

const normalizeDrCr = (v) => {
  const s = String(v ?? "").toUpperCase();
  if (s === "DR" || s === "DEBIT") return DEBIT;
  if (s === "CR" || s === "CREDIT") return CREDIT;
  return "";
};

/* ---- Auto GST rows for the local Tax Grid, built from the item rows ---- */

const buildGstTaxRows = (detailRows, isIGST) => {
  const basic = round2(detailRows.reduce((t, r) => t + toNumber(r.amount), 0));

  const components = isIGST
    ? [{ particulars: "IGST", key: "igstAmount" }]
    : [
        { particulars: "CGST", key: "cgstAmount" },
        { particulars: "SGST", key: "sgstAmount" },
      ];

  return components
    .map(({ particulars, key }) => {
      const amount = round2(
        detailRows.reduce((t, r) => t + toNumber(r[key]), 0),
      );
      return {
        particulars,
        amount,
        taxPercent: basic ? round2((amount / basic) * 100) : 0,
      };
    })
    .filter((c) => c.amount > 0);
};

const isBlankTaxRow = (row) =>
  !row.particulars &&
  !row.ledgerAccount &&
  (row.revisedAmount === "" ||
    row.revisedAmount === null ||
    row.revisedAmount === undefined);

/* ---- Indian numbering (crore/lakh/thousand) for "Amount in Words" ---- */

const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];
const below100 = (n) =>
  n < 20
    ? ONES[n]
    : TENS[Math.floor(n / 10)] + (n % 10 ? ` ${ONES[n % 10]}` : "");
const below1000 = (n) =>
  (n >= 100
    ? `${ONES[Math.floor(n / 100)]} Hundred${n % 100 ? " " : ""}`
    : "") + below100(n % 100);

const amountInWords = (value) => {
  const total = Math.round(toNumber(value) * 100);
  if (!total) return "";
  let rupees = Math.floor(total / 100);
  const paise = total % 100;
  const crore = Math.floor(rupees / 1e7);
  rupees %= 1e7;
  const lakh = Math.floor(rupees / 1e5);
  rupees %= 1e5;
  const thousand = Math.floor(rupees / 1e3);
  rupees %= 1e3;

  const parts = [];
  if (crore) parts.push(`${below1000(crore)} Crore`);
  if (lakh) parts.push(`${below100(lakh)} Lakh`);
  if (thousand) parts.push(`${below100(thousand)} Thousand`);
  if (rupees) parts.push(below1000(rupees));

  let words = `Rupees ${parts.join(" ") || "Zero"}`;
  if (paise) words += ` and ${below100(paise)} Paise`;
  return `${words} Only`;
};

/* ========================================================================= */
/* FIELD COMPONENT                                                           */
/* ========================================================================= */

const Field = ({
  label,
  name,
  value,
  onChange,
  error,
  required,
  type = "text",
  options,
  disabled,
  className = "",
  step,
  min,
  checked,
}) => {
  if (type === "select") {
    return (
      <div className={`w-full ${className}`}>
        <label className={labelClasses}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
          name={name}
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          className={`${controlClasses} ${error ? "border-red-500" : ""}`}
        >
          <option value="">-- Select --</option>
          {(options || []).map((opt) => (
            <option
              key={typeof opt === "object" ? opt.value : opt}
              value={typeof opt === "object" ? opt.value : opt}
            >
              {typeof opt === "object" ? opt.label : opt}
            </option>
          ))}
        </select>
        {error && <p className="text-[11px] text-red-500 mt-0.5">{error}</p>}
      </div>
    );
  }

  if (type === "checkbox") {
    return (
      <div className={`w-full ${className}`}>
        <label className={`${labelClasses} select-none`}>{label}</label>
        <label
          className={`${controlClasses} flex items-center gap-1.5 cursor-pointer h-[30px] ${
            disabled ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          <input
            type="checkbox"
            name={name}
            checked={Boolean(checked)}
            onChange={onChange}
            disabled={disabled}
            className="h-3.5 w-3.5 accent-blue-600 dark:accent-blue-500"
          />
          <span className="text-gray-700 dark:text-gray-200">
            {checked ? "Yes" : "No"}
          </span>
        </label>
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div className={`w-full ${className}`}>
        <label className={labelClasses}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <textarea
          name={name}
          value={value ?? ""}
          onChange={onChange}
          rows={3}
          disabled={disabled}
          className={
            "w-full px-2 py-1.5 rounded border text-xs leading-snug transition-colors resize-y " +
            "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
            "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
            "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
            "dark:focus:ring-blue-400 dark:focus:border-blue-400"
          }
        />
        {error && <p className="text-[11px] text-red-500 mt-0.5">{error}</p>}
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <label className={labelClasses}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        step={step}
        min={min}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        disabled={disabled}
        className={`${controlClasses} ${error ? "border-red-500" : ""}`}
      />
      {error && <p className="text-[11px] text-red-500 mt-0.5">{error}</p>}
    </div>
  );
};

/* ========================================================================= */
/* TABLE COMPONENTS (same pattern as PurchaseOrderForm)                      */
/* ========================================================================= */

const SectionHeader = ({ children }) => (
  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
    {children}
  </h3>
);

const TableWrapper = ({ children }) => (
  <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
    <table className="w-full text-xs min-w-max">{children}</table>
  </div>
);

const TableHead = ({ headers }) => (
  <thead className="bg-gray-100 dark:bg-gray-700">
    <tr>
      {headers.map((header, index) => (
        <th
          key={index}
          className={`p-1.5 whitespace-nowrap text-[10px] font-medium dark:text-white ${
            index === 0 ? "w-8 text-center" : "text-left"
          }`}
        >
          {header}
        </th>
      ))}
    </tr>
  </thead>
);

const TableRow = ({ children, index, onRemove, disabled }) => (
  <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
    <td className="p-1 text-center font-medium dark:text-white text-[10px]">
      {index + 1}
    </td>
    {children}
    <td className="p-1 text-center">
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className={`h-5 w-5 rounded text-white flex items-center justify-center ${
          disabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-red-600 hover:bg-red-700"
        }`}
      >
        <Trash2 size={10} />
      </button>
    </td>
  </tr>
);

const SelectCell = ({ value, onChange, options, disabled = false }) => (
  <td className="p-0.5 align-top min-w-[140px]">
    <select
      value={value ?? ""}
      onChange={onChange}
      disabled={disabled}
      className={cellInputClasses}
    >
      <option value="">Select</option>
      {(options || []).map((opt) => (
        <option
          key={typeof opt === "object" ? opt.value : opt}
          value={typeof opt === "object" ? opt.value : opt}
        >
          {typeof opt === "object" ? opt.label : opt}
        </option>
      ))}
    </select>
  </td>
);

const InputCell = ({
  value,
  onChange,
  type = "text",
  disabled,
  minWidth = "100px",
  min,
  step,
}) => (
  <td className="p-0.5 align-top" style={{ minWidth }}>
    <input
      type={type}
      value={value ?? ""}
      onChange={onChange}
      disabled={disabled}
      min={min}
      step={step}
      className={cellInputClasses}
    />
  </td>
);

const DisplayCell = ({ value, minWidth = "130px" }) => (
  <td className="p-0.5 align-top" style={{ minWidth }}>
    <div
      className={`${cellInputClasses} flex items-center bg-gray-100 dark:bg-gray-800 cursor-not-allowed whitespace-nowrap overflow-hidden`}
      title={value ?? ""}
    >
      {value ?? ""}
    </div>
  </td>
);

const CheckboxCell = ({ checked, onChange, disabled }) => (
  <td className="p-1 text-center align-top" style={{ minWidth: "70px" }}>
    <input
      type="checkbox"
      checked={Boolean(checked)}
      onChange={onChange}
      disabled={disabled}
      className="h-3.5 w-3.5 accent-blue-600 dark:accent-blue-500"
    />
  </td>
);

const DynamicTable = ({ columns, rows, onCellChange, onRemoveRow }) => (
  <TableWrapper>
    <TableHead headers={["#", ...columns.map((c) => c.label), "Action"]} />
    <tbody>
      {rows.map((row, index) => (
        <TableRow
          key={row._rowId || index}
          index={index}
          onRemove={() => onRemoveRow(index)}
          disabled={rows.length <= 1}
        >
          {columns.map((column) => {
            if (column.type === "display") {
              return (
                <DisplayCell
                  key={column.key}
                  value={row[column.displayKey || column.key]}
                  minWidth={column.minWidth || "130px"}
                />
              );
            }

            if (column.type === "select") {
              return (
                <SelectCell
                  key={column.key}
                  value={row[column.key]}
                  disabled={
                    typeof column.disabled === "function"
                      ? column.disabled(row, index)
                      : column.disabled
                  }
                  onChange={(e) =>
                    onCellChange(index, column.key, e.target.value)
                  }
                  options={
                    typeof column.options === "function"
                      ? column.options(row, index)
                      : column.options
                  }
                />
              );
            }

            if (column.type === "checkbox") {
              return (
                <CheckboxCell
                  key={column.key}
                  checked={row[column.key]}
                  disabled={
                    typeof column.disabled === "function"
                      ? column.disabled(row, index)
                      : column.disabled
                  }
                  onChange={(e) =>
                    onCellChange(index, column.key, e.target.checked)
                  }
                />
              );
            }

            return (
              <InputCell
                key={column.key}
                value={row[column.key]}
                type={
                  column.type === "number"
                    ? "number"
                    : column.type === "date"
                      ? "date"
                      : "text"
                }
                disabled={
                  typeof column.disabled === "function"
                    ? column.disabled(row, index)
                    : column.disabled
                }
                min={column.type === "number" ? 0 : undefined}
                step={
                  column.type === "number" ? column.step || "0.01" : undefined
                }
                minWidth={column.minWidth || "100px"}
                onChange={(e) =>
                  onCellChange(index, column.key, e.target.value)
                }
              />
            );
          })}
        </TableRow>
      ))}
    </tbody>
  </TableWrapper>
);

/* ========================================================================= */
/* STATIC OPTIONS (no master-data API supplied for these by the backend)    */
/* ========================================================================= */

const BILL_TYPE_OPTIONS = ["Local", "Import"];
const YES_NO = ["Yes", "No"];

const STATUTORY_FORM_OPTIONS = [
  { value: 1, label: "Form A" },
  { value: 2, label: "Form B" },
  { value: 3, label: "Form C" },
];

// Import tax grid
const DB_CR_OPTIONS = ["Dr", "Cr"];

// Local tax grid (stored as DEBIT / CREDIT, shown as Dr / Cr)
const LOCAL_DR_CR_OPTIONS = [
  { value: DEBIT, label: "Dr" },
  { value: CREDIT, label: "Cr" },
];

/* ========================================================================= */
/* EMPTY ROWS                                                                */
/* ========================================================================= */

let rowSeq = 0;

const emptyLocalDetailRow = () => ({
  _rowId: ++rowSeq,
  id: 0,
  item: "",
  itemCode: "",
  itemDescription: "",
  hsnCode: "",
  hsnCodeLabel: "",
  unit: "",
  unitLabel: "",
  taxType: "",
  taxPercent: "",
  cgstRate: "",
  sgstRate: "",
  igstRate: "",
  challanQty: "",
  grnReceivedQty: "",
  acceptedQty: "",
  rejectedQty: "",
  purchaseorderQty: "",
  purchaseorderRate: "",
  rateInInr: "",
  landedCostRate: "",
  additionalDuty: "",
  // computed / preview only (server recalculates authoritatively)
  shortageQty: 0,
  rateInSelectedCurrency: 0,
  amount: 0,
  amountInSelectedCurrency: 0,
  amountInInr: 0,
  cgstAmount: 0,
  sgstAmount: 0,
  igstAmount: 0,
});

const emptyImportDetailRow = () => ({
  _rowId: ++rowSeq,
  id: 0,
  item: "",
  itemCode: "",
  itemDescription: "",
  challanQty: "",
  grnQty: "",
  accptQty: "",
  fobRateFc: "",
  dutyAmtInr: "",
  // computed / preview only
  shortageQty: 0,
  fobValueFc: 0,
  fobValueInr: 0,
  valueFc: 0,
  valueInr: 0,
  landCostInr: 0,
});

const emptyTaxRow = () => ({
  _rowId: ++rowSeq,
  id: 0,
  particulars: "",
  taxPercent: "",
  acceptedQtyAmount: "",
  revisedAmount: "",
  ledgerAccount: "",
  debitCredit: "",
  debitAmount: "",
  creditAmount: "",
  postToFinanceAc: false,
  // frontend-only flags (never sent)
  auto: false, // row generated from the item rows
  revisedEdited: false, // user overrode Revised Amount
});

const emptyImportTaxRow = () => ({
  _rowId: ++rowSeq,
  particulars: "",
  tax: "",
  taxval1: "",
  taxAmount: "",
  dbCr: "",
  glSubledger: "",
  // frontend-only flag (never sent)
  taxvalEdited: false, // user overrode Taxable Value
});

/* ========================================================================= */
/* DEFAULT FORM (mirrors PurchaseBillDTO header fields)                     */
/* ========================================================================= */

const getDefaultValues = () => ({
  active: true,

  billType: "Local", // frontend-only toggle (drives which arrays get sent)

  branch: "",

  belongsTo: "",

  docDate: todayISO(),

  supplierCode: "",
  supplierName: "",
  gstnNo: "",
  supplierState: "",

  grnNo: "",
  grnDate: "",

  currency: "",
  exchangeRate: 1,

  vendorDcNo: "",
  supplierDcInvNo: "",
  supplierDcInvDate: "",

  purchaseorderNumber: "",
  purchaseorderDate: "",
  purchaseorderType: "",

  modvatCopyReceived: "No",

  excisable: false,
  reverseChrg: "No",
  igstApplicable: "No",

  // Auto-filled from the selected supplier
  dealerType: "", // "Registered" / "Unregistered" (from supplier isRegistered)
  eccTypeCode: "", // supplier eccType, e.g. "Manufacturer"

  // From list values: POSTING CATEGORY (holds the list-value id)
  postingCategory: "",

  voucherPostingDate: "",
  date: "",
  dutyPerUnit: 0,

  // Import only
  creditAcc: "",
  taxStructureName: "Import Purchases",
  statutoryForms: "",
  supplierInvValue: "",

  financialYear: String(new Date().getFullYear()),

  cancelRemarks: "",

  // Local charges summary
  totalFreight: 0,
  entryTaxApplicable: "No",
  narration: "",
  paymentTerms: "",

  // Import charges summary
  totFriInsFc: 0,
  totFreInsInr: 0,
  postVoucher: "No",
});

/* ========================================================================= */
/* COMPONENT                                                                 */
/* ========================================================================= */

const PurchaseBillForm = ({ onBack, onSave, editData }) => {
  const ORG_ID = toInteger(localStorage.getItem("orgId"));
  const BRANCH_ID = toInteger(localStorage.getItem("branchId"));

  const isEditMode = Boolean(editData?.id);

  const { addToast } = useToast();

  // Auto tax-grid sync stays OFF in edit mode until the user changes
  // something, so opening a saved bill never silently rewrites its tax rows.
  const taxAutoEnabled = useRef(!isEditMode);

  /* ----------------------------------------------------------------------- */
  /* FORM STATE                                                              */
  /* ----------------------------------------------------------------------- */

  const [formData, setFormData] = useState(() => ({
    ...getDefaultValues(),
    branch: String(idOf(editData?.branch) || BRANCH_ID || ""),

    billType: editData?.importPurchaseDetails?.length ? "Import" : "Local",

    supplierCode: idOf(editData?.supplier),
    supplierName: editData?.supplier?.supplierName || "",
    gstnNo: editData?.supplier?.gstNo || "",
    supplierState: editData?.supplier?.gstState?.stateName || "",

    belongsTo: editData?.belongsTo || "",
    docDate: editData?.docDate || todayISO(),

    grnNo: editData?.grnNo || "",
    grnDate: editData?.grnDate || "",

    currency: idOf(editData?.currency),
    exchangeRate: editData?.exchangeRate ?? 1,

    vendorDcNo: editData?.vendorDcNo || "",
    supplierDcInvNo: editData?.supplierDcInvNo || "",
    supplierDcInvDate: editData?.supplierDcInvDate || "",

    purchaseorderNumber:
      editData?.purchaseorderNo || editData?.purchaseorderNumber || "",
    purchaseorderDate: editData?.purchaseorderDate || "",
    purchaseorderType: editData?.purchaseorderType || "",

    modvatCopyReceived: editData?.modvatCopyReceived ? "Yes" : "No",

    excisable: Boolean(editData?.excisable),
    reverseChrg: editData?.reverseChrg ? "Yes" : "No",
    // list response key is "igstAppl"
    igstApplicable:
      (editData?.igstAppl ?? editData?.igstApplicable) ? "Yes" : "No",

    dealerType:
      typeof editData?.dealerType === "string" ? editData.dealerType : "",
    eccTypeCode: editData?.eccType || editData?.supplier?.eccType || "",
    postingCategory: String(idOf(editData?.postingCategory) || ""),

    creditAcc: editData?.creditAcc || "",
    taxStructureName: editData?.taxStructureName || "Import Purchases",
    statutoryForms: editData?.statutoryForms || "",
    supplierInvValue: editData?.supplierInvValue || "",

    financialYear: editData?.financialYear || String(new Date().getFullYear()),

    cancelRemarks: editData?.cancelRemarks || "",

    totalFreight: editData?.billChargesSummaryDTO?.[0]?.totalFreight ?? 0,
    entryTaxApplicable: editData?.billChargesSummaryDTO?.[0]?.entryTaxApplicable
      ? "Yes"
      : "No",
    narration:
      editData?.billChargesSummaryDTO?.[0]?.narration ||
      editData?.importBillChargesSummaryDTO?.[0]?.narration ||
      "",
    paymentTerms: editData?.billChargesSummaryDTO?.[0]?.paymentTerms || "",

    totFriInsFc: editData?.importBillChargesSummaryDTO?.[0]?.totFriInsFc ?? 0,
    totFreInsInr: editData?.importBillChargesSummaryDTO?.[0]?.totFreInsInr ?? 0,
    postVoucher: editData?.importBillChargesSummaryDTO?.[0]?.postVoucher
      ? "Yes"
      : "No",

    id: editData?.id,
    createdBy: editData?.createdBy,
  }));

  const effectiveBranchId = toInteger(formData.branch || BRANCH_ID);

  const [localDetailRows, setLocalDetailRows] = useState(
    editData?.purchaseDetails?.length
      ? editData.purchaseDetails.map((row) => ({
          ...emptyLocalDetailRow(),
          id: row.id,
          item: idOf(row.item),
          itemCode: row.item?.itemCode || "",
          itemDescription: row.item?.itemDescription || "",
          hsnCode: idOf(row.item?.hsn) || row.hsnCode || "",
          unit: idOf(row.item?.unit),
          taxType: row.taxType || "",
          taxPercent: row.taxPercent ?? "",
          cgstRate: row.cgstRate ?? "",
          sgstRate: row.sgstRate ?? "",
          igstRate: row.igstRate ?? "",
          challanQty: row.challanQty ?? "",
          grnReceivedQty: row.grnReceivedQty ?? "",
          acceptedQty: row.acceptedQty ?? "",
          rejectedQty: row.rejectedQty ?? "",
          purchaseorderQty: row.purchaseorderQty ?? "",
          purchaseorderRate: row.purchaseorderRate ?? "",
          rateInInr: row.rateInInr ?? "",
          landedCostRate: row.landedCostRate ?? "",
          additionalDuty: row.additionalDuty ?? "",
        }))
      : [emptyLocalDetailRow()],
  );

  const [importDetailRows, setImportDetailRows] = useState(
    editData?.importPurchaseDetails?.length
      ? editData.importPurchaseDetails.map((row) => ({
          ...emptyImportDetailRow(),
          id: row.id,
          item: idOf(row.item),
          itemCode: row.item?.itemCode || "",
          itemDescription: row.item?.itemDescription || "",
          challanQty: row.challanQty ?? "",
          grnQty: row.grnQty ?? "",
          accptQty: row.accptQty ?? "",
          fobRateFc: row.fobRateFc ?? "",
          dutyAmtInr: row.dutyAmtInr ?? "",
        }))
      : [emptyImportDetailRow()],
  );

  const [taxRows, setTaxRows] = useState(
    editData?.taxGrid?.length
      ? editData.taxGrid.map((row) => ({
          ...emptyTaxRow(),
          ...row,
          debitCredit: normalizeDrCr(row.debitCredit),
          // saved GST rows get replaced by fresh auto rows once items change
          auto: /gst/i.test(row.particulars || ""),
          revisedEdited: true,
        }))
      : [emptyTaxRow()],
  );

  const [importTaxRows, setImportTaxRows] = useState(
    editData?.importPurchaseTax?.length
      ? editData.importPurchaseTax.map((row) => ({
          ...emptyImportTaxRow(),
          ...row,
          taxvalEdited: true, // respect saved Taxable Value
        }))
      : [emptyImportTaxRow()],
  );

  /* ----------------------------------------------------------------------- */
  /* MASTER DATA                                                              */
  /* ----------------------------------------------------------------------- */

  const [activeTab, setActiveTab] = useState("billDetail");

  const [branchOptions, setBranchOptions] = useState([]);
  const [belongsToOptions, setBelongsToOptions] = useState([]);
  const [postingCategoryOptions, setPostingCategoryOptions] = useState([]);
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [grnOptions, setGrnOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);

  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatingDocId, setGeneratingDocId] = useState(false);
  const [docId, setDocId] = useState(editData?.docId || "");

  const isLocal = formData.billType === "Local";
  const isImport = formData.billType === "Import";

  /* ========================================================================= */
  /* MASTER DATA LOADERS                                                       */
  /* ========================================================================= */

  const loadBranches = useCallback(async () => {
    try {
      if (!ORG_ID) return;

      const response = await branchAPI.getBranchByOrgId(ORG_ID);

      const list = Array.isArray(response)
        ? response
        : response?.paramObjectsMap?.branches ||
          response?.paramObjectsMap?.branchVO ||
          [];

      setBranchOptions(
        list.map((branch) => ({
          value: branch.id,
          label: branch.branchName || branch.name || `Branch ${branch.id}`,
        })),
      );
    } catch (error) {
      console.error("Failed to load branches:", error);
      setBranchOptions([]);
    }
  }, [ORG_ID]);

  const loadBelongsTo = useCallback(async () => {
    try {
      if (!ORG_ID) return;

      const response = await listOfValuesAPI.getListValuesGroup(
        "BELONGS TO",
        ORG_ID,
      );

      const list = listValuesOf(response);

      setBelongsToOptions(
        list.map((item) => {
          const label =
            item.valuesDescription ||
            item.valueDescription ||
            item.description ||
            "";
          return { value: label, label };
        }),
      );
    } catch (error) {
      console.error("Failed to load Belongs To values:", error);
      setBelongsToOptions([]);
    }
  }, [ORG_ID]);

  // GET /api/commonmaster/getListValuesGroup?listDescription=POSTING CATEGORY
  //   -> paramObjectsMap.listValues [{ id, valuesDescription }]
  const loadPostingCategories = useCallback(async () => {
    try {
      if (!ORG_ID) return;

      const response = await listOfValuesAPI.getListValuesGroup(
        "POSTING CATEGORY",
        ORG_ID,
      );

      setPostingCategoryOptions(
        listValuesOf(response).map((item) => ({
          value: item.id,
          label:
            item.valuesDescription ||
            item.valueDescription ||
            item.description ||
            "",
        })),
      );
    } catch (error) {
      console.error("Failed to load Posting Category values:", error);
      setPostingCategoryOptions([]);
    }
  }, [ORG_ID]);

  // GET /api/commonmaster/currency?orgid=... -> paramObjectsMap.currencyVO
  // Normally the currency is auto-filled from the selected GRN, but this
  // lets the user see/pick it manually too (e.g. before a GRN is chosen).
  const loadCurrencies = useCallback(async () => {
    try {
      if (!ORG_ID) return;

      const response = await currencyAPI.getCurrencies(ORG_ID);

      const list = Array.isArray(response)
        ? response
        : response?.paramObjectsMap?.currencyVO ||
          response?.paramObjectsMap?.currencies ||
          [];

      setCurrencyOptions(
        list.map((currency) => ({
          value: currency.id,
          label:
            currency.currency ||
            currency.mainCurrency ||
            currency.currencyName ||
            `Currency ${currency.id}`,
        })),
      );
    } catch (error) {
      console.error("Failed to load currencies:", error);
      setCurrencyOptions([]);
    }
  }, [ORG_ID]);

  const loadSuppliers = useCallback(async () => {
    try {
      if (!ORG_ID || !effectiveBranchId) return;

      const response = await purchaseBillAPI.getSuppliersForPurchaseBill(
        ORG_ID,
        effectiveBranchId,
      );

      const data = response?.data ?? response;

      const list = data?.paramObjectsMap?.supplierList || [];

      setSupplierOptions(
        list.map((supplier) => ({
          value: supplier.supplierId,
          label: supplier.supplierCode || "",

          supplierId: supplier.supplierId,
          supplierName: supplier.supplierName || "",
          supplierCode: supplier.supplierCode || "",
          gstNo: supplier.gstNo || "",
          stateName: supplier.stateName || "",
          stateCode: supplier.stateCode || "",
          gstStateId: supplier.gstStateId || "",
          eccType: supplier.eccType || "",
          isRegistered: Boolean(supplier.isRegistered),
          isGstApplicable: Boolean(supplier.isGstApplicable),
        })),
      );
    } catch (error) {
      console.error("Failed to load suppliers:", error);
      setSupplierOptions([]);
    }
  }, [ORG_ID, effectiveBranchId]);

  const loadGrnOptions = useCallback(
    async (supplierId) => {
      try {
        if (!ORG_ID || !effectiveBranchId || !supplierId) {
          setGrnOptions([]);
          return;
        }

        const response = await purchaseBillAPI.getGrnNoDropdownforPurchaseBill(
          effectiveBranchId,
          ORG_ID,
          supplierId,
        );

        const data = response?.data ?? response;

        const list = data?.paramObjectsMap?.grnList || [];

        setGrnOptions(
          list.map((grn) => ({
            value: grn.grnNo,
            label: grn.grnNo,

            id: grn.id,
            grnDate: grn.grnDate || "",
            currency: grn.currency,
            currencyName: grn.currencyName || "",
            exchangeRate: grn.exchangeRate ?? 1,
            poNo: grn.poNo || "",
            vendorDcNo: grn.vendorDcNo || "",
            vendorDcDate: grn.vendorDcDate || "",
            poType: grn.poType || "",
            modvat: Boolean(grn.modvat),
            supplierDcInvNo: grn.supplierDcInvNo || "",
            supplierDcInvDate: grn.supplierDcInvDate || "",
          })),
        );
      } catch (error) {
        console.error("Failed to load GRN No dropdown:", error);
        setGrnOptions([]);
      }
    },
    [ORG_ID, effectiveBranchId],
  );

  const loadItemOptions = useCallback(
    async (supplierId, grnNo, billType) => {
      try {
        if (!ORG_ID || !effectiveBranchId || !supplierId || !grnNo) {
          setItemOptions([]);
          return;
        }

        if (billType === "Import") {
          const response =
            await purchaseBillAPI.getImportItemDropDownForPurchaseBill(
              effectiveBranchId,
              grnNo,
              ORG_ID,
              supplierId,
            );

          const data = response?.data ?? response;

          // paramObjectsMap.data -> [{ item, itemCode, itemDescription,
          //   challanQty, grnQty, acceptedQty, shortageQty, fobRateFc }]
          const list = data?.paramObjectsMap?.data || [];

          setItemOptions(
            list.map((item) => ({
              value: item.item,
              label: item.itemCode || `Item ${item.item}`,

              itemDescription: item.itemDescription || "",
              challanQty: item.challanQty ?? 0,
              grnQty: item.grnQty ?? 0,
              acceptedQty: item.acceptedQty ?? 0,
              shortageQty: item.shortageQty ?? 0,
              fobRateFc: item.fobRateFc ?? 0,
            })),
          );
        } else {
          const response = await purchaseBillAPI.getItemDropDownForPurchaseBill(
            ORG_ID,
            effectiveBranchId,
            supplierId,
            grnNo,
          );

          const data = response?.data ?? response;

          // paramObjectsMap.itemList -> [{ item, itemCode, itemdesc,
          //   hsnCode:{id,value}, gst_rate, unit:{id,value}, challan_qty,
          //   received_qty, accepted_qty, rejected_qty, shortage_qty,
          //   po_qty, po_rate, amount, cgst_rate, sgst_rate, igst_rate,
          //   tax_type }]
          const list = data?.paramObjectsMap?.itemList || [];

          setItemOptions(
            list.map((item) => ({
              value: item.item,
              label: item.itemCode || `Item ${item.item}`,

              itemDescription: item.itemdesc || "",
              hsnCode: item.hsnCode?.id ?? "",
              hsnCodeLabel: item.hsnCode?.value ?? "",
              gstRate: item.gst_rate ?? 0,
              unit: item.unit?.id ?? "",
              unitLabel: item.unit?.value ?? "",
              challanQty: item.challan_qty ?? 0,
              receivedQty: item.received_qty ?? 0,
              acceptedQty: item.accepted_qty ?? 0,
              rejectedQty: item.rejected_qty ?? 0,
              shortageQty: item.shortage_qty ?? 0,
              poQty: item.po_qty ?? 0,
              poRate: item.po_rate ?? 0,
              amount: item.amount ?? 0,
              cgstRate: item.cgst_rate ?? 0,
              sgstRate: item.sgst_rate ?? 0,
              igstRate: item.igst_rate ?? 0,
              taxType: item.tax_type || "",
            })),
          );
        }
      } catch (error) {
        console.error("Failed to load item dropdown:", error);
        setItemOptions([]);
      }
    },
    [ORG_ID, effectiveBranchId],
  );

  /* ========================================================================= */
  /* MASTER DATA USE EFFECTS                                                   */
  /* ========================================================================= */

  useEffect(() => {
    loadBranches();
    loadBelongsTo();
    loadCurrencies();
    loadPostingCategories();
  }, [loadBranches, loadBelongsTo, loadCurrencies, loadPostingCategories]);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  // Edit mode: once suppliers are loaded, fill Dealer Type / Ecc Type from
  // the saved supplier (only when the saved bill didn't carry them).
  useEffect(() => {
    if (!formData.supplierCode || supplierOptions.length === 0) return;

    const selected = supplierOptions.find(
      (option) => String(option.value) === String(formData.supplierCode),
    );
    if (!selected) return;

    setFormData((prev) => ({
      ...prev,
      dealerType:
        prev.dealerType ||
        (selected.isRegistered ? "Registered" : "Unregistered"),
      eccTypeCode: prev.eccTypeCode || selected.eccType || "",
    }));
  }, [supplierOptions, formData.supplierCode]);

  useEffect(() => {
    if (formData.supplierCode) {
      loadGrnOptions(formData.supplierCode);
    } else {
      setGrnOptions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.supplierCode, effectiveBranchId]);

  useEffect(() => {
    if (formData.supplierCode && formData.grnNo) {
      loadItemOptions(formData.supplierCode, formData.grnNo, formData.billType);
    } else {
      setItemOptions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formData.supplierCode,
    formData.grnNo,
    formData.billType,
    effectiveBranchId,
  ]);

  /* ========================================================================= */
  /* DOCUMENT NUMBER                                                           */
  /* ========================================================================= */

  useEffect(() => {
    if (isEditMode) return;

    let cancelled = false;

    const generateDocId = async () => {
      setGeneratingDocId(true);
      try {
        const generated = await purchaseBillAPI.getPurchaseBillDocId(
          ORG_ID,
          formData.financialYear,
        );
        if (!cancelled) setDocId(generated || "");
      } catch (error) {
        if (!cancelled) {
          console.error("Error generating Purchase Bill doc id:", error);
        }
      } finally {
        if (!cancelled) setGeneratingDocId(false);
      }
    };

    generateDocId();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  /* ========================================================================= */
  /* FIELD CHANGE                                                              */
  /* ========================================================================= */

  const handleFieldChange = (event) => {
    const { name, value, type, checked } = event.target;

    // any user edit switches auto tax-grid sync on
    taxAutoEnabled.current = true;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    /* --------------------------------------------------------------------- */
    /* PLANT / BRANCH CHANGE                                                 */
    /* --------------------------------------------------------------------- */

    if (name === "branch") {
      setFormData((prev) => ({
        ...prev,
        branch: value,
        supplierCode: "",
        supplierName: "",
        gstnNo: "",
        supplierState: "",
        dealerType: "",
        eccTypeCode: "",
        grnNo: "",
        grnDate: "",
      }));
      setSupplierOptions([]);
      setGrnOptions([]);
      setItemOptions([]);
      setLocalDetailRows([emptyLocalDetailRow()]);
      setImportDetailRows([emptyImportDetailRow()]);
      return;
    }

    /* --------------------------------------------------------------------- */
    /* BILL TYPE (Local / Import)                                            */
    /* --------------------------------------------------------------------- */

    if (name === "billType") {
      setFormData((prev) => ({
        ...prev,
        billType: value,
        grnNo: "",
        grnDate: "",
      }));
      setActiveTab("billDetail");
      setItemOptions([]);
      setLocalDetailRows([emptyLocalDetailRow()]);
      setImportDetailRows([emptyImportDetailRow()]);
      return;
    }

    /* --------------------------------------------------------------------- */
    /* SUPPLIER AUTO FILL                                                    */
    /* --------------------------------------------------------------------- */

    if (name === "supplierCode") {
      const selected = supplierOptions.find(
        (option) => String(option.value) === String(value),
      );

      setFormData((prev) => ({
        ...prev,
        supplierCode: value,
        supplierName: selected?.supplierName || "",
        gstnNo: selected?.gstNo || "",
        supplierState: selected?.stateName || "",
        // isRegistered true -> Registered, otherwise Unregistered
        dealerType: selected
          ? selected.isRegistered
            ? "Registered"
            : "Unregistered"
          : "",
        // supplier's ECC type, e.g. "Manufacturer"
        eccTypeCode: selected?.eccType || "",
        // Registered supplier -> IGST does NOT necessarily apply; this mirrors
        // the same convention used on the Purchase Order form (isRegistered
        // flag driving the IGST toggle) so behaviour stays consistent.
        igstApplicable: selected?.isRegistered ? "Yes" : "No",
        grnNo: "",
        grnDate: "",
      }));

      setItemOptions([]);
      setLocalDetailRows([emptyLocalDetailRow()]);
      setImportDetailRows([emptyImportDetailRow()]);
      return;
    }

    /* --------------------------------------------------------------------- */
    /* GRN NO AUTO FILL                                                      */
    /* --------------------------------------------------------------------- */

    if (name === "grnNo") {
      const selected = grnOptions.find(
        (option) => String(option.value) === String(value),
      );

      setFormData((prev) => ({
        ...prev,
        grnNo: value,
        grnDate: selected?.grnDate || "",
        currency: selected?.currency || prev.currency,
        exchangeRate: selected?.exchangeRate ?? prev.exchangeRate,
        purchaseorderNumber: selected?.poNo || "",
        purchaseorderType: selected?.poType || "",
        vendorDcNo: selected?.vendorDcNo || "",
        supplierDcInvNo: selected?.supplierDcInvNo || "",
        supplierDcInvDate: selected?.supplierDcInvDate || "",
        modvatCopyReceived: selected?.modvat ? "Yes" : "No",
      }));

      setLocalDetailRows([emptyLocalDetailRow()]);
      setImportDetailRows([emptyImportDetailRow()]);
      return;
    }

    /* --------------------------------------------------------------------- */
    /* NORMAL FIELD                                                          */
    /* --------------------------------------------------------------------- */

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /* ========================================================================= */
  /* LOCAL ROW CALCULATION (mirrors createUpdatePurchaseBillVOByPurchaseBillDTO)*/
  /* ========================================================================= */

  const calculateLocalRow = (row, changedKey, changedValue) => {
    let updated = { ...row, [changedKey]: changedValue };

    if (changedKey === "item") {
      const selectedItem = itemOptions.find(
        (item) => String(item.value) === String(changedValue),
      );

      if (selectedItem) {
        updated.itemCode = selectedItem.label || "";
        updated.itemDescription = selectedItem.itemDescription || "";
        updated.hsnCode = selectedItem.hsnCode ?? "";
        updated.hsnCodeLabel = selectedItem.hsnCodeLabel || "";
        updated.unit = selectedItem.unit ?? "";
        updated.unitLabel = selectedItem.unitLabel || "";
        updated.taxType = selectedItem.taxType || "";
        updated.taxPercent = selectedItem.gstRate ?? "";
        updated.cgstRate = selectedItem.cgstRate ?? "";
        updated.sgstRate = selectedItem.sgstRate ?? "";
        updated.igstRate = selectedItem.igstRate ?? "";
        updated.challanQty = selectedItem.challanQty ?? "";
        updated.grnReceivedQty = selectedItem.receivedQty ?? "";
        updated.acceptedQty = selectedItem.acceptedQty ?? "";
        updated.rejectedQty = selectedItem.rejectedQty ?? "";
        updated.purchaseorderQty = selectedItem.poQty ?? "";
        updated.purchaseorderRate = selectedItem.poRate ?? "";
        updated.rateInInr = selectedItem.poRate ?? "";
      }
    }

    const purchaseorderQty = toNumber(updated.purchaseorderQty);
    const acceptedQty = toNumber(updated.acceptedQty);
    const purchaseorderRate = toNumber(updated.purchaseorderRate);
    const exchangeRate = toNumber(formData.exchangeRate, 1);

    // shortageQty = purchaseorderQty - acceptedQty
    updated.shortageQty = round2(purchaseorderQty - acceptedQty);

    // amount = acceptedQty * purchaseorderRate
    const amount = round2(acceptedQty * purchaseorderRate);
    updated.amount = amount;
    updated.amountInInr = amount;

    // rateInSelectedCurrency = purchaseorderRate / exchangeRate
    updated.rateInSelectedCurrency =
      exchangeRate !== 0 ? round2(purchaseorderRate / exchangeRate) : 0;

    // amountInSelectedCurrency = amount / exchangeRate
    updated.amountInSelectedCurrency =
      exchangeRate !== 0 ? round2(amount / exchangeRate) : 0;

    // GST split - depends on header "Is IGST Applicable"
    const isIGST = formData.igstApplicable === "Yes";
    const igstRate = toNumber(updated.igstRate);
    const cgstRate = toNumber(updated.cgstRate);
    const sgstRate = toNumber(updated.sgstRate);

    if (isIGST) {
      updated.igstAmount = round2((amount * igstRate) / 100);
      updated.cgstAmount = 0;
      updated.sgstAmount = 0;
    } else {
      updated.cgstAmount = round2((amount * cgstRate) / 100);
      updated.sgstAmount = round2((amount * sgstRate) / 100);
      updated.igstAmount = 0;
    }

    return updated;
  };

  const handleLocalCellChange = (index, key, value) => {
    taxAutoEnabled.current = true;
    setLocalDetailRows((prev) =>
      prev.map((row, i) =>
        i === index ? calculateLocalRow(row, key, value) : row,
      ),
    );
  };

  // Recalculate all rows if exchange rate or IGST-applicable flag changes
  useEffect(() => {
    if (!isLocal) return;
    setLocalDetailRows((prev) =>
      prev.map((row) => calculateLocalRow(row, "item", row.item)),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.exchangeRate, formData.igstApplicable, isLocal]);

  const addLocalRow = () =>
    setLocalDetailRows((prev) => [...prev, emptyLocalDetailRow()]);

  const removeLocalRow = (index) => {
    taxAutoEnabled.current = true;
    setLocalDetailRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== index),
    );
  };

  /* ========================================================================= */
  /* IMPORT ROW CALCULATION                                                    */
  /* ========================================================================= */

  const calculateImportRow = (row, changedKey, changedValue) => {
    let updated = { ...row, [changedKey]: changedValue };

    if (changedKey === "item") {
      const selectedItem = itemOptions.find(
        (item) => String(item.value) === String(changedValue),
      );

      if (selectedItem) {
        updated.itemCode = selectedItem.label || "";
        updated.itemDescription = selectedItem.itemDescription || "";
        updated.challanQty = selectedItem.challanQty ?? "";
        updated.grnQty = selectedItem.grnQty ?? "";
        updated.accptQty = selectedItem.acceptedQty ?? "";
        updated.fobRateFc = selectedItem.fobRateFc ?? "";
      }
    }

    const grnQty = toNumber(updated.grnQty);
    const accptQty = toNumber(updated.accptQty);
    const fobRateFc = toNumber(updated.fobRateFc);
    const dutyAmtInr = toNumber(updated.dutyAmtInr);
    const exchangeRate = toNumber(formData.exchangeRate, 1);

    // shortageQty = grnQty - accptQty
    updated.shortageQty = round2(grnQty - accptQty);

    // fobValueFc = fobRateFc * accptQty
    const fobValueFc = round2(fobRateFc * accptQty);
    updated.fobValueFc = fobValueFc;

    // fobValueInr = fobValueFc * exchangeRate
    const fobValueInr = round2(fobValueFc * exchangeRate);
    updated.fobValueInr = fobValueInr;

    // valueFc = (dutyAmtInr / exchangeRate) * fobValueFc   (mirrors service)
    updated.valueFc =
      exchangeRate !== 0 ? round2((dutyAmtInr / exchangeRate) * fobValueFc) : 0;

    // valueInr = dutyAmtInr + fobValueInr
    const valueInr = round2(dutyAmtInr + fobValueInr);
    updated.valueInr = valueInr;

    // landCostInr = valueInr / accptQty
    updated.landCostInr = accptQty !== 0 ? round2(valueInr / accptQty) : 0;

    return updated;
  };

  const handleImportCellChange = (index, key, value) => {
    taxAutoEnabled.current = true;
    setImportDetailRows((prev) =>
      prev.map((row, i) =>
        i === index ? calculateImportRow(row, key, value) : row,
      ),
    );
  };

  useEffect(() => {
    if (!isImport) return;
    setImportDetailRows((prev) =>
      prev.map((row) => calculateImportRow(row, "item", row.item)),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.exchangeRate, isImport]);

  const addImportRow = () =>
    setImportDetailRows((prev) => [...prev, emptyImportDetailRow()]);

  const removeImportRow = (index) => {
    taxAutoEnabled.current = true;
    setImportDetailRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== index),
    );
  };

  /* ========================================================================= */
  /* LOCAL TOTALS                                                              */
  /* ========================================================================= */

  const localTotalQty = useMemo(
    () =>
      round2(localDetailRows.reduce((t, r) => t + toNumber(r.acceptedQty), 0)),
    [localDetailRows],
  );

  const localBasicValue = useMemo(
    () => round2(localDetailRows.reduce((t, r) => t + toNumber(r.amount), 0)),
    [localDetailRows],
  );

  const localGstTotal = useMemo(
    () =>
      round2(
        localDetailRows.reduce(
          (t, r) =>
            t +
            toNumber(r.cgstAmount) +
            toNumber(r.sgstAmount) +
            toNumber(r.igstAmount),
          0,
        ),
      ),
    [localDetailRows],
  );

  /* ========================================================================= */
  /* TAX GRID (local) - GST rows are auto-built from the item rows; extra      */
  /* manual rows are still allowed                                             */
  /* ========================================================================= */

  const handleTaxCellChange = (index, key, value) => {
    setTaxRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;

        const updated = { ...row, [key]: value };

        if (key === "revisedAmount") updated.revisedEdited = true;

        // manual rows only - auto rows have these fields locked
        if (!row.auto && (key === "taxPercent" || key === "particulars")) {
          const taxPercent = toNumber(
            key === "taxPercent" ? value : row.taxPercent,
          );
          const computed = round2((localBasicValue * taxPercent) / 100);
          updated.acceptedQtyAmount = computed;
          if (!updated.revisedEdited) updated.revisedAmount = computed;
        }

        if (
          key === "taxPercent" ||
          key === "particulars" ||
          key === "debitCredit" ||
          key === "revisedAmount"
        ) {
          const revised = toNumber(updated.revisedAmount);
          updated.debitAmount = updated.debitCredit === DEBIT ? revised : 0;
          updated.creditAmount = updated.debitCredit === CREDIT ? revised : 0;
        }

        return updated;
      }),
    );
  };

  const addTaxRow = () => setTaxRows((prev) => [...prev, emptyTaxRow()]);
  const removeTaxRow = (index) =>
    setTaxRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== index),
    );

  // Auto-generate GST rows whenever the item rows (or IGST flag) change
  useEffect(() => {
    if (!isLocal || !taxAutoEnabled.current) return;

    const gst = buildGstTaxRows(
      localDetailRows,
      formData.igstApplicable === "Yes",
    );

    setTaxRows((prev) => {
      const prevAuto = prev.filter((r) => r.auto);
      const manual = prev.filter((r) => !r.auto && !isBlankTaxRow(r));

      const autoRows = gst.map((g) => {
        const same = prevAuto.find((r) => r.particulars === g.particulars);
        const base = same || prevAuto[0]; // inherit ledger / Dr-Cr / post flag
        const revisedEdited = Boolean(same?.revisedEdited);
        const revisedAmount = revisedEdited
          ? toNumber(same.revisedAmount)
          : g.amount;
        const debitCredit = base?.debitCredit || DEBIT;

        return {
          ...emptyTaxRow(),
          auto: true,
          particulars: g.particulars,
          taxPercent: g.taxPercent,
          acceptedQtyAmount: g.amount,
          revisedAmount,
          revisedEdited,
          ledgerAccount: base?.ledgerAccount || "",
          debitCredit,
          debitAmount: debitCredit === DEBIT ? revisedAmount : 0,
          creditAmount: debitCredit === CREDIT ? revisedAmount : 0,
          postToFinanceAc: base?.postToFinanceAc ?? true,
        };
      });

      const next = [...autoRows, ...manual];
      return next.length ? next : [emptyTaxRow()];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localDetailRows, formData.igstApplicable, isLocal]);

  const taxRowsTotal = useMemo(
    () => round2(taxRows.reduce((t, r) => t + toNumber(r.revisedAmount), 0)),
    [taxRows],
  );

  // The tax grid holds ALL taxes (GST rows included), so GST is not added again
  const localTotalAmount = useMemo(
    () =>
      round2(localBasicValue + taxRowsTotal + toNumber(formData.totalFreight)),
    [localBasicValue, taxRowsTotal, formData.totalFreight],
  );

  /* ========================================================================= */
  /* IMPORT TOTALS                                                            */
  /* ========================================================================= */

  const importTotFobValueFc = useMemo(
    () =>
      round2(importDetailRows.reduce((t, r) => t + toNumber(r.fobValueFc), 0)),
    [importDetailRows],
  );

  const importTotFobValueInr = useMemo(
    () =>
      round2(importDetailRows.reduce((t, r) => t + toNumber(r.fobValueInr), 0)),
    [importDetailRows],
  );

  const importTotDutyInr = useMemo(
    () =>
      round2(importDetailRows.reduce((t, r) => t + toNumber(r.dutyAmtInr), 0)),
    [importDetailRows],
  );

  const importTotLandCost = useMemo(
    () =>
      round2(importDetailRows.reduce((t, r) => t + toNumber(r.landCostInr), 0)),
    [importDetailRows],
  );

  const importTotalValueFc = useMemo(
    () => round2(importTotFobValueFc + toNumber(formData.totFriInsFc)),
    [importTotFobValueFc, formData.totFriInsFc],
  );

  /* ========================================================================= */
  /* IMPORT TAX ROWS - Taxable Value auto = Total FOB (INR) + Total Duty (INR) */
  /* ========================================================================= */

  const importTaxBase = useMemo(
    () => round2(importTotFobValueInr + importTotDutyInr),
    [importTotFobValueInr, importTotDutyInr],
  );

  const handleImportTaxCellChange = (index, key, value) => {
    setImportTaxRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        const updated = { ...row, [key]: value };

        if (key === "taxval1") updated.taxvalEdited = true;

        if (key === "tax" || key === "taxval1") {
          const tax = toNumber(key === "tax" ? value : row.tax);
          const base = toNumber(key === "taxval1" ? value : row.taxval1);
          updated.taxAmount = round2((base * tax) / 100);
        }
        return updated;
      }),
    );
  };

  // Keep Taxable Value in sync with the item rows (unless user overrode it)
  useEffect(() => {
    if (!isImport || !taxAutoEnabled.current) return;

    setImportTaxRows((prev) =>
      prev.map((row) =>
        row.taxvalEdited
          ? row
          : {
              ...row,
              taxval1: importTaxBase,
              taxAmount: round2((importTaxBase * toNumber(row.tax)) / 100),
            },
      ),
    );
  }, [importTaxBase, isImport]);

  const addImportTaxRow = () =>
    setImportTaxRows((prev) => [
      ...prev,
      {
        ...emptyImportTaxRow(),
        taxval1: importTaxBase,
      },
    ]);

  const removeImportTaxRow = (index) =>
    setImportTaxRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== index),
    );

  const importTaxTotal = useMemo(
    () => round2(importTaxRows.reduce((t, r) => t + toNumber(r.taxAmount), 0)),
    [importTaxRows],
  );

  const importNetAmount = useMemo(
    () =>
      round2(
        importTotFobValueInr +
          importTotDutyInr +
          toNumber(formData.totFreInsInr) +
          importTaxTotal,
      ),
    [
      importTotFobValueInr,
      importTotDutyInr,
      formData.totFreInsInr,
      importTaxTotal,
    ],
  );

  const wordsSource = isImport ? importNetAmount : localTotalAmount;

  /* ========================================================================= */
  /* VALIDATION                                                                */
  /* ========================================================================= */

  const validate = () => {
    const errors = {};

    if (!formData.branch) errors.branch = "Plant is required";
    if (!formData.docDate) errors.docDate = "Doc Date is required";
    if (!formData.supplierCode) errors.supplierCode = "Supplier is required";
    if (!formData.grnNo) errors.grnNo = "GRN No is required";

    if (isImport && !formData.currency)
      errors.currency = "Currency is required";
    if (isImport && toNumber(formData.exchangeRate) <= 0) {
      errors.exchangeRate = "Exchange Rate must be greater than 0";
    }

    const activeRows = isLocal
      ? localDetailRows.filter((row) => row.item)
      : importDetailRows.filter((row) => row.item);

    if (activeRows.length === 0) {
      addToast("Please add at least one item", "error");
      return false;
    }

    if (isLocal) {
      const invalidQty = localDetailRows.some(
        (row) => row.item && toNumber(row.acceptedQty) <= 0,
      );
      if (invalidQty) {
        addToast("Accepted Quantity must be greater than 0", "error");
        return false;
      }
    }

    if (isImport) {
      const invalidQty = importDetailRows.some(
        (row) => row.item && toNumber(row.accptQty) <= 0,
      );
      if (invalidQty) {
        addToast("Accepted Quantity must be greater than 0", "error");
        return false;
      }
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      addToast("Please fill all required fields correctly", "error");
      return false;
    }

    return true;
  };

  /* ========================================================================= */
  /* SAVE                                                                      */
  /* ========================================================================= */

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const localDetails = isLocal
        ? localDetailRows
            .filter((row) => row.item)
            .map((row) => ({
              id: toInteger(row.id) || 0,
              item: toInteger(row.item),
              hsnCode: toInteger(row.hsnCode) || null,
              taxType: row.taxType || "",
              taxPercent: toNumber(row.taxPercent),
              cgstRate: toNumber(row.cgstRate),
              sgstRate: toNumber(row.sgstRate),
              igstRate: toNumber(row.igstRate),
              challanQty: toNumber(row.challanQty),
              grnReceivedQty: toNumber(row.grnReceivedQty),
              acceptedQty: toNumber(row.acceptedQty),
              rejectedQty: toNumber(row.rejectedQty),
              purchaseorderQty: toNumber(row.purchaseorderQty),
              purchaseorderRate: toNumber(row.purchaseorderRate),
              rateInInr: toNumber(row.rateInInr),
              landedCostRate: toNumber(row.landedCostRate),
              additionalDuty: toNumber(row.additionalDuty),
              unit: toInteger(row.unit) || null,
              exciseToPost: Boolean(row.exciseToPost),
            }))
        : [];

      const importDetails = isImport
        ? importDetailRows
            .filter((row) => row.item)
            .map((row) => ({
              item: toInteger(row.item),
              challanQty: toNumber(row.challanQty),
              grnQty: toNumber(row.grnQty),
              accptQty: toNumber(row.accptQty),
              fobRateFc: toNumber(row.fobRateFc),
              dutyAmtInr: toNumber(row.dutyAmtInr),
            }))
        : [];

      const taxGrid = isLocal
        ? taxRows
            .filter((row) => row.particulars)
            .map((row) => ({
              id: toInteger(row.id) || 0,
              particulars: row.particulars || "",
              taxPercent: toNumber(row.taxPercent),
              acceptedQtyAmount: toNumber(row.acceptedQtyAmount),
              revisedAmount: toNumber(row.revisedAmount),
              ledgerAccount: row.ledgerAccount || "",
              debitCredit: row.debitCredit || "",
              debitAmount: toNumber(row.debitAmount),
              creditAmount: toNumber(row.creditAmount),
              postToFinanceAc: Boolean(row.postToFinanceAc),
            }))
        : [];

      const importPurchaseTax = isImport
        ? importTaxRows
            .filter((row) => row.particulars)
            .map((row) => ({
              particulars: row.particulars || "",
              tax: toNumber(row.tax),
              taxval1: toNumber(row.taxval1),
              taxAmount: toNumber(row.taxAmount),
              dbCr: row.dbCr || "",
              glSubledger: row.glSubledger || "",
            }))
        : [];

      const billChargesSummaryDTO = isLocal
        ? [
            {
              amountInWords: amountInWords(localTotalAmount),
              basicValue: localBasicValue,
              entryTaxApplicable: formData.entryTaxApplicable === "Yes",
              narration: formData.narration || "",
              paymentTerms: formData.paymentTerms || "",
              totalAmount: localTotalAmount,
              totalFreight: toNumber(formData.totalFreight),
              totalQty: localTotalQty,
            },
          ]
        : [];

      const importBillChargesSummaryDTO = isImport
        ? [
            {
              amountInWords: amountInWords(importNetAmount),
              narration: formData.narration || "",
              netAmount: importNetAmount,
              postVoucher: formData.postVoucher === "Yes",
              totDutyInr: importTotDutyInr,
              totFobValueFc: importTotFobValueFc,
              totFobValueInr: importTotFobValueInr,
              totFreInsInr: toNumber(formData.totFreInsInr),
              totFriInsFc: toNumber(formData.totFriInsFc),
              totLandCost: importTotLandCost,
              totalValueFc: importTotalValueFc,
            },
          ]
        : [];

      const payload = {
        ...(isEditMode && { id: editData.id }),

        active: formData.active !== false,
        belongsTo: formData.belongsTo || "",
        branch: toInteger(formData.branch),
        cancelRemarks: formData.cancelRemarks || "",

        createdBy:
          (isEditMode
            ? formData.createdBy
            : localStorage.getItem("userName")) || "SYSTEM",
        ...(isEditMode && {
          updatedBy: localStorage.getItem("userName") || "SYSTEM",
        }),

        creditAcc: formData.creditAcc || "",
        currency: toInteger(formData.currency) || null,
        date: dateOrNull(formData.date),
        // Backend does not yet map dealerType/eccType onto the entity
        // (see PurchaseDeliverySchServiceImpl#createUpdatePurchaseBillVOByPurchaseBillDTO),
        // so these are informational only for now - send a safe numeric
        // guess for dealerType and null for eccType (a string label with
        // no id lookup available) rather than a value that could fail
        // Jackson deserialization.
        dealerType: formData.dealerType === "Registered" ? 1 : 2,
        docDate: formData.docDate || todayISO(),
        dutyPerUnit: toNumber(formData.dutyPerUnit),
        eccType: null,
        exchangeRate: toNumber(formData.exchangeRate, 1),
        financialYear:
          formData.financialYear || String(new Date().getFullYear()),
        grnDate: dateOrNull(formData.grnDate),
        grnNo: formData.grnNo || "",
        igstApplicable: formData.igstApplicable === "Yes",
        modvatCopyReceived: formData.modvatCopyReceived === "Yes",
        orgId: ORG_ID,
        postingCategory: toInteger(formData.postingCategory) || null,
        purchaseorderDate: dateOrNull(formData.purchaseorderDate),
        purchaseorderNumber: formData.purchaseorderNumber || "",
        purchaseorderType: formData.purchaseorderType || "",
        reverseChrg: formData.reverseChrg === "Yes",
        statutoryForms: toInteger(formData.statutoryForms) || null,
        supplier: toInteger(formData.supplierCode),
        supplierDcInvDate: dateOrNull(formData.supplierDcInvDate),
        supplierDcInvNo: formData.supplierDcInvNo || "",
        supplierInvValue: formData.supplierInvValue || "",
        vendorDcNo: formData.vendorDcNo || "",
        voucherPostingDate: dateOrNull(formData.voucherPostingDate),
        excisable: Boolean(formData.excisable),

        purchaseDetails: localDetails,
        taxGrid,
        billChargesSummaryDTO,

        importPurchaseDetails: importDetails,
        importPurchaseTax,
        importBillChargesSummaryDTO,
      };

      console.log("Purchase Bill Payload:", payload);

      const response = await purchaseBillAPI.createUpdatePurchaseBill(payload);

      const status =
        response?.status === true ||
        response?.statusFlag === "Ok" ||
        response?.statusFlag === "Success";

      if (status) {
        addToast(
          isEditMode
            ? "Purchase bill updated successfully"
            : "Purchase bill created successfully",
          "success",
        );

        if (onSave)
          onSave(response?.paramObjectsMap?.purchaseBillVO || payload);
      } else {
        const errorMessage =
          response?.paramObjectsMap?.errorMessage ||
          response?.paramObjectsMap?.message ||
          response?.message ||
          "Failed to save purchase bill";

        addToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("Error saving purchase bill:", error);
      addToast(
        error?.response?.data?.paramObjectsMap?.errorMessage ||
          error?.response?.data?.message ||
          "Failed to save Purchase Bill.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ========================================================================= */
  /* TABS                                                                      */
  /* ========================================================================= */

  const LOCAL_TABS = [
    { key: "billDetail", label: "1-Bill Detail" },
    { key: "taxGrid", label: "2-Tax Grid" },
    { key: "chargesSummary", label: "3-Charges Summary" },
  ];

  const IMPORT_TABS = [
    { key: "billDetail", label: "1-Purchase Detail" },
    { key: "taxGrid", label: "2-Tax Details" },
    { key: "chargesSummary", label: "3-Charges Summary" },
  ];

  const activeTabs = isLocal ? LOCAL_TABS : IMPORT_TABS;

  useEffect(() => {
    if (!activeTabs.some((t) => t.key === activeTab)) {
      setActiveTab(activeTabs[0].key);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLocal]);

  /* ========================================================================= */
  /* GRID COLUMNS                                                              */
  /* ========================================================================= */

  const localDetailColumns = [
    { key: "item", label: "Item Code *", type: "select", options: itemOptions },
    {
      key: "itemDescription",
      label: "Item Description",
      type: "display",
      minWidth: "160px",
    },
    {
      key: "hsnCodeLabel",
      label: "HSN Code",
      type: "display",
      minWidth: "90px",
    },
    { key: "taxType", label: "Tax Type", type: "display", minWidth: "80px" },
    {
      key: "taxPercent",
      label: "Tax %",
      type: "number",
      disabled: true,
      minWidth: "70px",
    },
    { key: "unitLabel", label: "Unit", type: "display", minWidth: "70px" },
    { key: "challanQty", label: "Challan Qty", type: "number", step: "0.001" },
    {
      key: "grnReceivedQty",
      label: "GRN Received Qty",
      type: "number",
      step: "0.001",
    },
    {
      key: "acceptedQty",
      label: "Accepted Qty *",
      type: "number",
      step: "0.001",
    },
    {
      key: "rejectedQty",
      label: "Rejected Qty",
      type: "number",
      step: "0.001",
    },
    {
      key: "shortageQty",
      label: "Shortage Qty",
      type: "number",
      disabled: true,
    },
    { key: "purchaseorderQty", label: "PO Qty", type: "number", step: "0.001" },
    {
      key: "purchaseorderRate",
      label: "PO Rate",
      type: "number",
      step: "0.00001",
    },
    {
      key: "rateInSelectedCurrency",
      label: "Rate (Sel. Currency)",
      type: "number",
      disabled: true,
    },
    {
      key: "rateInInr",
      label: "Rate In INR *",
      type: "number",
      step: "0.00001",
    },
    {
      key: "landedCostRate",
      label: "Landed Cost Rate",
      type: "number",
      step: "0.001",
    },
    { key: "additionalDuty", label: "Additional Duty", type: "number" },
    { key: "amount", label: "Amount", type: "number", disabled: true },
    {
      key: "amountInSelectedCurrency",
      label: "Amount (Sel. Currency)",
      type: "number",
      disabled: true,
    },
    {
      key: "cgstRate",
      label: "CGST Rate",
      type: "number",
      disabled: true,
      minWidth: "70px",
    },
    { key: "cgstAmount", label: "CGST Amount", type: "number", disabled: true },
    {
      key: "sgstRate",
      label: "SGST Rate",
      type: "number",
      disabled: true,
      minWidth: "70px",
    },
    { key: "sgstAmount", label: "SGST Amount", type: "number", disabled: true },
    {
      key: "igstRate",
      label: "IGST Rate",
      type: "number",
      disabled: true,
      minWidth: "70px",
    },
    { key: "igstAmount", label: "IGST Amount", type: "number", disabled: true },
  ];

  const importDetailColumns = [
    { key: "item", label: "Item ID *", type: "select", options: itemOptions },
    {
      key: "itemDescription",
      label: "Item Description",
      type: "display",
      minWidth: "160px",
    },
    { key: "challanQty", label: "Challan Qty", type: "number", step: "0.001" },
    { key: "grnQty", label: "Grn Qty", type: "number", step: "0.001" },
    { key: "accptQty", label: "Accpt Qty *", type: "number", step: "0.001" },
    {
      key: "shortageQty",
      label: "Shortage Qty",
      type: "number",
      disabled: true,
    },
    {
      key: "fobRateFc",
      label: "FOB Rate(FC)",
      type: "number",
      step: "0.00001",
    },
    {
      key: "fobValueFc",
      label: "FOB Value(FC)",
      type: "number",
      disabled: true,
    },
    {
      key: "fobValueInr",
      label: "FOB Value (INR)",
      type: "number",
      disabled: true,
    },
    { key: "dutyAmtInr", label: "Duty Amt(INR)", type: "number" },
    { key: "valueFc", label: "Value(FC)", type: "number", disabled: true },
    { key: "valueInr", label: "Value (INR)", type: "number", disabled: true },
    {
      key: "landCostInr",
      label: "Land Cost(INR)",
      type: "number",
      disabled: true,
    },
  ];

  const localTaxColumns = [
    {
      key: "particulars",
      label: "Particulars",
      minWidth: "140px",
      disabled: (row) => row.auto,
    },
    {
      key: "taxPercent",
      label: "Tax %",
      type: "number",
      disabled: (row) => row.auto,
    },
    {
      key: "acceptedQtyAmount",
      label: "Accepted Qty Amount",
      type: "number",
      disabled: true,
    },
    { key: "revisedAmount", label: "Revised Amount", type: "number" },
    { key: "ledgerAccount", label: "Ledger Account", minWidth: "140px" },
    {
      key: "debitCredit",
      label: "Dr / Cr",
      type: "select",
      options: LOCAL_DR_CR_OPTIONS,
      minWidth: "80px",
    },
    {
      key: "debitAmount",
      label: "Debit Amount",
      type: "number",
      disabled: true,
    },
    {
      key: "creditAmount",
      label: "Credit Amount",
      type: "number",
      disabled: true,
    },
    { key: "postToFinanceAc", label: "Post To Finance A/c", type: "checkbox" },
  ];

  const importTaxColumns = [
    { key: "particulars", label: "Particulars", minWidth: "140px" },
    { key: "taxval1", label: "taxval1", type: "number" },
    { key: "tax", label: "Tax (%)", type: "number" },
    { key: "taxAmount", label: "Tax Amount", type: "number", disabled: true },
    {
      key: "dbCr",
      label: "Db / Cr",
      type: "select",
      options: DB_CR_OPTIONS,
      minWidth: "80px",
    },
    { key: "glSubledger", label: "GL / Subledger", minWidth: "140px" },
  ];

  /* ========================================================================= */
  /* RENDER                                                                    */
  /* ========================================================================= */

  return (
    <div className="p-2 max-w-7xl">
      {/* TITLE */}
      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {isEditMode ? "Edit Purchase Bill" : "Add Purchase Bill"}
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* HEADER */}
        <div>
          <SectionHeader>
            {isLocal ? "Purchase Bill" : "Import Purchase Bill"}
          </SectionHeader>

          <div className={fieldGrid}>
            {/* ---- COMMON FIELDS (shown for both Local & Import) ---- */}
            <Field
              type="select"
              label="Plant ID"
              name="branch"
              value={formData.branch}
              onChange={handleFieldChange}
              error={fieldErrors.branch}
              options={branchOptions}
              required
            />

            <Field
              label="Doc No"
              name="docId"
              value={
                generatingDocId ? "Generating..." : docId || "Auto (on save)"
              }
              onChange={() => {}}
              disabled
            />

            <Field
              type="select"
              label="Bill Type"
              name="billType"
              value={formData.billType}
              onChange={handleFieldChange}
              options={BILL_TYPE_OPTIONS}
              required
            />

            <Field
              type="select"
              label="Belongs To"
              name="belongsTo"
              value={formData.belongsTo}
              onChange={handleFieldChange}
              options={belongsToOptions}
            />

            <Field
              type="date"
              label="Doc Date"
              name="docDate"
              value={formData.docDate}
              onChange={handleFieldChange}
              error={fieldErrors.docDate}
              required
            />

            <Field
              type="select"
              label={isImport ? "Party ID" : "Supplier Code"}
              name="supplierCode"
              value={formData.supplierCode}
              onChange={handleFieldChange}
              error={fieldErrors.supplierCode}
              options={supplierOptions}
              required
            />

            <Field
              label={isImport ? "Party Name" : "Supplier Name"}
              name="supplierName"
              value={formData.supplierName}
              onChange={() => {}}
              disabled
            />

            {/* ---- LOCAL-ONLY: supplier state / GSTN ---- */}
            {isLocal && (
              <>
                <Field
                  label="GST State"
                  name="supplierState"
                  value={formData.supplierState}
                  onChange={() => {}}
                  disabled
                />
                <Field
                  label="GSTN No"
                  name="gstnNo"
                  value={formData.gstnNo}
                  onChange={() => {}}
                  disabled
                />
              </>
            )}

            {/* ---- IMPORT-ONLY: Credit A/c, Tax Structure, Statutory Forms ---- */}
            {isImport && (
              <>
                <Field
                  label="Credit A/c"
                  name="creditAcc"
                  value={formData.creditAcc}
                  onChange={handleFieldChange}
                />
                <Field
                  label="Tax Structure Name"
                  name="taxStructureName"
                  value={formData.taxStructureName}
                  onChange={() => {}}
                  disabled
                />
                <Field
                  type="select"
                  label="Statutory Forms"
                  name="statutoryForms"
                  value={formData.statutoryForms}
                  onChange={handleFieldChange}
                  options={STATUTORY_FORM_OPTIONS}
                />
              </>
            )}

            <Field
              type="select"
              label="GRN No"
              name="grnNo"
              value={formData.grnNo}
              onChange={handleFieldChange}
              error={fieldErrors.grnNo}
              options={grnOptions}
              required
              disabled={!formData.supplierCode}
            />

            {/* ---- LOCAL-ONLY: GRN Date ---- */}
            {isLocal && (
              <Field
                type="date"
                label="GRN Date"
                name="grnDate"
                value={formData.grnDate}
                onChange={() => {}}
                disabled
              />
            )}

            {/* ---- IMPORT-ONLY: Supp.Inv.No / Supp.Inv.Dt / Supplier Invoice Value ---- */}
            {isImport && (
              <>
                <Field
                  label="Supp.Inv.No"
                  name="supplierDcInvNo"
                  value={formData.supplierDcInvNo}
                  onChange={handleFieldChange}
                />
                <Field
                  type="date"
                  label="Supp.Inv.Dt."
                  name="supplierDcInvDate"
                  value={formData.supplierDcInvDate}
                  onChange={handleFieldChange}
                />
                <Field
                  label="Supplier Invoice Value"
                  name="supplierInvValue"
                  type="number"
                  step="0.01"
                  value={formData.supplierInvValue}
                  onChange={handleFieldChange}
                />
              </>
            )}

            <Field
              type="select"
              label="Currency"
              name="currency"
              value={formData.currency}
              onChange={handleFieldChange}
              error={fieldErrors.currency}
              options={currencyOptions}
              required={isImport}
            />

            <Field
              label={isImport ? "ExRate" : "Exchange Rate"}
              name="exchangeRate"
              type="number"
              step="0.0001"
              min="0"
              value={formData.exchangeRate}
              onChange={handleFieldChange}
              error={fieldErrors.exchangeRate}
            />

            {/* ---- LOCAL-ONLY: PO / Vendor DC / Supplier DC-INV / Modvat / tax & posting fields ---- */}
            {isLocal && (
              <>
                <Field
                  label="PO No/PC No"
                  name="purchaseorderNumber"
                  value={formData.purchaseorderNumber}
                  onChange={() => {}}
                  disabled
                />
                <Field
                  type="date"
                  label="PO Date"
                  name="purchaseorderDate"
                  value={formData.purchaseorderDate}
                  onChange={handleFieldChange}
                />
                <Field
                  label="PO Type"
                  name="purchaseorderType"
                  value={formData.purchaseorderType}
                  onChange={() => {}}
                  disabled
                />

                <Field
                  label="Vendor DC No."
                  name="vendorDcNo"
                  value={formData.vendorDcNo}
                  onChange={handleFieldChange}
                />
                <Field
                  label="Supplier DC/INV No."
                  name="supplierDcInvNo"
                  value={formData.supplierDcInvNo}
                  onChange={handleFieldChange}
                />
                <Field
                  type="date"
                  label="Supplier DC/INV Date"
                  name="supplierDcInvDate"
                  value={formData.supplierDcInvDate}
                  onChange={handleFieldChange}
                />

                <Field
                  type="select"
                  label="Modvat Copy Received"
                  name="modvatCopyReceived"
                  value={formData.modvatCopyReceived}
                  onChange={handleFieldChange}
                  options={YES_NO}
                />

                <Field
                  type="checkbox"
                  label="Excisable ?"
                  name="excisable"
                  checked={formData.excisable}
                  onChange={handleFieldChange}
                />
                <Field
                  type="select"
                  label="Is Reverse Chrg"
                  name="reverseChrg"
                  value={formData.reverseChrg}
                  onChange={handleFieldChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="Is IGST Appl"
                  name="igstApplicable"
                  value={formData.igstApplicable}
                  onChange={handleFieldChange}
                  options={YES_NO}
                />
                <Field
                  label="Dealer Type"
                  name="dealerType"
                  value={formData.dealerType}
                  onChange={() => {}}
                  disabled
                />
                <Field
                  type="select"
                  label="Posting Category"
                  name="postingCategory"
                  value={formData.postingCategory}
                  onChange={handleFieldChange}
                  options={postingCategoryOptions}
                />
                <Field
                  label="Ecc Type"
                  name="eccTypeCode"
                  value={formData.eccTypeCode}
                  onChange={() => {}}
                  disabled
                />
                <Field
                  type="date"
                  label="Voucher Posting Date"
                  name="voucherPostingDate"
                  value={formData.voucherPostingDate}
                  onChange={handleFieldChange}
                />
                <Field
                  type="date"
                  label="Date"
                  name="date"
                  value={formData.date}
                  onChange={handleFieldChange}
                />
                <Field
                  label="Duty Per Unit"
                  name="dutyPerUnit"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.dutyPerUnit}
                  onChange={handleFieldChange}
                />
                <Field
                  label="Financial Year"
                  name="financialYear"
                  value={formData.financialYear}
                  onChange={handleFieldChange}
                />
              </>
            )}
          </div>
        </div>

        {/* TABS */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-2">
            <div className="flex overflow-x-auto">
              {activeTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-1 text-xs font-semibold rounded-t whitespace-nowrap ${
                    activeTab === tab.key
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "billDetail" && (
              <button
                type="button"
                onClick={isLocal ? addLocalRow : addImportRow}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
              >
                <Plus size={12} />
              </button>
            )}

            {activeTab === "taxGrid" && (
              <button
                type="button"
                onClick={isLocal ? addTaxRow : addImportTaxRow}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {/* BILL / ITEM DETAIL */}
          {activeTab === "billDetail" && isLocal && (
            <>
              <DynamicTable
                columns={localDetailColumns}
                rows={localDetailRows}
                onCellChange={handleLocalCellChange}
                onRemoveRow={removeLocalRow}
              />
              <div className="flex justify-end gap-4 mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                <span>
                  Total Qty:{" "}
                  <strong className="ml-1">{money(localTotalQty)}</strong>
                </span>
                <span>
                  Basic Value:{" "}
                  <strong className="ml-1">{money(localBasicValue)}</strong>
                </span>
                <span>
                  GST Total:{" "}
                  <strong className="ml-1">{money(localGstTotal)}</strong>
                </span>
              </div>
            </>
          )}

          {activeTab === "billDetail" && isImport && (
            <>
              <DynamicTable
                columns={importDetailColumns}
                rows={importDetailRows}
                onCellChange={handleImportCellChange}
                onRemoveRow={removeImportRow}
              />
              <div className="flex justify-end gap-4 mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                <span>
                  Total FOB (FC):{" "}
                  <strong className="ml-1">{money(importTotFobValueFc)}</strong>
                </span>
                <span>
                  Total FOB (INR):{" "}
                  <strong className="ml-1">
                    {money(importTotFobValueInr)}
                  </strong>
                </span>
                <span>
                  Total Duty (INR):{" "}
                  <strong className="ml-1">{money(importTotDutyInr)}</strong>
                </span>
              </div>
            </>
          )}

          {/* TAX GRID */}
          {activeTab === "taxGrid" && isLocal && (
            <>
              <DynamicTable
                columns={localTaxColumns}
                rows={taxRows}
                onCellChange={handleTaxCellChange}
                onRemoveRow={removeTaxRow}
              />
              <div className="flex justify-end gap-4 px-1 pt-1 text-[11px] text-gray-500 dark:text-gray-400">
                <span>
                  Basic Value:{" "}
                  <strong className="ml-1">{money(localBasicValue)}</strong>
                </span>
                <span>
                  Tax Grid Total:{" "}
                  <strong className="ml-1">{money(taxRowsTotal)}</strong>
                </span>
              </div>
            </>
          )}

          {activeTab === "taxGrid" && isImport && (
            <>
              <DynamicTable
                columns={importTaxColumns}
                rows={importTaxRows}
                onCellChange={handleImportTaxCellChange}
                onRemoveRow={removeImportTaxRow}
              />
              <div className="flex justify-end px-1 pt-1 text-[11px] text-gray-500 dark:text-gray-400">
                <span>
                  Tax Total:{" "}
                  <strong className="ml-1">{money(importTaxTotal)}</strong>
                </span>
              </div>
            </>
          )}

          {/* CHARGES SUMMARY */}
          {activeTab === "chargesSummary" && isLocal && (
            <div className="pt-2 space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Field
                  label="Total Qty"
                  name="localTotalQty"
                  value={money(localTotalQty)}
                  onChange={() => {}}
                  disabled
                />
                <Field
                  label="Basic Value"
                  name="localBasicValue"
                  value={money(localBasicValue)}
                  onChange={() => {}}
                  disabled
                />
                <Field
                  label="Tax Total"
                  name="taxRowsTotal"
                  value={money(taxRowsTotal)}
                  onChange={() => {}}
                  disabled
                />
                <Field
                  label="Total Freight"
                  name="totalFreight"
                  type="number"
                  step="0.01"
                  value={formData.totalFreight}
                  onChange={handleFieldChange}
                />
                <Field
                  label="Total Amount"
                  name="localTotalAmount"
                  value={money(localTotalAmount)}
                  onChange={() => {}}
                  disabled
                />
                <Field
                  label="Amount in Words"
                  name="amountInWords"
                  value={amountInWords(wordsSource)}
                  onChange={() => {}}
                  disabled
                  className="col-span-2"
                />
                <Field
                  type="select"
                  label="Entry Tax Applicable"
                  name="entryTaxApplicable"
                  value={formData.entryTaxApplicable}
                  onChange={handleFieldChange}
                  options={YES_NO}
                />
              </div>
              <div className={fieldGrid}>
                <Field
                  label="Narration"
                  name="narration"
                  value={formData.narration}
                  onChange={handleFieldChange}
                  className="col-span-2"
                />
                <Field
                  label="Payment Terms"
                  name="paymentTerms"
                  value={formData.paymentTerms}
                  onChange={handleFieldChange}
                  className="col-span-2"
                />
              </div>
            </div>
          )}

          {activeTab === "chargesSummary" && isImport && (
            <div className="pt-2 space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Field
                  label="Tot FOB Value (FC)"
                  name="totFobValueFc"
                  value={money(importTotFobValueFc)}
                  onChange={() => {}}
                  disabled
                />
                <Field
                  label="Tot Fri + Ins (FC)"
                  name="totFriInsFc"
                  type="number"
                  step="0.01"
                  value={formData.totFriInsFc}
                  onChange={handleFieldChange}
                />
                <Field
                  label="Total Value (FC)"
                  name="totalValueFc"
                  value={money(importTotalValueFc)}
                  onChange={() => {}}
                  disabled
                />
                <Field
                  label="Tot FOB Value(INR)"
                  name="totFobValueInr"
                  value={money(importTotFobValueInr)}
                  onChange={() => {}}
                  disabled
                />
                <Field
                  label="Tot Duty (INR)"
                  name="totDutyInr"
                  value={money(importTotDutyInr)}
                  onChange={() => {}}
                  disabled
                />
                <Field
                  label="Tot Fre + Ins (INR)"
                  name="totFreInsInr"
                  type="number"
                  step="0.01"
                  value={formData.totFreInsInr}
                  onChange={handleFieldChange}
                />
                <Field
                  label="Tot Land Cost"
                  name="totLandCost"
                  value={money(importTotLandCost)}
                  onChange={() => {}}
                  disabled
                />
                <Field
                  label="Net Amount"
                  name="netAmount"
                  value={money(importNetAmount)}
                  onChange={() => {}}
                  disabled
                />
                <Field
                  type="select"
                  label="Post Voucher"
                  name="postVoucher"
                  value={formData.postVoucher}
                  onChange={handleFieldChange}
                  options={YES_NO}
                />
                <Field
                  label="Amount in Words"
                  name="amountInWords"
                  value={amountInWords(wordsSource)}
                  onChange={() => {}}
                  disabled
                  className="col-span-2 md:col-span-3"
                />
              </div>
              <div className={fieldGrid}>
                <Field
                  label="Narration"
                  name="narration"
                  value={formData.narration}
                  onChange={handleFieldChange}
                  className="col-span-2"
                />
              </div>
            </div>
          )}
        </section>

        {/* BUTTONS */}
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <X className="h-3 w-3" />
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-3 w-3" />
            {isSubmitting ? "Saving..." : isEditMode ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseBillForm;

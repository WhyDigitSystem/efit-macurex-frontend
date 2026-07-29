import { ArrowLeft, Save, X, Plus, Trash2, Copy } from "lucide-react";
import { useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import dayjs from "dayjs";
import apiClient from "../../../api/apiClient";
import { useToast } from "../../Toast/ToastContext";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const labelClasses = "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid = "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-2 items-start";

const SectionHeader = ({ children }) => (
  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">{children}</h3>
);

const InputField = ({ label, required, error, children }) => (
  <div>
    {label && <label className={labelClasses}>{label}{required && <span className="text-red-500"> *</span>}</label>}
    {children}
    {error && <p className="text-[10px] text-red-500 mt-0.5">{error}</p>}
  </div>
);

const ToggleSwitch = ({ value, onChange }) => (
  <button type="button" onClick={() => onChange(!value)}
    className={`relative flex items-center w-12 h-6 rounded-full transition-colors ${value ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"}`}>
    <span className={`absolute h-5 w-5 bg-white rounded-full shadow transition-transform ${value ? "translate-x-6" : "translate-x-0.5"}`} />
  </button>
);

const thClass = "px-1 py-0.5 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap text-[10px]";

const PLANT_OPTIONS = ["Plant 1", "Plant 2", "Plant 3"];
const BELONGS_TO_OPTIONS = ["Company", "Individual", "Other"];
const LOCATION_OPTIONS = ["Warehouse A", "Warehouse B", "Warehouse C", "Store"];
const SUPPLIER_OPTIONS = ["SUP001 - ABC Corp", "SUP002 - XYZ Ltd", "SUP003 - PQR Enterprises"];
const PO_OPTIONS = ["PO-001", "PO-002", "PO-003", "PC-001", "PC-002"];
const CURRENCY_OPTIONS = ["INR", "USD", "EUR", "GBP"];
const GST_STATE_OPTIONS = ["Maharashtra", "Gujarat", "Karnataka", "Tamil Nadu", "Delhi", "Uttar Pradesh", "Rajasthan"];
const DEALER_TYPE_OPTIONS = ["Regular", "Composition", "Unregistered", "SEZ"];
const YES_NO_OPTIONS = ["Yes", "No"];
const ITEM_OPTIONS = ["ITEM001 - Raw Material A", "ITEM002 - Component B", "ITEM003 - Finished C", "ITEM004 - Consumable D"];
const UNIT_OPTIONS = ["Nos", "Kg", "Gms", "Ltr", "Mtr", "Pcs", "Box", "Pair"];
const COUNTRY_OPTIONS = ["India", "USA", "UK", "Germany", "Japan", "China"];
const ACC_UNIT_OPTIONS = ["Nos", "Kg", "Gms", "Ltr", "Mtr"];

const getDefaultValues = (data) => ({
  plantId: data?.plantId || "",
  belongsTo: data?.belongsTo || "",
  location: data?.location || "",
  supplierCode: data?.supplierCode || "",
  supplierName: data?.supplierName || "",
  address: data?.address || "",
  gatePassNo: data?.gatePassNo || "",
  poNo: data?.poNo || "",
  scheduleNo: data?.scheduleNo || "",
  scheduleDate: data?.scheduleDate || "",
  currency: data?.currency || "",
  exchangeRate: data?.exchangeRate || "",
  grossAmount: data?.grossAmount || "",
  totalQtyKg: data?.totalQtyKg || "",
  discountPerc: data?.discountPerc || "",
  eSugamNoToggle: data?.eSugamNoToggle ?? "No",
  grnNo: data?.grnNo || "STGRN" + String(Date.now()).slice(-6),
  grnDate: data?.grnDate || dayjs().format("YYYY-MM-DD"),
  gstState: data?.gstState || "",
  isGstApplicable: data?.isGstApplicable ?? false,
  gstinNo: data?.gstinNo || "",
  dealerType: data?.dealerType || "",
  country: data?.country || "",
  isReverseCharge: data?.isReverseCharge ?? false,
  schStartDate: data?.schStartDate || "",
  schEndDate: data?.schEndDate || "",
  grnClearTime: data?.grnClearTime || dayjs().format("HH:mm"),
  modvatCopyReceived: data?.modvatCopyReceived ?? false,
  partyDcNo: data?.partyDcNo || "",
  supplierDcDate: data?.supplierDcDate || "",
  eSugamNo: data?.eSugamNo || "",
  active: data?.active === "Active" || data?.active !== false,
  id: data?.id || 0,
  purchaseDetail: data?.purchaseDetail?.length
    ? data.purchaseDetail.map((r) => ({
        itemCode: r.itemCode || "", itemDescription: r.itemDescription || "", primaryUnit: r.primaryUnit || "",
        stock: r.stock ?? false, purchaseTolerance: r.purchaseTolerance ?? "", inspectionable: r.inspectionable ?? false,
        poPcRate: r.poPcRate ?? "", poQty: r.poQty ?? "", poUnit: r.poUnit || "", challanQty: r.challanQty ?? "",
        storeStock: r.storeStock ?? "", pendingQty: r.pendingQty ?? "", receivedQty: r.receivedQty ?? "",
        receivedUnit: r.receivedUnit || "", conversionFactor: r.conversionFactor ?? "", recQtyPrimaryUnit: r.recQtyPrimaryUnit ?? "",
        acceptQty: r.acceptQty ?? "", accQtyPrimaryUnit: r.accQtyPrimaryUnit ?? "", accUnit: r.accUnit || "",
        rejectQty: r.rejectQty ?? "", rejQtyPrimaryUnit: r.rejQtyPrimaryUnit ?? "", excessQty: r.excessQty ?? "",
        amount: r.amount ?? "", apportionedCost: r.apportionedCost ?? "", insurance: r.insurance ?? "",
        handlingCharges: r.handlingCharges ?? "", loss: r.loss ?? "", landedCostRate: r.landedCostRate ?? "",
        landedValue: r.landedValue ?? "",
      }))
    : [getDefaultPurchaseRow()],
  netAmount: data?.netAmount ?? "",
  basicAmount: data?.basicAmount ?? "",
  invoiceSentOn: data?.invoiceSentOn || "",
  remarks: data?.remarks || "",
  attachments: data?.attachments?.length ? data.attachments : [{ fileName: "", file: null, remarks: "" }],
});

const getDefaultPurchaseRow = () => ({
  itemCode: "", itemDescription: "", primaryUnit: "", stock: false, purchaseTolerance: "",
  inspectionable: false, poPcRate: "", poQty: "", poUnit: "", challanQty: "", storeStock: "",
  pendingQty: "", receivedQty: "", receivedUnit: "", conversionFactor: "", recQtyPrimaryUnit: "",
  acceptQty: "", accQtyPrimaryUnit: "", accUnit: "", rejectQty: "", rejQtyPrimaryUnit: "",
  excessQty: "", amount: "", apportionedCost: "", insurance: "", handlingCharges: "",
  loss: "", landedCostRate: "", landedValue: "",
});

const StockTransferGRNForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId")) || 0;
  const branch = Number(localStorage.getItem("branchId")) || 1000000001;

  const {
    control, handleSubmit, formState: { errors }, setValue, watch, register, reset,
  } = useForm({
    mode: "onTouched",
    defaultValues: getDefaultValues(data),
  });

  const { fields: detailFields, append: appendDetail, remove: removeDetail } = useFieldArray({
    control, name: "purchaseDetail",
  });

  const { fields: attachFields, append: appendAttach, remove: removeAttach } = useFieldArray({
    control, name: "attachments",
  });

  const watchDetail = watch("purchaseDetail");

  const setCalc = (idx, field, val) => {
    setValue(`purchaseDetail.${idx}.${field}`, val, { shouldValidate: false, shouldDirty: false });
  };

  const handleDetailChange = (idx, field, value, row) => {
    setValue(`purchaseDetail.${idx}.${field}`, value, { shouldDirty: true });
    if (field === "receivedQty" || field === "poQty") {
      const poQty = parseFloat(field === "poQty" ? value : row.poQty) || 0;
      const recQty = parseFloat(field === "receivedQty" ? value : row.receivedQty) || 0;
      setCalc(idx, "pendingQty", Math.max(0, poQty - recQty));
    }
    if (field === "receivedQty" || field === "conversionFactor") {
      const rq = parseFloat(field === "receivedQty" ? value : row.receivedQty) || 0;
      const cf = parseFloat(field === "conversionFactor" ? value : row.conversionFactor) || 0;
      setCalc(idx, "recQtyPrimaryUnit", rq * cf);
    }
    if (field === "acceptQty" || field === "conversionFactor") {
      const aq = parseFloat(field === "acceptQty" ? value : row.acceptQty) || 0;
      const cf = parseFloat(field === "conversionFactor" ? value : row.conversionFactor) || 0;
      setCalc(idx, "accQtyPrimaryUnit", aq * cf);
    }
    if (field === "rejectQty" || field === "conversionFactor") {
      const rj = parseFloat(field === "rejectQty" ? value : row.rejectQty) || 0;
      const cf = parseFloat(field === "conversionFactor" ? value : row.conversionFactor) || 0;
      setCalc(idx, "rejQtyPrimaryUnit", rj * cf);
    }
    if (field === "landedCostRate" || field === "receivedQty") {
      const lcr = parseFloat(field === "landedCostRate" ? value : row.landedCostRate) || 0;
      const rq = parseFloat(field === "receivedQty" ? value : row.receivedQty) || 0;
      setCalc(idx, "landedValue", lcr * rq);
    }
  };

  const copyDetailRow = (idx) => {
    const row = watchDetail?.[idx];
    if (row) {
      appendDetail({ ...getDefaultPurchaseRow(), ...row });
    }
  };

  const addDetailRow = () => appendDetail(getDefaultPurchaseRow());

  const validate = () => {
    const errs = {};
    const vals = watch();
    if (!vals.plantId) errs.plantId = "Required";
    if (!vals.belongsTo) errs.belongsTo = "Required";
    if (!vals.location) errs.location = "Required";
    if (!vals.supplierCode) errs.supplierCode = "Required";
    if (!vals.gatePassNo) errs.gatePassNo = "Required";
    if (!vals.grnNo) errs.grnNo = "Required";
    if (!vals.grnDate) errs.grnDate = "Required";
    if (!vals.gstState) errs.gstState = "Required";
    if (vals.isGstApplicable === undefined) errs.isGstApplicable = "Required";
    if (vals.modvatCopyReceived === undefined) errs.modvatCopyReceived = "Required";
    const detailErrs = {};
    (watchDetail || []).forEach((r, i) => {
      if (!r.itemCode) detailErrs[`purchaseDetail.${i}.itemCode`] = "Required";
      if (!r.inspectionable) detailErrs[`purchaseDetail.${i}.inspectionable`] = "Required";
      if (!r.receivedQty && r.receivedQty !== 0) detailErrs[`purchaseDetail.${i}.receivedQty`] = "Required";
      if (!r.amount && r.amount !== 0) detailErrs[`purchaseDetail.${i}.amount`] = "Required";
    });
    return { headerErrs: errs, detailErrs };
  };

  const onSubmit = async (formData) => {
    const { headerErrs, detailErrs } = validate();
    if (Object.keys(headerErrs).length || Object.keys(detailErrs).length) {
      addToast("Please fill all mandatory fields", "error");
      return;
    }
    const payload = {
      ...(formData.id ? { id: formData.id } : {}),
      orgId, branch,
      ...formData,
      createdBy: localStorage.getItem("userName") || "SYSTEM",
      cancelRemarks: "",
    };
    try {
      await apiClient.post("/api/dev/createUpdateStockTransferGRNMaster", payload);
      addToast(data ? "Stock Transfer GRN Updated!" : "Stock Transfer GRN Saved!", "success");
      onBack();
    } catch {
      addToast("Failed to save Stock Transfer GRN.", "error");
    }
  };

  const renderHeader = (errMap) => (
    <div className={fieldGrid}>
      <InputField label="Plant ID" required error={errMap.plantId}>
        <Controller control={control} name="plantId" render={({ field }) => (
          <select {...field} className={`${controlClasses} ${errMap.plantId ? "border-red-500" : ""}`}>
            <option value="">Select</option>
            {PLANT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )} />
      </InputField>
      <InputField label="Belongs To" required error={errMap.belongsTo}>
        <Controller control={control} name="belongsTo" render={({ field }) => (
          <select {...field} className={`${controlClasses} ${errMap.belongsTo ? "border-red-500" : ""}`}>
            <option value="">Select</option>
            {BELONGS_TO_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )} />
      </InputField>
      <InputField label="Location" required error={errMap.location}>
        <Controller control={control} name="location" render={({ field }) => (
          <select {...field} className={`${controlClasses} ${errMap.location ? "border-red-500" : ""}`}>
            <option value="">Select</option>
            {LOCATION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )} />
      </InputField>
      <InputField label="Supplier Code" required error={errMap.supplierCode}>
        <Controller control={control} name="supplierCode" render={({ field }) => (
          <select {...field} className={`${controlClasses} ${errMap.supplierCode ? "border-red-500" : ""}`}>
            <option value="">Select</option>
            {SUPPLIER_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )} />
      </InputField>
      <InputField label="Supplier Name">
        <input {...register("supplierName")} disabled className={`${controlClasses} bg-gray-50 dark:bg-gray-800`} />
      </InputField>
      <InputField label="Address">
        <input {...register("address")} className={controlClasses} />
      </InputField>
      <InputField label="Gate Pass No" required error={errMap.gatePassNo}>
        <input {...register("gatePassNo")} className={`${controlClasses} ${errMap.gatePassNo ? "border-red-500" : ""}`} />
      </InputField>
      <InputField label="PO No/PC No">
        <Controller control={control} name="poNo" render={({ field }) => (
          <select {...field} className={controlClasses}>
            <option value="">Select</option>
            {PO_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )} />
      </InputField>
      <InputField label="Schedule No">
        <input {...register("scheduleNo")} className={controlClasses} />
      </InputField>
      <InputField label="Schedule Date">
        <input type="date" {...register("scheduleDate")} className={controlClasses} />
      </InputField>
      <InputField label="Currency">
        <Controller control={control} name="currency" render={({ field }) => (
          <select {...field} className={controlClasses}>
            <option value="">Select</option>
            {CURRENCY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )} />
      </InputField>
      <InputField label="Exchange Rate">
        <input type="number" step="0.0001" {...register("exchangeRate")} className={controlClasses} />
      </InputField>
      <InputField label="Gross Amount">
        <input type="number" step="0.01" {...register("grossAmount")} className={controlClasses} />
      </InputField>
      <InputField label="Total Qty in Kg">
        <input type="number" step="0.001" {...register("totalQtyKg")} className={controlClasses} />
      </InputField>
      <InputField label="Discount %">
        <input type="number" step="0.01" {...register("discountPerc")} className={controlClasses} />
      </InputField>
      <InputField label="e-Sugam No.">
        <Controller control={control} name="eSugamNoToggle" render={({ field }) => (
          <ToggleSwitch value={field.value === "Yes"} onChange={(v) => field.onChange(v ? "Yes" : "No")} />
        )} />
      </InputField>
      <InputField label="GRN No" required error={errMap.grnNo}>
        <input {...register("grnNo")} disabled className={`${controlClasses} bg-gray-50 dark:bg-gray-800 ${errMap.grnNo ? "border-red-500" : ""}`} />
      </InputField>
      <InputField label="GRN Date" required error={errMap.grnDate}>
        <input type="date" {...register("grnDate")} className={`${controlClasses} ${errMap.grnDate ? "border-red-500" : ""}`} />
      </InputField>
      <InputField label="GST State" required error={errMap.gstState}>
        <Controller control={control} name="gstState" render={({ field }) => (
          <select {...field} className={`${controlClasses} ${errMap.gstState ? "border-red-500" : ""}`}>
            <option value="">Select</option>
            {GST_STATE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )} />
      </InputField>
      <InputField label="Is GST Applicable" required error={errMap.isGstApplicable}>
        <Controller control={control} name="isGstApplicable" render={({ field }) => (
          <input type="checkbox" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
        )} />
      </InputField>
      <InputField label="GSTIN No">
        <input {...register("gstinNo")} className={controlClasses} />
      </InputField>
      <InputField label="Dealer Type">
        <Controller control={control} name="dealerType" render={({ field }) => (
          <select {...field} className={controlClasses}>
            <option value="">Select</option>
            {DEALER_TYPE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )} />
      </InputField>
      <InputField label="Country">
        <Controller control={control} name="country" render={({ field }) => (
          <select {...field} className={controlClasses}>
            <option value="">Select</option>
            {COUNTRY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )} />
      </InputField>
      <InputField label="Is Reverse Charge">
        <Controller control={control} name="isReverseCharge" render={({ field }) => (
          <input type="checkbox" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
        )} />
      </InputField>
      <InputField label="Sch. Start Date">
        <input type="date" {...register("schStartDate")} className={controlClasses} />
      </InputField>
      <InputField label="Sch. End Date">
        <input type="date" {...register("schEndDate")} className={controlClasses} />
      </InputField>
      <InputField label="GRN Clear Time">
        <input type="time" {...register("grnClearTime")} disabled className={`${controlClasses} bg-gray-50 dark:bg-gray-800`} />
      </InputField>
      <InputField label="Modvat Copy Received" required error={errMap.modvatCopyReceived}>
        <Controller control={control} name="modvatCopyReceived" render={({ field }) => (
          <input type="checkbox" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
        )} />
      </InputField>
      <InputField label="Party DC No./Invoice No">
        <input {...register("partyDcNo")} className={controlClasses} />
      </InputField>
      <InputField label="Supplier DC Date">
        <input type="date" {...register("supplierDcDate")} className={controlClasses} />
      </InputField>
      <InputField label="e-Sugam No">
        <input {...register("eSugamNo")} className={controlClasses} />
      </InputField>
    </div>
  );

  const purchaseDetailColumns = [
    { key: "itemCode", label: "Item Code", width: "100px" },
    { key: "itemDescription", label: "Item Description", width: "130px" },
    { key: "primaryUnit", label: "Primary Unit", width: "70px" },
    { key: "stock", label: "Stock?", width: "45px" },
    { key: "purchaseTolerance", label: "Purchase Tolerance", width: "70px" },
    { key: "inspectionable", label: "Inspectionable?", width: "70px" },
    { key: "poPcRate", label: "PO/PC Rate", width: "65px" },
    { key: "poQty", label: "PO Qty", width: "50px" },
    { key: "poUnit", label: "PO Unit", width: "50px" },
    { key: "challanQty", label: "Challan Qty", width: "60px" },
    { key: "storeStock", label: "Store Stock", width: "60px" },
    { key: "pendingQty", label: "Pending Qty", width: "60px" },
    { key: "receivedQty", label: "Received Qty", width: "65px" },
    { key: "receivedUnit", label: "Received Unit", width: "65px" },
    { key: "conversionFactor", label: "Conversion Factor", width: "70px" },
    { key: "recQtyPrimaryUnit", label: "Rec Qty in Primary Unit", width: "80px" },
    { key: "acceptQty", label: "Accept Qty", width: "60px" },
    { key: "accQtyPrimaryUnit", label: "Acc Qty in Primary Unit", width: "80px" },
    { key: "accUnit", label: "Acc Unit", width: "55px" },
    { key: "rejectQty", label: "Reject Qty", width: "60px" },
    { key: "rejQtyPrimaryUnit", label: "Rej Qty in Primary Unit", width: "80px" },
    { key: "excessQty", label: "Excess Qty", width: "55px" },
    { key: "amount", label: "Amount", width: "65px" },
    { key: "apportionedCost", label: "Apportioned Cost", width: "75px" },
    { key: "insurance", label: "Insurance", width: "60px" },
    { key: "handlingCharges", label: "Handling Charges", width: "75px" },
    { key: "loss", label: "Loss", width: "45px" },
    { key: "landedCostRate", label: "Landed Cost Rate", width: "70px" },
    { key: "landedValue", label: "Landed Value", width: "70px" },
  ];

  const renderCell = (col, row, idx) => {
    const base = `purchaseDetail.${idx}.`;
    const errKey = `${base}${col.key}`;
    const isReadonly =
      col.key === "pendingQty" || col.key === "recQtyPrimaryUnit" ||
      col.key === "accQtyPrimaryUnit" || col.key === "rejQtyPrimaryUnit" ||
      col.key === "landedValue" || col.key === "poQty" || col.key === "poUnit" ||
      col.key === "itemDescription";

    const cls = `${controlClasses} w-[${col.width}] ${isReadonly ? "bg-gray-50 dark:bg-gray-800" : ""}`;

    const isItemCodeSelect = col.key === "itemCode";
    const isUnitSelect = col.key === "primaryUnit" || col.key === "receivedUnit" || col.key === "accUnit";
    const isCheckbox = col.key === "stock" || col.key === "inspectionable";

    if (isCheckbox) {
      return (
        <Controller control={control} name={`${base}${col.key}`} render={({ field }) => (
          <input type="checkbox" checked={field.value} onChange={(e) => handleDetailChange(idx, col.key, e.target.checked, row)} className="h-3.5 w-3.5 rounded border-gray-300" />
        )} />
      );
    }
    if (isItemCodeSelect) {
      return (
        <Controller control={control} name={`${base}${col.key}`} render={({ field }) => (
          <select {...field} onChange={(e) => handleDetailChange(idx, col.key, e.target.value, row)} className={`${controlClasses} w-[${col.width}]`}>
            <option value="">Select</option>
            {ITEM_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )} />
      );
    }
    if (isUnitSelect) {
      return (
        <Controller control={control} name={`${base}${col.key}`} render={({ field }) => (
          <select {...field} onChange={(e) => handleDetailChange(idx, col.key, e.target.value, row)} className={`${controlClasses} w-[${col.width}]`}>
            <option value="">-</option>
            {(col.key === "accUnit" ? ACC_UNIT_OPTIONS : UNIT_OPTIONS).map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )} />
      );
    }
    if (isReadonly) {
      return <input value={row?.[col.key] ?? ""} readOnly className={cls} />;
    }
    return (
      <input
        type={col.key === "amount" || col.key === "poPcRate" || col.key === "exchangeRate" || col.key === "conversionFactor" || col.key === "challanQty" || col.key === "storeStock" || col.key === "purchaseTolerance" || col.key === "acceptQty" || col.key === "rejectQty" || col.key === "excessQty" || col.key === "apportionedCost" || col.key === "insurance" || col.key === "handlingCharges" || col.key === "loss" || col.key === "landedCostRate" || col.key === "receivedQty" ? "number" : "text"}
        step={col.key === "amount" || col.key === "poPcRate" || col.key === "conversionFactor" || col.key === "apportionedCost" || col.key === "insurance" || col.key === "handlingCharges" || col.key === "landedCostRate" || col.key === "receivedQty" ? "0.01" : "1"}
        defaultValue={row?.[col.key] ?? ""}
        onChange={(e) => handleDetailChange(idx, col.key, e.target.value, row)}
        className={cls}
      />
    );
  };

  const renderPurchaseDetailTab = (errMap) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <SectionHeader>Purchase Detail</SectionHeader>
        <button type="button" onClick={addDetailRow}
          className="flex items-center gap-1 px-2 py-1 rounded text-[11px] bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors">
          <Plus className="h-3 w-3" /> Add Row
        </button>
      </div>
      <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
        <table className="w-full text-xs">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className={thClass}>#</th>
              {purchaseDetailColumns.map((c) => (
                <th key={c.key} className={thClass} style={{ minWidth: c.width }}>{c.label}</th>
              ))}
              <th className={`${thClass} text-center`} style={{ minWidth: "50px" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {detailFields.map((row, idx) => (
              <tr key={row.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-1 py-0.5 text-gray-500 dark:text-gray-400 text-[10px] w-[25px]">{idx + 1}</td>
                {purchaseDetailColumns.map((col) => (
                  <td key={col.key} className="px-1 py-0.5" style={{ minWidth: col.width }}>
                    {renderCell(col, watchDetail?.[idx], idx)}
                    {errMap[`purchaseDetail.${idx}.${col.key}`] && (
                      <p className="text-[9px] text-red-500 leading-none mt-0.5">{errMap[`purchaseDetail.${idx}.${col.key}`]}</p>
                    )}
                  </td>
                ))}
                <td className="px-1 py-0.5 text-center whitespace-nowrap w-[50px]">
                  <div className="flex items-center justify-center gap-0.5">
                    <button type="button" onClick={() => copyDetailRow(idx)}
                      className="p-0.5 rounded text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                      <Copy className="h-3 w-3" />
                    </button>
                    <button type="button" onClick={() => removeDetail(idx)} disabled={detailFields.length <= 1}
                      className="p-0.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-30">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSummaryTab = () => (
    <div className="space-y-3">
      <SectionHeader>Summary</SectionHeader>
      <div className={fieldGrid}>
        <InputField label="Net Amount">
          <input type="number" step="0.01" {...register("netAmount")} className={controlClasses} />
        </InputField>
        <InputField label="Basic Amount">
          <input type="number" step="0.01" {...register("basicAmount")} className={controlClasses} />
        </InputField>
        <InputField label="Invoice Sent On">
          <input type="date" {...register("invoiceSentOn")} className={controlClasses} />
        </InputField>
        <div className="col-span-1 md:col-span-2 xl:col-span-3">
          <label className={labelClasses}>Remarks</label>
          <textarea {...register("remarks")} rows={2} className={`${controlClasses} h-auto min-h-[30px] resize-none pt-1`} />
        </div>
      </div>
    </div>
  );

  const renderAttachmentsTab = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <SectionHeader>Attached Invoice Copy</SectionHeader>
        <button type="button" onClick={() => appendAttach({ fileName: "", file: null, remarks: "" })}
          className="flex items-center gap-1 px-2 py-1 rounded text-[11px] bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors">
          <Plus className="h-3 w-3" /> Add Document
        </button>
      </div>
      <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
        <table className="w-full text-xs">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="p-1 w-8 text-center dark:text-white">#</th>
              <th className="p-1 text-left dark:text-white">Attachment</th>
              <th className="p-1 w-20 text-left dark:text-white">Action</th>
            </tr>
          </thead>
          <tbody>
            {attachFields.map((att, idx) => (
              <tr key={att.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="p-1 text-center font-medium dark:text-white">{idx + 1}</td>
                <td className="p-1">
                  <Controller control={control} name={`attachments.${idx}.file`} render={({ field: { onChange } }) => (
                    <input type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.gif,.webp,.bmp,.svg,.zip,.rar,.txt"
                      className="w-full h-9 text-xs file:mr-3 file:px-3 file:py-1 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer cursor-pointer bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded px-2"
                      onChange={(e) => onChange(e.target.files?.[0] || null)}
                    />
                  )} />
                </td>
                <td className="p-1 text-center">
                  <button type="button" onClick={() => removeAttach(idx)}
                    disabled={attachFields.length <= 1}
                    className={`h-5 w-5 rounded text-white flex items-center justify-center ${
                      attachFields.length <= 1 ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                    }`}>
                    <Trash2 size={10} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const [activeTab, setActiveTab] = useState("purchaseDetail");
  const tabs = [
    { key: "purchaseDetail", label: "Purchase Detail" },
    { key: "summary", label: "Summary" },
    { key: "attachments", label: "Attached Invoice Copy" },
  ];

  return (
    <div className="animate-fadeIn px-3 py-3 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <button type="button" onClick={onBack} className="p-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data ? "Edit Stock Transfer GRN" : "New Stock Transfer GRN"}
        </h2>
        <div className="ml-auto flex items-center gap-2">
          <label className={labelClasses}>Active</label>
          <Controller control={control} name="active" render={({ field }) => (
            <ToggleSwitch value={field.value} onChange={field.onChange} />
          )} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
        <SectionHeader>GRN Header</SectionHeader>
        {renderHeader({})}

        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex">
            {tabs.map((tab) => (
              <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-t transition-colors ${
                  activeTab === tab.key
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "purchaseDetail" && renderPurchaseDetailTab({})}
        {activeTab === "summary" && renderSummaryTab()}
        {activeTab === "attachments" && renderAttachmentsTab()}

        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button type="button" onClick={onBack}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <X className="h-3 w-3" /> Cancel
          </button>
          <button type="button" onClick={handleSubmit(onSubmit)}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors">
            <Save className="h-3 w-3" /> Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockTransferGRNForm;

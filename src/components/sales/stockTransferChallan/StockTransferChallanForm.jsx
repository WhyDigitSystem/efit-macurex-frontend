import { ArrowLeft, Save, X, Plus, Trash2, Copy } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import dayjs from "dayjs";
import stockTransferChallanAPI from "../../../api/Inventory/stockTransferChallanAPI";
import branchAPI from "../../../api/branchAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import { useToast } from "../../Toast/ToastContext";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const labelClasses = "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid = "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-4 gap-y-3 items-start";

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

const TYPE_OPTIONS = ["Sales", "Transfer", "Return", "Sample"];
const STOCK_POSTING_OPTIONS = ["Yes", "No"];
const IMPORT_LOCAL_OPTIONS = ["Import", "Local"];
const TAX_TYPE_OPTIONS = ["GST", "VAT", "CST", "Custom"];
const UNIT_OPTIONS = ["Nos", "Kg", "Gms", "Ltr", "Mtr", "Pcs", "Box", "Pair"];
const TRANSPORT_OPTIONS = ["Road", "Rail", "Air", "Sea", "Courier"];
const CUSTOMER_OPTIONS = ["CUS001 - ABC Corp", "CUS002 - XYZ Ltd", "CUS003 - PQR Enterprises"];
const ITEM_OPTIONS = ["ITEM001 - Raw Material A", "ITEM002 - Component B", "ITEM003 - Finished C"];
const TAX_CODE_OPTIONS = ["TC-001", "TC-002", "TC-003"];

const numberToWords = (num) => {
  if (!num || isNaN(num)) return "";
  const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const twoDigits = (n) => n < 20 ? a[n] : b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
  const threeDigits = (n) => {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    return (hundred ? a[hundred] + " Hundred" + (rest ? " " : "") : "") + (rest ? twoDigits(rest) : "");
  };
  let words = "";
  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const rest = Math.floor(num % 1000);
  if (crore) words += threeDigits(crore) + " Crore ";
  if (lakh) words += twoDigits(lakh) + " Lakh ";
  if (thousand) words += twoDigits(thousand) + " Thousand ";
  if (rest) words += threeDigits(rest);
  return (words || "Zero").trim() + " Only";
};

const getDefaultItemRow = () => ({
  itemCode: "",
  itemDescription: "",
  hsnSacCode: "",
  taxType: "",
  taxPerc: "",
  unit: "",
  stock: "",
  qty: "",
  rate: "",
  totalAssessableValue: "",
  cvd: "",
  addlDuty: "",
  amount: "",
  sgstRate: "",
  sgstAmount: "",
  cgstRate: "",
  cgstAmount: "",
  igstRate: "",
  igstAmount: "",
});

const getDefaultTaxRow = () => ({
  particulars: "",
  taxId: "",
  taxPerc: "",
  acceptedQtyAmount: "",
  revisedAmount: "",
  ledgerAccountName: "",
});

const getDefaultValues = (data) => ({
  plantId: data?.plantId || "",
  docId: data?.docId || "STCH" + String(Date.now()).slice(-6),
  type: data?.type || "",
  transferDate: data?.transferDate || dayjs().format("YYYY-MM-DD"),
  customerId: data?.customerId || "",
  customerName: data?.customerName || "",
  locationId: data?.locationId || "",
  timeOfTransfer: data?.timeOfTransfer || dayjs().format("HH:mm"),
  stockPosting: data?.stockPosting || "",
  noOfPackages: data?.noOfPackages || "",
  partyGstState: data?.partyGstState || "",
  otherPackages: data?.otherPackages || "",
  isIgstApplicable: data?.isIgstApplicable ?? false,
  importLocal: data?.importLocal || "",
  gstinNo: data?.gstinNo || "",
  taxCode: data?.taxCode || "",
  active: data?.active === "Active" || data?.active !== false,
  id: data?.id || 0,
  itemDetails: data?.itemDetails?.length
    ? data.itemDetails.map((r) => ({
        itemCode: r.itemCode || "", itemDescription: r.itemDescription || "", hsnSacCode: r.hsnSacCode || "",
        taxType: r.taxType || "", taxPerc: r.taxPerc ?? "", unit: r.unit || "", stock: r.stock ?? "",
        qty: r.qty ?? "", rate: r.rate ?? "", totalAssessableValue: r.totalAssessableValue ?? "",
        cvd: r.cvd ?? "", addlDuty: r.addlDuty ?? "", amount: r.amount ?? "",
        sgstRate: r.sgstRate ?? "", sgstAmount: r.sgstAmount ?? "", cgstRate: r.cgstRate ?? "",
        cgstAmount: r.cgstAmount ?? "", igstRate: r.igstRate ?? "", igstAmount: r.igstAmount ?? "",
      }))
    : [getDefaultItemRow()],
  taxDetails: data?.taxDetails?.length
    ? data.taxDetails.map((r) => ({
        particulars: r.particulars || "", taxId: r.taxId || "", taxPerc: r.taxPerc ?? "",
        acceptedQtyAmount: r.acceptedQtyAmount ?? "", revisedAmount: r.revisedAmount ?? "",
        ledgerAccountName: r.ledgerAccountName || "",
      }))
    : [getDefaultTaxRow()],
  totalInsurance: data?.totalInsurance ?? "",
  totalFreight: data?.totalFreight ?? "",
  totalAssessableValueHeader: data?.totalAssessableValueHeader ?? "",
  modeOfTransport: data?.modeOfTransport || "",
  salesTax: data?.salesTax ?? "",
  grossAmount: data?.grossAmount ?? "",
  amountInWords: data?.amountInWords || "",
  deliveryTo: data?.deliveryTo || "",
  paymentTerms: data?.paymentTerms || "",
  narration: data?.narration || "",
});

const StockTransferChallanForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId")) || 0;
  const branch = Number(localStorage.getItem("branchId")) || 1000000001;

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const orgName = (userData?.companyVO?.companyName || userData?.orgName || "").trim();
  const isMacurex = ["mecurex", "macurex"].includes(orgName.toLowerCase());

  const [plantOptions, setPlantOptions] = useState([]);
  const [lookupLoading, setLookupLoading] = useState(false);

  useEffect(() => {
    const loadOptions = async () => {
      setLookupLoading(true);
      try {
        if (isMacurex) {
          const res = await locationMasterAPI.getPlants(orgId);
          setPlantOptions((res || []).map((p) => ({ id: p.id, label: p.plantName || p.plantId || p.id })));
        } else {
          const res = await branchAPI.getBranchByOrgId(orgId);
          setPlantOptions((res || []).map((b) => ({ id: b.id, label: b.branchName || b.id })));
        }
      } catch (error) {
        console.error("Failed to load plant/branch options", error);
        setPlantOptions([]);
      } finally {
        setLookupLoading(false);
      }
    };
    if (orgId) loadOptions();
  }, [orgId, isMacurex]);

  const {
    control, handleSubmit, setValue, watch, register,
  } = useForm({
    mode: "onTouched",
    defaultValues: getDefaultValues(data),
  });

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control, name: "itemDetails",
  });

  const { fields: taxFields, append: appendTax, remove: removeTax } = useFieldArray({
    control, name: "taxDetails",
  });

  const watchItems = watch("itemDetails");

  const setCalc = (idx, field, val) => {
    setValue(`itemDetails.${idx}.${field}`, val, { shouldValidate: false, shouldDirty: false });
  };

  const handleItemChange = (idx, field, value, row) => {
    setValue(`itemDetails.${idx}.${field}`, value, { shouldDirty: true });

    if (field === "itemCode") {
      const item = ITEM_OPTIONS.find((o) => o === value);
      setValue(`itemDetails.${idx}.itemDescription`, item ? value.split(" - ")[1] || "" : "", { shouldDirty: true });
      return;
    }

    const qty = parseFloat(field === "qty" ? value : row.qty) || 0;
    const rate = parseFloat(field === "rate" ? value : row.rate) || 0;
    const cvd = parseFloat(field === "cvd" ? value : row.cvd) || 0;
    const addl = parseFloat(field === "addlDuty" ? value : row.addlDuty) || 0;
    const sgstR = parseFloat(field === "sgstRate" ? value : row.sgstRate) || 0;
    const cgstR = parseFloat(field === "cgstRate" ? value : row.cgstRate) || 0;
    const igstR = parseFloat(field === "igstRate" ? value : row.igstRate) || 0;

    const assessable = qty * rate;
    setCalc(idx, "totalAssessableValue", assessable || "");
    setCalc(idx, "amount", (assessable + cvd + addl) || "");
    setCalc(idx, "sgstAmount", ((assessable * sgstR) / 100) || "");
    setCalc(idx, "cgstAmount", ((assessable * cgstR) / 100) || "");
    setCalc(idx, "igstAmount", ((assessable * igstR) / 100) || "");
  };

  const handleTaxChange = (idx, field, value) => {
    setValue(`taxDetails.${idx}.${field}`, value, { shouldDirty: true });
    if (field === "particulars") {
      setValue(`taxDetails.${idx}.taxId`, "TAX" + String(idx + 1).padStart(2, "0"), { shouldDirty: true });
    }
  };

  const copyItemRow = (idx) => {
    const row = watchItems?.[idx];
    if (row) appendItem({ ...getDefaultItemRow(), ...row });
  };

  const addItemRow = () => appendItem(getDefaultItemRow());
  const addTaxRow = () => appendTax(getDefaultTaxRow());

  const validate = () => {
    const errs = {};
    const vals = watch();
    if (!vals.plantId) errs.plantId = "Required";
    if (!vals.docId) errs.docId = "Required";
    if (!vals.transferDate) errs.transferDate = "Required";
    if (!vals.customerId) errs.customerId = "Required";
    if (!vals.partyGstState) errs.partyGstState = "Required";
    const detailErrs = {};
    (watchItems || []).forEach((r, i) => {
      if (!r.itemCode) detailErrs[`itemDetails.${i}.itemCode`] = "Required";
      if (!r.hsnSacCode) detailErrs[`itemDetails.${i}.hsnSacCode`] = "Required";
      if (!r.taxType) detailErrs[`itemDetails.${i}.taxType`] = "Required";
      if ((r.qty === "" || r.qty === undefined) || Number(r.qty) <= 0) detailErrs[`itemDetails.${i}.qty`] = "Required";
      if ((r.rate === "" || r.rate === undefined) || Number(r.rate) <= 0) detailErrs[`itemDetails.${i}.rate`] = "Required";
    });
    return { headerErrs: errs, detailErrs };
  };

  const onSubmit = async (formData) => {
    const { headerErrs, detailErrs } = validate();
    if (Object.keys(headerErrs).length || Object.keys(detailErrs).length) {
      addToast("Please fill all mandatory fields", "error");
      return;
    }
    const totalAssessable = (watchItems || []).reduce((sum, r) => sum + (parseFloat(r.totalAssessableValue) || 0), 0);
    const gross = (watchItems || []).reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
    setValue("totalAssessableValueHeader", totalAssessable || "");
    setValue("grossAmount", gross || "");
    setValue("amountInWords", numberToWords(gross));

    const payload = {
      ...(formData.id ? { id: formData.id } : {}),
      orgId, branch,
      ...formData,
      totalAssessableValueHeader: totalAssessable || "",
      grossAmount: gross || "",
      amountInWords: numberToWords(gross),
      createdBy: localStorage.getItem("userName") || "SYSTEM",
      cancelRemarks: "",
    };
    try {
      await stockTransferChallanAPI.createUpdate(payload);
      addToast(data ? "Stock Transfer Challan Updated!" : "Stock Transfer Challan Saved!", "success");
      onBack();
    } catch (error) {
      console.error("Save error:", error);
      addToast("Failed to save Stock Transfer Challan.", "error");
    }
  };

  const renderHeader = (errMap) => (
    <div className={fieldGrid}>
      <InputField label={isMacurex ? "Plant ID" : "Branch"} required error={errMap.plantId}>
        <Controller control={control} name="plantId" render={({ field }) => (
          <select {...field} disabled={lookupLoading} className={`${controlClasses} ${errMap.plantId ? "border-red-500" : ""}`}>
            <option value="">{isMacurex ? "Select Plant" : "Select Branch"}</option>
            {plantOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        )} />
      </InputField>
      <InputField label="Doc ID" required error={errMap.docId}>
        <input {...register("docId")} disabled className={`${controlClasses} bg-gray-50 dark:bg-gray-800 ${errMap.docId ? "border-red-500" : ""}`} />
      </InputField>
      <InputField label="Type">
        <Controller control={control} name="type" render={({ field }) => (
          <select {...field} className={controlClasses}>
            <option value="">Select</option>
            {TYPE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )} />
      </InputField>
      <InputField label="Transfer Date" required error={errMap.transferDate}>
        <input type="date" {...register("transferDate")} className={`${controlClasses} ${errMap.transferDate ? "border-red-500" : ""}`} />
      </InputField>
      <InputField label="Customer ID" required error={errMap.customerId}>
        <Controller control={control} name="customerId" render={({ field }) => (
          <select {...field} onChange={(e) => {
            field.onChange(e.target.value);
            const cust = CUSTOMER_OPTIONS.find((c) => c === e.target.value);
            setValue("customerName", cust ? cust.split(" - ")[1] || "" : "", { shouldDirty: true });
          }} className={`${controlClasses} ${errMap.customerId ? "border-red-500" : ""}`}>
            <option value="">Select</option>
            {CUSTOMER_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )} />
      </InputField>
      <InputField label="Customer Name">
        <input {...register("customerName")} disabled className={`${controlClasses} bg-gray-50 dark:bg-gray-800`} />
      </InputField>
      <InputField label="Location ID">
        <Controller control={control} name="locationId" render={({ field }) => (
          <select {...field} className={controlClasses}>
            <option value="">Select</option>
            {["Warehouse A", "Warehouse B", "Store"].map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )} />
      </InputField>
      <InputField label="Time of Transfer">
        <input type="time" {...register("timeOfTransfer")} disabled className={`${controlClasses} bg-gray-50 dark:bg-gray-800`} />
      </InputField>
      <InputField label="Stock Posting?">
        <Controller control={control} name="stockPosting" render={({ field }) => (
          <select {...field} className={controlClasses}>
            <option value="">Select</option>
            {STOCK_POSTING_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )} />
      </InputField>
      <InputField label="No of Packages">
        <input type="number" step="1" {...register("noOfPackages")} className={controlClasses} />
      </InputField>
      <InputField label="Party GST State" required error={errMap.partyGstState}>
        <input {...register("partyGstState")} className={`${controlClasses} ${errMap.partyGstState ? "border-red-500" : ""}`} />
      </InputField>
      <InputField label="Other Packages">
        <input type="number" step="1" {...register("otherPackages")} className={controlClasses} />
      </InputField>
      <InputField label="Is IGST Applicable">
        <Controller control={control} name="isIgstApplicable" render={({ field }) => (
          <input type="checkbox" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
        )} />
      </InputField>
      <InputField label="Import / Local">
        <Controller control={control} name="importLocal" render={({ field }) => (
          <select {...field} className={controlClasses}>
            <option value="">Select</option>
            {IMPORT_LOCAL_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )} />
      </InputField>
      <InputField label="GSTIN No">
        <input {...register("gstinNo")} className={controlClasses} />
      </InputField>
      <InputField label="Tax Code">
        <Controller control={control} name="taxCode" render={({ field }) => (
          <select {...field} className={controlClasses}>
            <option value="">Select</option>
            {TAX_CODE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )} />
      </InputField>
    </div>
  );

  const itemColumns = [
    { key: "itemCode", label: "Item Code", width: "110px", required: true },
    { key: "itemDescription", label: "Item Description", width: "130px" },
    { key: "hsnSacCode", label: "HSN/SAC Code", width: "80px", required: true },
    { key: "taxType", label: "Tax Type", width: "80px", required: true },
    { key: "taxPerc", label: "Tax %", width: "55px" },
    { key: "unit", label: "Unit", width: "55px" },
    { key: "stock", label: "Stock", width: "60px" },
    { key: "qty", label: "Qty", width: "55px", required: true },
    { key: "rate", label: "Rate", width: "60px", required: true },
    { key: "totalAssessableValue", label: "Total Assessable Value", width: "90px" },
    { key: "cvd", label: "CVD 12.5%", width: "65px" },
    { key: "addlDuty", label: "Addl Duty 4%", width: "70px" },
    { key: "amount", label: "Amount", width: "65px" },
    { key: "sgstRate", label: "SGST Rate", width: "60px" },
    { key: "sgstAmount", label: "SGST Amount", width: "70px" },
    { key: "cgstRate", label: "CGST Rate", width: "60px" },
    { key: "cgstAmount", label: "CGST Amount", width: "70px" },
    { key: "igstRate", label: "IGST Rate", width: "60px" },
    { key: "igstAmount", label: "IGST Amount", width: "70px" },
  ];

  const renderItemCell = (col, row, idx) => {
    const base = `itemDetails.${idx}.`;
    const isReadonly = ["itemDescription", "totalAssessableValue", "amount", "sgstAmount", "cgstAmount", "igstAmount"].includes(col.key);
    const cls = `${controlClasses} w-[${col.width}] ${isReadonly ? "bg-gray-50 dark:bg-gray-800" : ""}`;

    if (col.key === "itemCode") {
      return (
        <Controller control={control} name={`${base}${col.key}`} render={({ field }) => (
          <select {...field} onChange={(e) => handleItemChange(idx, col.key, e.target.value, row)} className={`${controlClasses} w-[${col.width}]`}>
            <option value="">Select</option>
            {ITEM_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )} />
      );
    }
    if (col.key === "taxType") {
      return (
        <Controller control={control} name={`${base}${col.key}`} render={({ field }) => (
          <select {...field} onChange={(e) => handleItemChange(idx, col.key, e.target.value, row)} className={`${controlClasses} w-[${col.width}]`}>
            <option value="">Select</option>
            {TAX_TYPE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )} />
      );
    }
    if (col.key === "unit") {
      return (
        <Controller control={control} name={`${base}${col.key}`} render={({ field }) => (
          <select {...field} onChange={(e) => handleItemChange(idx, col.key, e.target.value, row)} className={`${controlClasses} w-[${col.width}]`}>
            <option value="">-</option>
            {UNIT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )} />
      );
    }
    if (isReadonly) {
      return <input value={row?.[col.key] ?? ""} readOnly className={cls} />;
    }
    const numericFields = ["taxPerc", "stock", "qty", "rate", "cvd", "addlDuty", "sgstRate", "cgstRate", "igstRate"];
    return (
      <input
        type={numericFields.includes(col.key) ? "number" : "text"}
        step="0.01"
        defaultValue={row?.[col.key] ?? ""}
        onChange={(e) => handleItemChange(idx, col.key, e.target.value, row)}
        className={cls}
      />
    );
  };

  const renderItemDetailsTab = (errMap) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <SectionHeader>Item Details</SectionHeader>
        <button type="button" onClick={addItemRow}
          className="flex items-center gap-1 px-2 py-1 rounded text-[11px] bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors">
          <Plus className="h-3 w-3" /> Add Row
        </button>
      </div>
      <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
        <table className="w-full text-xs">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className={thClass}>#</th>
              {itemColumns.map((c) => (
                <th key={c.key} className={thClass} style={{ minWidth: c.width }}>
                  {c.label}{c.required && <span className="text-red-500"> *</span>}
                </th>
              ))}
              <th className={`${thClass} text-center`} style={{ minWidth: "50px" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {itemFields.map((row, idx) => (
              <tr key={row.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-1.5 py-1 text-gray-500 dark:text-gray-400 text-[10px] w-[25px]">{idx + 1}</td>
                {itemColumns.map((col) => (
                  <td key={col.key} className="px-1.5 py-1" style={{ minWidth: col.width }}>
                    {renderItemCell(col, watchItems?.[idx], idx)}
                    {errMap[`itemDetails.${idx}.${col.key}`] && (
                      <p className="text-[9px] text-red-500 leading-none mt-0.5">{errMap[`itemDetails.${idx}.${col.key}`]}</p>
                    )}
                  </td>
                ))}
                <td className="px-1 py-0.5 text-center whitespace-nowrap w-[50px]">
                  <div className="flex items-center justify-center gap-0.5">
                    <button type="button" onClick={() => copyItemRow(idx)}
                      className="p-0.5 rounded text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                      <Copy className="h-3 w-3" />
                    </button>
                    <button type="button" onClick={() => removeItem(idx)} disabled={itemFields.length <= 1}
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

  const taxColumns = [
    { key: "particulars", label: "Particulars", width: "160px" },
    { key: "taxId", label: "Tax ID", width: "80px" },
    { key: "taxPerc", label: "Tax %", width: "70px" },
    { key: "acceptedQtyAmount", label: "Accepted Qty Amount", width: "120px" },
    { key: "revisedAmount", label: "Revised Amount", width: "110px" },
    { key: "ledgerAccountName", label: "Ledger Account Name", width: "150px" },
  ];

  const renderTaxCell = (col, row, idx) => {
    const base = `taxDetails.${idx}.`;
    const cls = `${controlClasses} w-[${col.width}]`;

    if (col.key === "taxId") {
      return <input value={row?.[col.key] ?? ""} readOnly className={`${cls} bg-gray-50 dark:bg-gray-800`} />;
    }
    if (col.key === "ledgerAccountName") {
      return (
        <Controller control={control} name={`${base}${col.key}`} render={({ field }) => (
          <select {...field} className={cls}>
            <option value="">Select</option>
            {["Ledger A", "Ledger B", "Ledger C"].map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )} />
      );
    }
    return (
      <input
        type={["taxPerc", "acceptedQtyAmount", "revisedAmount"].includes(col.key) ? "number" : "text"}
        step="0.01"
        defaultValue={row?.[col.key] ?? ""}
        onChange={(e) => handleTaxChange(idx, col.key, e.target.value)}
        className={cls}
      />
    );
  };

  const renderTaxDetailsTab = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <SectionHeader>Tax Details</SectionHeader>
        <button type="button" onClick={addTaxRow}
          className="flex items-center gap-1 px-2 py-1 rounded text-[11px] bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors">
          <Plus className="h-3 w-3" /> Add Row
        </button>
      </div>
      <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
        <table className="w-full text-xs">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className={thClass}>#</th>
              {taxColumns.map((c) => (
                <th key={c.key} className={thClass} style={{ minWidth: c.width }}>{c.label}</th>
              ))}
              <th className={`${thClass} text-center`} style={{ minWidth: "50px" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {taxFields.map((row, idx) => (
              <tr key={row.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-1.5 py-1 text-gray-500 dark:text-gray-400 text-[10px] w-[25px]">{idx + 1}</td>
                {taxColumns.map((col) => (
                  <td key={col.key} className="px-1.5 py-1" style={{ minWidth: col.width }}>
                    {renderTaxCell(col, watch("taxDetails")?.[idx], idx)}
                  </td>
                ))}
                <td className="px-1 py-0.5 text-center whitespace-nowrap w-[50px]">
                  <button type="button" onClick={() => removeTax(idx)} disabled={taxFields.length <= 1}
                    className="p-0.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-30">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTermsTab = () => (
    <div className="space-y-3">
      <SectionHeader>Terms And Conditions</SectionHeader>
      <div className={fieldGrid}>
        <InputField label="Total Insurance">
          <input type="number" step="0.01" {...register("totalInsurance")} className={controlClasses} />
        </InputField>
        <InputField label="Total Freight">
          <input type="number" step="0.01" {...register("totalFreight")} className={controlClasses} />
        </InputField>
        <InputField label="Total Assessable Value">
          <input type="number" step="0.01" {...register("totalAssessableValueHeader")} className={controlClasses} />
        </InputField>
        <InputField label="Mode of Transport">
          <Controller control={control} name="modeOfTransport" render={({ field }) => (
            <select {...field} className={controlClasses}>
              <option value="">Select</option>
              {TRANSPORT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          )} />
        </InputField>
        <InputField label="Sales Tax">
          <input type="number" step="0.01" {...register("salesTax")} className={controlClasses} />
        </InputField>
        <InputField label="Gross Amount">
          <input type="number" step="0.01" {...register("grossAmount")} className={controlClasses} />
        </InputField>
        <div className="col-span-1 md:col-span-2 xl:col-span-3">
          <label className={labelClasses}>Amount in Words</label>
          <input {...register("amountInWords")} disabled className={`${controlClasses} bg-gray-50 dark:bg-gray-800`} />
        </div>
        <InputField label="Delivery To">
          <input {...register("deliveryTo")} className={controlClasses} />
        </InputField>
        <div className="col-span-1 md:col-span-2 xl:col-span-3">
          <label className={labelClasses}>Payment Terms</label>
          <textarea {...register("paymentTerms")} rows={2} className={`${controlClasses} h-auto min-h-[30px] resize-none pt-1`} />
        </div>
        <div className="col-span-1 md:col-span-2 xl:col-span-3">
          <label className={labelClasses}>Narration</label>
          <textarea {...register("narration")} rows={2} className={`${controlClasses} h-auto min-h-[30px] resize-none pt-1`} />
        </div>
      </div>
    </div>
  );

  const [activeTab, setActiveTab] = useState("itemDetails");
  const tabs = [
    { key: "itemDetails", label: "Item Details" },
    { key: "taxDetails", label: "Tax Details" },
    { key: "terms", label: "Terms And Conditions" },
  ];

  return (
    <div className="animate-fadeIn px-3 py-3 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <button type="button" onClick={onBack} className="p-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data ? "Edit Stock Transfer Challan" : "New Stock Transfer Challan"}
        </h2>
        <div className="ml-auto flex items-center gap-2">
          <label className={labelClasses}>Active</label>
          <Controller control={control} name="active" render={({ field }) => (
            <ToggleSwitch value={field.value} onChange={field.onChange} />
          )} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
        <SectionHeader>Challan Header</SectionHeader>
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

        {activeTab === "itemDetails" && renderItemDetailsTab({})}
        {activeTab === "taxDetails" && renderTaxDetailsTab()}
        {activeTab === "terms" && renderTermsTab()}

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

export default StockTransferChallanForm;
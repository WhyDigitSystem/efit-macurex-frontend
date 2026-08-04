import { ArrowLeft, Save, X, Plus, Trash2, Copy } from "lucide-react";
import { useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import dayjs from "dayjs";
import otherSalesInvoiceAPI from "../../../api/Sales/otherSalesInvoiceAPI";
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

const BELONGS_TO_OPTIONS = ["Other", "Sales Order", "Despatch Instruction", "DC Cum Invoice"];
const DOC_TYPE_OPTIONS = ["INVOICE", "DEBIT NOTE", "CREDIT NOTE", "PROFORMA"];
const INVOICE_TYPE_OPTIONS = ["Cash", "Credit", "Advance"];
const CURRENCY_OPTIONS = ["₹", "$", "€", "£"];
const TAX_TYPE_OPTIONS = ["SGST", "CGST", "IGST"];
const UNIT_OPTIONS = ["Nos", "Kg", "Gms", "Ltr", "Mtr", "Pcs", "Box", "Pair"];
const TRANSPORT_OPTIONS = ["Road", "Rail", "Air", "Sea", "Courier"];
const CUSTOMER_OPTIONS = ["CUS001 - ABC Corp", "CUS002 - XYZ Ltd", "CUS003 - PQR Enterprises"];
const ITEM_OPTIONS = ["ITEM001 - Raw Material A", "ITEM002 - Component B", "ITEM003 - Finished C"];
const TAX_CODE_OPTIONS = ["TC-001", "TC-002", "TC-003"];
const GL_ACCOUNT_OPTIONS = ["Ledger A", "Ledger B", "Ledger C"];

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

const getMonthYearOptions = () => {
  const options = [];
  const now = dayjs();
  for (let i = 0; i < 12; i += 1) {
    options.push(now.subtract(i, "month").format("MMMM YYYY"));
  }
  return options;
};

const getDefaultItemRow = () => ({
  itemCode: "",
  itemDescription: "",
  hsnSacCode: "",
  taxType: "",
  taxPerc: "",
  customerPartNo: "",
  unit: "",
  lastInvoicedDate: "",
  tariffNo: "",
  stock: "",
  soConf: false,
});

const getDefaultTaxRow = () => ({
  particulars: "",
  taxId: "",
  taxPerc: "",
  acceptedQtyAmount: "",
  revisedAmount: "",
  glAccountName: "",
});

const getDefaultValues = (data) => ({
  plantId: data?.plantId || "",
  monthYear: data?.monthYear || dayjs().format("MMMM YYYY"),
  belongsTo: data?.belongsTo || "",
  excisable: data?.excisable ?? false,
  taxCode: data?.taxCode || "",
  docType: data?.docType || "INVOICE",
  locationId: data?.locationId || "",
  salesInvoiceNo: data?.salesInvoiceNo || `MAC/${dayjs().format("DDD")}/${String(Date.now()).slice(-4)}`,
  customerId: data?.customerId || "",
  customerName: data?.customerName || "",
  customerCode: data?.customerCode || "",
  vehicle: data?.vehicle || "",
  invoiceDate: data?.invoiceDate || dayjs().format("YYYY-MM-DD"),
  timeOfIssue: data?.timeOfIssue || dayjs().format("HH:mm"),
  timeOfRemoval: data?.timeOfRemoval || dayjs().format("HH:mm"),
  isIgstApplicable: data?.isIgstApplicable ?? false,
  currency: data?.currency || "₹",
  gstnNo: data?.gstnNo || "",
  invoiceType: data?.invoiceType || "",
  schNo: data?.schNo || "",
  dNo: data?.dNo || "",
  schDate: data?.schDate || "",
  dDate: data?.dDate || "",
  exchangeRate: data?.exchangeRate ?? "",
  kanbanCardNo: data?.kanbanCardNo || "",
  stockPosting: data?.stockPosting ?? false,
  active: data?.active === "Active" || data?.active !== false,
  id: data?.id || 0,
  itemDetails: data?.itemDetails?.length
    ? data.itemDetails.map((r) => ({
        itemCode: r.itemCode || "", itemDescription: r.itemDescription || "", hsnSacCode: r.hsnSacCode || "",
        taxType: r.taxType || "", taxPerc: r.taxPerc ?? "", customerPartNo: r.customerPartNo || "",
        unit: r.unit || "", lastInvoicedDate: r.lastInvoicedDate || "", tariffNo: r.tariffNo || "",
        stock: r.stock ?? "", soConf: r.soConf ?? false,
      }))
    : [getDefaultItemRow()],
  taxDetails: data?.taxDetails?.length
    ? data.taxDetails.map((r) => ({
        particulars: r.particulars || "", taxId: r.taxId || "", taxPerc: r.taxPerc ?? "",
        acceptedQtyAmount: r.acceptedQtyAmount ?? "", revisedAmount: r.revisedAmount ?? "",
        glAccountName: r.glAccountName || "",
      }))
    : [getDefaultTaxRow()],
  totalInsurance: data?.totalInsurance ?? "",
  totalFreight: data?.totalFreight ?? "",
  totalAssessableValue: data?.totalAssessableValue ?? "",
  modeOfTransport: data?.modeOfTransport || "",
  salesTax: data?.salesTax ?? "",
  grossAmount: data?.grossAmount ?? "",
  amountInWords: data?.amountInWords || "",
  deliveryTo: data?.deliveryTo || "",
  paymentTerms: data?.paymentTerms || "",
  narration: data?.narration || "",
});

const OtherSalesInvoiceForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId")) || 0;
  const branch = Number(localStorage.getItem("branchId")) || 1000000001;

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

  const [activeTab, setActiveTab] = useState("itemDetails");
  const [formErrs, setFormErrs] = useState({});

  const handleItemChange = (idx, field, value, row) => {
    setValue(`itemDetails.${idx}.${field}`, value, { shouldDirty: true });
    if (field === "itemCode") {
      const item = ITEM_OPTIONS.find((o) => o === value);
      setValue(`itemDetails.${idx}.itemDescription`, item ? value.split(" - ")[1] || "" : "", { shouldDirty: true });
    }
  };

  const handleTaxChange = (idx, field, value) => {
    setValue(`taxDetails.${idx}.${field}`, value, { shouldDirty: true });
    if (field === "particulars") {
      setValue(`taxDetails.${idx}.taxId`, "TAX" + String(idx + 1).padStart(2, "0"), { shouldDirty: true });
    }
  };

  const handleGrossAmountChange = (value) => {
    setValue("grossAmount", value, { shouldDirty: true });
    setValue("amountInWords", numberToWords(parseFloat(value) || 0), { shouldDirty: true });
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
    if (!vals.belongsTo) errs.belongsTo = "Required";
    if (!vals.invoiceDate) errs.invoiceDate = "Required";
    if (typeof vals.isIgstApplicable !== "boolean") errs.isIgstApplicable = "Required";
    (watchItems || []).forEach((r, i) => {
      if (!r.itemCode) errs[`itemDetails.${i}.itemCode`] = "Required";
      if (!r.hsnSacCode) errs[`itemDetails.${i}.hsnSacCode`] = "Required";
    });
    return errs;
  };

  const onSubmit = async (formData) => {
    const errs = validate();
    setFormErrs(errs);
    if (Object.keys(errs).length) {
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
      await otherSalesInvoiceAPI.createUpdate(payload);
      addToast(data ? "Other Sales Invoice Updated!" : "Other Sales Invoice Saved!", "success");
      onBack();
    } catch (error) {
      console.error("Save error:", error);
      addToast("Failed to save Other Sales Invoice.", "error");
    }
  };

  const renderHeader = (errMap) => (
    <div className={fieldGrid}>
      <InputField label="Plant Id" required error={errMap.plantId}>
        <Controller control={control} name="plantId" render={({ field }) => (
          <select {...field} className={`${controlClasses} ${errMap.plantId ? "border-red-500" : ""}`}>
            <option value="">Select</option>
            {["Plant 1", "Plant 2", "Plant 3"].map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )} />
      </InputField>
      <InputField label="Month Year">
        <Controller control={control} name="monthYear" render={({ field }) => (
          <select {...field} className={controlClasses}>
            {getMonthYearOptions().map((o) => <option key={o} value={o}>{o}</option>)}
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
      <InputField label="Excisable">
        <Controller control={control} name="excisable" render={({ field }) => (
          <ToggleSwitch value={field.value} onChange={field.onChange} />
        )} />
      </InputField>
      <InputField label="Tax Code">
        <Controller control={control} name="taxCode" render={({ field }) => (
          <select {...field} className={controlClasses}>
            <option value="">Select</option>
            {TAX_CODE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )} />
      </InputField>
      <InputField label="Doc Type">
        <Controller control={control} name="docType" render={({ field }) => (
          <select {...field} className={controlClasses}>
            {DOC_TYPE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )} />
      </InputField>
      <InputField label="Location Id">
        <Controller control={control} name="locationId" render={({ field }) => (
          <select {...field} className={controlClasses}>
            <option value="">Select</option>
            {["Warehouse A", "Warehouse B", "Store"].map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )} />
      </InputField>
      <InputField label="Sales Invoice No">
        <input {...register("salesInvoiceNo")} disabled className={`${controlClasses} bg-gray-50 dark:bg-gray-800`} />
      </InputField>
      <InputField label="Customer Id">
        <Controller control={control} name="customerId" render={({ field }) => (
          <select {...field} onChange={(e) => {
            field.onChange(e.target.value);
            const cust = CUSTOMER_OPTIONS.find((c) => c === e.target.value);
            setValue("customerName", cust ? cust.split(" - ")[1] || "" : "", { shouldDirty: true });
          }} className={controlClasses}>
            <option value="">Select</option>
            {CUSTOMER_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )} />
      </InputField>
      <InputField label="Customer Name">
        <input {...register("customerName")} disabled className={`${controlClasses} bg-gray-50 dark:bg-gray-800`} />
      </InputField>
      <InputField label="Customer Code">
        <input {...register("customerCode")} className={controlClasses} />
      </InputField>
      <InputField label="Vehicle">
        <input {...register("vehicle")} className={controlClasses} />
      </InputField>
      <InputField label="Invoice Date" required error={errMap.invoiceDate}>
        <input type="date" {...register("invoiceDate")} className={`${controlClasses} ${errMap.invoiceDate ? "border-red-500" : ""}`} />
      </InputField>
      <InputField label="Time of Issue">
        <input type="time" {...register("timeOfIssue")} disabled className={`${controlClasses} bg-gray-50 dark:bg-gray-800`} />
      </InputField>
      <InputField label="Time of Removal">
        <input type="time" {...register("timeOfRemoval")} disabled className={`${controlClasses} bg-gray-50 dark:bg-gray-800`} />
      </InputField>
      <InputField label="Is IGST Applicable" required error={errMap.isIgstApplicable}>
        <Controller control={control} name="isIgstApplicable" render={({ field }) => (
          <ToggleSwitch value={field.value} onChange={field.onChange} />
        )} />
      </InputField>
      <InputField label="Currency">
        <Controller control={control} name="currency" render={({ field }) => (
          <select {...field} className={controlClasses}>
            {CURRENCY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )} />
      </InputField>
      <InputField label="GSTN No">
        <input {...register("gstnNo")} className={controlClasses} />
      </InputField>
      <InputField label="Invoice Type">
        <Controller control={control} name="invoiceType" render={({ field }) => (
          <select {...field} className={controlClasses}>
            <option value="">Select</option>
            {INVOICE_TYPE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )} />
      </InputField>
      <InputField label="Sch. No">
        <input {...register("schNo")} className={controlClasses} />
      </InputField>
      <InputField label="D. No">
        <input {...register("dNo")} className={controlClasses} />
      </InputField>
      <InputField label="Sch. Date">
        <input type="date" {...register("schDate")} className={controlClasses} />
      </InputField>
      <InputField label="D. Date">
        <input type="date" {...register("dDate")} className={controlClasses} />
      </InputField>
      <InputField label="Exchange Rate">
        <input type="number" step="0.01" {...register("exchangeRate")} className={controlClasses} />
      </InputField>
      <InputField label="Kanban Card No">
        <input {...register("kanbanCardNo")} className={controlClasses} />
      </InputField>
      <InputField label="Stock Posting">
        <Controller control={control} name="stockPosting" render={({ field }) => (
          <ToggleSwitch value={field.value} onChange={field.onChange} />
        )} />
      </InputField>
    </div>
  );

  const itemColumns = [
    { key: "itemCode", label: "Item Code", width: "110px", required: true },
    { key: "itemDescription", label: "Item Description", width: "130px" },
    { key: "hsnSacCode", label: "HSN/SAC Code", width: "90px", required: true },
    { key: "taxType", label: "Tax Type", width: "85px" },
    { key: "taxPerc", label: "Tax %", width: "55px" },
    { key: "customerPartNo", label: "Customer Part No", width: "100px" },
    { key: "unit", label: "Unit", width: "55px" },
    { key: "lastInvoicedDate", label: "Last Invoiced Date", width: "115px" },
    { key: "tariffNo", label: "Tariff No", width: "80px" },
    { key: "stock", label: "Stock", width: "60px" },
    { key: "soConf", label: "S.O. Conf.", width: "60px" },
  ];

  const renderItemCell = (col, row, idx) => {
    const base = `itemDetails.${idx}.`;
    const isReadonly = ["itemDescription"].includes(col.key);
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
    if (col.key === "soConf") {
      return (
        <Controller control={control} name={`${base}${col.key}`} render={({ field }) => (
          <input type="checkbox" checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} className="h-3.5 w-3.5 rounded border-gray-300 dark:border-gray-600" />
        )} />
      );
    }
    if (isReadonly) {
      return <input value={row?.[col.key] ?? ""} readOnly className={cls} />;
    }
    if (col.key === "lastInvoicedDate") {
      return (
        <input type="date" defaultValue={row?.[col.key] ?? ""}
          onChange={(e) => handleItemChange(idx, col.key, e.target.value, row)} className={cls} />
      );
    }
    const numericFields = ["taxPerc", "stock"];
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
                <td className="px-1.5 py-1 text-center whitespace-nowrap w-[50px]">
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
    { key: "glAccountName", label: "GL Account Name", width: "150px" },
  ];

  const renderTaxCell = (col, row, idx) => {
    const base = `taxDetails.${idx}.`;
    const cls = `${controlClasses} w-[${col.width}]`;

    if (col.key === "taxId") {
      return <input value={row?.[col.key] ?? ""} readOnly className={`${cls} bg-gray-50 dark:bg-gray-800`} />;
    }
    if (col.key === "glAccountName") {
      return (
        <Controller control={control} name={`${base}${col.key}`} render={({ field }) => (
          <select {...field} className={cls}>
            <option value="">Select</option>
            {GL_ACCOUNT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
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
                <td className="px-1.5 py-1 text-center whitespace-nowrap w-[50px]">
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
          <input type="number" step="0.01" {...register("totalAssessableValue")} className={controlClasses} />
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
          <input type="number" step="0.01" {...register("grossAmount")}
            onChange={(e) => handleGrossAmountChange(e.target.value)}
            className={controlClasses} />
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
          {data ? "Edit Other Sales Invoice" : "New Other Sales Invoice"}
        </h2>
        <div className="ml-auto flex items-center gap-2">
          <label className={labelClasses}>Active</label>
          <Controller control={control} name="active" render={({ field }) => (
            <ToggleSwitch value={field.value} onChange={field.onChange} />
          )} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
        <SectionHeader>Invoice Header</SectionHeader>
        {renderHeader(formErrs)}

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

        {activeTab === "itemDetails" && renderItemDetailsTab(formErrs)}
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

export default OtherSalesInvoiceForm;

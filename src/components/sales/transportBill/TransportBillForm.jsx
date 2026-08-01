import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import dayjs from "dayjs";
import transportBillAPI from "../../../api/Sales/transportBillAPI";
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

const TRANSPORT_OPTIONS = ["Truck India", "Blue Dart", "DHL Freight", "Transport Corp"];
const RECEIVED_BY_OPTIONS = ["Driver", "Store In-charge", "Accounts", "Admin"];

const getDefaultPaymentRow = () => ({
  chequeNo: "",
  chequeDate: "",
  totalAmount: "",
  paidAmount: "",
  pendingAmount: "",
});

const getDefaultValues = (data) => ({
  plantId: data?.plantId || "",
  docNo: data?.docNo || `TB/${dayjs().format("DDD")}/${String(Date.now()).slice(-4)}`,
  transportName: data?.transportName || "",
  docDate: data?.docDate || dayjs().format("YYYY-MM-DD"),
  billNo: data?.billNo || "",
  billDate: data?.billDate || "",
  totalAmount: data?.totalAmount ?? "",
  billReceivedDate: data?.billReceivedDate || "",
  accReceivedDate: data?.accReceivedDate || "",
  receivedBy: data?.receivedBy || "",
  accReceivedBy: data?.accReceivedBy || "",
  active: data?.active === "Active" || data?.active !== false,
  id: data?.id || 0,
  paymentDetails1: data?.paymentDetails1?.length
    ? data.paymentDetails1.map((r) => ({
        chequeNo: r.chequeNo || "", chequeDate: r.chequeDate || "", totalAmount: r.totalAmount ?? "",
        paidAmount: r.paidAmount ?? "", pendingAmount: r.pendingAmount ?? "",
      }))
    : [getDefaultPaymentRow()],
  paymentDetails2: data?.paymentDetails2?.length
    ? data.paymentDetails2.map((r) => ({
        chequeNo: r.chequeNo || "", chequeDate: r.chequeDate || "", totalAmount: r.totalAmount ?? "",
        paidAmount: r.paidAmount ?? "", pendingAmount: r.pendingAmount ?? "",
      }))
    : [getDefaultPaymentRow()],
});

const TransportBillForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId")) || 0;
  const branch = Number(localStorage.getItem("branchId")) || 1000000001;

  const {
    control, handleSubmit, setValue, watch, register,
  } = useForm({
    mode: "onTouched",
    defaultValues: getDefaultValues(data),
  });

  const { fields: fields1, append: append1, remove: remove1 } = useFieldArray({
    control, name: "paymentDetails1",
  });

  const { fields: fields2, append: append2, remove: remove2 } = useFieldArray({
    control, name: "paymentDetails2",
  });

  const watch1 = watch("paymentDetails1");
  const watch2 = watch("paymentDetails2");

  const [activeTab, setActiveTab] = useState("payment1");
  const [formErrs, setFormErrs] = useState({});

  const handlePaymentChange = (setName, idx, field, value, row) => {
    const base = `${setName}.${idx}.`;
    setValue(`${base}${field}`, value, { shouldDirty: true });
    if (["totalAmount", "paidAmount"].includes(field)) {
      const total = parseFloat(field === "totalAmount" ? value : row?.totalAmount) || 0;
      const paid = parseFloat(field === "paidAmount" ? value : row?.paidAmount) || 0;
      const pending = Math.max(0, total - paid);
      setValue(`${base}pendingAmount`, pending || "", { shouldDirty: true });
    }
  };

  const validate = () => {
    const errs = {};
    const vals = watch();
    if (!vals.plantId) errs.plantId = "Required";
    if (!vals.transportName) errs.transportName = "Required";
    if (!vals.billNo) errs.billNo = "Required";
    if (!vals.billDate) errs.billDate = "Required";
    if (vals.totalAmount === "" || vals.totalAmount === undefined || Number(vals.totalAmount) <= 0) {
      errs.totalAmount = "Required";
    }
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
      await transportBillAPI.createUpdate(payload);
      addToast(data ? "Transport Bill Updated!" : "Transport Bill Saved!", "success");
      onBack();
    } catch (error) {
      console.error("Save error:", error);
      addToast("Failed to save Transport Bill.", "error");
    }
  };

  const renderHeader = (errMap) => (
    <div className={fieldGrid}>
      <InputField label="Plant ID" required error={errMap.plantId}>
        <Controller control={control} name="plantId" render={({ field }) => (
          <select {...field} className={`${controlClasses} ${errMap.plantId ? "border-red-500" : ""}`}>
            <option value="">Select</option>
            {["Plant 1", "Plant 2", "Plant 3"].map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )} />
      </InputField>
      <InputField label="Doc No">
        <input {...register("docNo")} disabled className={`${controlClasses} bg-gray-50 dark:bg-gray-800`} />
      </InputField>
      <InputField label="Transport Name" required error={errMap.transportName}>
        <Controller control={control} name="transportName" render={({ field }) => (
          <select {...field} className={`${controlClasses} ${errMap.transportName ? "border-red-500" : ""}`}>
            <option value="">Select</option>
            {TRANSPORT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )} />
      </InputField>
      <InputField label="Doc Date">
        <input type="date" {...register("docDate")} className={controlClasses} />
      </InputField>
      <InputField label="Bill No" required error={errMap.billNo}>
        <input {...register("billNo")} className={`${controlClasses} ${errMap.billNo ? "border-red-500" : ""}`} />
      </InputField>
      <InputField label="Bill Date" required error={errMap.billDate}>
        <input type="date" {...register("billDate")} className={`${controlClasses} ${errMap.billDate ? "border-red-500" : ""}`} />
      </InputField>
      <InputField label="Total Amount" required error={errMap.totalAmount}>
        <input type="number" step="0.01" {...register("totalAmount")} className={`${controlClasses} ${errMap.totalAmount ? "border-red-500" : ""}`} />
      </InputField>
      <InputField label="Bill Received Date">
        <input type="date" {...register("billReceivedDate")} className={controlClasses} />
      </InputField>
      <InputField label="Acc Received Date">
        <input type="date" {...register("accReceivedDate")} className={controlClasses} />
      </InputField>
      <InputField label="Received By">
        <Controller control={control} name="receivedBy" render={({ field }) => (
          <select {...field} className={controlClasses}>
            <option value="">Select</option>
            {RECEIVED_BY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )} />
      </InputField>
      <InputField label="Acc Received By">
        <Controller control={control} name="accReceivedBy" render={({ field }) => (
          <select {...field} className={controlClasses}>
            <option value="">Select</option>
            {RECEIVED_BY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )} />
      </InputField>
    </div>
  );

  const paymentColumns = [
    { key: "chequeNo", label: "Cheque/RTGS No", width: "130px" },
    { key: "chequeDate", label: "Cheque Date", width: "110px" },
    { key: "totalAmount", label: "Total Amount", width: "100px" },
    { key: "paidAmount", label: "Paid Amount", width: "100px" },
    { key: "pendingAmount", label: "Pending Amount", width: "110px" },
  ];

  const renderPaymentCell = (setName, col, row, idx) => {
    const cls = `${controlClasses} w-[${col.width}]`;

    if (col.key === "pendingAmount") {
      return <input value={row?.[col.key] ?? ""} readOnly className={`${cls} bg-gray-50 dark:bg-gray-800`} />;
    }
    if (col.key === "chequeDate") {
      return (
        <input type="date" defaultValue={row?.[col.key] ?? ""}
          onChange={(e) => handlePaymentChange(setName, idx, col.key, e.target.value, row)} className={cls} />
      );
    }
    if (col.key === "chequeNo") {
      return (
        <input type="text" defaultValue={row?.[col.key] ?? ""}
          onChange={(e) => handlePaymentChange(setName, idx, col.key, e.target.value, row)} className={cls} />
      );
    }
    return (
      <input
        type="number"
        step="0.01"
        defaultValue={row?.[col.key] ?? ""}
        onChange={(e) => handlePaymentChange(setName, idx, col.key, e.target.value, row)}
        className={cls}
      />
    );
  };

  const renderPaymentTab = (tabLabel, setName, fields, addRow, removeRow, rows) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <SectionHeader>{tabLabel}</SectionHeader>
        <button type="button" onClick={addRow}
          className="flex items-center gap-1 px-2 py-1 rounded text-[11px] bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors">
          <Plus className="h-3 w-3" /> Add Row
        </button>
      </div>
      <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
        <table className="w-full text-xs">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className={thClass}>#</th>
              {paymentColumns.map((c) => (
                <th key={c.key} className={thClass} style={{ minWidth: c.width }}>{c.label}</th>
              ))}
              <th className={`${thClass} text-center`} style={{ minWidth: "50px" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((row, idx) => (
              <tr key={row.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-1.5 py-1 text-gray-500 dark:text-gray-400 text-[10px] w-[25px]">{idx + 1}</td>
                {paymentColumns.map((col) => (
                  <td key={col.key} className="px-1.5 py-1" style={{ minWidth: col.width }}>
                    {renderPaymentCell(setName, col, rows?.[idx], idx)}
                  </td>
                ))}
                <td className="px-1.5 py-1 text-center whitespace-nowrap w-[50px]">
                  <button type="button" onClick={() => removeRow(idx)} disabled={fields.length <= 1}
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

  const tabs = [
    { key: "payment1", label: "Payment Details 1" },
    { key: "payment2", label: "Payment Details 2" },
  ];

  return (
    <div className="animate-fadeIn px-3 py-3 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <button type="button" onClick={onBack} className="p-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data ? "Edit Transport Bill" : "New Transport Bill"}
        </h2>
        <div className="ml-auto flex items-center gap-2">
          <label className={labelClasses}>Active</label>
          <Controller control={control} name="active" render={({ field }) => (
            <ToggleSwitch value={field.value} onChange={field.onChange} />
          )} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
        <SectionHeader>Transport Bill Header</SectionHeader>
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

        {activeTab === "payment1" && renderPaymentTab("Payment Details 1", "paymentDetails1", fields1, () => append1(getDefaultPaymentRow()), remove1, watch1)}
        {activeTab === "payment2" && renderPaymentTab("Payment Details 2", "paymentDetails2", fields2, () => append2(getDefaultPaymentRow()), remove2, watch2)}

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

export default TransportBillForm;

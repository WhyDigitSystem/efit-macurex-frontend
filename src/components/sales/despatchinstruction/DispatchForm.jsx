import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "../../Toast/ToastContext";
import despatchInstructionAPI from "../../../api/Sales/despatchInstructionAPI";
import branchAPI from "../../../api/branchAPI";
import partyMasterAPI from "../../../api/partyMasterAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import itemAPI from "../../../api/itemAPI";
import unitMasterAPI from "../../../api/unitAPI";

/* ---------------------------------------------------------------------------- */
/* Shared design tokens                                                        */

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const controlErrClasses =
  "border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500";

const cellInputClasses =
  "w-full h-8 px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400";

const cellTextareaClasses =
  "w-full h-8 px-2 py-[10px] rounded border text-xs leading-none transition-colors overflow-y-auto resize-none scrollbar-hide " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400";

const cellReadOnlyClasses =
  "w-full h-8 px-2 rounded border text-xs leading-none " +
  "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 " +
  "text-gray-500 dark:text-gray-400";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-x-4 gap-y-3 items-start";

const subTabFieldGrid =
  "grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-x-5 gap-y-4 items-start";

/* ---------------------------------------------------------------------------- */
/* Shared building blocks                                                      */

const Field = ({
  label,
  name,
  value,
  onChange,
  error,
  required,
  type = "text",
  options,
  className = "",
  disabled = false,
}) => {
  if (type === "select") {
    return (
      <div className={`w-full ${className}`}>
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>

        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`${controlClasses} ${error ? controlErrClasses : ""}`}
        >
          <option value="">-- Select --</option>
          {(options || []).map((opt) => (
            <option key={opt.value ?? opt} value={opt.value ?? opt}>
              {opt.label ?? opt}
            </option>
          ))}
        </select>

        {error && (
          <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">
            {error}
          </p>
        )}
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div className={`w-full ${className}`}>
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>

        <textarea
          name={name}
          value={value}
          onChange={onChange}
          rows={1}
          className={
            "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors resize-none pt-1 scrollbar-hide " +
            "bg-white dark:bg-gray-900 " +
            `${error ? controlErrClasses : "border-gray-300 dark:border-gray-600"} ` +
            "text-gray-900 dark:text-gray-100 " +
            "placeholder-gray-400 dark:placeholder-gray-500 " +
            "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
            "dark:focus:ring-blue-400 dark:focus:border-blue-400"
          }
        />

        {error && (
          <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <label className={labelClasses}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`${controlClasses} ${error ? controlErrClasses : ""}`}
      />

      {error && (
        <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
};

const SectionHeader = ({ children }) => (
  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
    {children}
  </h3>
);

const FormButtons = ({ onCancel, onSave, isSubmitting, saveLabel }) => (
  <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
    <button
      onClick={onCancel}
      disabled={isSubmitting}
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs whitespace-nowrap border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <X className="h-3 w-3" />
      Cancel
    </button>

    <button
      onClick={onSave}
      disabled={isSubmitting}
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs whitespace-nowrap text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <Save className="h-3 w-3" />
      {isSubmitting ? "Saving..." : saveLabel}
    </button>
  </div>
);

/* ---------------------------------------------------------------------------- */
/* Table helpers                                                               */

const TableWrapper = ({ children }) => (
  <div className="w-full overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
    <table className="w-full min-w-max text-xs">{children}</table>
  </div>
);

const TableHead = ({ headers }) => (
  <thead className="bg-gray-100 dark:bg-gray-700">
    <tr>
      {headers.map((h, i) => (
        <th
          key={i}
          className={`p-2 whitespace-nowrap ${
            i === 0
              ? "w-8 text-center"
              : i === headers.length - 1
                ? "w-20 text-left"
                : "text-left"
          } dark:text-white`}
        >
          {h}
        </th>
      ))}
    </tr>
  </thead>
);

const TableRow = ({ children, index, onRemove, disabled }) => (
  <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
    <td className="p-2 text-center font-medium dark:text-white">{index + 1}</td>
    {children}
    <td className="p-2 text-center">
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className={`h-6 w-6 rounded text-white flex items-center justify-center ${
          disabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-red-600 hover:bg-red-700"
        }`}
      >
        <Trash2 size={12} />
      </button>
    </td>
  </tr>
);

/* Generic dynamic table. Supports text / number / textarea / select /
   readonly columns. Options may be plain strings or { value, label } objects. */
const DynamicTable = ({ columns, rows, onCellChange, onRemoveRow }) => (
  <TableWrapper>
    <TableHead headers={["#", ...columns.map((c) => c.label), "Action"]} />
    <tbody>
      {rows.map((row, idx) => (
        <TableRow
          key={idx}
          index={idx}
          onRemove={() => onRemoveRow(idx)}
          disabled={rows.length <= 1}
        >
          {columns.map((col) => {
            if (col.type === "select") {
              return (
                <td className="p-2 align-top" key={col.key}>
                  <select
                    value={row[col.key]}
                    onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                    className={cellInputClasses}
                  >
                    <option value="">-- Select --</option>
                    {(col.options || []).map((opt) => (
                      <option key={opt.value ?? opt} value={opt.value ?? opt}>
                        {opt.label ?? opt}
                      </option>
                    ))}
                  </select>
                </td>
              );
            }

            if (col.type === "textarea") {
              return (
                <td className="p-2 align-top" key={col.key}>
                  <textarea
                    value={row[col.key]}
                    rows={1}
                    readOnly={col.readOnly}
                    onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                    className={
                      col.readOnly ? cellReadOnlyClasses : cellTextareaClasses
                    }
                  />
                </td>
              );
            }

            return (
              <td className="p-2 align-top" key={col.key}>
                <input
                  type={col.type === "number" ? "number" : "text"}
                  value={row[col.key]}
                  readOnly={col.readOnly}
                  onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                  className={
                    col.readOnly ? cellReadOnlyClasses : cellInputClasses
                  }
                />
              </td>
            );
          })}
        </TableRow>
      ))}
    </tbody>
  </TableWrapper>
);

/* ---------------------------------------------------------------------------- */
/* Options                                                                      */

const MODE_OF_TRANSPORT = ["Road", "Rail", "Air", "Sea"];
const INVOICE_TYPES = ["Tax Invoice", "Retail Invoice", "Credit Note"];
const PACKAGE_TYPES = ["Carton Box", "Wooden Box", "Pallet", "Crate", "Drum"];
const PDI_STATUS = ["Passed", "Failed", "Pending"];
const APPLICABLE = ["Yes", "No", "N/A"];

const CHILD_TABS = [
  { key: "dispatchDetails", label: "Dispatch Details", kind: "table" },
  { key: "termsConditions", label: "Terms and Conditions", kind: "fields" },
];

const emptyDispatchItemRow = () => ({
  id: null,
  ordAccpContrNo: "",
  date: "",
  item: "",
  itemDescription: "",
  pdiDate: "",
  pdi: "",
  schduleMonth: "",
  pendingQty: "",
  availableQty: "",
  plannedQty: "",
  descQty: "",
  noOfPackage: "",
  packageType: "",
  unit: "",
});

const emptyTermsConditions = () => ({
  term: "",
  description: "",
  applicable: "",
  remarks: "",
});

const todayStr = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const autoDispatchNo = () =>
  `DI-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;

/* ---------------------------------------------------------------------------- */

const DispatchForm = ({ data, onBack }) => {
  const [orgId] = useState(Number(localStorage.getItem("orgId")) || 0);
  const [branchId] = useState(Number(localStorage.getItem("branchId")) || 0);
  const { addToast } = useToast();

  const [activeChildTab, setActiveChildTab] = useState("dispatchDetails");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [plantOptions, setPlantOptions] = useState([]);
  const [partyOptions, setPartyOptions] = useState([]);
  const [partyMap, setPartyMap] = useState({});
  const [locationOptions, setLocationOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [itemMap, setItemMap] = useState({});
  const [unitOptions, setUnitOptions] = useState([]);

  const [header, setHeader] = useState(() => ({
    branch: data?.branch?.id ?? data?.branch ?? "",
    diNo: data?.diNo || (data ? "" : autoDispatchNo()),
    customer: data?.customer?.id ?? data?.customer ?? "",
    partyName: data?.customer?.customerName ?? data?.customerName ?? "",
    schduleNo: data?.schduleNo || data?.scheduleNo || "",
    schduleDate: data?.schduleDate || data?.schDate || todayStr(),
    location: data?.location?.id ?? data?.location ?? "",
    modeOfTransport: data?.modeOfTransport || "",
    netWeight: data?.netWeight ?? "",
    grossWeight: data?.grossWeight ?? "",
    consignee: data?.consignee || "",
    paymentTerms: data?.paymentTerms || "",
    deliveryInstructions: data?.deliveryInstructions || "",
    invoiceType: data?.invoiceType || "",
    cancelRemarks: data?.cancelRemarks || "",
    active: data?.active !== false,
  }));

  const [dispatchItemRows, setDispatchItemRows] = useState(
    data?.despatchInstructionDetailsDTO?.length
      ? data.despatchInstructionDetailsDTO.map((d) => ({
          ...emptyDispatchItemRow(),
          ...d,
          itemDescription: d.itemDescription || "",
        }))
      : [emptyDispatchItemRow()],
  );
  const [termsConditions, setTermsConditions] = useState({
    ...emptyTermsConditions(),
    ...data?.termsConditions,
  });

  /* ---------------- Lookup loading ---------------- */

  const loadPlants = useCallback(async () => {
    try {
      const res = await branchAPI.getBranchByOrgId(orgId);
      setPlantOptions(
        (res || []).map((b) => ({
          value: b.id,
          label: b.branchName || b.branchCode || b.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load plant options:", error);
      setPlantOptions([]);
    }
  }, [orgId]);

  const loadParties = useCallback(async () => {
    try {
      const res = await partyMasterAPI.getPartyByOrgId(orgId, branchId);
      const map = {};
      const opts = (res || []).map((c) => {
        map[c.id] = c.customerName || c.docId || c.id;
        return { value: c.id, label: c.customerName || c.docId || c.id };
      });
      setPartyOptions(opts);
      setPartyMap(map);
    } catch (error) {
      console.error("Failed to load party options:", error);
      setPartyOptions([]);
      setPartyMap({});
    }
  }, [orgId, branchId]);

  const loadLocations = useCallback(async () => {
    try {
      const res = await locationMasterAPI.getLocationMasterByOrgId(
        orgId,
        branchId,
      );
      setLocationOptions(
        (res || []).map((l) => ({
          value: l.id,
          label: l.locationName || l.locationCode || l.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load location options:", error);
      setLocationOptions([]);
    }
  }, [orgId, branchId]);

  const loadItems = useCallback(async () => {
    try {
      const res = await itemAPI.getItems(orgId, branchId);
      const map = {};
      const opts = (res || []).map((it) => {
        map[it.id] = it;
        return { value: it.id, label: it.itemCode || it.id };
      });
      setItemOptions(opts);
      setItemMap(map);
    } catch (error) {
      console.error("Failed to load item options:", error);
      setItemOptions([]);
      setItemMap({});
    }
  }, [orgId, branchId]);

  const loadUnits = useCallback(async () => {
    try {
      const res = await unitMasterAPI.getUnits(branchId, orgId);
      setUnitOptions(
        (res || []).map((u) => ({
          value: u.id,
          label: u.unitName || u.unitId || u.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load unit options:", error);
      setUnitOptions([]);
    }
  }, [orgId, branchId]);

  useEffect(() => {
    if (orgId) {
      loadPlants();
      loadParties();
      loadLocations();
      loadItems();
      loadUnits();
    }
  }, [
    orgId,
    loadPlants,
    loadParties,
    loadLocations,
    loadItems,
    loadUnits,
  ]);

  /* ---------------- Handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "customer") {
        next.partyName = partyMap[value] || "";
      }

      return next;
    });
  };

  const handleTermsChange = (e) => {
    const { name, value } = e.target;
    setTermsConditions((prev) => ({ ...prev, [name]: value }));
  };

  const handleCellChange = (idx, key, value) => {
    setDispatchItemRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        let next = { ...row, [key]: value };

        if (key === "item") {
          const item = itemMap[value];
          next.itemDescription = item?.itemDescription || "";
        }

        return next;
      }),
    );
  };

  const handleAddRow = () =>
    setDispatchItemRows((prev) => [...prev, emptyDispatchItemRow()]);
  const handleRemoveRow = (idx) =>
    setDispatchItemRows((prev) => prev.filter((_, i) => i !== idx));

  /* ---------------- Validation & Save ---------------- */

  const validate = () => {
    const errors = {};

    if (!header.branch) errors.branch = "Plant Id is required";
    if (!header.customer) errors.customer = "Party Id is required";
    if (!header.schduleNo) errors.schduleNo = "Schedule No is required";
    if (!header.schduleDate) errors.schduleDate = "Sch. Date is required";
    if (!header.location) errors.location = "From Location is required";
    if (!header.modeOfTransport)
      errors.modeOfTransport = "Mode of Transport is required";
    if (!header.invoiceType) errors.invoiceType = "Invoice Type is required";

    const hasValidRow = dispatchItemRows.some(
      (r) =>
        r.ordAccpContrNo &&
        r.date &&
        r.item &&
        r.schduleMonth &&
        Number(r.descQty) > 0 &&
        Number(r.noOfPackage) > 0,
    );
    if (!hasValidRow)
      errors.dispatchItems =
        "Add at least one item with Order Accept Contract No, Date, Item Code, Schedule Month, Desc Qty and No of Package";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);

    const payload = {
      ...(isUpdate ? { id: data.id } : {}),
      orgId,
      branch: Number(header.branch) || 0,
      customer: Number(header.customer) || 0,
      diNo: header.diNo,
      schduleNo: header.schduleNo,
      schduleDate: header.schduleDate,
      location: Number(header.location) || 0,
      modeOfTransport: header.modeOfTransport,
      netWeight: Number(header.netWeight) || 0,
      grossWeight: Number(header.grossWeight) || 0,
      consignee: header.consignee,
      paymentTerms: header.paymentTerms,
      deliveryInstructions: header.deliveryInstructions,
      invoiceType: header.invoiceType,
      cancelRemarks: header.cancelRemarks,
      active: header.active !== false,
      despatchInstructionDetailsDTO: dispatchItemRows
        .filter((r) => r.item)
        .map((r) => ({
          ...(r.id ? { id: r.id } : {}),
          ordAccpContrNo: r.ordAccpContrNo,
          date: r.date,
          item: Number(r.item) || 0,
          pdiDate: r.pdiDate,
          pdi: r.pdi,
          schduleMonth: r.schduleMonth,
          pendingQty: r.pendingQty,
          availableQty: r.availableQty,
          plannedQty: r.plannedQty,
          descQty: r.descQty,
          noOfPackage: r.noOfPackage,
          packageType: r.packageType,
          unit: Number(r.unit) || 0,
        })),
      createdBy: localStorage.getItem("usersId"),
      ...(isUpdate ? { updatedBy: localStorage.getItem("usersId") } : {}),
    };

    try {
      const response =
        await despatchInstructionAPI.createUpdateDispatch(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Dispatch Instruction updated successfully!"
              : "Dispatch Instruction created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            "Failed to save Dispatch Instruction.",
        );
      }
    } catch (err) {
      console.error("Save Dispatch Instruction Error:", err);
      if (err.response?.data) {
        addToast(
          err.response.data.message ||
            err.response.data.statusMessage ||
            err.response.data.error ||
            JSON.stringify(err.response.data),
        );
      } else {
        addToast("Something went wrong.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeTabMeta = CHILD_TABS.find((t) => t.key === activeChildTab);

  return (
    <div className="w-full p-2">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data ? "Edit Dispatch Instruction" : "Add Dispatch Instruction"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Info ---------------- */}
        <div>
          <SectionHeader>Dispatch Instruction</SectionHeader>
          <div className={fieldGrid}>
            <Field
              type="select"
              label="Plant Id"
              name="branch"
              value={header.branch}
              onChange={handleHeaderChange}
              error={fieldErrors.branch}
              options={plantOptions}
              required
            />
            <Field
              label="DI No"
              name="diNo"
              value={header.diNo}
              onChange={handleHeaderChange}
              required
              disabled={!data}
            />
            <Field
              type="select"
              label="Party Id"
              name="customer"
              value={header.customer}
              onChange={handleHeaderChange}
              error={fieldErrors.customer}
              options={partyOptions}
              required
            />
            <Field
              label="Party Name"
              name="partyName"
              value={header.partyName}
              onChange={handleHeaderChange}
              disabled
            />
            <Field
              label="Schedule No"
              name="schduleNo"
              value={header.schduleNo}
              onChange={handleHeaderChange}
              error={fieldErrors.schduleNo}
              required
            />
            <Field
              type="date"
              label="Sch. Date"
              name="schduleDate"
              value={header.schduleDate}
              onChange={handleHeaderChange}
              error={fieldErrors.schduleDate}
              required
            />
            <Field
              type="select"
              label="From Location"
              name="location"
              value={header.location}
              onChange={handleHeaderChange}
              error={fieldErrors.location}
              options={locationOptions}
              required
            />
            <Field
              type="select"
              label="Mode of Transport"
              name="modeOfTransport"
              value={header.modeOfTransport}
              onChange={handleHeaderChange}
              error={fieldErrors.modeOfTransport}
              options={MODE_OF_TRANSPORT}
              required
            />
            <Field
              type="number"
              label="Net Weight"
              name="netWeight"
              value={header.netWeight}
              onChange={handleHeaderChange}
            />
            <Field
              type="number"
              label="Gross Weight"
              name="grossWeight"
              value={header.grossWeight}
              onChange={handleHeaderChange}
            />
            <Field
              label="Consignee"
              name="consignee"
              value={header.consignee}
              onChange={handleHeaderChange}
            />
            <Field
              label="Payment Terms"
              name="paymentTerms"
              value={header.paymentTerms}
              onChange={handleHeaderChange}
            />
            <Field
              type="select"
              label="Invoice Type"
              name="invoiceType"
              value={header.invoiceType}
              onChange={handleHeaderChange}
              error={fieldErrors.invoiceType}
              options={INVOICE_TYPES}
              required
            />
            <Field
              type="textarea"
              label="Delivery Instructions"
              name="deliveryInstructions"
              value={header.deliveryInstructions}
              onChange={handleHeaderChange}
              className="sm:col-span-2"
            />
          </div>
        </div>

        {/* ---------------- Child Tabs ---------------- */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-0">
            <div className="flex flex-wrap">
              {CHILD_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveChildTab(tab.key)}
                  className={`px-4 py-1 text-xs font-semibold rounded-t whitespace-nowrap ${
                    activeChildTab === tab.key
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTabMeta.kind === "table" && (
              <button
                type="button"
                onClick={handleAddRow}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {/* Dispatch Details tab */}
          {activeChildTab === "dispatchDetails" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  {
                    key: "ordAccpContrNo",
                    label: "Order Accept Contract No",
                    required: true,
                  },
                  { key: "date", label: "Date", type: "date", required: true },
                  {
                    key: "item",
                    label: "Item Code",
                    type: "select",
                    options: itemOptions,
                    required: true,
                  },
                  {
                    key: "itemDescription",
                    label: "Item Description",
                    readOnly: true,
                  },
                  { key: "pdiDate", label: "PDI Date", type: "date" },
                  {
                    key: "pdi",
                    label: "PDI",
                    type: "select",
                    options: PDI_STATUS,
                  },
                  {
                    key: "schduleMonth",
                    label: "Schedule Month",
                    type: "month",
                    required: true,
                  },
                  {
                    key: "pendingQty",
                    label: "Pending Qty",
                    type: "number",
                  },
                  {
                    key: "availableQty",
                    label: "Available Qty",
                    type: "number",
                  },
                  {
                    key: "plannedQty",
                    label: "Planned Qty",
                    type: "number",
                  },
                  {
                    key: "descQty",
                    label: "Desc Qty",
                    type: "number",
                    required: true,
                  },
                  {
                    key: "noOfPackage",
                    label: "No of Package",
                    type: "number",
                    required: true,
                  },
                  {
                    key: "packageType",
                    label: "Package Type",
                    type: "select",
                    options: PACKAGE_TYPES,
                  },
                  {
                    key: "unit",
                    label: "Unit",
                    type: "select",
                    options: unitOptions,
                  },
                ]}
                rows={dispatchItemRows}
                onCellChange={handleCellChange}
                onRemoveRow={handleRemoveRow}
              />
              {fieldErrors.dispatchItems && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.dispatchItems}
                </p>
              )}
            </div>
          )}

          {/* Terms and Conditions tab */}
          {activeChildTab === "termsConditions" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  label="Term"
                  name="term"
                  value={termsConditions.term}
                  onChange={handleTermsChange}
                />
                <Field
                  type="textarea"
                  label="Description"
                  name="description"
                  value={termsConditions.description}
                  onChange={handleTermsChange}
                />
                <Field
                  type="select"
                  label="Applicable"
                  name="applicable"
                  value={termsConditions.applicable}
                  onChange={handleTermsChange}
                  options={APPLICABLE}
                />
                <Field
                  type="textarea"
                  label="Remarks"
                  name="remarks"
                  value={termsConditions.remarks}
                  onChange={handleTermsChange}
                />
              </div>
            </div>
          )}
        </section>

        <FormButtons
          onCancel={onBack}
          onSave={handleSave}
          isSubmitting={isSubmitting}
          saveLabel={data ? "Update" : "Save"}
        />
      </div>
    </div>
  );
};

export default DispatchForm;

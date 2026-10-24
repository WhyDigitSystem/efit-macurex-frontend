import React, { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Save, X, Plus, Trash2, Loader2 } from "lucide-react";

import gateOutwardAPI, {
  YES_NO_OPTIONS,
  getCtx,
  normalizeEntry,
  nowTime,
  withCurrent,
} from "../../../api/Security/Gateoutwardapi";
import branchAPI from "../../../api/branchAPI";
import { employeeAPI } from "../../../api/employeeAPI";
import itemAPI from "../../../api/itemAPI";

/* -------------------------------------------------------------------------- */
/* Shared styles */
/* -------------------------------------------------------------------------- */

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const cellInputClasses =
  "w-full h-8 px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-2 items-start";

/* -------------------------------------------------------------------------- */
/* Helpers */
/* -------------------------------------------------------------------------- */

const asId = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return value.id ?? "";
  return value;
};

const unitLabel = (unit) => {
  if (!unit) return "";
  if (typeof unit !== "object") return String(unit);
  return (
    unit.primaryUnit ??
    unit.unitId ??
    unit.unitName ??
    unit.unitDescription ??
    ""
  );
};

/* -------------------------------------------------------------------------- */
/* Field */
/* -------------------------------------------------------------------------- */

const Field = ({
  label,
  name,
  value,
  onChange,
  error,
  required,
  type = "text",
  options = [],
  className = "",
  placeholder = "",
  disabled = false,
}) => {
  const labelEl = (
    <label className={labelClasses}>
      {label}
      {required && <span className="text-red-500"> *</span>}
    </label>
  );

  const errorEl = error && (
    <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">{error}</p>
  );

  if (type === "select") {
    return (
      <div className={`w-full ${className}`}>
        {labelEl}
        <select
          name={name}
          value={value ?? ""}
          onChange={onChange}
          className={`${controlClasses} ${error ? "border-red-500" : ""}`}
          disabled={disabled}
        >
          <option value="">-- Select --</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errorEl}
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div className={`w-full ${className}`}>
        {labelEl}
        <textarea
          name={name}
          value={value ?? ""}
          onChange={onChange}
          rows={4}
          placeholder={placeholder}
          disabled={disabled}
          className={
            "w-full px-2 py-1.5 rounded border text-xs leading-snug transition-colors resize-none " +
            "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
            "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
            "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
            "dark:focus:ring-blue-400 dark:focus:border-blue-400"
          }
        />
        {errorEl}
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {labelEl}
      <input
        type={type}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        className={`${controlClasses} ${error ? "border-red-500" : ""}`}
        placeholder={placeholder}
        disabled={disabled}
      />
      {errorEl}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Defaults */
/* -------------------------------------------------------------------------- */

const emptyRow = () => ({
  id: null,
  itemId: "",
  itemCode: "",
  itemDescription: "",
  toolNo: "",
  toolDesc: "",
  unit: "",
  unitName: "",
  quantity: "",
});

const emptyHeader = () => ({
  plantId: "",
  docId: "",
  breakDown: "NO",
  docDate: new Date().toISOString().slice(0, 10),
  breakDownNo: "",
  outwardTime: nowTime(),
  materialType: "",
  materialTakenOutBy: "",
  materialSentTo: "",
  challanNo: "",
  vehicleNo: "",
  remarks: "",
});

/* -------------------------------------------------------------------------- */
/* Main Form */
/* -------------------------------------------------------------------------- */

const GateOutwardForm = ({ data, onBack, onSave }) => {
  const editId = data?.id;
  const isEdit = Boolean(editId);

  const ORG_ID = parseInt(localStorage.getItem("orgId"), 10);
  const BRANCH_ID = localStorage.getItem("branchId");

  const [activeTab, setActiveTab] = useState("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [generatingDocId, setGeneratingDocId] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saveError, setSaveError] = useState("");
  const [loadError, setLoadError] = useState("");

  const [form, setForm] = useState(emptyHeader());
  const [rows, setRows] = useState([emptyRow()]);

  // master data
  const [plantData, setPlantData] = useState([]);
  const [breakdownNos, setBreakdownNos] = useState([]);
  const [materialTypes, setMaterialTypes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [challanNos, setChallanNos] = useState([]);
  const [items, setItems] = useState([]);
  const [units, setUnits] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loadingItemRow, setLoadingItemRow] = useState(null);

  /* ---------------------------------------------------------------------- */
  /* Load master data */
  /* ---------------------------------------------------------------------- */

  const loadMasterData = useCallback(async () => {
    if (!ORG_ID) return;

    const branch = BRANCH_ID;

    const results = await Promise.allSettled([
      branchAPI.getBranchByOrgId(ORG_ID),
      gateOutwardAPI.getBreakdownNos({ branch, orgId: ORG_ID }),
      gateOutwardAPI.getMaterialTypes(ORG_ID),
      employeeAPI.getEmployeeByOrgId(ORG_ID),
      gateOutwardAPI.getCustomers({ branch, orgId: ORG_ID }),
      Promise.resolve([]), // challan nos load separately (needs customer + break down)
      itemAPI.getItems(ORG_ID, branch),
      gateOutwardAPI.getUnits(ORG_ID),
    ]);

    const ok = (r) => (r.status === "fulfilled" ? r.value || [] : []);

    setPlantData(
      ok(results[0]).map((b) => ({ value: String(b.id), label: b.branchName })),
    );
    setBreakdownNos(ok(results[1]));
    setMaterialTypes(ok(results[2]));
    setEmployees(
      ok(results[3]).map((e) => ({
        value: String(e.id),
        label: e.employeeName,
      })),
    );
    setCustomers(ok(results[4]));
    setItems(
      ok(results[6]).map((i) => ({
        id: String(i.id),
        code: i.itemCode ?? i.code ?? i.itemName,
        description: i.itemDescription ?? i.description ?? "",
      })),
    );
    setUnits(ok(results[7]));

    const failed = results.filter((r) => r.status === "rejected");

    if (failed.length) {
      failed.forEach((r) => console.error("Dropdown load failed:", r.reason));
      setLoadError("Some dropdown lists failed to load.");
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadMasterData();
  }, [loadMasterData]);

  /* ---------------------------------------------------------------------- */
  /* Generate Serial No (new) */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (isEdit || !ORG_ID) return;

    const generateDocId = async () => {
      setGeneratingDocId(true);

      try {
        const { finYear } = getCtx();

        if (!finYear) {
          console.error("finYear not found in localStorage");
          return;
        }

        const docId = await gateOutwardAPI.getGateOutwardDocId({
          financialYear: finYear,
          orgId: ORG_ID,
        });

        if (docId) {
          setForm((prev) => ({ ...prev, docId }));
        }
      } catch (error) {
        console.error("Failed to generate Gate Outward serial no:", error);
      } finally {
        setGeneratingDocId(false);
      }
    };

    generateDocId();
  }, [isEdit, ORG_ID]);

  /* ---------------------------------------------------------------------- */
  /* Load edit record */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!editId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const loadEntry = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const full = await gateOutwardAPI.getGateOutwardById(editId);

        if (cancelled) return;

        const base = normalizeEntry(data);
        const entry = {
          ...base,
          ...full,
          items: full.items?.length ? full.items : base.items,
        };

        setForm({
          plantId: entry.plantId,
          docId: entry.docId || entry.serialNo,
          breakDown: entry.breakDown,
          docDate: entry.docDate,
          breakDownNo: entry.breakDownNo,
          outwardTime: entry.outwardTime || nowTime(),
          materialType: entry.materialType,
          materialTakenOutBy: entry.materialTakenOutBy,
          materialSentTo: entry.materialSentTo,
          challanNo: entry.challanNo,
          vehicleNo: entry.vehicleNo,
          remarks: entry.remarks,
        });

        setRows(entry.items?.length ? entry.items : [emptyRow()]);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load Gate Outward:", error);
          setLoadError(
            "Failed to load Gate Outward. Please go back and try again.",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadEntry();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  /* ---------------------------------------------------------------------- */
  /* Machines depend on Material Type */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!form.materialType || !ORG_ID) {
      setMachines([]);
      return;
    }

    gateOutwardAPI
      .getMachines({
        branch: BRANCH_ID,
        orgId: ORG_ID,
        toolCategoryId: form.materialType,
      })
      .then(setMachines)
      .catch((error) => {
        console.error("Error loading machines:", error);
        setMachines([]);
      });
  }, [form.materialType, ORG_ID, BRANCH_ID]);

  /* ---------------------------------------------------------------------- */
  /* Challan Nos depend on Break Down ? (NO) and Material Sent To (customer) */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!ORG_ID || form.breakDown !== "NO" || !form.materialSentTo) {
      setChallanNos([]);
      return;
    }

    let cancelled = false;

    gateOutwardAPI
      .getChallanNos({
        branch: BRANCH_ID,
        orgId: ORG_ID,
        breakdown: form.breakDown,
        customer: form.materialSentTo,
      })
      .then((list) => {
        if (!cancelled) setChallanNos(list);
      })
      .catch((error) => {
        console.error("Error loading challan nos:", error);
        if (!cancelled) setChallanNos([]);
      });

    return () => {
      cancelled = true;
    };
  }, [form.breakDown, form.materialSentTo, ORG_ID, BRANCH_ID]);

  /* ---------------------------------------------------------------------- */
  /* Header change */
  /* ---------------------------------------------------------------------- */

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    setForm((prev) => {
      const next = { ...prev, [name]: value };
      // YES -> only Break Down No. ; NO -> only Challan No.
      if (name === "breakDown") {
        if (value === "YES") next.challanNo = "";
        else next.breakDownNo = "";
      }

      // challan list depends on the customer, so reset the selection
      if (name === "materialSentTo") next.challanNo = "";

      return next;
    });
  };

  /* ---------------------------------------------------------------------- */
  /* Detail rows */
  /* ---------------------------------------------------------------------- */

  const updateRow = (index, patch) =>
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    );

  const handleItemChange = async (index, itemId) => {
    const it = items.find((i) => i.id === itemId);

    if (!it) {
      updateRow(index, {
        itemId: "",
        itemCode: "",
        itemDescription: "",
        unit: "",
        unitName: "",
      });
      return;
    }

    updateRow(index, {
      itemId: it.id,
      itemCode: it.code,
      itemDescription: it.description,
    });

    setLoadingItemRow(index);

    try {
      const itemDetail = await itemAPI.getItemById(itemId);

      if (!itemDetail) return;

      const unitObj = itemDetail.primaryUnits ?? itemDetail.primaryUnit;

      updateRow(index, {
        itemDescription:
          itemDetail.itemDescription ??
          itemDetail.description ??
          it.description,
        ...(asId(unitObj)
          ? { unit: String(asId(unitObj)), unitName: unitLabel(unitObj) }
          : {}),
      });
    } catch (error) {
      console.error("Failed to load item:", error);
    } finally {
      setLoadingItemRow(null);
    }
  };

  const handleToolChange = (index, number) => {
    const m = machines.find((x) => x.number === number);
    updateRow(index, { toolNo: m?.number || "", toolDesc: m?.name || "" });
  };

  const handleAddRow = () => setRows((prev) => [...prev, emptyRow()]);

  const handleRemoveRow = (index) =>
    setRows((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev,
    );

  /* ---------------------------------------------------------------------- */
  /* Validation */
  /* ---------------------------------------------------------------------- */

  const validate = () => {
    const errors = {};

    if (!form.plantId) errors.plantId = "Plant is required";
    if (!form.docDate) errors.docDate = "Date is required";
    if (!form.materialType) errors.materialType = "Material Type is required";

    if (form.breakDown === "YES" && !form.breakDownNo) {
      errors.breakDownNo = "Break Down No is required";
    }

    if (rows.some((r) => !r.itemId || !(Number(r.quantity) > 0))) {
      errors.items =
        "Every row needs an Item Code and a Quantity greater than 0";
    }

    setFieldErrors(errors);

    if (errors.items) setActiveTab("details");

    return Object.keys(errors).length === 0;
  };

  /* ---------------------------------------------------------------------- */
  /* Save / Update */
  /* ---------------------------------------------------------------------- */

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setSaveError("");

    const { finYear, userName } = getCtx();

    const payload = {
      ...(isEdit && { id: editId }),

      active: data?.active ?? true,
      cancel: false,

      breakDown: form.breakDown,
      breakDownNo: form.breakDown === "YES" ? form.breakDownNo : "",
      challanNo: form.breakDown === "NO" ? form.challanNo : "",
      cancelRemarks: "",
      serialNo: form.docId,
      financialYear: finYear,

      gateOutwardEntryDetailDTO: rows.map((r) => ({
        ...(r.id && { id: r.id }),
        itemCode: Number(r.itemId),
        itemDescription: r.itemDescription,
        quantity: Number(r.quantity),
        toolMachineInstrumentNo: r.toolNo,
        toolMachineInstrumentNoDesc: r.toolDesc,
        unit: r.unit ? Number(r.unit) : 0,
      })),

      materialSentTo: form.materialSentTo ? Number(form.materialSentTo) : 0,
      materialTakenOutBy: form.materialTakenOutBy
        ? Number(form.materialTakenOutBy)
        : 0,
      materialType: Number(form.materialType),

      orgId: ORG_ID,
      // backend LocalTime expects "HH:mm:ss" (not an object)
      outwardTime: form.outwardTime || nowTime(),
      plantId: Number(form.plantId),
      remarks: form.remarks,
      vehicleNo: form.vehicleNo,

      createdBy: userName,
      updatedBy: userName,
    };

    try {
      const response = await gateOutwardAPI.createUpdateGateOutward(payload);

      const status = response?.status === true || response?.statusFlag === "Ok";

      if (status) {
        if (onSave) onSave(response?.paramObjectsMap ?? payload);
        if (onBack) onBack();
        return;
      }

      setSaveError(
        response?.paramObjectsMap?.message ||
          response?.paramObjectsMap?.errorMessage ||
          response?.message ||
          "Failed to save Gate Outward",
      );
    } catch (error) {
      console.error("Gate Outward Save Error:", error);

      const err = error?.response?.data;

      setSaveError(
        err?.paramObjectsMap?.message ||
          err?.errors?.[0]?.longMessage ||
          err?.errors?.[0]?.shortMessage ||
          err?.message ||
          "Failed to save Gate Outward.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Loading */
  /* ---------------------------------------------------------------------- */

  if (isLoading) {
    return (
      <div className="p-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading gate outward...
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Option lists */
  /* ---------------------------------------------------------------------- */

  const machineNoOptions = machines.map((m) => ({
    value: m.number,
    label: m.number,
  }));

  const machineDescOptions = machines.map((m) => ({
    value: m.number,
    label: m.name,
  }));

  const tabClass = (key) =>
    `px-4 py-1.5 text-xs font-semibold rounded-t transition-colors ${
      activeTab === key
        ? "bg-blue-600 text-white"
        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
    }`;

  /* ---------------------------------------------------------------------- */
  /* UI */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="p-2 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {isEdit ? "Edit Gate Outward" : "Add Gate Outward"}
        </h2>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
        {loadError && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400">
            {loadError}
          </p>
        )}

        {/* Form Fields */}
        <div className={fieldGrid}>
          <Field
            type="select"
            label="Plant"
            name="plantId"
            value={form.plantId}
            onChange={handleChange}
            error={fieldErrors.plantId}
            required
            options={withCurrent(plantData, form.plantId)}
          />
          <Field
            label="Serial No."
            name="docId"
            value={generatingDocId ? "Generating..." : form.docId || "Auto"}
            disabled
          />
          <Field
            type="select"
            label="Break Down ?"
            name="breakDown"
            value={form.breakDown}
            onChange={handleChange}
            options={YES_NO_OPTIONS}
          />
          <Field
            type="date"
            label="Date"
            name="docDate"
            value={form.docDate}
            onChange={handleChange}
            error={fieldErrors.docDate}
            required
          />
          <Field
            type="select"
            label="Break Down No."
            name="breakDownNo"
            value={form.breakDownNo}
            onChange={handleChange}
            error={fieldErrors.breakDownNo}
            disabled={form.breakDown !== "YES"}
            options={withCurrent(breakdownNos, form.breakDownNo)}
          />
          <Field
            label="Outward Time"
            name="outwardTime"
            value={form.outwardTime}
            disabled
          />
          <Field
            type="select"
            label="Material Type"
            name="materialType"
            value={form.materialType}
            onChange={handleChange}
            error={fieldErrors.materialType}
            required
            options={withCurrent(materialTypes, form.materialType)}
          />
          <Field
            type="select"
            label="Material Taken Out by"
            name="materialTakenOutBy"
            value={form.materialTakenOutBy}
            onChange={handleChange}
            options={withCurrent(employees, form.materialTakenOutBy)}
          />
          <Field
            type="select"
            label="Material Sent To"
            name="materialSentTo"
            value={form.materialSentTo}
            onChange={handleChange}
            options={withCurrent(customers, form.materialSentTo)}
          />
          <Field
            type="select"
            label="Challan No."
            name="challanNo"
            value={form.challanNo}
            onChange={handleChange}
            disabled={form.breakDown !== "NO"}
            options={withCurrent(challanNos, form.challanNo)}
          />
          <Field
            label="Vehicle No."
            name="vehicleNo"
            value={form.vehicleNo}
            onChange={handleChange}
            placeholder="Enter Vehicle No."
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-gray-200 dark:border-gray-700 mt-4">
          <button
            type="button"
            onClick={() => setActiveTab("details")}
            className={tabClass("details")}
          >
            1-Gate Outward Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("charges")}
            className={tabClass("charges")}
          >
            2-Charges Summary
          </button>
        </div>

        {/* Gate Outward Details */}
        {activeTab === "details" && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Gate Outward Details
              </h3>
              <button
                type="button"
                onClick={handleAddRow}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            </div>

            {fieldErrors.items && (
              <p className="text-[11px] text-red-500 dark:text-red-400 mb-1">
                {fieldErrors.items}
              </p>
            )}

            <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs min-w-[1100px]">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="p-1 text-center w-10 dark:text-gray-200">
                      S.No
                    </th>
                    <th className="p-1 text-left min-w-[130px] dark:text-gray-200">
                      Item Code *
                    </th>
                    <th className="p-1 text-left min-w-[170px] dark:text-gray-200">
                      Item Description
                    </th>
                    <th className="p-1 text-left min-w-[160px] dark:text-gray-200">
                      Tool/Machine Instrument No
                    </th>
                    <th className="p-1 text-left min-w-[170px] dark:text-gray-200">
                      Tool/Machine Instrument No. Desc.
                    </th>
                    <th className="p-1 text-left min-w-[90px] dark:text-gray-200">
                      Unit
                    </th>
                    <th className="p-1 text-left min-w-[100px] dark:text-gray-200">
                      Quantity *
                    </th>
                    <th className="p-1 text-center w-10 dark:text-gray-200">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row, index) => {
                    const codeOptions = withCurrent(
                      items.map((i) => ({ value: i.id, label: i.code })),
                      row.itemId,
                      row.itemCode,
                    );

                    const toolNoOptions = withCurrent(
                      machineNoOptions,
                      row.toolNo,
                      row.toolNo,
                    );

                    const toolDescOptions = withCurrent(
                      machineDescOptions,
                      row.toolNo,
                      row.toolDesc,
                    );

                    const unitOptions = withCurrent(
                      units,
                      row.unit,
                      row.unitName,
                    );

                    return (
                      <tr
                        key={row.id ?? `new-${index}`}
                        className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="p-1 text-center font-medium dark:text-gray-300">
                          {index + 1}
                        </td>

                        {/* Item Code */}
                        <td className="p-1">
                          <select
                            value={row.itemId}
                            onChange={(e) =>
                              handleItemChange(index, e.target.value)
                            }
                            className={cellInputClasses}
                          >
                            <option value="">-- Select --</option>
                            {codeOptions.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Item Description */}
                        <td className="p-1">
                          <input
                            value={
                              loadingItemRow === index
                                ? "Loading..."
                                : row.itemDescription
                            }
                            readOnly
                            className={`${cellInputClasses} bg-gray-100 dark:bg-gray-800`}
                          />
                        </td>

                        {/* Tool No */}
                        <td className="p-1">
                          <select
                            value={row.toolNo}
                            onChange={(e) =>
                              handleToolChange(index, e.target.value)
                            }
                            className={cellInputClasses}
                          >
                            <option value="">-- Select --</option>
                            {toolNoOptions.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Tool Desc */}
                        <td className="p-1">
                          <select
                            value={row.toolNo}
                            onChange={(e) =>
                              handleToolChange(index, e.target.value)
                            }
                            className={cellInputClasses}
                          >
                            <option value="">-- Select --</option>
                            {toolDescOptions.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Unit */}
                        <td className="p-1">
                          <select
                            value={row.unit}
                            onChange={(e) => {
                              const u = unitOptions.find(
                                (o) => o.value === e.target.value,
                              );
                              updateRow(index, {
                                unit: e.target.value,
                                unitName: u?.label || "",
                              });
                            }}
                            className={cellInputClasses}
                          >
                            <option value="">-- Select --</option>
                            {unitOptions.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Quantity */}
                        <td className="p-1">
                          <input
                            type="number"
                            value={row.quantity}
                            onChange={(e) =>
                              updateRow(index, { quantity: e.target.value })
                            }
                            className={cellInputClasses}
                            placeholder="0"
                            step="0.01"
                          />
                        </td>

                        {/* Action */}
                        <td className="p-1 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(index)}
                            disabled={rows.length <= 1}
                            className={`h-5 w-5 rounded text-white flex items-center justify-center transition-colors ${
                              rows.length <= 1
                                ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                                : "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                            }`}
                          >
                            <Trash2 size={10} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Charges Summary */}
        {activeTab === "charges" && (
          <div className="mt-2">
            <Field
              type="textarea"
              label="Remarks"
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              placeholder="Enter Remarks"
            />
          </div>
        )}

        {saveError && (
          <p className="text-[11px] text-red-500 dark:text-red-400">
            {saveError}
          </p>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <X className="h-3 w-3" />
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-3 w-3" />
            {isSubmitting ? "Saving..." : isEdit ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GateOutwardForm;

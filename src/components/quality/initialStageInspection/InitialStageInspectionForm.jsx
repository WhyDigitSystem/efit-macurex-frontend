import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";
import initialStageInspectionAPI from "../../../api/quality/initialStageInspectionAPI";
import branchAPI from "../../../api/branchAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import partyMasterAPI from "../../../api/partyMasterAPI";
import itemAPI from "../../../api/itemAPI";
import employeeAPI from "../../../api/employeeAPI";
import shiftAPI from "../../../api/shiftAPI";
import itemGradeAPI from "../../../api/itemGradeAPI";

/* ---------------------------------------------------------------------------- */
/* Design tokens                                                               */

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const controlErrClasses =
  "border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500";

const labelClasses = "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const cellInputClasses =
  "w-full px-2 py-1 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400";

const cellReadOnlyClasses =
  "w-full px-2 py-1 rounded border text-xs leading-none " +
  "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 " +
  "border-gray-300 dark:border-gray-600 cursor-default";

/* ---------------------------------------------------------------------------- */
/* Building blocks                                                             */

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
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <X className="h-3 w-3" /> Cancel
    </button>

    <button
      onClick={onSave}
      disabled={isSubmitting}
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <Save className="h-3 w-3" /> {isSubmitting ? "Saving..." : saveLabel}
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
          className={`p-2 whitespace-nowrap ${i === 0
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
        className={`h-5 w-5 rounded text-white flex items-center justify-center ${disabled
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-red-600 hover:bg-red-700"
          }`}
      >
        <Trash2 size={10} />
      </button>
    </td>
  </tr>
);

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
                    onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                    className={
                      "w-44 rounded border text-xs leading-none pt-1 scrollbar-hide " +
                      "bg-white dark:bg-gray-900 " +
                      "border-gray-300 dark:border-gray-600 " +
                      "text-gray-900 dark:text-gray-100 " +
                      "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
                      "dark:focus:ring-blue-400 dark:focus:border-blue-400"
                    }
                  />
                </td>
              );
            }

            return (
              <td className="p-2 align-top" key={col.key}>
                <input
                  type={
                    col.type === "number"
                      ? "number"
                      : col.type === "date"
                        ? "date"
                        : "text"
                  }
                  value={row[col.key]}
                  readOnly={col.readOnly}
                  onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                  className={col.readOnly ? cellReadOnlyClasses : cellInputClasses}
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

const CHILD_TABS = [
  { key: "firstArticleDetails", label: "First Article Detail", kind: "table" },
  { key: "summary", label: "Summary", kind: "fields" },
];

const RECOMMENDED_OPTIONS = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");

/* ---------------------------------------------------------------------------- */
/* Initial Stage Inspection Form                                                */

const InitialStageInspectionForm = ({ data, onBack, onSave }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId")) || 0;
  const branch = Number(localStorage.getItem("branchId")) || 0;
  const usersId = localStorage.getItem("usersId");

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const orgName = (
    userData?.companyVO?.companyName ||
    userData?.orgName ||
    ""
  ).trim();
  const isMacurex = ["mecurex", "macurex"].includes(orgName.toLowerCase());

  const [activeChildTab, setActiveChildTab] = useState("firstArticleDetails");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generatingDocId, setGeneratingDocId] = useState(false);

  /* ---------- Header state ---------- */
  const [header, setHeader] = useState(() => ({
    plantId: data?.plantId?.id ?? data?.plantId ?? "",
    inspectionNo: data?.inspectionNo || "",
    shift: data?.shift || "",
    date: data?.date ? fmtDate(data.date) : fmtDate(dayjs()),
    itemCode: data?.itemCode?.id ?? data?.itemCode ?? "",
    itemDescription: data?.itemDescription || "",
    partyDrawingNo: data?.partyDrawingNo || "",
    drawingNo: data?.drawingNo || "",
    preparedBy: data?.preparedBy?.id ?? data?.preparedBy ?? "",
    preparedDate: data?.preparedDate ? fmtDate(data.preparedDate) : "",
    gradeType: data?.gradeType?.id ?? data?.gradeType ?? "",
    partyId: data?.partyId?.id ?? data?.partyId ?? "",
    partyName: data?.partyName || "",
    workOrderNo: data?.workOrderNo?.id ?? data?.workOrderNo ?? "",
    processSheetNo: data?.processSheetNo || "",
  }));

  const [detailRows, setDetailRows] = useState(
    data?.firstArticleDetails?.length ? data.firstArticleDetails : [{}]
  );

  const [summary, setSummary] = useState({
    reasonForInitialInspection: data?.summary?.reasonForInitialInspection || "",
    comment: data?.summary?.comment || "",
    recommendedForProduction: data?.summary?.recommendedForProduction || "",
  });

  /* ---------- Lookup loading ---------- */

  const [plantOptions, setPlantOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [partyOptions, setPartyOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [gradeTypeOptions, setGradeTypeOptions] = useState([]);
  const [workOrderOptions, setWorkOrderOptions] = useState([]);

  const loadPlants = useCallback(async () => {
    try {
      if (isMacurex) {
        const res = await locationMasterAPI.getPlants(orgId);
        setPlantOptions(
          (res || []).map((p) => ({
            value: p.id,
            label: p.plantName || p.plantId || p.id,
          }))
        );
      } else {
        const res = await branchAPI.getBranchByOrgId(orgId);
        setPlantOptions(
          (res || []).map((b) => ({
            value: b.id,
            label: b.branchName || b.branchCode || b.id,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to load plant options:", error);
      setPlantOptions([]);
    }
  }, [orgId, isMacurex]);

  const loadItems = useCallback(async () => {
    try {
      const res = await itemAPI.getItems(orgId, branch);
      setItemOptions(
        (res || []).map((it) => ({
          value: it.id,
          label: it.itemCode || it.id,
        }))
      );
    } catch (error) {
      console.error("Failed to load item options:", error);
      setItemOptions([]);
    }
  }, [orgId, branch]);

  const loadParties = useCallback(async () => {
    try {
      const res = await partyMasterAPI.getPartyByOrgId(orgId, branch);
      setPartyOptions(
        (res || []).map((c) => ({
          value: c.id,
          label: c.customerCode || c.docId || c.id,
          partyName: c.customerName || "",
        }))
      );
    } catch (error) {
      console.error("Failed to load party options:", error);
      setPartyOptions([]);
    }
  }, [orgId, branch]);

  const loadEmployees = useCallback(async () => {
    try {
      const res = await employeeAPI.getEmployeeByOrgId(orgId);
      setEmployeeOptions(
        (res || []).map((e) => ({
          value: e.id,
          label: e.employeeCode || e.employeeName || e.id,
        }))
      );
    } catch (error) {
      console.error("Failed to load employee options:", error);
      setEmployeeOptions([]);
    }
  }, [orgId]);

  const loadShifts = useCallback(async () => {
    try {
      const res = await shiftAPI.getByOrgId(orgId);
      setShiftOptions(
        (res || []).map((s) => ({
          value: s.shiftName || s.id,
          label: s.shiftName || s.shiftCode || s.id,
        }))
      );
    } catch (error) {
      console.error("Failed to load shifts:", error);
      setShiftOptions([]);
    }
  }, [orgId]);

  const loadGradeTypes = useCallback(async () => {
    try {
      const res = await itemGradeAPI.getAll(orgId);
      setGradeTypeOptions(
        (res || []).map((g) => ({
          value: g.id,
          label: g.gradeDescription || g.gradeCode || g.id,
        }))
      );
    } catch (error) {
      console.error("Failed to load grade types:", error);
      setGradeTypeOptions([]);
    }
  }, [orgId]);

  /* Load plants */
  useEffect(() => {
    if (orgId) loadPlants();
  }, [orgId, loadPlants]);

  /* Load all other lookups */
  useEffect(() => {
    if (orgId) {
      loadItems();
      loadParties();
      loadEmployees();
      loadShifts();
      loadGradeTypes();
    }
  }, [orgId, loadItems, loadParties, loadEmployees, loadShifts, loadGradeTypes]);

  /* Work Order No — reload whenever party changes */
  useEffect(() => {
    const loadWorkOrders = async () => {
      if (!header.partyId) {
        setWorkOrderOptions([]);
        return;
      }
      try {
        const res = await initialStageInspectionAPI.getWorkOrderNoDropDown(
          branch,
          orgId,
          header.partyId
        );
        setWorkOrderOptions(
          (res || []).map((w) => ({
            value: w.id,
            label: w.name || w.id,
          }))
        );
      } catch (error) {
        console.error("Failed to load work order nos:", error);
        setWorkOrderOptions([]);
      }
    };
    loadWorkOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [header.partyId, branch, orgId]);

  /* Inspection No generation */
  useEffect(() => {
    const loadDocId = async () => {
      if (data?.id || !orgId) return;
      setGeneratingDocId(true);
      try {
        const financialYear = new Date().getFullYear().toString();
        const docId =
          await initialStageInspectionAPI.getInitialStageInspectionDocId(
            orgId,
            financialYear
          );
        if (docId) {
          setHeader((p) => ({ ...p, inspectionNo: docId }));
        }
      } catch (err) {
        console.error("Failed to generate Inspection No:", err);
        addToast("Failed to generate Inspection No", "error");
      } finally {
        setGeneratingDocId(false);
      }
    };
    loadDocId();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, data?.id]);

  /* ---------------------------------------------------------------------------- */
  /* Handlers                                                                     */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));

    setHeader((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "partyId") {
        const party = partyOptions.find(
          (p) => String(p.value) === String(value)
        );
        next.partyName = party?.partyName || "";
        next.workOrderNo = ""; // reset work order when party changes
      }

      if (name === "itemCode") {
        const item = itemOptions.find(
          (it) => String(it.value) === String(value)
        );
        next.itemDescription = item?.label || "";
      }

      return next;
    });
  };

  const handleCellChange = (idx, key, value) => {
    setDetailRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        const next = { ...row, [key]: value };
        return next;
      })
    );
  };

  const handleAddRow = () => setDetailRows((prev) => [...prev, {}]);
  const handleRemoveRow = (idx) =>
    setDetailRows((prev) => prev.filter((_, i) => i !== idx));

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setSummary((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------------------------------------------------------------------- */
  /* Validation & Save                                                            */

  const validate = () => {
    const errors = {};

    if (!header.plantId) errors.plantId = "Plant ID is required";
    if (!header.inspectionNo?.trim())
      errors.inspectionNo = "Inspection No is required";
    if (!header.shift) errors.shift = "Shift is required";
    if (!header.date) errors.date = "Date is required";
    if (!header.itemCode) errors.itemCode = "Item Code is required";
    if (!header.partyId) errors.partyId = "Party ID is required";
    if (!header.workOrderNo)
      errors.workOrderNo = "Work Order No is required";

    const validRows = detailRows.filter(
      (r) => r.operationNo?.trim() || r.parametersToBeChecked?.trim()
    );
    if (!validRows.length)
      errors.firstArticleDetails =
        "Add at least one First Article Details row with Operation No";

    detailRows.forEach((r, i) => {
      if (!r.operationNo?.trim())
        errors[`detail.${i}.operationNo`] = "Operation No is required";
      if (!r.parametersToBeChecked?.trim())
        errors[`detail.${i}.parametersToBeChecked`] =
          "Parameters to be Checked is required";
    });

    if (!summary.reasonForInitialInspection?.trim())
      errors.reasonForInitialInspection =
        "Reason for Initial Inspection is required";
    if (!summary.comment?.trim()) errors.comment = "Comment is required";
    if (!summary.recommendedForProduction)
      errors.recommendedForProduction =
        "Recommended for Production is required";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      addToast("Please fix validation errors before saving", "error");
      return;
    }

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);

    // Build payload matching the target shape
    const payload = {
      active: data?.active === "Active" || data?.active === true || true,
      branch,
      cancel: false,
      cancelRemarks: "",
      comment: summary.comment || "",
      createdBy: isUpdate ? data?.createdBy || usersId : usersId || "SYSTEM",
      docDate: header.date || fmtDate(dayjs()),
      docId: header.inspectionNo || "",
      drawingNo: header.drawingNo || "",
      financialYear: new Date().getFullYear().toString(),
      gradeType: parseInt(header.gradeType) || 0,
      initialStageInspectionDetailDTO: detailRows
        .filter((r) => r.operationNo?.trim())
        .map((r) => ({
          id: r.id ? parseInt(r.id) : 0,
          initialStageInspectionVO: 0,
          operationDate: r.operationDate || "",
          operationNo: r.operationNo || "",
          operatorName: parseInt(r.operatorName) || 0,
          parametersToBeChecked: r.parametersToBeChecked || "",
          remarks: r.remarks || "",
          sampling1: r.sampleInspection1 || "",
          sampling2: r.sampleInspection2 || "",
          sampling3: r.sampleInspection3 || "",
          sampling4: r.sampleInspection4 || "",
          sampling5: r.sampleInspection5 || "",
          specification: r.specification || "",
          time: r.time || "",
        })),
      itemCode: parseInt(header.itemCode) || 0,
      itemDescription: header.itemDescription || "",
      orgId,
      partyDrawingNo: header.partyDrawingNo || "",
      partyId: parseInt(header.partyId) || 0,
      partyName: header.partyName || "",
      preparedBy: parseInt(header.preparedBy) || 0,
      preparedDate: header.preparedDate || "",
      processSheetNo: header.processSheetNo || "",
      reasonForInitialInspection: summary.reasonForInitialInspection || "",
      recommendedForProduction: summary.recommendedForProduction || "",
      shift: header.shift || "",
      updatedBy: isUpdate ? usersId || "SYSTEM" : "",
      workOrderNo: header.workOrderNo || "",
    };

    if (isUpdate) {
      payload.id = parseInt(data.id);
    }

    console.log("📤 Saving Initial Stage Inspection Payload:", payload);

    try {
      const response =
        await initialStageInspectionAPI.createUpdateInitialStageInspection(
          payload
        );

      const status =
        response?.status === true ||
        response?.success === true ||
        response?.statusFlag === "Ok" ||
        response?.status === "SUCCESS" ||
        response?.status === 200 ||
        response?.statusCode === 200;

      if (status) {
        addToast(
          response?.paramObjectsMap?.message ||
          (isUpdate
            ? "Initial Stage Inspection updated successfully!"
            : "Initial Stage Inspection created successfully!"),
          "success"
        );
        if (onSave) onSave(payload);
        else onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
          response?.errors?.[0]?.longMessage ||
          response?.message ||
          response?.paramObjectsMap?.message ||
          "Failed to save Initial Stage Inspection.",
          "error"
        );
      }
    } catch (err) {
      console.error("Save Initial Stage Inspection Error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.statusMessage ||
        err?.response?.data?.error ||
        err?.message ||
        "Something went wrong.";
      addToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------------------------------------------------------------------- */

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
          {data ? "Edit Initial Stage Inspection" : "Add Initial Stage Inspection"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Info ---------------- */}
        <div>
          <SectionHeader>Inspection Details</SectionHeader>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4 items-start">
            <Field
              type="select"
              label="Plant ID"
              name="plantId"
              value={header.plantId}
              onChange={handleHeaderChange}
              error={fieldErrors.plantId}
              options={plantOptions}
              required
            />
            <Field
              label="Inspection No"
              name="inspectionNo"
              value={header.inspectionNo}
              onChange={handleHeaderChange}
              error={fieldErrors.inspectionNo}
              placeholder={generatingDocId ? "Generating..." : "Auto"}
              disabled
              required
            />
            <Field
              type="date"
              label="Date"
              name="date"
              value={header.date}
              onChange={handleHeaderChange}
              error={fieldErrors.date}
              required
            />
            <Field
              type="select"
              label="Shift"
              name="shift"
              value={header.shift}
              onChange={handleHeaderChange}
              error={fieldErrors.shift}
              options={shiftOptions}
              required
            />
            <Field
              type="select"
              label="Item Code"
              name="itemCode"
              value={header.itemCode}
              onChange={handleHeaderChange}
              error={fieldErrors.itemCode}
              options={itemOptions}
              required
            />
            <Field
              label="Item Description"
              name="itemDescription"
              value={header.itemDescription}
              onChange={handleHeaderChange}
              error={fieldErrors.itemDescription}
              disabled
            />
            <Field
              label="Party Drawing No"
              name="partyDrawingNo"
              value={header.partyDrawingNo}
              onChange={handleHeaderChange}
              error={fieldErrors.partyDrawingNo}
            />
            <Field
              label="Drawing No"
              name="drawingNo"
              value={header.drawingNo}
              onChange={handleHeaderChange}
              error={fieldErrors.drawingNo}
            />
            <Field
              type="select"
              label="Prepared By"
              name="preparedBy"
              value={header.preparedBy}
              onChange={handleHeaderChange}
              error={fieldErrors.preparedBy}
              options={employeeOptions}
              required
            />
            <Field
              type="date"
              label="Prepared Date"
              name="preparedDate"
              value={header.preparedDate}
              onChange={handleHeaderChange}
              error={fieldErrors.preparedDate}
              required
            />
            <Field
              type="select"
              label="Grade/Type"
              name="gradeType"
              value={header.gradeType}
              onChange={handleHeaderChange}
              error={fieldErrors.gradeType}
              options={gradeTypeOptions}
            />
            <Field
              type="select"
              label="Party ID"
              name="partyId"
              value={header.partyId}
              onChange={handleHeaderChange}
              error={fieldErrors.partyId}
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
              type="select"
              label="Work Order No"
              name="workOrderNo"
              value={header.workOrderNo}
              onChange={handleHeaderChange}
              error={fieldErrors.workOrderNo}
              options={workOrderOptions}
              disabled={!header.partyId}
              required
            />
            <Field
              label="Process Sheet No"
              name="processSheetNo"
              value={header.processSheetNo}
              onChange={handleHeaderChange}
              error={fieldErrors.processSheetNo}
            />
          </div>
        </div>

        {/* ---------------- Child Tabs ---------------- */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-0">
            <div className="flex flex-wrap">
              {CHILD_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveChildTab(tab.key)}
                  className={`px-4 py-1 text-xs font-semibold rounded-t whitespace-nowrap transition-colors ${activeChildTab === tab.key
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTabMeta?.kind === "table" && (
              <button
                type="button"
                onClick={handleAddRow}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {/* Tab 1: First Article Detail */}
          {activeChildTab === "firstArticleDetails" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  { key: "operationNo", label: "Operation No", type: "text" },
                  {
                    key: "parametersToBeChecked",
                    label: "Parameters to be Checked",
                    type: "text",
                  },
                  { key: "specification", label: "Specification", type: "text" },
                  {
                    key: "sampleInspection1",
                    label: "Sample Inspection 1",
                    type: "number",
                  },
                  {
                    key: "sampleInspection2",
                    label: "Sample Inspection 2",
                    type: "number",
                  },
                  {
                    key: "sampleInspection3",
                    label: "Sample Inspection 3",
                    type: "number",
                  },
                  {
                    key: "sampleInspection4",
                    label: "Sample Inspection 4",
                    type: "number",
                  },
                  {
                    key: "sampleInspection5",
                    label: "Sample Inspection 5",
                    type: "number",
                  },
                  { key: "time", label: "Time", type: "text" },
                  {
                    key: "operatorName",
                    label: "Operator Name",
                    type: "select",
                    options: employeeOptions,
                  },
                  { key: "operationDate", label: "Operation Date", type: "date" },
                  { key: "remarks", label: "Remarks", type: "textarea" },
                ]}
                rows={detailRows}
                onCellChange={handleCellChange}
                onRemoveRow={handleRemoveRow}
              />
              {fieldErrors.firstArticleDetails && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.firstArticleDetails}
                </p>
              )}
            </div>
          )}

          {/* Tab 2: Summary */}
          {activeChildTab === "summary" && (
            <div className="pt-3">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
                <Field
                  type="textarea"
                  label="Reason for Initial Inspection"
                  name="reasonForInitialInspection"
                  value={summary.reasonForInitialInspection}
                  onChange={handleSummaryChange}
                  required
                />
                <Field
                  type="textarea"
                  label="Comment"
                  name="comment"
                  value={summary.comment}
                  onChange={handleSummaryChange}
                  required
                />
                <Field
                  type="select"
                  label="Recommended for Production"
                  name="recommendedForProduction"
                  value={summary.recommendedForProduction}
                  onChange={handleSummaryChange}
                  options={RECOMMENDED_OPTIONS}
                  required
                />
              </div>
            </div>
          )}
        </section>
      </div>

      <FormButtons
        onCancel={onBack}
        onSave={handleSave}
        isSubmitting={isSubmitting}
        saveLabel={data ? "Update" : "Save"}
      />
    </div>
  );
};

export default InitialStageInspectionForm;
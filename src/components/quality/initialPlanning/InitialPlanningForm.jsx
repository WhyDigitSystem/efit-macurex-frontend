import {
  ArrowLeft,
  FilePlus2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import initialPlanningAPI from "../../../api/quality/initialPlanningAPI";
import parameterMasterAPI from "../../../api/quality/parameterMasterAPI";
import itemAPI from "../../../api/itemAPI";
import itemGradeAPI from "../../../api/itemGradeAPI";
import unitMasterAPI from "../../../api/unitAPI";
import employeeAPI from "../../../api/employeeAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";
import { useToast } from "../../Toast/ToastContext";

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

const labelClasses = "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-x-4 gap-y-3 items-start";

// Spacious grid used inside the child tabs so fields breathe more.
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
          rows={2}
          className={
            "w-full px-2 py-1.5 rounded border text-xs leading-relaxed transition-colors " +
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

const GridSectionHeader = ({ children, onAdd }) => (
  <div className="flex items-center justify-between mb-2">
    <SectionHeader>{children}</SectionHeader>
    <button
      type="button"
      onClick={onAdd}
      className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
      title="Add Row"
    >
      <Plus size={12} />
    </button>
  </div>
);

const FormActions = ({ onCancel, onNew, onSave, isSubmitting, saveLabel }) => (
  <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
    <button
      onClick={onCancel}
      disabled={isSubmitting}
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <X className="h-3 w-3" />
      Cancel
    </button>

    <button
      onClick={onNew}
      disabled={isSubmitting}
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <FilePlus2 className="h-3 w-3" />
      New
    </button>

    <button
      onClick={onSave}
      disabled={isSubmitting}
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
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

/* Generic dynamic table. Supports text / number / select / textarea / readonly
   columns. Options may be plain strings or { value, label }. */
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
                    onChange={(e) =>
                      onCellChange(idx, col.key, e.target.value)
                    }
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
/* Tab config / row factories                                                  */

const CHILD_TABS = [
  { key: "details", label: "Initial Planning Details", kind: "table" },
  { key: "summary", label: "Initial Planning Summary", kind: "fields" },
];

const emptyDetailRow = () => ({
  parameter: "",
  specification: "",
  uom: "",
  accCriteria: "",
  inspectionMethod: "",
  instrumentsUsed: "",
  remarks: "",
});

const emptyInstrumentRow = () => ({
  instrumentNo: "",
  instrumentName: "",
  range: "",
});

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");

const generateDocNo = () =>
  `IPL-${dayjs().format("YYYYMMDD")}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;

/* ---------------------------------------------------------------------------- */

const InitialPlanningForm = ({ onBack, onSave, editData, editId }) => {
  const { addToast } = useToast();
  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
  const BRANCH_ID = Number(localStorage.getItem("branchId")) || 0;
  const CREATED_BY = localStorage.getItem("userName") || "SYSTEM";

  const [activeChildTab, setActiveChildTab] = useState("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [tableErrors, setTableErrors] = useState({});

  /* ---------------- Lookup options ---------------- */
  const [itemTypeOptions, setItemTypeOptions] = useState([]);
  const [sourceOptions, setSourceOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [itemMap, setItemMap] = useState({});
  const [gradeOptions, setGradeOptions] = useState([]);
  const [uomOptions, setUomOptions] = useState([]);
  const [parameterOptions, setParameterOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);

  /* ---------------- State ---------------- */
  const [header, setHeader] = useState(() => ({
    id: 0,
    docNo: editData ? "" : generateDocNo(),
    docDate: "",
    itemType: "",
    itemCode: "",
    itemDesc: "",
    itemGrade: "",
    drawingNo: "",
    source: "",
    materialCharacteristics: "",
    samplingPlan: "",
    sourceText: "",
    orgId: ORG_ID,
    createdBy: CREATED_BY,
  }));

  const [detailRows, setDetailRows] = useState([emptyDetailRow()]);
  const [instrumentRows, setInstrumentRows] = useState([emptyInstrumentRow()]);

  const [summary, setSummary] = useState({
    process: "",
    aesthetics: "",
    packingRequirements: "",
    others: "",
    preparedBy: "",
    approvedBy: "",
    approved: "",
  });

  /* ---------------- Lookup loading ---------------- */

  const loadLov = useCallback(async (group, setter) => {
    try {
      const res = await listOfValuesAPI.getListValuesGroup(group, ORG_ID);
      if (Array.isArray(res) && res.length) {
        setter(
          res.map((v) => ({
            value: v.valuesDescription || v.valueDescription || v.id,
            label: v.valuesDescription || v.valueDescription || v.id,
          })),
        );
      }
    } catch (error) {
      console.error(`Failed to load ${group}:`, error);
      setter([]);
    }
  }, [ORG_ID]);

  const loadItems = useCallback(async () => {
    try {
      const res = await itemAPI.getItems(ORG_ID, BRANCH_ID);
      const map = {};
      const options = (res || []).map((it) => {
        map[it.itemCode] = it;
        return { value: it.itemCode, label: it.itemCode };
      });
      setItemOptions(options);
      setItemMap(map);
    } catch (error) {
      console.error("Failed to load items:", error);
      setItemOptions([]);
      setItemMap({});
    }
  }, [ORG_ID, BRANCH_ID]);

  const loadGrades = useCallback(async () => {
    try {
      const res = await itemGradeAPI.getAll(ORG_ID, BRANCH_ID);
      setGradeOptions(
        (res || []).map((g) => ({
          value: g.id,
          label: g.gradeName || g.grade || g.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load grades:", error);
      setGradeOptions([]);
    }
  }, [ORG_ID, BRANCH_ID]);

  const loadUnits = useCallback(async () => {
    try {
      const res = await unitMasterAPI.getUnits(BRANCH_ID, ORG_ID);
      setUomOptions(
        (res || []).map((u) => ({
          value: u.unitId || u.id,
          label: u.unitId || u.unitName || u.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load units:", error);
      setUomOptions([]);
    }
  }, [ORG_ID, BRANCH_ID]);

  const loadParameters = useCallback(async () => {
    try {
      const res = await parameterMasterAPI.getParameters(ORG_ID);
      setParameterOptions(
        (res || []).map((p) => ({
          value: p.id,
          label: p.parameterType || p.parameterId,
        })),
      );
    } catch (error) {
      console.error("Failed to load parameters:", error);
      setParameterOptions([]);
    }
  }, [ORG_ID]);

  const loadEmployees = useCallback(async () => {
    try {
      const res = await employeeAPI.getEmployeeByOrgId(ORG_ID);
      setEmployeeOptions(
        (res || []).map((e) => ({
          value: e.id,
          label: e.employeeName || e.name || e.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load employees:", error);
      setEmployeeOptions([]);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadLov("ITEM TYPE", setItemTypeOptions);
    loadLov("SOURCE", setSourceOptions);
    loadItems();
    loadGrades();
    loadUnits();
    loadParameters();
    loadEmployees();
  }, [
    loadLov,
    loadItems,
    loadGrades,
    loadUnits,
    loadParameters,
    loadEmployees,
  ]);

  /* ---------------- Edit data loading ---------------- */

  const populateFormFromEditData = (data) => {
    setHeader({
      id: data.id || 0,
      docNo: data.docNo || data.planningNo || generateDocNo(),
      docDate: fmtDate(data.docDate),
      itemType: data.itemType || "",
      itemCode: data.itemCode || "",
      itemDesc: data.itemDesc || data.itemDescription || "",
      itemGrade: data.itemGrade || "",
      drawingNo: data.drawingNo || "",
      source: data.source || "",
      materialCharacteristics: data.materialCharacteristics || "",
      samplingPlan: data.samplingPlan || "",
      sourceText: data.sourceText || "",
      orgId: data.orgId || ORG_ID,
      createdBy: data.createdBy || CREATED_BY,
    });

    setDetailRows(
      data.planningDetails?.length
        ? data.planningDetails.map((d) => ({
            parameter: d.parameter || "",
            specification: d.specification || "",
            uom: d.uom || "",
            accCriteria: d.accCriteria || "",
            inspectionMethod: d.inspectionMethod || "",
            instrumentsUsed: d.instrumentsUsed ?? "",
            remarks: d.remarks || "",
          }))
        : [emptyDetailRow()],
    );

    setInstrumentRows(
      data.instruments?.length
        ? data.instruments.map((i) => ({
            instrumentNo: i.instrumentNo || "",
            instrumentName: i.instrumentName || "",
            range: i.range || "",
          }))
        : [emptyInstrumentRow()],
    );

    setSummary({
      process: data.summary?.process || "",
      aesthetics: data.summary?.aesthetics || "",
      packingRequirements: data.summary?.packingRequirements || "",
      others: data.summary?.others || "",
      preparedBy: data.summary?.preparedBy || "",
      approvedBy: data.summary?.approvedBy || "",
      approved: data.summary?.approved || "",
    });
  };

  const loadPlanningData = async (planningId) => {
    try {
      setLoading(true);
      const data = await initialPlanningAPI.getInitialPlanningById(planningId);
      if (data) populateFormFromEditData(data);
    } catch (error) {
      console.error("Error loading initial planning data:", error);
      addToast("Failed to load initial planning data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (editId && editId > 0) {
      loadPlanningData(editId);
    } else if (editData) {
      populateFormFromEditData(editData);
    }
  }, [editId, editData]);

  /* ---------------- Handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "itemCode") {
      const item = itemMap[value];
      setHeader((prev) => ({
        ...prev,
        itemCode: value,
        itemDesc: item?.itemDescription || item?.itemDesc || "",
        itemGrade: item?.itemGrade || prev.itemGrade || "",
      }));
      return;
    }

    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    setSummary((prev) => ({ ...prev, [name]: value }));
  };

  const handleDetailCellChange = (idx, key, value) =>
    setDetailRows((prev) =>
      prev.map((row, i) =>
        i === idx
          ? {
              ...row,
              [key]:
                key === "instrumentsUsed" ? value.replace(/\D/g, "") : value,
            }
          : row,
      ),
    );

  const handleInstrumentCellChange = (idx, key, value) =>
    setInstrumentRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row)),
    );

  const handleAddDetailRow = () =>
    setDetailRows((prev) => [...prev, emptyDetailRow()]);

  const handleRemoveDetailRow = (idx) =>
    setDetailRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx),
    );

  const handleAddInstrumentRow = () =>
    setInstrumentRows((prev) => [...prev, emptyInstrumentRow()]);

  const handleRemoveInstrumentRow = (idx) =>
    setInstrumentRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx),
    );

  const handleNew = () => {
    setHeader({
      id: 0,
      docNo: generateDocNo(),
      docDate: "",
      itemType: "",
      itemCode: "",
      itemDesc: "",
      itemGrade: "",
      drawingNo: "",
      source: "",
      materialCharacteristics: "",
      samplingPlan: "",
      sourceText: "",
      orgId: ORG_ID,
      createdBy: CREATED_BY,
    });
    setDetailRows([emptyDetailRow()]);
    setInstrumentRows([emptyInstrumentRow()]);
    setSummary({
      process: "",
      aesthetics: "",
      packingRequirements: "",
      others: "",
      preparedBy: "",
      approvedBy: "",
      approved: "",
    });
    setFieldErrors({});
    setTableErrors({});
  };

  /* ---------------- Validation ---------------- */

  const validate = () => {
    const errors = {};

    if (!header.itemType) errors.itemType = "Item Type is required";
    if (!header.docNo.trim()) errors.docNo = "Doc No is required";
    if (!header.docDate) errors.docDate = "Doc Date is required";
    if (!header.itemCode) errors.itemCode = "Item Code is required";
    if (!header.itemGrade) errors.itemGrade = "Item Grade is required";
    if (!header.source) errors.source = "Source is required";
    if (!summary.preparedBy) errors.preparedBy = "Prepared By is required";
    if (!summary.approvedBy) errors.approvedBy = "Approved By is required";

    setFieldErrors(errors);

    const detailsError =
      detailRows.length === 0 || detailRows.every((r) => !r.parameter);
    const validDetails = detailRows.every(
      (r) => r.parameter?.trim() && r.specification?.trim() && r.uom?.trim(),
    );

    const instrumentsError =
      instrumentRows.length === 0 ||
      instrumentRows.every((r) => !r.instrumentNo);
    const validInstruments = instrumentRows.every(
      (r) => r.instrumentNo?.trim() && r.instrumentName?.trim(),
    );

    const nextTableErrors = {
      details: detailsError
        ? "Add at least one Initial Planning Detail row"
        : validDetails
          ? ""
          : "Complete mandatory columns (Parameter, Specification, UOM) in Initial Planning Details",
      instruments: instrumentsError
        ? "Add at least one Instrument row"
        : validInstruments
          ? ""
          : "Complete mandatory columns (Instrument No, Instrument Name) in Fill Instruments",
    };

    setTableErrors(nextTableErrors);

    const firstError = Object.keys(errors)[0];
    if (firstError) {
      addToast(`${errors[firstError]}`, "error");
      return false;
    }

    if (!validDetails) {
      setActiveChildTab("details");
      addToast(nextTableErrors.details, "error");
      return false;
    }

    if (!validInstruments) {
      setActiveChildTab("details");
      addToast(nextTableErrors.instruments, "error");
      return false;
    }

    return true;
  };

  /* ---------------- Submit ---------------- */

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const payload = {
      ...(header.id && header.id > 0 && { id: header.id }),
      docNo: header.docNo,
      docDate: header.docDate,
      itemType: header.itemType,
      itemCode: header.itemCode,
      itemDesc: header.itemDesc,
      itemGrade: header.itemGrade,
      drawingNo: header.drawingNo,
      source: header.source,
      materialCharacteristics: header.materialCharacteristics,
      samplingPlan: header.samplingPlan,
      sourceText: header.sourceText,
      planningDetails: detailRows
        .filter((r) => r.parameter?.trim())
        .map((r) => ({
          parameter: r.parameter,
          specification: r.specification,
          uom: r.uom,
          accCriteria: r.accCriteria,
          inspectionMethod: r.inspectionMethod,
          instrumentsUsed:
            r.instrumentsUsed === "" ? "" : Number(r.instrumentsUsed),
          remarks: r.remarks,
        })),
      instruments: instrumentRows
        .filter((r) => r.instrumentNo?.trim())
        .map((r) => ({
          instrumentNo: r.instrumentNo,
          instrumentName: r.instrumentName,
          range: r.range,
        })),
      summary: {
        process: summary.process,
        aesthetics: summary.aesthetics,
        packingRequirements: summary.packingRequirements,
        others: summary.others,
        preparedBy: summary.preparedBy,
        approvedBy: summary.approvedBy,
        approved: summary.approved,
      },
      orgId: header.orgId,
      createdBy: header.createdBy,
    };

    console.log("Submitting Initial Planning Payload:", payload);

    try {
      const response =
        await initialPlanningAPI.createUpdateInitialPlanning(payload);

      const status = response?.status === true || response?.statusFlag === "Ok";

      if (status) {
        const successMessage =
          response?.paramObjectsMap?.message ||
          (header.id && header.id > 0
            ? "Initial Planning updated successfully!"
            : "Initial Planning created successfully!");

        addToast(successMessage, "success");

        if (onSave) {
          const savedData = {
            ...payload,
            id: response?.paramObjectsMap?.initialPlanningVO?.id || payload.id,
          };
          onSave(savedData);
        } else {
          onBack();
        }
      } else {
        const errorMessage =
          response?.paramObjectsMap?.message ||
          response?.paramObjectsMap?.errorMessage ||
          response?.message ||
          "Failed to save Initial Planning";

        addToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("Save Error:", error);
      const errorMessage =
        error.response?.data?.paramObjectsMap?.message ||
        error.response?.data?.paramObjectsMap?.errorMessage ||
        error.response?.data?.message ||
        "Save failed! Try again.";

      addToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

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
          {editData || editId ? "Edit Initial Planning" : "Add Initial Planning"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Info ---------------- */}
        <div>
          <SectionHeader>Header</SectionHeader>
          <div className={fieldGrid}>
            <Field
              type="select"
              label="Item Type"
              name="itemType"
              value={header.itemType}
              onChange={handleHeaderChange}
              error={fieldErrors.itemType}
              options={itemTypeOptions}
              required
            />
            <Field
              label="Doc No"
              name="docNo"
              value={header.docNo}
              onChange={handleHeaderChange}
              error={fieldErrors.docNo}
              required
              disabled
            />
            <Field
              type="date"
              label="Doc Date"
              name="docDate"
              value={header.docDate}
              onChange={handleHeaderChange}
              error={fieldErrors.docDate}
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
              label="Item Desc"
              name="itemDesc"
              value={header.itemDesc}
              onChange={handleHeaderChange}
              disabled
            />
            <Field
              type="select"
              label="Item Grade"
              name="itemGrade"
              value={header.itemGrade}
              onChange={handleHeaderChange}
              error={fieldErrors.itemGrade}
              options={gradeOptions}
              required
            />
            <Field
              label="Drawing No"
              name="drawingNo"
              value={header.drawingNo}
              onChange={handleHeaderChange}
            />
            <Field
              type="select"
              label="Source"
              name="source"
              value={header.source}
              onChange={handleHeaderChange}
              error={fieldErrors.source}
              options={sourceOptions}
              required
            />
            <Field
              type="textarea"
              label="Material Characteristics"
              name="materialCharacteristics"
              value={header.materialCharacteristics}
              onChange={handleHeaderChange}
            />
            <Field
              label="Sampling Plan"
              name="samplingPlan"
              value={header.samplingPlan}
              onChange={handleHeaderChange}
            />
            <Field
              label="Source"
              name="sourceText"
              value={header.sourceText}
              onChange={handleHeaderChange}
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
          </div>

          {/* Tab: Initial Planning Details */}
          {activeChildTab === "details" && (
            <div className="pt-3 space-y-5">
              <div>
                <GridSectionHeader
                  onAdd={handleAddDetailRow}
                >
                  Initial Planning Details
                </GridSectionHeader>

                <DynamicTable
                  columns={[
                    {
                      key: "parameter",
                      label: "Parameter *",
                      type: "select",
                      options: parameterOptions,
                    },
                    { key: "specification", label: "Specification *" },
                    {
                      key: "uom",
                      label: "UOM *",
                      type: "select",
                      options: uomOptions,
                    },
                    { key: "accCriteria", label: "ACC Criteria" },
                    { key: "inspectionMethod", label: "Inspection Method" },
                    {
                      key: "instrumentsUsed",
                      label: "No. of Instruments Used",
                      type: "number",
                    },
                    { key: "remarks", label: "Remarks" },
                  ]}
                  rows={detailRows}
                  onCellChange={handleDetailCellChange}
                  onRemoveRow={handleRemoveDetailRow}
                />

                {tableErrors.details && (
                  <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                    {tableErrors.details}
                  </p>
                )}
              </div>

              <div>
                <GridSectionHeader
                  onAdd={handleAddInstrumentRow}
                >
                  Fill Instruments
                </GridSectionHeader>

                <DynamicTable
                  columns={[
                    { key: "instrumentNo", label: "Instrument No. *" },
                    { key: "instrumentName", label: "Instrument Name *" },
                    { key: "range", label: "Range" },
                  ]}
                  rows={instrumentRows}
                  onCellChange={handleInstrumentCellChange}
                  onRemoveRow={handleRemoveInstrumentRow}
                />

                {tableErrors.instruments && (
                  <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                    {tableErrors.instruments}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Tab: Initial Planning Summary */}
          {activeChildTab === "summary" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  type="textarea"
                  label="Process"
                  name="process"
                  value={summary.process}
                  onChange={handleSummaryChange}
                />
                <Field
                  type="textarea"
                  label="Aesthetics"
                  name="aesthetics"
                  value={summary.aesthetics}
                  onChange={handleSummaryChange}
                />
                <Field
                  type="textarea"
                  label="Packing-Requirements"
                  name="packingRequirements"
                  value={summary.packingRequirements}
                  onChange={handleSummaryChange}
                />
                <Field
                  type="textarea"
                  label="Others"
                  name="others"
                  value={summary.others}
                  onChange={handleSummaryChange}
                />
                <Field
                  type="select"
                  label="Prepared By"
                  name="preparedBy"
                  value={summary.preparedBy}
                  onChange={handleSummaryChange}
                  error={fieldErrors.preparedBy}
                  options={employeeOptions}
                  required
                />
                <Field
                  type="select"
                  label="Approved By"
                  name="approvedBy"
                  value={summary.approvedBy}
                  onChange={handleSummaryChange}
                  error={fieldErrors.approvedBy}
                  options={employeeOptions}
                  required
                />
                <Field
                  type="select"
                  label="Approved"
                  name="approved"
                  value={summary.approved}
                  onChange={handleSummaryChange}
                  options={[
                    { value: "Yes", label: "Yes" },
                    { value: "No", label: "No" },
                  ]}
                />
              </div>
            </div>
          )}
        </section>

        <FormActions
          onCancel={onBack}
          onNew={handleNew}
          onSave={handleSubmit}
          isSubmitting={isSubmitting}
          saveLabel={editData || editId ? "Update" : "Submit"}
        />
      </div>
    </div>
  );
};

export default InitialPlanningForm;

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
import controlPlanAPI from "../../../api/quality/controlPlanAPI";
import parameterMasterAPI from "../../../api/quality/parameterMasterAPI";
import itemAPI from "../../../api/itemAPI";
import itemGradeAPI from "../../../api/itemGradeAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
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

            if (col.type === "textarea") {
              return (
                <td className="p-2 align-top" key={col.key}>
                  <textarea
                    rows={1}
                    value={row[col.key]}
                    readOnly={col.readOnly}
                    onChange={(e) =>
                      onCellChange(idx, col.key, e.target.value)
                    }
                    className={col.readOnly ? cellReadOnlyClasses : cellTextareaClasses}
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
/* Options / tab config                                                        */

const CHILD_TABS = [
  { key: "detail", label: "Control Plan Detail", kind: "table" },
  { key: "parameters", label: "Parameters", kind: "table" },
  { key: "sample", label: "Sample", kind: "table" },
  { key: "fixtures", label: "Machine/Fixture", kind: "table" },
  { key: "summary", label: "Control Plan Summary", kind: "fields" },
];

const emptyDetailRow = () => ({
  operationNo: "",
  operationDesc: "",
  machineDevice: "",
  product: "",
  process: "",
  specification: "",
  riskClass: "",
  evalTechnique: "",
});

const emptyParameterRow = () => ({
  parameter: "",
  parameterType: "",
  tolerance: "",
});

const emptySampleRow = () => ({
  sampleFrequency: "",
  size: "",
});

const emptyFixtureRow = () => ({
  machineFixtureNo: "",
  machineFixtureName: "",
});

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");

const generatePlanNo = () =>
  `CPL-${dayjs().format("YYYYMMDD")}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;

/* ---------------------------------------------------------------------------- */

const ControlPlanForm = ({ onBack, onSave, editData, editId }) => {
  const { addToast } = useToast();
  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
  const BRANCH_ID = Number(localStorage.getItem("branchId")) || 0;
  const CREATED_BY = localStorage.getItem("userName") || "SYSTEM";

  const [activeChildTab, setActiveChildTab] = useState("detail");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [tableErrors, setTableErrors] = useState({});

  /* ---------------- Lookup options ---------------- */
  const [plantOptions, setPlantOptions] = useState([]);
  const [planTypeOptions, setPlanTypeOptions] = useState([]);
  const [riskClassOptions, setRiskClassOptions] = useState([]);
  const [evalTechniqueOptions, setEvalTechniqueOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [itemMap, setItemMap] = useState({});
  const [gradeOptions, setGradeOptions] = useState([]);
  const [processSheetOptions, setProcessSheetOptions] = useState([]);
  const [machineFixtureOptions, setMachineFixtureOptions] = useState([]);
  const [parameterOptions, setParameterOptions] = useState([]);

  const isTableTab =
    CHILD_TABS.find((t) => t.key === activeChildTab)?.kind === "table";

  /* ---------------- State ---------------- */
  const [header, setHeader] = useState(() => ({
    id: 0,
    plantId: "",
    controlPlanType: "",
    planNo: editData ? "" : generatePlanNo(),
    fgItemCode: "",
    itemDescription: "",
    itemGrade: "",
    itemSize: "",
    processSheetNo: "",
    originDate: "",
    revisionDate: "",
    orgId: ORG_ID,
    createdBy: CREATED_BY,
  }));

  const [detailRows, setDetailRows] = useState([emptyDetailRow()]);
  const [parameterRows, setParameterRows] = useState([emptyParameterRow()]);
  const [sampleRows, setSampleRows] = useState([emptySampleRow()]);
  const [fixtureRows, setFixtureRows] = useState([emptyFixtureRow()]);

  const [summary, setSummary] = useState({
    preparedBy: "",
    checkedBy: "",
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

  const loadPlants = useCallback(async () => {
    try {
      const res = await locationMasterAPI.getPlants(ORG_ID);
      setPlantOptions(
        (res || []).map((p) => ({
          value: p.id,
          label: p.plantName || p.plantId || p.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load plants:", error);
      setPlantOptions([]);
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

  const loadProcessSheets = useCallback(async () => {
    try {
      const res = await controlPlanAPI.getProcessSheets(ORG_ID);
      setProcessSheetOptions(
        (res || []).map((p) => ({
          value: p.processSheetNo || p.id,
          label: p.processSheetNo || p.processSheetName || p.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load process sheets:", error);
      setProcessSheetOptions([]);
    }
  }, [ORG_ID]);

  const loadMachineFixtures = useCallback(async () => {
    try {
      const res = await controlPlanAPI.getMachineFixtures(ORG_ID);
      setMachineFixtureOptions(
        (res || []).map((m) => ({
          value: m.machineFixtureNo || m.id,
          label: m.machineFixtureNo || m.machineFixtureName || m.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load machine/fixtures:", error);
      setMachineFixtureOptions([]);
    }
  }, [ORG_ID]);

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

  useEffect(() => {
    loadLov("CONTROL PLAN TYPE", setPlanTypeOptions);
    loadLov("RISK CLASS", setRiskClassOptions);
    loadLov("EVAL TECHNIQUE", setEvalTechniqueOptions);
    loadPlants();
    loadItems();
    loadGrades();
    loadProcessSheets();
    loadMachineFixtures();
    loadParameters();
  }, [
    loadLov,
    loadPlants,
    loadItems,
    loadGrades,
    loadProcessSheets,
    loadMachineFixtures,
    loadParameters,
  ]);

  /* ---------------- Edit data loading ---------------- */

  const populateFormFromEditData = (data) => {
    setHeader({
      id: data.id || 0,
      plantId: data.plantId || "",
      controlPlanType: data.controlPlanType || "",
      planNo: data.planNo || generatePlanNo(),
      fgItemCode: data.fgItemCode || "",
      itemDescription: data.itemDescription || "",
      itemGrade: data.itemGrade || "",
      itemSize: data.itemSize || "",
      processSheetNo: data.processSheetNo || "",
      originDate: fmtDate(data.originDate),
      revisionDate: fmtDate(data.revisionDate),
      orgId: data.orgId || ORG_ID,
      createdBy: data.createdBy || CREATED_BY,
    });

    setDetailRows(
      data.planDetails?.length
        ? data.planDetails.map((d) => ({
            operationNo: d.operationNo || "",
            operationDesc: d.operationDesc || "",
            machineDevice: d.machineDevice || "",
            product: d.product || "",
            process: d.process || "",
            specification: d.specification || "",
            riskClass: d.riskClass || "",
            evalTechnique: d.evalTechnique || "",
          }))
        : [emptyDetailRow()],
    );

    setParameterRows(
      data.parameters?.length
        ? data.parameters.map((p) => ({
            parameter: p.parameter || "",
            parameterType: p.parameterType || "",
            tolerance: p.tolerance ?? "",
          }))
        : [emptyParameterRow()],
    );

    setSampleRows(
      data.samples?.length
        ? data.samples.map((s) => ({
            sampleFrequency: s.sampleFrequency ?? "",
            size: s.size ?? "",
          }))
        : [emptySampleRow()],
    );

    setFixtureRows(
      data.machineFixtures?.length
        ? data.machineFixtures.map((f) => ({
            machineFixtureNo: f.machineFixtureNo || "",
            machineFixtureName: f.machineFixtureName || "",
          }))
        : [emptyFixtureRow()],
    );

    setSummary({
      preparedBy: data.summary?.preparedBy || "",
      checkedBy: data.summary?.checkedBy || "",
      approved: data.summary?.approved || "",
    });
  };

  const loadPlanData = async (planId) => {
    try {
      setLoading(true);
      const data = await controlPlanAPI.getControlPlanById(planId);
      if (data) populateFormFromEditData(data);
    } catch (error) {
      console.error("Error loading control plan data:", error);
      addToast("Failed to load control plan data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (editId && editId > 0) {
      loadPlanData(editId);
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

    if (name === "fgItemCode") {
      const item = itemMap[value];
      setHeader((prev) => ({
        ...prev,
        fgItemCode: value,
        itemDescription: item?.itemDescription || item?.itemDesc || "",
        itemGrade: item?.itemGrade || prev.itemGrade || "",
        itemSize: item?.itemSize || item?.size || prev.itemSize || "",
      }));
      return;
    }

    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    setSummary((prev) => ({ ...prev, [name]: value }));
  };

  const handleDetailCellChange = (idx, key, value) =>
    setDetailRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row)),
    );

  const handleParameterCellChange = (idx, key, value) =>
    setParameterRows((prev) => {
      const next = prev.map((row, i) =>
        i === idx ? { ...row, [key]: value } : row,
      );
      if (key === "parameter") {
        const selected = parameterOptions.find(
          (o) => String(o.value) === String(value),
        );
        if (selected) next[idx] = { ...next[idx], parameterType: selected.label };
      }
      return next;
    });

  const handleSampleCellChange = (idx, key, value) =>
    setSampleRows((prev) =>
      prev.map((row, i) =>
        i === idx ? { ...row, [key]: value.replace(/\D/g, "") } : row,
      ),
    );

  const handleFixtureCellChange = (idx, key, value) =>
    setFixtureRows((prev) => {
      const next = prev.map((row, i) =>
        i === idx ? { ...row, [key]: value } : row,
      );
      if (key === "machineFixtureNo") {
        const selected = machineFixtureOptions.find(
          (o) => String(o.value) === String(value),
        );
        if (selected)
          next[idx] = { ...next[idx], machineFixtureName: selected.label };
      }
      return next;
    });

  const TABLE_HANDLERS = {
    detail: handleDetailCellChange,
    parameters: handleParameterCellChange,
    sample: handleSampleCellChange,
    fixtures: handleFixtureCellChange,
  };

  const TABLE_ADD = {
    detail: () => setDetailRows((prev) => [...prev, emptyDetailRow()]),
    parameters: () => setParameterRows((prev) => [...prev, emptyParameterRow()]),
    sample: () => setSampleRows((prev) => [...prev, emptySampleRow()]),
    fixtures: () => setFixtureRows((prev) => [...prev, emptyFixtureRow()]),
  };

  const TABLE_REMOVE = {
    detail: (idx) =>
      setDetailRows((prev) =>
        prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx),
      ),
    parameters: (idx) =>
      setParameterRows((prev) =>
        prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx),
      ),
    sample: (idx) =>
      setSampleRows((prev) =>
        prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx),
      ),
    fixtures: (idx) =>
      setFixtureRows((prev) =>
        prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx),
      ),
  };

  const addRowForTab = () => TABLE_ADD[activeChildTab]?.();

  const handleNew = () => {
    setHeader({
      id: 0,
      plantId: "",
      controlPlanType: "",
      planNo: generatePlanNo(),
      fgItemCode: "",
      itemDescription: "",
      itemGrade: "",
      itemSize: "",
      processSheetNo: "",
      originDate: "",
      revisionDate: "",
      orgId: ORG_ID,
      createdBy: CREATED_BY,
    });
    setDetailRows([emptyDetailRow()]);
    setParameterRows([emptyParameterRow()]);
    setSampleRows([emptySampleRow()]);
    setFixtureRows([emptyFixtureRow()]);
    setSummary({ preparedBy: "", checkedBy: "", approved: "" });
    setFieldErrors({});
    setTableErrors({});
  };

  /* ---------------- Validation ---------------- */

  const validate = () => {
    const errors = {};

    if (!header.plantId) errors.plantId = "Plant Id is required";
    if (!header.controlPlanType)
      errors.controlPlanType = "Control Plan Type is required";
    if (!header.planNo.trim()) errors.planNo = "Plan No is required";
    if (!header.fgItemCode) errors.fgItemCode = "FG Item Code is required";
    if (!header.processSheetNo)
      errors.processSheetNo = "Process Sheet No is required";
    if (!header.originDate) errors.originDate = "Origin Date is required";

    setFieldErrors(errors);

    const detailsError =
      detailRows.length === 0 || detailRows.every((r) => !r.operationNo);
    const validDetails = detailRows.every((r) => r.operationNo?.trim());

    const parametersError =
      parameterRows.length === 0 || parameterRows.every((r) => !r.parameter);
    const validParameters = parameterRows.every((r) => r.parameter?.trim());

    const samplesError =
      sampleRows.length === 0 ||
      sampleRows.every((r) => r.sampleFrequency === "" && r.size === "");
    const validSamples = sampleRows.every(
      (r) => r.sampleFrequency !== "" && r.size !== "",
    );

    const fixturesError =
      fixtureRows.length === 0 || fixtureRows.every((r) => !r.machineFixtureNo);
    const validFixtures = fixtureRows.every((r) => r.machineFixtureNo?.trim());

    const nextTableErrors = {
      detail: detailsError
        ? "Add at least one Control Plan Detail row"
        : validDetails
          ? ""
          : "Complete mandatory column (Operation No) in Control Plan Detail",
      parameters: parametersError
        ? "Add at least one Parameter row"
        : validParameters
          ? ""
          : "Complete mandatory column (Parameter) in Parameters",
      sample: samplesError
        ? "Add at least one Sample row"
        : validSamples
          ? ""
          : "Complete mandatory columns (Sample Frequency, Size) in Sample",
      fixtures: fixturesError
        ? "Add at least one Machine/Fixture row"
        : validFixtures
          ? ""
          : "Complete mandatory column (Machine/Fixture No.) in Machine/Fixture",
    };

    setTableErrors(nextTableErrors);

    const firstError = Object.keys(errors)[0];
    if (firstError) {
      addToast(`${errors[firstError]}`, "error");
      return false;
    }

    if (!validDetails) {
      setActiveChildTab("detail");
      addToast(nextTableErrors.detail, "error");
      return false;
    }

    if (!validParameters) {
      setActiveChildTab("parameters");
      addToast(nextTableErrors.parameters, "error");
      return false;
    }

    if (!validSamples) {
      setActiveChildTab("sample");
      addToast(nextTableErrors.sample, "error");
      return false;
    }

    if (!validFixtures) {
      setActiveChildTab("fixtures");
      addToast(nextTableErrors.fixtures, "error");
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
      plantId: header.plantId,
      controlPlanType: header.controlPlanType,
      planNo: header.planNo,
      fgItemCode: header.fgItemCode,
      itemDescription: header.itemDescription,
      itemGrade: header.itemGrade,
      itemSize: header.itemSize,
      processSheetNo: header.processSheetNo,
      originDate: header.originDate,
      revisionDate: header.revisionDate,
      planDetails: detailRows
        .filter((r) => r.operationNo?.trim())
        .map((r) => ({
          operationNo: r.operationNo,
          operationDesc: r.operationDesc,
          machineDevice: r.machineDevice,
          product: r.product,
          process: r.process,
          specification: r.specification,
          riskClass: r.riskClass,
          evalTechnique: r.evalTechnique,
        })),
      parameters: parameterRows
        .filter((r) => r.parameter?.trim())
        .map((r) => ({
          parameter: r.parameter,
          parameterType: r.parameterType,
          tolerance: r.tolerance === "" ? "" : Number(r.tolerance),
        })),
      samples: sampleRows
        .filter((r) => r.sampleFrequency !== "" || r.size !== "")
        .map((r) => ({
          sampleFrequency:
            r.sampleFrequency === "" ? "" : Number(r.sampleFrequency),
          size: r.size === "" ? "" : Number(r.size),
        })),
      machineFixtures: fixtureRows
        .filter((r) => r.machineFixtureNo?.trim())
        .map((r) => ({
          machineFixtureNo: r.machineFixtureNo,
          machineFixtureName: r.machineFixtureName,
        })),
      summary,
      orgId: header.orgId,
      createdBy: header.createdBy,
    };

    console.log("Submitting Control Plan Payload:", payload);

    try {
      const response = await controlPlanAPI.createUpdateControlPlan(payload);

      const status = response?.status === true || response?.statusFlag === "Ok";

      if (status) {
        const successMessage =
          response?.paramObjectsMap?.message ||
          (header.id && header.id > 0
            ? "Control Plan updated successfully!"
            : "Control Plan created successfully!");

        addToast(successMessage, "success");

        if (onSave) {
          const savedData = {
            ...payload,
            id: response?.paramObjectsMap?.controlPlanVO?.id || payload.id,
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
          "Failed to save Control Plan";

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
          {editData || editId ? "Edit Control Plan" : "Add Control Plan"}
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
              label="Plant Id"
              name="plantId"
              value={header.plantId}
              onChange={handleHeaderChange}
              error={fieldErrors.plantId}
              options={plantOptions}
              required
            />
            <Field
              type="select"
              label="Control Plan Type"
              name="controlPlanType"
              value={header.controlPlanType}
              onChange={handleHeaderChange}
              error={fieldErrors.controlPlanType}
              options={planTypeOptions}
              required
            />
            <Field
              label="Plan No"
              name="planNo"
              value={header.planNo}
              onChange={handleHeaderChange}
              error={fieldErrors.planNo}
              required
              disabled
            />
            <Field
              type="select"
              label="FG Item Code"
              name="fgItemCode"
              value={header.fgItemCode}
              onChange={handleHeaderChange}
              error={fieldErrors.fgItemCode}
              options={itemOptions}
              required
            />
            <Field
              label="Item Description"
              name="itemDescription"
              value={header.itemDescription}
              onChange={handleHeaderChange}
              disabled
            />
            <Field
              type="select"
              label="Item Grade"
              name="itemGrade"
              value={header.itemGrade}
              onChange={handleHeaderChange}
              options={gradeOptions}
            />
            <Field
              label="Item Size"
              name="itemSize"
              value={header.itemSize}
              onChange={handleHeaderChange}
            />
            <Field
              type="select"
              label="Process Sheet No"
              name="processSheetNo"
              value={header.processSheetNo}
              onChange={handleHeaderChange}
              error={fieldErrors.processSheetNo}
              options={processSheetOptions}
              required
            />
            <Field
              type="date"
              label="Origin Date"
              name="originDate"
              value={header.originDate}
              onChange={handleHeaderChange}
              error={fieldErrors.originDate}
              required
            />
            <Field
              type="date"
              label="Revision Date"
              name="revisionDate"
              value={header.revisionDate}
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

            {isTableTab && (
              <button
                type="button"
                onClick={addRowForTab}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {/* Tab: Control Plan Detail */}
          {activeChildTab === "detail" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  { key: "operationNo", label: "Operation No *" },
                  { key: "operationDesc", label: "Operation Desc" },
                  {
                    key: "machineDevice",
                    label: "Machine/Device",
                    type: "select",
                    options: machineFixtureOptions,
                  },
                  { key: "product", label: "Product" },
                  { key: "process", label: "Process" },
                  { key: "specification", label: "Specification" },
                  {
                    key: "riskClass",
                    label: "Risk Class / SPL Char",
                    type: "select",
                    options: riskClassOptions,
                  },
                  {
                    key: "evalTechnique",
                    label: "Eval. Technique",
                    type: "select",
                    options: evalTechniqueOptions,
                  },
                ]}
                rows={detailRows}
                onCellChange={handleDetailCellChange}
                onRemoveRow={TABLE_REMOVE.detail}
              />
              {tableErrors.detail && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {tableErrors.detail}
                </p>
              )}
            </div>
          )}

          {/* Tab: Parameters */}
          {activeChildTab === "parameters" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  {
                    key: "parameter",
                    label: "Parameter *",
                    type: "select",
                    options: parameterOptions,
                  },
                  {
                    key: "parameterType",
                    label: "Parameter Type",
                    readOnly: true,
                  },
                  { key: "tolerance", label: "Tolerance (TOL)", type: "number" },
                ]}
                rows={parameterRows}
                onCellChange={handleParameterCellChange}
                onRemoveRow={TABLE_REMOVE.parameters}
              />
              {tableErrors.parameters && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {tableErrors.parameters}
                </p>
              )}
            </div>
          )}

          {/* Tab: Sample */}
          {activeChildTab === "sample" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  {
                    key: "sampleFrequency",
                    label: "Sample Frequency *",
                    type: "number",
                  },
                  { key: "size", label: "Size *", type: "number" },
                ]}
                rows={sampleRows}
                onCellChange={handleSampleCellChange}
                onRemoveRow={TABLE_REMOVE.sample}
              />
              {tableErrors.sample && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {tableErrors.sample}
                </p>
              )}
            </div>
          )}

          {/* Tab: Machine/Fixture */}
          {activeChildTab === "fixtures" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  {
                    key: "machineFixtureNo",
                    label: "Machine/Fixture No. *",
                    type: "select",
                    options: machineFixtureOptions,
                  },
                  { key: "machineFixtureName", label: "Machine/Fixture Name" },
                ]}
                rows={fixtureRows}
                onCellChange={handleFixtureCellChange}
                onRemoveRow={TABLE_REMOVE.fixtures}
              />
              {tableErrors.fixtures && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {tableErrors.fixtures}
                </p>
              )}
            </div>
          )}

          {/* Tab: Control Plan Summary */}
          {activeChildTab === "summary" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  label="Prepared By"
                  name="preparedBy"
                  value={summary.preparedBy}
                  onChange={handleSummaryChange}
                />
                <Field
                  label="Checked By"
                  name="checkedBy"
                  value={summary.checkedBy}
                  onChange={handleSummaryChange}
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

export default ControlPlanForm;

import { ArrowLeft, FilePlus2, Plus, Save, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import controlPlanAPI from "../../../api/quality/controlPlanAPI";
import branchAPI from "../../../api/branchAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";
import { useToast } from "../../Toast/ToastContext";
import employeeAPI from "../../../api/employeeAPI";
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
              // Options can be a static array or a per-row function, since
              // some columns (e.g. Machine/Device) depend on another cell
              // in the same row (e.g. the selected Operation No).
              const opts =
                typeof col.options === "function"
                  ? col.options(row)
                  : col.options || [];

              return (
                <td className="p-2 align-top" key={col.key}>
                  <select
                    value={row[col.key]}
                    onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                    className={cellInputClasses}
                  >
                    <option value="">-- Select --</option>
                    {opts.map((opt) => (
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
/* Options / tab config                                                        */

const CHILD_TABS = [
  { key: "detail", label: "Control Plan Detail", kind: "table" },
  { key: "parameters", label: "Parameters", kind: "table" },
  { key: "sample", label: "Sample", kind: "table" },
  { key: "fixtures", label: "Machine/Fixture", kind: "table" },
  { key: "summary", label: "Control Plan Summary", kind: "fields" },
];

// NOTE: operationDesc has no slot in controlPlanDetailDTO — kept here for
// on-screen reference only, never sent in the save payload. machineOptions
// is UI-only state: the per-row Machine/Device choices for whichever
// Operation No is currently selected on that row.
const emptyDetailRow = () => ({
  id: 0,
  operationNo: "",
  operationDesc: "",
  machineDevice: "",
  machineOptions: [],
  product: "",
  process: "",
  specification: "",
  riskClassSpecialCharacter: "",
  evaluationTechnique: "",
  sampling: "",
  controlMethod: "",
  reactionPlan: "",
  record: "",
});

const emptyParameterRow = () => ({
  id: 0,
  parameter: "",
  parameterType: "",
  tol: "",
});

const emptySampleRow = () => ({
  id: 0,
  sampleFrequency: "",
  size: "",
});

const emptyFixtureRow = () => ({
  id: 0,
  machineFixtureNo: "", // holds the machineFixtureId (DTO expects a number here)
  machineFixtureName: "",
});

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");

/* ---------------------------------------------------------------------------- */

const ControlPlanForm = ({ onBack, onSave, editData, editId }) => {
  const { addToast } = useToast();
  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
  const BRANCH_ID = Number(localStorage.getItem("branchId")) || 0;
  const CREATED_BY = localStorage.getItem("userName") || "SYSTEM";

  const [activeChildTab, setActiveChildTab] = useState("detail");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatingDocId, setGeneratingDocId] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [tableErrors, setTableErrors] = useState({});
  const [employeeList, setEmployeeList] = useState([]);
  /* ---------------- Lookup options ---------------- */
  const [branchOptions, setBranchOptions] = useState([]);
  const [planTypeOptions, setPlanTypeOptions] = useState([]);
  const [fgItemList, setFgItemList] = useState([]); // raw list, for id -> details lookup
  const [operationList, setOperationList] = useState([]); // raw operationMasterVO list, for Operation No auto-fill (Operation Desc + Machine/Device options)
  const [locationList, setLocationList] = useState([]); // raw list, for Process Sheet No dropdown (label: locationId, value: id)
  const [machineFixtureList, setMachineFixtureList] = useState([]); // raw, for id -> name lookup
  const [parameterList, setParameterList] = useState([]); // raw, for id -> type lookup

  const isTableTab =
    CHILD_TABS.find((t) => t.key === activeChildTab)?.kind === "table";

  const isEditMode = Boolean(
    (editData && editData.id) || (editId && editId > 0),
  );

  /* ---------------- State ---------------- */
  const [header, setHeader] = useState({
    id: 0,
    plantId: BRANCH_ID ? String(BRANCH_ID) : "",
    controlPlanType: "",
    planNo: "",
    fgItemCode: "",
    itemDescription: "",
    itemGrade: "", // numeric gradeMasterId — sent to backend
    itemGradeCode: "", // display-only text (gradeCode)
    itemSize: "",
    processSheetNo: "", // holds the numeric location id — sent to backend
    originDate: "", // UI-only, no slot in controlPlanDTO
    revisionDate: "",
    preparedBy: "",
    checkedBy: "",
    approved: "No",
    active: true,
    cancel: false,
    cancelRemarks: "",
    orgId: ORG_ID,
    createdBy: CREATED_BY,
  });

  const [detailRows, setDetailRows] = useState([emptyDetailRow()]);
  const [parameterRows, setParameterRows] = useState([emptyParameterRow()]);
  const [sampleRows, setSampleRows] = useState([emptySampleRow()]);
  const [fixtureRows, setFixtureRows] = useState([emptyFixtureRow()]);

  /* ---------------- Lookup loading ---------------- */

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
        list.map((b) => ({
          value: b.id,
          label: b.branchName || b.name || b.branchCode || `Branch ${b.id}`,
        })),
      );
    } catch (error) {
      console.error("Failed to load branches:", error);
      setBranchOptions([]);
    }
  }, [ORG_ID]);

  const loadEmployees = useCallback(async () => {
    try {
      if (!ORG_ID) return;

      const res = await employeeAPI.getEmployeeByOrgId(ORG_ID);

      const list = Array.isArray(res)
        ? res
        : res?.paramObjectsMap?.employeeMasterVO || [];

      setEmployeeList(list);
    } catch (error) {
      console.error("Failed to load employees:", error);
      setEmployeeList([]);
    }
  }, [ORG_ID]);

  const loadPlanTypes = useCallback(async () => {
    try {
      const res = await listOfValuesAPI.getListValuesGroup(
        "CONTROLPLANTYPE",
        ORG_ID,
      );
      const list = Array.isArray(res) ? res : [];
      setPlanTypeOptions(
        list.map((v) => ({
          value: v.id,
          label: v.valuesDescription || v.valueDescription || v.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load Control Plan Type:", error);
      setPlanTypeOptions([]);
    }
  }, [ORG_ID]);

  const loadFgItems = useCallback(async () => {
    try {
      const res = await controlPlanAPI.getFGItemDropdown(BRANCH_ID, ORG_ID);
      setFgItemList(res || []);
    } catch (error) {
      console.error("Failed to load FG items:", error);
      setFgItemList([]);
    }
  }, [BRANCH_ID, ORG_ID]);

  // Operation Master — drives Operation No, Operation Desc, and the
  // per-row Machine/Device options on the Control Plan Detail table.
  const loadOperations = useCallback(async () => {
    try {
      const res = await controlPlanAPI.getOperationMasterByOrgId(ORG_ID);
      setOperationList(res || []);
    } catch (error) {
      console.error("Failed to load Operation Master:", error);
      setOperationList([]);
    }
  }, [ORG_ID]);

  // Locations — drives the Process Sheet No dropdown. Label shown is
  // locationId, but the value stored/sent to the backend is the numeric id.
  const loadLocations = useCallback(async () => {
    try {
      const res =
        await controlPlanAPI.getLocationDropdownforProcessSheetCompRouting(
          BRANCH_ID,
          ORG_ID,
        );
      setLocationList(res || []);
    } catch (error) {
      console.error("Failed to load Process Sheet No (location) list:", error);
      setLocationList([]);
    }
  }, [BRANCH_ID, ORG_ID]);

  const loadParameters = useCallback(async () => {
    try {
      const res = await controlPlanAPI.getParameterMaster(ORG_ID);
      setParameterList(res || []);
    } catch (error) {
      console.error("Failed to load parameters:", error);
      setParameterList([]);
    }
  }, [ORG_ID]);

  const loadMachineFixtures = useCallback(async () => {
    try {
      const res = await controlPlanAPI.getMachineFixtureDropdown(
        BRANCH_ID,
        ORG_ID,
      );
      setMachineFixtureList(res || []);
    } catch (error) {
      console.error("Failed to load machine/fixtures:", error);
      setMachineFixtureList([]);
    }
  }, [BRANCH_ID, ORG_ID]);

  useEffect(() => {
    loadBranches();
    loadPlanTypes();
    loadFgItems();
    loadOperations();
    loadLocations();
    loadParameters();
    loadMachineFixtures();
    loadEmployees();
  }, [
    loadBranches,
    loadPlanTypes,
    loadFgItems,
    loadOperations,
    loadLocations,
    loadParameters,
    loadMachineFixtures,
    loadEmployees,
  ]);

  /* ---------------- Derived option lists ---------------- */

  const fgItemOptions = fgItemList.map((it) => ({
    value: it.itemId,
    label: it.itemCode,
  }));

  const employeeOptions = employeeList.map((employee) => ({
    value: employee.id,
    label: employee.employeeId
      ? `${employee.employeeId} - ${employee.employeeName || ""}`
      : employee.employeeName || "",
  }));

  const machineFixtureOptions = machineFixtureList.map((m) => ({
    value: m.machineFixtureId,
    label: m.machineFixtureNo || m.machineFixtureName,
  }));

  const parameterOptions = parameterList.map((p) => ({
    value: p.id,
    label: p.parameterCode || p.parameterDescription || p.id,
  }));

  // Process Sheet No — shows locationId, sends the numeric id.
  const processSheetOptions = locationList.map((loc) => ({
    value: loc.id,
    label: loc.locationId,
  }));

  // Operation No — sourced from Operation Master.
  const operationOptions = operationList
    .filter((op) => op.operationId)
    .map((op) => ({ value: op.operationId, label: op.operationId }));

  /* ---------------- Doc No generation (add mode only) ---------------- */

  useEffect(() => {
    if (isEditMode) return;
    if (!ORG_ID) return;

    let cancelled = false;
    const financialYear = String(new Date().getFullYear());

    const generateDocId = async () => {
      setGeneratingDocId(true);
      try {
        const docId = await controlPlanAPI.getControlPlanDocId(
          financialYear,
          ORG_ID,
        );
        if (!cancelled) {
          setHeader((prev) => ({ ...prev, planNo: docId || "" }));
        }
      } catch (error) {
        if (!cancelled)
          console.error("Error generating Control Plan Doc No:", error);
      } finally {
        if (!cancelled) setGeneratingDocId(false);
      }
    };

    generateDocId();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, ORG_ID]);

  /* ---------------- Edit data loading ---------------- */

  const populateFormFromEditData = (data) => {
    setHeader({
      id: data.id || 0,
      plantId:
        data.branch != null
          ? String(data.branch)
          : BRANCH_ID
            ? String(BRANCH_ID)
            : "",
      controlPlanType: data.controlPlanType ?? "",
      planNo: data.planNo || "",
      fgItemCode: data.fgItemCode ?? "",
      itemDescription: data.itemDescription || "",
      itemGrade: data.itemGrade ?? "",
      itemGradeCode: "", // resolved once fgItemList / this item's grade is known
      itemSize: data.itemSize || "",
      processSheetNo: data.processSheetNo || "",
      originDate: "",
      revisionDate: fmtDate(data.revisionDate),
      preparedBy: data.preparedBy ?? "",
      checkedBy: data.checkedBy ?? "",
      approved: data.approved ? "Yes" : "No",
      active: data.active !== false,
      cancel: Boolean(data.cancel),
      cancelRemarks: data.cancelRemarks || "",
      orgId: data.orgId || ORG_ID,
      createdBy: data.createdBy || CREATED_BY,
    });

    setDetailRows(
      data.controlPlanDetailDTO?.length
        ? data.controlPlanDetailDTO.map((d) => ({
            id: d.id || 0,
            operationNo: d.operationNo || "",
            operationDesc: "",
            machineDevice: d.machineDevice ?? "",
            machineOptions: [], // backfilled once Operation Master loads
            product: "",
            process: d.process || "",
            specification: d.specification || "",
            riskClassSpecialCharacter: d.riskClassSpecialCharacter || "",
            evaluationTechnique: d.evaluationTechnique || "",
            sampling: "",
            controlMethod: d.controlMethod ?? "",
            reactionPlan: d.reactionPlan || "",
            record: d.record || "",
          }))
        : [emptyDetailRow()],
    );

    setParameterRows(
      data.controlPlanParameterDTO?.length
        ? data.controlPlanParameterDTO.map((p) => ({
            id: p.id || 0,
            parameter: p.parameter ?? "",
            parameterType: p.parameterType || "",
            tol: p.tol ?? "",
          }))
        : [emptyParameterRow()],
    );

    setSampleRows(
      data.controlPlanSampleDTO?.length
        ? data.controlPlanSampleDTO.map((s) => ({
            id: s.id || 0,
            sampleFrequency: s.sampleFrequency ?? "",
            size: s.size ?? "",
          }))
        : [emptySampleRow()],
    );

    setFixtureRows(
      data.controlPlanMachineFixtureDTO?.length
        ? data.controlPlanMachineFixtureDTO.map((f) => ({
            id: f.id || 0,
            machineFixtureNo: f.machineFixtureNo ?? "",
            machineFixtureName: f.machineFixtureName || "",
          }))
        : [emptyFixtureRow()],
    );
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId, editData]);

  // Once FG items are loaded, backfill the display-only grade code for edit mode
  useEffect(() => {
    if (!fgItemList.length || !header.fgItemCode) return;
    const match = fgItemList.find(
      (it) => String(it.itemId) === String(header.fgItemCode),
    );
    if (match) {
      setHeader((prev) => ({ ...prev, itemGradeCode: match.gradeCode || "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fgItemList]);

  // Once Operation Master is loaded, backfill Operation Desc + the
  // Machine/Device options for any detail rows that already have an
  // Operation No selected (edit mode, where rows load before the master
  // data arrives).
  useEffect(() => {
    if (!operationList.length) return;
    setDetailRows((prev) =>
      prev.map((row) => {
        if (!row.operationNo) return row;
        const match = operationList.find(
          (op) => String(op.operationId) === String(row.operationNo),
        );
        if (!match) return row;
        return {
          ...row,
          operationDesc: match.description || row.operationDesc,
          machineOptions: (
            match.operationMasterMachineDetailsResponseDTO || []
          ).map((m) => ({
            value: m.machine?.id,
            label: m.machine?.machineNo || m.machine?.machineName,
          })),
        };
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operationList]);

  /* ---------------- Handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "fgItemCode") {
      const item = fgItemList.find((it) => String(it.itemId) === String(value));
      setHeader((prev) => ({
        ...prev,
        fgItemCode: value,
        itemDescription: item?.itemDescription || "",
        itemGrade: item?.gradeMasterId ?? "",
        itemGradeCode: item?.gradeCode || "",
      }));
      return;
    }

    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  const handleDetailCellChange = (idx, key, value) =>
    setDetailRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        const next = { ...row, [key]: value };

        if (key === "operationNo") {
          const match = operationList.find(
            (op) => String(op.operationId) === String(value),
          );

          next.operationDesc = match?.description || "";
          next.machineOptions = (
            match?.operationMasterMachineDetailsResponseDTO || []
          ).map((m) => ({
            value: m.machine?.id,
            label: m.machine?.machineNo || m.machine?.machineName,
          }));
          // The previously picked machine belonged to the old operation's
          // option list, so it's no longer valid — clear it.
          next.machineDevice = "";
        }

        return next;
      }),
    );

  const handleParameterCellChange = (idx, key, value) =>
    setParameterRows((prev) => {
      const next = prev.map((row, i) =>
        i === idx ? { ...row, [key]: value } : row,
      );
      if (key === "parameter") {
        const selected = parameterList.find(
          (p) => String(p.id) === String(value),
        );
        if (selected) {
          next[idx] = {
            ...next[idx],
            parameterType:
              selected.parameterType?.description ||
              selected.parameterType?.code ||
              "",
          };
        }
      }
      return next;
    });

  const handleSampleCellChange = (idx, key, value) =>
    setSampleRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row)),
    );

  const handleFixtureCellChange = (idx, key, value) =>
    setFixtureRows((prev) => {
      const next = prev.map((row, i) =>
        i === idx ? { ...row, [key]: value } : row,
      );
      if (key === "machineFixtureNo") {
        const selected = machineFixtureList.find(
          (m) => String(m.machineFixtureId) === String(value),
        );
        if (selected) {
          next[idx] = {
            ...next[idx],
            machineFixtureName: selected.machineFixtureName || "",
          };
        }
      }
      return next;
    });

  const TABLE_ADD = {
    detail: () => setDetailRows((prev) => [...prev, emptyDetailRow()]),
    parameters: () =>
      setParameterRows((prev) => [...prev, emptyParameterRow()]),
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
      plantId: BRANCH_ID ? String(BRANCH_ID) : "",
      controlPlanType: "",
      planNo: "",
      fgItemCode: "",
      itemDescription: "",
      itemGrade: "",
      itemGradeCode: "",
      itemSize: "",
      processSheetNo: "",
      originDate: "",
      revisionDate: "",
      preparedBy: "",
      checkedBy: "",
      approved: "No",
      active: true,
      cancel: false,
      cancelRemarks: "",
      orgId: ORG_ID,
      createdBy: CREATED_BY,
    });
    setDetailRows([emptyDetailRow()]);
    setParameterRows([emptyParameterRow()]);
    setSampleRows([emptySampleRow()]);
    setFixtureRows([emptyFixtureRow()]);
    setFieldErrors({});
    setTableErrors({});
  };

  /* ---------------- Validation ---------------- */

  const validate = () => {
    const errors = {};

    if (!header.plantId) errors.plantId = "Plant Id is required";
    if (!header.controlPlanType)
      errors.controlPlanType = "Control Plan Type is required";
    if (!header.fgItemCode) errors.fgItemCode = "FG Item Code is required";
    if (!header.processSheetNo)
      errors.processSheetNo = "Process Sheet No is required";
    if (!header.originDate) errors.originDate = "Origin Date is required";

    setFieldErrors(errors);

    const validDetails = detailRows.every((r) => r.operationNo?.trim());
    const validParameters = parameterRows.every((r) => r.parameter?.trim());
    const validSamples = sampleRows.every(
      (r) => r.sampleFrequency !== "" && r.size !== "",
    );
    const validFixtures = fixtureRows.every((r) => r.machineFixtureNo?.trim());

    const nextTableErrors = {
      detail: validDetails
        ? ""
        : "Complete mandatory column (Operation No) in Control Plan Detail",
      parameters: validParameters
        ? ""
        : "Complete mandatory column (Parameter) in Parameters",
      sample: validSamples
        ? ""
        : "Complete mandatory columns (Sample Frequency, Size) in Sample",
      fixtures: validFixtures
        ? ""
        : "Complete mandatory column (Machine/Fixture No.) in Machine/Fixture",
    };

    setTableErrors(nextTableErrors);

    const firstError = Object.keys(errors)[0];
    if (firstError) {
      addToast(errors[firstError], "error");
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
      ...(header.id > 0 && { id: header.id }),
      active: header.active,
      approved: header.approved === "Yes",
      branch: Number(header.plantId) || 0,
      cancel: header.cancel,
      cancelRemarks: header.cancelRemarks || "",
      checkedBy: Number(header.checkedBy) || 0,
      controlPlanDetailDTO: detailRows
        .filter((r) => r.operationNo?.trim())
        .map((r) => ({
          ...(r.id > 0 && { id: r.id }),
          controlMethod: Number(r.controlMethod) || 0,
          evaluationTechnique: r.evaluationTechnique || "",
          machineDevice: Number(r.machineDevice) || 0,
          operationNo: r.operationNo,
          process: r.process || "",
          reactionPlan: r.reactionPlan || "",
          record: r.record || "",
          riskClassSpecialCharacter: r.riskClassSpecialCharacter || "",
          specification: r.specification || "",
        })),
      controlPlanMachineFixtureDTO: fixtureRows
        .filter((r) => r.machineFixtureNo?.toString().trim())
        .map((r) => ({
          ...(r.id > 0 && { id: r.id }),
          machineFixtureName: r.machineFixtureName || "",
          machineFixtureNo: Number(r.machineFixtureNo) || 0,
        })),
      controlPlanParameterDTO: parameterRows
        .filter((r) => r.parameter?.toString().trim())
        .map((r) => ({
          ...(r.id > 0 && { id: r.id }),
          parameter: Number(r.parameter) || 0,
          parameterType: r.parameterType || "",
          tol: r.tol === "" ? "" : String(r.tol),
        })),
      controlPlanSampleDTO: sampleRows
        .filter((r) => r.sampleFrequency !== "" || r.size !== "")
        .map((r) => ({
          ...(r.id > 0 && { id: r.id }),
          sampleFrequency:
            r.sampleFrequency === "" ? "" : String(r.sampleFrequency),
          size: r.size === "" ? "" : String(r.size),
        })),
      controlPlanType: Number(header.controlPlanType) || 0,
      createdBy: header.createdBy,
      fgItemCode: Number(header.fgItemCode) || 0,
      itemDescription: header.itemDescription || "",
      itemGrade: Number(header.itemGrade) || 0,
      itemSize: header.itemSize || "",
      orgId: header.orgId,
      planNo: header.planNo || "",
      preparedBy: Number(header.preparedBy) || 0,
      // header.processSheetNo holds the numeric location id from the
      // Process Sheet No dropdown — sent to the backend as-is.
      processSheetNo: header.processSheetNo || "",
      revisionDate: header.revisionDate || "",
      ...(isEditMode && { updatedBy: CREATED_BY }),
    };

    console.log("Submitting Control Plan Payload:", payload);

    try {
      const response = await controlPlanAPI.createUpdateControlPlan(payload);

      const status = response?.status === true || response?.statusFlag === "Ok";

      if (status) {
        const successMessage =
          response?.paramObjectsMap?.message ||
          (isEditMode
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
          response?.paramObjectsMap?.errorMessage ||
          response?.paramObjectsMap?.message ||
          response?.message ||
          "Failed to save Control Plan";

        addToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("Save Error:", error);
      const backendData = error?.response?.data || error;
      const errorMessage =
        backendData?.paramObjectsMap?.errorMessage ||
        backendData?.paramObjectsMap?.message ||
        backendData?.message ||
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
          {isEditMode ? "Edit Control Plan" : "Add Control Plan"}
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
              options={branchOptions}
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
              value={generatingDocId ? "Generating..." : header.planNo}
              onChange={() => {}}
              disabled
            />
            <Field
              type="select"
              label="FG Item Code"
              name="fgItemCode"
              value={header.fgItemCode}
              onChange={handleHeaderChange}
              error={fieldErrors.fgItemCode}
              options={fgItemOptions}
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
              label="Item Grade"
              name="itemGradeCode"
              value={header.itemGradeCode}
              onChange={handleHeaderChange}
              disabled
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
                  {
                    key: "operationNo",
                    label: "Operation No *",
                    type: "select",
                    options: operationOptions,
                  },
                  {
                    key: "operationDesc",
                    label: "Operation Desc",
                    readOnly: true,
                  },
                  {
                    key: "machineDevice",
                    label: "Machine/Device",
                    type: "select",
                    // Options depend on the operation picked on this row
                    options: (row) => row.machineOptions || [],
                  },
                  { key: "product", label: "Product" },
                  { key: "process", label: "Process" },
                  { key: "specification", label: "Specification" },
                  {
                    key: "riskClassSpecialCharacter",
                    label: "Risk Class / SPL Char",
                  },
                  { key: "evaluationTechnique", label: "Eval. Technique" },
                  { key: "sampling", label: "Sampling" },
                  {
                    key: "controlMethod",
                    label: "Control Method",
                    type: "number",
                  },
                  {
                    key: "reactionPlan",
                    label: "Reaction Plan",
                    type: "textarea",
                  },
                  { key: "record", label: "Record", type: "textarea" },
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
                  { key: "tol", label: "Tolerance (TOL)" },
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
                  { key: "sampleFrequency", label: "Sample Frequency *" },
                  { key: "size", label: "Size *" },
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
                  {
                    key: "machineFixtureName",
                    label: "Machine/Fixture Name",
                    readOnly: true,
                  },
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
                  type="select"
                  label="Prepared By (Employee ID)"
                  name="preparedBy"
                  value={header.preparedBy}
                  onChange={handleHeaderChange}
                  options={employeeOptions}
                />

                <Field
                  type="select"
                  label="Checked By (Employee ID)"
                  name="checkedBy"
                  value={header.checkedBy}
                  onChange={handleHeaderChange}
                  options={employeeOptions}
                />
                <Field
                  type="select"
                  label="Approved"
                  name="approved"
                  value={header.approved}
                  onChange={handleHeaderChange}
                  options={[
                    { value: "Yes", label: "Yes" },
                    { value: "No", label: "No" },
                  ]}
                />
                <Field
                  label="Cancel Remarks"
                  name="cancelRemarks"
                  value={header.cancelRemarks}
                  onChange={handleHeaderChange}
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
          saveLabel={isEditMode ? "Update" : "Submit"}
        />
      </div>
    </div>
  );
};

export default ControlPlanForm;

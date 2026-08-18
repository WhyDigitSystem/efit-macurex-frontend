import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";
import instrumentCalibrationAPI from "../../../api/quality/instrumentCalibrationAPI";
import branchAPI from "../../../api/branchAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import { departmentAPI } from "../../../api/departmentAPI";
import { employeeAPI } from "../../../api/employeeAPI";
import partyMasterAPI from "../../../api/partyMasterAPI";
import { controlPlanAPI } from "../../../api/quality/controlPlanAPI";

/* ---------------------------------------------------------------------------- */
/* Shared design tokens                                                        */

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

const fieldGrid =
  "grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 items-start";

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
  placeholder = "",
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
          rows={3}
          className={
            "w-full px-2 py-1.5 rounded border text-xs transition-colors resize-none scrollbar-hide " +
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
        placeholder={placeholder}
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
                  value={row[col.key] ?? ""}
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
  { key: "calibrationDetails", label: "Calibration Details", kind: "table" },
  { key: "calibrationSummary", label: "Calibration Summary", kind: "fields" },
];

const FREQUENCY_OPTIONS = [
  { value: "Monthly", label: "Monthly" },
  { value: "Quarterly", label: "Quarterly" },
  { value: "Half Yearly", label: "Half Yearly" },
  { value: "Yearly", label: "Yearly" },
];

const CALIBRATION_STATUS_OPTIONS = [
  { value: "Calibrated", label: "Calibrated" },
  { value: "Due for Calibration", label: "Due for Calibration" },
  { value: "Overdue", label: "Overdue" },
  { value: "In Progress", label: "In Progress" },
];

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");

const generateReportNo = () =>
  `CAL-${dayjs().format("YYYYMMDD")}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;

/* ---------------------------------------------------------------------------- */
/* Instrument Calibration Form                                                    */

const InstrumentCalibrationForm = ({ data, onBack }) => {
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

  const [activeChildTab, setActiveChildTab] = useState("calibrationDetails");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  /* ---------- Header state ---------- */
  const [header, setHeader] = useState(() => {
    const base = {
      plantId: data?.plantId?.id ?? data?.plantId ?? "",
      reportNo: data?.reportNo || "",
      date: data?.date ? fmtDate(data.date) : fmtDate(dayjs()),
      department: data?.department?.id ?? data?.department ?? "",
      checkedBy: data?.checkedBy?.id ?? data?.checkedBy ?? "",
      machineInstrument: data?.machineInstrument?.id ?? data?.machineInstrument ?? "",
      location: data?.location || "",
      machineInstrumentNo: data?.machineInstrumentNo || data?.machineNo || "",
      calibrationAgency: data?.calibrationAgency?.id ?? data?.calibrationAgency ?? "",
      certificateNo: data?.certificateNo || "",
      approvedBy: data?.approvedBy?.id ?? data?.approvedBy ?? "",
    };
    if (!base.reportNo) base.reportNo = generateReportNo();
    return base;
  });

  const [detailRows, setDetailRows] = useState(() => {
    const raw = data?.calibrationDetails?.length
      ? data.calibrationDetails
      : data?.details?.length
        ? data.details
        : [];
    if (raw.length) {
      return raw.map((item) => ({
        dateOfCalibration: fmtDate(item.dateOfCalibration),
        frequency: item.frequency || "",
        nextScheduleDate: fmtDate(item.nextScheduleDate),
      }));
    }
    return [
      {
        dateOfCalibration: fmtDate(dayjs()),
        frequency: "",
        nextScheduleDate: "",
      },
    ];
  });

  const [summary, setSummary] = useState({
    summaryNotes: data?.summaryNotes || data?.remarks || "",
    overallCalibrationStatus:
      (data?.overallCalibrationStatus?.id ??
        data?.overallCalibrationStatus) ||
      "",
  });

  /* ---------- Lookup loading ---------- */

  const [plantOptions, setPlantOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [machineOptions, setMachineOptions] = useState([]);
  const [agencyOptions, setAgencyOptions] = useState([]);

  const loadPlants = useCallback(async () => {
    try {
      if (isMacurex) {
        const res = await locationMasterAPI.getPlants(orgId);
        setPlantOptions(
          (res || []).map((p) => ({
            value: p.id,
            label: p.plantName || p.plantId || p.id,
          })),
        );
      } else {
        const res = await branchAPI.getBranchByOrgId(orgId);
        setPlantOptions(
          (res || []).map((b) => ({
            value: b.id,
            label: b.branchName || b.branchCode || b.id,
          })),
        );
      }
    } catch (error) {
      console.error("Failed to load plant options:", error);
      setPlantOptions([]);
    }
  }, [orgId, isMacurex]);

  const loadDepartments = useCallback(async () => {
    try {
      const res = await departmentAPI.getAllDepartments(orgId, branch);
      const departments = res?.paramObjectsMap?.departmentVO || [];
      setDepartmentOptions(
        departments.map((d) => ({
          value: d.id,
          label: d.departmentName || d.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load department options:", error);
      setDepartmentOptions([]);
    }
  }, [orgId, branch]);

  const loadEmployees = useCallback(async () => {
    try {
      const res = await employeeAPI.getEmployeeByOrgId(orgId);
      setEmployeeOptions(
        (res || []).map((e) => ({
          value: e.id,
          label: e.employeeCode || e.employeeName || e.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load employee options:", error);
      setEmployeeOptions([]);
    }
  }, [orgId]);

  const loadMachines = useCallback(async () => {
    try {
      const res = await controlPlanAPI.getMachineFixtures(orgId);
      setMachineOptions(
        (res || []).map((m) => ({
          value: m.machineFixtureNo || m.id,
          label: m.machineFixtureNo || m.machineFixtureName || m.id,
          machineNo: m.machineFixtureNo || "",
        })),
      );
    } catch (error) {
      console.error("Failed to load machine/instrument options:", error);
      setMachineOptions([]);
    }
  }, [orgId]);

  const loadAgencies = useCallback(async () => {
    try {
      const res = await partyMasterAPI.getPartyByOrgId(orgId, branch);
      setAgencyOptions(
        (res || []).map((c) => ({
          value: c.id,
          label: c.customerCode || c.docId || c.customerName || c.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load calibration agency options:", error);
      setAgencyOptions([]);
    }
  }, [orgId, branch]);

  useEffect(() => {
    if (orgId) loadPlants();
  }, [orgId, loadPlants]);

  useEffect(() => {
    if (orgId) {
      loadDepartments();
      loadEmployees();
      loadMachines();
      loadAgencies();
    }
  }, [orgId, loadDepartments, loadEmployees, loadMachines, loadAgencies]);

  /* ---------------------------------------------------------------------------- */
  /* Handlers                                                                     */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "machineInstrument") {
        const machine = machineOptions.find(
          (m) => String(m.value) === String(value),
        );
        next.machineInstrumentNo = machine?.machineNo || next.machineInstrumentNo || "";
      }
      return next;
    });
  };

  const handleCellChange = (idx, key, value) => {
    setDetailRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        const next = { ...row, [key]: value };
        if (key === "dateOfCalibration" && value) {
          const freq = next.frequency;
          const monthsMap = {
            Monthly: 1,
            Quarterly: 3,
            "Half Yearly": 6,
            Yearly: 12,
          };
          if (monthsMap[freq]) {
            next.nextScheduleDate = dayjs(value)
              .add(monthsMap[freq], "month")
              .format("YYYY-MM-DD");
          }
        }
        if (key === "frequency" && value && next.dateOfCalibration) {
          const monthsMap = {
            Monthly: 1,
            Quarterly: 3,
            "Half Yearly": 6,
            Yearly: 12,
          };
          if (monthsMap[value]) {
            next.nextScheduleDate = dayjs(next.dateOfCalibration)
              .add(monthsMap[value], "month")
              .format("YYYY-MM-DD");
          }
        }
        return next;
      }),
    );
  };

  const handleAddRow = () =>
    setDetailRows((prev) => [
      ...prev,
      {
        dateOfCalibration: fmtDate(dayjs()),
        frequency: "",
        nextScheduleDate: "",
      },
    ]);

  const handleRemoveRow = (idx) =>
    setDetailRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx),
    );

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
    if (!header.reportNo?.trim()) errors.reportNo = "Report No is required";
    if (!header.date) errors.date = "Date is required";
    if (!header.department) errors.department = "Department is required";
    if (!header.checkedBy) errors.checkedBy = "Checked By is required";
    if (!header.machineInstrument)
      errors.machineInstrument = "Machine/Instrument is required";
    if (!header.machineInstrumentNo?.trim())
      errors.machineInstrumentNo = "Machine/Instrument No is required";
    if (!header.calibrationAgency)
      errors.calibrationAgency = "Calibration Agency is required";
    if (!header.certificateNo?.trim())
      errors.certificateNo = "Certificate No is required";
    if (!header.approvedBy) errors.approvedBy = "Approved By is required";

    const validRows = detailRows.filter(
      (r) => r.dateOfCalibration && r.frequency,
    );
    if (!validRows.length)
      errors.calibrationDetails =
        "Add at least one Calibration Details row with Date of Calibration and Frequency";
    detailRows.forEach((r, i) => {
      if (!r.dateOfCalibration)
        errors[`detail.${i}.dateOfCalibration`] = "Date of Calibration is required";
      if (!r.frequency) errors[`detail.${i}.frequency`] = "Frequency is required";
    });

    if (!summary.overallCalibrationStatus)
      errors.overallCalibrationStatus =
        "Overall Calibration Status is required";

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
      branch,
      ...header,
      calibrationDetails: detailRows.filter(
        (r) => r.dateOfCalibration || r.frequency,
      ),
      summary,
      createdBy: isUpdate ? data?.createdBy || usersId : usersId,
      ...(isUpdate ? { updatedBy: usersId } : {}),
    };

    try {
      const response =
        await instrumentCalibrationAPI.createUpdateInstrumentCalibration(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Instrument Calibration updated successfully!"
              : "Instrument Calibration created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            response?.paramObjectsMap?.message ||
            "Failed to save Instrument Calibration.",
        );
      }
    } catch (err) {
      console.error("Save Instrument Calibration Error:", err);
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
          {data ? "Edit Instrument Calibration" : "Add Instrument Calibration"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Info ---------------- */}
        <div>
          <SectionHeader>Calibration Header</SectionHeader>
          <div className={fieldGrid}>
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
              label="Report No"
              name="reportNo"
              value={header.reportNo}
              onChange={handleHeaderChange}
              error={fieldErrors.reportNo}
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
              label="Department"
              name="department"
              value={header.department}
              onChange={handleHeaderChange}
              error={fieldErrors.department}
              options={departmentOptions}
              required
            />
            <Field
              type="select"
              label="Checked By"
              name="checkedBy"
              value={header.checkedBy}
              onChange={handleHeaderChange}
              error={fieldErrors.checkedBy}
              options={employeeOptions}
              required
            />
            <Field
              type="select"
              label="Select Machine/Instrument"
              name="machineInstrument"
              value={header.machineInstrument}
              onChange={handleHeaderChange}
              error={fieldErrors.machineInstrument}
              options={machineOptions}
              required
            />
            <Field
              label="Location"
              name="location"
              value={header.location}
              onChange={handleHeaderChange}
            />
            <Field
              label="Machine/Instrument No"
              name="machineInstrumentNo"
              value={header.machineInstrumentNo}
              onChange={handleHeaderChange}
              error={fieldErrors.machineInstrumentNo}
              required
            />
            <Field
              type="select"
              label="Calibration Agency"
              name="calibrationAgency"
              value={header.calibrationAgency}
              onChange={handleHeaderChange}
              error={fieldErrors.calibrationAgency}
              options={agencyOptions}
              required
            />
            <Field
              label="Certificate No"
              name="certificateNo"
              value={header.certificateNo}
              onChange={handleHeaderChange}
              error={fieldErrors.certificateNo}
              required
            />
            <Field
              type="select"
              label="Approved By"
              name="approvedBy"
              value={header.approvedBy}
              onChange={handleHeaderChange}
              error={fieldErrors.approvedBy}
              options={employeeOptions}
              required
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
                  className={`px-4 py-1 text-xs font-semibold rounded-t whitespace-nowrap transition-colors ${
                    activeChildTab === tab.key
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

          {/* Tab 1: Calibration Details */}
          {activeChildTab === "calibrationDetails" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  {
                    key: "dateOfCalibration",
                    label: "Date of Calibration",
                    type: "date",
                  },
                  {
                    key: "frequency",
                    label: "Frequency",
                    type: "select",
                    options: FREQUENCY_OPTIONS,
                  },
                  {
                    key: "nextScheduleDate",
                    label: "Next Schedule Date",
                    type: "date",
                  },
                ]}
                rows={detailRows}
                onCellChange={handleCellChange}
                onRemoveRow={handleRemoveRow}
              />
              {fieldErrors.calibrationDetails && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.calibrationDetails}
                </p>
              )}
              {detailRows.some(
                (r, i) => fieldErrors[`detail.${i}.dateOfCalibration`],
              ) && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  Date of Calibration is required in every row
                </p>
              )}
              {detailRows.some((r, i) => fieldErrors[`detail.${i}.frequency`]) && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  Frequency is required in every row
                </p>
              )}
            </div>
          )}

          {/* Tab 2: Calibration Summary */}
          {activeChildTab === "calibrationSummary" && (
            <div className="pt-3">
              <div className={fieldGrid}>
                <Field
                  type="textarea"
                  label="Summary Notes"
                  name="summaryNotes"
                  value={summary.summaryNotes}
                  onChange={handleSummaryChange}
                  className="col-span-full"
                />
                <Field
                  type="select"
                  label="Overall Calibration Status"
                  name="overallCalibrationStatus"
                  value={summary.overallCalibrationStatus}
                  onChange={handleSummaryChange}
                  error={fieldErrors.overallCalibrationStatus}
                  options={CALIBRATION_STATUS_OPTIONS}
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

export default InstrumentCalibrationForm;
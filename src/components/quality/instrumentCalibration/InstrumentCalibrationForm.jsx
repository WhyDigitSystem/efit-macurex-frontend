import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";
import instrumentCalibrationAPI from "../../../api/quality/instrumentCalibrationAPI";
import branchAPI from "../../../api/branchAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import { departmentAPI } from "../../../api/departmentAPI";
import { employeeAPI } from "../../../api/employeeAPI";
import machineMasterAPI from "../../../api/Production/machineMasterAPI";

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
          {(options || []).map((opt) => {
            const isObj = opt && typeof opt === "object";
            const optValue = isObj ? opt.value : opt;
            const optLabel = isObj ? opt.label ?? optValue : opt;
            return (
              <option key={optValue ?? opt} value={optValue ?? opt}>
                {optLabel}
              </option>
            );
          })}
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
                    {(col.options || []).map((opt) => {
                      const isObj = opt && typeof opt === "object";
                      const optValue = isObj ? opt.value : opt;
                      const optLabel = isObj ? opt.label ?? optValue : opt;
                      return (
                        <option key={optValue ?? opt} value={optValue ?? opt}>
                          {optLabel}
                        </option>
                      );
                    })}
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
                  className={cellInputClasses}
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

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");

const emptyDetailRow = () => ({
  dateOfCalibration: fmtDate(dayjs()),
  frequency: "",
  nextScheduleDate: "",
});

/* ---------------------------------------------------------------------------- */
/* Instrument Calibration Form                                                    */

const InstrumentCalibrationForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId")) || 0;
const branch = Number(localStorage.getItem("branchId")) || 0;
  const employeeName = localStorage.getItem("employeeName") || "admin";
  const financialYear =
    localStorage.getItem("finYear") || String(dayjs().year());

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const orgName = (
    userData?.companyVO?.companyName ||
    userData?.orgName ||
    ""
  ).trim();
  const isMacurex = ["mecurex", "macurex"].includes(orgName.toLowerCase());

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  /* ---------- Header state ---------- */
  const [header, setHeader] = useState(() => {
    return {
      plantId: data?.branch?.id ?? data?.plantId ?? "",
      department: data?.department?.id ?? data?.department ?? "",
      checkedBy: data?.checkedBy?.employeeId ?? data?.checkedBy ?? "",
      machineInstrument:
        data?.machineInstNo?.id ?? data?.machineInstrument ?? "",
      machineInstrumentNo:
        data?.selectMachineInstNo ??
        data?.machineInstNo?.machineInstrumentNo ??
        data?.machineInstrumentNo ??
        "",
      location:
        data?.location?.locationName ?? data?.location ?? "",
      locationId:
        typeof data?.location === "object"
          ? data?.location?.id
          : Number(data?.location) || 0,
      calibrationAgency: data?.calibrationAgency || "",
      certificateNo: data?.certificateNo || "",
      approvedBy: data?.approvedBy?.employeeId ?? data?.approvedBy ?? "",
    };
  });

  const [detailRows, setDetailRows] = useState(() => {
    const raw =
      data?.instrumentCalibrationDetailsResponseDTO ||
      data?.calibrationDetails ||
      data?.details ||
      [];
    if (raw.length) {
      return raw.map((item) => ({
        dateOfCalibration: fmtDate(item.dateOfCalibration),
        frequency: item.frequency?.id ?? item.frequency ?? "",
        nextScheduleDate: fmtDate(item.nextScheduleDate),
      }));
    }
    return [emptyDetailRow()];
  });

  /* ---------- Lookup loading ---------- */

  const [plantOptions, setPlantOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [machineTypeOptions, setMachineTypeOptions] = useState([]);
  const [machineListOptions, setMachineListOptions] = useState([]);
  const [agencyOptions, setAgencyOptions] = useState([]);
  const [frequencyOptions, setFrequencyOptions] = useState([]);

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
      const res = await departmentAPI.getAllDepartments(orgId);
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
  }, [orgId]);

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

  const loadMachineTypes = useCallback(async () => {
    try {
      const res = await machineMasterAPI.getMachineMaster(orgId, branch);
      const machines =
        res?.paramObjectsMap?.machineMasterResponseVO || [];
      setMachineTypeOptions(
        (machines || [])
          .filter((m) => m?.type?.id != null)
          .map((m) => ({
            value: m.id,
            label: m.type.code || m.type.description || String(m.type.id),
          })),
      );
    } catch (error) {
      console.error("Failed to load machine/instrument types:", error);
      setMachineTypeOptions([]);
    }
  }, [orgId, branch]);

  const loadMachines = useCallback(async () => {
    if (!header.machineInstrument) {
      setMachineListOptions([]);
      return;
    }
    try {
      const res = await instrumentCalibrationAPI.getMachineNo(
        header.machineInstrument,
        branch,
        orgId,
      );
      setMachineListOptions(
        (res || []).map((m) => {
          const machineNo =
            m.machineInstrumentNo || m.machineNo || String(m.id);
          return {
            value: machineNo,
            label: `${machineNo}${
              m.machineInstrumentName || m.machineName
                ? ` - ${m.machineInstrumentName || m.machineName}`
                : ""
            }`,
locationId: (m.location?.id ?? m.locationId) || Number(m.location) || 0,
            locationName: m.location?.locationName || m.locationName || "",
          };
        }),
      );
    } catch (error) {
      console.error("Failed to load machine/instrument options:", error);
      setMachineListOptions([]);
    }
  }, [orgId, branch, header.machineInstrument]);

  const loadAgencies = useCallback(async () => {
    try {
      const res = await locationMasterAPI.getListValuesGroup(
        "Instrument Calibration Agency",
        orgId,
      );
      setAgencyOptions(
        (res || []).map((v) => ({
          value: v.valuesDescription,
          label: v.valuesDescription || v.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load calibration agency options:", error);
      setAgencyOptions([]);
    }
  }, [orgId]);

  const loadFrequencies = useCallback(async () => {
    try {
      const res = await locationMasterAPI.getListValuesGroup(
        "Instrument calibration frequency",
        orgId,
      );
      setFrequencyOptions(
        (res || []).map((v) => ({
          value: v.id,
          label: v.valuesDescription || v.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load frequency options:", error);
      setFrequencyOptions([]);
    }
  }, [orgId]);

  useEffect(() => {
    if (orgId) loadPlants();
  }, [orgId, loadPlants]);

  useEffect(() => {
    if (orgId) {
      loadDepartments();
      loadEmployees();
      loadMachineTypes();
      loadAgencies();
      loadFrequencies();
    }
  }, [orgId, loadDepartments, loadEmployees, loadMachineTypes, loadAgencies, loadFrequencies]);

  useEffect(() => {
    if (header.machineInstrument) loadMachines();
  }, [header.machineInstrument, loadMachines]);

  /* ---------------------------------------------------------------------------- */
  /* Handlers                                                                     */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "plantId") {
        next.machineInstrumentNo = "";
        next.location = "";
        next.locationId = 0;
      }
      if (name === "machineInstrument") {
        next.machineInstrumentNo = "";
        next.location = "";
        next.locationId = 0;
      }
      if (name === "machineInstrumentNo") {
        const machine = machineListOptions.find(
          (m) => String(m.value) === String(value),
        );
        next.location = machine?.locationName || "";
        next.locationId = machine?.locationId || 0;
      }
      return next;
    });
  };

  const handleCellChange = (idx, key, value) => {
    setDetailRows((prev) =>
      prev.map((row, i) => (i !== idx ? row : { ...row, [key]: value })),
    );
  };

  const handleAddRow = () =>
    setDetailRows((prev) => [...prev, emptyDetailRow()]);

  const handleRemoveRow = (idx) =>
    setDetailRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx),
    );

  /* ---------------------------------------------------------------------------- */
  /* Validation & Save                                                            */

  const validate = () => {
    const errors = {};

    if (!header.plantId) errors.plantId = "Plant is required";
    if (!header.department) errors.department = "Department is required";
    if (!header.checkedBy) errors.checkedBy = "Checked By is required";
    if (!header.machineInstrument)
      errors.machineInstrument = "Machine/Instrument is required";
    if (!header.machineInstrumentNo?.trim())
      errors.machineInstrumentNo = "Machine/Instrument No is required";
    if (!header.location && !header.locationId)
      errors.location = "Location is required";
    if (!header.calibrationAgency?.trim())
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

    const errorKeys = Object.keys(errors);
    if (errorKeys.length) {
      setFieldErrors(errors);
      addToast(errors[errorKeys[0]], "error");
      return false;
    }

    setFieldErrors({});
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);

    const payload = {
      ...(isUpdate ? { id: data.id } : {}),
      active: true,
      approvedBy: Number(header.approvedBy),
      branch: Number(header.plantId),
      calibrationAgency: header.calibrationAgency,
      cancelRemarks: "",
      certificateNo: header.certificateNo,
      checkedBy: Number(header.checkedBy),
      createdBy: employeeName,
      department: Number(header.department),
      financialYear,
      instrumentCalibrationDetailsDTO: detailRows
        .filter((r) => r.dateOfCalibration || r.frequency)
        .map((r) => ({
          dateOfCalibration: r.dateOfCalibration,
          frequency: Number(r.frequency) || 0,
          nextScheduleDate: r.nextScheduleDate,
        })),
      location: Number(header.locationId) || Number(header.location) || 0,
      machineInstNo: Number(header.machineInstrument),
      orgId,
      selectMachineInstNo: header.machineInstrumentNo,
      ...(isUpdate ? { updatedBy: employeeName } : {}),
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

  const machineNoOptions = machineListOptions.map((m) => ({
    value: m.value,
    label: m.label,
  }));
  if (
    header.machineInstrumentNo &&
    !machineNoOptions.some(
      (o) => String(o.value) === String(header.machineInstrumentNo),
    )
  ) {
    machineNoOptions.unshift({
      value: header.machineInstrumentNo,
      label: header.machineInstrumentNo,
    });
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
              label="Plant"
              name="plantId"
              value={header.plantId}
              onChange={handleHeaderChange}
              error={fieldErrors.plantId}
              options={plantOptions}
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
              options={machineTypeOptions}
              required
            />
            <Field
              type="select"
              label="Machine/Instrument No"
              name="machineInstrumentNo"
              value={header.machineInstrumentNo}
              onChange={handleHeaderChange}
              error={fieldErrors.machineInstrumentNo}
              options={machineNoOptions}
              required
            />
            <Field
              label="Location"
              name="location"
              value={header.location}
              onChange={handleHeaderChange}
              error={fieldErrors.location}
              placeholder="Auto-filled from Machine/Instrument No"
            />
            <Field
              type="select"
              label="Calibration Agency"
              name="calibrationAgency"
              value={header.calibrationAgency}
              onChange={handleHeaderChange}
              error={fieldErrors.calibrationAgency}
              options={agencyOptions}
              placeholder="e.g. ABC Calibration Services Pvt Ltd"
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

        {/* ---------------- Calibration Details ---------------- */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-0">
            <SectionHeader>Calibration Details</SectionHeader>
            <button
              type="button"
              onClick={handleAddRow}
              className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>

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
                  options: frequencyOptions,
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
          </div>
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
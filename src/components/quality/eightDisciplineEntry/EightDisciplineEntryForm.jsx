import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";
import eightDisciplineEntryAPI from "../../../api/quality/eightDisciplineEntryAPI";
import { customerComplaintAPI } from "../../../api/Sales/customerComplaintAPI";
import partyMasterAPI from "../../../api/partyMasterAPI";
import { employeeAPI } from "../../../api/employeeAPI";
import { departmentAPI } from "../../../api/departmentAPI";

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

const cellReadOnlyClasses =
  "w-full h-8 px-2 rounded border text-xs leading-none " +
  "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 " +
  "text-gray-500 dark:text-gray-400";

const labelClasses = "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

// Spacious grid for the header section so fields breathe.
const fieldGrid =
  "grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-x-5 gap-y-4 items-start";

const subTabFieldGrid =
  "grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-x-5 gap-y-4 items-start";

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
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <X className="h-3 w-3" />
      Cancel
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

/* Generic dynamic table. Supports text / number / email / date / select /
   textarea / readonly columns. Options may be plain strings or { value, label }. */
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
                      "w-44 h-8 px-2 rounded border text-xs leading-none transition-colors resize-none pt-1 scrollbar-hide " +
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
                        : col.type === "email"
                          ? "email"
                          : "text"
                  }
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

const COMPLAINT_TYPES = [
  "Customer Complaint",
  "Internal Complaint",
  "Supplier Complaint",
  "Field Failure",
];

const YES_NO = ["Yes", "No"];

const CHILD_TABS = [
  { key: "discipline1", label: "Discipline 1" },
  { key: "discipline2", label: "Discipline 2" },
  { key: "discipline3", label: "Discipline 3" },
  { key: "discipline4", label: "Discipline 4" },
  { key: "discipline5", label: "Discipline 5" },
  { key: "discipline6", label: "Discipline 6" },
  { key: "discipline7", label: "Discipline 7" },
  { key: "discipline8", label: "Discipline 8" },
  { key: "summary", label: "Summary" },
];

const TABLE_TABS = [
  "discipline1",
  "discipline2",
  "discipline3",
  "discipline4",
  "discipline5",
  "discipline6",
  "discipline7",
];

const emptyTeamRow = () => ({
  teamRole: "",
  name: "",
  department: "",
  phone: "",
  emailId: "",
});

const emptyProblemRow = () => ({
  problem: "",
  dateOfComplaint: "",
  repeatDiscrepancy: "",
  previousGDControlNo: "",
  date: "",
  reason: "",
});

const emptyContainmentRow = () => ({
  interimContainmentAction: "",
  responsiblePerson: "",
  dateImplemented: "",
  responsibility: "",
});

const emptyRootCauseRow = () => ({
  why1: "",
  why2: "",
  why3: "",
  why4: "",
  why5: "",
  how: "",
  correctiveAction: "",
  preventiveAction: "",
  rootCauseNonConformity: "",
});

const emptyPermanentRow = () => ({
  permanentCorrectiveAction: "",
  responsiblePerson: "",
  dateImplemented: "",
});

const emptyVerificationRow = () => ({
  verificationAction: "",
  responsiblePerson: "",
  verificationDate: "",
});

const emptyPreventRecurrenceRow = () => ({
  preventRecurrenceAction: "",
  responsiblePerson: "",
  responsibility: "",
});

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");

const generateGDControlNo = () =>
  `GD-${dayjs().format("YYYYMMDD")}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;

/* ---------------------------------------------------------------------------- */

const EightDisciplineEntryForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId")) || 0;
  const branch = Number(localStorage.getItem("branchId")) || 0;
  const usersId = localStorage.getItem("usersId");

  const [activeTab, setActiveTab] = useState("discipline1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [complaintOptions, setComplaintOptions] = useState([]);
  const [complaintMap, setComplaintMap] = useState({});
  const [departmentOptions, setDepartmentOptions] = useState([]);

  const [header, setHeader] = useState(() => {
    const base = {
      complaintType: data?.complaintType || "",
      gdControlNo: data?.gdControlNo || (data ? "" : generateGDControlNo()),
      date: data?.date || dayjs().format("YYYY-MM-DD"),
      customerCode: data?.customerCode?.id ?? data?.customerCode ?? "",
      complaintNo: data?.complaintNo || "",
      customerName: data?.customerName || "",
      itemCode: data?.itemCode || "",
      itemDescription: data?.itemDescription || "",
      rootCauseNo: data?.rootCauseNo || "",
      dateOpened: data?.dateOpened || dayjs().format("YYYY-MM-DD"),
      targetDate: data?.targetDate || "",
      closedDate: data?.closedDate || "",
      reportedBy: data?.reportedBy?.id ?? data?.reportedBy ?? "",
    };
    base.date = fmtDate(base.date);
    base.dateOpened = fmtDate(base.dateOpened);
    base.targetDate = fmtDate(base.targetDate);
    base.closedDate = fmtDate(base.closedDate);
    return base;
  });

  const [teamRows, setTeamRows] = useState(
    data?.discipline1?.length ? data.discipline1 : [emptyTeamRow()],
  );

  const [problemRows, setProblemRows] = useState(
    data?.discipline2?.length ? data.discipline2 : [emptyProblemRow()],
  );

  const [containmentRows, setContainmentRows] = useState(
    data?.discipline3?.length ? data.discipline3 : [emptyContainmentRow()],
  );

  const [rootCauseRows, setRootCauseRows] = useState(
    data?.discipline4?.length ? data.discipline4 : [emptyRootCauseRow()],
  );

  const [permanentRows, setPermanentRows] = useState(
    data?.discipline5?.length ? data.discipline5 : [emptyPermanentRow()],
  );

  const [verificationRows, setVerificationRows] = useState(
    data?.discipline6?.length ? data.discipline6 : [emptyVerificationRow()],
  );

  const [preventRows, setPreventRows] = useState(
    data?.discipline7?.length ? data.discipline7 : [emptyPreventRecurrenceRow()],
  );

  const [discipline8, setDiscipline8] = useState({
    recognition: data?.discipline8?.recognition || "",
    closedDate: fmtDate(data?.discipline8?.closedDate),
    reportedBy:
      data?.discipline8?.reportedBy?.id ?? data?.discipline8?.reportedBy ?? "",
  });

  const [summary, setSummary] = useState({
    remarks: data?.summary?.remarks || "",
    overallSummary: data?.summary?.overallSummary || "",
  });

  /* ---------------- Lookup loading ---------------- */

  const loadEmployees = useCallback(async () => {
    try {
      const res = await employeeAPI.getEmployeeByOrgId(orgId);
      setEmployeeOptions(
        (res || []).map((e) => ({
          value: e.id,
          label: e.employeeName || e.name || e.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load employee options:", error);
      setEmployeeOptions([]);
    }
  }, [orgId]);

  const loadCustomers = useCallback(async () => {
    try {
      const res = await partyMasterAPI.getPartyByOrgId(orgId, branch);
      setCustomerOptions(
        (res || []).map((c) => ({
          value: c.customerCode || c.docId || c.id,
          label: c.customerCode || c.docId || c.id,
          customerName: c.customerName || "",
        })),
      );
    } catch (error) {
      console.error("Failed to load customer options:", error);
      setCustomerOptions([]);
    }
  }, [orgId, branch]);

  const loadComplaints = useCallback(async () => {
    try {
      const res = await customerComplaintAPI.getComplaintByOrgId(orgId, branch);
      const map = {};
      const opts = (res || []).map((c) => {
        map[c.complaintNo] = c;
        return {
          value: c.complaintNo,
          label: c.complaintNo,
        };
      });
      setComplaintOptions(opts);
      setComplaintMap(map);
    } catch (error) {
      console.error("Failed to load complaint options:", error);
      setComplaintOptions([]);
      setComplaintMap({});
    }
  }, [orgId, branch]);

  const loadDepartments = useCallback(async () => {
    try {
      const res = await departmentAPI.getAllDepartments(orgId);
      const departments = res?.paramObjectsMap?.departmentVO || [];
      setDepartmentOptions(
        departments.map((d) => ({ value: d.id, label: d.departmentName })),
      );
    } catch (error) {
      console.error("Failed to load department options:", error);
      setDepartmentOptions([]);
    }
  }, [orgId, branch]);

  useEffect(() => {
    if (orgId) {
      loadEmployees();
      loadCustomers();
      loadComplaints();
      loadDepartments();
    }
  }, [orgId, loadEmployees, loadCustomers, loadComplaints, loadDepartments]);

  /* ---------------- Handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "customerCode") {
        const cust = customerOptions.find(
          (c) => String(c.value) === String(value),
        );
        next.customerName = cust?.customerName || "";
      }

      if (name === "complaintNo") {
        const complaint = complaintMap[value];
        if (complaint) {
          next.customerName = next.customerName || complaint.customerName;
          if (
            typeof complaint.customer === "object" &&
            complaint.customer.customerCode
          ) {
            next.customerCode = complaint.customer.customerCode;
          } else if (complaint.customerCode) {
            next.customerCode = complaint.customerCode;
          }
          if (typeof complaint.item === "object") {
            next.itemCode = complaint.item.itemCode || "";
            next.itemDescription = complaint.item.itemDescription || "";
          } else if (complaint.itemCode) {
            next.itemCode = complaint.itemCode;
            next.itemDescription = complaint.itemDescription || "";
          }
          if (complaint.complaintType) next.complaintType = complaint.complaintType;
        }
      }

      return next;
    });
  };

  const handleCellChange = (setter) => (idx, key, value) => {
    setter((prev) =>
      prev.map((row, i) => (i !== idx ? row : { ...row, [key]: value })),
    );
  };

  const handleAddRow = (setter) => {
    const emptyRow =
      activeTab === "discipline1"
        ? emptyTeamRow()
        : activeTab === "discipline2"
          ? emptyProblemRow()
          : activeTab === "discipline3"
            ? emptyContainmentRow()
            : activeTab === "discipline4"
              ? emptyRootCauseRow()
              : activeTab === "discipline5"
                ? emptyPermanentRow()
                : activeTab === "discipline6"
                  ? emptyVerificationRow()
                  : emptyPreventRecurrenceRow();
    setter((prev) => [...prev, emptyRow]);
  };

  const handleRemoveRow = (setter) => (idx) =>
    setter((prev) => prev.filter((_, i) => i !== idx));

  const handleDiscipline8Change = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setDiscipline8((prev) => ({ ...prev, [name]: value }));
  };

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setSummary((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------- Validation & Save ---------------- */

  const validate = () => {
    const errors = {};

    if (!header.complaintType)
      errors.complaintType = "Complaint Type is required";
    if (!header.gdControlNo?.trim())
      errors.gdControlNo = "GD Control No is required";
    if (!header.date) errors.date = "Date is required";
    if (!header.customerCode) errors.customerCode = "Customer Code is required";
    if (!header.complaintNo) errors.complaintNo = "Complaint No is required";
    if (!header.rootCauseNo) errors.rootCauseNo = "Root Cause No is required";

    // Discipline 2: Problem is mandatory in every row
    problemRows.forEach((r, i) => {
      if (!r.problem?.trim())
        errors[`discipline2.${i}.problem`] = "Problem is required";
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);

    // Single-transaction payload: header + all discipline tabs + summary.
    const payload = {
      ...(isUpdate ? { id: data.id } : {}),
      orgId,
      branch,
      ...header,
      discipline1: teamRows,
      discipline2: problemRows,
      discipline3: containmentRows,
      discipline4: rootCauseRows,
      discipline5: permanentRows,
      discipline6: verificationRows,
      discipline7: preventRows,
      discipline8,
      summary,
      createdBy: isUpdate ? data?.createdBy || usersId : usersId,
      ...(isUpdate ? { updatedBy: usersId } : {}),
    };

    try {
      const response =
        await eightDisciplineEntryAPI.createUpdateEightDiscipline(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "8-Discipline Entry updated successfully!"
              : "8-Discipline Entry created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            response?.paramObjectsMap?.message ||
            "Failed to save 8-Discipline Entry.",
        );
      }
    } catch (err) {
      console.error("Save 8-Discipline Entry Error:", err);
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

  const canAddRow = TABLE_TABS.includes(activeTab);

  const renderActiveTab = () => {
    switch (activeTab) {
      case "discipline1":
        return (
          <div className="pt-3">
            <SectionHeader>Discipline 1: Team Formation</SectionHeader>
            <DynamicTable
              columns={[
                { key: "teamRole", label: "Team Role" },
                { key: "name", label: "Name" },
                {
                  key: "department",
                  label: "Department",
                  type: "select",
                  options: departmentOptions,
                },
                { key: "phone", label: "Phone", type: "number" },
                { key: "emailId", label: "Email ID", type: "email" },
              ]}
              rows={teamRows}
              onCellChange={handleCellChange(setTeamRows)}
              onRemoveRow={handleRemoveRow(setTeamRows)}
            />
          </div>
        );

      case "discipline2":
        return (
          <div className="pt-3">
            <SectionHeader>Discipline 2: Problem Description</SectionHeader>
            <DynamicTable
              columns={[
                { key: "problem", label: "Problem", type: "textarea" },
                { key: "dateOfComplaint", label: "Date of Complaint", type: "date" },
                {
                  key: "repeatDiscrepancy",
                  label: "Repeat Discrepancy?",
                  type: "select",
                  options: YES_NO,
                },
                { key: "previousGDControlNo", label: "Previous GD Control No" },
                { key: "date", label: "Date", type: "date" },
                { key: "reason", label: "Reason", type: "textarea" },
              ]}
              rows={problemRows}
              onCellChange={handleCellChange(setProblemRows)}
              onRemoveRow={handleRemoveRow(setProblemRows)}
            />
            {problemRows.some((r, i) => fieldErrors[`discipline2.${i}.problem`]) && (
              <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                Problem is required in every row
              </p>
            )}
          </div>
        );

      case "discipline3":
        return (
          <div className="pt-3">
            <SectionHeader>Discipline 3: Interim Containment Actions</SectionHeader>
            <DynamicTable
              columns={[
                {
                  key: "interimContainmentAction",
                  label: "Interim Containment Action",
                  type: "textarea",
                },
                {
                  key: "responsiblePerson",
                  label: "Responsible Person Name",
                  type: "select",
                  options: employeeOptions,
                },
                { key: "dateImplemented", label: "Date Implemented", type: "date" },
                { key: "responsibility", label: "Responsibility" },
              ]}
              rows={containmentRows}
              onCellChange={handleCellChange(setContainmentRows)}
              onRemoveRow={handleRemoveRow(setContainmentRows)}
            />
          </div>
        );

      case "discipline4":
        return (
          <div className="pt-3">
            <SectionHeader>Discipline 4: Root Cause Analysis</SectionHeader>
            <DynamicTable
              columns={[
                { key: "why1", label: "Why 1" },
                { key: "why2", label: "Why 2" },
                { key: "why3", label: "Why 3" },
                { key: "why4", label: "Why 4" },
                { key: "why5", label: "Why 5" },
                { key: "how", label: "How" },
                { key: "correctiveAction", label: "Corrective Action", type: "textarea" },
                { key: "preventiveAction", label: "Preventive Action", type: "textarea" },
                {
                  key: "rootCauseNonConformity",
                  label: "Root Cause for Non-Conformity",
                  type: "textarea",
                },
              ]}
              rows={rootCauseRows}
              onCellChange={handleCellChange(setRootCauseRows)}
              onRemoveRow={handleRemoveRow(setRootCauseRows)}
            />
          </div>
        );

      case "discipline5":
        return (
          <div className="pt-3">
            <SectionHeader>Discipline 5: Permanent Corrective Actions</SectionHeader>
            <DynamicTable
              columns={[
                {
                  key: "permanentCorrectiveAction",
                  label: "Permanent Corrective Action",
                  type: "textarea",
                },
                {
                  key: "responsiblePerson",
                  label: "Responsible Person Name",
                  type: "select",
                  options: employeeOptions,
                },
                { key: "dateImplemented", label: "Date Implemented", type: "date" },
              ]}
              rows={permanentRows}
              onCellChange={handleCellChange(setPermanentRows)}
              onRemoveRow={handleRemoveRow(setPermanentRows)}
            />
          </div>
        );

      case "discipline6":
        return (
          <div className="pt-3">
            <SectionHeader>Discipline 6: Verification of Corrective Actions</SectionHeader>
            <DynamicTable
              columns={[
                {
                  key: "verificationAction",
                  label: "Verification of Corrective Action",
                  type: "textarea",
                },
                {
                  key: "responsiblePerson",
                  label: "Responsible Person Name",
                  type: "select",
                  options: employeeOptions,
                },
                { key: "verificationDate", label: "Verification Date", type: "date" },
              ]}
              rows={verificationRows}
              onCellChange={handleCellChange(setVerificationRows)}
              onRemoveRow={handleRemoveRow(setVerificationRows)}
            />
          </div>
        );

      case "discipline7":
        return (
          <div className="pt-3">
            <SectionHeader>Discipline 7: Prevent Recurrence</SectionHeader>
            <DynamicTable
              columns={[
                {
                  key: "preventRecurrenceAction",
                  label: "Action to Prevent Recurrence",
                  type: "textarea",
                },
                {
                  key: "responsiblePerson",
                  label: "Responsible Person Name",
                  type: "select",
                  options: employeeOptions,
                },
                { key: "responsibility", label: "Responsibility" },
              ]}
              rows={preventRows}
              onCellChange={handleCellChange(setPreventRows)}
              onRemoveRow={handleRemoveRow(setPreventRows)}
            />
          </div>
        );

      case "discipline8":
        return (
          <div className="pt-3">
            <SectionHeader>Discipline 8: Team & Individual Recognition</SectionHeader>
            <div className={subTabFieldGrid}>
              <Field
                type="textarea"
                label="Team and Individual Recognition"
                name="recognition"
                value={discipline8.recognition}
                onChange={handleDiscipline8Change}
              />
              <Field
                type="date"
                label="Closed Date"
                name="closedDate"
                value={discipline8.closedDate}
                onChange={handleDiscipline8Change}
              />
              <Field
                type="select"
                label="Reported By"
                name="reportedBy"
                value={discipline8.reportedBy}
                onChange={handleDiscipline8Change}
                options={employeeOptions}
              />
            </div>
          </div>
        );

      case "summary":
        return (
          <div className="pt-3">
            <SectionHeader>Summary</SectionHeader>
            <div className={subTabFieldGrid}>
              <Field
                type="textarea"
                label="Remarks"
                name="remarks"
                value={summary.remarks}
                onChange={handleSummaryChange}
              />
              <Field
                type="textarea"
                label="Overall Summary"
                name="overallSummary"
                value={summary.overallSummary}
                onChange={handleSummaryChange}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

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
          {data ? "Edit 8-Discipline Entry" : "Add 8-Discipline Entry"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Info ---------------- */}
        <div>
          <SectionHeader>8-Discipline Entry</SectionHeader>
          <div className={fieldGrid}>
            <Field
              type="select"
              label="Complaint Type"
              name="complaintType"
              value={header.complaintType}
              onChange={handleHeaderChange}
              error={fieldErrors.complaintType}
              options={COMPLAINT_TYPES}
              required
            />
            <Field
              label="GD Control No"
              name="gdControlNo"
              value={header.gdControlNo}
              onChange={handleHeaderChange}
              error={fieldErrors.gdControlNo}
              required
              disabled={!data}
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
              label="Customer Code"
              name="customerCode"
              value={header.customerCode}
              onChange={handleHeaderChange}
              error={fieldErrors.customerCode}
              options={customerOptions}
              required
            />
            <Field
              type="select"
              label="Complaint No"
              name="complaintNo"
              value={header.complaintNo}
              onChange={handleHeaderChange}
              error={fieldErrors.complaintNo}
              options={complaintOptions}
              required
            />
            <Field
              label="Customer Name"
              name="customerName"
              value={header.customerName}
              onChange={handleHeaderChange}
            />
            <Field
              label="Item Code"
              name="itemCode"
              value={header.itemCode}
              onChange={handleHeaderChange}
            />
            <Field
              label="Item Description"
              name="itemDescription"
              value={header.itemDescription}
              onChange={handleHeaderChange}
            />
            <Field
              label="Root Cause No"
              name="rootCauseNo"
              value={header.rootCauseNo}
              onChange={handleHeaderChange}
              error={fieldErrors.rootCauseNo}
              required
            />
            <Field
              type="date"
              label="Date Opened"
              name="dateOpened"
              value={header.dateOpened}
              onChange={handleHeaderChange}
            />
            <Field
              type="date"
              label="Target Date"
              name="targetDate"
              value={header.targetDate}
              onChange={handleHeaderChange}
            />
            <Field
              type="date"
              label="Closed Date"
              name="closedDate"
              value={header.closedDate}
              onChange={handleHeaderChange}
            />
            <Field
              type="select"
              label="Reported By"
              name="reportedBy"
              value={header.reportedBy}
              onChange={handleHeaderChange}
              options={employeeOptions}
            />
          </div>
        </div>

        {/* ---------------- Discipline Tabs ---------------- */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-0">
            <div className="flex flex-wrap">
              {CHILD_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-1 text-xs font-semibold rounded-t whitespace-nowrap ${
                    activeTab === tab.key
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {canAddRow && (
              <button
                type="button"
                onClick={() => {
                  const setter =
                    activeTab === "discipline1"
                      ? setTeamRows
                      : activeTab === "discipline2"
                        ? setProblemRows
                        : activeTab === "discipline3"
                          ? setContainmentRows
                          : activeTab === "discipline4"
                            ? setRootCauseRows
                            : activeTab === "discipline5"
                              ? setPermanentRows
                              : activeTab === "discipline6"
                                ? setVerificationRows
                                : setPreventRows;
                  handleAddRow(setter);
                }}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {renderActiveTab()}
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

export default EightDisciplineEntryForm;

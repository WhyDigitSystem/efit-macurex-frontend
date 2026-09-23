import { ArrowLeft, Save, X } from "lucide-react";
import { useEffect, useState } from "react";

import branchAPI from "../../../api/branchAPI";
import { departmentAPI } from "../../../api/departmentAPI";
import docTypeMappingAPI from "../../../api/docTypeMappingAPI";
import machineToolRectificationAPI from "../../../api/machineToolRectificationAPI";

/* ---------------------------------------------------------------------------- */
/* Shared design tokens - identical to other Maintenance/Quality forms         */

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-2 items-start";

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
  disabled,
  className = "",
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
          className={controlClasses}
        >
          <option value="">-- Select --</option>
          {(options || []).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
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
            "w-full px-2 py-1.5 rounded border text-xs leading-snug transition-colors resize-none " +
            "bg-white dark:bg-gray-900 " +
            "border-gray-300 dark:border-gray-600 " +
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
        className={controlClasses}
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

const todayISO = () => new Date().toISOString().slice(0, 10);

/* Doc-type-mapping screenCode used to find the finYear for doc-id generation.
   UNCONFIRMED - guessed as "MTR" from the sample docId "BLR/MTR/2026-2027/00003",
   same way "PTS" was guessed for Production Transfer Slip. Verify against the
   real documentTypeMappingDetails rows before relying on this in production. */
const SCREEN_CODE = "MTR";

/* Blank header shape mirrors the flat updateCreateMachineToolRectification DTO,
   plus a few UI-only fields (rectifiedOn, breakdownNo selection) that get
   mapped into the DTO on submit. */
const blankHeader = () => ({
  branch: "",
  docNo: "", // UI-only: NOT present in the confirmed DTO - see note in handleSave
  department: "",
  date: todayISO(),
  breakdownNo: "",
  breakdownDate: "",
  attendBy: "",
  time: "",
  rectifiedOn: "",
  machineToolNo: "",
  rectificationTimeInput: "", // UI time input, combined with rectifiedOn -> DTO rectificationTime
  description: "",
  cause: "",
  maintenanceType: "",
  actionTaken: "",
  natureOfProblem: "",
  carriedOutBy: "",
  timeTakenForRectification: "",
  sparesUsed: "",
  location: "",
  preparedBy: "",
  remarks: "",
  approvedBy: "",
});

const MachineToolRectificationForm = ({ onBack, onSave, editData }) => {
  const ORG_ID = parseInt(localStorage.getItem("orgId"), 10);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [branchOptions, setBranchOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [breakdownOptions, setBreakdownOptions] = useState([]);

  const [header, setHeader] = useState({
    ...blankHeader(),
    ...editData?.header,
  });

  /* ---------------------------------------------------------------- */
  /* Load branch + department dropdowns once                          */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (!ORG_ID) return;

    branchAPI
      .getBranchByOrgId(ORG_ID)
      .then((list) =>
        setBranchOptions(
          (list || []).map((b) => ({ value: b.id, label: b.branchName })),
        ),
      )
      .catch((error) => {
        console.error("Failed to load branch list:", error);
        setBranchOptions([]);
      });

    departmentAPI
      .getAllDepartments(ORG_ID)
      .then((res) => {
        // departmentAPI.getAllDepartments returns the raw response envelope
        // in this project (not a pre-unwrapped array) - pull the list out
        // ourselves, tolerating either shape just in case.
        const list = Array.isArray(res)
          ? res
          : res?.paramObjectsMap?.departmentVO ||
            res?.paramObjectsMap?.departmentMasterVO ||
            res?.paramObjectsMap?.departmentList ||
            res?.paramObjectsMap?.department ||
            [];

        setDepartmentOptions(
          list.map((d) => ({
            value: d.id,
            label: d.departmentName,
          })),
        );
      })
      .catch((error) => {
        console.error("Failed to load department list:", error);
        setDepartmentOptions([]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ORG_ID]);

  /* ---------------------------------------------------------------- */
  /* Breakdown list depends on branch                                  */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (!ORG_ID || !header.branch) {
      setBreakdownOptions([]);
      return;
    }

    machineToolRectificationAPI
      .getBreakdownDetails(header.branch, ORG_ID)
      .then((list) => setBreakdownOptions(list || []))
      .catch(() => setBreakdownOptions([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ORG_ID, header.branch]);

  /* ---------------------------------------------------------------- */
  /* Employee list (Attend by / Carried Out By / Prepared By /         */
  /* Approved By all share this one branch+department filtered list)   */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (!ORG_ID || !header.branch || !header.department) {
      setEmployeeOptions([]);
      return;
    }

    machineToolRectificationAPI
      .getPrepareBy(header.branch, header.department, ORG_ID)
      .then((list) =>
        setEmployeeOptions(
          (list || []).map((e) => ({ value: e.id, label: e.name })),
        ),
      )
      .catch(() => setEmployeeOptions([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ORG_ID, header.branch, header.department]);

  /* ---------------------------------------------------------------- */
  /* Doc No. generation - new records only, needs branch selected      */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (editData?.id) return; // never regenerate on edit
    if (!ORG_ID || !header.branch) return;

    (async () => {
      try {
        const mappingList =
          await docTypeMappingAPI.getDocumentTypeMappingByOrgId(
            ORG_ID,
            header.branch,
          );
        const mapping = mappingList?.[0];
        const detail = mapping?.documentTypeMappingDetails?.find(
          (d) => d.screenCode === SCREEN_CODE,
        );
        const finYear = detail?.finYear;
        if (!finYear) return;

        const docId = await machineToolRectificationAPI.getDocId(
          finYear,
          ORG_ID,
        );
        setHeader((prev) => ({ ...prev, docNo: docId }));
      } catch (error) {
        console.error("Doc No. generation failed:", error);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ORG_ID, header.branch, editData?.id]);

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  /* Selecting a Breakdown No. auto-fills the related read-back fields  */
  const handleBreakdownSelect = (e) => {
    const id = e.target.value;
    const found = breakdownOptions.find((b) => String(b.id) === String(id));

    setHeader((prev) => ({
      ...prev,
      breakdownNo: found?.breakdownNo || "",
      machineToolNo: found?.machineToolNo || prev.machineToolNo,
      description: found?.description || prev.description,
      breakdownDate: found?.breakdownDate || prev.breakdownDate,
      time: found?.time || prev.time,
      maintenanceType: found?.maintenanceType || prev.maintenanceType,
      natureOfProblem: found?.natureOfProblem || prev.natureOfProblem,
      timeTakenForRectification:
        found?.timeTakenForRectification || prev.timeTakenForRectification,
      location: found?.location || prev.location,
    }));

    if (fieldErrors.breakdownNo) {
      setFieldErrors((prev) => ({ ...prev, breakdownNo: "" }));
    }
  };

  const validate = () => {
    const errors = {};

    if (!header.branch) errors.branch = "Plant ID is required";
    if (!header.date) errors.date = "Date is required";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    /* Combine Rectified On (date) + Rectification Time (time) into the
       single ISO rectificationTime datetime the DTO expects. */
    let rectificationTimeIso = editData?.rectificationTime || null;
    if (header.rectifiedOn) {
      const timePart = header.rectificationTimeInput || "00:00";
      rectificationTimeIso = new Date(
        `${header.rectifiedOn}T${timePart}:00`,
      ).toISOString();
    }

    /* NOTE: the confirmed updateCreateMachineToolRectification DTO has no
       docNo field - only breakdownNo. If the backend does persist a doc
       number for this screen it needs to be added to the DTO; until then
       docNo is generated/shown for display only and NOT sent. Flag this
       with the backend team if the doc number needs to be saved. */
    const payload = {
      ...(editData?.id && { id: editData.id }),
      branch: header.branch ? Number(header.branch) : null,
      department: header.department ? Number(header.department) : null,
      breakdownNo: header.breakdownNo,
      breakdownDate: header.breakdownDate,
      attendBy: header.attendBy ? Number(header.attendBy) : null,
      time: header.time,
      machineToolNo: header.machineToolNo,
      rectificationTime: rectificationTimeIso,
      description: header.description,
      cause: header.cause,
      maintenanceType: header.maintenanceType,
      actionTaken: header.actionTaken,
      natureOfProblem: header.natureOfProblem,
      carriedOutBy: header.carriedOutBy ? Number(header.carriedOutBy) : null,
      timeTakenForRectification: header.timeTakenForRectification,
      sparesUsed: header.sparesUsed,
      location: header.location,
      preparedBy: header.preparedBy ? Number(header.preparedBy) : null,
      remarks: header.remarks,
      approvedBy: header.approvedBy ? Number(header.approvedBy) : null,
      active: editData?.active ?? true,
      orgId: ORG_ID,
      financialYear:
        editData?.financialYear || String(new Date().getFullYear()),
      createdBy: localStorage.getItem("userName") || "SYSTEM",
    };

    try {
      const response =
        await machineToolRectificationAPI.updateCreateMachineToolRectification(
          payload,
        );

      const status = response?.status === true || response?.statusFlag === "Ok";

      if (status) {
        if (onSave) onSave(payload);
      } else {
        const errorMessage =
          response?.paramObjectsMap?.message ||
          response?.paramObjectsMap?.errorMessage ||
          response?.message ||
          "Failed to save machine/tool rectification";
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Save Error:", error);
      alert("Failed to save Machine/Tool Rectification.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-2 max-w-7xl">
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {editData
            ? "Edit Machine/Tool Rectification"
            : "Machine/Tool Rectification"}
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        <div>
          <SectionHeader>Rectification Details</SectionHeader>

          <div className={fieldGrid}>
            <Field
              type="select"
              label="Plant ID"
              name="branch"
              value={header.branch}
              onChange={handleHeaderChange}
              options={branchOptions}
              required
              error={fieldErrors.branch}
            />

            <Field
              label="Doc No."
              name="docNo"
              value={header.docNo || "Auto"}
              onChange={handleHeaderChange}
              disabled
            />

            <Field
              type="select"
              label="Department"
              name="department"
              value={header.department}
              onChange={handleHeaderChange}
              options={departmentOptions}
            />

            <Field
              type="date"
              label="Date"
              name="date"
              value={header.date}
              onChange={handleHeaderChange}
              required
              error={fieldErrors.date}
            />

            <Field
              type="select"
              label="Breakdown No."
              name="breakdownNo"
              value={
                breakdownOptions.find(
                  (b) => b.breakdownNo === header.breakdownNo,
                )?.id || ""
              }
              onChange={handleBreakdownSelect}
              options={breakdownOptions.map((b) => ({
                value: b.id,
                label: b.breakdownNo,
              }))}
              error={fieldErrors.breakdownNo}
            />

            <Field
              type="date"
              label="Breakdown Date"
              name="breakdownDate"
              value={header.breakdownDate}
              onChange={handleHeaderChange}
              disabled
            />

            <Field
              type="select"
              label="Attend by"
              name="attendBy"
              value={header.attendBy}
              onChange={handleHeaderChange}
              options={employeeOptions}
            />

            <Field
              label="Time"
              name="time"
              value={header.time}
              onChange={handleHeaderChange}
              disabled
            />

            <Field
              type="date"
              label="Rectified On"
              name="rectifiedOn"
              value={header.rectifiedOn}
              onChange={handleHeaderChange}
            />

            <Field
              label="Machine No. / Tool No."
              name="machineToolNo"
              value={header.machineToolNo}
              onChange={handleHeaderChange}
              disabled
            />

            <Field
              type="time"
              label="Rectification Time"
              name="rectificationTimeInput"
              value={header.rectificationTimeInput}
              onChange={handleHeaderChange}
            />

            <Field
              label="Description"
              name="description"
              value={header.description}
              onChange={handleHeaderChange}
              disabled
            />

            <Field
              label="Cause"
              name="cause"
              value={header.cause}
              onChange={handleHeaderChange}
            />

            <Field
              label="Maintenance Type"
              name="maintenanceType"
              value={header.maintenanceType}
              onChange={handleHeaderChange}
              disabled
            />

            <Field
              label="Action Taken"
              name="actionTaken"
              value={header.actionTaken}
              onChange={handleHeaderChange}
            />

            <Field
              label="Nature of Problem"
              name="natureOfProblem"
              value={header.natureOfProblem}
              onChange={handleHeaderChange}
            />

            <Field
              type="select"
              label="Carried Out By"
              name="carriedOutBy"
              value={header.carriedOutBy}
              onChange={handleHeaderChange}
              options={employeeOptions}
            />

            <Field
              label="Time Taken for Rectification"
              name="timeTakenForRectification"
              value={header.timeTakenForRectification}
              onChange={handleHeaderChange}
              disabled
            />

            <Field
              label="Spares Used"
              name="sparesUsed"
              value={header.sparesUsed}
              onChange={handleHeaderChange}
            />

            <Field
              label="Location"
              name="location"
              value={header.location}
              onChange={handleHeaderChange}
              disabled
            />

            <Field
              type="select"
              label="Prepared By"
              name="preparedBy"
              value={header.preparedBy}
              onChange={handleHeaderChange}
              options={employeeOptions}
            />

            <Field
              type="select"
              label="Approved By"
              name="approvedBy"
              value={header.approvedBy}
              onChange={handleHeaderChange}
              options={employeeOptions}
            />
            <Field
              type="textarea"
              label="Remarks"
              name="remarks"
              value={header.remarks}
              onChange={handleHeaderChange}
              className="col-span-2 md:col-span-4 xl:col-span-3"
            />
          </div>
        </div>

        <FormButtons
          onCancel={onBack}
          onSave={handleSave}
          isSubmitting={isSubmitting}
          saveLabel={editData ? "Update" : "Save"}
        />
      </div>
    </div>
  );
};

export default MachineToolRectificationForm;

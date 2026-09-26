import { ArrowLeft, Save, X } from "lucide-react";
import { useEffect, useState } from "react";

import branchAPI from "../../../api/branchAPI";
import { departmentAPI } from "../../../api/departmentAPI";
import machineToolRectificationAPI from "../../../api/machineToolRectificationAPI";

/* ---------------------------------------------------------------------------- */
/* Shared design tokens                                                         */
/* ---------------------------------------------------------------------------- */

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
/* Shared building blocks                                                       */
/* ---------------------------------------------------------------------------- */

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
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          className={`${controlClasses} ${
            error ? "border-red-500 focus:border-red-500" : ""
          }`}
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
          value={value ?? ""}
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
        value={value ?? ""}
        onChange={onChange}
        disabled={disabled}
        className={`${controlClasses} ${
          error ? "border-red-500 focus:border-red-500" : ""
        }`}
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
      type="button"
      onClick={onCancel}
      disabled={isSubmitting}
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <X className="h-3 w-3" />
      Cancel
    </button>

    <button
      type="button"
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

/* ---------------------------------------------------------------------------- */
/* Blank header                                                                */
/* ---------------------------------------------------------------------------- */

const blankHeader = () => ({
  branch: "",
  docNo: "",
  department: "",
  date: todayISO(),

  breakdownNo: "",
  breakdownDate: "",

  attendBy: "",
  time: "",

  rectifiedOn: "",
  machineToolNo: "",

  rectificationTimeInput: "",

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

/* ---------------------------------------------------------------------------- */
/* Component                                                                   */
/* ---------------------------------------------------------------------------- */

const MachineToolRectificationForm = ({ onBack, onSave, editData }) => {
  /* -------------------------------------------------------------------------- */
  /* Local storage                                                              */
  /* -------------------------------------------------------------------------- */

  const ORG_ID = parseInt(localStorage.getItem("orgId"), 10);

  /*
   * Financial year is taken directly from localStorage.
   *
   * Doc ID generation DOES NOT depend on branch.
   */
  const FIN_YEAR =
    localStorage.getItem("finYear") || String(new Date().getFullYear());

  /* -------------------------------------------------------------------------- */
  /* State                                                                      */
  /* -------------------------------------------------------------------------- */

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [generatingDocId, setGeneratingDocId] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});

  const [branchOptions, setBranchOptions] = useState([]);

  const [departmentOptions, setDepartmentOptions] = useState([]);

  const [employeeOptions, setEmployeeOptions] = useState([]);

  const [breakdownOptions, setBreakdownOptions] = useState([]);

  const [header, setHeader] = useState({
    ...blankHeader(),
    ...editData?.header,
  });

  /* ========================================================================= */
  /* LOAD BRANCH + DEPARTMENT                                                  */
  /* ========================================================================= */

  useEffect(() => {
    if (!ORG_ID) return;

    /* ---------------------------------------------------------------------- */
    /* Branch                                                                  */
    /* ---------------------------------------------------------------------- */

    branchAPI
      .getBranchByOrgId(ORG_ID)
      .then((list) => {
        const branchList = Array.isArray(list)
          ? list
          : list?.paramObjectsMap?.branchVO ||
            list?.paramObjectsMap?.branches ||
            list?.paramObjectsMap?.branchList ||
            [];

        setBranchOptions(
          branchList.map((b) => ({
            value: b.id,
            label: b.branchName || b.branchCode || `Branch ${b.id}`,
          })),
        );
      })
      .catch((error) => {
        console.error("Failed to load branch list:", error);

        setBranchOptions([]);
      });

    /* ---------------------------------------------------------------------- */
    /* Department                                                              */
    /* ---------------------------------------------------------------------- */

    departmentAPI
      .getAllDepartments(ORG_ID)
      .then((res) => {
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
  }, [ORG_ID]);

  /* ========================================================================= */
  /* BREAKDOWN LIST                                                           */
  /* Branch is required here                                                   */
  /* ========================================================================= */

  useEffect(() => {
    if (!ORG_ID || !header.branch) {
      setBreakdownOptions([]);
      return;
    }

    machineToolRectificationAPI
      .getBreakdownDetails(header.branch, ORG_ID)
      .then((list) => {
        setBreakdownOptions(list || []);
      })
      .catch((error) => {
        console.error("Failed to load breakdown details:", error);

        setBreakdownOptions([]);
      });
  }, [ORG_ID, header.branch]);

  /* ========================================================================= */
  /* EMPLOYEE LIST                                                            */
  /* Branch + Department required                                             */
  /* ========================================================================= */

  useEffect(() => {
    if (!ORG_ID || !header.branch || !header.department) {
      setEmployeeOptions([]);
      return;
    }

    machineToolRectificationAPI
      .getPrepareBy(header.branch, header.department, ORG_ID)
      .then((list) => {
        setEmployeeOptions(
          (list || []).map((e) => ({
            value: e.id,
            label: e.name,
          })),
        );
      })
      .catch((error) => {
        console.error("Failed to load employee list:", error);

        setEmployeeOptions([]);
      });
  }, [ORG_ID, header.branch, header.department]);

  /* ========================================================================= */
  /* DOC NO GENERATION                                                        */
  /*
   * IMPORTANT:
   *
   * Doc No uses ONLY:
   *
   *     financialYear
   *     orgId
   *
   * Branch is NOT used here.
   *
   * This is the same pattern as ProductionBulkIssueForm.
   * ========================================================================= */

  useEffect(() => {
    if (editData?.id) return;

    if (!ORG_ID || !FIN_YEAR) return;

    let cancelled = false;

    const generateDocId = async () => {
      setGeneratingDocId(true);

      try {
        const docId = await machineToolRectificationAPI.getDocId({
          financialYear: FIN_YEAR,
          orgId: ORG_ID,
        });

        if (!cancelled) {
          setHeader((prev) => ({
            ...prev,
            docNo: docId || "",
          }));
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Doc No. generation failed:", error);
        }
      } finally {
        if (!cancelled) {
          setGeneratingDocId(false);
        }
      }
    };

    generateDocId();

    return () => {
      cancelled = true;
    };
  }, [ORG_ID, FIN_YEAR, editData?.id]);

  /* ========================================================================= */
  /* HEADER CHANGE                                                             */
  /* ========================================================================= */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    setHeader((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ========================================================================= */
  /* BREAKDOWN SELECT                                                         */
  /* ========================================================================= */

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
      setFieldErrors((prev) => ({
        ...prev,
        breakdownNo: "",
      }));
    }
  };

  /* ========================================================================= */
  /* VALIDATION                                                               */
  /* ========================================================================= */

  const validate = () => {
    const errors = {};

    if (!header.branch) {
      errors.branch = "Plant ID is required";
    }

    if (!header.date) {
      errors.date = "Date is required";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  /* ========================================================================= */
  /* SAVE                                                                      */
  /* ========================================================================= */

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    /* ---------------------------------------------------------------------- */
    /* Rectification datetime                                                  */
    /* ---------------------------------------------------------------------- */

    let rectificationTimeIso = editData?.rectificationTime || null;

    if (header.rectifiedOn) {
      const timePart = header.rectificationTimeInput || "00:00";

      rectificationTimeIso = new Date(
        `${header.rectifiedOn}T${timePart}:00`,
      ).toISOString();
    }

    /* ---------------------------------------------------------------------- */
    /* Payload                                                                 */
    /* ---------------------------------------------------------------------- */

    const payload = {
      ...(editData?.id && {
        id: editData.id,
      }),

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

      /*
       * Use the same FIN_YEAR that was used
       * to generate the Doc No.
       */
      financialYear: editData?.financialYear || FIN_YEAR,

      createdBy: localStorage.getItem("userName") || "SYSTEM",
    };

    /* ---------------------------------------------------------------------- */
    /* API                                                                     */
    /* ---------------------------------------------------------------------- */

    try {
      const response =
        await machineToolRectificationAPI.updateCreateMachineToolRectification(
          payload,
        );

      const status = response?.status === true || response?.statusFlag === "Ok";

      if (status) {
        if (onSave) {
          onSave(payload);
        }
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

      alert(
        error?.response?.data?.message ||
          "Failed to save Machine/Tool Rectification.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ========================================================================= */
  /* RENDER                                                                    */
  /* ========================================================================= */

  return (
    <div className="p-2 max-w-7xl">
      {/* -------------------------------------------------------------------- */}
      {/* PAGE HEADER                                                           */}
      {/* -------------------------------------------------------------------- */}

      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
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

      {/* -------------------------------------------------------------------- */}
      {/* FORM                                                                  */}
      {/* -------------------------------------------------------------------- */}

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        <div>
          <SectionHeader>Rectification Details</SectionHeader>

          <div className={fieldGrid}>
            {/* ============================================================ */}
            {/* PLANT                                                         */}
            {/* ============================================================ */}

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

            {/* ============================================================ */}
            {/* DOC NO                                                        */}
            {/* ============================================================ */}

            <Field
              label="Doc No."
              name="docNo"
              value={generatingDocId ? "Generating..." : header.docNo || "Auto"}
              onChange={handleHeaderChange}
              disabled
            />

            {/* ============================================================ */}
            {/* DEPARTMENT                                                    */}
            {/* ============================================================ */}

            <Field
              type="select"
              label="Department"
              name="department"
              value={header.department}
              onChange={handleHeaderChange}
              options={departmentOptions}
            />

            {/* ============================================================ */}
            {/* DATE                                                          */}
            {/* ============================================================ */}

            <Field
              type="date"
              label="Date"
              name="date"
              value={header.date}
              onChange={handleHeaderChange}
              required
              error={fieldErrors.date}
            />

            {/* ============================================================ */}
            {/* BREAKDOWN NO                                                  */}
            {/* ============================================================ */}

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

            {/* ============================================================ */}
            {/* BREAKDOWN DATE                                                */}
            {/* ============================================================ */}

            <Field
              type="date"
              label="Breakdown Date"
              name="breakdownDate"
              value={header.breakdownDate}
              onChange={handleHeaderChange}
              disabled
            />

            {/* ============================================================ */}
            {/* ATTEND BY                                                     */}
            {/* ============================================================ */}

            <Field
              type="select"
              label="Attend by"
              name="attendBy"
              value={header.attendBy}
              onChange={handleHeaderChange}
              options={employeeOptions}
            />

            {/* ============================================================ */}
            {/* TIME                                                          */}
            {/* ============================================================ */}

            <Field
              label="Time"
              name="time"
              value={header.time}
              onChange={handleHeaderChange}
              disabled
            />

            {/* ============================================================ */}
            {/* RECTIFIED ON                                                  */}
            {/* ============================================================ */}

            <Field
              type="date"
              label="Rectified On"
              name="rectifiedOn"
              value={header.rectifiedOn}
              onChange={handleHeaderChange}
            />

            {/* ============================================================ */}
            {/* MACHINE / TOOL NO                                             */}
            {/* ============================================================ */}

            <Field
              label="Machine No. / Tool No."
              name="machineToolNo"
              value={header.machineToolNo}
              onChange={handleHeaderChange}
              disabled
            />

            {/* ============================================================ */}
            {/* RECTIFICATION TIME                                            */}
            {/* ============================================================ */}

            <Field
              type="time"
              label="Rectification Time"
              name="rectificationTimeInput"
              value={header.rectificationTimeInput}
              onChange={handleHeaderChange}
            />

            {/* ============================================================ */}
            {/* DESCRIPTION                                                   */}
            {/* ============================================================ */}

            <Field
              label="Description"
              name="description"
              value={header.description}
              onChange={handleHeaderChange}
              disabled
            />

            {/* ============================================================ */}
            {/* CAUSE                                                         */}
            {/* ============================================================ */}

            <Field
              label="Cause"
              name="cause"
              value={header.cause}
              onChange={handleHeaderChange}
            />

            {/* ============================================================ */}
            {/* MAINTENANCE TYPE                                              */}
            {/* ============================================================ */}

            <Field
              label="Maintenance Type"
              name="maintenanceType"
              value={header.maintenanceType}
              onChange={handleHeaderChange}
              disabled
            />

            {/* ============================================================ */}
            {/* ACTION TAKEN                                                  */}
            {/* ============================================================ */}

            <Field
              label="Action Taken"
              name="actionTaken"
              value={header.actionTaken}
              onChange={handleHeaderChange}
            />

            {/* ============================================================ */}
            {/* NATURE OF PROBLEM                                             */}
            {/* ============================================================ */}

            <Field
              label="Nature of Problem"
              name="natureOfProblem"
              value={header.natureOfProblem}
              onChange={handleHeaderChange}
            />

            {/* ============================================================ */}
            {/* CARRIED OUT BY                                                */}
            {/* ============================================================ */}

            <Field
              type="select"
              label="Carried Out By"
              name="carriedOutBy"
              value={header.carriedOutBy}
              onChange={handleHeaderChange}
              options={employeeOptions}
            />

            {/* ============================================================ */}
            {/* TIME TAKEN                                                    */}
            {/* ============================================================ */}

            <Field
              label="Time Taken for Rectification"
              name="timeTakenForRectification"
              value={header.timeTakenForRectification}
              onChange={handleHeaderChange}
              disabled
            />

            {/* ============================================================ */}
            {/* SPARES USED                                                   */}
            {/* ============================================================ */}

            <Field
              label="Spares Used"
              name="sparesUsed"
              value={header.sparesUsed}
              onChange={handleHeaderChange}
            />

            {/* ============================================================ */}
            {/* LOCATION                                                      */}
            {/* ============================================================ */}

            <Field
              label="Location"
              name="location"
              value={header.location}
              onChange={handleHeaderChange}
              disabled
            />

            {/* ============================================================ */}
            {/* PREPARED BY                                                   */}
            {/* ============================================================ */}

            <Field
              type="select"
              label="Prepared By"
              name="preparedBy"
              value={header.preparedBy}
              onChange={handleHeaderChange}
              options={employeeOptions}
            />

            {/* ============================================================ */}
            {/* APPROVED BY                                                   */}
            {/* ============================================================ */}

            <Field
              type="select"
              label="Approved By"
              name="approvedBy"
              value={header.approvedBy}
              onChange={handleHeaderChange}
              options={employeeOptions}
            />

            {/* ============================================================ */}
            {/* REMARKS                                                       */}
            {/* ============================================================ */}

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

        {/* ------------------------------------------------------------------ */}
        {/* BUTTONS                                                            */}
        {/* ------------------------------------------------------------------ */}

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

import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import holidayAPI from "../../../api/holidayAPI";
import branchAPI from "../../../api/branchAPI";
import { useToast } from "../../../components/Toast/ToastContext";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const labelClasses = "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const SectionHeader = ({ children }) => (
  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
    {children}
  </h3>
);

const HOLIDAY_TYPES = [
  "National Holiday",
  "Festival Holiday",
  "Optional Holiday",
  "Company Holiday",
];

const YES_NO = ["Yes", "No"];

const DAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday",
];

const HolidayMasterForm = ({ editData, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId")) || 0;
  const BRANCH = Number(localStorage.getItem("branchId")) || 1000000001;

  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(BRANCH || "");
  const [rows, setRows] = useState(() => [{
    id: Date.now() + Math.random(),
    holidayDate: "",
    day: "",
    holidayType: "",
    remarks: "",
    compensatory: "No",
    compensateDate: "",
    rowId: null, // Store the actual ID from editData for update
  }]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Load branches on mount
  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    if (editData) {
      setIsEditMode(true);

      // If editing, set the branch from editData
      if (editData.branchId) {
        setSelectedBranch(editData.branchId);
      }

      // If editing and we have holiday details
      if (editData.holidayMasterDetailsVO?.length) {
        setRows(
          editData.holidayMasterDetailsVO.map((detail) => ({
            id: Date.now() + Math.random(),
            holidayDate: detail.holidayDate || "",
            day: detail.day || "",
            holidayType: detail.holidayType || "",
            remarks: detail.remarks || "",
            compensatory: detail.compensatory || "No",
            compensateDate: detail.compensatoryDate || "",
            rowId: detail.id || null, // Store the actual ID for update
          }))
        );
      } else if (editData.holidayDate) {
        // If it's a single record (not array)
        setRows([{
          id: Date.now() + Math.random(),
          holidayDate: editData.holidayDate || "",
          day: editData.day || "",
          holidayType: editData.holidayType || "",
          remarks: editData.remarks || "",
          compensatory: editData.compensatory || "No",
          compensateDate: editData.compensatoryDate || "",
          rowId: editData.id || null, // Store the actual ID for update
        }]);
      }
    } else {
      setIsEditMode(false);
    }
  }, [editData]);

  const loadBranches = async () => {
    setLoading(true);
    try {
      const response = await branchAPI.getBranchByOrgId(orgId);
      console.log("Branches loaded:", response);

      const formattedBranches = (response || []).map(branch => ({
        id: branch.id,
        label: branch.branchName || branch.branchCode || branch.id,
        branchCode: branch.branchCode,
        branchName: branch.branchName
      }));

      setBranches(formattedBranches);

      if (!selectedBranch && formattedBranches.length > 0) {
        setSelectedBranch(formattedBranches[0].id);
      }
    } catch (error) {
      console.error("Failed to load branches:", error);
      addToast("Failed to load branches", "error");
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dateStr) => {
    if (!dateStr) return "";
    const d = dayjs(dateStr);
    if (!d.isValid()) return "";
    return DAYS[d.day()];
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        holidayDate: "",
        day: "",
        holidayType: "",
        remarks: "",
        compensatory: "No",
        compensateDate: "",
        rowId: null,
      },
    ]);
  };

  const removeRow = (rowId) => {
    setRows((prev) => prev.filter((r) => r.id !== rowId));
  };

  const handleRowChange = (rowId, field, value) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        const updated = { ...r, [field]: value };
        if (field === "holidayDate") {
          updated.day = getDayName(value);
        }
        if (field === "compensatory" && value === "No") {
          updated.compensateDate = "";
        }
        return updated;
      })
    );
    setFieldErrors((prev) => ({ ...prev, [`${rowId}-${field}`]: "" }));
  };

  const validate = () => {
    const errors = {};

    if (!selectedBranch) {
      errors.branch = "Branch is required";
    }

    const dateMap = {};
    rows.forEach((r, idx) => {
      if (!r.holidayDate) {
        errors[`${r.id}-holidayDate`] = "Holiday Date is required";
      }
      if (dateMap[r.holidayDate]) {
        errors[`${r.id}-duplicate`] = "Duplicate holiday date";
        errors[`${dateMap[r.holidayDate]}-duplicate`] = "Duplicate holiday date";
      } else if (r.holidayDate) {
        dateMap[r.holidayDate] = r.id;
      }

      if (!r.holidayType) {
        errors[`${r.id}-holidayType`] = "Holiday Type is required";
      }

      if (r.compensatory === "Yes" && !r.compensateDate) {
        errors[`${r.id}-compensateDate`] = "Compensate Date is required";
      }
    });

    if (rows.length === 0) errors.noRows = "Add at least one holiday record";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    // Format the payload as an array of objects
    const payload = rows.map((r) => {
      const obj = {
        orgId: orgId,
        branch: Number(selectedBranch),
        createdBy: localStorage.getItem("userName") || "SYSTEM",
        active: true,
        cancelRemarks: "",
        holidayDate: r.holidayDate,
        day: r.day,
        holidayType: r.holidayType,
        remarks: r.remarks || "",
        compensatory: r.compensatory,
        compensatoryDate: r.compensatory === "Yes" ? r.compensateDate : "",
      };

      // Only add id if it's an existing record (update mode)
      if (isEditMode && r.rowId) {
        obj.id = r.rowId;
      }

      return obj;
    });

    console.log("Saving Holiday Payload:", payload);

    try {
      await holidayAPI.createUpdate(payload);
      addToast(
        editData ? "Holiday updated successfully!" : "Holiday saved successfully!",
        "success"
      );
      onBack();
    } catch (error) {
      console.error("Failed to save Holiday:", error);
      addToast("Failed to save Holiday.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNew = () => {
    setIsEditMode(false);
    setSelectedBranch(BRANCH || "");
    setRows([{
      id: Date.now() + Math.random(),
      holidayDate: "",
      day: "",
      holidayType: "",
      remarks: "",
      compensatory: "No",
      compensateDate: "",
      rowId: null,
    }]);
    setFieldErrors({});
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
          {editData ? "Edit Holiday Master" : "Holiday Master"}
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
        <div>
          <SectionHeader>Holiday Header</SectionHeader>

          <div className="max-w-xs">
            <label className={labelClasses}>
              Plant <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => {
                setSelectedBranch(e.target.value);
                setFieldErrors((prev) => ({ ...prev, branch: "" }));
              }}
              disabled={loading}
              className={`${controlClasses} ${fieldErrors.branch ? "border-red-500" : ""}`}
            >
              <option value="">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.label}
                </option>
              ))}
            </select>
            {fieldErrors.branch && (
              <p className="text-[10px] text-red-500 dark:text-red-400 mt-0.5">
                {fieldErrors.branch}
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700" />

        <div>
          <div className="flex items-center justify-between mb-2">
            <SectionHeader>Holiday Details</SectionHeader>
            <button
              onClick={addRow}
              className="flex items-center gap-1 px-2 py-1 rounded text-[11px] bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors"
            >
              <Plus className="h-3 w-3" />
              Add Row
            </button>
          </div>

          {rows.length > 0 ? (
            <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    {["S.No", "Holiday Date", "Day", "Holiday Type", "Remarks", "Compensatory", "Compensate Date", "Action"].map((h) => (
                      <th key={h} className="px-2 py-1.5 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={row.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-2 py-1 text-gray-500 dark:text-gray-400 align-top pt-2.5">{idx + 1}</td>

                      <td className="px-2 py-1 align-top">
                        <input
                          type="date"
                          value={row.holidayDate}
                          onChange={(e) => handleRowChange(row.id, "holidayDate", e.target.value)}
                          className={controlClasses + " w-[130px]" + (fieldErrors[`${row.id}-holidayDate`] ? " border-red-500" : "") + (fieldErrors[`${row.id}-duplicate`] ? " border-red-500" : "")}
                        />
                        {(fieldErrors[`${row.id}-holidayDate`] || fieldErrors[`${row.id}-duplicate`]) && (
                          <p className="text-[10px] text-red-500 dark:text-red-400 mt-0.5">
                            {fieldErrors[`${row.id}-holidayDate`] || fieldErrors[`${row.id}-duplicate`]}
                          </p>
                        )}
                      </td>

                      <td className="px-2 py-1 align-top">
                        <input
                          type="text"
                          value={row.day}
                          readOnly
                          className={controlClasses + " w-[100px] text-gray-500 dark:text-gray-500"}
                        />
                      </td>

                      <td className="px-2 py-1 align-top">
                        <select
                          value={row.holidayType}
                          onChange={(e) => handleRowChange(row.id, "holidayType", e.target.value)}
                          className={controlClasses + " w-[130px]" + (fieldErrors[`${row.id}-holidayType`] ? " border-red-500" : "")}
                        >
                          <option value="">Select</option>
                          {HOLIDAY_TYPES.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                        {fieldErrors[`${row.id}-holidayType`] && (
                          <p className="text-[10px] text-red-500 dark:text-red-400 mt-0.5">{fieldErrors[`${row.id}-holidayType`]}</p>
                        )}
                      </td>

                      <td className="px-2 py-1 align-top">
                        <input
                          type="text"
                          value={row.remarks}
                          onChange={(e) => handleRowChange(row.id, "remarks", e.target.value)}
                          placeholder="Remarks"
                          className={controlClasses + " w-[130px]"}
                        />
                      </td>

                      <td className="px-2 py-1 align-top">
                        <select
                          value={row.compensatory}
                          onChange={(e) => handleRowChange(row.id, "compensatory", e.target.value)}
                          className={controlClasses + " w-[90px]"}
                        >
                          {YES_NO.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </td>

                      <td className="px-2 py-1 align-top">
                        <input
                          type="date"
                          value={row.compensateDate}
                          onChange={(e) => handleRowChange(row.id, "compensateDate", e.target.value)}
                          disabled={row.compensatory !== "Yes"}
                          className={controlClasses + " w-[130px]" + (fieldErrors[`${row.id}-compensateDate`] ? " border-red-500" : "") + (row.compensatory !== "Yes" ? " opacity-50" : "")}
                        />
                        {fieldErrors[`${row.id}-compensateDate`] && (
                          <p className="text-[10px] text-red-500 dark:text-red-400 mt-0.5">{fieldErrors[`${row.id}-compensateDate`]}</p>
                        )}
                      </td>

                      <td className="px-2 py-1 align-top pt-2">
                        <button
                          onClick={() => removeRow(row.id)}
                          disabled={rows.length <= 1}
                          className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:dark:hover:bg-transparent"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-gray-500 dark:text-gray-400">
              <Plus className="h-6 w-6 mx-auto mb-1 opacity-40" />
              Click <strong>Add Row</strong> to add holiday records
            </div>
          )}
          {fieldErrors.noRows && (
            <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">{fieldErrors.noRows}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleNew}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <X className="h-3 w-3" />
            New
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || rows.length === 0 || loading}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-3 w-3" />
            {isSubmitting ? "Saving..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HolidayMasterForm;
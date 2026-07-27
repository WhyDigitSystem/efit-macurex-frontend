import { ArrowLeft, Save, X, Plus, Trash2, Search } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
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

const fieldGrid = "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-2 items-start";

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

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const HolidayMaster = () => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId")) || 0;

  const [docId] = useState(() => "HOL" + String(Date.now()).slice(-6));
  const [docDate, setDocDate] = useState(() => dayjs().format("YYYY-MM-DD"));
  const [plantId, setPlantId] = useState("");
  const [plants, setPlants] = useState([]);
  const [rows, setRows] = useState(() => [{
    id: Date.now() + Math.random(),
    holidayDate: "",
    day: "",
    holidayType: "",
    remarks: "",
    compensatory: "No",
    compensateDate: "",
  }]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPlants = async () => {
      try {
        const data = await branchAPI.getBranchByOrgId(orgId);
        setPlants(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load plants:", error);
      }
    };
    loadPlants();
  }, [orgId]);

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
          if (value && r.compensateDate) {
            setFieldErrors((prev) => ({ ...prev, [`${rowId}-duplicate`]: "" }));
          }
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

    if (!plantId) errors.plantId = "Plant is required";
    if (!docDate) errors.docDate = "Document Date is required";

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

    const payload = {
      docId,
      docDate,
      plantId: Number(plantId),
      orgId,
      createdBy: localStorage.getItem("userName") || "SYSTEM",
      details: rows.map((r) => ({
        holidayDate: r.holidayDate,
        day: r.day,
        holidayType: r.holidayType,
        remarks: r.remarks,
        compensatory: r.compensatory,
        compensateDate: r.compensatory === "Yes" ? r.compensateDate : "",
      })),
    };

    try {
      await holidayAPI.createUpdate(payload);
      addToast("Holiday saved successfully!", "success");
    } catch (error) {
      console.error("Failed to save Holiday:", error);
      addToast("Failed to save Holiday.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNew = () => {
    setPlantId("");
    setDocDate(dayjs().format("YYYY-MM-DD"));
    setRows([{
      id: Date.now() + Math.random(),
      holidayDate: "",
      day: "",
      holidayType: "",
      remarks: "",
      compensatory: "No",
      compensateDate: "",
    }]);
    setFieldErrors({});
  };

  return (
    <div className="p-2 max-w-7xl">
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => window.history.back()}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Holiday Master</h2>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
        <div>
          <SectionHeader>Holiday Header</SectionHeader>

          <div className={fieldGrid}>
            <div>
              <label className={labelClasses}>
                Plant <span className="text-red-500">*</span>
              </label>
              <select
                value={plantId}
                onChange={(e) => {
                  setPlantId(e.target.value);
                  if (fieldErrors.plantId) setFieldErrors((p) => ({ ...p, plantId: "" }));
                }}
                className={controlClasses + (fieldErrors.plantId ? " border-red-500" : "")}
              >
                <option value="">Select Plant</option>
                {plants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.branchName || p.branchCode || `Plant ${p.id}`}
                  </option>
                ))}
              </select>
              {fieldErrors.plantId && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">{fieldErrors.plantId}</p>
              )}
            </div>

            <div>
              <label className={labelClasses}>Doc ID</label>
              <input type="text" value={docId} readOnly className={controlClasses + " text-gray-500 dark:text-gray-500"} />
            </div>

            <div>
              <label className={labelClasses}>
                Document Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={docDate}
                onChange={(e) => setDocDate(e.target.value)}
                className={controlClasses}
              />
            </div>
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
            disabled={isSubmitting || rows.length === 0}
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

export default HolidayMaster;

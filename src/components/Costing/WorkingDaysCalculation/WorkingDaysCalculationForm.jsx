import React, { useState } from "react";
import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";

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

const Field = ({
  label,
  name,
  value,
  onChange,
  error,
  required,
  type = "text",
  options = [],
  className = "",
  placeholder = "",
  disabled = false,
  step,
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
          className={`${controlClasses} ${error ? "border-red-500" : ""}`}
          disabled={disabled}
        >
          <option value="">-- Select --</option>
          {options.map((opt) => (
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
        className={`${controlClasses} ${error ? "border-red-500" : ""}`}
        placeholder={placeholder}
        disabled={disabled}
        step={step}
      />
      {error && (
        <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
};

const fieldGrid =
  "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-2 items-start";

// Dummy data for dropdowns - current year +/- 5
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 11 }, (_, i) => {
  const y = String(CURRENT_YEAR - 5 + i);
  return { value: y, label: y };
});

const HOLIDAY_TYPE_OPTIONS = [
  { value: "sundays", label: "Sundays" },
  { value: "saturdays", label: "Saturdays" },
  { value: "national", label: "National Holidays" },
  { value: "festival", label: "Festival Holidays" },
  { value: "company", label: "Company Holidays" },
  { value: "other", label: "Other" },
];

const emptyRow = () => ({
  id: Date.now() + Math.random(),
  holidayType: "",
  noOfHolidays: "",
  remarks: "",
});

const isLeapYear = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

const TABS = [
  { key: "holiday", label: "1- Holiday" },
  { key: "workingDays", label: "2- Working Days" },
];

const WorkingDaysCalculationForm = ({ data, onBack }) => {
  const [activeTab, setActiveTab] = useState("holiday");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    year: data?.year || "",
  });

  const [rows, setRows] = useState([emptyRow()]);

  // Year days follow the selected year (366 for a leap year)
  const noOfYearDays = form.year
    ? isLeapYear(parseInt(form.year, 10))
      ? 366
      : 365
    : "";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRowChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index] = { ...updatedRows[index], [field]: value };
    setRows(updatedRows);
  };

  const handleAddRow = () => setRows([...rows, emptyRow()]);

  const handleRemoveRow = (index) => {
    if (rows.length > 1) {
      setRows(rows.filter((_, i) => i !== index));
    }
  };

  const getAvailableHolidayTypes = (currentIndex) => {
    const selected = rows
      .filter((_, i) => i !== currentIndex)
      .map((r) => r.holidayType);
    return HOLIDAY_TYPE_OPTIONS.filter((t) => !selected.includes(t.value));
  };

  // Totals
  const totalHolidays = rows.reduce(
    (s, r) => s + (parseInt(r.noOfHolidays, 10) || 0),
    0,
  );
  const noOfWorkingDays =
    noOfYearDays === "" ? "" : noOfYearDays - totalHolidays;

  const validate = () => {
    const errors = {};
    if (!form.year) errors.year = "Year is required";
    if (noOfYearDays !== "" && totalHolidays > noOfYearDays) {
      errors.holidays = `Total holidays (${totalHolidays}) cannot exceed the days in the year (${noOfYearDays})`;
    }
    setFieldErrors(errors);

    if (errors.holidays) setActiveTab("workingDays");
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    const payload = {
      ...form,
      noOfYearDays,
      rows,
      noOfTotalHolidays: totalHolidays,
      noOfWorkingDays,
    };
    console.log("Saving payload:", payload);

    setTimeout(() => {
      alert(
        data
          ? "Working Days Calculation Updated Successfully!"
          : "Working Days Calculation Saved Successfully!",
      );
      setIsSubmitting(false);
      onBack();
    }, 1000);
  };

  const tabButtonClass = (key) =>
    `px-4 py-1.5 text-xs font-semibold rounded-t transition-colors ${
      activeTab === key
        ? "bg-blue-600 text-white"
        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
    }`;

  const removeBtnClass = (disabled) =>
    `h-5 w-5 rounded text-white flex items-center justify-center transition-colors ${
      disabled
        ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
        : "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
    }`;

  const th = "p-1 text-left dark:text-gray-200";
  const noop = () => {};

  return (
    <div className="p-2 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data
            ? "Edit Working Days Calculation"
            : "Add Working Days Calculation"}
        </h2>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
        {/* Form Fields */}
        <div className={fieldGrid}>
          <Field
            type="select"
            label="Year"
            name="year"
            value={form.year}
            onChange={handleChange}
            error={fieldErrors.year}
            required
            options={YEAR_OPTIONS}
          />
          <Field
            label="No. Of Year Days"
            name="noOfYearDays"
            value={noOfYearDays}
            onChange={noop}
            disabled
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-gray-200 dark:border-gray-700 mt-4">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={tabButtonClass(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 1 - Holiday */}
        {activeTab === "holiday" && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Holiday
              </h3>
              <button
                type="button"
                onClick={handleAddRow}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            </div>

            <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs min-w-[650px]">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="p-1 text-center w-10 dark:text-gray-200">
                      S.no
                    </th>
                    <th className={`${th} min-w-[200px]`}>Holiday Type</th>
                    <th className={`${th} min-w-[130px]`}>No. Of Holidays</th>
                    <th className={`${th} min-w-[250px]`}>Remarks</th>
                    <th className="p-1 text-center w-10 dark:text-gray-200">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr
                      key={row.id}
                      className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="p-1 text-center font-medium dark:text-gray-300">
                        {index + 1}
                      </td>
                      <td className="p-1">
                        <select
                          value={row.holidayType}
                          onChange={(e) =>
                            handleRowChange(
                              index,
                              "holidayType",
                              e.target.value,
                            )
                          }
                          className={`${controlClasses} h-8 text-xs w-full min-w-[190px]`}
                        >
                          <option value="">Select</option>
                          {getAvailableHolidayTypes(index).map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          value={row.noOfHolidays}
                          onChange={(e) =>
                            handleRowChange(
                              index,
                              "noOfHolidays",
                              e.target.value,
                            )
                          }
                          className={`${controlClasses} h-8 text-xs w-full min-w-[110px]`}
                          placeholder="0"
                          min="0"
                          step="1"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={row.remarks}
                          onChange={(e) =>
                            handleRowChange(index, "remarks", e.target.value)
                          }
                          className={`${controlClasses} h-8 text-xs w-full min-w-[240px]`}
                          placeholder="Remarks"
                        />
                      </td>
                      <td className="p-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(index)}
                          disabled={rows.length <= 1}
                          className={removeBtnClass(rows.length <= 1)}
                        >
                          <Trash2 size={10} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-700/50">
                  <tr className="border-t border-gray-200 dark:border-gray-700">
                    <td
                      colSpan={2}
                      className="p-1 text-right font-semibold dark:text-gray-200"
                    >
                      Total Holidays
                    </td>
                    <td className="p-1 pl-3 font-semibold dark:text-gray-200">
                      {totalHolidays}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* 2 - Working Days */}
        {activeTab === "workingDays" && (
          <div className="mt-2 space-y-3">
            <div className={fieldGrid}>
              <Field
                label="No. Of Total Holidays"
                name="noOfTotalHolidays"
                value={totalHolidays}
                onChange={noop}
                disabled
              />
              <Field
                label="No. Of Working Days"
                name="noOfWorkingDays"
                value={noOfWorkingDays}
                onChange={noop}
                disabled
                error={fieldErrors.holidays}
              />
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <X className="h-3 w-3" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-3 w-3" />
            {isSubmitting ? "Saving..." : data ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkingDaysCalculationForm;

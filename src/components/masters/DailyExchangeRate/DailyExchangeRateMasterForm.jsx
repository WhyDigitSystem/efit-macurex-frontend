import { ArrowLeft, Save, X, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "../../Toast/ToastContext";
import dailyExchangeRateAPI from "../../../api/dailyExchangeRateAPI";
import currencyAPI from "../../../api/currencyAPI";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const YEARS_BACK = 5;
const YEARS_FORWARD = 2;

const MONTH_VALUES = [
  { value: "JANUARY", label: "January" },
  { value: "FEBRUARY", label: "February" },
  { value: "MARCH", label: "March" },
  { value: "APRIL", label: "April" },
  { value: "MAY", label: "May" },
  { value: "JUNE", label: "June" },
  { value: "JULY", label: "July" },
  { value: "AUGUST", label: "August" },
  { value: "SEPTEMBER", label: "September" },
  { value: "OCTOBER", label: "October" },
  { value: "NOVEMBER", label: "November" },
  { value: "DECEMBER", label: "December" },
];

const DailyExchangeRateMasterForm = ({ onBack, editData }) => {
  const ORG_ID = parseInt(localStorage.getItem("orgId"));
  const BRANCH = parseInt(localStorage.getItem("branchId") || 1000000001);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { addToast } = useToast();

  const [fieldErrors, setFieldErrors] = useState({});
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        const currencies = await currencyAPI.getCurrencies(ORG_ID);
        setCurrencyOptions(currencies || []);
      } catch (err) {
        console.error("Failed to load currencies", err);
      }
    };
    if (ORG_ID) loadCurrencies();
  }, [ORG_ID]);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (
      let y = currentYear + YEARS_FORWARD;
      y >= currentYear - YEARS_BACK;
      y--
    ) {
      years.push(y);
    }
    return years;
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    id: editData?.id || 0,
    currency: editData?.currency?.id || "",
    sellingExRate: editData?.sellingExRate ?? "",
    buyingExRate: editData?.buyingExRate ?? "",
    month: editData?.month || "",
    year: editData?.year ? Number(editData.year) : "",
    effectiveFrom: editData?.effectiveFrom || todayStr,
    financialYear: editData?.financialYear || "",
    branch: BRANCH,
    active: editData?.active === "Active" || editData?.active === true,
    cancelRemarks: editData?.cancelRemarks || "",
    orgId: ORG_ID,
    createdBy: localStorage.getItem("userName") || "SYSTEM",
  });

  // Field labels for toast messages
  const fieldLabels = {
    currency: "Currency",
    sellingExRate: "Selling Ex.Rate",
    buyingExRate: "Buying Ex.Rate",
    month: "Month",
    year: "Year",
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "active") {
      setForm((prev) => ({ ...prev, active: e.target.checked }));
      return;
    }

    const decimalRegex = /^\d*\.?\d{0,4}$/;

    switch (name) {
      case "currency":
        break;

      case "sellingExRate":
      case "buyingExRate":
        if (value !== "" && !decimalRegex.test(value)) {
          setFieldErrors((prev) => ({
            ...prev,
            [name]: "Enter a valid rate (up to 4 decimal places)",
          }));
          return;
        }
        break;

      case "cancelRemarks":
        if (value.length > 250) {
          setFieldErrors((prev) => ({
            ...prev,
            cancelRemarks: "Remarks must be maximum 250 characters",
          }));
          return;
        }
        break;

      default:
        break;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (!validTypes.includes(file.type)) {
      addToast("Please upload an Excel file (.xlsx or .xls)", "error");
      fileInputRef.current.value = "";
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      addToast("File size should be less than 5MB", "error");
      fileInputRef.current.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("files", file);

    try {
      setIsUploading(true);
      const response = await dailyExchangeRateAPI.uploadExcelForExchangeRate(
        formData
      );
      console.log("Upload Response:", response);

      // Check if there are errors in the response
      if (response?.errors && response.errors.length > 0) {
        const errorMessages = response.errors
          .map((err) => err.logMessage || err.nonMessage || "Upload error")
          .join(", ");
        addToast(`Upload failed: ${errorMessages}`, "error");
      } else {
        addToast("File uploaded successfully!", "success");
        // Optionally refresh the list or reset form
        if (onBack) onBack();
      }
    } catch (error) {
      console.error("Upload Error:", error);
      const errorMessage =
        error.response?.data?.errors?.[0]?.logMessage ||
        error.response?.data?.errors?.[0]?.nonMessage ||
        error.response?.data?.message ||
        "File upload failed! Please try again.";
      addToast(errorMessage, "error");
    } finally {
      setIsUploading(false);
      fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    const errors = {};

    if (!form.currency) errors.currency = "Currency is required";
    if (form.sellingExRate === "" || Number(form.sellingExRate) <= 0)
      errors.sellingExRate = "Selling Ex.Rate is required";
    if (form.buyingExRate === "" || Number(form.buyingExRate) <= 0)
      errors.buyingExRate = "Buying Ex.Rate is required";
    if (!form.month) errors.month = "Month is required";
    if (!form.year) errors.year = "Year is required";

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0];
      const fieldLabel = fieldLabels[firstErrorField] || firstErrorField;
      const errorMessage = errors[firstErrorField];

      addToast(`${fieldLabel}: ${errorMessage}`, "error");
      return;
    }

    setIsSubmitting(true);

    const financialYearVal = form.financialYear || (form.year ? `${form.year}-${Number(form.year) + 1}` : "");

    const payload = {
      currency: Number(form.currency),
      sellingExRate: Number(form.sellingExRate),
      buyingExRate: Number(form.buyingExRate),
      month: form.month,
      year: form.year ? Number(form.year) : null,
      effectiveFrom: form.effectiveFrom || null,
      financialYear: financialYearVal,
      branch: form.branch,
      active: Boolean(form.active),
      cancelRemarks: form.cancelRemarks,
      createdBy: form.createdBy,
      orgId: form.orgId,
    };

    if (form.id && form.id > 0) {
      payload.id = form.id;
    }

    console.log("📤 Saving Exchange Rate Payload:", payload);

    try {
      const response =
        await dailyExchangeRateAPI.updateCreateDailyExRate(payload);
      console.log("📥 Response:", response);

      const status = response?.status === true || response?.statusFlag === "Ok";

      if (status) {
        const successMessage =
          response?.paramObjectsMap?.message ||
          (form.id && form.id > 0
            ? "Exchange Rate updated successfully!"
            : "Exchange Rate created successfully!");

        addToast(successMessage, "success");
        if (onBack) onBack();
      } else {
        const errorMessage =
          response?.paramObjectsMap?.message ||
          response?.paramObjectsMap?.errorMessage ||
          response?.message ||
          "Failed to save exchange rate";

        addToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("❌ Save Error:", error);
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

  return (
    <div className="p-2 max-w-7xl ">
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {editData ? "Edit Exchange Rate" : "Add Exchange Rate"}
        </h2>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        {/* MAIN FORM GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Currency */}
          <div>
            <label className={labelClasses}>
              Currency <span className="text-red-500">*</span>
            </label>

            <select
              name="currency"
              value={form.currency}
              onChange={handleChange}
              className={`${controlClasses} ${fieldErrors.currency ? "border-red-500" : ""
                }`}
            >
              <option value="">Select Currency</option>

              {currencyOptions.map((cur) => (
                <option key={cur.id} value={cur.id}>
                  {cur.currency} - {cur.mainCurrency}
                </option>
              ))}
            </select>

            {fieldErrors.currency && (
              <p className="text-red-500 text-[11px] mt-1">
                {fieldErrors.currency}
              </p>
            )}
          </div>

          {/* Selling Ex.Rate */}
          <div>
            <label className={labelClasses}>
              Selling Ex.Rate <span className="text-red-500">*</span>
            </label>

            <input
              name="sellingExRate"
              value={form.sellingExRate}
              onChange={handleChange}
              inputMode="decimal"
              className={`${controlClasses} ${fieldErrors.sellingExRate ? "border-red-500" : ""
                }`}
            />

            {fieldErrors.sellingExRate && (
              <p className="text-red-500 text-[11px] mt-1">
                {fieldErrors.sellingExRate}
              </p>
            )}
          </div>

          {/* Buying Ex.Rate */}
          <div>
            <label className={labelClasses}>
              Buying Ex.Rate <span className="text-red-500">*</span>
            </label>

            <input
              name="buyingExRate"
              value={form.buyingExRate}
              onChange={handleChange}
              inputMode="decimal"
              className={`${controlClasses} ${fieldErrors.buyingExRate ? "border-red-500" : ""
                }`}
            />

            {fieldErrors.buyingExRate && (
              <p className="text-red-500 text-[11px] mt-1">
                {fieldErrors.buyingExRate}
              </p>
            )}
          </div>

          {/* Month */}
          <div>
            <label className={labelClasses}>
              Month <span className="text-red-500">*</span>
            </label>

            <select
              name="month"
              value={form.month}
              onChange={handleChange}
              className={`${controlClasses} ${fieldErrors.month ? "border-red-500" : ""
                }`}
            >
              <option value="">Select Month</option>

              {MONTH_VALUES.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>

            {fieldErrors.month && (
              <p className="text-red-500 text-[11px] mt-1">
                {fieldErrors.month}
              </p>
            )}
          </div>

          {/* Year */}
          <div>
            <label className={labelClasses}>
              Year <span className="text-red-500">*</span>
            </label>

            <select
              name="year"
              value={form.year}
              onChange={handleChange}
              className={`${controlClasses} ${fieldErrors.year ? "border-red-500" : ""
                }`}
            >
              <option value="">Select Year</option>

              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            {fieldErrors.year && (
              <p className="text-red-500 text-[11px] mt-1">
                {fieldErrors.year}
              </p>
            )}
          </div>

          {/* Effective From */}
          <div>
            <label className={labelClasses}>Effective From</label>

            <input
              type="date"
              name="effectiveFrom"
              value={form.effectiveFrom}
              onChange={handleChange}
              className={controlClasses}
            />
          </div>

          {/* Financial Year */}
          <div>
            <label className={labelClasses}>Financial Year</label>

            <input
              name="financialYear"
              value={form.financialYear}
              onChange={handleChange}
              className={controlClasses}
            />
          </div>

          {/* Active */}
          <div>
            <label className={labelClasses}>Active</label>

            <button
              type="button"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  active: !prev.active,
                }))
              }
              className={`relative flex items-center w-12 h-6 rounded-full transition-colors ${form.active ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                }`}
            >
              <span
                className={`absolute h-5 w-5 bg-white rounded-full shadow transition-transform ${form.active ? "translate-x-6" : "translate-x-0.5"
                  }`}
              />
            </button>
          </div>

          {/* Cancel Remarks - only relevant when marking inactive */}
          {!form.active && (
            <div className="md:col-span-2 lg:col-span-3">
              <label className={labelClasses}>Cancel Remarks</label>

              <input
                name="cancelRemarks"
                value={form.cancelRemarks}
                onChange={handleChange}
                className={`${controlClasses} ${fieldErrors.cancelRemarks ? "border-red-500" : ""
                  }`}
              />

              {fieldErrors.cancelRemarks && (
                <p className="text-red-500 text-[11px] mt-1">
                  {fieldErrors.cancelRemarks}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-between items-center gap-2 pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
          {/* Left side - Upload button */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />

            <button
              onClick={handleUploadClick}
              disabled={isUploading}
              className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60"
            >
              <Upload className="h-3 w-3" />
              {isUploading ? "Uploading..." : "Upload Excel"}
            </button>
          </div>

          {/* Right side - Cancel and Save buttons */}
          <div className="flex gap-2">
            <button
              onClick={onBack}
              disabled={isSubmitting || isUploading}
              className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60"
            >
              <X className="h-3 w-3" />
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={isSubmitting || isUploading}
              className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
            >
              <Save className="h-3 w-3" />
              {isSubmitting ? "Saving..." : editData ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyExchangeRateMasterForm;
import { ArrowLeft, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "../../Toast/ToastContext";
import exchangeRateUpdateAPI from "../../../api/exchangeRateUpdateAPI";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const ExchangeRateUpdateForm = ({ onBack, onSave, editData }) => {
  const ORG_ID = parseInt(localStorage.getItem("orgId"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const [currencies, setCurrencies] = useState([]);
  const [currencyLoading, setCurrencyLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    id: editData?.id || 0,
    currencyName: editData?.currencyName || "",
    currencySymbol: editData?.currencySymbol || "",
    exchangeRate: editData?.exchangeRate ?? "",
    exchangeDateFrom: editData?.exchangeDateFrom || "",
    exchangeDateTo: editData?.exchangeDateTo || "",
    active: editData?.active ?? true,
    cancelRemarks: editData?.cancelRemarks || "",
    orgId: ORG_ID,
    createdBy: localStorage.getItem("userName") || "SYSTEM",
  });

  // Field labels for toast messages
  const fieldLabels = {
    currencyName: "Currency Name",
    exchangeRate: "Exchange Rate",
    exchangeDateFrom: "Exchange Date From",
    exchangeDateTo: "Exchange Date To",
  };

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    try {
      setCurrencyLoading(true);
      const response = await exchangeRateUpdateAPI.getCurrencies(ORG_ID);
      const sortedCurrencies = (response || []).sort((a, b) =>
        (a.currencyName || "").localeCompare(b.currencyName || ""),
      );
      setCurrencies(sortedCurrencies);
    } catch (error) {
      console.error("Error fetching currencies:", error);
      addToast("Failed to load currencies", "error");
    } finally {
      setCurrencyLoading(false);
    }
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

    const decimalRegex = /^\d*\.?\d{0,6}$/;

    if (name === "exchangeRate") {
      if (value !== "" && !decimalRegex.test(value)) {
        setFieldErrors((prev) => ({
          ...prev,
          exchangeRate: "Enter a valid rate (up to 6 decimal places)",
        }));
        return;
      }
    }

    if (name === "cancelRemarks" && value.length > 250) {
      setFieldErrors((prev) => ({
        ...prev,
        cancelRemarks: "Remarks must be maximum 250 characters",
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Currency Name drives Currency Symbol from the same currency master record
  const handleCurrencyNameChange = (e) => {
    const currencyName = e.target.value;
    const selected = currencies.find((c) => c.currencyName === currencyName);

    if (fieldErrors.currencyName) {
      setFieldErrors((prev) => ({ ...prev, currencyName: "" }));
    }

    setForm((prev) => ({
      ...prev,
      currencyName,
      currencySymbol: selected?.currencySymbol || "",
    }));
  };

  const handleSave = async () => {
    const errors = {};

    if (!form.currencyName) errors.currencyName = "Currency Name is required";
    if (form.exchangeRate === "" || Number(form.exchangeRate) <= 0)
      errors.exchangeRate = "Exchange Rate is required";
    if (!form.exchangeDateFrom)
      errors.exchangeDateFrom = "Exchange Date From is required";
    if (!form.exchangeDateTo)
      errors.exchangeDateTo = "Exchange Date To is required";

    if (
      form.exchangeDateFrom &&
      form.exchangeDateTo &&
      form.exchangeDateTo < form.exchangeDateFrom
    ) {
      errors.exchangeDateTo =
        "Exchange Date To cannot be earlier than Exchange Date From";
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0];
      const fieldLabel = fieldLabels[firstErrorField] || firstErrorField;
      const errorMessage = errors[firstErrorField];

      addToast(`${fieldLabel}: ${errorMessage}`, "error");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      currencyName: form.currencyName,
      currencySymbol: form.currencySymbol,
      exchangeRate: Number(form.exchangeRate),
      exchangeDateFrom: form.exchangeDateFrom,
      exchangeDateTo: form.exchangeDateTo,
      active: Boolean(form.active),
      cancelRemarks: form.cancelRemarks,
      createdBy: form.createdBy,
      orgId: form.orgId,
    };

    if (form.id && form.id > 0) {
      payload.id = form.id;
    }

    console.log("📤 Saving Exchange Rate Update Payload:", payload);

    try {
      const response =
        await exchangeRateUpdateAPI.updateCreateExchangeRateUpdate(payload);
      console.log("📥 Response:", response);

      const status = response?.status === true || response?.statusFlag === "Ok";

      if (status) {
        const successMessage =
          response?.paramObjectsMap?.message ||
          (form.id && form.id > 0
            ? "Exchange Rate updated successfully!"
            : "Exchange Rate created successfully!");

        addToast(successMessage, "success");

        if (onSave) onSave(payload);
      } else {
        const errorMessage =
          response?.paramObjectsMap?.message ||
          response?.paramObjectsMap?.errorMessage ||
          response?.message ||
          "Failed to save exchange rate update";

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
          {editData ? "Edit Exchange Rate Update" : "Exchange Rate Update"}
        </h2>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        {/* MAIN FORM GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Currency Name */}
          <div>
            <label className={labelClasses}>
              Currency Name <span className="text-red-500">*</span>
            </label>

            <select
              name="currencyName"
              value={form.currencyName}
              onChange={handleCurrencyNameChange}
              disabled={currencyLoading}
              className={`${controlClasses} ${
                fieldErrors.currencyName ? "border-red-500" : ""
              }`}
            >
              <option value="">Select Currency Name</option>

              {currencies.map((currency) => (
                <option
                  key={currency.currencyName}
                  value={currency.currencyName}
                >
                  {currency.currencyName}
                </option>
              ))}
            </select>

            {fieldErrors.currencyName && (
              <p className="text-red-500 text-[11px] mt-1">
                {fieldErrors.currencyName}
              </p>
            )}
          </div>

          {/* Exchange Rate */}
          <div>
            <label className={labelClasses}>
              Exchange Rate <span className="text-red-500">*</span>
            </label>

            <input
              name="exchangeRate"
              value={form.exchangeRate}
              onChange={handleChange}
              inputMode="decimal"
              className={`${controlClasses} ${
                fieldErrors.exchangeRate ? "border-red-500" : ""
              }`}
            />

            {fieldErrors.exchangeRate && (
              <p className="text-red-500 text-[11px] mt-1">
                {fieldErrors.exchangeRate}
              </p>
            )}
          </div>

          {/* Exchange Date From */}
          <div>
            <label className={labelClasses}>
              Exchange Date From <span className="text-red-500">*</span>
            </label>

            <input
              type="date"
              name="exchangeDateFrom"
              value={form.exchangeDateFrom}
              onChange={handleChange}
              className={`${controlClasses} ${
                fieldErrors.exchangeDateFrom ? "border-red-500" : ""
              }`}
            />

            {fieldErrors.exchangeDateFrom && (
              <p className="text-red-500 text-[11px] mt-1">
                {fieldErrors.exchangeDateFrom}
              </p>
            )}
          </div>

          {/* Exchange Date To */}
          <div>
            <label className={labelClasses}>
              Exchange Date To <span className="text-red-500">*</span>
            </label>

            <input
              type="date"
              name="exchangeDateTo"
              value={form.exchangeDateTo}
              onChange={handleChange}
              className={`${controlClasses} ${
                fieldErrors.exchangeDateTo ? "border-red-500" : ""
              }`}
            />

            {fieldErrors.exchangeDateTo && (
              <p className="text-red-500 text-[11px] mt-1">
                {fieldErrors.exchangeDateTo}
              </p>
            )}
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
              className={`relative flex items-center w-12 h-6 rounded-full transition-colors ${
                form.active ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`absolute h-5 w-5 bg-white rounded-full shadow transition-transform ${
                  form.active ? "translate-x-6" : "translate-x-0.5"
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
                className={`${controlClasses} ${
                  fieldErrors.cancelRemarks ? "border-red-500" : ""
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
        <div className="flex justify-end gap-2 pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60"
          >
            <X className="h-3 w-3" />
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
          >
            <Save className="h-3 w-3" />
            {isSubmitting ? "Saving..." : editData ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExchangeRateUpdateForm;

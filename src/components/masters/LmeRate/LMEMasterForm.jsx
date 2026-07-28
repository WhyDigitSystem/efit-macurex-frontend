import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, X } from "lucide-react";
import { lmeAPI } from "../../../api/lmeApi";
import { useToast } from "../../Toast/ToastContext";

const controlClasses =
    "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
    "bg-white dark:bg-gray-900 " +
    "border-gray-300 dark:border-gray-600 " +
    "text-gray-900 dark:text-gray-100 " +
    "placeholder-gray-400 dark:placeholder-gray-500 " +
    "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
    "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
    "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed " +
    "[color-scheme:light] dark:[color-scheme:dark]";

const labelClasses = "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

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
                    className={controlClasses}
                    disabled={disabled}
                >
                    <option value="">Select Currency</option>
                    {options.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                            {opt.mainCurrency}
                        </option>
                    ))}
                </select>
                {error && <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">{error}</p>}
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
                className={controlClasses}
                placeholder={placeholder}
                disabled={disabled}
                readOnly={disabled}
            />
            {error && <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">{error}</p>}
        </div>
    );
};

const fieldGrid = "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-2 items-start";

/* ---------------------------------------------------------------------------- */

const LMEMasterForm = ({ data, onBack }) => {
    const [orgId] = useState(localStorage.getItem("orgId") || "1000000006");
    const [branch] = useState(localStorage.getItem("branch") || "1000000011");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [currencies, setCurrencies] = useState([]);
    const [currencyLoading, setCurrencyLoading] = useState(false);
    const { addToast } = useToast();

    const [form, setForm] = useState({
        id: data?.id || null,
        currencyId: data?.currencyId || "",
        currencySymbol: data?.currencySymbol || "",
        currencyName: data?.currencyName || "",
        lmeRate: data?.lmeRate || "",
        lmeDateFrom: data?.lmeDateFrom || "",
        lmeDateTo: data?.lmeDateTo || "",
        active: data?.active ?? true,
    });

    // Fetch currencies
    useEffect(() => {
        const fetchCurrencies = async () => {
            setCurrencyLoading(true);
            try {
                const response = await lmeAPI.getCurrencies(orgId);
                console.log("Currency API Response:", response);

                if (response && response.paramObjectsMap && response.paramObjectsMap.currencyVO) {
                    setCurrencies(response.paramObjectsMap.currencyVO);
                } else if (response && response.data && response.data.paramObjectsMap && response.data.paramObjectsMap.currencyVO) {
                    setCurrencies(response.data.paramObjectsMap.currencyVO);
                } else {
                    console.warn("Unexpected currency response structure:", response);
                }
            } catch (error) {
                console.error("Error fetching currencies:", error);
            } finally {
                setCurrencyLoading(false);
            }
        };

        fetchCurrencies();
    }, [orgId]);

    // Fetch data by ID if editing and no data passed
    useEffect(() => {
        const fetchLMEData = async () => {
            if (data?.id) {
                setLoading(true);
                try {
                    const response = await lmeAPI.getLMEById(data.id);
                    console.log("Get LME By ID Response:", response);

                    let item = null;

                    // Handle the nested response structure
                    if (response) {
                        if (response.paramObjectsMap && response.paramObjectsMap.lMEVO) {
                            item = response.paramObjectsMap.lMEVO;
                        } else if (response.data && response.data.paramObjectsMap && response.data.paramObjectsMap.lMEVO) {
                            item = response.data.paramObjectsMap.lMEVO;
                        } else if (response.data) {
                            item = response.data;
                        }
                    }

                    if (item) {
                        // Extract currency information from nested object
                        let currencyId = "";
                        let currencySymbol = "";
                        let currencyName = "";

                        if (item.currencyName) {
                            // If currencyName is an object (nested structure)
                            if (typeof item.currencyName === 'object') {
                                currencyId = item.currencyName.id || "";
                                currencySymbol = item.currencyName.currency || "";
                                currencyName = item.currencyName.mainCurrency || item.currencyName.currencyDescription || "";
                            } else {
                                // If currencyName is a string
                                currencyName = item.currencyName || "";
                                currencySymbol = item.currencySymbol || "";
                            }
                        } else {
                            // Fallback to direct properties
                            currencySymbol = item.currencySymbol || "";
                            currencyName = item.currencyName || "";
                        }

                        // Determine active status
                        let activeStatus = true;
                        if (item.active === "Active") {
                            activeStatus = true;
                        } else if (item.active === "Inactive") {
                            activeStatus = false;
                        } else {
                            activeStatus = item.active ?? true;
                        }

                        setForm({
                            id: item.id || null,
                            currencyId: currencyId,
                            currencySymbol: currencySymbol,
                            currencyName: currencyName,
                            lmeRate: item.lmeRate || "",
                            lmeDateFrom: item.lmeDateFrom || "",
                            lmeDateTo: item.elmeDateTo || item.lmeDateTo || "",
                            active: activeStatus,
                        });
                    }
                } catch (error) {
                    console.error("Error fetching LME data:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchLMEData();
    }, [data]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }

        // If currency is selected, auto-fill the symbol
        if (name === "currencyId") {
            const selectedCurrency = currencies.find(c => c.id === parseInt(value));
            setForm((prev) => ({
                ...prev,
                currencyId: value,
                currencySymbol: selectedCurrency?.currency || "",
                currencyName: selectedCurrency?.mainCurrency || "",
            }));
        } else {
            setForm((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const validate = () => {
        const errors = {};

        if (!form.currencyId)
            errors.currencyId = "Currency is required";
        if (!form.lmeRate)
            errors.lmeRate = "LME Rate is required";
        if (!form.lmeDateFrom)
            errors.lmeDateFrom = "LME Date From is required";
        if (!form.lmeDateTo)
            errors.lmeDateTo = "LME Date To is required";

        // Validate date range
        if (form.lmeDateFrom && form.lmeDateTo && new Date(form.lmeDateTo) < new Date(form.lmeDateFrom)) {
            errors.lmeDateTo = "LME Date To must be after LME Date From";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setIsSubmitting(true);

        // Build payload - only include id if it exists (updating)
        const payload = {
            orgId: parseInt(orgId),
            branch: parseInt(branch),
            currencyName: parseInt(form.currencyId),
            lmeRate: parseFloat(form.lmeRate),
            lmeDateFrom: form.lmeDateFrom,
            elmeDateTo: form.lmeDateTo,
            active: form.active,
            createdBy: "ITC001",
            cancelRemarks: "",
            finyear: new Date().getFullYear().toString(),
        };

        // Only add id if it exists (for update)
        if (form.id) {
            payload.id = form.id;
        }

        console.log("Saving payload:", payload);

        try {
            const response = await lmeAPI.saveLME(payload);
            console.log("Save response:", response);
            const successMessage =
                response?.paramObjectsMap?.message ||
                (form.id && form.id > 0
                    ? "State updated successfully!"
                    : "State created successfully!");

            addToast(successMessage, "success");
            onBack();
        } catch (error) {
            console.error("Error saving LME:", error);
            addToast("Failed to save LME");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading || currencyLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-gray-500 dark:text-gray-400">Loading...</div>
            </div>
        );
    }

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
                    {form.id ? "Edit LME" : "Add LME"}
                </h2>
            </div>

            {/* Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">

                {/* Form Fields */}
                <div className={fieldGrid}>
                    <Field
                        label="Currency Name"
                        name="currencyId"
                        type="select"
                        value={form.currencyId}
                        onChange={handleChange}
                        error={fieldErrors.currencyId}
                        required
                        options={currencies}
                    />
                    <Field
                        label="Currency Symbol"
                        name="currencySymbol"
                        type="text"
                        value={form.currencySymbol}
                        onChange={handleChange}
                        placeholder="Auto-filled from selection"
                        disabled={true}
                    />
                    <Field
                        label="LME Rate"
                        name="lmeRate"
                        type="number"
                        value={form.lmeRate}
                        onChange={handleChange}
                        error={fieldErrors.lmeRate}
                        required
                        placeholder="Enter LME Rate"
                        step="0.01"
                    />
                    <Field
                        label="LME Date From"
                        name="lmeDateFrom"
                        type="date"
                        value={form.lmeDateFrom}
                        onChange={handleChange}
                        error={fieldErrors.lmeDateFrom}
                        required
                    />
                    <Field
                        label="LME Date To"
                        name="lmeDateTo"
                        type="date"
                        value={form.lmeDateTo}
                        onChange={handleChange}
                        error={fieldErrors.lmeDateTo}
                        required
                    />
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-2">
                    <label className={labelClasses}>Active</label>
                    <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, active: !prev.active }))}
                        className={`relative flex items-center w-12 h-6 rounded-full transition-colors ${form.active ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                            }`}
                    >
                        <span
                            className={`absolute h-5 w-5 bg-white rounded-full shadow transition-transform ${form.active ? "translate-x-6" : "translate-x-0.5"
                                }`}
                        />
                    </button>
                    <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
                        {form.active ? "Active" : "Inactive"}
                    </span>
                </div>

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
                        {isSubmitting ? "Saving..." : form.id ? "Update" : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LMEMasterForm;
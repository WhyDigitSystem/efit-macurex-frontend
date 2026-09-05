import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useToast } from "../../Toast/ToastContext";
import listOfValuesAPI from "../../../api/listOfValuesAPI";
import toolCategoryAPI from "../../../api/Production/toolCategoryAPI";

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

const labelClasses =
    "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

// Reduced field grid - single column with smaller width
const fieldGrid =
    "grid grid-cols-1 gap-x-3 gap-y-2 items-start";

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
    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
        {children}
    </h3>
);

const FormButtons = ({ onCancel, onSave, isSubmitting, saveLabel }) => (
    <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
        <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs whitespace-nowrap border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
            <X className="h-3 w-3" />
            Cancel
        </button>

        <button
            onClick={onSave}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs whitespace-nowrap text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
            <Save className="h-3 w-3" />
            {isSubmitting ? "Saving..." : saveLabel}
        </button>
    </div>
);

/* ---------------------------------------------------------------------------- */
/* Table helpers - Reduced width with Plus button above Action                  */

const TableWrapper = ({ children }) => (
    <div className="w-full overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700 max-w-md">
        <table className="w-full text-xs">{children}</table>
    </div>
);

const TableHead = ({ headers }) => (
    <thead className="bg-gray-100 dark:bg-gray-700">
        <tr>
            {headers.map((h, i) => (
                <th
                    key={i}
                    className={`p-1 whitespace-nowrap ${i === 0
                        ? "w-6 text-center"
                        : i === headers.length - 1
                            ? "w-12 text-center"
                            : "text-left"
                        } dark:text-white text-[10px]`}
                >
                    {h}
                </th>
            ))}
        </tr>
    </thead>
);

const TableRow = ({ children, index, onRemove, disabled }) => (
    <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
        <td className="p-1 text-center font-medium dark:text-white text-[10px]">
            {index + 1}
        </td>
        {children}
        <td className="p-1 text-center">
            <button
                type="button"
                onClick={onRemove}
                disabled={disabled}
                className={`h-4 w-4 rounded text-white flex items-center justify-center ${disabled
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                    }`}
            >
                <Trash2 size={8} />
            </button>
        </td>
    </tr>
);

const DynamicTable = ({
    columns,
    rows,
    onCellChange,
    onRemoveRow,
    onAddRow,
}) => (
    <div>
        {/* Categories header - same width as table */}
        <div className="w-full max-w-md flex items-center justify-between mb-1">
            <SectionHeader>Categories</SectionHeader>

            {/* Plus button aligned with Action column */}
            <div className="w-12 flex justify-center">
                <button
                    type="button"
                    onClick={onAddRow}
                    className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                >
                    <Plus size={12} />
                </button>
            </div>
        </div>

        <TableWrapper>
            <TableHead
                headers={["#", ...columns.map((c) => c.label), "Action"]}
            />

            <tbody>
                {rows.map((row, idx) => (
                    <TableRow
                        key={idx}
                        index={idx}
                        onRemove={() => onRemoveRow(idx)}
                        disabled={rows.length <= 1}
                    >
                        {columns.map((col) => (
                            <td className="p-1 align-top" key={col.key}>
                                <input
                                    type={col.type === "number" ? "number" : "text"}
                                    value={row[col.key] || ""}
                                    readOnly={col.readOnly}
                                    onChange={(e) =>
                                        onCellChange(
                                            idx,
                                            col.key,
                                            e.target.value
                                        )
                                    }
                                    className={
                                        col.readOnly
                                            ? "w-full h-6 px-1.5 rounded border text-xs leading-none bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"
                                            : "w-full h-6 px-1.5 rounded border text-xs leading-none transition-colors bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                                    }
                                />
                            </td>
                        ))}
                    </TableRow>
                ))}
            </tbody>
        </TableWrapper>
    </div>
);

/* ---------------------------------------------------------------------------- */

const ToolCategoryForm = ({ editId, editData, onBack, onSave }) => {
    const { addToast } = useToast();
    const orgId = Number(localStorage.getItem("orgId")) || 0;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [applicableForOptions, setApplicableForOptions] = useState([]);

    // Header state
    const [header, setHeader] = useState({
        applicableFor: "",
    });

    // Category rows state
    const [categoryRows, setCategoryRows] = useState([
        { category: "" },
    ]);

    /* ---------------- Load lookups ---------------- */

    const loadApplicableForOptions = useCallback(async () => {
        try {
            const res = await listOfValuesAPI.getListValuesGroup("TOOL_CATEGORY_APPLICABLE", orgId);
            console.log("Applicable For Options Response:", res);

            // Handle different response structures
            let optionsData = res;
            if (res?.paramObjectsMap?.listValues) {
                optionsData = res.paramObjectsMap.listValues;
            } else if (res?.data?.paramObjectsMap?.listValues) {
                optionsData = res.data.paramObjectsMap.listValues;
            } else if (Array.isArray(res)) {
                optionsData = res;
            }

            setApplicableForOptions(
                (optionsData || []).map((item) => ({
                    // Use the value/description as the option value (to send to API)
                    value: item.valuesDescription || item.valueDescription || item.value || item.id,
                    // Display the same as label
                    label: item.valuesDescription || item.valueDescription || item.value || item.id,
                    // Keep id for reference if needed
                    id: item.id
                }))
            );
        } catch (error) {
            console.error("Failed to load applicable for options:", error);
            setApplicableForOptions([]);
        }
    }, [orgId]);

    useEffect(() => {
        loadApplicableForOptions();
    }, [loadApplicableForOptions]);

    /* ---------------- Load edit data ---------------- */

    // Function to fetch data by ID
    const loadEditData = useCallback(async () => {
        if (!editId) return;

        setLoading(true);
        try {
            const response = await toolCategoryAPI.getToolCategoryById(editId);
            console.log("Edit Data Response:", response);

            // Extract data from response
            const data = response?.paramObjectsMap?.toolCategoryVO ||
                response?.data?.paramObjectsMap?.toolCategoryVO ||
                response;

            if (data) {
                // Set header fields - handle both spellings
                setHeader({
                    applicableFor: data.applicableFor || data.apllicableFor || "",
                });

                // Set category rows
                if (data.toolCategoryDetailResponseDTO?.length) {
                    setCategoryRows(
                        data.toolCategoryDetailResponseDTO.map((item) => ({
                            category: item.category || "",
                        }))
                    );
                } else if (data.toolCategoryDetailDTO?.length) {
                    setCategoryRows(
                        data.toolCategoryDetailDTO.map((item) => ({
                            category: item.category || "",
                        }))
                    );
                }
            }
        } catch (error) {
            console.error("Failed to load tool category for edit:", error);
            addToast("Failed to load tool category details", "error");
        } finally {
            setLoading(false);
        }
    }, [editId, addToast]);

    // Load edit data when editId changes
    useEffect(() => {
        if (editId) {
            loadEditData();
        } else if (editData) {
            // If editData is provided directly (fallback)
            setHeader({
                applicableFor: editData.applicableFor || editData.apllicableFor || "",
            });

            if (editData.toolCategoryDetailResponseDTO?.length) {
                setCategoryRows(
                    editData.toolCategoryDetailResponseDTO.map((item) => ({
                        category: item.category || "",
                    }))
                );
            } else if (editData.toolCategoryDetailDTO?.length) {
                setCategoryRows(
                    editData.toolCategoryDetailDTO.map((item) => ({
                        category: item.category || "",
                    }))
                );
            }
        }
    }, [editId, editData, loadEditData]);

    /* ---------------- Handlers ---------------- */

    const handleHeaderChange = (e) => {
        const { name, value } = e.target;
        if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
        setHeader((prev) => ({ ...prev, [name]: value }));
    };

    const handleCategoryCellChange = (idx, key, value) => {
        setCategoryRows((prev) =>
            prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row))
        );
    };

    const handleAddCategoryRow = () => {
        setCategoryRows((prev) => [...prev, { category: "" }]);
    };

    const handleRemoveCategoryRow = (idx) => {
        if (categoryRows.length <= 1) return;
        setCategoryRows((prev) => prev.filter((_, i) => i !== idx));
    };

    /* ---------------- Validation ---------------- */

    const validate = () => {
        const errors = {};

        if (!header.applicableFor) {
            errors.applicableFor = "Applicable For is required";
        }

        const hasValidCategory = categoryRows.some(
            (r) => r.category && r.category.trim() !== ""
        );
        if (!hasValidCategory) {
            errors.categories = "Add at least one category";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    /* ---------------- Save ---------------- */

    const handleSave = async () => {
        if (!validate()) {
            const firstError = Object.values(fieldErrors)[0];
            addToast(firstError, "error");
            return;
        }

        setIsSubmitting(true);

        const isUpdate = Boolean(editId);

        // Build the payload according to the API schema
        const payload = {
            orgId: orgId,
            apllicableFor: header.applicableFor,
            active: true,
            cancelRemarks: "",
            createdBy: localStorage.getItem("usersId") || "",
            toolCategoryDetailDTO: categoryRows
                .filter((r) => r.category && r.category.trim() !== "")
                .map((r) => ({
                    category: r.category.trim(),
                })),
            ...(isUpdate ? { id: editId } : {}),
        };

        // Add updatedBy for update
        if (isUpdate) {
            payload.updatedBy = localStorage.getItem("usersId") || "SYSTEM";
        }

        console.log("Saving payload:", payload);

        try {
            const response = await toolCategoryAPI.createUpdateToolCategory(payload);

            console.log("API Response:", response);

            const isSuccess = response?.status === true || response?.statusFlag === "Ok";

            if (isSuccess) {
                addToast(
                    isUpdate
                        ? "Tool Category updated successfully!"
                        : "Tool Category created successfully!",
                    "success"
                );
                if (onSave) onSave(payload);
                onBack();
            } else {
                const errorMessage = response?.paramObjectsMap?.message ||
                    response?.message ||
                    response?.errors?.[0]?.message ||
                    "Failed to save";
                addToast(errorMessage, "error");
            }
        } catch (error) {
            console.error("Save Error:", error);
            const errorMessage = error?.response?.data?.message ||
                error?.response?.data?.errors?.[0]?.message ||
                error?.message ||
                "Something went wrong";
            addToast(errorMessage, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500 dark:text-gray-400">Loading...</div>
            </div>
        );
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
                    {editId ? "Edit Tool Category" : "Add Tool Category"}
                </h2>
            </div>

            {/* Main Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
                {/* ---------------- Header Fields ---------------- */}
                <div>
                    <SectionHeader>Tool Category</SectionHeader>
                    <div className={fieldGrid}>
                        <div className="max-w-[200px]">
                            <Field
                                label="Applicable For"
                                name="applicableFor"
                                value={header.applicableFor}
                                onChange={handleHeaderChange}
                                error={fieldErrors.applicableFor}
                                options={applicableForOptions}
                                type="select"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* ---------------- Category Table ---------------- */}
                <div>
                    <DynamicTable
                        columns={[
                            { key: "category", label: "Category" },
                        ]}
                        rows={categoryRows}
                        onCellChange={handleCategoryCellChange}
                        onRemoveRow={handleRemoveCategoryRow}
                        onAddRow={handleAddCategoryRow}
                    />

                    {fieldErrors.categories && (
                        <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                            {fieldErrors.categories}
                        </p>
                    )}
                </div>

                <FormButtons
                    onCancel={onBack}
                    onSave={handleSave}
                    isSubmitting={isSubmitting}
                    saveLabel={editId ? "Update" : "Save"}
                />
            </div>
        </div>
    );
};

export default ToolCategoryForm;
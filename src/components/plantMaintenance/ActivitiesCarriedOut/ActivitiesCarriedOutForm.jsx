// ActivitiesCarriedOutForm.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useToast } from "../../Toast/ToastContext";
import branchAPI from "../../../api/branchAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";

const controlClasses =
    "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
    "bg-white dark:bg-gray-900 " +
    "border-gray-300 dark:border-gray-600 " +
    "text-gray-900 dark:text-gray-100 " +
    "placeholder-gray-400 dark:placeholder-gray-500 " +
    "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
    "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
    "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

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
    checked = false,
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
                    <option value="">Select an option</option>
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
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
                className={`${controlClasses} ${error ? "border-red-500" : ""}`}
                placeholder={placeholder}
                disabled={disabled}
            />
            {error && <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">{error}</p>}
        </div>
    );
};

const fieldGrid = "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-2 items-start";

const TableWrapper = ({ children }) => (
    <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
        <table className="w-full text-xs">{children}</table>
    </div>
);

const TableHead = ({ headers }) => (
    <thead className="bg-gray-100 dark:bg-gray-700">
        <tr>
            {headers.map((h, i) => (
                <th
                    key={i}
                    className={`p-1 ${i === 0 ? "w-8 text-center" : i === headers.length - 1 ? "w-20 text-left" : "text-left"} dark:text-white text-[10px] font-medium whitespace-nowrap`}
                >
                    {h}
                </th>
            ))}
        </tr>
    </thead>
);

const TableRow = ({
    children,
    index,
    onRemove,
    disabled,
    showDelete = true,
}) => (
    <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
        <td className="p-1 text-center font-medium dark:text-white">{index + 1}</td>
        {children}
        {showDelete && (
            <td className="p-1 text-center">
                <button
                    type="button"
                    onClick={onRemove}
                    disabled={disabled}
                    className={`h-5 w-5 rounded text-white flex items-center justify-center ${disabled
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                        }`}
                >
                    <Trash2 size={10} />
                </button>
            </td>
        )}
    </tr>
);

// Main Component
const ActivitiesCarriedOutForm = ({ data, onBack }) => {
    const [orgId] = useState(localStorage.getItem("orgId"));
    const [branchId] = useState(localStorage.getItem("branchId"));
    const { addToast } = useToast();

    const [activeTab, setActiveTab] = useState("activitiesDetails");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [generatingDocId, setGeneratingDocId] = useState(false);

    // Refs
    const branchesLoadedRef = useRef(false);
    const departmentsLoadedRef = useRef(false);
    const checkedByLoadedRef = useRef(false);
    const machineToolLoadedRef = useRef(false);
    const machineToolNoLoadedRef = useRef(false);
    const pmCheckListLoadedRef = useRef(false);
    const locationLoadedRef = useRef(false);
    const maintenanceTypeLoadedRef = useRef(false);
    const fromLocationLoadedRef = useRef(false);
    const itemCodeLoadedRef = useRef(false);

    // Dropdown options
    const [plantOptions, setPlantOptions] = useState([]);
    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [checkedByOptions, setCheckedByOptions] = useState([]);
    const [machineToolOptions, setMachineToolOptions] = useState([]);
    const [machineToolNoOptions, setMachineToolNoOptions] = useState([]);
    const [pmCheckListOptions, setPmCheckListOptions] = useState([]);
    const [locationOptions, setLocationOptions] = useState([]);
    const [maintenanceTypeOptions, setMaintenanceTypeOptions] = useState([]);
    const [fromLocationOptions, setFromLocationOptions] = useState([]);
    const [itemCodeOptions, setItemCodeOptions] = useState([]);

    // Form state
    const [form, setForm] = useState({
        plantId: data?.plantId || "",
        department: data?.department || "",
        checkedBy: data?.checkedBy || "",
        docId: data?.docId || "",
        date: data?.date || new Date().toISOString().split('T')[0],
        machineTool: data?.machineTool || "",
        machineToolNo: data?.machineToolNo || "",
        pmCheckListNo: data?.pmCheckListNo || "",
        location: data?.location || "",
        maintenanceType: data?.maintenanceType || "",
        fromLocation: data?.fromLocation || "",
    });

    // Activities Details Rows
    const [activityRows, setActivityRows] = useState([
        {
            id: 1,
            scheduledActivity: "",
            itemCode: "",
            itemDescription: "",
            fromTimeHH: "",
            fromTimeMM: "",
            toTimeHH: "",
            toTimeMM: "",
            checkingPoints: "",
            parameter: "",
            activitiesCarriedOut: "",
            status: "",
            date: "",
            nextActivity: "",
            noOfHrs: "",
            frequency: "",
            nextScheduleD: "",
        },
    ]);

    // Components Grid Rows
    const [componentRows, setComponentRows] = useState([
        {
            id: 1,
            itemCode: "",
            itemDescription: "",
            reqQty: "",
            rate: "",
            amount: "",
        },
    ]);

    // Description Rows
    const [descriptionRows, setDescriptionRows] = useState([
        {
            id: 1,
            description: "",
            reqQty: "",
            rate: "",
            amount: "",
            remarks: "",
        },
    ]);

    const loadBranches = useCallback(async () => {
        if (branchesLoadedRef.current) return;

        try {
            const response = await branchAPI.getBranchByOrgId(orgId);
            const options = (response || []).map(branch => ({
                value: branch.id,
                label: branch.branchName || branch.branchCode || branch.id,
            }));
            setPlantOptions(options);
            branchesLoadedRef.current = true;
        } catch (error) {
            console.error("Failed to load branches:", error);
            setPlantOptions([]);
        }
    }, [orgId]);

    // Load dropdowns from list of values
    const loadDropdown = useCallback(async (groupName, setter, ref) => {
        if (ref.current) return;

        try {
            const response = await listOfValuesAPI.getListValuesGroup(groupName, orgId);
            const options = (response || []).map(item => ({
                value: item.id,
                label: item.valuesDescription,
            }));
            setter(options);
            ref.current = true;
        } catch (error) {
            console.error(`Failed to load ${groupName}:`, error);
            setter([]);
        }
    }, [orgId]);

    // Load all dropdowns on mount
    useEffect(() => {
        loadBranches();
        loadDropdown("DEPARTMENT", setDepartmentOptions, departmentsLoadedRef);
        loadDropdown("CHECKED BY", setCheckedByOptions, checkedByLoadedRef);
        loadDropdown("MACHINE TOOL", setMachineToolOptions, machineToolLoadedRef);
        loadDropdown("MACHINE TOOL NO", setMachineToolNoOptions, machineToolNoLoadedRef);
        loadDropdown("PM CHECK LIST", setPmCheckListOptions, pmCheckListLoadedRef);
        loadDropdown("LOCATION", setLocationOptions, locationLoadedRef);
        loadDropdown("MAINTENANCE TYPE", setMaintenanceTypeOptions, maintenanceTypeLoadedRef);
        loadDropdown("FROM LOCATION", setFromLocationOptions, fromLocationLoadedRef);
        loadDropdown("ITEM CODE", setItemCodeOptions, itemCodeLoadedRef);
    }, []);

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

    // Activity Row Change
    const handleActivityRowChange = (index, field, value) => {
        const updatedRows = [...activityRows];
        updatedRows[index][field] = value;
        setActivityRows(updatedRows);
    };

    // Component Row Change
    const handleComponentRowChange = (index, field, value) => {
        const updatedRows = [...componentRows];
        updatedRows[index][field] = value;

        // Auto-calculate amount = rate * reqQty
        if (field === "rate" || field === "reqQty") {
            const rate = parseFloat(updatedRows[index].rate) || 0;
            const reqQty = parseFloat(updatedRows[index].reqQty) || 0;
            updatedRows[index].amount = (rate * reqQty).toFixed(2);
        }

        setComponentRows(updatedRows);
    };

    // Description Row Change
    const handleDescriptionRowChange = (index, field, value) => {
        const updatedRows = [...descriptionRows];
        updatedRows[index][field] = value;

        // Auto-calculate amount = rate * reqQty
        if (field === "rate" || field === "reqQty") {
            const rate = parseFloat(updatedRows[index].rate) || 0;
            const reqQty = parseFloat(updatedRows[index].reqQty) || 0;
            updatedRows[index].amount = (rate * reqQty).toFixed(2);
        }

        setDescriptionRows(updatedRows);
    };

    const handleAddRow = (type) => {
        if (type === "activity") {
            setActivityRows([
                ...activityRows,
                {
                    id: Date.now(),
                    scheduledActivity: "",
                    itemCode: "",
                    itemDescription: "",
                    fromTimeHH: "",
                    fromTimeMM: "",
                    toTimeHH: "",
                    toTimeMM: "",
                    checkingPoints: "",
                    parameter: "",
                    activitiesCarriedOut: "",
                    status: "",
                    date: "",
                    nextActivity: "",
                    noOfHrs: "",
                    frequency: "",
                    nextScheduleD: "",
                },
            ]);
        } else if (type === "component") {
            setComponentRows([
                ...componentRows,
                {
                    id: Date.now(),
                    itemCode: "",
                    itemDescription: "",
                    reqQty: "",
                    rate: "",
                    amount: "",
                },
            ]);
        } else if (type === "description") {
            setDescriptionRows([
                ...descriptionRows,
                {
                    id: Date.now(),
                    description: "",
                    reqQty: "",
                    rate: "",
                    amount: "",
                    remarks: "",
                },
            ]);
        }
    };

    const handleRemoveRow = (type, index) => {
        if (type === "activity" && activityRows.length > 1) {
            setActivityRows(activityRows.filter((_, i) => i !== index));
        } else if (type === "component" && componentRows.length > 1) {
            setComponentRows(componentRows.filter((_, i) => i !== index));
        } else if (type === "description" && descriptionRows.length > 1) {
            setDescriptionRows(descriptionRows.filter((_, i) => i !== index));
        }
    };

    const validate = () => {
        const errors = {};
        if (!form.plantId) errors.plantId = "Plant ID is required";
        if (!form.department) errors.department = "Department is required";
        if (!form.machineTool) errors.machineTool = "Machine/Tool/Inst. is required";
        if (!form.date) errors.date = "Date is required";
        if (!form.maintenanceType) errors.maintenanceType = "Maintenance Type is required";
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setIsSubmitting(true);

        try {
            // Calculate total amount from component rows
            const totalAmount = componentRows.reduce((sum, row) => {
                return sum + (parseFloat(row.amount) || 0);
            }, 0);

            const payload = {
                ...(data?.id ? { id: data.id } : {}),
                plantId: form.plantId,
                department: form.department,
                checkedBy: form.checkedBy,
                docId: form.docId,
                date: form.date,
                machineTool: form.machineTool,
                machineToolNo: form.machineToolNo,
                pmCheckListNo: form.pmCheckListNo,
                location: form.location,
                maintenanceType: form.maintenanceType,
                fromLocation: form.fromLocation,
                totalAmount: totalAmount,
                activities: activityRows.map(row => ({
                    scheduledActivity: row.scheduledActivity,
                    itemCode: row.itemCode,
                    itemDescription: row.itemDescription,
                    fromTimeHH: row.fromTimeHH,
                    fromTimeMM: row.fromTimeMM,
                    toTimeHH: row.toTimeHH,
                    toTimeMM: row.toTimeMM,
                    checkingPoints: row.checkingPoints,
                    parameter: row.parameter,
                    activitiesCarriedOut: row.activitiesCarriedOut,
                    status: row.status,
                    date: row.date,
                    nextActivity: row.nextActivity,
                    noOfHrs: row.noOfHrs,
                    frequency: row.frequency,
                    nextScheduleD: row.nextScheduleD,
                })),
                components: componentRows.map(row => ({
                    itemCode: row.itemCode,
                    itemDescription: row.itemDescription,
                    reqQty: row.reqQty,
                    rate: row.rate,
                    amount: row.amount,
                })),
                descriptions: descriptionRows.map(row => ({
                    description: row.description,
                    reqQty: row.reqQty,
                    rate: row.rate,
                    amount: row.amount,
                    remarks: row.remarks,
                })),
                createdBy: localStorage.getItem("usersId") || "",
                orgId: Number(orgId),
                branchId: Number(branchId),
            };

            console.log("Submit Payload:", payload);

            addToast(
                data?.id
                    ? "Activities Carried Out updated successfully!"
                    : "Activities Carried Out created successfully!",
                "success"
            );
            onBack();
        } catch (err) {
            console.error("Save Activities Carried Out Error:", err);
            addToast("Something went wrong.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Activities Details Columns
    const activityColumns = [
        { key: "scheduledActivity", label: "Scheduled Activity *", type: "select", options: [] },
        { key: "itemCode", label: "Item Code", type: "select", options: itemCodeOptions },
        { key: "itemDescription", label: "Item Description", type: "text" },
        { key: "fromTimeHH", label: "From Time (HH) *", type: "text", placeholder: "HH" },
        { key: "fromTimeMM", label: "From Time (MM)", type: "text", placeholder: "MM" },
        { key: "toTimeHH", label: "To Time (HH) *", type: "text", placeholder: "HH" },
        { key: "toTimeMM", label: "To Time (MM)", type: "text", placeholder: "MM" },
        { key: "checkingPoints", label: "Checking Points", type: "text" },
        { key: "parameter", label: "Parameter", type: "text" },
        { key: "activitiesCarriedOut", label: "Activities Carried Out", type: "text" },
        {
            key: "status", label: "Status *", type: "select", options: [
                { value: "completed", label: "Completed" },
                { value: "pending", label: "Pending" },
                { value: "inProgress", label: "In Progress" },
            ]
        },
        { key: "date", label: "Date", type: "date" },
        {
            key: "nextActivity", label: "Next Activity *", type: "select", options: [
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
            ]
        },
        { key: "noOfHrs", label: "No. Of Hrs", type: "text" },
        { key: "frequency", label: "Frequency", type: "text" },
        { key: "nextScheduleD", label: "Next Schedule Date", type: "date" },
    ];

    // Component Grid Columns
    const componentColumns = [
        { key: "itemCode", label: "Item Code", type: "select", options: itemCodeOptions },
        { key: "itemDescription", label: "Item Description", type: "text" },
        { key: "reqQty", label: "Req. Qty", type: "number", step: "0.01" },
        { key: "rate", label: "Rate", type: "number", step: "0.01" },
        { key: "amount", label: "Amount", type: "number", step: "0.01", disabled: true },
        { key: "remarks", label: "Remarks", type: "text" },
    ];

    const renderTableRows = (rows, columns, handleChange, handleRemove, type) => {
        return rows.map((row, index) => (
            <tr key={row.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="p-1 text-center font-medium dark:text-gray-300">
                    {index + 1}
                </td>
                {columns.map((col) => {
                    const value = row[col.key] || "";

                    if (col.type === "select") {
                        return (
                            <td key={col.key} className="p-1">
                                <select
                                    value={value}
                                    onChange={(e) => handleChange(index, col.key, e.target.value)}
                                    className={`${controlClasses} h-8 text-xs w-full min-w-[100px]`}
                                >
                                    <option value="">Select</option>
                                    {col.options.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </td>
                        );
                    }

                    return (
                        <td key={col.key} className="p-1">
                            <input
                                type={col.type === "date" ? "date" : col.type || "text"}
                                value={value}
                                onChange={(e) => handleChange(index, col.key, e.target.value)}
                                className={`${controlClasses} h-8 text-xs w-full min-w-[80px]`}
                                placeholder={col.placeholder || col.label}
                                step={col.step}
                                disabled={col.disabled}
                            />
                        </td>
                    );
                })}
                <td className="p-1 text-center">
                    <button
                        type="button"
                        onClick={() => handleRemove(type, index)}
                        disabled={rows.length <= 1}
                        className={`h-5 w-5 rounded text-white flex items-center justify-center transition-colors ${rows.length <= 1
                            ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                            }`}
                    >
                        <Trash2 size={10} />
                    </button>
                </td>
            </tr>
        ));
    };

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
                    {data?.id ? "Edit Activities Carried Out" : "Add Activities Carried Out"}
                </h2>
            </div>

            {/* Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">

                {/* Form Fields */}
                <div className={fieldGrid}>
                    <Field
                        type="select"
                        label="Plant ID"
                        name="plantId"
                        value={form.plantId}
                        onChange={handleChange}
                        error={fieldErrors.plantId}
                        required
                        options={plantOptions}
                    />
                    <Field
                        type="select"
                        label="Department"
                        name="department"
                        value={form.department}
                        onChange={handleChange}
                        error={fieldErrors.department}
                        required
                        options={departmentOptions}
                    />
                    <Field
                        type="select"
                        label="Checked By"
                        name="checkedBy"
                        value={form.checkedBy}
                        onChange={handleChange}
                        options={checkedByOptions}
                    />
                    <Field
                        label="Doc ID"
                        name="docId"
                        value={form.docId}
                        onChange={handleChange}
                        placeholder={generatingDocId ? "Generating..." : "Auto"}
                        disabled={true}
                    />
                    <Field
                        type="select"
                        label="Select Machine/Tool/Inst."
                        name="machineTool"
                        value={form.machineTool}
                        onChange={handleChange}
                        error={fieldErrors.machineTool}
                        required
                        options={machineToolOptions}
                    />
                    <Field
                        label="Date"
                        name="date"
                        type="date"
                        value={form.date}
                        onChange={handleChange}
                        error={fieldErrors.date}
                        required
                    />
                    <Field
                        type="select"
                        label="Machine / Tool / Inst. No."
                        name="machineToolNo"
                        value={form.machineToolNo}
                        onChange={handleChange}
                        options={machineToolNoOptions}
                    />
                    <Field
                        type="select"
                        label="PM Check List No"
                        name="pmCheckListNo"
                        value={form.pmCheckListNo}
                        onChange={handleChange}
                        options={pmCheckListOptions}
                    />
                    <Field
                        type="select"
                        label="Location"
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        options={locationOptions}
                    />
                    <Field
                        type="select"
                        label="Maintenance Type"
                        name="maintenanceType"
                        value={form.maintenanceType}
                        onChange={handleChange}
                        error={fieldErrors.maintenanceType}
                        required
                        options={maintenanceTypeOptions}
                    />
                    <Field
                        type="select"
                        label="From Location"
                        name="fromLocation"
                        value={form.fromLocation}
                        onChange={handleChange}
                        options={fromLocationOptions}
                    />
                </div>

                {/* Tabs */}
                <div className="flex items-center border-b border-gray-200 dark:border-gray-700 mt-4">
                    <button
                        type="button"
                        onClick={() => setActiveTab("activitiesDetails")}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-t transition-colors ${activeTab === "activitiesDetails"
                            ? "bg-blue-600 text-white"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                    >
                        Activities Details
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("componentsGrid")}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-t transition-colors ${activeTab === "componentsGrid"
                            ? "bg-blue-600 text-white"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                    >
                        Components Grid
                    </button>
                </div>

                {/* Activities Details Tab */}
                {activeTab === "activitiesDetails" && (
                    <div className="mt-2">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Activities Details
                            </h3>
                            <button
                                type="button"
                                onClick={() => handleAddRow("activity")}
                                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                            >
                                <Plus size={12} />
                            </button>
                        </div>

                        <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
                            <table className="w-full text-xs min-w-[1200px]">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        <th className="p-1 text-center w-10 dark:text-gray-200">S.no</th>
                                        {activityColumns.map((col) => (
                                            <th
                                                key={col.key}
                                                className="p-1 text-left dark:text-gray-200 text-[10px] font-medium whitespace-nowrap"
                                            >
                                                {col.label}
                                            </th>
                                        ))}
                                        <th className="p-1 text-center w-10 dark:text-gray-200">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {renderTableRows(
                                        activityRows,
                                        activityColumns,
                                        handleActivityRowChange,
                                        handleRemoveRow,
                                        "activity"
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Components Grid Tab */}
                {activeTab === "componentsGrid" && (
                    <div className="mt-2">
                        {/* Component Grid Section */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                    Component Grid
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => handleAddRow("component")}
                                    className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                                >
                                    <Plus size={12} />
                                </button>
                            </div>

                            <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
                                <table className="w-full text-xs min-w-[600px]">
                                    <thead className="bg-gray-100 dark:bg-gray-700">
                                        <tr>
                                            <th className="p-1 text-center w-10 dark:text-gray-200">S.no</th>
                                            {componentColumns.map((col) => (
                                                <th
                                                    key={col.key}
                                                    className="p-1 text-left dark:text-gray-200 text-[10px] font-medium whitespace-nowrap"
                                                >
                                                    {col.label}
                                                </th>
                                            ))}
                                            <th className="p-1 text-center w-10 dark:text-gray-200">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {renderTableRows(
                                            componentRows,
                                            componentColumns,
                                            handleComponentRowChange,
                                            handleRemoveRow,
                                            "component"
                                        )}
                                    </tbody>
                                </table>
                            </div>
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
                        {isSubmitting ? "Saving..." : data?.id ? "Update" : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActivitiesCarriedOutForm;
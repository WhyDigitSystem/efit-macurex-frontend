// MachineToolBreakdownForm.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeft, Save, X, Plus, Trash2, Upload } from "lucide-react";
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

// Main Component
const MachineToolBreakdownForm = ({ data, onBack }) => {
    const [orgId] = useState(localStorage.getItem("orgId"));
    const [branchId] = useState(localStorage.getItem("branchId"));
    const { addToast } = useToast();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [generatingDocId, setGeneratingDocId] = useState(false);

    // Refs
    const branchesLoadedRef = useRef(false);
    const departmentsLoadedRef = useRef(false);
    const machineToolLoadedRef = useRef(false);
    const machineToolIdLoadedRef = useRef(false);
    const pmChecklistLoadedRef = useRef(false);
    const operatorNameLoadedRef = useRef(false);
    const maintenanceTypeLoadedRef = useRef(false);
    const natureOfBreakdownLoadedRef = useRef(false);
    const natureOfProblemLoadedRef = useRef(false);
    const estimatedTimeLoadedRef = useRef(false);
    const breakdownTypeLoadedRef = useRef(false);

    // Dropdown options
    const [plantOptions, setPlantOptions] = useState([]);
    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [machineToolOptions, setMachineToolOptions] = useState([]);
    const [machineToolIdOptions, setMachineToolIdOptions] = useState([]);
    const [pmChecklistOptions, setPmChecklistOptions] = useState([]);
    const [operatorNameOptions, setOperatorNameOptions] = useState([]);
    const [maintenanceTypeOptions, setMaintenanceTypeOptions] = useState([]);
    const [natureOfBreakdownOptions, setNatureOfBreakdownOptions] = useState([]);
    const [natureOfProblemOptions, setNatureOfProblemOptions] = useState([]);
    const [estimatedTimeOptions, setEstimatedTimeOptions] = useState([]);
    const [breakdownTypeOptions, setBreakdownTypeOptions] = useState([]);

    // Form state
    const [form, setForm] = useState({
        plantId: data?.plantId || "",
        department: data?.department || "",
        breakdownNo: data?.breakdownNo || "",
        machineTool: data?.machineTool || "",
        date: data?.date || new Date().toISOString().split('T')[0],
        machineToolId: data?.machineToolId || "",
        machineName: data?.machineName || "",
        pmChecklistNo: data?.pmChecklistNo || "",
        location: data?.location || "",
        breakdownTime: data?.breakdownTime || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        reportedDate: data?.reportedDate || new Date().toISOString().split('T')[0],
        reportedTime: data?.reportedTime || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        operatorName: data?.operatorName || "",
        maintenanceType: data?.maintenanceType || "",
        natureOfBreakdown: data?.natureOfBreakdown || "",
        natureOfProblem: data?.natureOfProblem || "",
        estimatedTime: data?.estimatedTime || "",
        breakdownType: data?.breakdownType || "",
        remarks: data?.remarks || "",
        image: data?.image || null,
    });

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
        loadDropdown("MACHINE TOOL", setMachineToolOptions, machineToolLoadedRef);
        loadDropdown("MACHINE TOOL ID", setMachineToolIdOptions, machineToolIdLoadedRef);
        loadDropdown("PM CHECKLIST", setPmChecklistOptions, pmChecklistLoadedRef);
        loadDropdown("OPERATOR NAME", setOperatorNameOptions, operatorNameLoadedRef);
        loadDropdown("MAINTENANCE TYPE", setMaintenanceTypeOptions, maintenanceTypeLoadedRef);
        loadDropdown("NATURE OF BREAKDOWN", setNatureOfBreakdownOptions, natureOfBreakdownLoadedRef);
        loadDropdown("NATURE OF PROBLEM", setNatureOfProblemOptions, natureOfProblemLoadedRef);
        loadDropdown("ESTIMATED TIME", setEstimatedTimeOptions, estimatedTimeLoadedRef);
        loadDropdown("BREAKDOWN TYPE", setBreakdownTypeOptions, breakdownTypeLoadedRef);
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setForm(prev => ({
                    ...prev,
                    image: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const validate = () => {
        const errors = {};
        if (!form.plantId) errors.plantId = "Plant ID is required";
        if (!form.department) errors.department = "Department is required";
        if (!form.machineTool) errors.machineTool = "Machine/Tool/Inst. is required";
        if (!form.date) errors.date = "Date is required";
        if (!form.breakdownTime) errors.breakdownTime = "Breakdown Time is required";
        if (!form.reportedDate) errors.reportedDate = "Reported Date is required";
        if (!form.reportedTime) errors.reportedTime = "Reported Time is required";
        if (!form.maintenanceType) errors.maintenanceType = "Maintenance Type is required";
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setIsSubmitting(true);

        try {
            const payload = {
                ...(data?.id ? { id: data.id } : {}),
                plantId: form.plantId,
                department: form.department,
                breakdownNo: form.breakdownNo,
                machineTool: form.machineTool,
                date: form.date,
                machineToolId: form.machineToolId,
                machineName: form.machineName,
                pmChecklistNo: form.pmChecklistNo,
                location: form.location,
                breakdownTime: form.breakdownTime,
                reportedDate: form.reportedDate,
                reportedTime: form.reportedTime,
                operatorName: form.operatorName,
                maintenanceType: form.maintenanceType,
                natureOfBreakdown: form.natureOfBreakdown,
                natureOfProblem: form.natureOfProblem,
                estimatedTime: form.estimatedTime,
                breakdownType: form.breakdownType,
                remarks: form.remarks,
                image: form.image,
                createdBy: localStorage.getItem("usersId") || "",
                orgId: Number(orgId),
                branchId: Number(branchId),
            };

            console.log("Submit Payload:", payload);

            addToast(
                data?.id
                    ? "Machine/Tool Breakdown updated successfully!"
                    : "Machine/Tool Breakdown created successfully!",
                "success"
            );
            onBack();
        } catch (err) {
            console.error("Save Machine/Tool Breakdown Error:", err);
            addToast("Something went wrong.", "error");
        } finally {
            setIsSubmitting(false);
        }
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
                    {data?.id ? "Edit Machine/Tool Breakdown" : "Add Machine/Tool Breakdown"}
                </h2>
            </div>

            {/* Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">

                {/* Form Fields - Row 1 */}
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
                        label="Breakdown No"
                        name="breakdownNo"
                        value={form.breakdownNo}
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
                        label="Machine / Tool ID/Inst."
                        name="machineToolId"
                        value={form.machineToolId}
                        onChange={handleChange}
                        options={machineToolIdOptions}
                    />
                    <Field
                        label="Machine Name"
                        name="machineName"
                        value={form.machineName}
                        onChange={handleChange}
                        placeholder="Machine Name"
                    />
                    <Field
                        type="select"
                        label="PM Checklist No."
                        name="pmChecklistNo"
                        value={form.pmChecklistNo}
                        onChange={handleChange}
                        options={pmChecklistOptions}
                    />
                    <Field
                        label="Location"
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        placeholder="Location"
                    />
                    <Field
                        label="Breakdown Time"
                        name="breakdownTime"
                        type="time"
                        value={form.breakdownTime}
                        onChange={handleChange}
                        error={fieldErrors.breakdownTime}
                        required
                        step="1"
                    />
                    <Field
                        label="Reported Date"
                        name="reportedDate"
                        type="date"
                        value={form.reportedDate}
                        onChange={handleChange}
                        error={fieldErrors.reportedDate}
                        required
                    />
                    <Field
                        label="Reported Time"
                        name="reportedTime"
                        type="time"
                        value={form.reportedTime}
                        onChange={handleChange}
                        error={fieldErrors.reportedTime}
                        required
                        step="1"
                    />
                </div>

                {/* Image Upload */}
                <div className="mt-2">
                    <label className={labelClasses}>
                        Image
                    </label>
                    <div className="flex items-center gap-4">
                        <label className="cursor-pointer">
                            <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <Upload size={16} className="text-gray-500 dark:text-gray-400" />
                                <span className="text-xs text-gray-600 dark:text-gray-300">Upload Image</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </div>
                        </label>
                        {form.image && (
                            <div className="relative">
                                <img
                                    src={form.image}
                                    alt="Preview"
                                    className="h-16 w-16 object-cover rounded border border-gray-200 dark:border-gray-700"
                                />
                                <button
                                    type="button"
                                    onClick={() => setForm(prev => ({ ...prev, image: null }))}
                                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600"
                                >
                                    <X size={10} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Second Row of Fields */}
                <div className={fieldGrid}>
                    <Field
                        type="select"
                        label="Operator Name"
                        name="operatorName"
                        value={form.operatorName}
                        onChange={handleChange}
                        options={operatorNameOptions}
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
                        label="Nature Of Breakdown"
                        name="natureOfBreakdown"
                        value={form.natureOfBreakdown}
                        onChange={handleChange}
                        options={natureOfBreakdownOptions}
                    />
                    <Field
                        type="select"
                        label="Nature of Problem"
                        name="natureOfProblem"
                        value={form.natureOfProblem}
                        onChange={handleChange}
                        options={natureOfProblemOptions}
                    />
                    <Field
                        type="select"
                        label="Estimated Time (Hrs/Min)"
                        name="estimatedTime"
                        value={form.estimatedTime}
                        onChange={handleChange}
                        options={estimatedTimeOptions}
                    />
                    <Field
                        type="select"
                        label="Breakdown Type"
                        name="breakdownType"
                        value={form.breakdownType}
                        onChange={handleChange}
                        options={breakdownTypeOptions}
                    />
                    <Field
                        label="Remarks"
                        name="remarks"
                        value={form.remarks}
                        onChange={handleChange}
                        placeholder="Enter remarks"
                        className="col-span-2"
                    />
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
                        {isSubmitting ? "Saving..." : data?.id ? "Update" : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MachineToolBreakdownForm;
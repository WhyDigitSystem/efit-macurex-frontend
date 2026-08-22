import React, { useState, useEffect, useCallback, useRef } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useToast } from "../../Toast/ToastContext";
import branchAPI from "../../../api/branchAPI";
import machineSettingPlanAPI from "../../../api/Production/machineSettingPlanAPI";

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

// ===================== Reusable Components =====================

const SelectField = ({
    control,
    name,
    label,
    options,
    required,
    errors,
    onChange,
    disabled,
    placeholder = "-- Select --",
}) => {
    const getError = () => {
        const parts = name.split(".");
        let error = errors;
        for (const part of parts) {
            if (error && error[part]) {
                error = error[part];
            } else {
                return null;
            }
        }
        return error?.message;
    };

    const errorMessage = getError();

    return (
        <div>
            <label className={labelClasses}>
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <Controller
                name={name}
                control={control}
                rules={required ? { required: `${label} is required` } : undefined}
                render={({ field }) => (
                    <select
                        {...field}
                        className={`${controlClasses} ${errorMessage ? "border-red-500 focus:border-red-500" : ""}`}
                        onChange={(e) => {
                            field.onChange(e);
                            if (onChange) {
                                onChange(e.target.value);
                            }
                        }}
                        disabled={disabled}
                    >
                        <option value="">{placeholder}</option>
                        {options.map((opt) => (
                            <option
                                key={typeof opt === "object" ? opt.value : opt}
                                value={typeof opt === "object" ? opt.value : opt}
                            >
                                {typeof opt === "object" ? opt.label : opt}
                            </option>
                        ))}
                    </select>
                )}
            />
            {errorMessage && (
                <p className="text-red-500 text-[11px] mt-0.5">{errorMessage}</p>
            )}
        </div>
    );
};

const InputField = ({
    control,
    name,
    label,
    type = "text",
    required,
    placeholder,
    errors,
    disabled,
    readOnly = false,
    step,
}) => {
    const getError = () => {
        const parts = name.split(".");
        let error = errors;
        for (const part of parts) {
            if (error && error[part]) {
                error = error[part];
            } else {
                return null;
            }
        }
        return error?.message;
    };

    const errorMessage = getError();

    return (
        <div>
            <label className={labelClasses}>
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <Controller
                name={name}
                control={control}
                rules={{
                    ...(required && {
                        required: `${label} is required`,
                    }),
                }}
                render={({ field }) => (
                    <input
                        {...field}
                        type={type}
                        step={step}
                        className={`${controlClasses} ${errorMessage ? "border-red-500 focus:border-red-500" : ""} ${readOnly ? "bg-gray-50 dark:bg-gray-800" : ""}`}
                        placeholder={placeholder}
                        disabled={disabled}
                        readOnly={readOnly}
                    />
                )}
            />
            {errorMessage && (
                <p className="text-red-500 text-[11px] mt-0.5">{errorMessage}</p>
            )}
        </div>
    );
};

const TextareaField = ({
    control,
    name,
    label,
    required,
    placeholder,
    errors,
    disabled,
    rows = 3,
    className = "",
}) => {
    const getError = () => {
        const parts = name.split(".");
        let error = errors;
        for (const part of parts) {
            if (error && error[part]) {
                error = error[part];
            } else {
                return null;
            }
        }
        return error?.message;
    };

    const errorMessage = getError();

    return (
        <div className={className}>
            <label className={labelClasses}>
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <Controller
                name={name}
                control={control}
                rules={{
                    ...(required && {
                        required: `${label} is required`,
                    }),
                }}
                render={({ field }) => (
                    <textarea
                        {...field}
                        rows={rows}
                        className={`w-full px-2 py-1.5 rounded border text-xs leading-snug transition-colors resize-none bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 ${errorMessage ? "border-red-500 focus:border-red-500" : ""}`}
                        placeholder={placeholder}
                        disabled={disabled}
                    />
                )}
            />
            {errorMessage && (
                <p className="text-red-500 text-[11px] mt-0.5">{errorMessage}</p>
            )}
        </div>
    );
};

// ===================== Table Components =====================

const TableWrapper = ({ children }) => (
    <div className="w-full overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
        <table className="w-full min-w-max text-xs">{children}</table>
    </div>
);

const TableHead = ({ headers }) => (
    <thead className="bg-gray-100 dark:bg-gray-700">
        <tr>
            {headers.map((h, i) => (
                <th
                    key={i}
                    className={`p-2 whitespace-nowrap ${i === 0 ? "w-8 text-center" : i === headers.length - 1 ? "w-20 text-left" : "text-left"} text-gray-700 dark:text-gray-200 text-[10px] font-medium`}
                >
                    {h}
                </th>
            ))}
        </tr>
    </thead>
);

const TableRow = ({ children, index, onRemove, disabled, showDelete = true }) => (
    <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
        <td className="p-2 text-center font-medium dark:text-white text-[10px]">{index + 1}</td>
        {children}
        {showDelete && (
            <td className="p-2 text-center">
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

const InputCell = ({
    control,
    name,
    type = "text",
    step,
    placeholder,
    required,
    errors,
    disabled,
    readOnly = false,
}) => {
    const getError = () => {
        const parts = name.split(".");
        let error = errors;
        for (const part of parts) {
            if (error && error[part]) {
                error = error[part];
            } else {
                return null;
            }
        }
        return error?.message;
    };

    const errorMessage = getError();

    return (
        <td className="p-2 align-top min-w-[100px]">
            <Controller
                name={name}
                control={control}
                rules={required ? { required: "This field is required" } : undefined}
                render={({ field }) => (
                    <input
                        {...field}
                        type={type}
                        step={step}
                        className={`${controlClasses} ${errorMessage ? "border-red-500 focus:border-red-500" : ""} ${readOnly ? "bg-gray-50 dark:bg-gray-800" : ""}`}
                        placeholder={placeholder}
                        disabled={disabled}
                        readOnly={readOnly}
                    />
                )}
            />
            {errorMessage && (
                <p className="text-red-500 text-[9px] mt-0.5">{errorMessage}</p>
            )}
        </td>
    );
};

const todayISO = () => new Date().toISOString().slice(0, 10);

const getDefaultValues = () => ({
    plantId: "",
    docNo: "",
    date: todayISO(),
    itemCode: "",
    itemDescription: "",
    operationNo: "",
    operationName: "",
    machineNo: "",
    machineName: "",
    processSheetNo: "",
    make: "",
    msetDetails: [
        {
            parameter: "",
            value: "",
        },
    ],
    preparedBy: "",
    approvedBy: "",
});

const MachineSettingPlanForm = ({ onBack, onSave, editData, editId }) => {
    const ORG_ID = parseInt(localStorage.getItem("orgId"));
    const BRANCH_ID = parseInt(localStorage.getItem("branchId"));
    const { addToast } = useToast();
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [plantOptions, setPlantOptions] = useState([]);
    const [loadingPlants, setLoadingPlants] = useState(false);
    const [itemOptions, setItemOptions] = useState([]);
    const [operationOptions, setOperationOptions] = useState([]);
    const [machineOptions, setMachineOptions] = useState([]);
    const [processSheetOptions, setProcessSheetOptions] = useState([]);
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [isDataLoadedRef, setIsDataLoadedRef] = useState(false);
    const [activeTab, setActiveTab] = useState("msetDetail");

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        mode: "onTouched",
        defaultValues: editData || getDefaultValues(),
    });

    const msetDetailsArray = useFieldArray({
        control,
        name: "msetDetails",
    });

    // Watch values for auto-fill
    const watchItemCode = watch("itemCode");
    const watchOperationNo = watch("operationNo");
    const watchMachineNo = watch("machineNo");

    // Load Plants
    const loadPlants = useCallback(async () => {
        setLoadingPlants(true);
        try {
            const response = await branchAPI.getBranchByOrgId(ORG_ID);
            const options = (response || []).map((branch) => ({
                value: branch.id,
                label: branch.branchName,
            }));
            setPlantOptions(options);
        } catch (error) {
            console.error("Failed to load plants:", error);
            setPlantOptions([]);
            addToast("Failed to load plant data", "error");
        } finally {
            setLoadingPlants(false);
        }
    }, [ORG_ID, addToast]);

    // Load Items
    const loadItems = useCallback(async () => {
        try {
            const response = await machineSettingPlanAPI.getItems(ORG_ID, BRANCH_ID);
            const options = (response || []).map((item) => ({
                value: item.id,
                label: item.itemCode + " - " + item.itemDescription,
                description: item.itemDescription,
            }));
            setItemOptions(options);
        } catch (error) {
            console.error("Failed to load items:", error);
            setItemOptions([]);
        }
    }, [ORG_ID, BRANCH_ID]);

    // Load Operations
    const loadOperations = useCallback(async () => {
        try {
            const response = await machineSettingPlanAPI.getOperations(ORG_ID, BRANCH_ID);
            const options = (response || []).map((op) => ({
                value: op.id,
                label: op.operationCode + " - " + op.operationName,
                name: op.operationName,
            }));
            setOperationOptions(options);
        } catch (error) {
            console.error("Failed to load operations:", error);
            setOperationOptions([]);
        }
    }, [ORG_ID, BRANCH_ID]);

    // Load Machines
    const loadMachines = useCallback(async () => {
        try {
            const response = await machineSettingPlanAPI.getMachines(ORG_ID, BRANCH_ID);
            const options = (response || []).map((machine) => ({
                value: machine.id,
                label: machine.machineCode + " - " + machine.machineName,
                name: machine.machineName,
            }));
            setMachineOptions(options);
        } catch (error) {
            console.error("Failed to load machines:", error);
            setMachineOptions([]);
        }
    }, [ORG_ID, BRANCH_ID]);

    // Load Process Sheets
    const loadProcessSheets = useCallback(async () => {
        try {
            const response = await machineSettingPlanAPI.getProcessSheets(ORG_ID, BRANCH_ID);
            const options = (response || []).map((ps) => ({
                value: ps.id,
                label: ps.processSheetNo + " - " + ps.name,
            }));
            setProcessSheetOptions(options);
        } catch (error) {
            console.error("Failed to load process sheets:", error);
            setProcessSheetOptions([]);
        }
    }, [ORG_ID, BRANCH_ID]);

    // Load Employees
    const loadEmployees = useCallback(async () => {
        try {
            const response = await machineSettingPlanAPI.getEmployees(ORG_ID, BRANCH_ID);
            const options = (response || []).map((emp) => ({
                value: emp.id,
                label: emp.employeeName || emp.name,
            }));
            setEmployeeOptions(options);
        } catch (error) {
            console.error("Failed to load employees:", error);
            setEmployeeOptions([]);
        }
    }, [ORG_ID, BRANCH_ID]);

    // Load Edit Data
    const loadEditData = useCallback(async () => {
        if (!editId) return;
        if (isDataLoadedRef) return;

        setLoading(true);
        try {
            const response = await machineSettingPlanAPI.getMachineSettingPlanById(editId);

            if (response?.status && response?.paramObjectsMap?.machineSettingPlan) {
                const data = response.paramObjectsMap.machineSettingPlan;
                const mappedData = mapApiDataToForm(data);
                reset(mappedData);
                setIsDataLoadedRef(true);
                addToast("Data loaded successfully", "success");
            } else {
                const errorMsg = response?.paramObjectsMap?.message || "Failed to load data";
                addToast(errorMsg, "error");
            }
        } catch (error) {
            console.error("Error loading edit data:", error);
            addToast("Failed to load data", "error");
        } finally {
            setLoading(false);
        }
    }, [editId, reset, addToast]);

    // Map API data to form
    const mapApiDataToForm = (data) => {
        const baseForm = getDefaultValues();
        baseForm.plantId = data.plantId || "";
        baseForm.docNo = data.docNo || "";
        baseForm.date = data.date || todayISO();
        baseForm.itemCode = data.itemCode || "";
        baseForm.itemDescription = data.itemDescription || "";
        baseForm.operationNo = data.operationNo || "";
        baseForm.operationName = data.operationName || "";
        baseForm.machineNo = data.machineNo || "";
        baseForm.machineName = data.machineName || "";
        baseForm.processSheetNo = data.processSheetNo || "";
        baseForm.make = data.make || "";
        baseForm.msetDetails = (data.msetDetails || []).map((item) => ({
            parameter: item.parameter || "",
            value: item.value || "",
        }));
        baseForm.preparedBy = data.preparedBy || "";
        baseForm.approvedBy = data.approvedBy || "";
        return baseForm;
    };

    // Handle Item Code Change
    useEffect(() => {
        if (watchItemCode) {
            const selected = itemOptions.find(opt => String(opt.value) === String(watchItemCode));
            if (selected) {
                setValue("itemDescription", selected.description || "");
            }
        }
    }, [watchItemCode, itemOptions, setValue]);

    // Handle Operation No Change
    useEffect(() => {
        if (watchOperationNo) {
            const selected = operationOptions.find(opt => String(opt.value) === String(watchOperationNo));
            if (selected) {
                setValue("operationName", selected.name || "");
            }
        }
    }, [watchOperationNo, operationOptions, setValue]);

    // Handle Machine No Change
    useEffect(() => {
        if (watchMachineNo) {
            const selected = machineOptions.find(opt => String(opt.value) === String(watchMachineNo));
            if (selected) {
                setValue("machineName", selected.name || "");
            }
        }
    }, [watchMachineNo, machineOptions, setValue]);

    // Handle Add Row
    const handleAddRow = () => {
        const newItem = {
            parameter: "",
            value: "",
        };
        msetDetailsArray.append(newItem);
    };

    // Handle Remove Row
    const handleRemoveRow = (index) => {
        if (msetDetailsArray.fields.length > 1) {
            msetDetailsArray.remove(index);
        }
    };

    // Handle Submit
    const onSubmit = async (formData) => {
        setSaving(true);
        try {
            const payload = {
                plantId: formData.plantId,
                docNo: formData.docNo,
                date: formData.date,
                itemCode: formData.itemCode,
                itemDescription: formData.itemDescription,
                operationNo: formData.operationNo,
                operationName: formData.operationName,
                machineNo: formData.machineNo,
                machineName: formData.machineName,
                processSheetNo: formData.processSheetNo,
                make: formData.make,
                msetDetails: formData.msetDetails.map((item) => ({
                    parameter: item.parameter,
                    value: item.value,
                })),
                preparedBy: formData.preparedBy,
                approvedBy: formData.approvedBy,
            };

            if (editId) {
                payload.id = parseInt(editId);
            }

            const response = await machineSettingPlanAPI.createUpdateMachineSettingPlan(payload);

            if (response?.status || response?.statusFlag === "Ok") {
                addToast(
                    editId ? "Machine Setting Plan updated successfully" : "Machine Setting Plan created successfully",
                    "success"
                );
                if (onSave) onSave(payload);
                onBack();
            } else {
                const errorMsg = response?.paramObjectsMap?.message || "Failed to save";
                addToast(errorMsg, "error");
            }
        } catch (error) {
            console.error("Save Error:", error);
            addToast("Failed to save", "error");
        } finally {
            setSaving(false);
        }
    };

    // Effects
    useEffect(() => {
        loadPlants();
        loadItems();
        loadOperations();
        loadMachines();
        loadProcessSheets();
        loadEmployees();
    }, []);

    useEffect(() => {
        if (editId) {
            loadEditData();
        }
    }, [editId, loadEditData]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500 dark:text-gray-400">Loading data...</p>
                </div>
            </div>
        );
    }

    const msetHeaders = ["S.No", "Parameter", "Value", "Action"];

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
                    {editId ? "Edit Machine Setting Plan" : "Machine Setting Plan"}
                </h2>
            </div>

            {/* Main Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Header Fields - Grid Layout */}
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-3 mb-6">
                        {/* Plant Id */}
                        <SelectField
                            control={control}
                            name="plantId"
                            label="Plant Id *"
                            options={plantOptions}
                            required
                            errors={errors}
                            disabled={loadingPlants}
                            placeholder="Select an option"
                        />

                        {/* Doc No. */}
                        <InputField
                            control={control}
                            name="docNo"
                            label="Doc No. *"
                            required
                            errors={errors}
                            readOnly
                            placeholder="Auto"
                        />

                        {/* Date */}
                        <InputField
                            control={control}
                            name="date"
                            label="Date *"
                            type="date"
                            required
                            errors={errors}
                        />

                        {/* Item Code */}
                        <SelectField
                            control={control}
                            name="itemCode"
                            label="Item Code *"
                            options={itemOptions}
                            required
                            errors={errors}
                            placeholder="Select an option"
                        />

                        {/* Item Description */}
                        <InputField
                            control={control}
                            name="itemDescription"
                            label="Item Description"
                            readOnly
                            errors={errors}
                        />

                        {/* Operation No. */}
                        <SelectField
                            control={control}
                            name="operationNo"
                            label="Operation No. *"
                            options={operationOptions}
                            required
                            errors={errors}
                            placeholder="Select an option"
                        />

                        {/* Operation Name */}
                        <InputField
                            control={control}
                            name="operationName"
                            label="Operation Name"
                            readOnly
                            errors={errors}
                        />

                        {/* Machine No. */}
                        <SelectField
                            control={control}
                            name="machineNo"
                            label="Machine No. *"
                            options={machineOptions}
                            required
                            errors={errors}
                            placeholder="Select an option"
                        />

                        {/* Machine Name */}
                        <InputField
                            control={control}
                            name="machineName"
                            label="Machine Name"
                            readOnly
                            errors={errors}
                        />

                        {/* Process Sheet No */}
                        <SelectField
                            control={control}
                            name="processSheetNo"
                            label="Process Sheet No *"
                            options={processSheetOptions}
                            required
                            errors={errors}
                            placeholder="Select an option"
                        />

                        {/* Make */}
                        <InputField
                            control={control}
                            name="make"
                            label="Make"
                            errors={errors}
                            placeholder="Enter Make"
                        />
                    </div>

                    {/* Tabs */}
                    <section className="mt-0 bg-white dark:bg-gray-800">
                        <div className="flex items-center border-b border-gray-200 dark:border-gray-700 mb-3 overflow-x-auto">
                            <button
                                type="button"
                                onClick={() => setActiveTab("msetDetail")}
                                className={`px-4 py-2 text-xs font-semibold rounded-t whitespace-nowrap ${activeTab === "msetDetail"
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    }`}
                            >
                                Mset Detail
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("msetSummary")}
                                className={`px-4 py-2 text-xs font-semibold rounded-t whitespace-nowrap ${activeTab === "msetSummary"
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    }`}
                            >
                                Mset Summary
                            </button>
                        </div>

                        {/* Mset Detail Tab */}
                        {activeTab === "msetDetail" && (
                            <div className="pt-2 space-y-2">
                                <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                                    <span>Add parameter details</span>
                                    <button
                                        type="button"
                                        onClick={handleAddRow}
                                        className="ml-auto h-7 w-7 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors shadow-sm"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>

                                <TableWrapper>
                                    <TableHead headers={msetHeaders} />
                                    <tbody>
                                        {msetDetailsArray.fields.map((field, index) => (
                                            <TableRow
                                                key={field.id}
                                                index={index}
                                                onRemove={() => handleRemoveRow(index)}
                                                disabled={msetDetailsArray.fields.length <= 1}
                                            >
                                                <InputCell
                                                    control={control}
                                                    name={`msetDetails.${index}.parameter`}
                                                    placeholder="Enter parameter"
                                                    errors={errors}
                                                />
                                                <InputCell
                                                    control={control}
                                                    name={`msetDetails.${index}.value`}
                                                    placeholder="Enter value"
                                                    errors={errors}
                                                />
                                            </TableRow>
                                        ))}
                                    </tbody>
                                </TableWrapper>
                            </div>
                        )}

                        {/* Mset Summary Tab */}
                        {activeTab === "msetSummary" && (
                            <div className="pt-4 space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {/* Prepared By */}
                                    <SelectField
                                        control={control}
                                        name="preparedBy"
                                        label="Prepared By"
                                        options={employeeOptions}
                                        errors={errors}
                                        placeholder="Select an option"
                                    />

                                    {/* Approved By */}
                                    <SelectField
                                        control={control}
                                        name="approvedBy"
                                        label="Approved By"
                                        options={employeeOptions}
                                        errors={errors}
                                        placeholder="Select an option"
                                    />
                                </div>

                                {/* Tool Replacement Plan Section */}
                                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
                                        Tool Replacement Plan
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {/* Additional fields can be added here as needed */}
                                        <div className="col-span-2 md:col-span-3 text-xs text-gray-400 dark:text-gray-500 italic">
                                            Tool replacement plan details will be displayed here
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Buttons */}
                    <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onBack}
                            disabled={isSubmitting || saving}
                            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                        >
                            <X className="h-3 w-3" />
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || saving || loading}
                            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                        >
                            <Save className="h-3 w-3" />
                            {isSubmitting || saving ? "Saving..." : editId ? "Update" : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MachineSettingPlanForm;
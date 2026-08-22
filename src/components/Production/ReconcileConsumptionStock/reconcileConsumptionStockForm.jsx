import React, { useState, useEffect, useCallback, useRef } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useToast } from "../../Toast/ToastContext";
import branchAPI from "../../../api/branchAPI";
import reconcileConsumptionStockAPI from "../../../api/Production/reconcileConsumptionStockAPI";

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

// ===================== Table Components (Styled like ProductionEntryForm) =====================

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

const SelectCell = ({
    control,
    name,
    options,
    required,
    errors,
    onChange,
    disabled,
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
        <td className="p-2 align-top min-w-[120px]">
            <Controller
                name={name}
                control={control}
                rules={required ? { required: "This field is required" } : undefined}
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
                        <option value="">-- Select --</option>
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
                <p className="text-red-500 text-[9px] mt-0.5">{errorMessage}</p>
            )}
        </td>
    );
};

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
    docId: "",
    reconcileDate: todayISO(),
    shopFloor: "",
    fgItem: "",
    rmLocation: "",
    items: [
        {
            itemId: "",
            itemDescription: "",
            unit: "",
            availableQty: 0,
            consumptionQty: 0,
            postedQty: 0,
            differenceQty: 0,
            rate: 0,
            value: 0,
        },
    ],
});

const ReconcileConsumptionStockForm = ({ onBack, onSave, editData, editId }) => {
    const ORG_ID = parseInt(localStorage.getItem("orgId"));
    const BRANCH_ID = parseInt(localStorage.getItem("branchId"));
    const { addToast } = useToast();
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [plantOptions, setPlantOptions] = useState([]);
    const [loadingPlants, setLoadingPlants] = useState(false);
    const [shopFloorOptions, setShopFloorOptions] = useState([]);
    const [fgItemOptions, setFgItemOptions] = useState([]);
    const [isDataLoadedRef, setIsDataLoadedRef] = useState(false);

    const {
        control,
        handleSubmit,
        setValue,
        getValues,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        mode: "onTouched",
        defaultValues: editData || getDefaultValues(),
    });

    const itemsArray = useFieldArray({
        control,
        name: "items",
    });

    // Watch values for calculations
    const watchItems = watch("items");

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

    // Load Shop Floor Options
    const loadShopFloors = useCallback(async () => {
        try {
            const response = await reconcileConsumptionStockAPI.getShopFloors(ORG_ID, BRANCH_ID);
            const options = (response || []).map((item) => ({
                value: item.id,
                label: item.name,
            }));
            setShopFloorOptions(options);
        } catch (error) {
            console.error("Failed to load shop floors:", error);
            setShopFloorOptions([]);
        }
    }, [ORG_ID, BRANCH_ID]);

    // Load FG Item Options
    const loadFGItems = useCallback(async () => {
        try {
            const response = await reconcileConsumptionStockAPI.getFGItems(ORG_ID, BRANCH_ID);
            const options = (response || []).map((item) => ({
                value: item.id,
                label: item.itemCode + " - " + item.itemDescription,
                description: item.itemDescription,
                unit: item.unit,
                rate: item.rate,
            }));
            setFgItemOptions(options);
        } catch (error) {
            console.error("Failed to load FG items:", error);
            setFgItemOptions([]);
        }
    }, [ORG_ID, BRANCH_ID]);

    // Load Edit Data
    const loadEditData = useCallback(async () => {
        if (!editId) return;
        if (isDataLoadedRef) return;

        setLoading(true);
        try {
            const response = await reconcileConsumptionStockAPI.getReconcileConsumptionById(editId);

            if (response?.status && response?.paramObjectsMap?.reconcileData) {
                const data = response.paramObjectsMap.reconcileData;
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
        baseForm.docId = data.docId || "";
        baseForm.reconcileDate = data.reconcileDate || todayISO();
        baseForm.shopFloor = data.shopFloor || "";
        baseForm.fgItem = data.fgItem || "";
        baseForm.rmLocation = data.rmLocation || "";
        baseForm.items = (data.items || []).map((item) => ({
            itemId: item.itemId || "",
            itemDescription: item.itemDescription || "",
            unit: item.unit || "",
            availableQty: item.availableQty || 0,
            consumptionQty: item.consumptionQty || 0,
            postedQty: item.postedQty || 0,
            differenceQty: item.differenceQty || 0,
            rate: item.rate || 0,
            value: item.value || 0,
        }));
        return baseForm;
    };

    // Handle FG Item Selection
    const handleFGItemChange = useCallback((selectedValue) => {
        if (!selectedValue) return;

        const selected = fgItemOptions.find(opt => String(opt.value) === String(selectedValue));
        if (selected) {
            setValue("items.0.itemDescription", selected.description || "");
            setValue("items.0.unit", selected.unit || "");
            setValue("items.0.rate", selected.rate || 0);
        }
    }, [fgItemOptions, setValue]);

    // Calculate difference and value
    useEffect(() => {
        if (watchItems && watchItems.length > 0) {
            watchItems.forEach((item, index) => {
                const availableQty = parseFloat(item.availableQty) || 0;
                const consumptionQty = parseFloat(item.consumptionQty) || 0;
                const postedQty = parseFloat(item.postedQty) || 0;
                const rate = parseFloat(item.rate) || 0;

                const differenceQty = postedQty - consumptionQty;
                setValue(`items.${index}.differenceQty`, differenceQty);

                const value = differenceQty * rate;
                setValue(`items.${index}.value`, value);
            });
        }
    }, [watchItems, setValue]);

    // Handle Add Row
    const handleAddRow = () => {
        const newItem = {
            itemId: "",
            itemDescription: "",
            unit: "",
            availableQty: 0,
            consumptionQty: 0,
            postedQty: 0,
            differenceQty: 0,
            rate: 0,
            value: 0,
        };
        itemsArray.append(newItem);
    };

    // Handle Remove Row
    const handleRemoveRow = (index) => {
        if (itemsArray.fields.length > 1) {
            itemsArray.remove(index);
        }
    };

    // Handle Submit
    const onSubmit = async (formData) => {
        setSaving(true);
        try {
            const payload = {
                plantId: formData.plantId,
                docId: formData.docId,
                reconcileDate: formData.reconcileDate,
                shopFloor: formData.shopFloor,
                fgItem: formData.fgItem,
                rmLocation: formData.rmLocation,
                items: formData.items.map((item) => ({
                    itemId: item.itemId,
                    itemDescription: item.itemDescription,
                    unit: item.unit,
                    availableQty: parseFloat(item.availableQty) || 0,
                    consumptionQty: parseFloat(item.consumptionQty) || 0,
                    postedQty: parseFloat(item.postedQty) || 0,
                    differenceQty: parseFloat(item.differenceQty) || 0,
                    rate: parseFloat(item.rate) || 0,
                    value: parseFloat(item.value) || 0,
                })),
            };

            if (editId) {
                payload.id = parseInt(editId);
            }

            const response = await reconcileConsumptionStockAPI.createUpdateReconcileConsumption(payload);

            if (response?.status || response?.statusFlag === "Ok") {
                addToast(
                    editId ? "Reconcile updated successfully" : "Reconcile created successfully",
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
        loadShopFloors();
        loadFGItems();
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

    const itemHeaders = [
        "S.No",
        "Item ID *",
        "Item Description",
        "Unit",
        "Available Qty",
        "Consumption Qty",
        "Posted Qty",
        "Difference Qty",
        "Rate",
        "Value",
        "Action"
    ];

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
                    {editId ? "Edit Reconcile Consumption Stock" : "Reconcile Consumption Stock"}
                </h2>
            </div>

            {/* Main Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Header Fields - Grid Layout */}
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-3 mb-6">
                        <SelectField
                            control={control}
                            name="plantId"
                            label="Plant ID *"
                            options={plantOptions}
                            required
                            errors={errors}
                            disabled={loadingPlants}
                            placeholder="Select an option"
                        />

                        <InputField
                            control={control}
                            name="docId"
                            label="Doc.ID *"
                            required
                            errors={errors}
                            readOnly
                            placeholder="Auto"
                        />

                        <InputField
                            control={control}
                            name="reconcileDate"
                            label="Reconcile Date *"
                            type="date"
                            required
                            errors={errors}
                        />

                        <InputField
                            control={control}
                            name="docDate"
                            label="Doc.Date *"
                            type="date"
                            required
                            errors={errors}
                            readOnly
                            value={todayISO()}
                        />

                        <SelectField
                            control={control}
                            name="shopFloor"
                            label="Shop Floor *"
                            options={shopFloorOptions}
                            required
                            errors={errors}
                            placeholder="Select an option"
                        />

                        <SelectField
                            control={control}
                            name="fgItem"
                            label="FG Item *"
                            options={fgItemOptions}
                            required
                            errors={errors}
                            onChange={handleFGItemChange}
                            placeholder="Select an option"
                        />

                        <InputField
                            control={control}
                            name="rmLocation"
                            label="RM Location *"
                            required
                            errors={errors}
                            placeholder="Enter RM Location"
                        />
                    </div>

                    {/* Items Table - Styled like ProductionEntryForm */}
                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Items
                            </h3>
                            <button
                                type="button"
                                onClick={handleAddRow}
                                className="h-7 w-7 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors shadow-sm"
                            >
                                <Plus size={14} />
                            </button>
                        </div>

                        <TableWrapper>
                            <TableHead headers={itemHeaders} />
                            <tbody>
                                {itemsArray.fields.map((field, index) => (
                                    <TableRow
                                        key={field.id}
                                        index={index}
                                        onRemove={() => handleRemoveRow(index)}
                                        disabled={itemsArray.fields.length <= 1}
                                    >
                                        <SelectCell
                                            control={control}
                                            name={`items.${index}.itemId`}
                                            options={fgItemOptions}
                                            required
                                            errors={errors}
                                            onChange={(value) => {
                                                const selected = fgItemOptions.find(opt => String(opt.value) === String(value));
                                                if (selected) {
                                                    setValue(`items.${index}.itemDescription`, selected.description || "");
                                                    setValue(`items.${index}.unit`, selected.unit || "");
                                                    setValue(`items.${index}.rate`, selected.rate || 0);
                                                }
                                            }}
                                        />

                                        <InputCell
                                            control={control}
                                            name={`items.${index}.itemDescription`}
                                            type="text"
                                            readOnly
                                        />

                                        <InputCell
                                            control={control}
                                            name={`items.${index}.unit`}
                                            type="text"
                                            readOnly
                                        />

                                        <InputCell
                                            control={control}
                                            name={`items.${index}.availableQty`}
                                            type="number"
                                            step="0.01"
                                            readOnly
                                        />

                                        <InputCell
                                            control={control}
                                            name={`items.${index}.consumptionQty`}
                                            type="number"
                                            step="0.01"
                                        />

                                        <InputCell
                                            control={control}
                                            name={`items.${index}.postedQty`}
                                            type="number"
                                            step="0.01"
                                        />

                                        <InputCell
                                            control={control}
                                            name={`items.${index}.differenceQty`}
                                            type="number"
                                            step="0.01"
                                            readOnly
                                        />

                                        <InputCell
                                            control={control}
                                            name={`items.${index}.rate`}
                                            type="number"
                                            step="0.01"
                                        />

                                        <InputCell
                                            control={control}
                                            name={`items.${index}.value`}
                                            type="number"
                                            step="0.01"
                                            readOnly
                                        />
                                    </TableRow>
                                ))}
                            </tbody>
                        </TableWrapper>
                    </div>

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

export default ReconcileConsumptionStockForm;
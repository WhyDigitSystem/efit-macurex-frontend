import { useState, useEffect, useCallback, useRef } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useToast } from "../../Toast/ToastContext";
import branchAPI from "../../../api/branchAPI";
import reconcileConsumptionStockAPI from "../../../api/Production/reconcileConsumptionStockAPI";

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

const labelClasses =
    "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

/* ---------------------------------------------------------------------------- */
/* Reusable fields                                                              */

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
            if (error && error[part]) error = error[part];
            else return null;
        }
        return error?.message;
    };
    const errorMessage = getError();

    const safeOptions = (options || []).map((opt) =>
        typeof opt === "object" ? opt : { value: opt, label: opt },
    );

    return (
        <div>
            <label className={labelClasses}>
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <Controller
                name={name}
                control={control}
                rules={required ? { required: `${label} is required` } : undefined}
                render={({ field }) => {
                    const safeValue =
                        field.value === null || field.value === undefined
                            ? ""
                            : field.value;
                    const inOptions = safeOptions.some(
                        (o) => String(o.value) === String(safeValue),
                    );
                    const showGhost = safeValue !== "" && !inOptions;

                    return (
                        <select
                            {...field}
                            value={safeValue}
                            className={`${controlClasses} ${errorMessage ? "border-red-500 focus:border-red-500" : ""
                                }`}
                            onChange={(e) => {
                                field.onChange(e);
                                if (onChange) onChange(e.target.value);
                            }}
                            disabled={disabled}
                        >
                            <option value="">{placeholder}</option>
                            {showGhost && (
                                <option value={safeValue}>{String(safeValue)}</option>
                            )}
                            {safeOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    );
                }}
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
            if (error && error[part]) error = error[part];
            else return null;
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
                    ...(required && { required: `${label} is required` }),
                }}
                render={({ field }) => (
                    <input
                        {...field}
                        value={field.value ?? ""}
                        type={type}
                        step={step}
                        className={`${controlClasses} ${errorMessage ? "border-red-500 focus:border-red-500" : ""
                            } ${readOnly ? "bg-gray-50 dark:bg-gray-800" : ""}`}
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

/* ---------------------------------------------------------------------------- */
/* Table helpers                                                                */

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
                    className={`p-2 whitespace-nowrap ${i === 0
                            ? "w-8 text-center"
                            : i === headers.length - 1
                                ? "w-20 text-left"
                                : "text-left"
                        } text-gray-700 dark:text-gray-200 text-[10px] font-medium`}
                >
                    {h}
                </th>
            ))}
        </tr>
    </thead>
);

const TableRow = ({ children, index, onRemove, disabled, showDelete = true }) => (
    <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
        <td className="p-2 text-center font-medium dark:text-white text-[10px]">
            {index + 1}
        </td>
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
            if (error && error[part]) error = error[part];
            else return null;
        }
        return error?.message;
    };
    const errorMessage = getError();

    const safeOptions = (options || []).map((opt) =>
        typeof opt === "object" ? opt : { value: opt, label: opt },
    );

    return (
        <td className="p-2 align-top min-w-[160px]">
            <Controller
                name={name}
                control={control}
                rules={required ? { required: "This field is required" } : undefined}
                render={({ field }) => {
                    const safeValue =
                        field.value === null || field.value === undefined
                            ? ""
                            : field.value;
                    const inOptions = safeOptions.some(
                        (o) => String(o.value) === String(safeValue),
                    );
                    const showGhost = safeValue !== "" && !inOptions;

                    return (
                        <select
                            {...field}
                            value={safeValue}
                            className={`${controlClasses} ${errorMessage ? "border-red-500 focus:border-red-500" : ""
                                }`}
                            onChange={(e) => {
                                field.onChange(e);
                                if (onChange) onChange(e.target.value);
                            }}
                            disabled={disabled}
                        >
                            <option value="">-- Select --</option>
                            {showGhost && (
                                <option value={safeValue}>{String(safeValue)}</option>
                            )}
                            {safeOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    );
                }}
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
    onChange,
}) => {
    const getError = () => {
        const parts = name.split(".");
        let error = errors;
        for (const part of parts) {
            if (error && error[part]) error = error[part];
            else return null;
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
                        value={field.value ?? ""}
                        type={type}
                        step={step}
                        className={`${controlClasses} ${errorMessage ? "border-red-500 focus:border-red-500" : ""
                            } ${readOnly ? "bg-gray-50 dark:bg-gray-800" : ""}`}
                        placeholder={placeholder}
                        disabled={disabled}
                        readOnly={readOnly}
                        onChange={(e) => {
                            field.onChange(e);
                            if (onChange) onChange(e.target.value);
                        }}
                    />
                )}
            />
            {errorMessage && (
                <p className="text-red-500 text-[9px] mt-0.5">{errorMessage}</p>
            )}
        </td>
    );
};

/* ---------------------------------------------------------------------------- */

const todayISO = () => new Date().toISOString().slice(0, 10);

const getDefaultValues = () => ({
    plantId: "",
    docId: "",
    docDate: todayISO(),
    reconcileDate: todayISO(),
    shopFloor: "",
    fgItem: "",
    rmLocation: "",
    items: [
        {
            itemId: "",
            itemDescription: "",
            unit: "",
            unitId: "",
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
    const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
    const BRANCH_ID = Number(localStorage.getItem("branchId")) || 0;
    const CREATED_BY = localStorage.getItem("userName") || "SYSTEM";

    const { addToast } = useToast();
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [plantOptions, setPlantOptions] = useState([]);
    const [loadingPlants, setLoadingPlants] = useState(false);
    const [shopFloorOptions, setShopFloorOptions] = useState([]);
    const [rmLocationOptions, setRmLocationOptions] = useState([]);
    const [fgItemOptions, setFgItemOptions] = useState([]);
    const [bomItemOptions, setBomItemOptions] = useState([]);

    const bomItemMapRef = useRef({});
    const fgItemMapRef = useRef({});
    const docIdLoadedRef = useRef(false);

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
        defaultValues: getDefaultValues(),
    });

    const itemsArray = useFieldArray({
        control,
        name: "items",
    });

    const watchItems = watch("items");
    const watchFgItem = watch("fgItem");

    /* ---------------- Load master data ---------------- */

    const loadPlants = useCallback(async () => {
        setLoadingPlants(true);
        try {
            const response = await branchAPI.getBranchByOrgId(ORG_ID);
            setPlantOptions(
                (response || []).map((b) => ({
                    value: b.id,
                    label: b.branchName || b.branchCode || String(b.id),
                })),
            );
        } catch (error) {
            console.error("Failed to load plants:", error);
            setPlantOptions([]);
        } finally {
            setLoadingPlants(false);
        }
    }, [ORG_ID]);

    const loadShopFloors = useCallback(async () => {
        try {
            const list = await reconcileConsumptionStockAPI.getShopFloors({
                orgId: ORG_ID,
                branch: BRANCH_ID,
            });
            setShopFloorOptions(
                (list || []).map((loc) => ({
                    value: loc.id,
                    label: loc.locationName || loc.locationId || String(loc.id),
                })),
            );
        } catch (error) {
            console.error("Failed to load shop floors:", error);
            setShopFloorOptions([]);
        }
    }, [ORG_ID, BRANCH_ID]);

    const loadRmLocations = useCallback(async () => {
        try {
            const list = await reconcileConsumptionStockAPI.getRMLocations({
                orgId: ORG_ID,
                branch: BRANCH_ID,
            });
            setRmLocationOptions(
                (list || []).map((loc) => ({
                    value: loc.id,
                    label: loc.locationName || loc.locationId || String(loc.id),
                })),
            );
        } catch (error) {
            console.error("Failed to load RM locations:", error);
            setRmLocationOptions([]);
        }
    }, [ORG_ID, BRANCH_ID]);

    const loadFGItems = useCallback(async () => {
        try {
            const list = await reconcileConsumptionStockAPI.getFGItems({
                branch: BRANCH_ID,
                orgId: ORG_ID,
            });
            const map = {};
            setFgItemOptions(
                (list || []).map((item) => {
                    const value = item.itemId;
                    map[value] = item;
                    return {
                        value,
                        label: `${item.itemCode} — ${item.itemDescription}`,
                    };
                }),
            );
            fgItemMapRef.current = map;
        } catch (error) {
            console.error("Failed to load FG items:", error);
            setFgItemOptions([]);
        }
    }, [ORG_ID, BRANCH_ID]);

    /* ---------------- Doc Id auto-generation (Add mode) ---------------- */

    useEffect(() => {
        if (editId || docIdLoadedRef.current) return;
        if (!ORG_ID) return;

        (async () => {
            try {
                const financialYear = String(new Date().getFullYear());
                const docId = await reconcileConsumptionStockAPI.getDocId({
                    financialYear,
                    orgId: ORG_ID,
                });
                if (docId) {
                    setValue("docId", docId);
                    docIdLoadedRef.current = true;
                }
            } catch (err) {
                console.error("Failed to generate DocId:", err);
            }
        })();
    }, [editId, ORG_ID, setValue]);

    /* ---------------- Load BOM line items when FG Item changes ---------------- */

    useEffect(() => {
        const itemId = watchFgItem;
        if (!itemId) {
            setBomItemOptions([]);
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                const list = await reconcileConsumptionStockAPI.getBomItemDetails({
                    branch: BRANCH_ID,
                    itemId,
                    orgId: ORG_ID,
                });

                const map = {};
                const options = (list || []).map((b) => {
                    map[b.itemId] = b;
                    return {
                        value: b.itemId,
                        label: `${b.itemCode} — ${b.itemDescription}`,
                    };
                });

                if (!cancelled) {
                    bomItemMapRef.current = map;
                    setBomItemOptions(options);
                }
            } catch (err) {
                console.error("Failed to load BOM items:", err);
                if (!cancelled) setBomItemOptions([]);
            }
        })();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watchFgItem, ORG_ID, BRANCH_ID]);

    /* ---------------- Re-sync when editData prop changes ---------------- */

    useEffect(() => {
        if (!editData) return;

        reset({
            ...getDefaultValues(),
            ...editData,
            items: editData.items?.length
                ? editData.items
                : [getDefaultValues().items[0]],
        });

        if (editData.docId) docIdLoadedRef.current = true;
    }, [editData, reset]);

    /* ---------------- Load edit data (fallback if only editId given) ---------------- */

    useEffect(() => {
        if (editData || !editId) return;
        let cancelled = false;

        (async () => {
            setLoading(true);
            try {
                const data = await reconcileConsumptionStockAPI.getById(editId);
                if (cancelled || !data) return;

                reset({
                    ...getDefaultValues(),
                    plantId: data.branch?.id ?? "",
                    docId: data.docId ?? "",
                    docDate: data.docDate ?? todayISO(),
                    reconcileDate: data.reconcileDate ?? todayISO(),
                    shopFloor: data.shopFloor?.id ?? "",
                    fgItem: data.fgItem?.id ?? "",
                    rmLocation: data.rmLocation?.id ?? "",
                    items: (data.details || []).map((d) => ({
                        itemId: d.item?.id ?? "",
                        itemDescription: d.item?.itemDescription ?? "",
                        unit: d.unit?.unitId ?? "",
                        unitId: d.unit?.id ?? "",
                        availableQty: d.availableQty ?? 0,
                        consumptionQty: d.consumptionQty ?? 0,
                        postedQty: d.postedQty ?? 0,
                        differenceQty: d.differenceQty ?? 0,
                        rate: d.rate ?? 0,
                        value: d.value ?? 0,
                    })),
                });
                docIdLoadedRef.current = true;
            } catch (error) {
                console.error("Error loading edit data:", error);
                addToast("Failed to load data", "error");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [editData, editId, reset, addToast]);

    /* ---------------- Recalculate value = differenceQty × rate ---------------- */

    useEffect(() => {
        if (!watchItems?.length) return;

        watchItems.forEach((item, index) => {
            const differenceQty = parseFloat(item.differenceQty) || 0;
            const rate = parseFloat(item.rate) || 0;
            const value = differenceQty * rate;

            if (Number(item.value) !== value) {
                setValue(`items.${index}.value`, value, {
                    shouldDirty: false,
                    shouldValidate: false,
                });
            }
        });
    }, [watchItems, setValue]);

    const calculateValue = useCallback(
        (index, differenceQty, rate) => {
            const difference = parseFloat(differenceQty) || 0;
            const rateValue = parseFloat(rate) || 0;
            const value = difference * rateValue;

            setValue(`items.${index}.value`, value, {
                shouldDirty: true,
                shouldValidate: false,
            });
        },
        [setValue],
    );

    /* ---------------- Handlers ---------------- */

    const handleFGItemChange = useCallback(
        (selectedValue) => {
            if (!selectedValue) return;
            // Reset the first row's item when the FG item changes.
            setValue("items.0.itemId", "");
            setValue("items.0.itemDescription", "");
            setValue("items.0.unit", "");
            setValue("items.0.unitId", "");
            setValue("items.0.rate", 0);
            setValue("items.0.consumptionQty", 0);
        },
        [setValue],
    );

    const handleItemChange = useCallback(
        (index, value) => {
            const b = bomItemMapRef.current[value];
            if (!b) return;

            setValue(`items.${index}.itemDescription`, b.itemDescription || "");
            setValue(`items.${index}.unit`, b.unitCode || "");
            setValue(`items.${index}.unitId`, b.unitId ?? "");
            setValue(`items.${index}.rate`, b.rate ?? 0);
            setValue(`items.${index}.consumptionQty`, b.bomQty ?? 0);
        },
        [setValue],
    );

    const handleAddRow = () => {
        itemsArray.append({
            itemId: "",
            itemDescription: "",
            unit: "",
            unitId: "",
            availableQty: 0,
            consumptionQty: 0,
            postedQty: 0,
            differenceQty: 0,
            rate: 0,
            value: 0,
        });
    };

    const handleRemoveRow = (index) => {
        if (itemsArray.fields.length > 1) itemsArray.remove(index);
    };

    /* ---------------- Submit ---------------- */

    const onSubmit = async (formData) => {
        setSaving(true);
        try {
            const financialYear = String(new Date().getFullYear());

            const payload = {
                ...(editId ? { id: Number(editId) } : {}),

                active: true,
                orgId: ORG_ID,
                branch: Number(formData.plantId) || BRANCH_ID || 0,
                financialYear,

                cancelRemarks: "",
                createdBy: editData?.createdBy ?? CREATED_BY,

                reconcileDate: formData.reconcileDate || todayISO(),
                shopFloor: Number(formData.shopFloor) || 0,
                fgItem: Number(formData.fgItem) || 0,
                rmLocation: Number(formData.rmLocation) || 0,

                details: (formData.items || [])
                    .filter((i) => i.itemId)
                    .map((i) => ({
                        item: Number(i.itemId) || 0,
                        unit: Number(i.unitId) || 0,
                        availableQty: Number(i.availableQty) || 0,
                        consumptionQty: Number(i.consumptionQty) || 0,
                        postedQty: Number(i.postedQty) || 0,
                        differenceQty: Number(i.differenceQty) || 0,
                        rate: Number(i.rate) || 0,
                    })),
            };

            console.log("📤 Saving Reconcile Consumption Stock:", payload);

            const response = await reconcileConsumptionStockAPI.createUpdate(payload);

            const isSuccess =
                response?.status === true ||
                response?.statusFlag === "Ok" ||
                response?.status === 200 ||
                response?.statusCode === 200;

            if (isSuccess) {
                addToast(
                    response?.paramObjectsMap?.message ||
                    (editId
                        ? "Reconcile updated successfully"
                        : "Reconcile created successfully"),
                    "success",
                );
                if (onSave) onSave(payload);
                onBack();
            } else {
                addToast(
                    response?.errors?.[0]?.shortMessage ||
                    response?.errors?.[0]?.longMessage ||
                    response?.paramObjectsMap?.message ||
                    response?.paramObjectsMap?.errorMessage ||
                    response?.message ||
                    "Failed to save",
                    "error",
                );
            }
        } catch (error) {
            console.error("Save Error:", error);
            const errorMessage =
                error.response?.data?.paramObjectsMap?.message ||
                error.response?.data?.paramObjectsMap?.errorMessage ||
                error.response?.data?.message ||
                "Failed to save";
            addToast(errorMessage, "error");
        } finally {
            setSaving(false);
        }
    };

    /* ---------------- Initial load ---------------- */

    useEffect(() => {
        if (!ORG_ID) return;
        loadPlants();
        loadShopFloors();
        loadRmLocations();
        loadFGItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ORG_ID, BRANCH_ID]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500 dark:text-gray-400">
                        Loading data...
                    </p>
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
        "Action",
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
                    {editId
                        ? "Edit Reconcile Consumption Stock"
                        : "Reconcile Consumption Stock"}
                </h2>
            </div>

            {/* Main Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Header Fields */}
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

                        <SelectField
                            control={control}
                            name="rmLocation"
                            label="RM Location *"
                            options={rmLocationOptions}
                            required
                            errors={errors}
                            placeholder="Select an option"
                        />
                    </div>

                    {/* Items Table */}
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
                                            options={bomItemOptions}
                                            required
                                            errors={errors}
                                            onChange={(value) => handleItemChange(index, value)}
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
                                            onChange={(value) => {
                                                const rate =
                                                    getValues(`items.${index}.rate`) || 0;
                                                calculateValue(index, value, rate);
                                            }}
                                        />

                                        <InputCell
                                            control={control}
                                            name={`items.${index}.rate`}
                                            type="number"
                                            step="0.01"
                                            onChange={(value) => {
                                                const differenceQty =
                                                    getValues(`items.${index}.differenceQty`) || 0;
                                                calculateValue(index, differenceQty, value);
                                            }}
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
                            {isSubmitting || saving
                                ? "Saving..."
                                : editId
                                    ? "Update"
                                    : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReconcileConsumptionStockForm;
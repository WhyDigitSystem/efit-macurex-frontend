import { useState, useEffect, useCallback, useRef } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useToast } from "../../Toast/ToastContext";
import branchAPI from "../../../api/branchAPI";
import machineSettingPlanAPI from "../../../api/Production/machineSettingPlanAPI";

/* ---------------------------------------------------------------------------- */
/* Design tokens                                                                */

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
                        field.value === null || field.value === undefined ? "" : field.value;
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
            if (error && error[part]) error = error[part];
            else return null;
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
                <p className="text-red-500 text-[9px] mt-0.5">{errorMessage}</p>
            )}
        </td>
    );
};

/* ---------------------------------------------------------------------------- */

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
    toolReplacementPlan: "",
    msetDetails: [{ parameter: "", value: "" }],
    preparedBy: "",
    approvedBy: "",
});

const MachineSettingPlanForm = ({ onBack, onSave, editData, editId }) => {
    const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
    const BRANCH_ID = Number(localStorage.getItem("branchId")) || 0;
    const CREATED_BY = localStorage.getItem("userName") || "SYSTEM";

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

    const [activeTab, setActiveTab] = useState("msetDetail");

    const itemMapRef = useRef({});
    const operationMapRef = useRef({});

    const docIdLoadedRef = useRef(false);

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        mode: "onTouched",
        defaultValues: getDefaultValues(),
    });

    const msetDetailsArray = useFieldArray({
        control,
        name: "msetDetails",
    });

    const watchItemCode = watch("itemCode");
    const watchOperationNo = watch("operationNo");
    const watchMachineNo = watch("machineNo");

    /* ---------------- Load master data ---------------- */

    useEffect(() => {
        if (!ORG_ID) return;

        // Plants
        (async () => {
            setLoadingPlants(true);
            try {
                const res = await branchAPI.getBranchByOrgId(ORG_ID);
                setPlantOptions(
                    (res || []).map((b) => ({
                        value: b.id,
                        label: b.branchName || b.branchCode || String(b.id),
                    })),
                );
            } catch (err) {
                console.error("Failed to load plants:", err);
            } finally {
                setLoadingPlants(false);
            }
        })();

        // Items — getFGAndSFGItems
        (async () => {
            try {
                const list = await machineSettingPlanAPI.getFGAndSFGItems({
                    branch: BRANCH_ID,
                    orgId: ORG_ID,
                });
                const map = {};
                setItemOptions(
                    (list || []).map((it) => {
                        const value = it.itemId;
                        map[value] = it;
                        return { value, label: it.itemCode || String(it.itemId) };
                    }),
                );
                itemMapRef.current = map;
            } catch (err) {
                console.error("Failed to load items:", err);
            }
        })();

        // Operations + machines — getOperationMaster
        (async () => {
            try {
                const list = await machineSettingPlanAPI.getOperationMaster(ORG_ID);
                const map = {};
                setOperationOptions(
                    (list || []).map((op) => {
                        const value = op.operationId || String(op.id);
                        map[value] = op;
                        return {
                            value,
                            label: op.operationId || op.description || String(op.id),
                        };
                    }),
                );
                operationMapRef.current = map;
            } catch (err) {
                console.error("Failed to load operations:", err);
            }
        })();

        // Process Sheets — getProcessSheets
        (async () => {
            try {
                const list = await machineSettingPlanAPI.getProcessSheets({
                    branch: BRANCH_ID,
                    orgId: ORG_ID,
                });
                setProcessSheetOptions(
                    (list || []).map((ps) => ({
                        value: ps.bomId || String(ps.id),
                        label:
                            ps.bomId ||
                            ps.itemDescription ||
                            ps.fgSfgItemCode?.itemCode ||
                            String(ps.id),
                    })),
                );
            } catch (err) {
                console.error("Failed to load process sheets:", err);
            }
        })();

        // Employees — getEmployees
        (async () => {
            try {
                const list = await machineSettingPlanAPI.getEmployees(ORG_ID);
                setEmployeeOptions(
                    (list || []).map((e) => ({
                        value: e.id,
                        label: e.employeeName || e.employeeId || String(e.id),
                    })),
                );
            } catch (err) {
                console.error("Failed to load employees:", err);
            }
        })();
    }, [ORG_ID, BRANCH_ID]);

    /* ---------------- Doc Id auto-generation (Add mode) ---------------- */

    useEffect(() => {
        if (editId || docIdLoadedRef.current) return;
        if (!ORG_ID) return;

        (async () => {
            try {
                const financialYear = String(new Date().getFullYear());
                const docId = await machineSettingPlanAPI.getDocId({
                    financialYear,
                    orgId: ORG_ID,
                });
                if (docId) {
                    setValue("docNo", docId);
                    docIdLoadedRef.current = true;
                }
            } catch (err) {
                console.error("Failed to generate Doc Id:", err);
            }
        })();
    }, [editId, ORG_ID, setValue]);

    /* ---------------- Item → auto-fill description ---------------- */

    useEffect(() => {
        if (!watchItemCode) return;
        const it = itemMapRef.current[watchItemCode];
        if (it) setValue("itemDescription", it.itemDescription || "");
    }, [watchItemCode, setValue]);

    /* ---------------- Operation → auto-fill name + populate machines ---------------- */

    useEffect(() => {
        if (!watchOperationNo) return;
        const op = operationMapRef.current[watchOperationNo];
        if (!op) return;

        setValue("operationName", op.description || "");

        const machines = op.operationMasterMachineDetailsResponseDTO || [];
        setMachineOptions(
            machines
                .map((m) => m.machine)
                .filter(Boolean)
                .map((m) => ({
                    value: m.machineNo || String(m.id),
                    label: m.machineNo || m.machineName || String(m.id),
                })),
        );

        setValue("machineNo", "");
        setValue("machineName", "");
    }, [watchOperationNo, setValue]);

    /* ---------------- Machine → auto-fill name ---------------- */

    useEffect(() => {
        if (!watchMachineNo) return;
        const op = operationMapRef.current[watchOperationNo];
        if (!op) return;

        const match = (op.operationMasterMachineDetailsResponseDTO || [])
            .map((m) => m.machine)
            .find((m) => String(m.machineNo) === String(watchMachineNo));

        if (match) setValue("machineName", match.machineName || "");
    }, [watchMachineNo, watchOperationNo, setValue]);

    /* ---------------- Re-sync on editData ---------------- */

    useEffect(() => {
        if (!editData) return;

        reset({
            ...getDefaultValues(),
            plantId: editData.plantId ?? editData.branch?.id ?? "",
            docNo: editData.docNo ?? editData.docId ?? "",
            date: editData.date ?? editData.docDate ?? todayISO(),
            itemCode:
                editData.itemCode ?? editData.item?.itemId ?? editData.item?.id ?? "",
            itemDescription:
                editData.itemDescription ?? editData.item?.itemDescription ?? "",
            operationNo: editData.operationNo ?? "",
            operationName: editData.operationName ?? "",
            machineNo: editData.machineNo ?? "",
            machineName: editData.machineName ?? "",
            processSheetNo: editData.processSheetNo ?? "",
            make: editData.make ?? "",
            toolReplacementPlan: editData.toolReplacementPlan ?? "",
            msetDetails: editData.msetDetails?.length
                ? editData.msetDetails
                : editData.details?.length
                    ? editData.details.map((d) => ({
                        parameter: d.parameter ?? "",
                        value: d.value ?? "",
                    }))
                    : [{ parameter: "", value: "" }],
            preparedBy:
                editData.preparedBy?.employeeId ??
                editData.preparedBy?.id ??
                editData.preparedBy ??
                "",
            approvedBy:
                editData.approvedBy?.employeeId ??
                editData.approvedBy?.id ??
                editData.approvedBy ??
                "",
        });

        if (editData.docNo || editData.docId) docIdLoadedRef.current = true;
    }, [editData, reset]);

    /* ---------------- Handlers ---------------- */

    const handleAddRow = () => {
        msetDetailsArray.append({ parameter: "", value: "" });
    };

    const handleRemoveRow = (index) => {
        if (msetDetailsArray.fields.length > 1) msetDetailsArray.remove(index);
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

                item: Number(formData.itemCode) || 0,
                operationNo: formData.operationNo || "",
                operationName: formData.operationName || "",
                machineNo: formData.machineNo || "",
                machineName: formData.machineName || "",
                processSheetNo: formData.processSheetNo || "",
                make: formData.make || "",
                toolReplacementPlan: formData.toolReplacementPlan || "",

                preparedBy: Number(formData.preparedBy) || 0,
                approvedBy: Number(formData.approvedBy) || 0,

                details: (formData.msetDetails || [])
                    .filter((d) => d.parameter || d.value)
                    .map((d) => ({
                        parameter: d.parameter || "",
                        value: d.value || "",
                    })),
            };

            console.log("📤 Saving Machine Setting Plan:", payload);

            const response = await machineSettingPlanAPI.createUpdate(payload);

            const isSuccess =
                response?.status === true ||
                response?.statusFlag === "Ok" ||
                response?.status === 200 ||
                response?.statusCode === 200;

            if (isSuccess) {
                addToast(
                    response?.paramObjectsMap?.message ||
                    (editId
                        ? "Machine Setting Plan updated successfully"
                        : "Machine Setting Plan created successfully"),
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

    const msetHeaders = ["S.No", "Parameter", "Value", "Action"];

    return (
        <div className="p-2 max-w-7xl">
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

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-3 mb-6">
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

                        <InputField
                            control={control}
                            name="docNo"
                            label="Doc No. *"
                            required
                            errors={errors}
                            readOnly
                            placeholder="Auto"
                        />

                        <InputField
                            control={control}
                            name="date"
                            label="Date *"
                            type="date"
                            required
                            errors={errors}
                        />

                        <SelectField
                            control={control}
                            name="itemCode"
                            label="Item Code *"
                            options={itemOptions}
                            required
                            errors={errors}
                            placeholder="Select an option"
                        />

                        <InputField
                            control={control}
                            name="itemDescription"
                            label="Item Description"
                            readOnly
                            errors={errors}
                        />

                        <SelectField
                            control={control}
                            name="operationNo"
                            label="Operation No. *"
                            options={operationOptions}
                            required
                            errors={errors}
                            placeholder="Select an option"
                        />

                        <InputField
                            control={control}
                            name="operationName"
                            label="Operation Name"
                            readOnly
                            errors={errors}
                        />

                        <SelectField
                            control={control}
                            name="machineNo"
                            label="Machine No. *"
                            options={machineOptions}
                            required
                            errors={errors}
                            placeholder="Select an option"
                        />

                        <InputField
                            control={control}
                            name="machineName"
                            label="Machine Name"
                            readOnly
                            errors={errors}
                        />

                        <SelectField
                            control={control}
                            name="processSheetNo"
                            label="Process Sheet No *"
                            options={processSheetOptions}
                            required
                            errors={errors}
                            placeholder="Select an option"
                        />

                        <InputField
                            control={control}
                            name="make"
                            label="Make"
                            errors={errors}
                            placeholder="Enter Make"
                        />
                    </div>

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

                        {activeTab === "msetSummary" && (
                            <div className="pt-4 space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <SelectField
                                        control={control}
                                        name="preparedBy"
                                        label="Prepared By"
                                        options={employeeOptions}
                                        errors={errors}
                                        placeholder="Select an option"
                                    />

                                    <SelectField
                                        control={control}
                                        name="approvedBy"
                                        label="Approved By"
                                        options={employeeOptions}
                                        errors={errors}
                                        placeholder="Select an option"
                                    />

                                    <InputField
                                        control={control}
                                        name="toolReplacementPlan"
                                        label="Tool Replacement Plan"
                                        errors={errors}
                                        placeholder="Enter tool replacement plan"
                                    />
                                </div>
                            </div>
                        )}
                    </section>

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

export default MachineSettingPlanForm;
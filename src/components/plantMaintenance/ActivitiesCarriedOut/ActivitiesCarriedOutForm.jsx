// ActivitiesCarriedOutForm.jsx
import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useToast } from "../../Toast/ToastContext";
import branchAPI from "../../../api/branchAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";
import employeeAPI from "../../../api/employeeAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import activitiesCarriedOutAPI from "../../../api/plantMaintenance/activitiesCarriedOutAPI";
import { departmentAPI } from "../../../api/departmentAPI";
import toolCategoryAPI from "../../../api/Production/toolCategoryAPI";
import itemAPI from "../../../api/itemAPI";

/* ---------------------------------------------------------------------------- */
/* Style tokens                                                                 */

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

const fieldGrid =
    "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-2 items-start";

/* ---------------------------------------------------------------------------- */
/* Helpers                                                                      */

const timeToMinutes = (value) => {
    if (!value) return null;
    const parts = String(value).split(":");
    if (parts.length < 2) return null;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (
        Number.isNaN(h) ||
        Number.isNaN(m) ||
        h < 0 ||
        h > 23 ||
        m < 0 ||
        m > 59
    ) {
        return null;
    }
    return h * 60 + m;
};

const computeNoOfHrs = (fromTime, toTime) => {
    const fromMin = timeToMinutes(fromTime);
    const toMin = timeToMinutes(toTime);
    if (fromMin === null || toMin === null) return "";

    let diff = toMin - fromMin;
    if (diff < 0) diff += 24 * 60;

    return (diff / 60).toFixed(2);
};

// Normalize "HH:MM" or "HH:MM:SS" → "HH:MM:SS"
const toTimeString = (value) => {
    if (!value) return "";
    const parts = String(value).split(":");
    const hh = String(parts[0] || "00").padStart(2, "0");
    const mm = String(parts[1] || "00").padStart(2, "0");
    const ss = String(parts[2] || "00").padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
};

/* ---------------------------------------------------------------------------- */
/* Field                                                                        */

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
                className={`${controlClasses} ${error ? "border-red-500" : ""}`}
                placeholder={placeholder}
                disabled={disabled}
            />
            {error && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">
                    {error}
                </p>
            )}
        </div>
    );
};

/* ---------------------------------------------------------------------------- */
/* Main Component                                                               */

const ActivitiesCarriedOutForm = ({ data, onBack, onSave }) => {
    const [orgId] = useState(localStorage.getItem("orgId"));
    const [branchId] = useState(localStorage.getItem("branchId"));
    const { addToast } = useToast();

    const [activeTab, setActiveTab] = useState("activitiesDetails");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [generatingDocId, setGeneratingDocId] = useState(false);

    // Options
    const [plantOptions, setPlantOptions] = useState([]);
    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [checkedByOptions, setCheckedByOptions] = useState([]);
    const [machineToolOptions, setMachineToolOptions] = useState([]);
    const [machineToolNoOptions, setMachineToolNoOptions] = useState([]);
    const [pmCheckListOptions, setPMCheckListOptions] = useState([]);
    const [locationOptions, setLocationOptions] = useState([]);
    const [maintenanceTypeOptions, setMaintenanceTypeOptions] = useState([]);
    const [fromLocationOptions, setFromLocationOptions] = useState([]);
    const [itemCodeOptions, setItemCodeOptions] = useState([]);

    // Raw machine tool list for Location auto-fill
    const [machineToolList, setMachineToolList] = useState([]);

    // Form state
    const [form, setForm] = useState({
        plantId: data?.plantId || "",
        department: data?.department || "",
        checkedBy: data?.checkedBy || "",
        docId: data?.docId || "",
        date: data?.date || new Date().toISOString().split("T")[0],
        machineTool: data?.machineTool || "",
        machineToolNo: data?.machineToolNo || "",
        pmCheckListNo: data?.pmCheckListNo || "",
        location: data?.location || "",
        maintenanceType: data?.maintenanceType || "",
        fromLocation: data?.fromLocation || "",
    });

    // Activity rows
    const [activityRows, setActivityRows] = useState([
        {
            id: 1,
            scheduledActivity: "",
            itemCode: "",
            itemDescription: "",
            fromTime: "",
            toTime: "",
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

    const [componentRows, setComponentRows] = useState([
        {
            id: 1,
            itemCode: "",
            itemDescription: "",
            reqQty: "",
            rate: "",
            amount: "",
            remarks: "",
        },
    ]);

    /* ------------------------------------------------------------------ */
    /* Loaders                                                            */

    const loadBranches = useCallback(async () => {
        if (!orgId) return;
        try {
            const response = await branchAPI.getBranchByOrgId(orgId);
            setPlantOptions(
                (response || []).map((b) => ({
                    value: b.id,
                    label: b.branchName || b.branchCode || b.id,
                }))
            );
        } catch (err) {
            console.error("Failed to load branches:", err);
            addToast("Failed to load Plant list", "error");
            setPlantOptions([]);
        }
    }, [orgId, addToast]);

    const loadDepartments = useCallback(async () => {
        if (!orgId) return;
        try {
            const res = await departmentAPI.getAllDepartments(orgId);
            const rawArray = Array.isArray(res)
                ? res
                : res?.paramObjectsMap?.departmentVO ||
                res?.paramObjectsMap?.departmentList ||
                res?.paramObjectsMap?.departments ||
                [];
            setDepartmentOptions(
                rawArray.map((d) => ({
                    value: d.id,
                    label: d.departmentName || d.departmentCode,
                }))
            );
        } catch (err) {
            console.error("Failed to load departments:", err);
            addToast("Failed to load Department list", "error");
            setDepartmentOptions([]);
        }
    }, [orgId, addToast]);

    const loadEmployees = useCallback(async () => {
        if (!orgId) return;
        try {
            const list = await employeeAPI.getEmployeeByOrgId(orgId);
            const rawArray = Array.isArray(list)
                ? list
                : list?.paramObjectsMap?.employeeMasterVO || [];
            setCheckedByOptions(
                rawArray.map((e) => ({
                    value: e.id,
                    label: e.employeeName || e.name || e.employeeCode,
                }))
            );
        } catch (err) {
            console.error("Failed to load employees:", err);
            addToast("Failed to load Employee list", "error");
            setCheckedByOptions([]);
        }
    }, [orgId, addToast]);

    const loadToolCategories = useCallback(async () => {
        if (!orgId) return;
        try {
            const res = await toolCategoryAPI.getToolCategories(orgId);
            const list =
                res?.paramObjectsMap?.toolCategoryResponseVO ||
                res?.data?.paramObjectsMap?.toolCategoryResponseVO ||
                [];
            setMachineToolOptions(
                list.map((t) => ({
                    value: t.id,
                    label: t.apllicableFor || t.category || t.id,
                }))
            );
        } catch (err) {
            console.error("Failed to load tool categories:", err);
            addToast("Failed to load Machine/Tool list", "error");
            setMachineToolOptions([]);
        }
    }, [orgId, addToast]);

    const loadMachineToolNos = useCallback(
        async (toolCategoryId) => {
            if (!toolCategoryId || !orgId || !branchId) {
                setMachineToolNoOptions([]);
                setMachineToolList([]);
                return;
            }
            try {
                const list =
                    await activitiesCarriedOutAPI.getMachineToolForBreakdown(
                        toolCategoryId,
                        orgId,
                        branchId
                    );
                const safeList = list || [];
                setMachineToolList(safeList);
                setMachineToolNoOptions(
                    safeList.map((m) => ({
                        value: m.number,
                        label: `${m.number}${m.name ? " - " + m.name : ""}`,
                    }))
                );
            } catch (err) {
                console.error("Failed to load machine/tool numbers:", err);
                addToast("Failed to load Machine/Tool numbers", "error");
                setMachineToolNoOptions([]);
                setMachineToolList([]);
            }
        },
        [orgId, branchId, addToast]
    );

    const loadLocations = useCallback(async () => {
        if (!orgId || !branchId) return;
        try {
            const list = await locationMasterAPI.getLocationMasterByOrgId(
                orgId,
                branchId
            );
            setFromLocationOptions(
                (list || []).map((l) => ({
                    value: l.id,
                    label: l.locationName || l.locationCode || l.description,
                }))
            );
        } catch (err) {
            console.error("Failed to load locations:", err);
            addToast("Failed to load Location list", "error");
            setFromLocationOptions([]);
        }
    }, [orgId, branchId, addToast]);

    const loadDropdown = useCallback(
        async (groupName, setter) => {
            if (!orgId) return;
            try {
                const response = await listOfValuesAPI.getListValuesGroup(
                    groupName,
                    orgId
                );
                setter(
                    (response || []).map((item) => ({
                        value: item.id,
                        label: item.valuesDescription,
                    }))
                );
            } catch (err) {
                console.error(`Failed to load ${groupName}:`, err);
                setter([]);
            }
        },
        [orgId]
    );

    const loadItems = useCallback(async () => {
        if (!orgId || !branchId) return;
        try {
            const list = await itemAPI.getItems(orgId, branchId);
            setItemCodeOptions(
                (list || []).map((it) => ({
                    value: it.id,
                    label: `${it.itemCode || ""} - ${it.itemDescription || ""}`,
                    itemDescription: it.itemDescription || "",
                }))
            );
        } catch (err) {
            console.error("Failed to load items:", err);
            addToast("Failed to load Item list", "error");
            setItemCodeOptions([]);
        }
    }, [orgId, branchId, addToast]);

    const loadDocId = useCallback(async () => {
        if (data?.id || !orgId) return;
        setGeneratingDocId(true);
        try {
            const financialYear = new Date().getFullYear().toString();
            const docId =
                await activitiesCarriedOutAPI.getActivitiesCarriedOutDocId(
                    orgId,
                    financialYear
                );
            if (docId) {
                setForm((p) => ({ ...p, docId }));
            }
        } catch (err) {
            console.error("Failed to generate Doc ID:", err);
            addToast("Failed to generate Doc ID", "error");
        } finally {
            setGeneratingDocId(false);
        }
    }, [orgId, data?.id, addToast]);

    /* ------------------------------------------------------------------ */
    /* Mount                                                              */

    useEffect(() => {
        loadBranches();
        loadDepartments();
        loadEmployees();
        loadToolCategories();
        loadLocations();
        loadItems();
        loadDropdown("LOCATION", setLocationOptions);
        loadDropdown("MAINTENANCE TYPE", setMaintenanceTypeOptions);
        loadDocId();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* Reload machine tool numbers when Machine/Tool changes */
    useEffect(() => {
        if (form.machineTool) {
            loadMachineToolNos(form.machineTool);
        } else {
            setMachineToolNoOptions([]);
            setMachineToolList([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.machineTool]);

    /* Load PM Check List options whenever Machine No changes */
    useEffect(() => {
        const loadPMCheckLists = async () => {
            if (!form.machineToolNo || !orgId || !branchId) {
                setPMCheckListOptions([]);
                return;
            }

            try {
                const list = await activitiesCarriedOutAPI.getPMCheckListDropdown(
                    branchId,
                    form.machineToolNo,
                    orgId
                );

                const mapped = (list || []).map((p) => ({
                    value: p.id,
                    label: p.name || String(p.id),
                }));

                setPMCheckListOptions(mapped);

                // Auto-select first option if the current value is not in the list
                setForm((prev) => {
                    const exists = mapped.some(
                        (o) => String(o.value) === String(prev.pmCheckListNo)
                    );
                    if (!exists) {
                        return {
                            ...prev,
                            pmCheckListNo: mapped[0]?.value ?? "",
                        };
                    }
                    return prev;
                });
            } catch (err) {
                console.error("Failed to load PM Check List list:", err);
                addToast("Failed to load PM Check List", "error");
                setPMCheckListOptions([]);
            }
        };

        loadPMCheckLists();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.machineToolNo, orgId, branchId]);

    /* ------------------------------------------------------------------ */
    /* Handlers                                                           */

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: "" }));
        }

        // Machine / Tool / Inst. No. → clear PM Check List No, auto-fill Location
        if (name === "machineToolNo") {
            const found = machineToolList.find(
                (m) => String(m.number) === String(value)
            );

            setForm((prev) => ({
                ...prev,
                machineToolNo: value,
                pmCheckListNo: "", // 👈 reset — effect will reload
                location: found?.location || prev.location || "",
            }));
            return;
        }

        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    /* Activity row change */
    const handleActivityRowChange = (index, field, value) => {
        setActivityRows((prev) => {
            const updated = [...prev];
            const row = { ...updated[index], [field]: value };

            if (field === "itemCode") {
                const found = itemCodeOptions.find(
                    (o) => String(o.value) === String(value)
                );
                row.itemDescription = found?.itemDescription || "";
            }

            if (field === "fromTime" || field === "toTime") {
                row.noOfHrs = computeNoOfHrs(row.fromTime, row.toTime);
            }

            updated[index] = row;
            return updated;
        });
    };

    /* Component row change */
    const handleComponentRowChange = (index, field, value) => {
        setComponentRows((prev) => {
            const updated = [...prev];
            const row = { ...updated[index], [field]: value };

            if (field === "itemCode") {
                const found = itemCodeOptions.find(
                    (o) => String(o.value) === String(value)
                );
                row.itemDescription = found?.itemDescription || "";
            }

            if (field === "rate" || field === "reqQty") {
                const rate = parseFloat(row.rate) || 0;
                const reqQty = parseFloat(row.reqQty) || 0;
                row.amount = (rate * reqQty).toFixed(2);
            }

            updated[index] = row;
            return updated;
        });
    };

    const handleAddRow = (type) => {
        if (type === "activity") {
            setActivityRows((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    scheduledActivity: "",
                    itemCode: "",
                    itemDescription: "",
                    fromTime: "",
                    toTime: "",
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
            setComponentRows((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    itemCode: "",
                    itemDescription: "",
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
        }
    };

    const validate = () => {
        const errors = {};
        if (!form.plantId) errors.plantId = "Plant ID is required";
        if (!form.department) errors.department = "Department is required";
        if (!form.machineTool)
            errors.machineTool = "Machine/Tool/Inst. is required";
        if (!form.date) errors.date = "Date is required";
        if (!form.maintenanceType)
            errors.maintenanceType = "Maintenance Type is required";
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    /* ---------------------------------------------------------------- */
    /* Save                                                             */
    const handleSave = async () => {
        if (!validate()) {
            addToast("Please fix validation errors before saving", "error");
            return;
        }
        setIsSubmitting(true);

        try {
            const vo = {
                active: data?.active === "Active" || data?.active === true || true,
                activitiesCarriedOutComponentDetailsDTO: componentRows
                    .filter((r) => r.itemCode)
                    .map((r) => ({
                        amount: parseFloat(r.amount) || 0,
                        item: parseInt(r.itemCode) || 0,
                        rate: parseFloat(r.rate) || 0,
                        remarks: r.remarks || "",
                        reqQty: parseFloat(r.reqQty) || 0,
                    })),
                activitiesCarriedOutDetailsDTO: activityRows.map((row) => ({
                    activitiesCarriedOut: row.activitiesCarriedOut || "",
                    checkingPoints: row.checkingPoints || "",
                    date: row.date || "",
                    frequency: row.frequency || "",
                    fromTime: toTimeString(row.fromTime), // 👈 "HH:MM:SS"
                    item: parseInt(row.itemCode) || 0,
                    nextActivity: row.nextActivity || "",
                    nextScheduleDate: row.nextScheduleD || "",
                    noOfHrs: parseFloat(row.noOfHrs) || 0,
                    parameter: row.parameter || "",
                    scheduledActivity: row.scheduledActivity || "",
                    status: row.status || "",
                    toTime: toTimeString(row.toTime), // 👈 "HH:MM:SS"
                })),
                branch: parseInt(form.plantId) || Number(branchId) || 0,
                cancelRemarks: "",
                checkedBy: parseInt(form.checkedBy) || 0,
                createdBy: localStorage.getItem("userName") || "SYSTEM",
                department: parseInt(form.department) || 0,
                financialYear: new Date().getFullYear().toString(),
                fromLocation: parseInt(form.fromLocation) || 0,
                location: form.location || "",
                machineToolInstNo: form.machineToolNo || "",
                maintenanceType: parseInt(form.maintenanceType) || 0,
                orgId: Number(orgId),
                pmCheckListNo: parseInt(form.pmCheckListNo) || 0,
                selectMachineToolInst: parseInt(form.machineTool) || 0,
            };

            if (data?.id) {
                vo.id = parseInt(data.id);
            }

            console.log("📤 Saving Activities Carried Out VO:", vo);

            const response =
                await activitiesCarriedOutAPI.updateCreateActivitiesCarriedOut(vo);
            console.log("📥 Response:", response);

            const status =
                response?.status === true ||
                response?.success === true ||
                response?.statusFlag === "Ok" ||
                response?.status === "SUCCESS" ||
                response?.status === 200 ||
                response?.statusCode === 200;

            if (status) {
                addToast(
                    data?.id
                        ? "Activities Carried Out updated successfully!"
                        : "Activities Carried Out created successfully!",
                    "success"
                );
                if (onSave) onSave(vo);
                else onBack();
            } else {
                const errorMessage =
                    response?.paramObjectsMap?.message ||
                    response?.paramObjectsMap?.errorMessage ||
                    response?.message ||
                    response?.errorMessage ||
                    response?.error ||
                    "Something went wrong";
                addToast(errorMessage, "error");
            }
        } catch (err) {
            console.error("Save Activities Carried Out Error:", err);
            const errorMessage =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to save Activities Carried Out.";
            addToast(errorMessage, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ------------------------------------------------------------------ */
    /* Table config                                                       */

    const activityColumns = [
        { key: "scheduledActivity", label: "Scheduled Activity" },
        {
            key: "itemCode",
            label: "Item Code",
            type: "select",
            options: itemCodeOptions,
        },
        { key: "itemDescription", label: "Item Description", type: "text" },
        { key: "fromTime", label: "From Time *", type: "time" },
        { key: "toTime", label: "To Time *", type: "time" },
        { key: "checkingPoints", label: "Checking Points", type: "text" },
        { key: "parameter", label: "Parameter", type: "text" },
        {
            key: "activitiesCarriedOut",
            label: "Activities Carried Out",
            type: "text",
        },
        {
            key: "status",
            label: "Status *",
            type: "select",
            options: [
                { value: "completed", label: "Completed" },
                { value: "pending", label: "Pending" },
                { value: "inProgress", label: "In Progress" },
            ],
        },
        { key: "date", label: "Date", type: "date" },
        { key: "nextActivity", label: "Next Activity" },
        { key: "noOfHrs", label: "No. Of Hrs", type: "text", disabled: true },
        { key: "frequency", label: "Frequency", type: "text" },
        { key: "nextScheduleD", label: "Next Schedule Date", type: "date" },
    ];

    const componentColumns = [
        {
            key: "itemCode",
            label: "Item Code",
            type: "select",
            options: itemCodeOptions,
        },
        { key: "itemDescription", label: "Item Description", type: "text" },
        { key: "reqQty", label: "Req. Qty", type: "number", step: "0.01" },
        { key: "rate", label: "Rate", type: "number", step: "0.01" },
        {
            key: "amount",
            label: "Amount",
            type: "number",
            step: "0.01",
            disabled: true,
        },
        { key: "remarks", label: "Remarks", type: "text" },
    ];

    const renderTableRows = (rows, columns, onCellChange, onRemove, type) =>
        rows.map((row, index) => (
            <tr
                key={row.id}
                className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
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
                                    onChange={(e) =>
                                        onCellChange(index, col.key, e.target.value)
                                    }
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
                                onChange={(e) =>
                                    onCellChange(index, col.key, e.target.value)
                                }
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
                        onClick={() => onRemove(type, index)}
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

    /* ------------------------------------------------------------------ */
    /* Render                                                             */

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
                    {data?.id
                        ? "Edit Activities Carried Out"
                        : "Add Activities Carried Out"}
                </h2>
            </div>

            {/* Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
                {/* Header fields */}
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
                        label="Select Machine/Tool/Inst."
                        name="machineTool"
                        value={form.machineTool}
                        onChange={handleChange}
                        error={fieldErrors.machineTool}
                        required
                        options={machineToolOptions}
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
                        disabled={!form.machineToolNo}
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

                {/* Activities Details */}
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
                                        <th className="p-1 text-center w-10 dark:text-gray-200">
                                            S.no
                                        </th>
                                        {activityColumns.map((col) => (
                                            <th
                                                key={col.key}
                                                className="p-1 text-left dark:text-gray-200 text-[10px] font-medium whitespace-nowrap"
                                            >
                                                {col.label}
                                            </th>
                                        ))}
                                        <th className="p-1 text-center w-10 dark:text-gray-200">
                                            Action
                                        </th>
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

                {/* Components Grid */}
                {activeTab === "componentsGrid" && (
                    <div className="mt-2">
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
                                            <th className="p-1 text-center w-10 dark:text-gray-200">
                                                S.no
                                            </th>
                                            {componentColumns.map((col) => (
                                                <th
                                                    key={col.key}
                                                    className="p-1 text-left dark:text-gray-200 text-[10px] font-medium whitespace-nowrap"
                                                >
                                                    {col.label}
                                                </th>
                                            ))}
                                            <th className="p-1 text-center w-10 dark:text-gray-200">
                                                Action
                                            </th>
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
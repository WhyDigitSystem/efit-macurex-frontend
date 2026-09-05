import React, { useState, useEffect, useCallback, useRef } from "react";
import dayjs from "dayjs";
import {
    ArrowLeft,
    Save,
    X,
    Plus,
    Trash2,
    Eye,
    UploadCloud,
    FileText,
} from "lucide-react";
import { useToast } from "../../Toast/ToastContext";
import machineMasterAPI from "../../../api/Production/machineMasterAPI";
import branchAPI from "../../../api/branchAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";
import employeeAPI from "../../../api/employeeAPI";
import { departmentAPI } from "../../../api/departmentAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import partyMasterAPI from "../../../api/partyMasterAPI";
import countryAPI from "../../../api/countryAPI";
import unitMasterAPI from "../../../api/unitAPI";
import { itemAPI } from "../../../api/itemAPI";
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

const cellInputClasses =
    "w-full h-8 px-2 rounded border text-xs leading-none transition-colors " +
    "bg-white dark:bg-gray-900 " +
    "border-gray-300 dark:border-gray-600 " +
    "text-gray-900 dark:text-gray-100 " +
    "placeholder-gray-400 dark:placeholder-gray-500 " +
    "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
    "dark:focus:ring-blue-400 dark:focus:border-blue-400";

const labelClasses = "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
    "grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-x-4 gap-y-3 items-start";

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

    if (type === "date") {
        return (
            <div className={`w-full ${className}`}>
                <label className={labelClasses}>
                    {label}
                    {required && <span className="text-red-500"> *</span>}
                </label>

                <input
                    type="date"
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
    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
        {children}
    </h3>
);

const FormButtons = ({ onCancel, onSave, isSubmitting, saveLabel }) => (
    <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
        <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
            <X className="h-3 w-3" />
            Cancel
        </button>

        <button
            onClick={onSave}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
            <Save className="h-3 w-3" />
            {isSubmitting ? "Saving..." : saveLabel}
        </button>
    </div>
);

/* ---------------------------------------------------------------------------- */
/* Table helpers                                                               */

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
                        } dark:text-white`}
                >
                    {h}
                </th>
            ))}
        </tr>
    </thead>
);

const TableRow = ({ children, index, onRemove, disabled }) => (
    <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
        <td className="p-2 text-center font-medium dark:text-white">{index + 1}</td>
        {children}
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
    </tr>
);

// Complete DynamicTable component with all field types
const DynamicTable = ({ columns, rows, onCellChange, onRemoveRow }) => (
    <TableWrapper>
        <TableHead headers={["#", ...columns.map((c) => c.label), "Action"]} />
        <tbody>
            {rows.map((row, idx) => (
                <TableRow
                    key={idx}
                    index={idx}
                    onRemove={() => onRemoveRow(idx)}
                    disabled={rows.length <= 1}
                >
                    {columns.map((col) => {
                        if (col.type === "select") {
                            return (
                                <td className="p-2 align-top" key={col.key}>
                                    <select
                                        value={row[col.key] || ""}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (col.key === "spareId" && col.options) {
                                                const selectedItem = col.options.find(
                                                    opt => String(opt.value) === String(value)
                                                );
                                                onCellChange(idx, col.key, value, selectedItem);
                                            } else {
                                                onCellChange(idx, col.key, value);
                                            }
                                        }}
                                        className={cellInputClasses}
                                    >
                                        <option value="">-- Select --</option>
                                        {(col.options || []).map((opt) => (
                                            <option key={opt.value ?? opt} value={opt.value ?? opt}>
                                                {opt.label ?? opt}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            );
                        }

                        if (col.type === "file") {
                            return (
                                <td className="p-2 align-top" key={col.key}>
                                    <div className="flex items-center gap-2">
                                        <input
                                            key={`${idx}-${col.key}-${row[col.key] instanceof File ? row[col.key].name : 'file'}`}
                                            type="file"
                                            accept={col.accept || "image/*"}
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    onCellChange(idx, col.key, file);
                                                }
                                            }}
                                            className="text-xs file:mr-2 file:px-2 file:py-1 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                                        />
                                        {row[col.key] && (
                                            <span className="text-xs text-green-600 dark:text-green-400">
                                                {row[col.key] instanceof File
                                                    ? `📎 ${row[col.key].name}`
                                                    : row[col.key].fileName || row[col.key].name || "File uploaded"}
                                            </span>
                                        )}
                                    </div>
                                </td>
                            );
                        }

                        if (col.type === "date") {
                            return (
                                <td className="p-2 align-top" key={col.key}>
                                    <input
                                        type="date"
                                        value={row[col.key] || ""}
                                        onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                                        className={cellInputClasses}
                                    />
                                </td>
                            );
                        }

                        if (col.type === "textarea") {
                            return (
                                <td className="p-2 align-top" key={col.key}>
                                    <textarea
                                        value={row[col.key] || ""}
                                        onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                                        className={`${cellInputClasses} min-h-[60px] resize-y`}
                                        rows={2}
                                    />
                                </td>
                            );
                        }

                        return (
                            <td className="p-2 align-top" key={col.key}>
                                <input
                                    type={col.type === "number" ? "number" : "text"}
                                    value={row[col.key] || ""}
                                    readOnly={col.readOnly}
                                    onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                                    className={
                                        col.readOnly ? "w-full h-8 px-2 rounded border text-xs leading-none bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400" : cellInputClasses
                                    }
                                />
                            </td>
                        );
                    })}
                </TableRow>
            ))}
        </tbody>
    </TableWrapper>
);

/* ---------------------------------------------------------------------------- */
/* Tab configuration                                                           */

const CHILD_TABS = [
    { key: "equipments", label: "Equipments" },
    { key: "technicalInfo", label: "Technical Info" },
    { key: "spareDetails", label: "Spare Details" },
    { key: "machineHistory", label: "Machine History" },
    { key: "image", label: "Image" },
    { key: "pdfAttachment", label: "Pdf Attachment" },
];

const emptySpareRow = () => ({
    spareId: "",
    spareDesc: "",
    unit: "",
    quantity: "",
    critical: "",
    modelNo: "",
    serialNo: "",
    manufacturer: "",
    warrantyTillDate: "",
    calibrationRequired: "",
    lastCalibDate: "",
    nextCalibDate: "",
});

const emptyHistoryRow = () => ({
    date: "",
    description: "",
    changedDate: "",
    cost: "",
    purpose: "",
    remarks: "",
});

/* ---------------------------------------------------------------------------- */

const MachineMasterForm = ({ editData, editId, onBack, onSave }) => {
    const { addToast } = useToast();
    const orgId = Number(localStorage.getItem("orgId")) || 0;
    const branchId = Number(localStorage.getItem("branchId")) || 0;
    const usersId = localStorage.getItem("usersId") || localStorage.getItem("userName") || "SYSTEM";

    const [activeChildTab, setActiveChildTab] = useState("equipments");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [dataLoadedRef, setDataLoadedRef] = useState(false);

    // Lookup options
    const [plantOptions, setPlantOptions] = useState([]);
    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [typeOptions, setTypeOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [locationOptions, setLocationOptions] = useState([]);
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [statusOptions, setStatusOptions] = useState([]);
    const [madeInOptions, setMadeInOptions] = useState([]);
    const [purchasedFromOptions, setPurchasedFromOptions] = useState([]);
    const [modeOfPurchaseOptions, setModeOfPurchaseOptions] = useState([]);
    const [pmCheckListOptions, setPmCheckListOptions] = useState([]);
    const [uomOptions, setUomOptions] = useState([]);
    const [spareOptions, setSpareOptions] = useState([]);
    const [unitOptions, setUnitOptions] = useState([]);
    const [itemOptions, setItemOptions] = useState([]);
    const [toolCategoryOptions, setToolCategoryOptions] = useState([]);

    // Form state
    const [header, setHeader] = useState({
        plantId: "",
        department: "",
        type: "",
        machineInstrumentNo: "",
        machineInstrumentName: "",
        calibrationRequired: "",
        location: "",
        processNo: "",
        machineInstrumentCategory: "",
        section: "",
        model: "",
        serialNo: "",
        status: "",
        manufacturedBy: "",
        madeIn: "",
        purchasedFrom: "",
        modeOfPurchase: "",
        machineInstrumentIncharge: "",
        machineInstrumentUsedFor: "",
        pmCheckListNo: "",
        remarks: "",
        make: "",
        installationDate: "",
        powerConsumption: "",
        consumption: "",
        powerProduced: "",
        technicalSpecification: "",
        capacity: "",
        unit: "",
        bedSizeMm: "",
        range: "",
        errorAllowed: "",
        frequencyOfCalibration: "",
        currentInAmps: "",
        instrumentCost: "",
        calibrationCost: "",
        voltage: "",
        calibrationAgency: "",
        cussionTonnage: "",
        certificateNo: "",
        parallelity: "",
        shutHtMm: "",
        hcNo: "",
        machineType: "",
        strokeMm: "",
        rangeSize: "",
        hourlyRate: "",
        cushion: "",
        leastcount: "",
        machineInstrumentWt: "",
        hp: "",
        uom: "",
        goSize: "",
        noGoSize: "",
        warrantyStDate: "",
        warrantyEndDate: "",
        ramSize: "",
        throatGap: "",
        lastCalibratedDate: "",
        throatDepth: "",
        maintenanceDate: "",
        nextDueDate: "",
        lifeCycleYear: "",
    });

    const [spareRows, setSpareRows] = useState([emptySpareRow()]);
    const [historyRows, setHistoryRows] = useState([emptyHistoryRow()]);
    const [imageRows, setImageRows] = useState([]);
    const [pdfRows, setPdfRows] = useState([]);

    const formatDateForInput = (date) => {
        if (!date) return "";
        return dayjs(date).format("YYYY-MM-DD");
    };

    /* ---------------- Load Tool Categories based on Type ---------------- */

    const loadToolCategories = useCallback(async (type) => {
        if (!type) {
            setToolCategoryOptions([]);
            return;
        }

        try {
            const response = await machineMasterAPI.getToolCategoryforMachineMaster(
                type,
                orgId
            );
            console.log("Tool Category Response for type:", type, response);

            const toolCategoryList = response?.paramObjectsMap?.toolCategoryList || [];
            setToolCategoryOptions(
                toolCategoryList.map((item) => ({
                    value: item.category,
                    label: item.category || item.id,
                    id: item.id
                }))
            );
        } catch (error) {
            console.error("Error loading tool categories:", error);
            setToolCategoryOptions([]);
        }
    }, [orgId]);

    /* ---------------- Load lookups ---------------- */

    const loadLookups = useCallback(async () => {
        try {
            const branches = await branchAPI.getBranchByOrgId(orgId);
            setPlantOptions(
                (branches || []).map((b) => ({
                    value: b.id,
                    label: b.branchName || b.branchCode || b.id,
                }))
            );

            const departments = await departmentAPI.getAllDepartments(orgId);
            const deptList = departments?.paramObjectsMap?.departmentVO || [];
            setDepartmentOptions(
                deptList.map((d) => ({
                    value: d.id,
                    label: d.departmentCode || d.departmentName || d.id,
                }))
            );

            const types = await listOfValuesAPI.getListValuesGroup("MACHINE_TYPE", orgId);
            setTypeOptions(
                (types || []).map((t) => ({
                    value: t.valuesDescription || t.valueDescription || t.id,
                    label: t.valuesDescription || t.valueDescription || t.id,
                    id: t.id
                }))
            );

            const locations = await locationMasterAPI.getLocationMasterByOrgId(orgId, branchId);
            setLocationOptions(
                (locations || []).map((l) => ({
                    value: l.id,
                    label: l.locationName || l.locationId || l.id,
                }))
            );

            const employees = await employeeAPI.getEmployeeByOrgId(orgId);
            setEmployeeOptions(
                (employees || []).map((e) => ({
                    value: e.id,
                    label: e.employeeName || e.name || e.id,
                }))
            );

            const status = await listOfValuesAPI.getListValuesGroup("STATUS", orgId);
            setStatusOptions(
                (status || []).map((s) => ({
                    value: s.id,
                    label: s.valuesDescription || s.valueDescription || s.id,
                }))
            );

            const countries = await countryAPI.getCountries(orgId);
            setMadeInOptions(
                (countries || []).map((c) => ({
                    value: c.id,
                    label: c.countryName || c.countryCode || c.id,
                }))
            );

            const parties = await partyMasterAPI.getPartyByOrgId(orgId, branchId);
            setPurchasedFromOptions(
                (parties || []).map((p) => ({
                    value: p.id,
                    label: p.customerName || p.customerLegalName || p.customerCode || p.id,
                }))
            );

            const units = await unitMasterAPI.getUnits(orgId);
            setUomOptions(
                (units || []).map((u) => ({
                    value: u.id,
                    label: u.unitId || u.id,
                }))
            );

            setUnitOptions(
                (units || []).map((u) => ({
                    value: u.id,
                    label: u.unitId || u.id,
                }))
            );

            const items = await itemAPI.getItems(orgId, branchId);
            setItemOptions(
                (items || []).map((item) => ({
                    value: item.id,
                    label: `${item.itemCode} - ${item.itemDescription || ''}`,
                    description: item.itemDescription || '',
                    itemCode: item.itemCode || '',
                }))
            );

            const spares = await listOfValuesAPI.getListValuesGroup("SPARE", orgId);
            setSpareOptions(
                (spares || []).map((s) => ({
                    value: s.id,
                    label: s.valuesDescription || s.valueDescription || s.id,
                }))
            );

        } catch (error) {
            console.error("Error loading lookups:", error);
            addToast("Failed to load lookup data", "error");
        }
    }, [orgId, branchId, addToast]);

    /* ---------------- Load edit data ---------------- */

    const loadMachineData = useCallback(async (id) => {
        if (!id) return;

        setLoading(true);
        try {
            const response = await machineMasterAPI.getMachineMasterById(id);
            const data = response?.paramObjectsMap?.machineMasterVO;

            if (data) {
                setHeader({
                    plantId: data.plantId || "",
                    department: data.department || "",
                    type: data.type || "",
                    machineInstrumentNo: data.machineInstrumentNo || "",
                    machineInstrumentName: data.machineInstrumentName || "",
                    calibrationRequired: data.calibrationRequired || "",
                    location: data.location || "",
                    processNo: data.processNo || "",
                    machineInstrumentCategory: data.machineInstrumentCategory || "",
                    section: data.section || "",
                    model: data.model || "",
                    serialNo: data.serialNo || "",
                    status: data.status || "",
                    manufacturedBy: data.manufacturedBy || "",
                    madeIn: data.madeIn || "",
                    purchasedFrom: data.purchasedFrom || "",
                    modeOfPurchase: data.modeOfPurchase || "",
                    machineInstrumentIncharge: data.machineInstrumentIncharge || "",
                    machineInstrumentUsedFor: data.machineInstrumentUsedFor || "",
                    pmCheckListNo: data.pmCheckListNo || "",
                    remarks: data.remarks || "",
                    make: data.make || "",
                    installationDate: data.installationDate || "",
                    powerConsumption: data.powerConsumption || "",
                    consumption: data.consumption || "",
                    powerProduced: data.powerProduced || "",
                    technicalSpecification: data.technicalSpecification || "",
                    capacity: data.capacity || "",
                    unit: data.unit || "",
                    bedSizeMm: data.bedSizeMm || "",
                    range: data.range || "",
                    errorAllowed: data.errorAllowed || "",
                    frequencyOfCalibration: data.frequencyOfCalibration || "",
                    currentInAmps: data.currentInAmps || "",
                    instrumentCost: data.instrumentCost || "",
                    calibrationCost: data.calibrationCost || "",
                    voltage: data.voltage || "",
                    calibrationAgency: data.calibrationAgency || "",
                    cussionTonnage: data.cussionTonnage || "",
                    certificateNo: data.certificateNo || "",
                    parallelity: data.parallelity || "",
                    shutHtMm: data.shutHtMm || "",
                    hcNo: data.hcNo || "",
                    machineType: data.machineType || "",
                    strokeMm: data.strokeMm || "",
                    rangeSize: data.rangeSize || "",
                    hourlyRate: data.hourlyRate || "",
                    cushion: data.cushion || "",
                    leastcount: data.leastcount || "",
                    machineInstrumentWt: data.machineInstrumentWt || "",
                    hp: data.hp || "",
                    uom: data.uom || "",
                    goSize: data.goSize || "",
                    noGoSize: data.noGoSize || "",
                    warrantyStDate: data.warrantyStDate || "",
                    warrantyEndDate: data.warrantyEndDate || "",
                    ramSize: data.ramSize || "",
                    throatGap: data.throatGap || "",
                    lastCalibratedDate: data.lastCalibratedDate || "",
                    throatDepth: data.throatDepth || "",
                    maintenanceDate: data.maintenanceDate || "",
                    nextDueDate: data.nextDueDate || "",
                    lifeCycleYear: data.lifeCycleYear || "",
                });

                if (data.type) {
                    await loadToolCategories(data.type);
                }

                if (data.spareDetails?.length) {
                    const mappedSpares = data.spareDetails.map((item) => ({
                        ...item,
                        warrantyTillDate: formatDateForInput(item.warrantyTillDate),
                        lastCalibDate: formatDateForInput(item.lastCalibDate),
                        nextCalibDate: formatDateForInput(item.nextCalibDate),
                    }));
                    setSpareRows(mappedSpares);
                }

                if (data.historyDetails?.length) {
                    setHistoryRows(data.historyDetails);
                }

                if (data.images?.length) {
                    setImageRows(
                        data.images.map((img) => ({
                            image: img
                        }))
                    );
                }

                if (data.pdfAttachments?.length) {
                    setPdfRows(
                        data.pdfAttachments.map((pdf) => ({
                            pdf: pdf
                        }))
                    );
                }

                setDataLoadedRef(true);
            }
        } catch (error) {
            console.error("Error loading machine data:", error);
            addToast("Failed to load machine data", "error");
        } finally {
            setLoading(false);
        }
    }, [addToast, loadToolCategories]);

    useEffect(() => {
        loadLookups();
    }, [loadLookups]);

    useEffect(() => {
        if (editId && !dataLoadedRef) {
            loadMachineData(editId);
        } else if (editData) {
            setHeader({
                plantId: editData.plantId || "",
                department: editData.department || "",
                type: editData.type || "",
                machineInstrumentNo: editData.machineInstrumentNo || "",
                machineInstrumentName: editData.machineInstrumentName || "",
                calibrationRequired: editData.calibrationRequired || "",
                location: editData.location || "",
                processNo: editData.processNo || "",
                machineInstrumentCategory: editData.machineInstrumentCategory || "",
                section: editData.section || "",
                model: editData.model || "",
                serialNo: editData.serialNo || "",
                status: editData.status || "",
                manufacturedBy: editData.manufacturedBy || "",
                madeIn: editData.madeIn || "",
                purchasedFrom: editData.purchasedFrom || "",
                modeOfPurchase: editData.modeOfPurchase || "",
                machineInstrumentIncharge: editData.machineInstrumentIncharge || "",
                machineInstrumentUsedFor: editData.machineInstrumentUsedFor || "",
                pmCheckListNo: editData.pmCheckListNo || "",
                remarks: editData.remarks || "",
                make: editData.make || "",
                installationDate: editData.installationDate || "",
                powerConsumption: editData.powerConsumption || "",
                consumption: editData.consumption || "",
                powerProduced: editData.powerProduced || "",
                technicalSpecification: editData.technicalSpecification || "",
                capacity: editData.capacity || "",
                unit: editData.unit || "",
                bedSizeMm: editData.bedSizeMm || "",
                range: editData.range || "",
                errorAllowed: editData.errorAllowed || "",
                frequencyOfCalibration: editData.frequencyOfCalibration || "",
                currentInAmps: editData.currentInAmps || "",
                instrumentCost: editData.instrumentCost || "",
                calibrationCost: editData.calibrationCost || "",
                voltage: editData.voltage || "",
                calibrationAgency: editData.calibrationAgency || "",
                cussionTonnage: editData.cussionTonnage || "",
                certificateNo: editData.certificateNo || "",
                parallelity: editData.parallelity || "",
                shutHtMm: editData.shutHtMm || "",
                hcNo: editData.hcNo || "",
                machineType: editData.machineType || "",
                strokeMm: editData.strokeMm || "",
                rangeSize: editData.rangeSize || "",
                hourlyRate: editData.hourlyRate || "",
                cushion: editData.cushion || "",
                leastcount: editData.leastcount || "",
                machineInstrumentWt: editData.machineInstrumentWt || "",
                hp: editData.hp || "",
                uom: editData.uom || "",
                goSize: editData.goSize || "",
                noGoSize: editData.noGoSize || "",
                warrantyStDate: editData.warrantyStDate || "",
                warrantyEndDate: editData.warrantyEndDate || "",
                ramSize: editData.ramSize || "",
                throatGap: editData.throatGap || "",
                lastCalibratedDate: editData.lastCalibratedDate || "",
                throatDepth: editData.throatDepth || "",
                maintenanceDate: editData.maintenanceDate || "",
                nextDueDate: editData.nextDueDate || "",
                lifeCycleYear: editData.lifeCycleYear || "",
            });

            if (editData.type) {
                loadToolCategories(editData.type);
            }

            if (editData.spareDetails?.length) {
                const mappedSpares = editData.spareDetails.map((item) => ({
                    ...item,
                    warrantyTillDate: formatDateForInput(item.warrantyTillDate),
                    lastCalibDate: formatDateForInput(item.lastCalibDate),
                    nextCalibDate: formatDateForInput(item.nextCalibDate),
                }));
                setSpareRows(mappedSpares);
            }

            if (editData.historyDetails?.length) {
                setHistoryRows(editData.historyDetails);
            }
            setDataLoadedRef(true);
        }
    }, [editData, editId, loadMachineData, loadToolCategories]);

    // Load tool categories when type changes
    useEffect(() => {
        if (header.type) {
            loadToolCategories(header.type);
        }
    }, [header.type, loadToolCategories]);

    /* ---------------- Handlers ---------------- */

    const handleHeaderChange = (e) => {
        const { name, value } = e.target;
        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: "" }));
        }

        if (name === "type") {
            setHeader((prev) => ({
                ...prev,
                [name]: value,
                machineInstrumentCategory: ""
            }));
        } else {
            setHeader((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSpareCellChange = (idx, key, value, selectedItem = null) => {
        setSpareRows((prev) =>
            prev.map((row, i) => {
                if (i === idx) {
                    if (key === "spareId") {
                        let description = "";
                        if (selectedItem) {
                            description = selectedItem.description || "";
                            if (!description && selectedItem.label) {
                                const parts = selectedItem.label.split(" - ");
                                if (parts.length > 1) {
                                    description = parts.slice(1).join(" - ");
                                } else {
                                    description = selectedItem.label;
                                }
                            }
                        }
                        return {
                            ...row,
                            spareId: value,
                            spareDesc: description
                        };
                    }
                    return { ...row, [key]: value };
                }
                return row;
            })
        );
    };

    const handleAddSpareRow = () => {
        setSpareRows((prev) => [...prev, emptySpareRow()]);
    };

    const handleRemoveSpareRow = (idx) => {
        if (spareRows.length <= 1) return;
        setSpareRows((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleHistoryCellChange = (idx, key, value) => {
        setHistoryRows((prev) =>
            prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row))
        );
    };

    const handleAddHistoryRow = () => {
        setHistoryRows((prev) => [...prev, emptyHistoryRow()]);
    };

    const handleRemoveHistoryRow = (idx) => {
        if (historyRows.length <= 1) return;
        setHistoryRows((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleAddImageRow = () => {
        setImageRows((prev) => [...prev, { image: null }]);
    };

    const handleRemoveImageRow = (idx) => {
        if (imageRows.length <= 1) return;
        setImageRows((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleImageChange = (idx, key, value) => {
        console.log("Image change:", idx, key, value);
        setImageRows((prev) => {
            const newRows = [...prev];
            newRows[idx] = { ...newRows[idx], [key]: value };
            return newRows;
        });
    };

    const handlePdfChange = (idx, key, value) => {
        console.log("PDF change:", idx, key, value);
        setPdfRows((prev) => {
            const newRows = [...prev];
            newRows[idx] = { ...newRows[idx], [key]: value };
            return newRows;
        });
    };

    const handleAddPdfRow = () => {
        setPdfRows((prev) => [...prev, { pdf: null }]);
    };

    const handleRemovePdfRow = (idx) => {
        if (pdfRows.length <= 1) return;
        setPdfRows((prev) => prev.filter((_, i) => i !== idx));
    };

    /* ---------------- Validation ---------------- */

    const validate = () => {
        const errors = {};

        if (!header.plantId) errors.plantId = "Plant ID is required";
        if (!header.department) errors.department = "Department is required";
        if (!header.type) errors.type = "Type is required";
        if (!header.machineInstrumentNo) errors.machineInstrumentNo = "Machine/Instrument No is required";
        if (!header.machineInstrumentName) errors.machineInstrumentName = "Machine/Instrument Name is required";
        if (!header.calibrationRequired) errors.calibrationRequired = "Calibration Required is required";

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

        const isUpdate = Boolean(editData?.id || editId);

        try {
            // Prepare the machine master data
            const machineData = {
                active: true,
                bedSizeMm: Number(header.bedSizeMm) || 0,
                branch: Number(header.plantId) || 0,
                calibrationAgency: header.calibrationAgency || "",
                calibrationCost: Number(header.calibrationCost) || 0,
                calibrationRequired: header.calibrationRequired || "",
                cancel: false,
                cancelRemarks: "",
                capacity: Number(header.capacity) || 0,
                certificateNo: header.certificateNo || "",
                consumption: Number(header.consumption) || 0,
                createdBy: usersId || "SYSTEM",
                currentInAmps: Number(header.currentInAmps) || 0,
                cushion: Number(header.cushion) || 0,
                cushionTonnage: Number(header.cussionTonnage) || 0,
                department: Number(header.department) || 0,
                errorAllowed: header.errorAllowed || "",
                frequencyOfCalibration: header.frequencyOfCalibration || "",
                goSize: Number(header.goSize) || 0,
                hcNo: header.hcNo || "",
                hourlyRate: Number(header.hourlyRate) || 0,
                hp: Number(header.hp) || 0,
                installationDate: header.installationDate || "",
                instrumentCost: Number(header.instrumentCost) || 0,
                lastCalibratedDate: header.lastCalibratedDate || "",
                leastcount: Number(header.leastcount) || 0,
                lifeCycleYear: header.lifeCycleYear || "",
                location: Number(header.location) || 0,
                machineInstrumentCategory: Number(header.machineInstrumentCategory) || 0,
                machineInstrumentImageName: "",
                machineInstrumentIncharge: header.machineInstrumentIncharge || "",
                machineInstrumentName: header.machineInstrumentName || "",
                machineInstrumentNo: header.machineInstrumentNo || "",
                machineInstrumentUsedFor: header.machineInstrumentUsedFor || "",
                machineInstrumentWeight: Number(header.machineInstrumentWt) || 0,
                machineOrInstrument: header.type || "",
                machineType: Number(header.machineType) || 0,
                madeIn: Number(header.madeIn) || 0,
                maintenanceDate: header.maintenanceDate || "",
                make: header.make || "",
                manufacturedBy: header.manufacturedBy || "",
                modeOfPurchase: header.modeOfPurchase || "",
                model: header.model || "",
                nextDueDate: header.nextDueDate || "",
                noGoSize: Number(header.noGoSize) || 0,
                orgId: orgId,
                parallelity: Number(header.parallelity) || 0,
                pmChecklistNo: header.pmCheckListNo || "",
                powerConsumption: Number(header.powerConsumption) || 0,
                powerProduced: Number(header.powerProduced) || 0,
                processNo: header.processNo || "",
                purchasedFrom: Number(header.purchasedFrom) || 0,
                ramSize: Number(header.ramSize) || 0,
                range: header.range || "",
                rangeSize: Number(header.rangeSize) || 0,
                remarks: header.remarks || "",
                screenCode: "MACHINE_MASTER",
                screenName: "Machine Master",
                section: header.section || "",
                serialNo: header.serialNo || "",
                shutHeightMm: Number(header.shutHtMm) || 0,
                status: header.status || "",
                strokeMm: Number(header.strokeMm) || 0,
                technicalSpecification: header.technicalSpecification || "",
                throatDepth: Number(header.throatDepth) || 0,
                throatGap: Number(header.throatGap) || 0,
                type: Number(header.type) || 0,
                unit: Number(header.unit) || 0,
                uom: Number(header.uom) || 0,
                updatedBy: usersId || "SYSTEM",
                voltage: Number(header.voltage) || 0,
                warrantyEndDate: header.warrantyEndDate || "",
                warrantyStartDate: header.warrantyStDate || "",

                machineSpareDetailsDTO: spareRows
                    .filter((r) => r.spareId && r.spareId.trim() !== "")
                    .map((r) => ({
                        calibrationRequired: r.calibrationRequired || "",
                        critical: r.critical === "Yes",
                        lastCalibratedDate: r.lastCalibDate || "",
                        manufacturer: r.manufacturer || "",
                        modelNo: r.modelNo || "",
                        quantity: Number(r.quantity) || 0,
                        serialNo: r.serialNo || "",
                        spareDescription: r.spareDesc || "",
                        spareId: Number(r.spareId) || 0,
                        unit: Number(r.unit) || 0,
                        warrantyTillDate: r.warrantyTillDate || "",
                    })),

                machineHistoryDTO: historyRows
                    .filter((r) => r.date?.trim() || r.description?.trim())
                    .map((r) => ({
                        changedDate: r.changedDate || "",
                        cost: Number(r.cost) || 0,
                        date: r.date || "",
                        description: r.description || "",
                        purpose: r.purpose || "",
                        remarks: r.remarks || "",
                    })),
            };

            if (isUpdate) {
                machineData.id = editData?.id || editId;
            }

            // Create FormData
            const formDataToSend = new FormData();

            // Add machine data as JSON blob
            const machineDataJSON = JSON.stringify(machineData);
            const machineDataBlob = new Blob([machineDataJSON], {
                type: "application/json",
            });

            formDataToSend.append(
                "MachineMasterDTO",
                machineDataBlob,
                "machineMasterDTO.json"
            );

            // Add image files
            console.log("Image Rows:", imageRows);
            if (imageRows && imageRows.length > 0) {
                for (let i = 0; i < imageRows.length; i++) {
                    const row = imageRows[i];
                    if (row && row.image) {
                        if (row.image instanceof File) {
                            console.log("Appending image file:", row.image.name);
                            formDataToSend.append("files", row.image, row.image.name);
                        } else if (row.image && typeof row.image === "object" && row.image.filePath) {
                            console.log("Existing image:", row.image.filePath);
                        } else if (typeof row.image === "string" && row.image) {
                            console.log("Image string path:", row.image);
                        }
                    }
                }
            }

            // Add PDF files
            console.log("PDF Rows:", pdfRows);
            if (pdfRows && pdfRows.length > 0) {
                for (let i = 0; i < pdfRows.length; i++) {
                    const row = pdfRows[i];
                    if (row && row.pdf) {
                        if (row.pdf instanceof File) {
                            console.log("Appending PDF file:", row.pdf.name);
                            formDataToSend.append("files", row.pdf, row.pdf.name);
                        } else if (row.pdf && typeof row.pdf === "object" && row.pdf.filePath) {
                            console.log("Existing PDF:", row.pdf.filePath);
                        } else if (typeof row.pdf === "string" && row.pdf) {
                            console.log("PDF string path:", row.pdf);
                        }
                    }
                }
            }

            // Log all FormData entries for debugging
            console.log("FormData entries:");
            for (let pair of formDataToSend.entries()) {
                console.log(pair[0], pair[1]);
            }

            console.log("Sending machine data:", machineData);

            // Call the API
            const response = await machineMasterAPI.createUpdateMachineMaster(formDataToSend);

            console.log("Full API Response:", response);

            const isSuccess =
                response?.status === true ||
                response?.success === true ||
                response?.status === "SUCCESS" ||
                response?.status === 200 ||
                response?.statusCode === 200 ||
                response?.statusFlag === "Ok";

            if (isSuccess) {
                addToast(
                    isUpdate
                        ? "Machine/Instrument updated successfully!"
                        : "Machine/Instrument created successfully!",
                    "success"
                );
                if (onSave) onSave(machineData);
                onBack();
            } else {
                const errorMessage =
                    response?.message ||
                    response?.paramObjectsMap?.message ||
                    response?.errorMessage ||
                    response?.error ||
                    "Failed to save";
                addToast(errorMessage, "error");
            }
        } catch (error) {
            console.error("Save Error:", error);
            const errorMessage =
                error?.response?.data?.message ||
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

    const canAddRow = ["spareDetails", "machineHistory", "image", "pdfAttachment"].includes(activeChildTab);

    const handleAddRow = () => {
        if (activeChildTab === "spareDetails") handleAddSpareRow();
        else if (activeChildTab === "machineHistory") handleAddHistoryRow();
        else if (activeChildTab === "image") handleAddImageRow();
        else if (activeChildTab === "pdfAttachment") handleAddPdfRow();
    };

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
                    {editData || editId ? "Edit Equipment" : "Add Equipment"}
                </h2>
            </div>

            {/* Main Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">

                {/* ---------------- Tabs ---------------- */}
                <section className="mt-0 bg-white dark:bg-gray-800">
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-0">
                        <div className="flex flex-wrap">
                            {CHILD_TABS.map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setActiveChildTab(tab.key)}
                                    className={`px-4 py-1 text-xs font-semibold rounded-t whitespace-nowrap ${activeChildTab === tab.key
                                        ? "bg-blue-600 text-white"
                                        : "text-gray-600 dark:text-gray-300"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {canAddRow && (
                            <button
                                type="button"
                                onClick={handleAddRow}
                                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                            >
                                <Plus size={12} />
                            </button>
                        )}
                    </div>
                </section>

                {/* ---------------- Equipments Tab ---------------- */}
                {activeChildTab === "equipments" && (
                    <div>
                        <SectionHeader>Equipments</SectionHeader>
                        <div className={fieldGrid}>
                            <Field
                                type="select"
                                label="Plant ID"
                                name="plantId"
                                value={header.plantId}
                                onChange={handleHeaderChange}
                                error={fieldErrors.plantId}
                                options={plantOptions}
                                required
                            />
                            <Field
                                type="select"
                                label="Department"
                                name="department"
                                value={header.department}
                                onChange={handleHeaderChange}
                                error={fieldErrors.department}
                                options={departmentOptions}
                                required
                            />
                            <Field
                                type="select"
                                label="Type"
                                name="type"
                                value={header.type}
                                onChange={handleHeaderChange}
                                error={fieldErrors.type}
                                options={typeOptions}
                                required
                            />
                            <Field
                                label="Machine/Instrument No."
                                name="machineInstrumentNo"
                                value={header.machineInstrumentNo}
                                onChange={handleHeaderChange}
                                error={fieldErrors.machineInstrumentNo}
                                required
                            />
                            <Field
                                label="Machine/Instrument Name"
                                name="machineInstrumentName"
                                value={header.machineInstrumentName}
                                onChange={handleHeaderChange}
                                error={fieldErrors.machineInstrumentName}
                                required
                            />
                            <Field
                                type="select"
                                label="Calibration Required"
                                name="calibrationRequired"
                                value={header.calibrationRequired}
                                onChange={handleHeaderChange}
                                error={fieldErrors.calibrationRequired}
                                options={[
                                    { value: "Yes", label: "Yes" },
                                    { value: "No", label: "No" },
                                ]}
                                required
                            />
                            <Field
                                type="select"
                                label="Location"
                                name="location"
                                value={header.location}
                                onChange={handleHeaderChange}
                                options={locationOptions}
                            />
                            <Field
                                label="Process No."
                                name="processNo"
                                value={header.processNo}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                type="select"
                                label="Machine/Instrument Category"
                                name="machineInstrumentCategory"
                                value={header.machineInstrumentCategory}
                                onChange={handleHeaderChange}
                                options={toolCategoryOptions}
                            />
                            <Field
                                label="Section"
                                name="section"
                                value={header.section}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                label="Model"
                                name="model"
                                value={header.model}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                label="Serial No"
                                name="serialNo"
                                value={header.serialNo}
                                onChange={handleHeaderChange}
                            />
                            <Field type="select"
                                label="Status"
                                name="status"
                                value={header.status}
                                onChange={handleHeaderChange}
                                options={[
                                    { value: "Yes", label: "Yes" },
                                    { value: "No", label: "No" },
                                ]}
                            />
                            <Field
                                label="Manufactured By"
                                name="manufacturedBy"
                                value={header.manufacturedBy}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                type="select"
                                label="Made In"
                                name="madeIn"
                                value={header.madeIn}
                                onChange={handleHeaderChange}
                                options={madeInOptions}
                            />
                            <Field
                                type="select"
                                label="Purchased From"
                                name="purchasedFrom"
                                value={header.purchasedFrom}
                                onChange={handleHeaderChange}
                                options={purchasedFromOptions}
                            />
                            <Field
                                type="select"
                                label="Mode Of Purchase"
                                name="modeOfPurchase"
                                value={header.modeOfPurchase}
                                onChange={handleHeaderChange}
                                options={[
                                    { value: "Local", label: "Local" },
                                    { value: "Import", label: "Import" },
                                ]}
                            />
                            <Field
                                label="Machine/Instrument Incharge"
                                name="machineInstrumentIncharge"
                                value={header.machineInstrumentIncharge}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                label="Machine/Instrument Used For"
                                name="machineInstrumentUsedFor"
                                value={header.machineInstrumentUsedFor}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                label="PM Check List No."
                                name="pmCheckListNo"
                                value={header.pmCheckListNo}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                label="Remarks"
                                name="remarks"
                                value={header.remarks}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                label="Make"
                                name="make"
                                value={header.make}
                                onChange={handleHeaderChange}
                            />
                        </div>
                    </div>
                )}

                {/* ---------------- Technical Info Tab ---------------- */}
                {activeChildTab === "technicalInfo" && (
                    <div>
                        <SectionHeader>Technical Information</SectionHeader>
                        <div className={fieldGrid}>
                            <Field
                                type="date"
                                label="Installation Date"
                                name="installationDate"
                                value={header.installationDate}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                type="number"
                                label="Power Consumption(KW/h)"
                                name="powerConsumption"
                                value={header.powerConsumption}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                type="number"
                                label="Consumption"
                                name="consumption"
                                value={header.consumption}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                type="number"
                                label="Power Produced"
                                name="powerProduced"
                                value={header.powerProduced}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                type="textarea"
                                label="Technical Specification"
                                name="technicalSpecification"
                                value={header.technicalSpecification}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                type="number"
                                label="Capacity"
                                name="capacity"
                                value={header.capacity}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                type="select"
                                label="Unit"
                                name="unit"
                                value={header.unit}
                                onChange={handleHeaderChange}
                                options={unitOptions}
                            />
                            <Field
                                type="number"
                                label="Bed Size mm"
                                name="bedSizeMm"
                                value={header.bedSizeMm}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                type="number"
                                label="Range"
                                name="range"
                                value={header.range}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                type="number"
                                label="Error Allowed"
                                name="errorAllowed"
                                value={header.errorAllowed}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                type="text"
                                label="Frequency Of Calibration"
                                name="frequencyOfCalibration"
                                value={header.frequencyOfCalibration}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                type="number"
                                label="Current In AMPS."
                                name="currentInAmps"
                                value={header.currentInAmps}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                type="number"
                                label="Instrument Cost"
                                name="instrumentCost"
                                value={header.instrumentCost}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                type="number"
                                label="Calibration Cost"
                                name="calibrationCost"
                                value={header.calibrationCost}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                type="number"
                                label="Voltage"
                                name="voltage"
                                value={header.voltage}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                label="Calibration Agency"
                                name="calibrationAgency"
                                value={header.calibrationAgency}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                type="number"
                                label="Cussion Tonnage"
                                name="cussionTonnage"
                                value={header.cussionTonnage}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                label="Certificate No."
                                name="certificateNo"
                                value={header.certificateNo}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                label="Parallelity"
                                name="parallelity"
                                value={header.parallelity}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                type="number"
                                label="Shut Ht mm"
                                name="shutHtMm"
                                value={header.shutHtMm}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                label="HC No."
                                name="hcNo"
                                value={header.hcNo}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                label="Machine Type"
                                name="machineType"
                                value={header.machineType}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                type="number"
                                label="Stroke mm"
                                name="strokeMm"
                                value={header.strokeMm}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                label="Range Size"
                                name="rangeSize"
                                value={header.rangeSize}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                type="number"
                                label="Hourly Rate(Rs.)"
                                name="hourlyRate"
                                value={header.hourlyRate}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                label="Cushion"
                                name="cushion"
                                value={header.cushion}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                label="Leastcount"
                                name="leastcount"
                                value={header.leastcount}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                type="number"
                                label="Machine/Instrument Wt."
                                name="machineInstrumentWt"
                                value={header.machineInstrumentWt}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                type="number"
                                label="HP"
                                name="hp"
                                value={header.hp}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                type="select"
                                label="UOM"
                                name="uom"
                                value={header.uom}
                                onChange={handleHeaderChange}
                                options={uomOptions}
                            />
                            <Field
                                label="Go Size"
                                name="goSize"
                                value={header.goSize}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                label="No Go Size"
                                name="noGoSize"
                                value={header.noGoSize}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                type="date"
                                label="Warranty St. Date"
                                name="warrantyStDate"
                                value={header.warrantyStDate}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                type="date"
                                label="Warranty End Date"
                                name="warrantyEndDate"
                                value={header.warrantyEndDate}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                label="RAM Size"
                                name="ramSize"
                                value={header.ramSize}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                label="Throat Gap"
                                name="throatGap"
                                value={header.throatGap}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                type="date"
                                label="Last Calibrated Date"
                                name="lastCalibratedDate"
                                value={header.lastCalibratedDate}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                label="Throat Depth"
                                name="throatDepth"
                                value={header.throatDepth}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                type="date"
                                label="Maintenance Date"
                                name="maintenanceDate"
                                value={header.maintenanceDate}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                type="date"
                                label="Next Due Date"
                                name="nextDueDate"
                                value={header.nextDueDate}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                type="number"
                                label="Life Cycle/Year"
                                name="lifeCycleYear"
                                value={header.lifeCycleYear}
                                onChange={handleHeaderChange}
                            />
                        </div>
                    </div>
                )}

                {/* ---------------- Spare Details Tab ---------------- */}
                {activeChildTab === "spareDetails" && (
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <SectionHeader>Spare Details</SectionHeader>
                            <button
                                type="button"
                                onClick={handleAddSpareRow}
                                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                            >
                                <Plus size={12} />
                            </button>
                        </div>

                        <DynamicTable
                            columns={[
                                {
                                    key: "spareId",
                                    label: "Spare ID",
                                    type: "select",
                                    options: itemOptions,
                                },
                                {
                                    key: "spareDesc",
                                    label: "Spare Desc.",
                                    readOnly: false
                                },
                                {
                                    key: "unit",
                                    label: "Unit",
                                    type: "select",
                                    options: unitOptions,
                                },
                                { key: "quantity", label: "Quantity", type: "number" },
                                {
                                    key: "critical",
                                    label: "Critical",
                                    type: "select",
                                    options: [
                                        { value: "Yes", label: "Yes" },
                                        { value: "No", label: "No" },
                                    ],
                                },
                                { key: "modelNo", label: "Model No." },
                                { key: "serialNo", label: "Serial No" },
                                {
                                    key: "manufacturer",
                                    label: "Manufacturer",
                                },
                                {
                                    key: "warrantyTillDate",
                                    label: "Warranty Till Date",
                                    type: "date",
                                },
                                {
                                    key: "calibrationRequired",
                                    label: "Calibration Required?",
                                    type: "select",
                                    options: [
                                        { value: "Yes", label: "Yes" },
                                        { value: "No", label: "No" },
                                    ],
                                },
                                {
                                    key: "lastCalibDate",
                                    label: "Last Calib. Date",
                                    type: "date",
                                },
                                {
                                    key: "nextCalibDate",
                                    label: "Next Calib. Date",
                                    type: "date",
                                },
                            ]}
                            rows={spareRows}
                            onCellChange={handleSpareCellChange}
                            onRemoveRow={handleRemoveSpareRow}
                        />
                    </div>
                )}

                {/* ---------------- Machine History Tab ---------------- */}
                {activeChildTab === "machineHistory" && (
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <SectionHeader>Machine History</SectionHeader>
                            <button
                                type="button"
                                onClick={handleAddHistoryRow}
                                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                            >
                                <Plus size={12} />
                            </button>
                        </div>

                        <DynamicTable
                            columns={[
                                {
                                    key: "date",
                                    label: "Date",
                                    type: "date",
                                },
                                {
                                    key: "description",
                                    label: "Description",
                                },
                                {
                                    key: "changedDate",
                                    label: "Changed Date",
                                    type: "date",
                                },
                                {
                                    key: "cost",
                                    label: "Cost",
                                    type: "number",
                                },
                                {
                                    key: "purpose",
                                    label: "Purpose",
                                },
                                {
                                    key: "remarks",
                                    label: "Remarks",
                                },
                            ]}
                            rows={historyRows}
                            onCellChange={handleHistoryCellChange}
                            onRemoveRow={handleRemoveHistoryRow}
                        />
                    </div>
                )}

                {/* ---------------- Image Tab ---------------- */}
                {activeChildTab === "image" && (
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <SectionHeader>Images</SectionHeader>
                            <button
                                type="button"
                                onClick={handleAddImageRow}
                                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                            >
                                <Plus size={12} />
                            </button>
                        </div>

                        <DynamicTable
                            columns={[
                                {
                                    key: "image",
                                    label: "Image",
                                    type: "file",
                                    accept: "image/*",
                                },
                            ]}
                            rows={imageRows.length ? imageRows : [{ image: null }]}
                            onCellChange={handleImageChange}
                            onRemoveRow={handleRemoveImageRow}
                        />
                    </div>
                )}

                {/* ---------------- PDF Attachment Tab ---------------- */}
                {activeChildTab === "pdfAttachment" && (
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <SectionHeader>PDF Attachments</SectionHeader>
                            <button
                                type="button"
                                onClick={handleAddPdfRow}
                                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                            >
                                <Plus size={12} />
                            </button>
                        </div>

                        <DynamicTable
                            columns={[
                                {
                                    key: "pdf",
                                    label: "PDF File",
                                    type: "file",
                                    accept: ".pdf",
                                },
                            ]}
                            rows={pdfRows.length ? pdfRows : [{ pdf: null }]}
                            onCellChange={handlePdfChange}
                            onRemoveRow={handleRemovePdfRow}
                        />
                    </div>
                )}

                <FormButtons
                    onCancel={onBack}
                    onSave={handleSave}
                    isSubmitting={isSubmitting}
                    saveLabel={editData || editId ? "Update" : "Save"}
                />
            </div>
        </div>
    );
};

export default MachineMasterForm;
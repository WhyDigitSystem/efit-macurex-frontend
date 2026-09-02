import React, { useState, useEffect, useCallback, useRef } from "react";
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
                                        value={row[col.key]}
                                        onChange={(e) => onCellChange(idx, col.key, e.target.value)}
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
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    onCellChange(idx, col.key, file);
                                                }
                                            }}
                                            className="text-xs file:mr-2 file:px-2 file:py-1 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                                        />
                                        {row[col.key] && typeof row[col.key] === 'object' && (
                                            <span className="text-xs text-gray-500">{row[col.key].name}</span>
                                        )}
                                    </div>
                                </td>
                            );
                        }

                        return (
                            <td className="p-2 align-top" key={col.key}>
                                <input
                                    type={col.type === "number" ? "number" : "text"}
                                    value={row[col.key]}
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
    warrantyTill: "",
    calibrationRequired: "",
    nextCalibDate: "",
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
    const [imageRows, setImageRows] = useState([]);
    const [pdfRows, setPdfRows] = useState([]);

    /* ---------------- Load lookups ---------------- */

    const loadLookups = useCallback(async () => {
        try {
            // Load branches/plants
            const branches = await branchAPI.getBranchByOrgId(orgId);
            setPlantOptions(
                (branches || []).map((b) => ({
                    value: b.id,
                    label: b.branchName || b.branchCode || b.id,
                }))
            );

            // Load departments from Department API
            const departments = await departmentAPI.getAllDepartments(orgId);
            const deptList = departments?.paramObjectsMap?.departmentVO || [];
            setDepartmentOptions(
                deptList.map((d) => ({
                    value: d.id,
                    label: d.departmentCode || d.departmentName || d.id,
                }))
            );

            // Load types from LOV
            const types = await listOfValuesAPI.getListValuesGroup("MACHINE_TYPE", orgId);
            setTypeOptions(
                (types || []).map((t) => ({
                    value: t.id,
                    label: t.valuesDescription || t.valueDescription || t.id,
                }))
            );

            // Load categories from LOV
            const categories = await listOfValuesAPI.getListValuesGroup("MACHINE_CATEGORY", orgId);
            setCategoryOptions(
                (categories || []).map((c) => ({
                    value: c.id,
                    label: c.valuesDescription || c.valueDescription || c.id,
                }))
            );

            // Load locations from Location Master API
            const locations = await locationMasterAPI.getLocationMasterByOrgId(orgId, branchId);
            setLocationOptions(
                (locations || []).map((l) => ({
                    value: l.id,
                    label: l.locationName || l.locationId || l.id,
                }))
            );

            // Load employees
            const employees = await employeeAPI.getEmployeeByOrgId(orgId);
            setEmployeeOptions(
                (employees || []).map((e) => ({
                    value: e.id,
                    label: e.employeeName || e.name || e.id,
                }))
            );

            // Load status from LOV
            const status = await listOfValuesAPI.getListValuesGroup("STATUS", orgId);
            setStatusOptions(
                (status || []).map((s) => ({
                    value: s.id,
                    label: s.valuesDescription || s.valueDescription || s.id,
                }))
            );

            // Load country for Made In
            const countries = await listOfValuesAPI.getListValuesGroup("COUNTRY", orgId);
            setMadeInOptions(
                (countries || []).map((c) => ({
                    value: c.id,
                    label: c.valuesDescription || c.valueDescription || c.id,
                }))
            );

            // Load purchased from options (from Party Master)
            const parties = await partyMasterAPI.getPartyByOrgId(orgId, branchId);
            setPurchasedFromOptions(
                (parties || []).map((p) => ({
                    value: p.id,
                    label: p.customerName || p.customerLegalName || p.customerCode || p.id,
                }))
            );

            // Load mode of purchase
            const mode = await listOfValuesAPI.getListValuesGroup("MODE_OF_PURCHASE", orgId);
            setModeOfPurchaseOptions(
                (mode || []).map((m) => ({
                    value: m.id,
                    label: m.valuesDescription || m.valueDescription || m.id,
                }))
            );

            // Load PM Check List
            const pmCheck = await listOfValuesAPI.getListValuesGroup("PM_CHECK_LIST", orgId);
            setPmCheckListOptions(
                (pmCheck || []).map((p) => ({
                    value: p.id,
                    label: p.valuesDescription || p.valueDescription || p.id,
                }))
            );

            // Load UOM
            const uoms = await listOfValuesAPI.getListValuesGroup("UOM", orgId);
            setUomOptions(
                (uoms || []).map((u) => ({
                    value: u.id,
                    label: u.valuesDescription || u.valueDescription || u.id,
                }))
            );

            // Load spare options
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

                if (data.spareDetails?.length) {
                    setSpareRows(data.spareDetails);
                }

                if (data.images?.length) {
                    setImageRows(data.images);
                }

                if (data.pdfAttachments?.length) {
                    setPdfRows(data.pdfAttachments);
                }

                setDataLoadedRef(true);
            }
        } catch (error) {
            console.error("Error loading machine data:", error);
            addToast("Failed to load machine data", "error");
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        loadLookups();
    }, [loadLookups]);

    useEffect(() => {
        if (editId && !dataLoadedRef) {
            loadMachineData(editId);
        } else if (editData) {
            // Populate from editData if provided
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

            if (editData.spareDetails?.length) {
                setSpareRows(editData.spareDetails);
            }
            setDataLoadedRef(true);
        }
    }, [editData, editId, loadMachineData]);

    /* ---------------- Handlers ---------------- */

    const handleHeaderChange = (e) => {
        const { name, value } = e.target;
        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: "" }));
        }
        setHeader((prev) => ({ ...prev, [name]: value }));
    };

    const handleSpareCellChange = (idx, key, value) => {
        setSpareRows((prev) =>
            prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row))
        );
    };

    const handleAddSpareRow = () => {
        setSpareRows((prev) => [...prev, emptySpareRow()]);
    };

    const handleRemoveSpareRow = (idx) => {
        if (spareRows.length <= 1) return;
        setSpareRows((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleImageChange = (idx, file) => {
        setImageRows((prev) =>
            prev.map((row, i) => (i === idx ? { ...row, image: file } : row))
        );
    };

    const handleAddImageRow = () => {
        setImageRows((prev) => [...prev, { image: null }]);
    };

    const handleRemoveImageRow = (idx) => {
        if (imageRows.length <= 1) return;
        setImageRows((prev) => prev.filter((_, i) => i !== idx));
    };

    const handlePdfChange = (idx, file) => {
        setPdfRows((prev) =>
            prev.map((row, i) => (i === idx ? { ...row, pdf: file } : row))
        );
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

        const payload = {
            ...(isUpdate ? { id: editData?.id || editId } : {}),
            ...header,
            branchId: Number(header.plantId),
            orgId: orgId,
            createdBy: usersId,
            spareDetails: spareRows.filter((r) => r.spareId?.trim()),
            images: imageRows.filter((r) => r.image),
            pdfAttachments: pdfRows.filter((r) => r.pdf),
        };

        console.log("Saving Payload:", payload);

        try {
            const response = await machineMasterAPI.createUpdateMachineMaster(payload);

            const isSuccess = response?.status === true || response?.statusFlag === "Ok";

            if (isSuccess) {
                addToast(
                    isUpdate
                        ? "Machine/Instrument updated successfully!"
                        : "Machine/Instrument created successfully!",
                    "success"
                );
                if (onSave) onSave(payload);
                onBack();
            } else {
                const errorMessage = response?.paramObjectsMap?.message || response?.message || "Failed to save";
                addToast(errorMessage, "error");
            }
        } catch (error) {
            console.error("Save Error:", error);
            const errorMessage = error?.response?.data?.message || error?.message || "Something went wrong";
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

    const canAddRow = ["spareDetails", "image", "pdfAttachment"].includes(activeChildTab);

    const handleAddRow = () => {
        if (activeChildTab === "spareDetails") handleAddSpareRow();
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
                                options={categoryOptions}
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
                            <Field
                                type="select"
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
                                // options={modeOfPurchaseOptions}
                                options={[
                                    { value: "Local", label: "Local" },
                                    { value: "Import", label: "Import" },
                                ]}
                            />
                            <Field
                                // type="select"
                                label="Machine/Instrument Incharge"
                                name="machineInstrumentIncharge"
                                value={header.machineInstrumentIncharge}
                                onChange={handleHeaderChange}
                                // options={employeeOptions}
                            />
                            <Field
                                label="Machine/Instrument Used For"
                                name="machineInstrumentUsedFor"
                                value={header.machineInstrumentUsedFor}
                                onChange={handleHeaderChange}
                            />
                            <Field
                                type="select"
                                label="PM Check List No."
                                name="pmCheckListNo"
                                value={header.pmCheckListNo}
                                onChange={handleHeaderChange}
                                options={pmCheckListOptions}
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
                                options={uomOptions}
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
                                    options: spareOptions,
                                },
                                { key: "spareDesc", label: "Spare Desc." },
                                {
                                    key: "unit",
                                    label: "Unit",
                                    type: "select",
                                    options: uomOptions,
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
                            ]}
                            rows={spareRows}
                            onCellChange={handleSpareCellChange}
                            onRemoveRow={handleRemoveSpareRow}
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
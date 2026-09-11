import {
    ArrowLeft,
    Save,
    X,
    Plus,
    Trash2,
    FileUp,
    FileText,
    Eye,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import dayjs from "dayjs";
import goodsReceivedNoteAPI from "../../../api/Inventory/goodsReceivedNoteAPI";
import { useToast } from "../../Toast/ToastContext";
import branchAPI from "../../../api/branchAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import countryAPI from "../../../api/countryAPI";
import currencyAPI from "../../../api/currencyAPI";
import unitMasterAPI from "../../../api/unitAPI";
import transportAPI from "../../../api/transportAPI";

/* ---------------------------------------------------------------------------- */
/* Shared design tokens */

const controlClasses =
    "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
    "bg-white dark:bg-gray-900 " +
    "border-gray-300 dark:border-gray-600 " +
    "text-gray-900 dark:text-gray-100 " +
    "placeholder-gray-400 dark:placeholder-gray-500 " +
    "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
    "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
    "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

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
    "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-2 items-start";

/* ---------------------------------------------------------------------------- */
/* Module-level helpers */

const todayISO = () => new Date().toISOString().slice(0, 10);
let attachmentRowIdCounter = 1;

/* Normalise ids coming back from API into strings so they match <select> values */
const toStr = (v) =>
    v === undefined || v === null || v === "" ? "" : String(v);

/* ---------------------------------------------------------------------------- */
/* Shared building blocks */

const Field = ({
    label,
    name,
    value,
    onChange,
    error,
    required,
    type = "text",
    options,
    disabled,
    readOnly,
    className = "",
    placeholder = "",
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
                    className={controlClasses}
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

    if (type === "textarea") {
        return (
            <div className={`w-full ${className}`}>
                <label className={labelClasses}>
                    {label}
                    {required && <span className="text-red-500"> *</span>}
                </label>

                <textarea
                    name={name}
                    value={value}
                    onChange={onChange}
                    rows={3}
                    className={
                        "w-full px-2 py-1.5 rounded border text-xs leading-snug transition-colors resize-none " +
                        "bg-white dark:bg-gray-900 " +
                        "border-gray-300 dark:border-gray-600 " +
                        "text-gray-900 dark:text-gray-100 " +
                        "placeholder-gray-400 dark:placeholder-gray-500 " +
                        "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
                        "dark:focus:ring-blue-400 dark:focus:border-blue-400"
                    }
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
                readOnly={readOnly}
                placeholder={placeholder}
                className={`${controlClasses} ${readOnly ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : ""}`}
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
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
            <X className="h-3 w-3" />
            Cancel
        </button>

        <button
            type="button"
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
/* Table helpers */

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
                    className={`p-2 whitespace-nowrap ${i === 0
                        ? "w-10 text-center"
                        : "text-left min-w-[120px]"
                        } dark:text-white`}
                >
                    {h}
                </th>
            ))}
        </tr>
    </thead>
);

const TableRow = ({ children, index, onRemove, disabled, showDelete = true }) => (
    <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
        <td className="p-2 text-center font-medium dark:text-white">{index + 1}</td>
        {children}
        {showDelete && (
            <td className="p-2 text-center">
                <button
                    type="button"
                    onClick={onRemove}
                    disabled={disabled}
                    className={`h-6 w-6 rounded text-white flex items-center justify-center ${disabled
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                        }`}
                >
                    <Trash2 size={12} />
                </button>
            </td>
        )}
    </tr>
);

const SelectCell = ({ value, onChange, options, disabled = false }) => (
    <td className="p-2 align-top">
        <select
            value={value || ""}
            onChange={onChange}
            className={cellInputClasses}
            disabled={disabled}
        >
            <option value="">-- Select --</option>
            {(options || []).map((opt) => (
                <option key={opt.value ?? opt} value={opt.value ?? opt}>
                    {opt.label ?? opt}
                </option>
            ))}
        </select>
    </td>
);

const InputCell = ({ value, onChange, type = "text", disabled }) => (
    <td className="p-2 align-top">
        <input
            type={type}
            value={value || ""}
            onChange={onChange}
            disabled={disabled}
            className={`${cellInputClasses} ${disabled ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : ""
                }`}
        />
    </td>
);

const DynamicTable = ({ columns, rows, onCellChange, onRemoveRow, showDeleteLast = true }) => (
    <TableWrapper>
        <TableHead headers={["#", ...columns.map((c) => c.label), ...(showDeleteLast ? ["Action"] : [])]} />
        <tbody>
            {rows.map((row, idx) => {
                const isSystemRow = row.isSystemRow === true;
                return (
                    <TableRow
                        key={idx}
                        index={idx}
                        onRemove={() => onRemoveRow(idx)}
                        disabled={isSystemRow || rows.length <= 1}
                        showDelete={showDeleteLast}
                    >
                        {columns.map((col) => {
                            if (col.type === "select") {
                                return (
                                    <SelectCell
                                        key={col.key}
                                        value={row[col.key]}
                                        onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                                        options={col.options}
                                        disabled={col.disabled || isSystemRow}
                                    />
                                );
                            }
                            return (
                                <InputCell
                                    key={col.key}
                                    value={row[col.key]}
                                    type={col.type === "number" ? "number" : col.type === "date" ? "date" : "text"}
                                    disabled={col.disabled || col.readOnly || isSystemRow}
                                    onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                                />
                            );
                        })}
                    </TableRow>
                );
            })}
        </tbody>
    </TableWrapper>
);

/* ---------------------------------------------------------------------------- */
/* Attachment tab - drag/drop upload zone */

const AttachmentDropCell = ({ rowId, file, existing, onFileChange }) => (
    <td className="p-2 align-top">
        <label
            htmlFor={`invoice-file-${rowId}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
                e.preventDefault();
                const dropped = e.dataTransfer.files?.[0];
                if (dropped) onFileChange(dropped);
            }}
            className="flex flex-col items-center justify-center gap-1 h-24 w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors text-center px-2"
        >
            {file ? (
                <>
                    <FileText className="h-5 w-5 text-blue-500" />
                    <span className="text-[11px] text-gray-700 dark:text-gray-200 truncate max-w-[220px]">
                        {file.name}
                    </span>
                </>
            ) : existing ? (
                <>
                    <FileText className="h-5 w-5 text-green-600" />
                    <span className="text-[11px] text-gray-700 dark:text-gray-200 truncate max-w-[220px]">
                        {existing.name || existing.fileName}
                    </span>
                    <span className="text-[10px] text-gray-400">
                        (saved — drop a new file to replace)
                    </span>
                </>
            ) : (
                <>
                    <FileUp className="h-5 w-5 text-gray-400" />
                    <span className="text-[11px] text-gray-400">
                        Drop files here or click to upload
                    </span>
                </>
            )}
        </label>
        <input
            id={`invoice-file-${rowId}`}
            type="file"
            accept="application/pdf,image/*"
            className="hidden"
            onChange={(e) => {
                const selected = e.target.files?.[0];
                if (selected) onFileChange(selected);
                e.target.value = "";
            }}
        />
    </td>
);

const AttachmentTable = ({ rows, onFileChange, onRemoveRow }) => (
    <TableWrapper>
        <TableHead headers={["S.No", "Invoice Copy", "Action"]} />
        <tbody>
            {rows.map((row, idx) => (
                <tr
                    key={row.rowId}
                    className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                    <td className="p-2 text-center font-medium dark:text-white align-top pt-3">
                        {idx + 1}
                    </td>
                    <AttachmentDropCell
                        rowId={row.rowId}
                        file={row.file}
                        existing={row.existing}
                        onFileChange={(file) => onFileChange(idx, file)}
                    />
                    <td className="p-2 text-center align-top pt-3">
                        <div className="flex items-center justify-center gap-1">
                            {/* Preview saved file */}
                            {!row.file && row.existing?.filePath && (
                                <button
                                    type="button"
                                    title="Preview"
                                    onClick={() =>
                                        window.open(
                                            row.existing.filePath,
                                            "_blank",
                                            "noopener,noreferrer"
                                        )
                                    }
                                    className="h-6 w-6 rounded text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
                                >
                                    <Eye size={12} />
                                </button>
                            )}

                            {/* Preview newly-picked file via blob URL */}
                            {row.file && (
                                <button
                                    type="button"
                                    title="Preview"
                                    onClick={() => {
                                        const url = URL.createObjectURL(row.file);
                                        window.open(url, "_blank", "noopener,noreferrer");
                                        setTimeout(
                                            () => URL.revokeObjectURL(url),
                                            60_000
                                        );
                                    }}
                                    className="h-6 w-6 rounded text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
                                >
                                    <Eye size={12} />
                                </button>
                            )}

                            <button
                                type="button"
                                title="Remove"
                                onClick={() => onRemoveRow(idx)}
                                disabled={rows.length <= 1}
                                className={`h-6 w-6 rounded text-white flex items-center justify-center ${rows.length <= 1
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-red-600 hover:bg-red-700"
                                    }`}
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    </td>
                </tr>
            ))}
        </tbody>
    </TableWrapper>
);

/* ---------------------------------------------------------------------------- */
/* Options */

const YES_NO = ["YES", "NO"];

const GRN_TYPE_OPTIONS = [
    { value: "Local", label: "Local" },
    { value: "Import", label: "Import" },
];

/* ---------------------------------------------------------------------------- */

const emptyCommonHeader = () => ({
    plantId: "",
    docNo: "",
    belongsTo: "",
    docDate: todayISO(),
    location: "",
    supplierId: "",
    supplierCode: "",
    supplierName: "",
    supplierAddress: "",
    supplierGstNo: "",
    supplierState: "",
    supplierCountry: "",
    supplierPinCode: "",
    supplierIsRegistered: "",
    gstState: "",
    isIgstAppl: "",
    gstnNo: "",
    gatePassNo: "",
    poNo: "",
    invoiceNo: "",
    invoiceDate: "",
    currency: "",
    currencyName: "",
    exchangeRate: "",
    remarks: "",
});

const emptyLocalHeader = () => ({
    dealerType: "",
    scheduleNo: "",
    country: "",
    isReverseChrg: "",
    scheduleDate: "",
    schStartDate: "",
    schEndDate: "",
    grnClearTime: "",
    grossAmt: "",
    modvatCopyReceived: "",
    totalQtyInKg: "",
    partyDcNoInvNo: "",
    discountPct: "",
    supplierDcDate: "",
    taxCode: "",
    eSugamNo: "",
    eSugamNoYesNo: "",
    attachmentCheck: false,
    noChallanCheck: false,
});

const emptyImportHeader = () => ({
    shipmentNo: "",
    shipmentDate: "",
    blNo: "",
    blDate: "",
    transporter: "",
    forwarderName: "",
    poDate: "",
    vehicleNo: "",
    totalPackages: "",
    totalGrossWeight: "",
    grnTime: dayjs().format("HH:mm"),
    poCurrency: "",
    lrNo: "",
    poExchangeRate: "",
});

const emptySummary = () => ({
    netAmount: "",
    totAmtTax: "",
    basicAmount: "",
    invoiceSentOn: "",
});

const emptyImportSummary = () => ({
    totalFobValue: "",
    totalCustomsDuty: "",
    totalFreight: "",
    totalLandingValue: "",
    totalInventoryCost: "",
    receivedBy: "",
    qualityCheckBy: "",
});

const emptyLocalItemRow = () => ({
    itemCode: "",
    itemDescription: "",
    hsnSacCode: "",
    taxType: "",
    taxPct: "",
    primaryUnit: "",
    stock: "",
    purchaseTolerance: "",
    inspectionable: "",
    manufacturedDate: "",
    poRate: "",
    poQty: "",
    poUnit: "",
    challanQty: "",
    storeStock: "",
    pendingQty: "",
    receivedQty: "",
    receivedUnit: "",
    conversionFactor: "",
    recQtyInPrimaryUnit: "",
    acceptQty: "",
    accQtyInPrimaryUnit: "",
    accUnit: "",
    rejectQty: "",
    rejQtyInPrimaryUnit: "",
    excessQty: "",
    itemMaxQty: "",
    amount: "",
    sgstRate: "",
    sgstAmount: "",
    cgstRate: "",
    cgstAmount: "",
    igstRate: "",
    igstAmount: "",
    apportionedCost: "",
    insurance: "",
    handlingCharges: "",
    landingCost: "",
    landedCostRate: "",
    landedValue: "",
});

const emptyImportItemRow = () => ({
    itemId: "",
    itemCode: "",
    description: "",
    hsnSacCode: "",
    unitId: "",
    unitmasterId: "",
    stock: "",
    inspection: "",
    inspectionDescription: "",
    isInspectionable: "",
    poUnit: "",
    poQty: "",
    balPoQty: "",
    balanceQty: "",

    chanllanQty: "",
    receivedQty: "",
    shortQty: "",
    acceptQty: "",
    rejectQty: "",

    fobRate: "",
    fobValue: "",
    fobValueInr: "",
    freight: "",
    freightInr: "",
    bcdValueInr: "",
    cess10Inr: "",
    exciseCvdIgst: "",
    adduty: "",
    clearingChrg: "",
    bankChrg: "",
    packingChrg: "",
    surcharge: "",
    specialCost: "",
    handlingChrg: "",

    totalValueFc: "",
    totalValueInr: "",
    landingValue: "",
    landingCostInr: "",
});

const emptyTaxDetailRow = () => ({
    particulars: "",
    taxPct: "",
    sgstRate: "",
    cgstRate: "",
    igstRate: "",
    taxableValue: "",
    taxAmount: "",
    isSystemRow: false,
});

const emptyAttachmentRow = () => ({
    rowId: `att-${attachmentRowIdCounter++}`,
    file: null,
    existing: null,
});

/* ---------------------------------------------------------------------------- */
/* Child tabs configuration */

const LOCAL_TABS = [
    { key: "purchaseDetail", label: "Purchase Detail", type: "table" },
    { key: "taxDetails", label: "Tax Details", type: "table" },
    { key: "summary", label: "Summary", type: "fields" },
    { key: "attachments", label: "Attached Invoice Copy", type: "attachment" },
];

const IMPORT_TABS = [
    { key: "items", label: "Item Particulars", type: "table" },
    { key: "summary", label: "GRN Summary", type: "fields" },
    { key: "attachments", label: "Attached Invoice Copy", type: "attachment" },
];

/* ---------------------------------------------------------------------------- */

const GoodsReceivedNoteForm = ({ onBack, onSave, editData }) => {
    const ORG_ID = parseInt(localStorage.getItem("orgId"));
    const finYear = parseInt(localStorage.getItem("finYear"));
    const BRANCH_ID = parseInt(localStorage.getItem("branchId"));
    const { addToast } = useToast();

    const initialType = editData?.grnType || "Local";

    const [grnType, setGrnType] = useState(initialType);
    const [activeChildTab, setActiveChildTab] = useState(
        initialType === "Local" ? "purchaseDetail" : "items"
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [initialising, setInitialising] = useState(false);

    // API data states
    const [plantOptions, setPlantOptions] = useState([]);
    const [belongsToOptions, setBelongsToOptions] = useState([]);
    const [locationOptions, setLocationOptions] = useState([]);
    const [supplierOptions, setSupplierOptions] = useState([]);
    const [supplierMap, setSupplierMap] = useState({});
    const [gatePassOptions, setGatePassOptions] = useState([]);
    const [gatePassMap, setGatePassMap] = useState({});
    const [poOptions, setPoOptions] = useState([]);
    const [countryOptions, setCountryOptions] = useState([]);
    const [currencyOptions, setCurrencyOptions] = useState([]);
    const [currencyMap, setCurrencyMap] = useState({});
    const [itemOptions, setItemOptions] = useState([]);
    const [itemMap, setItemMap] = useState({});
    const [unitOptions, setUnitOptions] = useState([]);
    const [particularsOptions, setParticularsOptions] = useState([]);
    const [transportOptions, setTransportOptions] = useState([]);
    const [scheduleOptions, setScheduleOptions] = useState([]);
    const [scheduleMap, setScheduleMap] = useState({});

    // Import-specific
    const [importPoOptions, setImportPoOptions] = useState([]);
    const [importPoMap, setImportPoMap] = useState({});
    const [importItemOptions, setImportItemOptions] = useState([]);
    const [importItemMap, setImportItemMap] = useState({});

    const isSubmittingRef = useRef(false);

    // Common header fields
    const [commonHeader, setCommonHeader] = useState({
        ...emptyCommonHeader(),
        ...editData?.commonHeader,
    });

    const [localHeader, setLocalHeader] = useState({
        ...emptyLocalHeader(),
        ...editData?.localHeader,
    });

    const [importHeader, setImportHeader] = useState({
        ...emptyImportHeader(),
        ...editData?.importHeader,
    });

    const [summary, setSummary] = useState({
        ...emptySummary(),
        ...editData?.summary,
    });

    const [importSummary, setImportSummary] = useState({
        ...emptyImportSummary(),
        ...editData?.importSummary,
    });

    const [localItemRows, setLocalItemRows] = useState(
        editData?.purchaseDetails?.length
            ? editData.purchaseDetails
            : [emptyLocalItemRow()]
    );

    const [importItemRows, setImportItemRows] = useState(
        editData?.grnItems?.length
            ? editData.grnItems
            : [emptyImportItemRow()]
    );

    const [taxDetailRows, setTaxDetailRows] = useState(
        editData?.taxDetails?.length ? editData.taxDetails : [emptyTaxDetailRow()]
    );

    const [attachmentRows, setAttachmentRows] = useState(
        editData?.invoiceCopies?.length
            ? editData.invoiceCopies.map((a) => ({
                rowId: `att-${attachmentRowIdCounter++}`,
                file: a.file || null,
                existing: a.existing || null,
            }))
            : [emptyAttachmentRow()]
    );

    /* ---------------- API Loading ---------------- */

    const loadBranches = useCallback(async () => {
        try {
            const res = await branchAPI.getBranchByOrgId(ORG_ID);
            const options = (res || []).map((branch) => ({
                value: branch.id,
                label: branch.branchName || branch.branchCode || branch.id,
            }));
            setPlantOptions(options);
        } catch (error) {
            console.error("Failed to load branches:", error);
            setPlantOptions([]);
        }
    }, [ORG_ID]);

    const loadBelongsTo = useCallback(async () => {
        try {
            const res = await listOfValuesAPI.getListValuesGroup("SDS BELONGS TO", ORG_ID);
            const options = (res || []).map((item) => ({
                value: item.valuesDescription || item.valueDescription || item.id,
                label: item.valuesDescription || item.valueDescription || item.id,
            }));
            setBelongsToOptions(options);
        } catch (error) {
            console.error("Failed to load Belongs To options:", error);
            setBelongsToOptions([
                { value: "APPLIANCES", label: "APPLIANCES" },
                { value: "BOSCH", label: "BOSCH" },
                { value: "AUTOMOTIVE", label: "AUTOMOTIVE" },
            ]);
        }
    }, [ORG_ID]);

    const loadParticulars = useCallback(async () => {
        try {
            const res = await listOfValuesAPI.getListValuesGroup("Particulars", ORG_ID);

            let items = [];
            if (res?.paramObjectsMap?.listValues) items = res.paramObjectsMap.listValues;
            else if (res?.data?.paramObjectsMap?.listValues) items = res.data.paramObjectsMap.listValues;
            else if (Array.isArray(res)) items = res;
            else if (res?.listValues) items = res.listValues;

            const options = items.map((item) => ({
                value: item.id || item.value,
                label: item.valuesDescription || item.label || item.name,
            }));
            setParticularsOptions(options);
        } catch (error) {
            console.error("Failed to load particulars:", error);
            setParticularsOptions([]);
        }
    }, [ORG_ID]);

    const loadUnits = useCallback(async () => {
        try {
            const res = await unitMasterAPI.getUnits(ORG_ID);
            let units = [];
            if (res?.paramObjectsMap?.unitVO) units = res.paramObjectsMap.unitVO;
            else if (Array.isArray(res)) units = res;
            else if (res?.data?.paramObjectsMap?.unitVO) units = res.data.paramObjectsMap.unitVO;

            const options = units.map((unit) => ({
                value: unit.id,
                label: unit.unitId || unit.unitName || unit.unitCode || unit.id,
            }));
            setUnitOptions(options);
        } catch (error) {
            console.error("Failed to load units:", error);
            setUnitOptions([]);
        }
    }, [ORG_ID]);

    const loadLocations = useCallback(async () => {
        try {
            const res = await locationMasterAPI.getLocationMasterByOrgId(ORG_ID, BRANCH_ID);
            const options = (res || []).map((location) => ({
                value: location.id,
                label: location.locationName || location.locationId || location.id,
            }));
            setLocationOptions(options);
        } catch (error) {
            console.error("Failed to load locations:", error);
            setLocationOptions([]);
        }
    }, [ORG_ID, BRANCH_ID]);

    const loadSuppliers = useCallback(async () => {
        try {
            const response = await goodsReceivedNoteAPI.getSupplierDetailsForGrn(BRANCH_ID, ORG_ID);
            const suppliers = response?.paramObjectsMap?.mapp || [];
            const map = {};
            const options = suppliers.map((supplier) => {
                map[supplier.supplierId] = {
                    supplierId: supplier.supplierId,
                    supplierCode: supplier.supplierCode || "",
                    supplierName: supplier.supplierName || "",
                    address: supplier.address || "",
                    stateName: supplier.stateName || "",
                    country: supplier.country || "",
                    gstNo: supplier.gstNo || "",
                    pinCode: supplier.pinCode || "",
                    isRegistered: supplier.isRegistered || "",
                };
                return {
                    value: supplier.supplierId,
                    label: `${supplier.supplierCode} - ${supplier.supplierName}`,
                };
            });
            setSupplierOptions(options);
            setSupplierMap(map);
        } catch (error) {
            console.error("Failed to load suppliers:", error);
            setSupplierOptions([]);
            setSupplierMap({});
        }
    }, [ORG_ID, BRANCH_ID]);

    const loadTransports = useCallback(async () => {
        try {
            const list = await transportAPI.getTransportByOrgId(BRANCH_ID, ORG_ID);
            const options = (list || []).map((t) => ({
                value: t.id,
                label: t.transportName || t.transportCode || t.id,
            }));
            setTransportOptions(options);
        } catch (error) {
            console.error("Failed to load transports:", error);
            setTransportOptions([]);
        }
    }, [ORG_ID, BRANCH_ID]);

    const loadSchedules = useCallback(async (supplierId) => {
        if (!supplierId) {
            setScheduleOptions([]);
            setScheduleMap({});
            return;
        }
        try {
            const response = await goodsReceivedNoteAPI.getScheduleDocIdDetails(
                BRANCH_ID,
                ORG_ID,
                supplierId
            );
            const list = response?.paramObjectsMap?.mapp || [];
            const map = {};
            const options = list.map((s) => {
                map[s.docId] = {
                    docId: s.docId,
                    docDate: s.docDate || "",
                    startDate: s.startDate || "",
                    endDate: s.endDate || "",
                    scheduleId: s.scheduleId ?? "",
                };
                return { value: s.docId, label: s.docId };
            });
            setScheduleOptions(options);
            setScheduleMap(map);
        } catch (error) {
            console.error("Failed to load schedules:", error);
            setScheduleOptions([]);
            setScheduleMap({});
        }
    }, [ORG_ID, BRANCH_ID]);

    useEffect(() => {
        if (initialising) return;
        if (grnType === "Local" && commonHeader.supplierId) {
            loadSchedules(commonHeader.supplierId);
        } else {
            setScheduleOptions([]);
            setScheduleMap({});
        }
    }, [grnType, commonHeader.supplierId, loadSchedules, initialising]);

    const loadGatePass = useCallback(async (supplierCode) => {
        if (!supplierCode) {
            setGatePassOptions([]);
            setGatePassMap({});
            return;
        }
        try {
            const response = await goodsReceivedNoteAPI.getGatePassDocIdDetails(
                BRANCH_ID, ORG_ID, supplierCode
            );
            const gatePasses = response?.paramObjectsMap?.mapp || [];
            const map = {};
            const options = gatePasses.map((gp) => {
                map[gp.docId] = {
                    docId: gp.docId,
                    docDate: gp.docDate || "",
                    gatePassId: gp.gatePassId || "",
                };
                return { value: gp.docId, label: gp.docId };
            });
            setGatePassOptions(options);
            setGatePassMap(map);
        } catch (error) {
            console.error("Failed to load gate passes:", error);
            setGatePassOptions([]);
            setGatePassMap({});
        }
    }, [ORG_ID, BRANCH_ID]);

    const loadPOs = useCallback(async (gatePassNo) => {
        if (!gatePassNo || !commonHeader.supplierCode) {
            setPoOptions([]);
            return;
        }
        try {
            const response = await goodsReceivedNoteAPI.getPurchaseOrderNoBasedDocId(
                BRANCH_ID, gatePassNo, ORG_ID, commonHeader.supplierCode
            );
            const pos = response?.paramObjectsMap?.mapp || [];
            setPoOptions(
                pos.map((po) => ({
                    value: po.docId,
                    label: po.docId,
                    docDate: po.docDate || "",
                    Id: po.Id || "",
                    gatePassId: po.gatePassId || "",
                }))
            );
        } catch (error) {
            console.error("Failed to load POs:", error);
            setPoOptions([]);
        }
    }, [ORG_ID, BRANCH_ID, commonHeader.supplierCode]);

    const loadItemDetails = useCallback(async (purchaseOrderNo) => {
        if (!purchaseOrderNo) {
            setItemOptions([]);
            setItemMap({});
            return;
        }
        try {
            const response = await goodsReceivedNoteAPI.getPoNumberBasedItemDetails(
                BRANCH_ID, ORG_ID, purchaseOrderNo
            );
            const items = response?.paramObjectsMap?.mapp || [];
            const map = {};
            const options = items.map((item) => {
                map[item.itemId] = {
                    itemId: item.itemId,
                    itemCode: item.itemCode || "",
                    itemDesc: item.itemDesc || "",
                    hsn: item.hsn || "",
                    rate: item.rate || "",
                    qty: item.qty || "",
                    primaryDescription: item.primaryDescription || "",
                    primaryUnit: item.primaryUnit || "",
                };
                return {
                    value: item.itemId,
                    label: `${item.itemCode} - ${item.itemDesc}`,
                };
            });
            setItemOptions(options);
            setItemMap(map);
        } catch (error) {
            console.error("Failed to load item details:", error);
            setItemOptions([]);
            setItemMap({});
        }
    }, [ORG_ID, BRANCH_ID]);

    const loadImportPOs = useCallback(async (supplierCode) => {
        if (!supplierCode) {
            setImportPoOptions([]);
            setImportPoMap({});
            return;
        }
        try {
            const response = await goodsReceivedNoteAPI.getPurchaseOrderNumberImportGrn(
                BRANCH_ID, ORG_ID, supplierCode
            );
            const pos = response?.paramObjectsMap?.mapp || [];
            const map = {};
            const options = pos.map((po) => {
                map[po.docId] = {
                    docId: po.docId,
                    docDate: po.docDate || "",
                    currency: po.currency || "",
                    exChangeRate: po.exChangeRate ?? "",
                };
                return {
                    value: po.docId,
                    label: po.docId,
                    docDate: po.docDate || "",
                    currency: po.currency || "",
                    exChangeRate: po.exChangeRate ?? "",
                };
            });
            setImportPoOptions(options);
            setImportPoMap(map);
        } catch (error) {
            console.error("Failed to load import POs:", error);
            setImportPoOptions([]);
            setImportPoMap({});
        }
    }, [ORG_ID, BRANCH_ID]);

    const loadImportItemDetails = useCallback(async (purchaseOrderNo) => {
        if (!purchaseOrderNo || !commonHeader.supplierCode) {
            setImportItemOptions([]);
            setImportItemMap({});
            return;
        }
        try {
            const response = await goodsReceivedNoteAPI.getItemDetailsForImportGrn(
                BRANCH_ID, ORG_ID, purchaseOrderNo, commonHeader.supplierCode
            );
            const items = response?.paramObjectsMap?.mapp || [];

            const map = {};
            const options = items.map((item) => {
                map[item.itemId] = {
                    itemId: item.itemId,
                    itemCode: item.itemCode || "",
                    itemDescription: item.itemDescription || "",
                    hsnCode: item.hsnCode || "",
                    unitId: item.unitId || "",
                    unitmasterId: item.unitmasterId || "",
                    poQty: item.poQty ?? "",
                    balanceQty: item.balanceQty ?? "",
                    stock: item.stock || "",
                    inspection: item.inspection ?? "",
                    inspectionDescription: item.inspectionDescription || "",
                };
                return {
                    value: item.itemId,
                    label: `${item.itemCode} - ${item.itemDescription}`,
                };
            });
            setImportItemOptions(options);
            setImportItemMap(map);
        } catch (error) {
            console.error("Failed to load import item details:", error);
            setImportItemOptions([]);
            setImportItemMap({});
        }
    }, [ORG_ID, BRANCH_ID, commonHeader.supplierCode]);

    const loadTaxDetails = useCallback(async (hsn) => {
        if (!hsn) return null;
        try {
            const response = await goodsReceivedNoteAPI.getTaxValue(hsn, ORG_ID);
            const taxData = response?.paramObjectsMap?.mapp || [];
            return taxData.length > 0 ? taxData[0] : null;
        } catch (error) {
            console.error("Failed to load tax details:", error);
            return null;
        }
    }, [ORG_ID]);

    const loadCountries = useCallback(async () => {
        try {
            const res = await countryAPI.getCountries(ORG_ID);
            const options = (res || []).map((country) => ({
                value: country.id || country.countryCode,
                label: country.countryName || country.countryCode || country.id,
            }));
            setCountryOptions(options);
        } catch (error) {
            console.error("Failed to load countries:", error);
            setCountryOptions([]);
        }
    }, [ORG_ID]);

    const loadCurrencies = useCallback(async () => {
        try {
            const res = await currencyAPI.getCurrencies(ORG_ID);
            const map = {};
            const options = (res || []).map((currency) => {
                map[currency.id] = {
                    id: currency.id,
                    currency: currency.currency || "",
                    mainCurrency: currency.mainCurrency || "",
                    currencySymbol: currency.mainCurrencySymbol || "",
                };
                return {
                    value: currency.id,
                    label: `${currency.currency} - ${currency.mainCurrency}`,
                };
            });
            setCurrencyOptions(options);
            setCurrencyMap(map);
        } catch (error) {
            console.error("Failed to load currencies:", error);
            setCurrencyOptions([]);
            setCurrencyMap({});
        }
    }, [ORG_ID]);

    const loadExchangeRate = useCallback(async (currencyId) => {
        if (!currencyId) {
            setCommonHeader((prev) => ({ ...prev, exchangeRate: "" }));
            return;
        }
        try {
            const response = await goodsReceivedNoteAPI.getExchangeRateDetails(
                BRANCH_ID, currencyId, ORG_ID
            );
            const exchangeRates = response?.paramObjectsMap?.mapp || [];
            const rate = exchangeRates.length > 0 ? (exchangeRates[0].exchangeRate || "") : "";
            setCommonHeader((prev) => ({ ...prev, exchangeRate: rate }));
        } catch (error) {
            console.error("Failed to load exchange rate:", error);
            setCommonHeader((prev) => ({ ...prev, exchangeRate: "" }));
        }
    }, [ORG_ID, BRANCH_ID]);

    /* ---------------- GRN Doc Id ---------------- */

    const loadGrnDocId = useCallback(async (type) => {
        try {
            const response = await goodsReceivedNoteAPI.getGrnDocId(finYear, ORG_ID, type);
            const docId = response?.paramObjectsMap?.grnDocId || "";
            setCommonHeader((prev) => ({ ...prev, docNo: docId }));
        } catch (error) {
            console.error("Failed to load GRN docId:", error);
            setCommonHeader((prev) => ({ ...prev, docNo: "" }));
        }
    }, [ORG_ID, finYear]);

    // Only auto-fetch doc id on new GRN, not while editing
    useEffect(() => {
        if (ORG_ID && !editData?.id) {
            loadGrnDocId(grnType);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [grnType, ORG_ID, editData?.id]);

    /* ---------------- Hydrate from getGrnById ---------------- */

    const hydrateFromGrn = useCallback((grn) => {
        if (!grn) return;

        const isImport =
            grn.grnType === "Import" ||
            (grn.importGrnDetailsResponseDTO?.length > 0);

        setGrnType(isImport ? "Import" : "Local");
        setActiveChildTab(isImport ? "items" : "purchaseDetail");

        setCommonHeader((prev) => ({
            ...prev,
            docNo: grn.docId || "",
            docDate: grn.docDate || "",
            belongsTo: grn.belongsTo || "",

            plantId: toStr(grn.branch?.id),
            location: toStr(grn.location?.id),

            supplierCode: toStr(grn.supplierCode?.id),
            supplierId: toStr(grn.supplierCode?.id),
            supplierName: grn.supplierCode?.supplierName || "",
            supplierAddress: grn.supplierCode?.address || "",
            supplierGstNo: grn.supplierCode?.gstNo || "",
            supplierState: grn.supplierCode?.gstSate || "",
            gstState: grn.supplierCode?.gstSate || "",
            gstnNo: grn.supplierCode?.gstNo || "",
            isIgstAppl: grn.isIgstApplicable || "",

            gatePassNo: grn.gatePassNo || "",
            poNo: grn.poNo || "",
            invoiceNo: grn.invoiceNo || "",
            invoiceDate: grn.invoiceDate || "",
            currency: toStr(grn.currency?.id),
            currencyName: grn.currency?.currencyName || "",
            exchangeRate: grn.exchangeRate ?? "",
            remarks: grn.remarks || "",
        }));

        if (!isImport) {
            setLocalHeader((prev) => ({
                ...prev,
                dealerType: grn.dealerType || "",
                isReverseChrg: grn.isReverseCharge || "",
                scheduleNo: grn.scheduleNo || "",
                scheduleDate: grn.scheduleDate || "",
                schStartDate: grn.scheduleStartDate || "",
                schEndDate: grn.scheduleEndDate || "",
                grnClearTime: grn.grnClearTime || "",
                grossAmt: grn.grossAmount ?? "",
                modvatCopyReceived: grn.modvatCopyReceived || "",
                totalQtyInKg: grn.totalQtyInKg ?? "",
                partyDcNoInvNo: grn.partyDcNo || "",
                discountPct: grn.discount ?? "",
                supplierDcDate: grn.supplierDcDate || "",
            }));

            const items = (grn.grnDetailsResponseDTO || []).map((r) => ({
                id: r.id,
                itemCode: toStr(r.item?.id),
                itemDescription: r.item?.itemDescription || "",
                hsnSacCode: r.hsnCode || r.item?.hsnCode || "",
                taxType: r.taxType || "",
                taxPct: r.taxPercentage ?? "",
                primaryUnit: toStr(r.item?.primaryUnit?.id),
                stock: r.stock ?? "",
                purchaseTolerance: r.purchaseTolerance ?? "",
                inspectionable: r.inspectionable || "",
                manufacturedDate: r.manufacturedDate || "",
                poRate: r.poRate ?? "",
                poQty: r.poQty ?? "",
                poUnit: toStr(r.poUnit?.id),
                challanQty: r.challanQty ?? "",
                storeStock: r.storeStock ?? "",
                pendingQty: r.pendingQty ?? "",
                receivedQty: r.receivedQty ?? "",
                receivedUnit: toStr(r.receivedUnit?.id),
                conversionFactor: r.conversionFactor ?? "",
                recQtyInPrimaryUnit: r.recQtyInPrimaryUnit ?? "",
                acceptQty: r.acceptQty ?? "",
                accQtyInPrimaryUnit: r.accQtyInPrimaryUnit ?? "",
                accUnit: toStr(r.accUnit?.id),
                rejectQty: r.rejectQty ?? "",
                rejQtyInPrimaryUnit: r.rejQtyInPrimaryUnit ?? "",
                excessQty: r.excessQty ?? "",
                itemMaxQty: r.itemMaxQty ?? "",
                amount: r.amount ?? "",
                sgstRate: r.sgstRate ?? "",
                sgstAmount: r.sgstAmount ?? "",
                cgstRate: r.cgstRate ?? "",
                cgstAmount: r.cgstAmount ?? "",
                igstRate: r.igstRate ?? "",
                igstAmount: r.igstAmount ?? "",
                apportionedCost: r.apportionedCost ?? "",
                insurance: r.insurance ?? "",
                handlingCharges: r.handCharge ?? r.handlingCharges ?? "",
                landingCost: r.lcost ?? r.landingCost ?? "",
                landedCostRate: r.landedCostRate ?? "",
                landedValue: r.landedValue ?? "",
            }));
            setLocalItemRows(items.length ? items : [emptyLocalItemRow()]);

            const taxes = (grn.grnTaxDetailsResponseDTO || []).map((t) => ({
                id: t.id,
                particulars: t.particulars || "",
                taxPct: t.tax ?? "",
                sgstRate: t.particulars === "SGST" ? t.tax : "",
                cgstRate: t.particulars === "CGST" ? t.tax : "",
                igstRate: t.particulars === "IGST" ? t.tax : "",
                taxableValue: t.taxVal ?? "",
                taxAmount: t.taxAmount ?? "",
                isSystemRow:
                    t.particulars === "Gross Amount" ||
                    t.particulars === "IGST" ||
                    t.particulars === "SGST" ||
                    t.particulars === "CGST",
            }));
            setTaxDetailRows(taxes.length ? taxes : [emptyTaxDetailRow()]);

            setSummary((prev) => ({
                ...prev,
                netAmount: grn.netAmount ?? "",
                totAmtTax: grn.totalAmountTax ?? "",
                basicAmount: grn.basicAmount ?? "",
                invoiceSentOn: grn.invoiceSentOn || "",
            }));
        } else {
            setImportHeader((prev) => ({
                ...prev,
                shipmentNo: grn.shipmentNo || "",
                shipmentDate: grn.shipmentDate || "",
                blNo: grn.blNo || "",
                blDate: grn.blDate || "",
                transporter: toStr(grn.transporter?.id),
                poDate: grn.poDate || "",
                vehicleNo: grn.vehicleNo || "",
                totalPackages: grn.totalPackages ?? "",
                totalGrossWeight: grn.totalGrossWeight ?? "",
                poCurrency: grn.poCurrency || "",
                lrNo: grn.lrNo || "",
                poExchangeRate: grn.poExchangeRate ?? "",
            }));

            const items = (grn.importGrnDetailsResponseDTO || []).map((r) => ({
                id: r.id,
                itemCode: toStr(r.item?.id),
                itemId: toStr(r.item?.id),
                description: r.item?.itemDescription || "",
                hsnSacCode: r.item?.hsnCode || "",
                unitId: r.uom?.unitId || r.item?.primaryUnit?.unitId || "",
                unitmasterId: toStr(r.uom?.id ?? r.item?.primaryUnit?.id),
                stock: r.stock || "",
                inspection: r.inspectionable || "",
                inspectionDescription: r.inspectionable || "",
                isInspectionable: r.inspectionable || "",
                poUnit: toStr(r.poUnit?.id),
                poQty: r.poQty ?? "",
                balPoQty: r.balancePoQty ?? "",
                balanceQty: r.balancePoQty ?? "",
                chanllanQty: r.challanQty ?? "",
                receivedQty: r.receivedQty ?? "",
                shortQty: r.shortQty ?? "",
                acceptQty: r.acptQty ?? "",
                rejectQty: r.rejQty ?? "",
                fobRate: r.fobRateFC ?? "",
                fobValue: r.fobValueFC ?? "",
                fobValueInr: r.fobValueINR ?? "",
                freight: r.freight ?? "",
                freightInr: r.freightInd ?? "",
                bcdValueInr: r.bcdValueINR ?? "",
                cess10Inr: r.cessAt10 ?? "",
                exciseCvdIgst: r.exciseCvdIgst ?? "",
                adduty: r.addDuty ?? "",
                clearingChrg: r.clearingCharge ?? "",
                bankChrg: r.bankCharge ?? "",
                packingChrg: r.packingCharge ?? "",
                surcharge: r.surcharge ?? "",
                specialCost: r.specialCost ?? "",
                handlingChrg: r.handlingCharge ?? "",
                totalValueFc: r.totalValueFC ?? "",
                totalValueInr: r.totalValueINR ?? "",
                landingValue: r.landingValue ?? "",
                landingCostInr: r.landingCostINR ?? "",
            }));
            setImportItemRows(items.length ? items : [emptyImportItemRow()]);

            setImportSummary((prev) => ({
                ...prev,
                totalFobValue: grn.totalFobValueFC ?? "",
                totalCustomsDuty: grn.totalDutyAmtINR ?? "",
                totalFreight: grn.totalFreightINR ?? "",
                totalLandingValue: grn.totalLandValueINR ?? "",
                totalInventoryCost: grn.totalLandCostINR ?? "",
                receivedBy: grn.receivedBy || "",
                qualityCheckBy: grn.qualityCheckBy || "",
            }));
        }

        const files = grn.grnFileUploadDetailsResponseDTO || [];
        if (files.length) {
            setAttachmentRows(
                files.map((f) => ({
                    rowId: `att-${attachmentRowIdCounter++}`,
                    file: null,
                    existing: {
                        name: f.name || f.fileName || "",
                        fileName: f.fileName || "",
                        filePath: f.filePath || "",
                        fileSize: f.fileSize ?? "",
                        contentType: f.contentType || "",
                    },
                }))
            );
        } else {
            setAttachmentRows([emptyAttachmentRow()]);
        }
    }, []);

    // Fetch GRN by id when editing
    useEffect(() => {
        const loadById = async () => {
            if (!editData?.id) return;
            try {
                setInitialising(true);
                const grn = await goodsReceivedNoteAPI.getGrnById(editData.id);
                if (grn) hydrateFromGrn(grn);
            } catch (error) {
                console.error("Failed to load GRN by id:", error);
                addToast("Failed to load GRN details.", "error");
            } finally {
                setInitialising(false);
            }
        };
        loadById();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editData?.id]);

    /* ---------------- Other effects ---------------- */

    useEffect(() => {
        if (ORG_ID) {
            setLoading(true);
            Promise.all([
                loadBranches(),
                loadBelongsTo(),
                loadLocations(),
                loadSuppliers(),
                loadCountries(),
                loadCurrencies(),
                loadParticulars(),
                loadUnits(),
                loadTransports(),
            ]).finally(() => setLoading(false));
        }
    }, [ORG_ID, loadBranches, loadBelongsTo, loadLocations, loadSuppliers, loadCountries, loadCurrencies, loadParticulars, loadUnits, loadTransports]);

    useEffect(() => {
        if (initialising) return;
        if (commonHeader.supplierCode) {
            loadGatePass(commonHeader.supplierCode);
        } else {
            setGatePassOptions([]);
            setGatePassMap({});
        }
    }, [commonHeader.supplierCode, loadGatePass, grnType, initialising]);

    useEffect(() => {
        if (initialising) return;
        if (grnType === "Local" && commonHeader.gatePassNo) {
            loadPOs(commonHeader.gatePassNo);
        } else {
            setPoOptions([]);
        }
    }, [commonHeader.gatePassNo, loadPOs, grnType, initialising]);

    useEffect(() => {
        if (initialising) return;
        if (commonHeader.poNo && grnType === "Local") {
            loadItemDetails(commonHeader.poNo);
        }
    }, [commonHeader.poNo, loadItemDetails, grnType, initialising]);

    useEffect(() => {
        if (initialising) return;
        if (grnType === "Import" && commonHeader.supplierCode) {
            loadImportPOs(commonHeader.supplierCode);
        }
    }, [grnType, commonHeader.supplierCode, loadImportPOs, initialising]);

    useEffect(() => {
        if (initialising) return;
        if (grnType === "Import" && commonHeader.poNo && commonHeader.supplierCode) {
            loadImportItemDetails(commonHeader.poNo);
        }
    }, [grnType, commonHeader.poNo, commonHeader.supplierCode, loadImportItemDetails, initialising]);

    useEffect(() => {
        if (initialising) return;
        if (commonHeader.currency) {
            loadExchangeRate(commonHeader.currency);
        } else {
            setCommonHeader((prev) => ({ ...prev, exchangeRate: "" }));
        }
    }, [commonHeader.currency, loadExchangeRate, initialising]);

    /* ---------------- Local recalculation ---------------- */

    const recalculateAll = useCallback(() => {
        const isIGST = commonHeader.isIgstAppl === "YES";
        let grossAmount = 0, sgstTotal = 0, cgstTotal = 0, igstTotal = 0;

        localItemRows.forEach((item) => {
            const amount = Number(item.amount) || 0;
            grossAmount += amount;
            sgstTotal += Number(item.sgstAmount) || 0;
            cgstTotal += Number(item.cgstAmount) || 0;
            igstTotal += Number(item.igstAmount) || 0;
        });

        const basicAmount = grossAmount;
        const totAmtTax = isIGST ? igstTotal : (sgstTotal + cgstTotal);
        const netAmount = basicAmount + totAmtTax;

        setSummary((prev) => ({
            ...prev,
            basicAmount: basicAmount.toFixed(2),
            totAmtTax: totAmtTax.toFixed(2),
            netAmount: netAmount.toFixed(2),
        }));

        const userAddedRows = taxDetailRows.filter((item) => !item.isSystemRow);
        const systemRows = [];

        systemRows.push({
            particulars: "Gross Amount",
            taxPct: "",
            sgstRate: 0,
            cgstRate: 0,
            igstRate: 0,
            taxableValue: grossAmount.toFixed(2),
            taxAmount: grossAmount.toFixed(2),
            isSystemRow: true,
        });

        if (isIGST) {
            systemRows.push({
                particulars: "IGST",
                taxPct: "",
                sgstRate: 0,
                cgstRate: 0,
                igstRate: 0,
                taxableValue: "",
                taxAmount: igstTotal.toFixed(2),
                isSystemRow: true,
            });
        } else {
            systemRows.push({
                particulars: "SGST",
                taxPct: "",
                sgstRate: 0,
                cgstRate: 0,
                igstRate: 0,
                taxableValue: "",
                taxAmount: sgstTotal.toFixed(2),
                isSystemRow: true,
            });
            systemRows.push({
                particulars: "CGST",
                taxPct: "",
                sgstRate: 0,
                cgstRate: 0,
                igstRate: 0,
                taxableValue: "",
                taxAmount: cgstTotal.toFixed(2),
                isSystemRow: true,
            });
        }

        const allTaxEntries = [...systemRows, ...userAddedRows];
        if (JSON.stringify(taxDetailRows) !== JSON.stringify(allTaxEntries)) {
            setTaxDetailRows(allTaxEntries);
        }
    }, [commonHeader.isIgstAppl, localItemRows, taxDetailRows]);

    useEffect(() => {
        if (initialising) return;
        if (grnType !== "Local") return;

        const hasItemData = localItemRows.some((row) => row.itemCode);
        if (!hasItemData) return;

        recalculateAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [localItemRows, commonHeader.isIgstAppl, grnType, initialising]);

    /* ---------------- Handlers ---------------- */

    const handleGrnTypeChange = (e) => {
        const type = e.target.value;
        setGrnType(type);
        setActiveChildTab(type === "Local" ? "purchaseDetail" : "items");

        setCommonHeader((prev) => ({ ...prev, poNo: "", gatePassNo: "", docNo: "" }));
        setLocalItemRows([emptyLocalItemRow()]);
        setImportItemRows([emptyImportItemRow()]);
        setImportItemOptions([]);
        setImportItemMap({});
        setPoOptions([]);
        setImportPoOptions([]);
        setImportPoMap({});
        setTaxDetailRows([emptyTaxDetailRow()]);

        if (type === "Import" && commonHeader.supplierCode) {
            loadImportPOs(commonHeader.supplierCode);
        }
    };

    const handleCommonHeaderChange = (e) => {
        const { name, value } = e.target;
        if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));

        if (name === "supplierCode") {
            const supplier = supplierMap[value];
            if (supplier) {
                setCommonHeader((prev) => ({
                    ...prev,
                    supplierCode: value,
                    supplierId: supplier.supplierId || "",
                    supplierName: supplier.supplierName || "",
                    supplierAddress: supplier.address || "",
                    supplierState: supplier.stateName || "",
                    supplierCountry: supplier.country || "",
                    supplierGstNo: supplier.gstNo || "",
                    supplierPinCode: supplier.pinCode || "",
                    supplierIsRegistered: supplier.isRegistered || "",
                    gstState: supplier.stateName || "",
                    gstnNo: supplier.gstNo || "",
                    isIgstAppl: supplier.isRegistered === "true" ? "YES" : "NO",
                    gatePassNo: "",
                    poNo: "",
                }));

                setLocalHeader((prev) => ({
                    ...prev,
                    scheduleNo: "",
                    scheduleDate: "",
                    schStartDate: "",
                    schEndDate: "",
                }));
                setScheduleOptions([]);
                setScheduleMap({});

                if (grnType === "Import") loadImportPOs(value);
                return;
            }
        }

        if (name === "gatePassNo") {
            setCommonHeader((prev) => ({ ...prev, gatePassNo: value, poNo: "" }));
            return;
        }

        if (name === "poNo") {
            setCommonHeader((prev) => ({ ...prev, poNo: value }));

            if (grnType === "Import") {
                const po = importPoMap[value];
                setImportHeader((prev) => ({
                    ...prev,
                    poCurrency: po?.currency || prev.poCurrency || "",
                    poExchangeRate:
                        po?.exChangeRate !== undefined && po?.exChangeRate !== null && po?.exChangeRate !== ""
                            ? String(po.exChangeRate)
                            : prev.poExchangeRate || "",
                    poDate: po?.docDate || prev.poDate || "",
                }));
                if (value) loadImportItemDetails(value);
            } else {
                if (value) loadItemDetails(value);
            }
            return;
        }

        if (name === "currency") {
            setCommonHeader((prev) => ({ ...prev, currency: value, exchangeRate: "" }));
            return;
        }

        setCommonHeader((prev) => ({ ...prev, [name]: value }));
    };

    const handleLocalHeaderChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));

        if (name === "scheduleNo") {
            const sched = scheduleMap[value];
            setLocalHeader((prev) => ({
                ...prev,
                scheduleNo: value,
                scheduleDate: sched?.docDate || "",
                schStartDate: sched?.startDate || "",
                schEndDate: sched?.endDate || "",
            }));
            return;
        }

        setLocalHeader((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleImportHeaderChange = (e) => {
        const { name, value } = e.target;
        if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
        setImportHeader((prev) => ({ ...prev, [name]: value }));
    };

    const handleSummaryChange = (e) => {
        const { name, value } = e.target;
        setSummary((prev) => ({ ...prev, [name]: value }));
    };

    const handleImportSummaryChange = (e) => {
        const { name, value } = e.target;
        setImportSummary((prev) => ({ ...prev, [name]: value }));
    };

    /* ---------------- Local item selection ---------------- */
    const handleItemSelect = async (idx, itemId) => {
        if (!itemId) {
            setLocalItemRows((prev) =>
                prev.map((row, i) => (i === idx ? emptyLocalItemRow() : row))
            );
            return;
        }
        const item = itemMap[itemId];
        if (!item) return;

        const isIGST = commonHeader.isIgstAppl === "YES";
        let taxData = null;
        if (item.hsn) taxData = await loadTaxDetails(item.hsn);

        setLocalItemRows((prev) =>
            prev.map((row, i) => {
                if (i !== idx) return row;
                const updatedRow = {
                    ...row,
                    itemCode: item.itemId || "",
                    itemDescription: item.itemDesc || "",
                    hsnSacCode: item.hsn || "",
                    primaryUnit: item.primaryDescription || "",
                    poRate: item.rate || "",
                    poQty: item.qty || "",
                    poUnit: item.primaryDescription || "",
                    taxType: isIGST ? "IGST" : "SGST",
                    taxPct: taxData?.taxPercentage || "",
                    sgstRate: isIGST ? 0 : (taxData?.sgst || 0),
                    cgstRate: isIGST ? 0 : (taxData?.cgst || 0),
                    igstRate: isIGST ? (taxData?.igst || 0) : 0,
                };

                const poQty = Number(item.qty) || 0;
                const receivedQty = Number(updatedRow.receivedQty) || 0;
                const acceptQty = Number(updatedRow.acceptQty) || 0;
                const apportionedCost = Number(updatedRow.apportionedCost) || 0;
                const insurance = Number(updatedRow.insurance) || 0;
                const handlingCharges = Number(updatedRow.handlingCharges) || 0;
                const landingCost = Number(updatedRow.landingCost) || 0;
                const landedCostRate = Number(updatedRow.landedCostRate) || 0;

                updatedRow.pendingQty = (poQty - receivedQty).toFixed(2);
                updatedRow.rejectQty = (receivedQty - acceptQty).toFixed(2);
                updatedRow.recQtyInPrimaryUnit = receivedQty;
                updatedRow.accQtyInPrimaryUnit = acceptQty;

                const amount = poQty * acceptQty;
                updatedRow.amount = amount.toFixed(2);

                let igstAmount = 0, sgstAmount = 0, cgstAmount = 0;
                if (isIGST) {
                    igstAmount = (amount * (taxData?.igst || 0)) / 100;
                    updatedRow.igstAmount = igstAmount.toFixed(2);
                } else {
                    sgstAmount = (amount * (taxData?.sgst || 0)) / 100;
                    cgstAmount = (amount * (taxData?.cgst || 0)) / 100;
                    updatedRow.sgstAmount = sgstAmount.toFixed(2);
                    updatedRow.cgstAmount = cgstAmount.toFixed(2);
                }

                const landedValue = amount + igstAmount + apportionedCost + insurance + handlingCharges + landingCost + landedCostRate;
                updatedRow.landedValue = landedValue.toFixed(2);

                return updatedRow;
            })
        );
    };

    /* ---------------- Import recalc ---------------- */
    const recalcImportRow = (row) => {
        const num = (v) => Number(v) || 0;
        const balPoQty = num(row.balPoQty);
        const chanllanQty = num(row.chanllanQty);
        const receivedQty = num(row.receivedQty);
        const acceptQty = num(row.acceptQty);
        const fobRate = num(row.fobRate);
        const freight = num(row.freight);
        const freightInr = num(row.freightInr);
        const bcdValueInr = num(row.bcdValueInr);
        const exciseCvdIgst = num(row.exciseCvdIgst);
        const adduty = num(row.adduty);
        const clearingChrg = num(row.clearingChrg);
        const bankChrg = num(row.bankChrg);
        const packingChrg = num(row.packingChrg);
        const surcharge = num(row.surcharge);
        const specialCost = num(row.specialCost);
        const handlingChrg = num(row.handlingChrg);
        const exchangeRate = num(commonHeader.exchangeRate) || 0;

        const shortQty = balPoQty - chanllanQty;
        const rejectQty = receivedQty - acceptQty;
        const fobValue = fobRate * receivedQty;
        const fobValueInr = exchangeRate * fobValue;
        const cess10Inr = (bcdValueInr * 10) / 100;
        const totalValueFc = fobValue + freight;
        const totalValueInr = fobValueInr + freightInr;
        const landingValue =
            fobValueInr +
            freight +
            bcdValueInr +
            cess10Inr +
            exciseCvdIgst +
            adduty +
            clearingChrg +
            bankChrg +
            packingChrg +
            surcharge +
            specialCost +
            handlingChrg;
        const landingCostInr = receivedQty > 0 ? landingValue / receivedQty : 0;

        return {
            ...row,
            shortQty: shortQty ? shortQty.toFixed(2) : "",
            rejectQty: rejectQty ? rejectQty.toFixed(2) : "",
            fobValue: fobValue ? fobValue.toFixed(2) : "",
            fobValueInr: fobValueInr ? fobValueInr.toFixed(2) : "",
            cess10Inr: cess10Inr ? cess10Inr.toFixed(2) : "",
            totalValueFc: totalValueFc ? totalValueFc.toFixed(2) : "",
            totalValueInr: totalValueInr ? totalValueInr.toFixed(2) : "",
            landingValue: landingValue ? landingValue.toFixed(2) : "",
            landingCostInr: landingCostInr ? landingCostInr.toFixed(2) : "",
        };
    };

    const handleImportItemSelect = (idx, itemId) => {
        if (!itemId) {
            setImportItemRows((prev) =>
                prev.map((row, i) => (i === idx ? emptyImportItemRow() : row))
            );
            return;
        }
        const item = importItemMap[itemId];
        if (!item) return;

        const inspectionValue =
            item.inspectionDescription === "Yes" || item.inspectionDescription === "No"
                ? item.inspectionDescription
                : "";

        setImportItemRows((prev) =>
            prev.map((row, i) => {
                if (i !== idx) return row;
                const updated = {
                    ...row,
                    itemCode: item.itemId,
                    itemId: item.itemId,
                    description: item.itemDescription || "",
                    hsnSacCode: item.hsnCode || "",
                    unitId: item.unitId || "",
                    unitmasterId: item.unitmasterId || "",
                    stock: item.stock || "",
                    inspection: item.inspection ?? "",
                    inspectionDescription: item.inspectionDescription || "",
                    isInspectionable: inspectionValue,
                    poQty: item.poQty ?? "",
                    balPoQty: item.balanceQty ?? "",
                    balanceQty: item.balanceQty ?? "",
                };
                return recalcImportRow(updated);
            })
        );
    };

    const handleLocalItemCellChange = (idx, key, value) => {
        if (key === "itemCode") {
            handleItemSelect(idx, value);
            return;
        }
        setLocalItemRows((prev) =>
            prev.map((row, i) => {
                if (i !== idx) return row;

                const updatedRow = { ...row, [key]: value };
                const isIGST = commonHeader.isIgstAppl === "YES";
                const poQty = Number(updatedRow.poQty) || 0;
                const receivedQty = Number(updatedRow.receivedQty) || 0;
                const acceptQty = Number(updatedRow.acceptQty) || 0;
                const apportionedCost = Number(updatedRow.apportionedCost) || 0;
                const insurance = Number(updatedRow.insurance) || 0;
                const handlingCharges = Number(updatedRow.handlingCharges) || 0;
                const landingCost = Number(updatedRow.landingCost) || 0;
                const landedCostRate = Number(updatedRow.landedCostRate) || 0;

                if (key === "receivedQty") {
                    updatedRow.pendingQty = (poQty - receivedQty).toFixed(2);
                    updatedRow.rejectQty = (receivedQty - acceptQty).toFixed(2);
                    updatedRow.recQtyInPrimaryUnit = receivedQty;
                }

                if (key === "acceptQty") {
                    updatedRow.rejectQty = (receivedQty - acceptQty).toFixed(2);
                    updatedRow.accQtyInPrimaryUnit = acceptQty;
                }

                if (["receivedQty", "acceptQty", "poQty"].includes(key)) {
                    const amount = poQty * acceptQty;
                    updatedRow.amount = amount.toFixed(2);

                    let igstAmount = 0, sgstAmount = 0, cgstAmount = 0;
                    if (isIGST) {
                        igstAmount = (amount * (Number(updatedRow.igstRate) || 0)) / 100;
                        updatedRow.igstAmount = igstAmount.toFixed(2);
                    } else {
                        sgstAmount = (amount * (Number(updatedRow.sgstRate) || 0)) / 100;
                        cgstAmount = (amount * (Number(updatedRow.cgstRate) || 0)) / 100;
                        updatedRow.sgstAmount = sgstAmount.toFixed(2);
                        updatedRow.cgstAmount = cgstAmount.toFixed(2);
                    }

                    const landedValue = amount + igstAmount + apportionedCost + insurance + handlingCharges + landingCost + landedCostRate;
                    updatedRow.landedValue = landedValue.toFixed(2);
                }

                if (["apportionedCost", "insurance", "handlingCharges", "landingCost", "landedCostRate"].includes(key)) {
                    const amount = Number(updatedRow.amount) || 0;
                    const igstAmount = isIGST ? (Number(updatedRow.igstAmount) || 0) : 0;
                    const landedValue = amount + igstAmount + apportionedCost + insurance + handlingCharges + landingCost + landedCostRate;
                    updatedRow.landedValue = landedValue.toFixed(2);
                }

                return updatedRow;
            })
        );
    };

    const handleTaxDetailCellChange = (idx, key, value) => {
        setTaxDetailRows((prev) =>
            prev.map((row, i) => {
                if (i === idx) {
                    if (row.isSystemRow) return row;
                    return { ...row, [key]: value };
                }
                return row;
            })
        );
    };

    const localItemHandlers = {
        onCellChange: handleLocalItemCellChange,
        onAddRow: () => setLocalItemRows((prev) => [...prev, emptyLocalItemRow()]),
        onRemoveRow: (idx) => setLocalItemRows((prev) => prev.filter((_, i) => i !== idx)),
    };

    const importItemHandlers = {
        onCellChange: (idx, key, value) => {
            if (key === "itemCode") {
                handleImportItemSelect(idx, value);
                return;
            }
            setImportItemRows((prev) =>
                prev.map((row, i) => {
                    if (i !== idx) return row;
                    const updated = { ...row, [key]: value };
                    return recalcImportRow(updated);
                })
            );
        },
        onAddRow: () => setImportItemRows((prev) => [...prev, emptyImportItemRow()]),
        onRemoveRow: (idx) =>
            setImportItemRows((prev) => prev.filter((_, i) => i !== idx)),
    };

    const taxDetailHandlers = {
        onCellChange: handleTaxDetailCellChange,
        onAddRow: () => setTaxDetailRows((prev) => [...prev, emptyTaxDetailRow()]),
        onRemoveRow: (idx) => {
            const row = taxDetailRows[idx];
            if (row.isSystemRow) {
                alert("Cannot delete system calculated rows");
                return;
            }
            setTaxDetailRows((prev) => prev.filter((_, i) => i !== idx));
        },
    };

    const handleAttachmentFileChange = (idx, file) => {
        setAttachmentRows((prev) =>
            prev.map((row, i) =>
                i === idx ? { ...row, file, existing: null } : row
            )
        );
    };

    const handleAttachmentAddRow = () =>
        setAttachmentRows((prev) => [...prev, emptyAttachmentRow()]);

    const handleAttachmentRemoveRow = (idx) =>
        setAttachmentRows((prev) => prev.filter((_, i) => i !== idx));

    /* ---------------- Tab Config ---------------- */

    const isIGST = commonHeader.isIgstAppl === "YES";

    const localTabConfig = {
        purchaseDetail: {
            type: "table",
            rows: localItemRows,
            handlers: localItemHandlers,
            columns: [
                { key: "itemCode", label: "Item Code", type: "select", options: itemOptions, disabled: false },
                { key: "itemDescription", label: "Item Description", readOnly: true, disabled: true },
                { key: "hsnSacCode", label: "HSN/SAC Code", readOnly: true, disabled: true },
                { key: "taxType", label: "Tax Type", type: "select", options: ["SGST", "IGST"], readOnly: true, disabled: true },
                { key: "taxPct", label: "Tax (%)", type: "number", readOnly: true, disabled: true },
                { key: "primaryUnit", label: "Primary Unit", readOnly: true, disabled: true },
                { key: "poRate", label: "P.O./P.C. Rate", type: "number", readOnly: true, disabled: true },
                { key: "poQty", label: "P.O. Qty", type: "number", readOnly: true, disabled: true },
                { key: "poUnit", label: "PO Unit", type: "select", options: unitOptions },
                { key: "challanQty", label: "Challan Qty", type: "number" },
                { key: "storeStock", label: "Store Stock", type: "number" },
                { key: "pendingQty", label: "Pending Qty", type: "number", readOnly: true, disabled: true },
                { key: "receivedQty", label: "Received Qty", type: "number" },
                { key: "receivedUnit", label: "Received Unit", type: "select", options: unitOptions },
                { key: "conversionFactor", label: "Conversion Factor", type: "number" },
                { key: "recQtyInPrimaryUnit", label: "Rec Qty In Primary Unit", type: "number", readOnly: true, disabled: true },
                { key: "acceptQty", label: "Accept Qty.", type: "number" },
                { key: "accQtyInPrimaryUnit", label: "Acc Qty In Primary Unit", type: "number", readOnly: true, disabled: true },
                { key: "accUnit", label: "Acc. Unit", type: "select", options: unitOptions },
                { key: "rejectQty", label: "Reject Qty", type: "number", readOnly: true, disabled: true },
                { key: "rejQtyInPrimaryUnit", label: "Rej Qty In Primary Unit", type: "number" },
                { key: "excessQty", label: "Excess Qty", type: "number" },
                { key: "amount", label: "Amount", type: "number", readOnly: true, disabled: true },
                ...(isIGST ? [
                    { key: "igstRate", label: "IGST Rate", type: "number", readOnly: true, disabled: true },
                    { key: "igstAmount", label: "IGST Amount", type: "number", readOnly: true, disabled: true },
                ] : [
                    { key: "sgstRate", label: "SGST Rate", type: "number", readOnly: true, disabled: true },
                    { key: "sgstAmount", label: "SGST Amount", type: "number", readOnly: true, disabled: true },
                    { key: "cgstRate", label: "CGST Rate", type: "number", readOnly: true, disabled: true },
                    { key: "cgstAmount", label: "CGST Amount", type: "number", readOnly: true, disabled: true },
                ]),
                { key: "apportionedCost", label: "Apportioned Cost", type: "number" },
                { key: "insurance", label: "Insurance", type: "number" },
                { key: "handlingCharges", label: "Handling Charges", type: "number" },
                { key: "landingCost", label: "Landing Cost", type: "number" },
                { key: "landedCostRate", label: "Landed Cost Rate", type: "number" },
                { key: "landedValue", label: "Landed Value", type: "number", readOnly: true, disabled: true },
            ],
        },
        taxDetails: {
            type: "table",
            rows: taxDetailRows,
            handlers: taxDetailHandlers,
            columns: [
                {
                    key: "particulars",
                    label: "Particulars",
                    type: "select",
                    options: [
                        { value: "Gross Amount", label: "Gross Amount" },
                        ...particularsOptions,
                        { value: "IGST", label: "IGST" },
                        { value: "SGST", label: "SGST" },
                        { value: "CGST", label: "CGST" },
                    ],
                    disabled: false,
                },
                { key: "taxPct", label: "Tax%", type: "number" },
                ...(isIGST ? [
                    { key: "igstRate", label: "IGST Rate", type: "number" },
                    { key: "taxAmount", label: "IGST Amount", type: "number" },
                ] : [
                    { key: "sgstRate", label: "SGST Rate", type: "number" },
                    { key: "cgstRate", label: "CGST Rate", type: "number" },
                    { key: "taxAmount", label: "Tax Amount", type: "number" },
                ]),
            ],
        },
        summary: { type: "fields" },
        attachments: { type: "attachment", rows: attachmentRows },
    };

    const importTabConfig = {
        items: {
            type: "table",
            rows: importItemRows,
            handlers: importItemHandlers,
            columns: [
                { key: "itemCode", label: "Item Code", type: "select", options: importItemOptions },
                { key: "description", label: "Description", readOnly: true, disabled: true },
                { key: "hsnSacCode", label: "HSN /SAC CODE", readOnly: true, disabled: true },
                { key: "unitId", label: "UOM", readOnly: true, disabled: true },
                { key: "stock", label: "Stock", readOnly: true, disabled: true },
                {
                    key: "isInspectionable",
                    label: "Inspectionable?",
                    type: "select",
                    options: [{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }],
                    readOnly: true,
                    disabled: true,
                },
                { key: "poUnit", label: "PO Unit", type: "select", options: unitOptions },
                { key: "poQty", label: "PO Qty", type: "number", readOnly: true, disabled: true },
                { key: "balPoQty", label: "Bal.PO.Qty", type: "number", readOnly: true, disabled: true },
                { key: "chanllanQty", label: "Challan Qty", type: "number" },
                { key: "receivedQty", label: "Received Qty", type: "number" },
                { key: "shortQty", label: "Short Qty.", type: "number", readOnly: true, disabled: true },
                { key: "acceptQty", label: "Accept Qty", type: "number" },
                { key: "rejectQty", label: "Rej Qty.", type: "number", readOnly: true, disabled: true },
                { key: "fobRate", label: "FOB Rate(FC)", type: "number" },
                { key: "fobValue", label: "FOB Value(FC)", type: "number", readOnly: true, disabled: true },
                { key: "fobValueInr", label: "Fob Value(INR)", type: "number", readOnly: true, disabled: true },
                { key: "freight", label: "Freight", type: "number" },
                { key: "freightInr", label: "Freight (INR)", type: "number" },
                { key: "bcdValueInr", label: "BCD Value(INR)", type: "number" },
                { key: "cess10Inr", label: "Cess@10%(INR)", type: "number", readOnly: true, disabled: true },
                { key: "exciseCvdIgst", label: "Excise(CVD)/IGST", type: "number" },
                { key: "adduty", label: "Adduty", type: "number" },
                { key: "clearingChrg", label: "Clearing.chrg", type: "number" },
                { key: "bankChrg", label: "Bank.chrg", type: "number" },
                { key: "packingChrg", label: "Packing.chrg", type: "number" },
                { key: "surcharge", label: "Surcharge", type: "number" },
                { key: "specialCost", label: "Specialcost", type: "number" },
                { key: "handlingChrg", label: "Handling chrg", type: "number" },
                { key: "totalValueFc", label: "Total Value(FC)", type: "number", readOnly: true, disabled: true },
                { key: "totalValueInr", label: "Total Value (INR)", type: "number", readOnly: true, disabled: true },
                { key: "landingValue", label: "Landing Value", type: "number", readOnly: true, disabled: true },
                { key: "landingCostInr", label: "Landing Cost (INR)", type: "number", readOnly: true, disabled: true },
            ],
        },
        summary: { type: "fields" },
        attachments: { type: "attachment", rows: attachmentRows },
    };

    const getActiveConfig = () => (grnType === "Local" ? localTabConfig[activeChildTab] : importTabConfig[activeChildTab]);
    const getTabs = () => (grnType === "Local" ? LOCAL_TABS : IMPORT_TABS);

    const handleAddChildRow = () => {
        const config = getActiveConfig();
        if (config.type === "table") config.handlers.onAddRow();
        else if (config.type === "attachment") handleAttachmentAddRow();
    };

    /* ---------------- Validation ---------------- */

    const validate = () => {
        const errors = {};
        if (!commonHeader.plantId) errors.plantId = "Plant ID is required";
        if (!commonHeader.docDate) errors.docDate = "Doc Date is required";
        if (!commonHeader.location) errors.location = "Location is required";
        if (!commonHeader.supplierCode) errors.supplierCode = "Supplier Code is required";
        if (!commonHeader.poNo?.trim()) errors.poNo = "PO No is required";
        if (!commonHeader.currency) errors.currency = "Currency is required";

        if (grnType === "Local") {
            if (!commonHeader.gatePassNo?.trim()) errors.gatePassNo = "Gate Pass No is required";
            if (!localHeader.country) errors.country = "Country is required";
        } else {
            if (!importHeader.shipmentNo?.trim()) errors.shipmentNo = "Shipment No is required";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    /* ---------------- Import summary ---------------- */
    useEffect(() => {
        if (grnType === "Import" && !initialising) {
            const totalFob = importItemRows.reduce((s, r) => s + (parseFloat(r.fobValue) || 0), 0);
            const totalAdduty = importItemRows.reduce((s, r) => s + (parseFloat(r.adduty) || 0), 0);
            const totalFreight = importItemRows.reduce((s, r) => s + (parseFloat(r.freight) || 0), 0);
            const totalLanding = importItemRows.reduce((s, r) => s + (parseFloat(r.landingValue) || 0), 0);
            const totalInventory = importItemRows.reduce((s, r) => s + (parseFloat(r.landingCostInr) || 0), 0);

            setImportSummary((prev) => ({
                ...prev,
                totalFobValue: totalFob.toFixed(2),
                totalCustomsDuty: totalAdduty.toFixed(2),
                totalFreight: totalFreight.toFixed(2),
                totalLandingValue: totalLanding.toFixed(2),
                totalInventoryCost: totalInventory.toFixed(2),
            }));
        }
    }, [importItemRows, grnType, initialising]);

    /* ---------------- Build DTO ---------------- */

    const buildGrnDTO = () => {
        const base = {
            orgId: ORG_ID,
            branch: BRANCH_ID,
            financialYear: finYear,
            grnType: grnType,
            docNo: commonHeader.docNo || "",
            ...(editData?.id && { id: editData.id }),
            active: editData?.active ?? true,
            cancel: false,
            cancelRemarks: "",
            createdBy: localStorage.getItem("userName") || "SYSTEM",
            updatedBy: localStorage.getItem("userName") || "SYSTEM",

            supplierCode: commonHeader.supplierId || null,
            belongsTo: commonHeader.belongsTo || "",
            docDate: commonHeader.docDate || null,
            location: Number(commonHeader.location) || null,
            poNo: commonHeader.poNo || "",
            gatePassNo: commonHeader.gatePassNo || "",
            invoiceNo: commonHeader.invoiceNo || "",
            invoiceDate: commonHeader.invoiceDate || null,
            currency: Number(commonHeader.currency) || null,
            exchangeRate: Number(commonHeader.exchangeRate) || 0,
            isIgstApplicable: commonHeader.isIgstAppl || "",
            remarks: commonHeader.remarks || "",
        };

        if (grnType === "Local") {
            return {
                ...base,
                dealerType: localHeader.dealerType || "",
                isReverseCharge: localHeader.isReverseChrg || "",
                scheduleNo: localHeader.scheduleNo || "",
                scheduleDate: localHeader.scheduleDate || null,
                scheduleStartDate: localHeader.schStartDate || null,
                scheduleEndDate: localHeader.schEndDate || null,
                grossAmount: Number(localHeader.grossAmt) || Number(summary.basicAmount) || 0,
                totalAmountTax: Number(summary.totAmtTax) || 0,
                modvatCopyReceived: localHeader.modvatCopyReceived || "",
                totalQtyInKg: Number(localHeader.totalQtyInKg) || 0,
                partyDcNo: localHeader.partyDcNoInvNo || "",
                discount: Number(localHeader.discountPct) || 0,
                supplierDcDate: localHeader.supplierDcDate || "",
                invoiceSentOn: summary.invoiceSentOn || null,

                grnDetailsDTO: localItemRows
                    .filter((r) => r.itemCode)
                    .map((r) => ({
                        id: r.id || 0,
                        item: Number(r.itemCode) || 0,
                        hsnCode: r.hsnSacCode || "",
                        taxType: r.taxType || "",
                        taxPercentage: Number(r.taxPct) || 0,
                        primaryUnit: Number(r.primaryUnit) || 0,
                        purchaseUnit: Number(r.poUnit) || 0,
                        stock: Number(r.stock) || 0,
                        inspectionable: r.inspectionable || "",
                        manufacturedDate: r.manufacturedDate || null,
                        purchaseTolerance: Number(r.purchaseTolerance) || 0,
                        poRate: Number(r.poRate) || 0,
                        poQty: Number(r.poQty) || 0,
                        poUnit: Number(r.poUnit) || 0,
                        challanQty: Number(r.challanQty) || 0,
                        storeStock: Number(r.storeStock) || 0,
                        receivedQty: Number(r.receivedQty) || 0,
                        receivedUnit: Number(r.receivedUnit) || 0,
                        acceptQty: Number(r.acceptQty) || 0,
                        accUnit: Number(r.accUnit) || 0,
                        excessQty: Number(r.excessQty) || 0,
                        itemMaxQty: Number(r.itemMaxQty) || 0,
                        amount: Number(r.amount) || 0,
                        apportionedCost: Number(r.apportionedCost) || 0,
                        insurance: Number(r.insurance) || 0,
                        handCharge: Number(r.handlingCharges) || 0,
                        lcost: Number(r.landingCost) || 0,
                        landedCostRate: Number(r.landedCostRate) || 0,
                        bankchrg: 0,
                    })),

                grnTaxDetailsDTO: taxDetailRows
                    .filter((r) => r.particulars)
                    .map((r) => ({
                        particulars: r.particulars || "",
                        tax: Number(r.taxPct) || 0,
                        taxAmount: Number(r.taxAmount) || 0,
                        taxVal: Number(r.taxableValue) || 0,
                    })),
            };
        }

        // Import
        return {
            ...base,
            shipmentNo: importHeader.shipmentNo || "",
            shipmentDate: importHeader.shipmentDate || null,
            blNo: importHeader.blNo || "",
            blDate: importHeader.blDate || null,
            transporter: Number(importHeader.transporter) || null,
            poDate: importHeader.poDate || null,
            vehicleNo: importHeader.vehicleNo || "",
            totalPackages: Number(importHeader.totalPackages) || 0,
            totalGrossWeight: Number(importHeader.totalGrossWeight) || 0,
            poCurrency: importHeader.poCurrency || "",
            lrNo: importHeader.lrNo || "",
            poExchangeRate: Number(importHeader.poExchangeRate) || 0,

            receivedBy: importSummary.receivedBy || "",
            qualityCheckBy: importSummary.qualityCheckBy || "",

            totalFobValue: Number(importSummary.totalFobValue) || 0,
            totalCustomsDuty: Number(importSummary.totalCustomsDuty) || 0,
            totalFreight: Number(importSummary.totalFreight) || 0,
            totalLandingValue: Number(importSummary.totalLandingValue) || 0,
            totalInventoryCost: Number(importSummary.totalInventoryCost) || 0,

            importGrnDetailsDTO: importItemRows
                .filter((r) => r.itemCode)
                .map((r) => ({
                    id: r.id || 0,
                    item: Number(r.itemCode) || 0,
                    uom: Number(r.unitmasterId) || 0,
                    stock: r.stock || "",
                    inspectionable: r.isInspectionable || "",
                    poUnit: Number(r.poUnit) || 0,
                    poQty: Number(r.poQty) || 0,
                    balancePoQty: Number(r.balPoQty) || 0,
                    challanQty: Number(r.chanllanQty) || 0,
                    receivedQty: Number(r.receivedQty) || 0,
                    acptQty: Number(r.acceptQty) || 0,
                    fobRateFC: Number(r.fobRate) || 0,
                    freight: Number(r.freight) || 0,
                    freightInd: Number(r.freightInr) || 0,
                    bcdValueINR: Number(r.bcdValueInr) || 0,
                    exciseCvdIgst: Number(r.exciseCvdIgst) || 0,
                    addDuty: Number(r.adduty) || 0,
                    clearingCharge: Number(r.clearingChrg) || 0,
                    bankCharge: Number(r.bankChrg) || 0,
                    packingCharge: Number(r.packingChrg) || 0,
                    surcharge: Number(r.surcharge) || 0,
                    specialCost: Number(r.specialCost) || 0,
                    handlingCharge: Number(r.handlingChrg) || 0,
                })),
        };
    };

    /* ---------------- Save ---------------- */

    const handleSave = async () => {
        if (isSubmittingRef.current) return;
        if (!validate()) return;

        isSubmittingRef.current = true;
        setIsSubmitting(true);

        try {
            const payload = buildGrnDTO();

            payload.existingInvoiceCopies = attachmentRows
                .filter((r) => !r.file && r.existing)
                .map((r) => ({
                    fileName: r.existing.fileName,
                    name: r.existing.name,
                }));

            const files = attachmentRows
                .map((row) => row.file)
                .filter(Boolean);

            console.log("📤 Saving GRN Payload (DTO):", payload);
            console.log("📎 Files:", files.map((f) => f.name));

            const response = await goodsReceivedNoteAPI.updateCreateGrn(payload, files);

            const status =
                response?.status === true ||
                response?.statusFlag === "Ok";

            if (status) {
                addToast(
                    editData?.id ? "GRN Updated Successfully!" : "GRN Saved Successfully!",
                    "success"
                );
                if (onSave) onSave(payload);
                onBack();
            } else {
                const errorMessage =
                    response?.paramObjectsMap?.message ||
                    response?.paramObjectsMap?.errorMessage ||
                    response?.message ||
                    "Failed to save GRN";
                addToast(errorMessage, "error");
            }
        } catch (error) {
            console.error("❌ Save Error:", error);
            addToast("Failed to save GRN.", "error");
        } finally {
            isSubmittingRef.current = false;
            setIsSubmitting(false);
        }
    };

    const activeConfig = getActiveConfig();
    const tabs = getTabs();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500 dark:text-gray-400">Loading...</div>
            </div>
        );
    }

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
                    {editData?.id ? "Edit Goods Received Note" : "Goods Received Note"}
                </h2>
            </div>

            {/* Main Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
                {/* GRN Type */}
                <div className="w-full max-w-xs">
                    <Field
                        type="select"
                        label="GRN Type"
                        name="grnType"
                        value={grnType}
                        onChange={handleGrnTypeChange}
                        options={GRN_TYPE_OPTIONS}
                        required
                    />
                </div>

                {/* Common header */}
                <div>
                    <SectionHeader>GRN Details</SectionHeader>
                    <div className={fieldGrid}>
                        <Field type="select" label="Plant ID" name="plantId" value={commonHeader.plantId} onChange={handleCommonHeaderChange} error={fieldErrors.plantId} options={plantOptions} required />
                        <Field label="Doc No" name="docNo" value={commonHeader.docNo || "Auto"} onChange={handleCommonHeaderChange} disabled />
                        <Field type="select" label="Belongs to" name="belongsTo" value={commonHeader.belongsTo} onChange={handleCommonHeaderChange} options={belongsToOptions} />
                        <Field type="date" label="Doc Date" name="docDate" value={commonHeader.docDate} onChange={handleCommonHeaderChange} error={fieldErrors.docDate} required />
                        <Field type="select" label="Location" name="location" value={commonHeader.location} onChange={handleCommonHeaderChange} error={fieldErrors.location} options={locationOptions} required />
                        <Field type="select" label="Supplier Code" name="supplierCode" value={commonHeader.supplierCode} onChange={handleCommonHeaderChange} error={fieldErrors.supplierCode} options={supplierOptions} required />
                        <Field label="Supplier Name" name="supplierName" value={commonHeader.supplierName} onChange={handleCommonHeaderChange} disabled />
                        <Field label="Supplier Address" name="supplierAddress" value={commonHeader.supplierAddress} onChange={handleCommonHeaderChange} disabled className="col-span-2" />
                        <Field label="Supplier GST No" name="supplierGstNo" value={commonHeader.supplierGstNo} onChange={handleCommonHeaderChange} disabled />
                        <Field label="Supplier State" name="supplierState" value={commonHeader.supplierState} onChange={handleCommonHeaderChange} disabled />
                        <Field label="GST State" name="gstState" value={commonHeader.gstState} onChange={handleCommonHeaderChange} disabled />
                        <Field label="GSTN No" name="gstnNo" value={commonHeader.gstnNo} onChange={handleCommonHeaderChange} disabled />
                        <Field label="Is IGST Appl" name="isIgstAppl" value={commonHeader.isIgstAppl} onChange={handleCommonHeaderChange} readOnly />
                        <Field
                            label="Gate Pass No"
                            name="gatePassNo"
                            value={commonHeader.gatePassNo}
                            onChange={handleCommonHeaderChange}
                            error={fieldErrors.gatePassNo}
                            required
                        />
                        <Field
                            label="PO No"
                            name="poNo"
                            value={commonHeader.poNo}
                            onChange={handleCommonHeaderChange}
                            error={fieldErrors.poNo}
                            required
                        />
                        <Field label="Invoice No" name="invoiceNo" value={commonHeader.invoiceNo} onChange={handleCommonHeaderChange} />
                        <Field type="date" label="Invoice Date" name="invoiceDate" value={commonHeader.invoiceDate} onChange={handleCommonHeaderChange} />
                        <Field label="Currency" name="currencyName" value={commonHeader.currencyName || commonHeader.currency || ""} onChange={handleCommonHeaderChange} readOnly />
                        <Field label="Exchange Rate" name="exchangeRate" value={commonHeader.exchangeRate} onChange={handleCommonHeaderChange} readOnly />
                        <Field label="Remarks" name="remarks" value={commonHeader.remarks} onChange={handleCommonHeaderChange} />
                    </div>
                </div>

                {/* Type specific fields */}
                {grnType === "Local" ? (
                    <div className={fieldGrid}>
                        <Field type="select" label="Country" name="country" value={localHeader.country} onChange={handleLocalHeaderChange} error={fieldErrors.country} options={countryOptions} required />
                        <Field label="Dealer Type" name="dealerType" value={localHeader.dealerType} onChange={handleLocalHeaderChange} readOnly />
                        <Field label="Is Reverse Chrg" name="isReverseChrg" value={localHeader.isReverseChrg} onChange={handleLocalHeaderChange} readOnly />
                        <Field type="select" label="Schedule No." name="scheduleNo" value={localHeader.scheduleNo} onChange={handleLocalHeaderChange} options={scheduleOptions} />
                        <Field type="date" label="Schedule Date" name="scheduleDate" value={localHeader.scheduleDate} onChange={handleLocalHeaderChange} />
                        <Field type="date" label="Sch. Start Date" name="schStartDate" value={localHeader.schStartDate} onChange={handleLocalHeaderChange} />
                        <Field type="date" label="Sch. End Date" name="schEndDate" value={localHeader.schEndDate} onChange={handleLocalHeaderChange} />
                        <Field type="time" label="GRN Clear Time" name="grnClearTime" value={localHeader.grnClearTime} onChange={handleLocalHeaderChange} />
                        <Field type="number" label="Gross Amt" name="grossAmt" value={localHeader.grossAmt} onChange={handleLocalHeaderChange} />
                        <Field label="Modvat Copy Received" name="modvatCopyReceived" value={localHeader.modvatCopyReceived} onChange={handleLocalHeaderChange} />
                        <Field type="number" label="Total Qty In Kg" name="totalQtyInKg" value={localHeader.totalQtyInKg} onChange={handleLocalHeaderChange} />
                        <Field label="Party DC No/Inv No" name="partyDcNoInvNo" value={localHeader.partyDcNoInvNo} onChange={handleLocalHeaderChange} />
                        <Field type="number" label="Discount %" name="discountPct" value={localHeader.discountPct} onChange={handleLocalHeaderChange} />
                        <Field type="date" label="Supplier DC Date" name="supplierDcDate" value={localHeader.supplierDcDate} onChange={handleLocalHeaderChange} />
                    </div>
                ) : (
                    <div className={fieldGrid}>
                        <Field label="Shipment No" name="shipmentNo" value={importHeader.shipmentNo} onChange={handleImportHeaderChange} error={fieldErrors.shipmentNo} required />
                        <Field type="date" label="Shipment Date" name="shipmentDate" value={importHeader.shipmentDate} onChange={handleImportHeaderChange} />
                        <Field label="BL No" name="blNo" value={importHeader.blNo} onChange={handleImportHeaderChange} />
                        <Field type="date" label="BL Date" name="blDate" value={importHeader.blDate} onChange={handleImportHeaderChange} />
                        <Field type="select" label="Transporter" name="transporter" value={importHeader.transporter} onChange={handleImportHeaderChange} options={transportOptions} />
                        <Field type="date" label="PO Date" name="poDate" value={importHeader.poDate} onChange={handleImportHeaderChange} />
                        <Field label="Vehicle No" name="vehicleNo" value={importHeader.vehicleNo} onChange={handleImportHeaderChange} />
                        <Field type="number" label="Total Packages" name="totalPackages" value={importHeader.totalPackages} onChange={handleImportHeaderChange} />
                        <Field type="number" step="0.01" label="Total Gross Weight" name="totalGrossWeight" value={importHeader.totalGrossWeight} onChange={handleImportHeaderChange} />
                        <Field type="time" label="GRN Time" name="grnTime" value={importHeader.grnTime} onChange={handleImportHeaderChange} />
                        <Field label="PO Currency" name="poCurrency" value={importHeader.poCurrency} onChange={handleImportHeaderChange} />
                        <Field label="LR No" name="lrNo" value={importHeader.lrNo} onChange={handleImportHeaderChange} />
                        <Field type="number" step="0.0001" label="PO Exchange Rate" name="poExchangeRate" value={importHeader.poExchangeRate} onChange={handleImportHeaderChange} />
                    </div>
                )}

                {/* Child Tabs */}
                <section className="mt-0 bg-white dark:bg-gray-800">
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-0">
                        <div className="flex overflow-x-auto">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setActiveChildTab(tab.key)}
                                    className={`px-4 py-1 text-xs font-semibold rounded-t whitespace-nowrap ${activeChildTab === tab.key ? "bg-blue-600 text-white" : "text-gray-600 dark:text-gray-300"}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {(activeConfig.type === "table" || activeConfig.type === "attachment") && (
                            <button
                                type="button"
                                onClick={handleAddChildRow}
                                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors flex-shrink-0"
                            >
                                <Plus size={12} />
                            </button>
                        )}
                    </div>

                    {activeConfig.type === "table" && (
                        <DynamicTable
                            columns={activeConfig.columns}
                            rows={activeConfig.rows}
                            onCellChange={activeConfig.handlers.onCellChange}
                            onRemoveRow={activeConfig.handlers.onRemoveRow}
                        />
                    )}

                    {activeConfig.type === "attachment" && (
                        <AttachmentTable
                            rows={activeConfig.rows}
                            onFileChange={handleAttachmentFileChange}
                            onRemoveRow={handleAttachmentRemoveRow}
                        />
                    )}

                    {activeConfig.type === "fields" && (
                        <div className="pt-3">
                            {grnType === "Local" ? (
                                <div className={fieldGrid}>
                                    <Field type="number" label="Net Amount" name="netAmount" value={summary.netAmount} onChange={handleSummaryChange} disabled />
                                    <Field type="number" label="Tot Amt Tax" name="totAmtTax" value={summary.totAmtTax} onChange={handleSummaryChange} disabled />
                                    <Field type="number" label="Basic Amount" name="basicAmount" value={summary.basicAmount} onChange={handleSummaryChange} disabled />
                                    <Field type="date" label="Invoice Sent On" name="invoiceSentOn" value={summary.invoiceSentOn} onChange={handleSummaryChange} />
                                </div>
                            ) : (
                                <div className={fieldGrid}>
                                    <Field type="text" label="Total FOB Value" name="totalFobValue" value={importSummary.totalFobValue} disabled />
                                    <Field type="text" label="Total Customs Duty" name="totalCustomsDuty" value={importSummary.totalCustomsDuty} disabled />
                                    <Field type="text" label="Total Freight" name="totalFreight" value={importSummary.totalFreight} disabled />
                                    <Field type="text" label="Total Landing Value" name="totalLandingValue" value={importSummary.totalLandingValue} disabled />
                                    <Field type="text" label="Total Inventory Cost" name="totalInventoryCost" value={importSummary.totalInventoryCost} disabled />
                                    <Field label="Received By" name="receivedBy" value={importSummary.receivedBy} onChange={handleImportSummaryChange} />
                                    <Field label="Quality Check By" name="qualityCheckBy" value={importSummary.qualityCheckBy} onChange={handleImportSummaryChange} />
                                </div>
                            )}
                        </div>
                    )}
                </section>

                <FormButtons
                    onCancel={onBack}
                    onSave={handleSave}
                    isSubmitting={isSubmitting}
                    saveLabel={editData?.id ? "Update" : "Save"}
                />
            </div>
        </div>
    );
};

export default GoodsReceivedNoteForm;
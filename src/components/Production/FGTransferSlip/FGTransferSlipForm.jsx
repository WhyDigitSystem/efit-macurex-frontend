import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import branchAPI from "../../../api/branchAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";
import { unitMasterAPI } from "../../../api/unitAPI";
import { useToast } from "../../Toast/ToastContext";
import fgTransferSlipAPI from "../../../api/Production/fgTransferSlipAPI";

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

const cellInputClasses =
  "w-full h-8 px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400";

const cellReadOnlyClasses =
  "w-full h-8 px-2 rounded border text-xs leading-none " +
  "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 " +
  "text-gray-500 dark:text-gray-400";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-2 items-start";

/* ---------------------------------------------------------------------------- */
/* Building blocks                                                             */

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
  className = "",
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
          {(options || []).map((opt) => {
            const val = typeof opt === "object" ? opt.value : opt;
            const lab = typeof opt === "object" ? opt.label : opt;
            return (
              <option key={val} value={val}>
                {lab}
              </option>
            );
          })}
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
        className={controlClasses}
      />

      {error && (
        <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
};

const FieldsGrid = ({
  fields,
  values,
  onChange,
  errors,
  gridClassName = fieldGrid,
}) => (
  <div className={gridClassName}>
    {fields.map((f) => (
      <Field
        key={f.name}
        type={f.type || "text"}
        label={f.label}
        name={f.name}
        value={f.auto ? values[f.name] || "Auto" : values[f.name]}
        onChange={onChange}
        options={f.options}
        disabled={f.disabled || f.auto}
        required={f.required}
        error={errors?.[f.name]}
        className={f.className}
      />
    ))}
  </div>
);

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
          className={`p-1 whitespace-nowrap ${i === 0
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
    <td className="p-1 text-center font-medium dark:text-white">{index + 1}</td>
    {children}
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
  </tr>
);

const SelectCell = ({ value, onChange, options }) => (
  <td className="p-1 align-top">
    <select value={value} onChange={onChange} className={cellInputClasses}>
      <option value="">-- Select --</option>
      {(options || []).map((opt) => {
        const val = typeof opt === "object" ? opt.value : opt;
        const lab = typeof opt === "object" ? opt.label : opt;
        return (
          <option key={val} value={val}>
            {lab}
          </option>
        );
      })}
    </select>
  </td>
);

const InputCell = ({ value, onChange, type = "text", step, readOnly }) => (
  <td className="p-1 align-top">
    <input
      type={type}
      step={step}
      value={value ?? ""}
      readOnly={readOnly}
      onChange={onChange}
      className={`${readOnly ? cellReadOnlyClasses : cellInputClasses} ${type === "number" ? "min-w-[90px]" : "min-w-[110px]"
        }`}
    />
  </td>
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
          {columns.map((col) =>
            col.type === "select" ? (
              <SelectCell
                key={col.key}
                value={row[col.key]}
                onChange={(e) =>
                  onCellChange(idx, col.key, e.target.value, col)
                }
                options={col.options}
              />
            ) : (
              <InputCell
                key={col.key}
                value={row[col.key]}
                type={
                  col.type === "number"
                    ? "number"
                    : col.type === "date"
                      ? "date"
                      : "text"
                }
                step={col.step}
                readOnly={col.readOnly}
                onChange={(e) =>
                  onCellChange(idx, col.key, e.target.value, col)
                }
              />
            )
          )}
        </TableRow>
      ))}
    </tbody>
  </TableWrapper>
);

const blankRowFromColumns = (columns) =>
  columns.reduce((acc, col) => ({ ...acc, [col.key]: "" }), {});

const blankFromFields = (fields) =>
  fields.reduce((acc, f) => ({ ...acc, [f.name]: f.default ?? "" }), {});

/* ---------------------------------------------------------------------------- */
/* Helpers                                                                     */

const todayISO = () => new Date().toISOString().slice(0, 10);
const toNum = (n) => (Number.isNaN(Number(n)) ? 0 : Number(n));
const round2 = (n) => Math.round((toNum(n) + Number.EPSILON) * 100) / 100;

const toBool = (v) => {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v.toLowerCase() === "active";
  return true;
};

/* ---------------------------------------------------------------------------- */
/* Column definitions                                                          */

const TRANSFER_DETAIL_COLUMNS = [
  { key: "itemCode", label: "Item Code", type: "select", options: [] },
  { key: "itemDescription", label: "Item Description", readOnly: true },
  { key: "unit", label: "Unit", readOnly: true },
  { key: "bomQty", label: "Bom Qty", type: "number", readOnly: true },
  { key: "availableStock", label: "Available Stock", type: "number" },
  {
    key: "consumptionAsPerBom",
    label: "Consumption As Per Bom",
    type: "number",
    readOnly: true,
  },
  { key: "wastageQty", label: "Wastage Qty", type: "number" },
  {
    key: "consumedQty",
    label: "Consumed Qty",
    type: "number",
    readOnly: true,
  },
  { key: "rate", label: "Rate", type: "number" },
  { key: "value", label: "Value", type: "number", readOnly: true },
  { key: "scrapId", label: "Scrap ID", type: "select", options: [] },
  { key: "scrapQty", label: "Scrap Qty", type: "number" },
  {
    key: "scrapUnit",
    label: "Scrap Unit",
    type: "select",
    options: [],
  },
  {
    key: "scrapTotal",
    label: "Scrap Total",
    type: "number",
    readOnly: true,
  },
];

const INSPECTION_DETAIL_COLUMNS = [
  { key: "itemCode", label: "Item Code", type: "select", options: [] },
  { key: "itemDescription", label: "Item Description", readOnly: true },
  { key: "inspectedQty", label: "Inspected Qty", type: "number" },
  { key: "acceptedQty", label: "Accepted Qty", type: "number" },
  { key: "rejectedQty", label: "Rejected Qty", type: "number" },
  {
    key: "result",
    label: "Result",
    type: "select",
    options: ["ACCEPTED", "REJECTED", "PENDING"],
  },
  { key: "remarks", label: "Remarks" },
];

const TRANSFER_SUMMARY_FIELDS = [
  {
    name: "totalQty",
    label: "Total Qty",
    type: "number",
    disabled: true,
  },
  {
    name: "remarks",
    label: "Remarks",
    type: "textarea",
    className: "col-span-2 md:col-span-4 xl:col-span-6",
  },
];

const HEADER_FIELDS = [
  {
    name: "plant",
    label: "Plant ID",
    type: "select",
    options: [],
    required: true,
  },
  {
    name: "belongsTo",
    label: "Belongs to",
    type: "select",
    options: [],
  },
  {
    name: "fromLocation",
    label: "From Location",
    type: "select",
    options: [],
  },
  { name: "transferNo", label: "Transfer No", auto: true },
  {
    name: "toLocation",
    label: "To Location",
    type: "select",
    options: [],
  },
  {
    name: "date",
    label: "Date",
    type: "date",
    default: todayISO(),
    required: true,
  },
  {
    name: "scrapLocation",
    label: "Scrap Location",
    type: "select",
    options: [],
  },
  {
    name: "fgItemCode",
    label: "FG Item Code",
    type: "select",
    options: [],
  },
  { name: "itemDesc", label: "Item Desc", disabled: true },
  { name: "bomId", label: "BOM ID", type: "select", options: [] },
  {
    name: "scheduledQty",
    label: "Scheduled Qty",
    type: "number",
    disabled: true,
  },
  { name: "scheduleNo", label: "Schedule No", type: "select", options: [] },
  { name: "qtyForInspection", label: "Qty For Inspection", type: "number" },
  {
    name: "scheduleDate",
    label: "Schedule Date",
    type: "date",
    disabled: true,
  },
  {
    name: "customerCode",
    label: "Customer Code",
    type: "select",
    options: [],
  },
  { name: "rate", label: "Rate", type: "number" },
  { name: "customerName", label: "Customer Name", disabled: true },
];

const CHILD_TABS = [
  { key: "transferDetails", label: "Transfer Details", type: "table" },
  { key: "transferSummary", label: "Transfer Summary", type: "fields" },
];

/* ---------------------------------------------------------------------------- */
/* Form                                                                        */

const FGTransferSlipForm = ({ onBack, onSave, editData }) => {
  const ORG_ID = parseInt(localStorage.getItem("orgId"));
  const BRANCH_ID = parseInt(localStorage.getItem("branchId"));
  const { addToast } = useToast();

  const financialYear = String(new Date().getFullYear());
  const isEditMode = Boolean(editData?.id);

  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatingDocId, setGeneratingDocId] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [activeChildTab, setActiveChildTab] = useState("transferDetails");

  const [plantOptions, setPlantOptions] = useState([]);
  const [belongsToOptions, setBelongsToOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [fgItemOptions, setFgItemOptions] = useState([]);
  const [fgItemMap, setFgItemMap] = useState({});
  const [bomOptions, setBomOptions] = useState([]);
  const [scheduleOptions, setScheduleOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [customerMap, setCustomerMap] = useState({});
  const [scrapOptions, setScrapOptions] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);
  const [bomDetailOptions, setBomDetailOptions] = useState([]);
  const [bomDetailMap, setBomDetailMap] = useState({});

  const [header, setHeader] = useState({
    ...blankFromFields(HEADER_FIELDS),
    ...editData?.header,
  });

  const [transferDetailRows, setTransferDetailRows] = useState(
    editData?.transferDetails?.length
      ? editData.transferDetails
      : [blankRowFromColumns(TRANSFER_DETAIL_COLUMNS)]
  );

  const [inspectionDetailRows, setInspectionDetailRows] = useState(
    editData?.inspectionDetails?.length
      ? editData.inspectionDetails
      : [blankRowFromColumns(INSPECTION_DETAIL_COLUMNS)]
  );

  const [transferSummary, setTransferSummary] = useState({
    ...blankFromFields(TRANSFER_SUMMARY_FIELDS),
    ...editData?.transferSummary,
  });

  /* ------------------------------------------------------------------ */
  /* Loaders                                                            */

  const loadPlants = useCallback(async () => {
    if (!ORG_ID) return;
    try {
      const res = await branchAPI.getBranchByOrgId(ORG_ID);
      setPlantOptions(
        (res || []).map((b) => ({
          value: b.id,
          label: b.branchName || b.branchCode || b.id,
        }))
      );
    } catch (err) {
      console.error("Failed to load plants:", err);
    }
  }, [ORG_ID]);

  const loadBelongsTo = useCallback(async () => {
    if (!ORG_ID) return;
    try {
      const res = await listOfValuesAPI.getListValuesGroup(
        "SDS BELONGS TO",
        ORG_ID
      );
      const list = Array.isArray(res) ? res : res?.listValues || [];
      setBelongsToOptions(
        list.map((item) => ({
          value: item.id || item.value || item.valuesDescription,
          label:
            item.valuesDescription ||
            item.valueDescription ||
            item.description ||
            "",
        }))
      );
    } catch (err) {
      console.error("Failed to load Belongs To:", err);
    }
  }, [ORG_ID]);

  const loadLocations = useCallback(async () => {
    if (!ORG_ID || !BRANCH_ID) return;
    try {
      const list = await locationMasterAPI.getLocationMasterByOrgId(
        ORG_ID,
        BRANCH_ID
      );
      setLocationOptions(
        (list || []).map((l) => ({
          value: l.id,
          label: l.locationName || l.locationCode || `Location ${l.id}`,
        }))
      );
    } catch (err) {
      console.error("Failed to load locations:", err);
    }
  }, [ORG_ID, BRANCH_ID]);

  const loadFgItems = useCallback(async () => {
    if (!ORG_ID || !BRANCH_ID) return;
    try {
      const list = await fgTransferSlipAPI.getFgPartNoDetails(
        BRANCH_ID,
        ORG_ID
      );
      const map = {};
      setFgItemOptions(
        (list || []).map((it) => {
          map[it.itemId] = it;
          return {
            value: it.itemId,
            label: `${it.itemCode} - ${it.itemDescription}`,
          };
        })
      );
      setFgItemMap(map);
    } catch (err) {
      console.error("Failed to load FG items:", err);
    }
  }, [ORG_ID, BRANCH_ID]);

  const loadSchedules = useCallback(async () => {
    if (!ORG_ID || !BRANCH_ID) return;
    try {
      const list = await fgTransferSlipAPI.getSchNoFromFgTransferSlip(
        BRANCH_ID,
        ORG_ID
      );
      setScheduleOptions(
        (list || []).map((s) => ({
          value: s.docId,
          label: `${s.docId} - ${s.docDate}`,
          scheduledQty: s.scheduledQty,
          docDate: s.docDate,
        }))
      );
    } catch (err) {
      console.error("Failed to load schedules:", err);
    }
  }, [ORG_ID, BRANCH_ID]);

  const loadCustomers = useCallback(async () => {
    if (!ORG_ID || !BRANCH_ID) return;
    try {
      const list =
        await fgTransferSlipAPI.getCustomersDetailsFromTransferSlip(
          BRANCH_ID,
          ORG_ID
        );
      const map = {};
      setCustomerOptions(
        (list || []).map((c) => {
          map[c.customerId] = c;
          return {
            value: c.customerId,
            label: `${c.customerCode} - ${c.customerName}`,
          };
        })
      );
      setCustomerMap(map);
    } catch (err) {
      console.error("Failed to load customers:", err);
    }
  }, [ORG_ID, BRANCH_ID]);

  const loadScrapItems = useCallback(async () => {
    if (!ORG_ID || !BRANCH_ID) return;
    try {
      const list = await fgTransferSlipAPI.getScrapItemDetails(
        BRANCH_ID,
        ORG_ID
      );
      setScrapOptions(
        (list || []).map((s) => ({
          value: s.itemId,
          label: `${s.itemCode} - ${s.itemDescription}`,
          itemCode: s.itemCode,
          itemDescription: s.itemDescription,
        }))
      );
    } catch (err) {
      console.error("Failed to load scrap items:", err);
    }
  }, [ORG_ID, BRANCH_ID]);

  const loadUnits = useCallback(async () => {
    if (!ORG_ID || !BRANCH_ID) return;
    try {
      const list = await unitMasterAPI.getUnits(BRANCH_ID, ORG_ID);
      setUnitOptions(
        (list || []).map((u) => ({
          value: u.id,
          label: u.unitId || u.unitName || String(u.id),
        }))
      );
    } catch (err) {
      console.error("Failed to load units:", err);
      setUnitOptions([]);
    }
  }, [ORG_ID, BRANCH_ID]);

  const loadBomOptions = useCallback(
    async (fgItemId) => {
      if (!fgItemId || !ORG_ID || !BRANCH_ID) {
        setBomOptions([]);
        return;
      }
      try {
        const list = await fgTransferSlipAPI.getBomFromFgTransferSlip(
          BRANCH_ID,
          fgItemId,
          ORG_ID
        );
        setBomOptions(
          (list || []).map((b) => ({
            value: b.bomId,
            label: `${b.docId} (${b.docDate})`,
            bomId: b.bomId,
            docId: b.docId,
            docDate: b.docDate,
          }))
        );
      } catch (err) {
        console.error("Failed to load BOM list:", err);
        setBomOptions([]);
      }
    },
    [ORG_ID, BRANCH_ID]
  );

  const loadBomDetailOptions = useCallback(
    async (bomId) => {
      if (!bomId || !ORG_ID || !BRANCH_ID) {
        setBomDetailOptions([]);
        setBomDetailMap({});
        return;
      }
      try {
        const list = await fgTransferSlipAPI.getBomDetailsFromFgTransferSlip(
          bomId,
          BRANCH_ID,
          ORG_ID
        );
        const map = {};
        setBomDetailOptions(
          (list || []).map((it) => {
            map[it.itemId] = it;
            return {
              value: it.itemId,
              label: `${it.itemCode} - ${it.itemDescription}`,
            };
          })
        );
        setBomDetailMap(map);
      } catch (err) {
        console.error("Failed to load BOM details:", err);
        setBomDetailOptions([]);
        setBomDetailMap({});
      }
    },
    [ORG_ID, BRANCH_ID]
  );

  /* Populate form from API response (edit mode) */
  const populateFormFromApi = useCallback((vo) => {
    if (!vo) return;

    setHeader((prev) => ({
      ...prev,
      plant: vo.branch?.id || "",
      belongsTo: vo.belongsTo || "",
      fromLocation: vo.fromLocation?.id || "",
      toLocation: vo.toLocation?.id || "",
      scrapLocation: vo.scrapLocation?.id || "",
      transferNo: vo.transferNo || vo.docId || "",
      date: vo.transferDate || vo.docDate || todayISO(),
      fgItemCode: vo.fgItem?.id || "",
      itemDesc: vo.fgItem?.itemDescription || "",
      bomId: vo.bom?.id || "",
      scheduledQty: vo.scheduledQty ?? "",
      scheduleNo: vo.scheduleNo || "",
      qtyForInspection: vo.qtyForInspection ?? "",
      scheduleDate: vo.scheduleDate || "",
      customerCode: vo.customer?.id || "",
      rate: vo.rate ?? "",
      customerName: vo.customer?.customerName || "",
    }));

    const rows = vo.fgTransferSlipDetailsResponseDTO || [];
    if (rows.length) {
      setTransferDetailRows(
        rows.map((r) => ({
          itemCode: r.item?.id || "",
          itemDescription: r.item?.itemDescription || "",
          unit: r.unit?.id || "",
          unitLabel: r.unit?.unitId || "",
          bomQty: r.bomQty ?? "",
          availableStock: r.availableStock ?? "",
          consumptionAsPerBom: r.consumptionAsPerBom ?? "",
          wastageQty: r.wastageQty ?? "",
          consumedQty: r.consumedQty ?? "",
          rate: r.rate ?? "",
          value: r.value ?? "",
          scrapId: r.scrap?.id || "",
          scrapQty: r.scrapQty ?? "",
          scrapUnit: r.scrapUnit?.id || "",
          scrapTotal: r.scrapTotal ?? "",
        }))
      );
    }

    setTransferSummary((prev) => ({
      ...prev,
      totalQty: vo.totalQty ?? "",
      remarks: vo.remarks || "",
    }));
  }, []);

  const loadTransferSlipById = useCallback(
    async (id) => {
      if (!id) return;
      setLoading(true);
      try {
        const vo = await fgTransferSlipAPI.getById(id);
        if (!vo) {
          addToast("Failed to load FG Transfer Slip", "error");
          return;
        }
        populateFormFromApi(vo);
      } catch (err) {
        console.error("Error loading FG transfer slip by id:", err);
        addToast("Failed to load FG Transfer Slip", "error");
      } finally {
        setLoading(false);
      }
    },
    [addToast, populateFormFromApi]
  );

  /* Auto-generate Doc ID for new records */
  useEffect(() => {
    if (isEditMode || !ORG_ID) return;
    let cancelled = false;
    const generateDocId = async () => {
      setGeneratingDocId(true);
      try {
        const docId = await fgTransferSlipAPI.getFgTransferSlipDocId(
          ORG_ID,
          financialYear
        );
        if (!cancelled && docId) {
          setHeader((prev) => ({ ...prev, transferNo: docId }));
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to generate Transfer No:", err);
          addToast("Failed to generate Transfer No", "error");
        }
      } finally {
        if (!cancelled) setGeneratingDocId(false);
      }
    };
    generateDocId();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, ORG_ID]);

  useEffect(() => {
    loadPlants();
    loadBelongsTo();
    loadLocations();
    loadFgItems();
    loadSchedules();
    loadCustomers();
    loadScrapItems();
    loadUnits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (header.fgItemCode) {
      loadBomOptions(header.fgItemCode);
    } else {
      setBomOptions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [header.fgItemCode]);

  useEffect(() => {
    if (header.bomId) {
      loadBomDetailOptions(header.bomId);
    } else {
      setBomDetailOptions([]);
      setBomDetailMap({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [header.bomId]);

  /* Load by id on edit */
  useEffect(() => {
    if (isEditMode && editData?.id) {
      loadTransferSlipById(editData.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, editData?.id]);

  /* Recompute consumptionAsPerBom for all rows when scheduledQty changes */
  useEffect(() => {
    const scheduled = toNum(header.scheduledQty);
    if (scheduled === 0) return;

    setTransferDetailRows((prev) =>
      prev.map((row) => {
        const bomQty = toNum(row.bomQty);
        const consumptionAsPerBom = round2(scheduled * bomQty);

        const wastage = toNum(row.wastageQty);
        const rate = toNum(row.rate);
        const scrapQty = toNum(row.scrapQty);

        const consumedQty = round2(consumptionAsPerBom + wastage);
        return {
          ...row,
          consumptionAsPerBom,
          consumedQty,
          value: round2(consumedQty * rate),
          scrapTotal: round2(scrapQty * rate),
        };
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [header.scheduledQty]);

  /* Auto-calculate Total Qty whenever transfer rows change */
  const computedTotalQty = useMemo(
    () =>
      transferDetailRows.reduce(
        (sum, r) => sum + toNum(r.consumedQty),
        0
      ),
    [transferDetailRows]
  );

  useEffect(() => {
    setTransferSummary((prev) => {
      const nextVal = String(round2(computedTotalQty));
      if (String(prev.totalQty ?? "") === nextVal) return prev;
      return { ...prev, totalQty: nextVal };
    });
  }, [computedTotalQty]);

  /* ------------------------------------------------------------------ */
  /* Header handlers                                                    */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));

    setHeader((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "fgItemCode") {
        const item = fgItemMap[value];
        next.itemDesc = item?.itemDescription || "";
        next.bomId = "";
        setTransferDetailRows([blankRowFromColumns(TRANSFER_DETAIL_COLUMNS)]);
      }

      if (name === "scheduleNo") {
        const sch = scheduleOptions.find(
          (s) => String(s.value) === String(value)
        );
        next.scheduledQty = sch?.scheduledQty ?? "";
        next.scheduleDate = sch?.docDate || "";
      }

      if (name === "customerCode") {
        const cust = customerMap[value];
        next.customerName = cust?.customerName || "";
      }

      return next;
    });
  };

  const handleTransferSummaryChange = (e) => {
    const { name, value } = e.target;
    if (name === "totalQty") return;
    setTransferSummary((prev) => ({ ...prev, [name]: value }));
  };

  /* ------------------------------------------------------------------ */
  /* Transfer Detail row handlers + calculations                        */

  const handleTransferCellChange = (idx, key, value, col) => {
    setTransferDetailRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        let next = { ...row, [key]: value };

        if (key === "itemCode") {
          const it = bomDetailMap[value];
          if (it) {
            next.itemDescription = it.itemDescription || "";
            next.unit = it.unitId || "";
            next.unitLabel = it.unitDescription || "";
            next.bomQty = it.qty ?? "";
          }
        }

        // Auto-compute Consumption As Per BOM = Scheduled Qty × BOM Qty
        const scheduledQty = toNum(header.scheduledQty);
        const bomQty = toNum(next.bomQty);
        next.consumptionAsPerBom = round2(scheduledQty * bomQty);

        const wastage = toNum(next.wastageQty);
        const rate = toNum(next.rate);
        const scrapQty = toNum(next.scrapQty);

        next.consumedQty = round2(toNum(next.consumptionAsPerBom) + wastage);
        next.value = round2(toNum(next.consumedQty) * rate);
        next.scrapTotal = round2(scrapQty * rate);

        return next;
      })
    );
  };

  const handleAddTransferRow = () =>
    setTransferDetailRows((prev) => [
      ...prev,
      blankRowFromColumns(TRANSFER_DETAIL_COLUMNS),
    ]);

  const handleRemoveTransferRow = (idx) =>
    setTransferDetailRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)
    );

  /* ------------------------------------------------------------------ */
  /* Inspection Detail row handlers                                     */

  const handleInspectionCellChange = (idx, key, value) => {
    setInspectionDetailRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        let next = { ...row, [key]: value };

        if (key === "itemCode") {
          const it =
            bomDetailMap[value] ||
            Object.values(fgItemMap).find(
              (f) => String(f.itemId) === String(value)
            );
          if (it) next.itemDescription = it.itemDescription || "";
        }

        return next;
      })
    );
  };

  const handleAddInspectionRow = () =>
    setInspectionDetailRows((prev) => [
      ...prev,
      blankRowFromColumns(INSPECTION_DETAIL_COLUMNS),
    ]);

  const handleRemoveInspectionRow = (idx) =>
    setInspectionDetailRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)
    );

  /* ------------------------------------------------------------------ */
  /* Validation & Save                                                  */

  const validate = () => {
    const errors = {};

    if (!header.plant) errors.plant = "Plant ID is required";
    if (!header.date) errors.date = "Date is required";
    if (!header.fgItemCode) errors.fgItemCode = "FG Item Code is required";
    if (!header.bomId) errors.bomId = "BOM ID is required";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      addToast("Please fix validation errors before saving", "error");
      return;
    }

    setIsSubmitting(true);

    const isActiveBoolean = (v) => {
      if (typeof v === "boolean") return v;
      if (typeof v === "string") return v.toLowerCase() === "active";
      return true;
    };

    // id only on update
    const payload = {
      active: isActiveBoolean(editData?.active),
      belongsTo: header.belongsTo || "",
      bom: parseInt(header.bomId) || 0,
      branch: BRANCH_ID,
      cancelRemarks: "",
      createdBy: localStorage.getItem("userName") || "SYSTEM",
      customer: parseInt(header.customerCode) || 0,
      fgItem: parseInt(header.fgItemCode) || 0,
      fgTransferSlipDetailsDTO: transferDetailRows
        .filter((r) => r.itemCode)
        .map((r) => ({
          availableStock: toNum(r.availableStock),
          bomQty: toNum(r.bomQty),
          item: parseInt(r.itemCode) || 0,
          rate: toNum(r.rate),
          scrap: parseInt(r.scrapId) || 0,
          scrapQty: toNum(r.scrapQty),
          scrapUnit: parseInt(r.scrapUnit) || 0,
          unit: parseInt(r.unit) || 0,
          wastageQty: toNum(r.wastageQty),
        })),
      financialYear,
      fromLocation: parseInt(header.fromLocation) || 0,
      ...(editData?.id ? { id: parseInt(editData.id) } : {}),
      orgId: ORG_ID,
      qtyForInspection: toNum(header.qtyForInspection),
      rate: toNum(header.rate),
      remarks: transferSummary?.remarks || "",
      scheduleDate: header.scheduleDate || "",
      scheduleNo: header.scheduleNo || "",
      scheduledQty: toNum(header.scheduledQty),
      scrapLocation: parseInt(header.scrapLocation) || 0,
      toLocation: parseInt(header.toLocation) || 0,
      transferDate: header.date || todayISO(),
      transferNo: header.transferNo || "",
    };

    console.log("📤 Saving FG Transfer Slip Payload:", payload);

    try {
      const response =
        await fgTransferSlipAPI.createUpdateFgTransferSlip(payload);
      console.log("📥 Response:", response);

      const status =
        response?.status === true ||
        response?.statusFlag === "Ok" ||
        response?.success === true;

      if (status) {
        addToast(
          editData?.id
            ? "FG Transfer Slip updated successfully!"
            : "FG Transfer Slip created successfully!",
          "success"
        );
        if (onSave) onSave(payload);
        else onBack?.();
      } else {
        addToast(
          response?.paramObjectsMap?.message ||
          response?.paramObjectsMap?.errorMessage ||
          response?.message ||
          "Failed to save FG Transfer Slip",
          "error"
        );
      }
    } catch (error) {
      console.error("❌ Save Error:", error);
      addToast(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save FG Transfer Slip.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /* Runtime config — inject options into descriptors                   */

  const runtimeHeaderFields = HEADER_FIELDS.map((f) => {
    if (f.name === "plant") return { ...f, options: plantOptions };
    if (f.name === "belongsTo") return { ...f, options: belongsToOptions };
    if (
      f.name === "fromLocation" ||
      f.name === "toLocation" ||
      f.name === "scrapLocation"
    )
      return { ...f, options: locationOptions };
    if (f.name === "fgItemCode") return { ...f, options: fgItemOptions };
    if (f.name === "bomId") return { ...f, options: bomOptions };
    if (f.name === "scheduleNo") return { ...f, options: scheduleOptions };
    if (f.name === "customerCode") return { ...f, options: customerOptions };
    return f;
  });

  const runtimeTransferColumns = TRANSFER_DETAIL_COLUMNS.map((c) => {
    if (c.key === "itemCode")
      return { ...c, options: bomDetailOptions.length ? bomDetailOptions : [] };
    if (c.key === "scrapId") return { ...c, options: scrapOptions };
    if (c.key === "scrapUnit") return { ...c, options: unitOptions };
    return c;
  });

  const runtimeInspectionColumns = INSPECTION_DETAIL_COLUMNS.map((c) => {
    if (c.key === "itemCode")
      return { ...c, options: bomDetailOptions.length ? bomDetailOptions : [] };
    return c;
  });

  const activeTabMeta = CHILD_TABS.find((t) => t.key === activeChildTab);

  /* ------------------------------------------------------------------ */
  /* Render                                                             */

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">
          Loading FG Transfer Slip…
        </div>
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
          {editData ? "Edit FG Transfer Slip" : "FG Transfer Slip Entry"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* Header Fields */}
        <div>
          <SectionHeader>Transfer Slip Details</SectionHeader>
          <FieldsGrid
            fields={runtimeHeaderFields}
            values={header}
            onChange={handleHeaderChange}
            errors={fieldErrors}
          />
          {generatingDocId && (
            <p className="text-[11px] text-blue-500 mt-1">
              Generating Transfer No…
            </p>
          )}
        </div>

        {/* Child Tabs */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-0">
            <div className="flex overflow-x-auto">
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

            {activeTabMeta?.type === "table" && (
              <button
                type="button"
                onClick={() => {
                  if (activeChildTab === "transferDetails")
                    handleAddTransferRow();
                  else if (activeChildTab === "inspectionDetails")
                    handleAddInspectionRow();
                }}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {activeChildTab === "transferDetails" && (
            <DynamicTable
              columns={runtimeTransferColumns}
              rows={transferDetailRows}
              onCellChange={handleTransferCellChange}
              onRemoveRow={handleRemoveTransferRow}
            />
          )}

          {activeChildTab === "transferSummary" && (
            <div className="pt-3">
              <FieldsGrid
                fields={TRANSFER_SUMMARY_FIELDS}
                values={transferSummary}
                onChange={handleTransferSummaryChange}
              />
            </div>
          )}
        </section>

        <FormButtons
          onCancel={onBack}
          onSave={handleSave}
          isSubmitting={isSubmitting}
          saveLabel={editData ? "Update" : "Save"}
        />
      </div>
    </div>
  );
};

export default FGTransferSlipForm;
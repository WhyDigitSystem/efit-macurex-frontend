import { ArrowLeft, Save, X, Plus, Trash2, Search, Check } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "../../Toast/ToastContext";
import despatchInstructionAPI from "../../../api/Sales/despatchInstructionAPI";
import branchAPI from "../../../api/branchAPI";
import partyMasterAPI from "../../../api/partyMasterAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import itemAPI from "../../../api/itemAPI";
import unitMasterAPI from "../../../api/unitAPI";

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

const cellTextareaClasses =
  "w-full h-8 px-2 py-[10px] rounded border text-xs leading-none transition-colors overflow-y-auto resize-none scrollbar-hide " +
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
  "grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-x-4 gap-y-3 items-start";

const subTabFieldGrid =
  "grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-x-5 gap-y-4 items-start";

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
          rows={1}
          className={
            "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors resize-none pt-1 scrollbar-hide " +
            "bg-white dark:bg-gray-900 " +
            `${error ? controlErrClasses : "border-gray-300 dark:border-gray-600"} ` +
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
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs whitespace-nowrap border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <X className="h-3 w-3" />
      Cancel
    </button>

    <button
      onClick={onSave}
      disabled={isSubmitting}
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs whitespace-nowrap text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <Save className="h-3 w-3" />
      {isSubmitting ? "Saving..." : saveLabel}
    </button>
  </div>
);

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
        className={`h-6 w-6 rounded text-white flex items-center justify-center ${disabled
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
          }`}
      >
        <Trash2 size={12} />
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

            if (col.type === "textarea") {
              return (
                <td className="p-2 align-top" key={col.key}>
                  <textarea
                    value={row[col.key]}
                    rows={1}
                    readOnly={col.readOnly}
                    onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                    className={
                      col.readOnly ? cellReadOnlyClasses : cellTextareaClasses
                    }
                  />
                </td>
              );
            }

            return (
              <td className="p-2 align-top" key={col.key}>
                <input
                  type={col.type === "number" ? "number" : col.type === "date" ? "date" : "text"}
                  value={row[col.key] || ""}
                  readOnly={col.readOnly}
                  onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                  className={
                    col.readOnly ? cellReadOnlyClasses : cellInputClasses
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

const FillGridModal = ({ isOpen, onClose, items, onSelectItems }) => {
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedItems([]);
    }
  }, [isOpen]);

  const handleToggleSelect = (item) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(i =>
        (i.itemId || i.id) === (item.itemId || item.id)
      );
      if (isSelected) {
        return prev.filter(i =>
          (i.itemId || i.id) !== (item.itemId || item.id)
        );
      } else {
        return [...prev, item];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems([...items]);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedItems.length > 0) {
      onSelectItems(selectedItems);
      setSelectedItems([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-75">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-5xl w-full max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Select Items
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <TableWrapper>
            <TableHead headers={["#", "Select", "Item Code", "Item Description", "Unit", "SO No"]} />
            <tbody>
              {items.map((item, idx) => {
                const isSelected = selectedItems.some(i =>
                  (i.itemId || i.id) === (item.itemId || item.id)
                );
                return (
                  <tr
                    key={idx}
                    className={`border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                  >
                    <td className="p-2 text-center text-gray-900 dark:text-gray-100">{idx + 1}</td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => handleToggleSelect(item)}
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected
                          ? 'bg-blue-600 border-blue-600 hover:bg-blue-700'
                          : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500 hover:border-blue-500'
                          }`}
                      >
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </button>
                    </td>
                    <td className="p-2 text-gray-900 dark:text-gray-100">{item.itemCode || item.itemId || item.id}</td>
                    <td className="p-2 text-gray-900 dark:text-gray-100">{item.itemDescription}</td>
                    <td className="p-2 text-gray-900 dark:text-gray-100">{item.unit}</td>
                    <td className="p-2 text-gray-900 dark:text-gray-100">{item.soNoContractNo || item.soNo}</td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No items available
                  </td>
                </tr>
              )}
            </tbody>
          </TableWrapper>
        </div>
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAll}
              className="px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            >
              {selectedItems.length === items.length ? 'Deselect All' : 'Select All'}
            </button>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmSelection}
              disabled={selectedItems.length === 0}
              className={`px-4 py-1.5 text-xs text-white rounded transition-colors ${selectedItems.length > 0
                ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500'
                : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                }`}
            >
              Add Selected ({selectedItems.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MODE_OF_TRANSPORT = ["By Air", "By Express", "By Road", "By Train"];
const PACKAGE_TYPES = ["Carton Box", "Wooden Box", "Pallet", "Crate", "Drum"];

const CHILD_TABS = [
  { key: "dispatchDetails", label: "Dispatch Details", kind: "table" },
  { key: "termsConditions", label: "Terms and Conditions", kind: "fields" },
];

const emptyDispatchItemRow = () => ({
  id: null,
  ordAccpContrNo: "",
  orderAccepCustomerContractNo: "",
  date: "",
  item: "",
  itemCode: "",
  itemDescription: "",
  pdiNo: "",
  pdiDate: "",
  schduleMonth: "",
  scheduleMonthName: "",
  pendingQty: "",
  availableQty: "",
  plannedQty: "",
  descQty: "",
  noOfPackage: "",
  packageType: "",
  unit: "",
});

const emptyTermsConditions = () => ({
  term: "",
  description: "",
  applicable: "",
  remarks: "",
});

const todayStr = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const autoDispatchNo = () =>
  `DI-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;

/* ---------------------------------------------------------------------------- */

const DispatchForm = ({ data, onBack }) => {
  const [orgId] = useState(Number(localStorage.getItem("orgId")) || 0);
  const [branchId] = useState(Number(localStorage.getItem("branchId")) || 0);
  const { addToast } = useToast();

  const [activeChildTab, setActiveChildTab] = useState("dispatchDetails");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Modal state
  const [isFillGridModalOpen, setIsFillGridModalOpen] = useState(false);
  const [fillGridItems, setFillGridItems] = useState([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

  const [plantOptions, setPlantOptions] = useState([]);
  const [partyOptions, setPartyOptions] = useState([]);
  const [scheduleOptions, setScheduleOptions] = useState([]);
  const [scheduleMap, setScheduleMap] = useState({});
  const [partyMap, setPartyMap] = useState({});
  const [locationOptions, setLocationOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [itemMap, setItemMap] = useState({});
  const [unitOptions, setUnitOptions] = useState([]);
  const [orderContractOptions, setOrderContractOptions] = useState([]);
  const [orderContractMap, setOrderContractMap] = useState({});
  const [scheduleMonthOptions, setScheduleMonthOptions] = useState([]);
  const [scheduleMonthMap, setScheduleMonthMap] = useState({});

  // Store the original values from API for editing
  const [originalScheduleNo, setOriginalScheduleNo] = useState("");
  const [originalLocation, setOriginalLocation] = useState("");
  const [originalOrderContracts, setOriginalOrderContracts] = useState([]);

  const [header, setHeader] = useState(() => ({
    branch: data?.branch?.id ?? data?.branch ?? "",
    diNo: data?.docId || data?.diNo || (data ? "" : autoDispatchNo()),
    customer: data?.customer?.id ?? data?.customer ?? "",
    partyName: data?.customer?.customerName ?? data?.customerName ?? "",
    schduleNo: data?.schduleNo || data?.scheduleNo || "",
    schduleDate: data?.schduleDate || data?.schDate || todayStr(),
    location: data?.location?.id ?? data?.location ?? "",
    modeOfTransport: data?.modeOfTransport || "",
    netWeight: data?.netWeight ?? "",
    grossWeight: data?.grossWeight ?? "",
    consignee: data?.consignee || "",
    paymentTerms: data?.paymentTerms || "",
    deliveryInstructions: data?.deliveryInstructions || "",
    invoiceType: data?.invoiceType || "",
    cancelRemarks: data?.cancelRemarks || "",
    active: data?.active !== false,
    scheduleId: data?.schduleNo || data?.scheduleId || "",
    selectedScheduleId: data?.schduleNo || data?.scheduleId || "",
    docDate: data?.docDate || todayStr(),
  }));

  // Store original values when data is provided
  useEffect(() => {
    if (data) {
      setOriginalScheduleNo(data?.schduleNo || "");
      setOriginalLocation(data?.location?.id ?? data?.location ?? "");
      if (data?.despatchInstDetailsResponseDTO) {
        setOriginalOrderContracts(
          data.despatchInstDetailsResponseDTO.map(d => d.ordAccpContrNo || "")
        );
      }
    }
  }, [data]);

  const [dispatchItemRows, setDispatchItemRows] = useState(
    data?.despatchInstDetailsResponseDTO?.length || data?.despatchInstructionDetailsDTO?.length
      ? (data?.despatchInstDetailsResponseDTO || data?.despatchInstructionDetailsDTO || []).map((d) => ({
        ...emptyDispatchItemRow(),
        ...d,
        item: d.item?.id || d.item || "",
        itemDescription: d.item?.itemDescription || d.itemDescription || "",
        itemCode: d.item?.itemCode || "",
        schduleMonth: d.schduleMonth || "",
        scheduleMonthName: d.schduleMonth || "",
        ordAccpContrNo: d.ordAccpContrNo || "",
        orderAccepCustomerContractNo: d.ordAccpContrNo || "",
        pdiDate: d.pdiDate || todayStr(),
        pendingQty: d.pendingQty || "",
        availableQty: d.availableQty || "",
        plannedQty: d.plannedQty || "",
        descQty: d.descQty || "",
        noOfPackage: d.noOfPackage || "",
        packageType: d.packageType || "",
        unit: d.unit?.id || d.unit || "",
      }))
      : [{ ...emptyDispatchItemRow(), pdiDate: todayStr() }],
  );

  const [termsConditions, setTermsConditions] = useState({
    ...emptyTermsConditions(),
    ...data?.termsConditions,
  });

  /* ---------------- Lookup loading ---------------- */

  const loadPlants = useCallback(async () => {
    try {
      const res = await branchAPI.getBranchByOrgId(orgId);
      setPlantOptions(
        (res || []).map((b) => ({
          value: b.id,
          label: b.branchName || b.branchCode || b.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load plant options:", error);
      setPlantOptions([]);
    }
  }, [orgId]);

  const loadParties = useCallback(async () => {
    try {
      const res = await partyMasterAPI.getPartyByOrgId(orgId, branchId);
      const map = {};
      const opts = (res || []).map((c) => {
        map[c.id] = c;
        return { value: c.id, label: c.vendorCode || c.docId || c.id };
      });
      setPartyOptions(opts);
      setPartyMap(map);
    } catch (error) {
      console.error("Failed to load party options:", error);
      setPartyOptions([]);
      setPartyMap({});
    }
  }, [orgId, branchId]);

  const loadLocations = useCallback(async () => {
    try {
      const res = await locationMasterAPI.getLocationMasterByOrgId(
        orgId,
        branchId,
      );
      setLocationOptions(
        (res || []).map((l) => ({
          value: l.id,
          label: l.locationName || l.locationCode || l.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load location options:", error);
      setLocationOptions([]);
    }
  }, [orgId, branchId]);

  const loadItems = useCallback(async () => {
    try {
      const res = await itemAPI.getItems(orgId, branchId);
      const map = {};
      const opts = (res || []).map((it) => {
        map[it.id] = it;
        return { value: it.id, label: it.itemCode || it.id };
      });
      setItemOptions(opts);
      setItemMap(map);
    } catch (error) {
      console.error("Failed to load item options:", error);
      setItemOptions([]);
      setItemMap({});
    }
  }, [orgId, branchId]);

  const loadUnits = useCallback(async () => {
    try {
      const res = await unitMasterAPI.getUnits(branchId, orgId);
      setUnitOptions(
        (res || []).map((u) => ({
          value: u.id,
          label: u.unitName || u.unitId || u.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load unit options:", error);
      setUnitOptions([]);
    }
  }, [orgId, branchId]);

  const loadScheduleMonths = useCallback(
    async (branchId, dlvNo, itemId, rowIndex, existingMonth = "") => {
      if (!branchId || !dlvNo || !itemId) {
        return;
      }

      try {
        console.log("Calling Schedule Month API with:", {
          branchId,
          dlvNo,
          itemId,
          orgId,
          existingMonth,
        });

        const response = await despatchInstructionAPI.getScheduleMonth(
          branchId,
          dlvNo,
          itemId,
          orgId
        );

        console.log("Schedule Month Response:", response);

        if (response && response.status) {
          const months =
            response.paramObjectsMap?.scheduleMonthList || [];

          const map = {};

          const opts = months.map((m) => {
            const value = String(m.id);
            const label = m.monthOfSchedule || m.id;

            map[value] = {
              ...m,
              monthOfSchedule: label,
            };

            return {
              value,
              label,
            };
          });

          setScheduleMonthOptions(opts);
          setScheduleMonthMap(map);

          // ------------------------------------------
          // EDIT MODE - Restore existing month
          // ------------------------------------------
          if (rowIndex !== undefined && existingMonth) {
            const existingMonthValue = String(existingMonth);

            const matchingOpt = opts.find(
              (opt) =>
                String(opt.label) === existingMonthValue ||
                String(opt.value) === existingMonthValue
            );

            console.log("Existing Month:", existingMonth);
            console.log("Matching Month:", matchingOpt);

            if (matchingOpt) {
              setDispatchItemRows((prev) =>
                prev.map((row, idx) => {
                  if (idx !== rowIndex) return row;

                  return {
                    ...row,
                    schduleMonth: matchingOpt.value,
                    scheduleMonthName: matchingOpt.label,
                  };
                })
              );
            }
          }
        } else {
          setScheduleMonthOptions([]);
          setScheduleMonthMap({});
        }
      } catch (error) {
        console.error("Failed to load schedule months:", error);
        setScheduleMonthOptions([]);
        setScheduleMonthMap({});
      }
    },
    [orgId]
  );

  // Load Planned Quantity
  const loadPlannedQty = useCallback(
    async (branchId, itemId, rowIndex) => {
      if (!branchId || !itemId) {
        return;
      }

      try {
        console.log("Calling Planned Quantity API with:", {
          branchId,
          itemId,
          orgId,
        });

        const response = await despatchInstructionAPI.getPlannedQty(
          branchId,
          itemId,
          orgId
        );

        console.log("Planned Quantity Response:", response);

        if (response && response.status) {
          const plannedQty = response.paramObjectsMap?.plannedQty || 0;

          if (rowIndex !== undefined) {
            setDispatchItemRows((prev) =>
              prev.map((row, idx) => {
                if (idx === rowIndex) {
                  return {
                    ...row,
                    plannedQty: plannedQty,
                  };
                }
                return row;
              })
            );
          }
        }
      } catch (error) {
        console.error("Failed to load planned quantity:", error);
      }
    },
    [orgId]
  );

  // Load order/contract numbers when schedule is selected
  const loadOrderContracts = useCallback(async (customerId, branchId, scheduleId) => {
    if (!customerId || !branchId || !scheduleId) {
      setOrderContractOptions([]);
      setOrderContractMap({});
      return;
    }

    try {
      console.log("Calling Order Contract API with:", { customerId, branchId, scheduleId, orgId });

      const response = await despatchInstructionAPI.getOrderAndSalesContractDropdown(
        branchId,
        customerId,
        orgId
      );

      console.log("Order Contract Response:", response);

      if (response && response.status) {
        const contracts = response.paramObjectsMap?.salesContractList || [];
        const map = {};
        const opts = contracts.map((c) => {
          map[c.id] = c;
          return {
            value: c.id,
            label: c.orderAccepCustomerContractNo || c.id,
            date: c.date,
          };
        });

        // Add original order contracts if they don't exist in options
        originalOrderContracts.forEach(contractNo => {
          if (contractNo) {
            const exists = opts.some(opt => opt.label === contractNo || opt.value === contractNo);
            if (!exists) {
              const newId = `existing-${contractNo}`;
              map[newId] = {
                id: newId,
                orderAccepCustomerContractNo: contractNo,
                date: null,
              };
              opts.push({
                value: newId,
                label: contractNo,
                date: null,
              });
            }
          }
        });

        setOrderContractOptions(opts);
        setOrderContractMap(map);

        // Update rows to match the correct contract IDs
        setDispatchItemRows((prev) =>
          prev.map((row) => {
            if (row.orderAccepCustomerContractNo) {
              const matchingOpt = opts.find(opt =>
                opt.label === row.orderAccepCustomerContractNo ||
                opt.value === row.orderAccepCustomerContractNo
              );
              if (matchingOpt) {
                return {
                  ...row,
                  ordAccpContrNo: matchingOpt.value,
                };
              }
            }
            return row;
          })
        );
      } else {
        setOrderContractOptions([]);
        setOrderContractMap({});
      }
    } catch (error) {
      console.error("Failed to load order contracts:", error);
      setOrderContractOptions([]);
      setOrderContractMap({});
    }
  }, [orgId, originalOrderContracts]);

  // Load fill grid items
  const loadFillGridItems = useCallback(async (branchId, customerId, scheduleId) => {
    if (!branchId || !customerId || !scheduleId) {
      setFillGridItems([]);
      return;
    }

    try {
      console.log("Calling Fill Grid API with:", { branchId, customerId, scheduleId, orgId });

      const response = await despatchInstructionAPI.getFillGridItems(
        branchId,
        customerId,
        orgId,
        scheduleId
      );

      console.log("Fill Grid Response:", response);

      if (response && response.status) {
        const items = response.paramObjectsMap?.itemList || [];
        setFillGridItems(items);
      } else {
        setFillGridItems([]);
      }
    } catch (error) {
      console.error("Failed to load fill grid items:", error);
      setFillGridItems([]);
    }
  }, [orgId]);

  // Load schedule options when customer is selected
  const loadSchedules = useCallback(async (customerId, branchId, monthYear) => {
    if (!customerId || !branchId || !monthYear) {
      setScheduleOptions([]);
      return;
    }

    try {
      console.log("Calling Schedule API with:", { customerId, branchId, monthYear, orgId });

      const response = await despatchInstructionAPI.getScheduleNoDropdownForDespatchInstruction(
        branchId,
        customerId,
        monthYear,
        orgId
      );

      console.log("Schedule Response:", response);

      if (response && response.status) {
        const schedules = response.paramObjectsMap?.scheduleBalanceList || [];
        const map = {};
        const opts = schedules.map((s) => {
          map[s.salesDeliveryScheduleId] = s;
          return {
            value: s.salesDeliveryScheduleId,
            label: s.dlvNo,
          };
        });

        // Add original schedule if it doesn't exist in options
        if (originalScheduleNo) {
          const exists = opts.some(opt => opt.label === originalScheduleNo || opt.value === originalScheduleNo);
          if (!exists) {
            const newId = `existing-${originalScheduleNo}`;
            map[newId] = {
              salesDeliveryScheduleId: newId,
              dlvNo: originalScheduleNo,
            };
            opts.push({
              value: newId,
              label: originalScheduleNo,
            });
          }
        }

        setScheduleOptions(opts);
        setScheduleMap(map);

        // If we have a schedule value, try to find the matching option
        if (originalScheduleNo) {
          const matchingOpt = opts.find(opt =>
            opt.label === originalScheduleNo || opt.value === originalScheduleNo
          );
          if (matchingOpt) {
            setHeader((prev) => ({
              ...prev,
              schduleNo: matchingOpt.value,
              scheduleId: matchingOpt.value,
              selectedScheduleId: matchingOpt.value,
            }));
          }
        }
      } else {
        setScheduleOptions([]);
        setScheduleMap({});
      }
    } catch (error) {
      console.error("Failed to load schedule options:", error);
      setScheduleOptions([]);
      setScheduleMap({});
    }
  }, [orgId, originalScheduleNo]);

  useEffect(() => {
    if (header.customer && header.branch && header.schduleDate) {
      const date = new Date(header.schduleDate);
      const monthYear = `${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;

      loadSchedules(header.customer, header.branch, monthYear);
    } else {
      setScheduleOptions([]);
      setScheduleMap({});
    }
  }, [header.customer, header.branch, header.schduleDate, loadSchedules]);

  useEffect(() => {
    if (header.selectedScheduleId && header.customer && header.branch) {
      loadOrderContracts(header.customer, header.branch, header.selectedScheduleId);
    } else {
      setOrderContractOptions([]);
      setOrderContractMap({});
    }
  }, [header.selectedScheduleId, header.customer, header.branch, loadOrderContracts]);

  useEffect(() => {
    if (orgId) {
      loadPlants();
      loadParties();
      loadLocations();
      loadItems();
      loadUnits();
    }
  }, [orgId, loadPlants, loadParties, loadLocations, loadItems, loadUnits]);

  useEffect(() => {
    if (
      !data ||
      !header.schduleNo ||
      !header.branch ||
      !dispatchItemRows?.length
    ) {
      return;
    }

    const scheduleData = scheduleMap[header.schduleNo];

    if (!scheduleData?.dlvNo) {
      return;
    }

    dispatchItemRows.forEach((row, index) => {
      if (!row.item) return;

      loadScheduleMonths(
        header.branch,
        scheduleData.dlvNo,
        row.item,
        index,
        row.schduleMonth
      );
    });
  }, [
    data,
    header.schduleNo,
    header.branch,
    scheduleMap,
    dispatchItemRows.map((r) => r.item).join(","),
    loadScheduleMonths,
  ]);

  /* ---------------- Handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "customer") {
        const customerObj = partyMap[value];
        if (customerObj) {
          next.customer = value;
          next.partyName = customerObj.customerName || "";
        } else {
          next.customer = value;
          next.partyName = "";
        }
      }

      if (name === "schduleNo") {
        const scheduleData = scheduleMap[value];
        if (scheduleData) {
          if (scheduleData.dlvdate) {
            next.schduleDate = scheduleData.dlvdate;
          }
          if (scheduleData.invoiceType) {
            next.invoiceType = scheduleData.invoiceType;
          }
          next.scheduleId = value;
          next.selectedScheduleId = value;
        }
      }

      return next;
    });
  };

  const handleOrderContractChange = (e, rowIndex) => {
    const { name, value } = e.target;
    const contractData = orderContractMap[value];

    setDispatchItemRows((prev) =>
      prev.map((row, idx) => {
        if (idx !== rowIndex) return row;
        return {
          ...row,
          [name]: value,
          orderAccepCustomerContractNo: contractData?.orderAccepCustomerContractNo || "",
          date: contractData?.date || row.date || "",
        };
      })
    );

    // Open Fill Grid
    if (name === "ordAccpContrNo" && value) {
      if (header.customer && header.selectedScheduleId) {
        loadFillGridItems(header.branch, header.customer, header.selectedScheduleId);
        setSelectedRowIndex(rowIndex);
        setIsFillGridModalOpen(true);
      } else {
        addToast("Please select a schedule first");
      }
    }
  };

  const handleSelectFillGridItems = (selectedItems) => {
    if (selectedRowIndex === null) return;

    const currentRow = dispatchItemRows[selectedRowIndex];
    const selectedContract = orderContractMap[currentRow.ordAccpContrNo];
    const contractNo = selectedContract?.orderAccepCustomerContractNo ||
      currentRow.orderAccepCustomerContractNo ||
      currentRow.ordAccpContrNo || "";

    const newRows = selectedItems.map((item, index) => {
      const itemId = item.itemId || item.id;
      const itemCode = item.itemCode || "";
      const itemDescription = item.itemDescription || "";
      const unit = item.unit || "";

      if (index === 0) {
        return {
          ...currentRow,
          ordAccpContrNo: currentRow.ordAccpContrNo,
          orderAccepCustomerContractNo: contractNo,
          item: itemId,
          itemCode: itemCode,
          itemDescription: itemDescription,
          unit: unit,
          date: currentRow.date || selectedContract?.date || "",
        };
      }

      return {
        ...emptyDispatchItemRow(),
        ordAccpContrNo: currentRow.ordAccpContrNo,
        orderAccepCustomerContractNo: contractNo,
        item: itemId,
        itemCode: itemCode,
        itemDescription: itemDescription,
        unit: unit,
        date: currentRow.date || selectedContract?.date || "",
        pdiDate: todayStr(),
      };
    });

    setDispatchItemRows((prev) => {
      const updated = [...prev];
      if (newRows.length > 0) {
        updated[selectedRowIndex] = newRows[0];
        if (newRows.length > 1) {
          updated.splice(selectedRowIndex + 1, 0, ...newRows.slice(1));
        }
      }
      return updated;
    });

    // Load schedule months and planned quantity for the first selected item
    const firstItem = selectedItems[0];
    if (firstItem && header.schduleNo) {
      const scheduleData = scheduleMap[header.schduleNo];
      const dlvNo = scheduleData?.dlvNo;

      if (dlvNo) {
        loadScheduleMonths(
          header.branch,
          dlvNo,
          firstItem.itemId || firstItem.id,
          selectedRowIndex
        );
      }

      loadPlannedQty(
        header.branch,
        firstItem.itemId || firstItem.id,
        selectedRowIndex
      );
    }

    setIsFillGridModalOpen(false);
    setSelectedRowIndex(null);
  };

  const handleCellChange = (idx, key, value) => {
    if (key === "ordAccpContrNo") {
      handleOrderContractChange({ target: { name: key, value } }, idx);
      return;
    }

    if (key === "item" && value) {
      const customerId = header.customer;
      if (customerId && header.schduleNo) {
        const scheduleData = scheduleMap[header.schduleNo];
        const dlvNo = scheduleData?.dlvNo;

        if (dlvNo) {
          loadScheduleMonths(header.branch, dlvNo, value, idx);
        }

        loadPlannedQty(header.branch, value, idx);
      }
    }

    setDispatchItemRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        let next = { ...row, [key]: value };

        if (key === "item") {
          const item = itemMap[value];
          next.itemDescription = item?.itemDescription || "";
        }

        return next;
      })
    );
  };

  const handleAddRow = () =>
    setDispatchItemRows((prev) => [...prev, { ...emptyDispatchItemRow(), pdiDate: todayStr() }]);
  const handleRemoveRow = (idx) =>
    setDispatchItemRows((prev) => prev.filter((_, i) => i !== idx));

  /* ---------------- Validation & Save ---------------- */

  const validate = () => {
    const errors = {};

    if (!header.branch) errors.branch = "Plant is required";
    if (!header.customer) errors.customer = "Party is required";
    if (!header.schduleNo) errors.schduleNo = "Schedule Number is required";
    if (!header.schduleDate) errors.schduleDate = "Schedule Date is required";
    if (!header.location) errors.location = "From Location is required";
    if (!header.modeOfTransport)
      errors.modeOfTransport = "Mode of Transport is required";
    if (!header.invoiceType) errors.invoiceType = "Invoice Type is required";

    const hasValidRow = dispatchItemRows.some(
      (r) =>
        r.ordAccpContrNo &&
        r.date &&
        r.item &&
        r.schduleMonth &&
        Number(r.descQty) > 0 &&
        Number(r.noOfPackage) > 0,
    );
    if (!hasValidRow)
      errors.dispatchItems =
        "Add at least one item with Order Acceptance Contract No, Date, Item Code, Schedule Month, Dispatch Quantity and Number of Packages";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);

    const payload = {
      active: true,
      branch: Number(header.branch) || 0,
      cancelRemarks: header.cancelRemarks || "",
      consignee: header.consignee || "",
      createdBy: Number(localStorage.getItem("usersId")) || 0,
      customer: Number(header.customer) || 0,
      deliveryInstructions: header.deliveryInstructions || "",
      despatchInstructionDetailsDTO: dispatchItemRows
        .filter((r) => r.item && r.item !== "")
        .map((r) => {
          const contractData = orderContractMap[r.ordAccpContrNo];
          const monthData = scheduleMonthMap[r.schduleMonth];

          return {
            availableQty: Number(r.availableQty) || 0,
            date: r.date || "",
            descQty: Number(r.descQty) || 0,
            item: Number(r.item) || 0,
            noOfPackage: String(r.noOfPackage) || "",
            ordAccpContrNo: contractData?.orderAccepCustomerContractNo || r.orderAccepCustomerContractNo || r.ordAccpContrNo || "",
            packageType: r.packageType || "",
            pdi: r.pdi || "",
            pdiDate: r.pdiDate || "",
            pendingQty: Number(r.pendingQty) || 0,
            plannedQty: Number(r.plannedQty) || 0,
            schduleMonth: monthData?.monthOfSchedule || r.scheduleMonthName || r.schduleMonth || "",
            unit: Number(r.unit) || 0,
            ...(r.id ? { id: r.id } : {}),
          };
        }),
      grossWeight: Number(header.grossWeight) || 0,
      invoiceType: header.invoiceType || "",
      location: Number(header.location) || 0,
      modeOfTransport: header.modeOfTransport || "",
      netWeight: Number(header.netWeight) || 0,
      orgId: orgId,
      paymentTerms: header.paymentTerms || "",
      schduleDate: header.schduleDate || "",
      schduleNo: scheduleMap[header.schduleNo]?.dlvNo || header.schduleNo || "",
      ...(isUpdate ? { id: data.id } : {}),
      ...(isUpdate ? { updatedBy: Number(localStorage.getItem("usersId")) } : {}),
    };

    console.log("Saving payload:", JSON.stringify(payload, null, 2));

    try {
      const response = await despatchInstructionAPI.createUpdateDispatch(payload);

      console.log("Save response:", response);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
          (isUpdate
            ? "Dispatch Instruction updated successfully!"
            : "Dispatch Instruction created successfully!")
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
          response?.errors?.[0]?.longMessage ||
          response?.message ||
          "Failed to save Dispatch Instruction."
        );
      }
    } catch (err) {
      console.error("Save Dispatch Instruction Error:", err);
      if (err.response?.data) {
        addToast(
          err.response.data.message ||
          err.response.data.statusMessage ||
          err.response.data.error ||
          JSON.stringify(err.response.data)
        );
      } else {
        addToast("Something went wrong.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeTabMeta = CHILD_TABS.find((t) => t.key === activeChildTab);

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
          {data ? "Edit Dispatch Instruction" : "Add Dispatch Instruction"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Info ---------------- */}
        <div>
          <SectionHeader>Dispatch Instruction</SectionHeader>
          <div className={fieldGrid}>
            <Field
              type="select"
              label="Plant"
              name="branch"
              value={header.branch}
              onChange={handleHeaderChange}
              error={fieldErrors.branch}
              options={plantOptions}
              required
            />
            <Field
              label="DI Number"
              name="diNo"
              value={header.diNo}
              onChange={handleHeaderChange}
              required
              disabled={!data}
            />
            <Field
              type="date"
              label="Document Date"
              name="docDate"
              value={header.docDate}
              onChange={handleHeaderChange}
              error={fieldErrors.docDate}
            />
            <Field
              type="select"
              label="Party Code"
              name="customer"
              value={header.customer}
              onChange={handleHeaderChange}
              error={fieldErrors.customer}
              options={partyOptions}
              required
            />
            <Field
              label="Party Name"
              name="partyName"
              value={header.partyName}
              onChange={handleHeaderChange}
              disabled
            />
            <Field
              type="select"
              label="Schedule Number"
              name="schduleNo"
              value={header.schduleNo}
              options={scheduleOptions}
              onChange={handleHeaderChange}
              error={fieldErrors.schduleNo}
              required
            />
            <Field
              type="date"
              label="Schedule Date"
              name="schduleDate"
              value={header.schduleDate}
              onChange={handleHeaderChange}
              error={fieldErrors.schduleDate}
              required
            />
            <Field
              type="select"
              label="From Location"
              name="location"
              value={header.location}
              onChange={handleHeaderChange}
              error={fieldErrors.location}
              options={locationOptions}
              required
            />
            <Field
              label="Invoice Type"
              name="invoiceType"
              value={header.invoiceType}
              onChange={handleHeaderChange}
              error={fieldErrors.invoiceType}
              required
            />
          </div>
        </div>

        {/* ---------------- Child Tabs ---------------- */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          {/* Tabs */}
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

            {activeTabMeta.kind === "table" && (
              <button
                type="button"
                onClick={handleAddRow}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {/* Dispatch Details tab */}
          {activeChildTab === "dispatchDetails" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  {
                    key: "ordAccpContrNo",
                    label: "Order Acceptance Contract No",
                    required: true,
                    type: "select",
                    options: orderContractOptions,
                  },
                  { key: "date", label: "Date", type: "date", required: true },
                  {
                    key: "item",
                    label: "Item Code",
                    type: "select",
                    options: itemOptions,
                    required: true,
                  },
                  {
                    key: "itemDescription",
                    label: "Item Description",
                    readOnly: true,
                  },
                  {
                    key: "unit",
                    label: "Unit",
                    readOnly: true,
                  },
                  {
                    key: "pdiNo",
                    label: "PDI Number",
                  },
                  { key: "pdiDate", label: "PDI Date", type: "date" },
                  {
                    key: "schduleMonth",
                    label: "Schedule Month",
                    type: "select",
                    options: scheduleMonthOptions,
                    required: true,
                  },
                  {
                    key: "plannedQty",
                    label: "Planned Quantity",
                    type: "number",
                    readOnly: true,
                  },
                  {
                    key: "pendingQty",
                    label: "Pending Quantity",
                    type: "number",
                  },
                  {
                    key: "availableQty",
                    label: "Available Quantity",
                    type: "number",
                  },
                  {
                    key: "descQty",
                    label: "Dispatch Quantity",
                    type: "number",
                    required: true,
                  },
                  {
                    key: "noOfPackage",
                    label: "Number of Packages",
                    type: "number",
                    required: true,
                  },
                  {
                    key: "packageType",
                    label: "Package Type",
                  },
                ]}
                rows={dispatchItemRows}
                onCellChange={handleCellChange}
                onRemoveRow={handleRemoveRow}
              />
              {fieldErrors.dispatchItems && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.dispatchItems}
                </p>
              )}
            </div>
          )}

          {/* Terms and Conditions tab */}
          {activeChildTab === "termsConditions" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  label="Payment Terms"
                  name="paymentTerms"
                  value={header.paymentTerms}
                  onChange={handleHeaderChange}
                />
                <Field
                  type="select"
                  label="Mode of Transport"
                  name="modeOfTransport"
                  value={header.modeOfTransport}
                  onChange={handleHeaderChange}
                  error={fieldErrors.modeOfTransport}
                  options={MODE_OF_TRANSPORT}
                  required
                />
                <Field
                  type="number"
                  label="Net Weight"
                  name="netWeight"
                  value={header.netWeight}
                  onChange={handleHeaderChange}
                />
                <Field
                  type="number"
                  label="Gross Weight"
                  name="grossWeight"
                  value={header.grossWeight}
                  onChange={handleHeaderChange}
                />
                <Field
                  type="textarea"
                  label="Delivery Instructions"
                  name="deliveryInstructions"
                  value={header.deliveryInstructions}
                  onChange={handleHeaderChange}
                />
                <Field
                  label="Consignee"
                  name="consignee"
                  value={header.consignee}
                  onChange={handleHeaderChange}
                />
              </div>
            </div>
          )}
        </section>

        <FormButtons
          onCancel={onBack}
          onSave={handleSave}
          isSubmitting={isSubmitting}
          saveLabel={data ? "Update" : "Save"}
        />
      </div>

      {/* Fill Grid Modal - Enhanced with multi-select */}
      <FillGridModal
        isOpen={isFillGridModalOpen}
        onClose={() => {
          setIsFillGridModalOpen(false);
          setSelectedRowIndex(null);
        }}
        items={fillGridItems}
        onSelectItems={handleSelectFillGridItems}
      />
    </div>
  );
};

export default DispatchForm;
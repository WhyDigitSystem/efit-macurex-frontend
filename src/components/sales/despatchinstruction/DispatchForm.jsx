import { ArrowLeft, Save, X, Plus, Trash2, Search, Check } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "../../Toast/ToastContext";
import despatchInstructionAPI from "../../../api/Sales/despatchInstructionAPI";
import branchAPI from "../../../api/branchAPI";
import partyMasterAPI from "../../../api/partyMasterAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import itemAPI from "../../../api/itemAPI";
import unitMasterAPI from "../../../api/unitAPI";
import docTypeMappingAPI from "../../../api/docTypeMappingAPI";

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
        placeholder={placeholder}
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
                  type={
                    col.type === "number"
                      ? "number"
                      : col.type === "date"
                        ? "date"
                        : "text"
                  }
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
  unit: "",       // 👈 display string, e.g., "KG"
  unitId: 0,      // 👈 NEW — numeric id used in the payload
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

/* ---------------------------------------------------------------------------- */

const DispatchForm = ({ data, onBack }) => {
  const [orgId] = useState(Number(localStorage.getItem("orgId")) || 0);
  const [finYear] = useState(Number(localStorage.getItem("finYear")) || 0);
  const [branchId] = useState(Number(localStorage.getItem("branchId")) || 0);
  const { addToast } = useToast();

  const [activeChildTab, setActiveChildTab] = useState("dispatchDetails");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generatingDocId, setGeneratingDocId] = useState(false);

  // Modal state
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

  // 👇 Ref to remember the last (customer, branch, monthYear) tuple that
  //    triggered a schedule load. Prevents needless re-fetches when the user
  //    is actively selecting (which changes schduleDate via dlvdate).
  const lastScheduleFetchKeyRef = useRef("");

  const [header, setHeader] = useState(() => ({
    branch: data?.branch?.id ?? data?.branch ?? "",
    diNo: data?.docId || data?.diNo || "",
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
          data.despatchInstDetailsResponseDTO.map(
            (d) => d.ordAccpContrNo || "",
          ),
        );
      }
    }
  }, [data]);

  const [dispatchItemRows, setDispatchItemRows] = useState(
    data?.despatchInstDetailsResponseDTO?.length ||
      data?.despatchInstructionDetailsDTO?.length
      ? (
        data?.despatchInstDetailsResponseDTO ||
        data?.despatchInstructionDetailsDTO ||
        []
      ).map((d) => ({
        ...emptyDispatchItemRow(),
        ...d,
        item: d.item?.id || d.item || "",
        itemCode: d.item?.itemCode || "",
        itemDescription: d.item?.itemDescription || d.itemDescription || "",
        schduleMonth: d.schduleMonth || "",
        scheduleMonthName: d.schduleMonth || "",
        ordAccpContrNo: d.ordAccpContrNo || "",
        orderAccepCustomerContractNo: d.ordAccpContrNo || "",
        // 👇 FIX — read pdi from the API response and store as pdiNo
        pdiNo: d.pdi || d.pdiNo || "",
        pdiDate: d.pdiDate || todayStr(),
        pendingQty: d.pendingQty || "",
        availableQty: d.availableQty || "",
        plannedQty: d.plannedQty || "",
        descQty: d.descQty || "",
        noOfPackage: d.noOfPackage || "",
        packageType: d.packageType || "",
        unit:
          d.item?.unit?.unitId ||
          d.item?.unit?.primaryUnit ||
          d.item?.unit?.unitDescription ||
          d.unit?.primaryUnit ||
          d.unit?.unitId ||
          d.unit?.unitDescription ||
          (typeof d.unit === "string" ? d.unit : "") ||
          "",
        unitId: d.item?.unit?.id || d.unitId || d.unit?.id || 0,
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
        return { value: c.id, label: c.customerCode || c.docId || c.id };
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
        const id = String(it.id);                  // 👈 string key
        map[id] = {
          ...it,
          // 👇 normalise the unit into a string on the mapped object
          unitCode:
            it.primaryUnits?.primaryUnit ||
            it.sellingUnit?.primaryUnit ||
            it.purchaseUnit?.primaryUnit ||
            "",
          unitId:
            it.primaryUnits?.id ||
            it.sellingUnit?.id ||
            it.purchaseUnit?.id ||
            0,
        };
        return { value: id, label: it.itemCode || id };
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
        const response = await despatchInstructionAPI.getScheduleMonth(
          branchId,
          dlvNo,
          itemId,
          orgId,
        );

        if (response && response.status) {
          const months = response.paramObjectsMap?.scheduleMonthList || [];

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

          if (rowIndex !== undefined && existingMonth) {
            const existingMonthValue = String(existingMonth);

            const matchingOpt = opts.find(
              (opt) =>
                String(opt.label) === existingMonthValue ||
                String(opt.value) === existingMonthValue,
            );

            if (matchingOpt) {
              setDispatchItemRows((prev) =>
                prev.map((row, idx) => {
                  if (idx !== rowIndex) return row;

                  return {
                    ...row,
                    schduleMonth: matchingOpt.value,
                    scheduleMonthName: matchingOpt.label,
                  };
                }),
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
    [orgId],
  );

  const loadPlannedQty = useCallback(
    async (branchId, itemId, rowIndex) => {
      if (!branchId || !itemId) {
        return;
      }

      try {
        const response = await despatchInstructionAPI.getPlannedQty(
          branchId,
          itemId,
          orgId,
        );

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
              }),
            );
          }
        }
      } catch (error) {
        console.error("Failed to load planned quantity:", error);
      }
    },
    [orgId],
  );

  const loadOrderContracts = useCallback(
    async (customerId, branchId, scheduleId) => {
      if (!customerId || !branchId || !scheduleId) {
        setOrderContractOptions([]);
        setOrderContractMap({});
        return;
      }

      try {
        const response =
          await despatchInstructionAPI.getOrderAndSalesContractDropdown(
            branchId,
            customerId,
            orgId,
          );

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

          originalOrderContracts.forEach((contractNo) => {
            if (contractNo) {
              const exists = opts.some(
                (opt) =>
                  opt.label === contractNo || opt.value === contractNo,
              );
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

          setDispatchItemRows((prev) =>
            prev.map((row) => {
              if (row.orderAccepCustomerContractNo) {
                const matchingOpt = opts.find(
                  (opt) =>
                    opt.label === row.orderAccepCustomerContractNo ||
                    opt.value === row.orderAccepCustomerContractNo,
                );
                if (matchingOpt) {
                  return {
                    ...row,
                    ordAccpContrNo: matchingOpt.value,
                  };
                }
              }
              return row;
            }),
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
    },
    [orgId, originalOrderContracts],
  );

  const loadFillGridItems = useCallback(
    async (branchId, customerId, scheduleId) => {
      if (!branchId || !customerId || !scheduleId) {
        setFillGridItems([]);
        return;
      }

      try {
        const response = await despatchInstructionAPI.getFillGridItems(
          branchId,
          customerId,
          orgId,
          scheduleId,
        );

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
    },
    [orgId],
  );

  /**
   * 👇 loadSchedules now:
   *   1) Accepts the current schduleNo as a "preserve" parameter.
   *   2) Injects a synthetic option if the currently-selected value isn't in
   *      the response — so the <select> never goes blank after a re-fetch.
   *   3) Uses a ref to prevent duplicate fetches for the same (customer,
   *      branch, monthYear) tuple.
   */
  const loadSchedules = useCallback(
    async (customerId, branchIdParam, monthYear, preserveScheduleNo = "") => {
      if (!customerId || !branchIdParam || !monthYear) {
        setScheduleOptions([]);
        return;
      }

      const fetchKey = `${customerId}|${branchIdParam}|${monthYear}`;
      if (lastScheduleFetchKeyRef.current === fetchKey) {
        return; // already fetched for this tuple
      }
      lastScheduleFetchKeyRef.current = fetchKey;

      try {
        const response =
          await despatchInstructionAPI.getScheduleNoDropdownForDespatchInstruction(
            branchIdParam,
            customerId,
            monthYear,
            orgId,
          );

        if (response && response.status) {
          const schedules = response.paramObjectsMap?.scheduleBalanceList || [];
          const map = {};
          const opts = schedules.map((s) => {
            // 👇 Always key by string — the <select> emits strings
            const id = String(s.salesDeliveryScheduleId);
            map[id] = s;
            return {
              value: id,
              label: s.dlvNo,
            };
          });

          // 👇 Ensure currently-selected schedule is present in the list
          if (
            preserveScheduleNo &&
            !opts.some(
              (o) => String(o.value) === String(preserveScheduleNo),
            )
          ) {
            const existing = scheduleMap[preserveScheduleNo];
            const label = existing?.dlvNo || preserveScheduleNo;
            const value = String(preserveScheduleNo);
            map[value] = {
              ...(existing || {}),
              salesDeliveryScheduleId: value,
              dlvNo: label,
            };
            opts.push({ value, label });
          }

          // Edit mode: make sure originalScheduleNo is present too
          if (originalScheduleNo) {
            const exists = opts.some(
              (o) =>
                String(o.label) === String(originalScheduleNo) ||
                String(o.value) === String(originalScheduleNo),
            );
            if (!exists) {
              const newId = String(originalScheduleNo);
              map[newId] = {
                salesDeliveryScheduleId: newId,
                dlvNo: originalScheduleNo,
              };
              opts.push({ value: newId, label: originalScheduleNo });
            }
          }

          setScheduleOptions(opts);
          setScheduleMap(map);

          // Edit mode: bind header.schduleNo to the matching option value
          if (originalScheduleNo) {
            const matchingOpt = opts.find(
              (opt) =>
                String(opt.label) === String(originalScheduleNo) ||
                String(opt.value) === String(originalScheduleNo),
            );
            if (matchingOpt) {
              setHeader((prev) => {
                if (
                  String(prev.schduleNo) === String(matchingOpt.value) &&
                  String(prev.selectedScheduleId) ===
                  String(matchingOpt.value)
                ) {
                  return prev; // no change
                }
                return {
                  ...prev,
                  schduleNo: matchingOpt.value,
                  scheduleId: matchingOpt.value,
                  selectedScheduleId: matchingOpt.value,
                };
              });
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
    },
    [orgId, originalScheduleNo, scheduleMap],
  );

  /* 👇 Load schedules ONLY when customer/branch truly change (not when
        schduleDate is auto-updated from a picked schedule) */
  useEffect(() => {
    if (!header.customer || !header.branch) {
      setScheduleOptions([]);
      setScheduleMap({});
      lastScheduleFetchKeyRef.current = "";
      return;
    }

    const date = header.schduleDate
      ? new Date(header.schduleDate)
      : new Date();
    const monthYear = `${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;

    loadSchedules(
      header.customer,
      header.branch,
      monthYear,
      header.schduleNo, // preserve current selection if any
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [header.customer, header.branch, loadSchedules]);

  /* Load order contracts when schedule is picked */
  useEffect(() => {
    if (header.selectedScheduleId && header.customer && header.branch) {
      loadOrderContracts(
        header.customer,
        header.branch,
        header.selectedScheduleId,
      );
    } else {
      setOrderContractOptions([]);
      setOrderContractMap({});
    }
  }, [
    header.selectedScheduleId,
    header.customer,
    header.branch,
    loadOrderContracts,
  ]);

  useEffect(() => {
    if (orgId) {
      loadPlants();
      loadParties();
      loadLocations();
      loadItems();
      loadUnits();
    }
  }, [orgId, loadPlants, loadParties, loadLocations, loadItems, loadUnits]);

  /* Edit mode: load schedule months for existing rows */
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
        row.schduleMonth,
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

  /* ---------------- DI Number auto-generation ---------------- */
  useEffect(() => {
    if (data?.id) return;
    if (header.diNo) return;
    if (!orgId) return;

    const generateDiNo = async () => {
      setGeneratingDocId(true);
      try {
        const storedOrgId = localStorage.getItem("orgId");
        const storedBranchId = localStorage.getItem("branchId");

        if (!storedOrgId || !storedBranchId) {
          console.error("orgId or branchId missing in localStorage");
          return;
        }

        const mappingList =
          await docTypeMappingAPI.getDocumentTypeMappingByOrgId(
            storedOrgId,
            storedBranchId,
          );

        const record = mappingList?.[0];
        const diDetail = record?.documentTypeMappingDetails?.find(
          (d) => d.screenCode === "DI",
        );

        if (!diDetail) {
          const fallbackFy = new Date().getFullYear().toString();
          const docId =
            await despatchInstructionAPI.getDespatchInstructionDocId({
              financialYear: fallbackFy,
              orgId: storedOrgId,
            });
          if (docId) {
            setHeader((prev) => ({ ...prev, diNo: docId }));
          } else {
            addToast("Failed to generate DI Number");
          }
          return;
        }

        const docId = await despatchInstructionAPI.getDespatchInstructionDocId({
          financialYear: diDetail.finYear,
          orgId: diDetail.orgId || storedOrgId,
        });

        if (docId) {
          setHeader((prev) => ({ ...prev, diNo: docId }));
        } else {
          addToast("Failed to generate DI Number");
        }
      } catch (error) {
        console.error("Error generating DI number:", error);
        addToast("Failed to generate DI Number");
      } finally {
        setGeneratingDocId(false);
      }
    };

    generateDiNo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, orgId]);

  /* ---------------- Handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));

    setHeader((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "customer") {
        const customerObj = partyMap[value];
        next.customer = value;
        next.partyName = customerObj?.customerName || "";
        // 👇 Reset schedule-dependent state when the party changes
        next.schduleNo = "";
        next.scheduleId = "";
        next.selectedScheduleId = "";
        next.schduleDate = todayStr();
        // Force the schedules effect to re-fetch for the new party
        lastScheduleFetchKeyRef.current = "";
        // Clear order contracts (they depend on customer + schedule)
        setOrderContractOptions([]);
        setOrderContractMap({});
      }

      if (name === "schduleNo") {
        // 👇 Normalise the map key to string
        const scheduleData = scheduleMap[String(value)];
        if (scheduleData) {
          if (scheduleData.dlvdate) next.schduleDate = scheduleData.dlvdate;
          if (scheduleData.invoiceType)
            next.invoiceType = scheduleData.invoiceType;
          next.scheduleId = value;
          next.selectedScheduleId = value;
        } else {
          // Even if map lookup fails, at least store what the user picked
          next.scheduleId = value;
          next.selectedScheduleId = value;
        }
      }

      return next;
    });
  };

  const handleOrderContractChange = (e, rowIndex) => {
    const { name, value } = e.target;
    const contractData = orderContractMap[String(value)];

    setDispatchItemRows((prev) =>
      prev.map((row, idx) => {
        if (idx !== rowIndex) return row;
        return {
          ...row,
          [name]: value,
          orderAccepCustomerContractNo:
            contractData?.orderAccepCustomerContractNo || "",
          date: contractData?.date || row.date || "",
        };
      }),
    );

    if (name === "ordAccpContrNo" && value) {
      if (header.customer && header.selectedScheduleId) {
        loadFillGridItems(
          header.branch,
          header.customer,
          header.selectedScheduleId,
        );
        setSelectedRowIndex(rowIndex);
      } else {
        addToast("Please select a schedule first");
      }
    }
  };

  const handleSelectFillGridItems = (selectedItems) => {
    if (selectedRowIndex === null) return;

    const currentRow = dispatchItemRows[selectedRowIndex];
    const selectedContract = orderContractMap[currentRow.ordAccpContrNo];
    const contractNo =
      selectedContract?.orderAccepCustomerContractNo ||
      currentRow.orderAccepCustomerContractNo ||
      currentRow.ordAccpContrNo ||
      "";

    const newRows = selectedItems.map((item, index) => {
      const itemId = item.itemId || item.id;
      const itemCode = item.itemCode || "";
      const itemDescription = item.itemDescription || "";
      const unit =
        item.unit?.primaryUnit ||
        item.unit?.unitId ||
        item.unit?.unitDescription ||
        (typeof item.unit === "string" ? item.unit : "") ||
        "";

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

    const firstItem = selectedItems[0];
    if (firstItem && header.schduleNo) {
      const scheduleData = scheduleMap[header.schduleNo];
      const dlvNo = scheduleData?.dlvNo;

      if (dlvNo) {
        loadScheduleMonths(
          header.branch,
          dlvNo,
          firstItem.itemId || firstItem.id,
          selectedRowIndex,
        );
      }

      loadPlannedQty(
        header.branch,
        firstItem.itemId || firstItem.id,
        selectedRowIndex,
      );
    }
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

        if (dlvNo) loadScheduleMonths(header.branch, dlvNo, value, idx);
        loadPlannedQty(header.branch, value, idx);
      }
    }

    setDispatchItemRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        let next = { ...row, [key]: value };

        // 👇 Keep pdi and pdiNo mirrored
        if (key === "pdiNo") next.pdi = value;
        if (key === "pdi") next.pdiNo = value;

        if (key === "item") {
          const item = itemMap[String(value)];
          next.itemDescription = item?.itemDescription || "";
          next.unit =
            item?.unitCode ||
            item?.primaryUnits?.primaryUnit ||
            item?.sellingUnit?.primaryUnit ||
            item?.purchaseUnit?.primaryUnit ||
            "";
          next.unitId =
            item?.unitId ||
            item?.primaryUnits?.id ||
            item?.sellingUnit?.id ||
            item?.purchaseUnit?.id ||
            0;
        }

        return next;
      }),
    );
  };

  const handleAddRow = () =>
    setDispatchItemRows((prev) => [
      ...prev,
      { ...emptyDispatchItemRow(), pdiDate: todayStr() },
    ]);
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
      docId: header.diNo || "",
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
            ordAccpContrNo:
              contractData?.orderAccepCustomerContractNo ||
              r.orderAccepCustomerContractNo ||
              r.ordAccpContrNo ||
              "",
            packageType: r.packageType || "",
            // 👇 FIX — send pdiNo as `pdi` (which is what the API expects)
            pdi: r.pdiNo || r.pdi || "",
            pdiDate: r.pdiDate || "",
            pendingQty: Number(r.pendingQty) || 0,
            plannedQty: Number(r.plannedQty) || 0,
            schduleMonth:
              monthData?.monthOfSchedule ||
              r.scheduleMonthName ||
              r.schduleMonth ||
              "",
            unit: Number(r.unitId) || 0,
            ...(r.id ? { id: r.id } : {}),
          };
        }),
      grossWeight: Number(header.grossWeight) || 0,
      invoiceType: header.invoiceType || "",
      location: Number(header.location) || 0,
      modeOfTransport: header.modeOfTransport || "",
      netWeight: Number(header.netWeight) || 0,
      orgId: orgId,
      financialYear: finYear,
      paymentTerms: header.paymentTerms || "",
      schduleDate: header.schduleDate || "",
      schduleNo: scheduleMap[header.schduleNo]?.dlvNo || header.schduleNo || "",
      ...(isUpdate ? { id: data.id } : {}),
      ...(isUpdate
        ? { updatedBy: Number(localStorage.getItem("usersId")) }
        : {}),
    };

    try {
      const response =
        await despatchInstructionAPI.createUpdateDispatch(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
          (isUpdate
            ? "Dispatch Instruction updated successfully!"
            : "Dispatch Instruction created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
          response?.errors?.[0]?.longMessage ||
          response?.message ||
          "Failed to save Dispatch Instruction.",
        );
      }
    } catch (err) {
      console.error("Save Dispatch Instruction Error:", err);
      if (err.response?.data) {
        addToast(
          err.response.data.message ||
          err.response.data.statusMessage ||
          err.response.data.error ||
          JSON.stringify(err.response.data),
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
              disabled
              placeholder={generatingDocId ? "Generating..." : ""}
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

      {/* <FillGridModal
        isOpen={isFillGridModalOpen}
        onClose={() => {
          setIsFillGridModalOpen(false);
          setSelectedRowIndex(null);
        }}
        items={fillGridItems}
        onSelectItems={handleSelectFillGridItems}
      /> */}
    </div>
  );
};

export default DispatchForm;
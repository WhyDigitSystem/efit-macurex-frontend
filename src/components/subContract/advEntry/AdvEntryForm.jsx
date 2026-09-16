import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import advEntryAPI from "../../../api/advEntryAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import branchAPI from "../../../api/branchAPI";
import employeeAPI from "../../../api/employeeAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";
import { useToast } from "../../Toast/ToastContext";

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

/* ---------------------------------------------------------------------------- */
/* Module-level helpers                                                         */

const toStr = (v) =>
  v === undefined || v === null || v === "" ? "" : String(v);

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
        className={`h-6 w-6 rounded text-white flex items-center justify-center ${disabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-red-600 hover:bg-red-700"
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
                    value={row[col.key] ?? ""}
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
                  value={row[col.key] ?? ""}
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

/* ---------------------------------------------------------------------------- */
/* Options                                                                      */

const BELONGS_TO_FALLBACK = [
  "APPLIANCES",
  "ELECTRICALS",
  "PACKAGING",
  "RAW MATERIAL",
];

const CHILD_TABS = [
  { key: "advDetails", label: "ADV Details", kind: "table" },
  { key: "advSummary", label: "ADV Summary", kind: "fields" },
];

const emptyDetailRow = () => ({
  itemCode: "",
  itemDescription: "",
  unit: "",        // label, e.g. "KG"
  unitId: "",      // numeric unit id (payload)
  bomQty: "",
  issueQty: "",
  itemId: "",
  bomDetailsId: "",
});

const todayStr = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const nowTimeStr = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const getFinancialYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const startYear = now.getMonth() >= 3 ? year : year - 1;
  const endYear = startYear + 1;
  return `${String(startYear).slice(-2)}-${String(endYear).slice(-2)}`;
};

/* ---------------------------------------------------------------------------- */

const AdvEntryForm = ({ data, onBack }) => {
  const [orgId] = useState(Number(localStorage.getItem("orgId")) || 0);
  const [finYear] = useState(Number(localStorage.getItem("finYear")) || 0);
  const [branch] = useState(Number(localStorage.getItem("branchId")) || 0);
  const { addToast } = useToast();

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const orgName = (userData?.companyVO?.companyName || userData?.orgName || "").trim();
  const isMacurex = ["mecurex", "macurex"].includes(orgName.toLowerCase());

  const [activeChildTab, setActiveChildTab] = useState("advDetails");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingDocId, setLoadingDocId] = useState(false);
  const [loadingRecord, setLoadingRecord] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Dropdown data
  const [plantOptions, setPlantOptions] = useState([]);
  const [belongsToOptions, setBelongsToOptions] = useState([]);
  const [partyOptions, setPartyOptions] = useState([]);
  const [partyMap, setPartyMap] = useState({});
  const [itemOptions, setItemOptions] = useState([]);
  const [itemMasterMap, setItemMasterMap] = useState({});
  const [bomOptions, setBomOptions] = useState([]);
  const [bomMap, setBomMap] = useState({});
  const [bomDetails, setBomDetails] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);

  // Guards the bomId effect from overwriting detailRows right after hydration
  const hasHydratedRef = useRef(false);

  const [header, setHeader] = useState(() => ({
    plantId: data?.plantId || "",
    belongsTo: data?.belongsTo || "",
    partyId: data?.partyId || data?.customer || "",
    partyName: data?.partyName || "",
    incomingPartNo: data?.incomingPartNo || "",
    incomingPartId: data?.incomingPartId || data?.incomingPartNo || "",
    partName: data?.partName || "",
    bomId: data?.bomId || data?.bom || "",
    time: data?.time || nowTimeStr(),
    docDate: data?.docDate || todayStr(),
    docNo: data?.docNo || "",
    active: data?.active !== false,
  }));

  const [detailRows, setDetailRows] = useState(
    data?.advForStoresDetails?.length
      ? data.advForStoresDetails.map((r) => ({
        itemCode: r.item?.id ?? r.item ?? "",
        itemId: r.item?.id ?? r.item ?? "",
        itemDescription: r.item?.itemDescription || r.itemDescription || "",
        unit: r.unit?.unitId || "",
        unitId: r.unit?.id ?? r.unitId ?? "",
        bomQty: r.bomQty ?? "",
        issueQty: r.issueQty ?? "",
        bomDetailsId: r.bomDetailsId || "",
      }))
      : data?.advDetails?.length
        ? data.advDetails
        : [emptyDetailRow()],
  );

  const [summary, setSummary] = useState({
    remarks: data?.remarks || "",
    preparedBy: data?.preparedBy || "",
  });

  /* ---------------- Lookup loading ---------------- */

  const loadPlants = useCallback(async () => {
    try {
      if (isMacurex) {
        const res = await locationMasterAPI.getPlants(orgId);
        setPlantOptions(
          (res || []).map((p) => ({
            value: p.id,
            label: p.plantName || p.plantId || p.id,
          })),
        );
      } else {
        const res = await branchAPI.getBranchByOrgId(orgId);
        setPlantOptions(
          (res || []).map((b) => ({
            value: b.id,
            label: b.branchName || b.id,
          })),
        );
      }
    } catch (error) {
      console.error("Failed to load plant options:", error);
      setPlantOptions([]);
    }
  }, [orgId, isMacurex]);

  const loadBelongsTo = useCallback(async () => {
    try {
      const res = await listOfValuesAPI.getListValuesGroup("SDS BELONGS TO", orgId);

      let items = [];
      if (res?.paramObjectsMap?.listValues) items = res.paramObjectsMap.listValues;
      else if (res?.data?.paramObjectsMap?.listValues)
        items = res.data.paramObjectsMap.listValues;
      else if (Array.isArray(res)) items = res;
      else if (res?.listValues) items = res.listValues;

      const options = items.map((item) => ({
        value: item.valuesDescription || item.valueDescription || item.id,
        label: item.valuesDescription || item.valueDescription || item.id,
      }));

      setBelongsToOptions(
        options.length
          ? options
          : BELONGS_TO_FALLBACK.map((v) => ({ value: v, label: v })),
      );
    } catch (error) {
      console.error("Failed to load Belongs To options:", error);
      setBelongsToOptions(
        BELONGS_TO_FALLBACK.map((v) => ({ value: v, label: v })),
      );
    }
  }, [orgId]);

  const loadParties = useCallback(async () => {
    try {
      const list = await advEntryAPI.getCustomerForSupplierRateContract(
        branch,
        orgId,
      );
      const map = {};
      const options = (list || []).map((p) => {
        map[p.customerId] = p;
        return {
          value: p.customerId,
          label: `${p.customerCode} - ${p.customerName}`,
        };
      });
      setPartyOptions(options);
      setPartyMap(map);
    } catch (error) {
      console.error("Failed to load party options:", error);
      setPartyOptions([]);
      setPartyMap({});
    }
  }, [orgId, branch]);

  const loadItems = useCallback(async () => {
    try {
      const list = await advEntryAPI.getFGAndSFGItems(branch, orgId);
      const map = {};
      const options = (list || []).map((it) => {
        map[it.itemId] = it;
        return {
          value: it.itemId,
          label: `${it.itemCode} - ${it.itemDescription}`,
        };
      });
      setItemOptions(options);
      setItemMasterMap(map);
    } catch (error) {
      console.error("Failed to load item options:", error);
      setItemOptions([]);
      setItemMasterMap({});
    }
  }, [orgId, branch]);

  const loadBoms = useCallback(
    async (itemId) => {
      if (!itemId) {
        setBomOptions([]);
        setBomMap({});
        return;
      }
      try {
        const list = await advEntryAPI.getLatestBomDropdown(
          branch,
          itemId,
          orgId,
        );
        const map = {};
        const options = (list || []).map((b) => {
          map[b.docId] = b;
          return { value: b.docId, label: b.docId };
        });
        setBomOptions(options);
        setBomMap(map);
      } catch (error) {
        console.error("Failed to load BOM dropdown:", error);
        setBomOptions([]);
        setBomMap({});
      }
    },
    [orgId, branch],
  );

  const loadBomDetails = useCallback(
    async (docId) => {
      if (!docId) {
        setBomDetails([]);
        setDetailRows([emptyDetailRow()]);
        return;
      }
      try {
        const list = await advEntryAPI.getBomDetailsByDocId(
          branch,
          docId,
          orgId,
        );
        setBomDetails(list || []);

        const itemMasterMapFromBom = {};
        (list || []).forEach((b) => {
          itemMasterMapFromBom[b.itemId] = b;
        });

        setItemMasterMap((prev) => ({ ...prev, ...itemMasterMapFromBom }));

        const rows = (list || []).length
          ? list.map((b) => ({
            itemCode: b.itemId,
            itemId: b.itemId,
            itemDescription: b.itemDescription || "",
            unit: b.unitCode || "",          // label, e.g. "KG"
            unitId: b.unitId ?? "",          // numeric unit id
            bomQty: b.qty ?? "",
            issueQty: "",
            bomDetailsId: b.bomDetailsId,
          }))
          : [emptyDetailRow()];

        setDetailRows(rows);
      } catch (error) {
        console.error("Failed to load BOM details:", error);
        setBomDetails([]);
        setDetailRows([emptyDetailRow()]);
      }
    },
    [orgId, branch],
  );

  const loadEmployees = useCallback(async () => {
    try {
      const res = await employeeAPI.getEmployeeByOrgId(orgId);
      setEmployeeOptions(
        (res || []).map((e) => ({
          value: e.id,
          label: e.employeeName || String(e.id),
        })),
      );
    } catch (error) {
      console.error("Failed to load employee options:", error);
      setEmployeeOptions([]);
    }
  }, [orgId]);

  const loadAdvDocId = useCallback(async () => {
    if (!orgId) return;
    try {
      setLoadingDocId(true);
      const docId = await advEntryAPI.getAdvForStoresDocId(finYear, orgId);
      if (docId) {
        setHeader((prev) => ({ ...prev, docNo: docId }));
      }
    } catch (error) {
      console.error("Failed to load ADV doc id:", error);
    } finally {
      setLoadingDocId(false);
    }
  }, [orgId, finYear]);

  /* ---------------- Hydrate from getAdvForStoresById ---------------- */

  const hydrateFromRecord = useCallback((rec) => {
    if (!rec) return;

    setHeader((prev) => ({
      ...prev,
      plantId: toStr(rec.branch?.id),
      belongsTo: rec.belongsTo || "",
      docNo: rec.docNo || rec.docId || "",
      docDate: rec.docDate || prev.docDate,
      time: rec.time || prev.time,
      partyId: toStr(rec.customer?.customerId),
      partyName: rec.customer?.customerName || "",
      incomingPartNo: toStr(rec.incomingPartNo?.id),
      incomingPartId: toStr(rec.incomingPartNo?.id),
      partName: rec.incomingPartNo?.itemDescription || "",
      bomId: rec.bom?.docId || "",
      active: rec.active !== false,
    }));

    setSummary((prev) => ({
      ...prev,
      remarks: rec.remarks || "",
      preparedBy: toStr(rec.preparedBy?.id ?? rec.preparedBy),
    }));

    // Convert the loaded details into form rows, preserving issueQty
    const rows = (rec.advForStoresDetails || []).length
      ? rec.advForStoresDetails.map((r) => ({
        id: r.id || 0,
        itemCode: toStr(r.item?.id),
        itemId: toStr(r.item?.id),
        itemDescription: r.item?.itemDescription || "",
        unit: r.unit?.unitId || "",          // label, e.g. "KG"
        unitId: toStr(r.unit?.id),           // numeric id
        bomQty: r.bomQty ?? "",
        issueQty: r.issueQty ?? "",
        bomDetailsId: r.bomDetailsId || "",
      }))
      : [emptyDetailRow()];

    setDetailRows(rows);

    // Populate bomDetails / itemMasterMap directly from the loaded record's
    // details, so the Item Code <select> shows the saved option immediately.
    const seededBomDetails = (rec.advForStoresDetails || []).map((r) => ({
      itemId: r.item?.id,
      itemCode: r.item?.itemCode || "",
      itemDescription: r.item?.itemDescription || "",
      unitCode: r.unit?.unitId || "",
      unitId: r.unit?.id,
      qty: r.bomQty ?? 0,
      bomDetailsId: r.bomDetailsId,
    }));
    if (seededBomDetails.length) {
      setBomDetails(seededBomDetails);

      const seededMap = {};
      seededBomDetails.forEach((b) => {
        seededMap[b.itemId] = b;
      });
      setItemMasterMap((prev) => ({ ...prev, ...seededMap }));
    }

    hasHydratedRef.current = true;
  }, []);

  /* ---------------- Effects ---------------- */

  useEffect(() => {
    if (orgId) {
      loadPlants();
      loadBelongsTo();
      loadEmployees();
    }
  }, [orgId, loadPlants, loadBelongsTo, loadEmployees]);

  useEffect(() => {
    if (orgId && branch) {
      loadParties();
      loadItems();
    }
  }, [orgId, branch, loadParties, loadItems]);

  // Fetch doc id ONLY for new records
  useEffect(() => {
    if (orgId && !data?.id) {
      loadAdvDocId();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, data?.id]);

  // Fetch full record when editing
  useEffect(() => {
    const loadById = async () => {
      if (!data?.id) return;
      try {
        setLoadingRecord(true);
        const rec = await advEntryAPI.getAdvForStoresById(data.id);
        if (rec) hydrateFromRecord(rec);
      } catch (error) {
        console.error("Failed to load ADV For Stores by id:", error);
        addToast("Failed to load ADV For Stores.", "error");
      } finally {
        setLoadingRecord(false);
      }
    };
    loadById();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id]);

  // Reload BOM list when the incoming part changes
  useEffect(() => {
    if (loadingRecord) return;
    if (header.incomingPartId) {
      loadBoms(header.incomingPartId);
    } else {
      setBomOptions([]);
      setBomMap({});
    }
  }, [header.incomingPartId, loadBoms, loadingRecord]);

  // Reload BOM details when BOM changes — skip the very first run after hydration
  useEffect(() => {
    if (loadingRecord) return;

    if (hasHydratedRef.current) {
      hasHydratedRef.current = false; // consume once
      return;
    }

    if (header.bomId) {
      loadBomDetails(header.bomId);
    } else {
      setBomDetails([]);
    }
  }, [header.bomId, loadBomDetails, loadingRecord]);

  /* ---------------- Handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));

    setHeader((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "partyId") {
        const party = partyMap[value];
        next.partyName = party?.customerName || "";
      }

      if (name === "incomingPartNo") {
        const item = itemMasterMap[value];
        next.incomingPartId = value;
        next.partName = item?.itemDescription || "";
        next.bomId = "";
      }

      return next;
    });
  };

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setSummary((prev) => ({ ...prev, [name]: value }));
  };

  const handleCellChange = (idx, key, value) => {
    setDetailRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        const next = { ...row, [key]: value };
        if (key === "itemCode") {
          const bomLine = bomDetails.find(
            (b) => String(b.itemId) === String(value),
          );
          const item = itemMasterMap[value] || bomLine;
          return {
            ...next,
            itemDescription: item?.itemDescription || "",
            unit: bomLine?.unitCode || item?.unitCode || row.unit || "",
            unitId: bomLine?.unitId ?? item?.unitId ?? row.unitId ?? "",
            bomQty: bomLine?.qty ?? row.bomQty ?? "",
            itemId: value,
            bomDetailsId: bomLine?.bomDetailsId || row.bomDetailsId,
          };
        }
        return next;
      }),
    );
  };

  const handleAddRow = () => setDetailRows((prev) => [...prev, emptyDetailRow()]);
  const handleRemoveRow = (idx) =>
    setDetailRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx),
    );

  /* ---------------- Validation & Save ---------------- */

  const validate = () => {
    const errors = {};

    if (!header.plantId) errors.plantId = "Plant is required";
    if (!header.belongsTo) errors.belongsTo = "Belongs To is required";
    if (!header.partyId) errors.partyId = "Party Id is required";
    if (!header.incomingPartNo)
      errors.incomingPartNo = "Incoming Part No is required";
    if (!header.docDate) errors.docDate = "Doc Date is required";
    if (!header.docNo?.trim()) errors.docNo = "Doc No is required";

    const hasValidRow = detailRows.some(
      (r) =>
        r.itemCode &&
        r.itemDescription &&
        r.unitId &&
        Number(r.issueQty) > 0,
    );
    if (!hasValidRow)
      errors.advDetails =
        "Add at least one item with an Item Code, Item Description, Unit and Issue Qty greater than 0";

    if (!summary.remarks?.trim()) errors.remarks = "Remarks is required";
    if (!summary.preparedBy) errors.preparedBy = "Prepared By is required";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    const isUpdate = Boolean(data?.id);

    const advForStoresDetails = detailRows
      .filter((r) => r.itemCode)
      .map((r) => ({
        bomQty: Number(r.bomQty) || 0,
        issueQty: Number(r.issueQty) || 0,
        item: Number(r.itemId ?? r.itemCode) || 0,
        unit: Number(r.unitId) || 0,     // <-- numeric unit id
      }));

    const payload = {
      active: header.active ?? true,
      advForStoresDetails,
      belongsTo: header.belongsTo || "",
      bom: Number(bomMap?.[header.bomId]?.id) || 0,
      branch,
      cancelRemarks: "",
      createdBy: isUpdate
        ? data?.createdBy || localStorage.getItem("usersId")
        : localStorage.getItem("usersId"),
      customer: Number(header.partyId) || 0,
      financialYear: finYear,
      incomingPartNo:
        Number(header.incomingPartId ?? header.incomingPartNo) || 0,
      orgId,
      preparedBy: Number(summary.preparedBy) || 0,
      remarks: summary.remarks || "",
      time: header.time || nowTimeStr(),
      ...(isUpdate ? { id: data.id } : {}),
    };

    try {
      const response = await advEntryAPI.createUpdateAdvForStores(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
          (isUpdate
            ? "ADV For Stores updated successfully!"
            : "ADV For Stores created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
          response?.errors?.[0]?.longMessage ||
          response?.message ||
          "Failed to save ADV For Stores.",
        );
      }
    } catch (err) {
      console.error("Save ADV For Stores Error:", err);
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

  const itemCodeOptions = useMemo(() => {
    if (bomDetails?.length) {
      return bomDetails.map((b) => ({
        value: b.itemId,
        label: `${b.itemCode} - ${b.itemDescription}`,
      }));
    }
    return itemOptions;
  }, [bomDetails, itemOptions]);

  /* ---------------- Loading short-circuit ---------------- */

  if (loadingRecord) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">
          Loading ADV For Stores...
        </div>
      </div>
    );
  }

  /* ---------------- Render ---------------- */

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
          {data ? "Edit ADV Entry" : "Add ADV Entry"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* Header Info */}
        <div>
          <SectionHeader>ADV Entry</SectionHeader>
          <div className={fieldGrid}>
            <Field
              type="select"
              label="Plant"
              name="plantId"
              value={header.plantId}
              onChange={handleHeaderChange}
              error={fieldErrors.plantId}
              options={plantOptions}
              required
            />
            <Field
              type="select"
              label="Belongs To"
              name="belongsTo"
              value={header.belongsTo}
              onChange={handleHeaderChange}
              error={fieldErrors.belongsTo}
              options={belongsToOptions}
              required
            />
            <Field
              label="Doc No"
              name="docNo"
              value={loadingDocId ? "Generating..." : header.docNo}
              onChange={handleHeaderChange}
              error={fieldErrors.docNo}
              required
              disabled
            />
            <Field
              type="date"
              label="Doc Date"
              name="docDate"
              value={header.docDate}
              onChange={handleHeaderChange}
              error={fieldErrors.docDate}
              required
              disabled
            />
            <Field
              type="select"
              label="Party Id"
              name="partyId"
              value={header.partyId}
              onChange={handleHeaderChange}
              error={fieldErrors.partyId}
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
              label="Incoming Part No"
              name="incomingPartNo"
              value={header.incomingPartNo}
              onChange={handleHeaderChange}
              error={fieldErrors.incomingPartNo}
              options={itemOptions}
              required
            />
            <Field
              label="Part Name"
              name="partName"
              value={header.partName}
              onChange={handleHeaderChange}
              disabled
            />
            <Field
              type="select"
              label="BOM Id"
              name="bomId"
              value={header.bomId}
              onChange={handleHeaderChange}
              options={bomOptions}
            />
            <Field
              label="Time"
              name="time"
              value={header.time}
              onChange={handleHeaderChange}
              disabled
            />
          </div>
        </div>

        {/* Child Tabs */}
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

          {/* ADV Details tab */}
          {activeChildTab === "advDetails" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  {
                    key: "itemCode",
                    label: "Item Code",
                    type: "select",
                    options: itemCodeOptions,
                  },
                  {
                    key: "itemDescription",
                    label: "Item Description",
                    readOnly: true,
                  },
                  {
                    key: "unit",             // plain text input now
                    label: "Unit",
                  },
                  {
                    key: "bomQty",
                    label: "BOM Qty",
                    type: "number",
                    readOnly: true,
                  },
                  { key: "issueQty", label: "Issue Qty", type: "number" },
                ]}
                rows={detailRows}
                onCellChange={handleCellChange}
                onRemoveRow={handleRemoveRow}
              />
              {fieldErrors.advDetails && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.advDetails}
                </p>
              )}
            </div>
          )}

          {/* ADV Summary tab */}
          {activeChildTab === "advSummary" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  type="textarea"
                  label="Remarks"
                  name="remarks"
                  value={summary.remarks}
                  onChange={handleSummaryChange}
                  error={fieldErrors.remarks}
                  required
                />
                <Field
                  type="select"
                  label="Prepared By"
                  name="preparedBy"
                  value={summary.preparedBy}
                  onChange={handleSummaryChange}
                  error={fieldErrors.preparedBy}
                  options={employeeOptions}
                  required
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
    </div>
  );
};

export default AdvEntryForm;
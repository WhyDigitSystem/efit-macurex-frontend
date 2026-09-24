import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";
import scrapNoteAPI from "../../../api/Production/scrapNoteAPI";
import branchAPI from "../../../api/branchAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import { departmentAPI } from "../../../api/departmentAPI";
import { employeeAPI } from "../../../api/employeeAPI";
import { unitMasterAPI } from "../../../api/unitAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";

/* ---------------------------------------------------------------------------- */
/* Shared design tokens                                                        */

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const controlErrClasses =
  "border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500";

const labelClasses = "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 items-start";

const cellInputClasses =
  "w-full px-2 py-1 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400";

const cellReadOnlyClasses =
  "w-full px-2 py-1 rounded border text-xs leading-none " +
  "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 " +
  "border-gray-300 dark:border-gray-600 cursor-default";

const BELONGS_TO_LIST_NAME = "SDS BELONGS TO";
const SCRAP_ID_LIST_NAME = "SCRAP ID";
const YES_NO_OPTIONS = ["Yes", "No"];

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
  className = "",
  disabled = false,
}) => {
  if (type === "select") {
    const safeValue = value === null || value === undefined ? "" : value;
    const safeOptions = (options || []).map((opt) =>
      typeof opt === "object" ? opt : { value: opt, label: opt },
    );
    const inOptions = safeOptions.some(
      (o) => String(o.value) === String(safeValue),
    );
    const showGhost = safeValue !== "" && !inOptions;

    return (
      <div className={`w-full ${className}`}>
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
        <select
          name={name}
          value={safeValue}
          onChange={onChange}
          disabled={disabled}
          className={`${controlClasses} ${error ? controlErrClasses : ""}`}
        >
          <option value="">-- Select --</option>
          {showGhost && <option value={safeValue}>{String(safeValue)}</option>}
          {safeOptions.map((opt) => (
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
            "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
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
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <X className="h-3 w-3" /> Cancel
    </button>
    <button
      onClick={onSave}
      disabled={isSubmitting}
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <Save className="h-3 w-3" /> {isSubmitting ? "Saving..." : saveLabel}
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
              const safeValue =
                row[col.key] === null || row[col.key] === undefined
                  ? ""
                  : row[col.key];
              const opts = (col.options || []).map((opt) =>
                typeof opt === "object" ? opt : { value: opt, label: opt },
              );
              const inOptions = opts.some(
                (o) => String(o.value) === String(safeValue),
              );
              const showGhost = safeValue !== "" && !inOptions;

              return (
                <td className="p-2 align-top" key={col.key}>
                  <select
                    value={safeValue}
                    onChange={(e) =>
                      onCellChange(idx, col.key, e.target.value)
                    }
                    className={cellInputClasses}
                  >
                    <option value="">-- Select --</option>
                    {showGhost && (
                      <option value={safeValue}>{String(safeValue)}</option>
                    )}
                    {opts.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
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
                    onChange={(e) =>
                      onCellChange(idx, col.key, e.target.value)
                    }
                    className={cellInputClasses}
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
                        : col.type === "time"
                          ? "time"
                          : "text"
                  }
                  value={row[col.key]}
                  readOnly={col.readOnly}
                  onChange={(e) =>
                    onCellChange(idx, col.key, e.target.value)
                  }
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

const CHILD_TABS = [
  { key: "scrapDetails", label: "Scrap Details", kind: "table" },
  { key: "reasonDetails", label: "Reason Detail", kind: "table" },
  { key: "summary", label: "Scrap Summary", kind: "fields" },
];

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");
const toNum = (v) => Number(v) || 0;

const emptyScrapDetailRow = () => ({
  item: "",
  itemDescription: "",
  primaryUnit: "",
  stock: "",
  quantity: "",
  weight: "",
  rate: "",
  value: "",
});

const emptyReasonDetailRow = () => ({
  reasonCode: "",
  reasonDescription: "",
  rejQty: 0,
});

/* ---------------------------------------------------------------------------- */

const ScrapNoteForm = ({ data, onBack, onSave }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId")) || 0;
  const branch = Number(localStorage.getItem("branchId")) || 0;
  const usersId = localStorage.getItem("usersId");

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const orgName = (
    userData?.companyVO?.companyName ||
    userData?.orgName ||
    ""
  ).trim();
  const isMacurex = ["mecurex", "macurex"].includes(orgName.toLowerCase());

  const isEditMode = Boolean(data?.id);
  const docIdLoadedRef = useRef(false);

  const [activeChildTab, setActiveChildTab] = useState("scrapDetails");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  /* ---------- Header state ---------- */
  const [header, setHeader] = useState(() => ({
    plantId: data?.branch?.id ?? data?.plantId ?? "",
    belongsTo: data?.belongsTo ?? "",
    department: data?.department?.id ?? data?.department ?? "",
    fromLocation: data?.fromLocation?.id ?? data?.fromLocation ?? "",
    toLocation: data?.toLocation?.id ?? data?.toLocation ?? "",
    fgPartNo: data?.fgPart?.id ?? data?.fgPartNo ?? "",
    scheduleOrderNo: data?.schOrderNo ?? data?.scheduleOrderNo ?? "",
    bomId: data?.bom?.id ?? data?.bomId ?? "",
    scrapPartNo: data?.scrapPart?.id ?? data?.scrapPartNo ?? "",
    scrapNoteNo: data?.docId ?? data?.scrapNoteNo ?? "",
    scrapNoteDate: data?.docDate
      ? fmtDate(data.docDate)
      : data?.scrapNoteDate
        ? fmtDate(data.scrapNoteDate)
        : fmtDate(dayjs()),
    time: data?.time || dayjs().format("HH:mm:ss"),
  }));

  const [scrapDetailRows, setScrapDetailRows] = useState(() => {
    const raw =
      data?.scrapNoteDetailsDTO ||
      data?.scrapNoteDetails ||
      data?.scrapDetails ||
      data?.details ||
      [];
    if (raw.length) {
      return raw.map((item) => ({
        item: item.item?.id ?? item.item ?? "",
        // ✅ Read flattened field first, fall back to nested
        itemDescription:
          item.itemDescription ?? item.item?.itemDescription ?? "",
        primaryUnit: item.primaryUnit?.id ?? item.primaryUnit ?? "",
        stock: item.stock ?? "",
        quantity: item.quantity ?? "",
        weight: item.weight ?? "",
        rate: item.rate ?? "",
        value:
          item.value ??
          (toNum(item.quantity) * toNum(item.rate)).toFixed(2),
      }));
    }
    return [emptyScrapDetailRow()];
  });

  const [reasonDetailRows, setReasonDetailRows] = useState(() => {
    const raw =
      data?.scrapNoteReasonDetailsDTO ||
      data?.scrapNoteReasonDetails ||
      data?.reasonDetails ||
      [];
    if (raw.length) {
      return raw.map((item) => ({
        reasonCode: item.reasonCode ?? "",
        reasonDescription: item.reasonDescription ?? "",
        rejQty: item.rejQty ?? item.rejectedQty ?? 0,
      }));
    }
    return [emptyReasonDetailRow()];
  });

  const [summary, setSummary] = useState({
    preparedBy: data?.preparedBy?.id ?? data?.preparedBy ?? "",
    authorisedBy: data?.authorisedBy?.id ?? data?.authorisedBy ?? "",
    scrapId: data?.scrapId?.id ?? data?.scrapId ?? "",
    pmApproval: data?.pmApproval ?? "",
    qualityApproval: data?.qualityApproval ?? "",
    storeApproval: data?.storeApproval ?? "",
    narration: data?.narration ?? "",
  });

  /* ---------- Lookup loading ---------- */

  const [plantOptions, setPlantOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [belongsToOptions, setBelongsToOptions] = useState([]);
  const [scrapIdOptions, setScrapIdOptions] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);
  const [fgPartOptions, setFgPartOptions] = useState([]);
  const [scheduleOrderOptions, setScheduleOrderOptions] = useState([]);
  const [bomOptions, setBomOptions] = useState([]);
  const [scrapPartOptions, setScrapPartOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);

  const fgPartMapRef = useRef({});
  const scrapPartMapRef = useRef({});
  const bomMapRef = useRef({});
  const itemMapRef = useRef({});

  /* Plants */
  useEffect(() => {
    if (!orgId) return;
    (async () => {
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
              label: b.branchName || b.branchCode || b.id,
            })),
          );
        }
      } catch (err) {
        console.error("Failed to load plants:", err);
      }
    })();
  }, [orgId, isMacurex]);

  /* Locations */
  useEffect(() => {
    if (!orgId || !branch) return;
    (async () => {
      try {
        const res = await locationMasterAPI.getLocationMasterByOrgId(
          orgId,
          branch,
        );
        setLocationOptions(
          (res || []).map((l) => ({
            value: l.id,
            label: l.locationName || l.locationId || l.id,
          })),
        );
      } catch (err) {
        console.error("Failed to load locations:", err);
      }
    })();
  }, [orgId, branch]);

  /* Departments */
  useEffect(() => {
    if (!orgId) return;
    (async () => {
      try {
        const res = await departmentAPI.getAllDepartments(orgId);
        const list = res?.paramObjectsMap?.departmentVO || [];
        setDepartmentOptions(
          list.map((d) => ({
            value: d.id,
            label: d.departmentName || d.id,
          })),
        );
      } catch (err) {
        console.error("Failed to load departments:", err);
      }
    })();
  }, [orgId]);

  /* Employees */
  useEffect(() => {
    if (!orgId) return;
    (async () => {
      try {
        const res = await employeeAPI.getEmployeeByOrgId(orgId);
        setEmployeeOptions(
          (res || []).map((e) => ({
            value: e.id,
            label: e.employeeCode || e.employeeName || e.id,
          })),
        );
      } catch (err) {
        console.error("Failed to load employees:", err);
      }
    })();
  }, [orgId]);

  /* Units */
  useEffect(() => {
    if (!orgId || !branch) return;
    (async () => {
      try {
        const res = await unitMasterAPI.getUnits(branch, orgId);
        setUnitOptions(
          (res || []).map((u) => ({
            value: u.id,
            label: u.unitId || u.unitName || u.id,
          })),
        );
      } catch (err) {
        console.error("Failed to load units:", err);
      }
    })();
  }, [orgId, branch]);

  /* Belongs To + Scrap ID — list of values */
  useEffect(() => {
    if (!orgId) return;
    (async () => {
      try {
        const list = await listOfValuesAPI.getListValuesGroup(
          BELONGS_TO_LIST_NAME,
          orgId,
        );
        setBelongsToOptions(
          (list || []).map((item) => ({
            value: item.valuesDescription ?? item.value ?? item.id ?? "",
            label: item.valuesDescription ?? item.value ?? item.id ?? "",
          })),
        );
      } catch (err) {
        console.error("Failed to load Belongs To list:", err);
      }
    })();

    (async () => {
      try {
        const list = await listOfValuesAPI.getListValuesGroup(
          SCRAP_ID_LIST_NAME,
          orgId,
        );
        setScrapIdOptions(
          (list || []).map((item) => ({
            value: item.id ?? item.value ?? "",
            label: item.valuesDescription ?? item.value ?? item.id ?? "",
          })),
        );
      } catch (err) {
        console.error("Failed to load Scrap ID list:", err);
      }
    })();
  }, [orgId]);

  /* FG Part No */
  useEffect(() => {
    if (!orgId || !branch) return;
    (async () => {
      try {
        const list = await scrapNoteAPI.getFgPartNoOptions({
          branch,
          orgId,
        });
        const map = {};
        setFgPartOptions(
          (list || []).map((it) => {
            const value = it.itemId;
            map[value] = it;
            return { value, label: it.itemCode || String(it.itemId) };
          }),
        );
        fgPartMapRef.current = map;
      } catch (err) {
        console.error("Failed to load FG Part No:", err);
      }
    })();
  }, [orgId, branch]);

  /* Schedule Order No */
  useEffect(() => {
    if (!orgId || !branch) return;
    (async () => {
      try {
        const list = await scrapNoteAPI.getScheduleOrderOptions({
          branch,
          orgId,
        });
        setScheduleOrderOptions(
          (list || []).map((o) => ({
            value: o.docId,
            label: o.docId,
          })),
        );
      } catch (err) {
        console.error("Failed to load schedule orders:", err);
      }
    })();
  }, [orgId, branch]);

  /* BOM Id */
  useEffect(() => {
    if (!orgId || !branch) return;
    (async () => {
      try {
        const list = await scrapNoteAPI.getBomOptions({ branch, orgId });
        const map = {};
        setBomOptions(
          (list || []).map((b) => {
            const value = b.bomId;
            map[value] = b;
            return { value, label: b.docId || String(b.bomId) };
          }),
        );
        bomMapRef.current = map;
      } catch (err) {
        console.error("Failed to load BOMs:", err);
      }
    })();
  }, [orgId, branch]);

  /* Scrap Part No */
  useEffect(() => {
    if (!orgId || !branch) return;
    (async () => {
      try {
        const list = await scrapNoteAPI.getScrapPartNoOptions({
          branch,
          orgId,
        });
        const map = {};
        setScrapPartOptions(
          (list || []).map((it) => {
            const value = it.itemId;
            map[value] = it;
            return { value, label: it.itemCode || String(it.itemId) };
          }),
        );
        scrapPartMapRef.current = map;
      } catch (err) {
        console.error("Failed to load scrap parts:", err);
      }
    })();
  }, [orgId, branch]);

  /* Item Code — reload when BOM Id changes */
  useEffect(() => {
    const bomId = header.bomId;
    if (!bomId) {
      setItemOptions([]);
      itemMapRef.current = {};
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const list = await scrapNoteAPI.getItemsByBom({
          bom: bomId,
          branch,
          orgId,
        });
        const map = {};
        const opts = (list || []).map((it) => {
          const value = it.itemId;
          map[value] = it;
          return {
            value,
            label: `${it.itemCode} — ${it.itemDescription}`,
          };
        });
        if (!cancelled) {
          itemMapRef.current = map;
          setItemOptions(opts);
        }
      } catch (err) {
        console.error("Failed to load items by BOM:", err);
        if (!cancelled) {
          setItemOptions([]);
          itemMapRef.current = {};
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [header.bomId, branch, orgId]);

  /* ---------------- Doc Id auto-generation (Add mode) ---------------- */
  useEffect(() => {
    if (isEditMode || docIdLoadedRef.current) return;
    if (!orgId) return;

    let cancelled = false;
    (async () => {
      try {
        const financialYear = String(new Date().getFullYear());
        const docId = await scrapNoteAPI.getDocId({ financialYear, orgId });
        if (!cancelled && docId) {
          setHeader((prev) => ({ ...prev, scrapNoteNo: docId }));
          docIdLoadedRef.current = true;
        }
      } catch (err) {
        console.error("Failed to generate Scrap Note Doc Id:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isEditMode, orgId]);

  /* ---------------- Re-sync on edit data ---------------- */
  useEffect(() => {
    if (!data) return;

    setHeader({
      plantId: data.branch?.id ?? data.plantId ?? "",
      belongsTo: data.belongsTo ?? "",
      department: data.department?.id ?? data.department ?? "",
      fromLocation: data.fromLocation?.id ?? data.fromLocation ?? "",
      toLocation: data.toLocation?.id ?? data.toLocation ?? "",
      fgPartNo: data.fgPart?.id ?? data.fgPartNo ?? "",
      scheduleOrderNo: data.schOrderNo ?? data.scheduleOrderNo ?? "",
      bomId: data.bom?.id ?? data.bomId ?? "",
      scrapPartNo: data.scrapPart?.id ?? data.scrapPartNo ?? "",
      scrapNoteNo: data.docId ?? data.scrapNoteNo ?? "",
      scrapNoteDate: data.docDate
        ? fmtDate(data.docDate)
        : data.scrapNoteDate
          ? fmtDate(data.scrapNoteDate)
          : fmtDate(dayjs()),
      time: data.time || dayjs().format("HH:mm:ss"),
    });

    const rawScrap =
      data.scrapNoteDetails ||
      data.scrapNoteDetailsDTO ||
      data.scrapDetails ||
      data.details ||
      [];
    setScrapDetailRows(
      rawScrap.length
        ? rawScrap.map((item) => ({
          item: item.item?.id ?? item.item ?? "",
          // ✅ Same fix here
          itemDescription:
            item.itemDescription ?? item.item?.itemDescription ?? "",
          primaryUnit: item.primaryUnit?.id ?? item.primaryUnit ?? "",
          stock: item.stock ?? "",
          quantity: item.quantity ?? "",
          weight: item.weight ?? "",
          rate: item.rate ?? "",
          value:
            item.value ??
            (toNum(item.quantity) * toNum(item.rate)).toFixed(2),
        }))
        : [emptyScrapDetailRow()],
    );

    const rawReason =
      data.scrapNoteReasonDetails ||
      data.scrapNoteReasonDetailsDTO ||
      data.reasonDetails ||
      [];
    setReasonDetailRows(
      rawReason.length
        ? rawReason.map((item) => ({
          reasonCode: item.reasonCode ?? "",
          reasonDescription: item.reasonDescription ?? "",
          rejQty: item.rejQty ?? item.rejectedQty ?? 0,
        }))
        : [emptyReasonDetailRow()],
    );

    setSummary({
      preparedBy: data.preparedBy?.id ?? data.preparedBy ?? "",
      authorisedBy: data.authorisedBy?.id ?? data.authorisedBy ?? "",
      scrapId: data.scrapId?.id ?? data.scrapId ?? "",
      pmApproval: data.pmApproval ?? "",
      qualityApproval: data.qualityApproval ?? "",
      storeApproval: data.storeApproval ?? "",
      narration: data.narration ?? "",
    });

    if (data.docId) docIdLoadedRef.current = true;
  }, [data]);

  /* ---------------------------------------------------------------------------- */
  /* Handlers                                                                     */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  const handleScrapDetailCellChange = (idx, key, value) => {
    setScrapDetailRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        const next = { ...row, [key]: value };

        if (key === "item") {
          const item = itemMapRef.current[value];
          next.itemDescription = item?.itemDescription || "";
        }

        const q = key === "quantity" ? toNum(value) : toNum(next.quantity);
        const r = key === "rate" ? toNum(value) : toNum(next.rate);
        next.value = q && r ? (q * r).toFixed(2) : "";

        return next;
      }),
    );

    if (fieldErrors[`detail.${idx}.${key}`])
      setFieldErrors((prev) => ({ ...prev, [`detail.${idx}.${key}`]: "" }));
  };

  const handleReasonDetailCellChange = (idx, key, value) => {
    setReasonDetailRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        return { ...row, [key]: value };
      }),
    );

    if (fieldErrors[`reason.${idx}.${key}`])
      setFieldErrors((prev) => ({ ...prev, [`reason.${idx}.${key}`]: "" }));
  };

  const handleAddRow = () => {
    if (activeChildTab === "scrapDetails")
      setScrapDetailRows((prev) => [...prev, emptyScrapDetailRow()]);
    else if (activeChildTab === "reasonDetails")
      setReasonDetailRows((prev) => [...prev, emptyReasonDetailRow()]);
  };

  const handleRemoveRow = (idx) => {
    if (activeChildTab === "scrapDetails")
      setScrapDetailRows((prev) =>
        prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx),
      );
    else if (activeChildTab === "reasonDetails")
      setReasonDetailRows((prev) =>
        prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx),
      );
  };

  const totalScrapValue = scrapDetailRows.reduce(
    (sum, r) => sum + toNum(r.value),
    0,
  );

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setSummary((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------------------------------------------------------------------- */
  /* Validation & Save                                                            */

  const validate = () => {
    const errors = {};

    if (!header.plantId) errors.plantId = "Plant ID is required";
    if (!header.department) errors.department = "Department is required";
    if (!header.fromLocation) errors.fromLocation = "From Location is required";
    if (!header.toLocation) errors.toLocation = "To Location is required";
    if (!header.bomId) errors.bomId = "BOM ID is required";
    if (!header.scrapNoteNo?.trim())
      errors.scrapNoteNo = "Scrap Note No is required";
    if (!header.scrapNoteDate)
      errors.scrapNoteDate = "Scrap Note Date is required";

    const hasValidScrapRow = scrapDetailRows.some(
      (r) =>
        r.item &&
        r.primaryUnit &&
        toNum(r.quantity) > 0 &&
        toNum(r.rate) > 0,
    );
    if (!hasValidScrapRow)
      errors.scrapDetails =
        "Add at least one Scrap Details row with Item, Primary Unit, Quantity and Rate";

    const hasValidReasonRow = reasonDetailRows.some(
      (r) => r.reasonCode && r.reasonDescription?.trim(),
    );
    if (!hasValidReasonRow)
      errors.reasonDetails =
        "Add at least one Reason Detail row with Reason Code and Reason Description";

    if (!summary.preparedBy) errors.preparedBy = "Prepared By is required";
    if (!summary.authorisedBy)
      errors.authorisedBy = "Authorised By is required";
    if (!summary.scrapId) errors.scrapId = "Scrap ID is required";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);
    const financialYear = String(new Date().getFullYear());

    const payload = {
      ...(isUpdate ? { id: Number(data.id) } : {}),

      active: true,
      cancel: false,
      cancelRemarks: "",
      orgId,
      branch,
      financialYear,
      docDate: header.scrapNoteDate || fmtDate(dayjs()),

      createdBy: isUpdate ? data?.createdBy ?? usersId : usersId,

      belongsTo: header.belongsTo || "",
      department: Number(header.department) || 0,
      fromLocation: Number(header.fromLocation) || 0,
      toLocation: Number(header.toLocation) || 0,
      fgPart: Number(header.fgPartNo) || 0,
      schOrderNo: header.scheduleOrderNo || "",
      bom: Number(header.bomId) || 0,
      scrapPart: Number(header.scrapPartNo) || 0,

      scrapId: Number(summary.scrapId) || 0,
      preparedBy: Number(summary.preparedBy) || 0,
      authorisedBy: Number(summary.authorisedBy) || 0,

      // ✅ Approvals sent as Yes/No strings
      pmApproval: summary.pmApproval || "",
      qualityApproval: summary.qualityApproval || "",
      storeApproval: summary.storeApproval || "",

      narration: summary.narration || "",

      scrapNoteDetailsDTO: (scrapDetailRows || [])
        .filter((r) => r.item)
        .map((r) => ({
          item: Number(r.item) || 0,
          primaryUnit: Number(r.primaryUnit) || 0,
          stock: toNum(r.stock),
          quantity: toNum(r.quantity),
          weight: toNum(r.weight),
          rate: toNum(r.rate),
        })),

      scrapNoteReasonDetailsDTO: (reasonDetailRows || [])
        .filter((r) => r.reasonCode)
        .map((r) => ({
          reasonCode: r.reasonCode || "",
          reasonDescription: r.reasonDescription || "",
          rejQty: toNum(r.rejQty),
        })),
    };

    console.log("📤 Saving Scrap Note:", payload);

    try {
      const response = await scrapNoteAPI.createUpdate(payload);

      const isSuccess =
        response?.status === true ||
        response?.statusFlag === "Ok" ||
        response?.status === 200 ||
        response?.statusCode === 200;

      if (isSuccess) {
        addToast(
          response?.paramObjectsMap?.message ||
          (isUpdate
            ? "Scrap Note updated successfully!"
            : "Scrap Note created successfully!"),
          "success",
        );
        if (onSave) onSave(payload);
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
          response?.errors?.[0]?.longMessage ||
          response?.message ||
          response?.paramObjectsMap?.message ||
          "Failed to save Scrap Note.",
          "error",
        );
      }
    } catch (err) {
      console.error("Save Scrap Note Error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.statusMessage ||
        err.response?.data?.error ||
        "Something went wrong.";
      addToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------------------------------------------------------------------- */

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
          {data ? "Edit Scrap Note" : "Add Scrap Note"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Info ---------------- */}
        <div>
          <SectionHeader>Scrap Note Header</SectionHeader>
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
              label="Belongs To"
              name="belongsTo"
              value={header.belongsTo}
              onChange={handleHeaderChange}
              error={fieldErrors.belongsTo}
              options={belongsToOptions}
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
              label="From Location"
              name="fromLocation"
              value={header.fromLocation}
              onChange={handleHeaderChange}
              error={fieldErrors.fromLocation}
              options={locationOptions}
              required
            />
            <Field
              type="select"
              label="To Location"
              name="toLocation"
              value={header.toLocation}
              onChange={handleHeaderChange}
              error={fieldErrors.toLocation}
              options={locationOptions}
              required
            />
            <Field
              type="select"
              label="FG Part No"
              name="fgPartNo"
              value={header.fgPartNo}
              onChange={handleHeaderChange}
              error={fieldErrors.fgPartNo}
              options={fgPartOptions}
            />
            <Field
              type="select"
              label="Schedule Order No"
              name="scheduleOrderNo"
              value={header.scheduleOrderNo}
              onChange={handleHeaderChange}
              error={fieldErrors.scheduleOrderNo}
              options={scheduleOrderOptions}
            />
            <Field
              type="select"
              label="BOM ID"
              name="bomId"
              value={header.bomId}
              onChange={handleHeaderChange}
              error={fieldErrors.bomId}
              options={bomOptions}
              required
            />
            <Field
              type="select"
              label="Scrap Part No"
              name="scrapPartNo"
              value={header.scrapPartNo}
              onChange={handleHeaderChange}
              error={fieldErrors.scrapPartNo}
              options={scrapPartOptions}
            />
            <Field
              label="Scrap Note No"
              name="scrapNoteNo"
              value={header.scrapNoteNo}
              onChange={handleHeaderChange}
              error={fieldErrors.scrapNoteNo}
              disabled
              required
            />
            <Field
              type="date"
              label="Scrap Note Date"
              name="scrapNoteDate"
              value={header.scrapNoteDate}
              onChange={handleHeaderChange}
              error={fieldErrors.scrapNoteDate}
              disabled
              required
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

        {/* ---------------- Child Tabs ---------------- */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-0">
            <div className="flex flex-wrap">
              {CHILD_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveChildTab(tab.key)}
                  className={`px-4 py-1 text-xs font-semibold rounded-t whitespace-nowrap transition-colors ${activeChildTab === tab.key
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTabMeta?.kind === "table" && (
              <button
                type="button"
                onClick={handleAddRow}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {activeChildTab === "scrapDetails" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  {
                    key: "item",
                    label: "Item Code",
                    type: "select",
                    options: itemOptions,
                  },
                  {
                    key: "itemDescription",
                    label: "Item Description",
                    type: "text",
                    readOnly: true,
                  },
                  {
                    key: "primaryUnit",
                    label: "Primary Unit",
                    type: "select",
                    options: unitOptions,
                  },
                  { key: "stock", label: "Stock", type: "number" },
                  { key: "quantity", label: "Quantity", type: "number" },
                  { key: "weight", label: "Weight", type: "number" },
                  { key: "rate", label: "Rate", type: "number" },
                  {
                    key: "value",
                    label: "Value",
                    type: "number",
                    readOnly: true,
                  },
                ]}
                rows={scrapDetailRows}
                onCellChange={handleScrapDetailCellChange}
                onRemoveRow={handleRemoveRow}
              />
              {fieldErrors.scrapDetails && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.scrapDetails}
                </p>
              )}
            </div>
          )}

          {activeChildTab === "reasonDetails" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  {
                    key: "reasonCode",
                    label: "Reason Code",
                    type: "text",
                  },
                  {
                    key: "reasonDescription",
                    label: "Reason Description",
                    type: "textarea",
                  },
                  { key: "rejQty", label: "Rejected Qty", type: "number" },
                ]}
                rows={reasonDetailRows}
                onCellChange={handleReasonDetailCellChange}
                onRemoveRow={handleRemoveRow}
              />
              {fieldErrors.reasonDetails && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.reasonDetails}
                </p>
              )}
            </div>
          )}

          {activeChildTab === "summary" && (
            <div className="pt-3 pb-1">
              <div className={fieldGrid}>
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
                <Field
                  type="select"
                  label="Authorised By"
                  name="authorisedBy"
                  value={summary.authorisedBy}
                  onChange={handleSummaryChange}
                  error={fieldErrors.authorisedBy}
                  options={employeeOptions}
                  required
                />
                <Field
                  type="select"
                  label="Scrap ID"
                  name="scrapId"
                  value={summary.scrapId}
                  onChange={handleSummaryChange}
                  error={fieldErrors.scrapId}
                  options={scrapIdOptions}
                  required
                />
                <Field
                  type="number"
                  label="Total Scrap Value"
                  name="totalScrapValue"
                  value={totalScrapValue}
                  onChange={() => { }}
                  disabled
                />

                {/* ✅ Approvals converted to Yes/No selects */}
                <Field
                  type="select"
                  label="PM Approval"
                  name="pmApproval"
                  value={summary.pmApproval}
                  onChange={handleSummaryChange}
                  options={YES_NO_OPTIONS}
                />
                <Field
                  type="select"
                  label="Quality Approval"
                  name="qualityApproval"
                  value={summary.qualityApproval}
                  onChange={handleSummaryChange}
                  options={YES_NO_OPTIONS}
                />
                <Field
                  type="select"
                  label="Store Approval"
                  name="storeApproval"
                  value={summary.storeApproval}
                  onChange={handleSummaryChange}
                  options={YES_NO_OPTIONS}
                />

                <Field
                  type="textarea"
                  label="Narration"
                  name="narration"
                  value={summary.narration}
                  onChange={handleSummaryChange}
                />
              </div>
            </div>
          )}
        </section>
      </div>

      <FormButtons
        onCancel={onBack}
        onSave={handleSave}
        isSubmitting={isSubmitting}
        saveLabel={data ? "Update" : "Save"}
      />
    </div>
  );
};

export default ScrapNoteForm;
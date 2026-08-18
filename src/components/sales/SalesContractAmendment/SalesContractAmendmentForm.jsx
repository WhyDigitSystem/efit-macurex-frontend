import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import salesContractAmendmentAPI from "../../../api/Sales/salesContractAmendmentAPI";
import branchAPI from "../../../api/branchAPI";
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
  loading = false,
  placeholder,
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
          disabled={disabled || loading}
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
      type="button"
      onClick={onCancel}
      disabled={isSubmitting}
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs whitespace-nowrap border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <X className="h-3 w-3" />
      Cancel
    </button>

    <button
      type="button"
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
          className={`p-2 whitespace-nowrap ${
            i === 0
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
        className={`h-6 w-6 rounded text-white flex items-center justify-center ${
          disabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-red-600 hover:bg-red-700"
        }`}
      >
        <Trash2 size={12} />
      </button>
    </td>
  </tr>
);

/* ---------------------------------------------------------------------------- */
/* Constants                                                                     */

const CHILD_TABS = [
  { key: "details", label: "Sales Contract Details", kind: "table" },
  { key: "summary", label: "Summary", kind: "fields" },
];

const emptyDetailRow = () => ({
  item: "",
  itemCode: "",
  itemName: "",
  oldRate: 0,
  newRate: 0,
  validFrom: "",
  validTo: "",
  newValidDate: "",
});

const todayStr = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const formatDate = (value) =>
  value ? dayjs(value).format("YYYY-MM-DD") : "";

/* ---------------------------------------------------------------------------- */

const SalesContractAmendmentForm = ({ data, onBack }) => {
  const [orgId] = useState(Number(localStorage.getItem("orgId")) || 0);
  const [branch] = useState(
    Number(localStorage.getItem("branchId")) || 1000000001,
  );
  const loginUserName = localStorage.getItem("userName") || "SYSTEM";
  const { addToast } = useToast();

  const [activeChildTab, setActiveChildTab] = useState("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [plantOptions, setPlantOptions] = useState([]);
  const [contractOptions, setContractOptions] = useState([]);
  const [contractMap, setContractMap] = useState({});
  const [loadingPlants, setLoadingPlants] = useState(false);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [itemOptions, setItemOptions] = useState([]);
  const [itemMap, setItemMap] = useState({});
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadingRevision, setLoadingRevision] = useState(false);

  const [header, setHeader] = useState(() => ({
    plantId: data?.plantId?.id ?? data?.branch?.id ?? data?.branch ?? data?.plantId ?? "",
    contractAmdNo: data?.contractAmdNo || "",
    contractNo: data?.contractNo || "",
    date: formatDate(data?.date) || todayStr(),
    partyPOAmdNo: data?.partyPOAmdNo || "",
    contractDate: formatDate(data?.contractDate),
    partyPOAmdDate: formatDate(data?.partyPOAmdDate),
    custPONo: data?.custPoNo || data?.custPONo || "",
    revisionNo: data?.revisionNo || "REV-001",
    custPODate: formatDate(data?.custPoDate || data?.custPODate),
    active: data?.active !== false,
    cancelRemarks: data?.cancelRemarks || "",
  }));

  const [detailRows, setDetailRows] = useState(() => {
    const raw = data?.salesContractDetailResponseDTO || data?.details || [];
    if (raw.length) {
      return raw.map((item) => ({
        id: item.id,
        item:
          typeof item.item === "object"
            ? String(item.item.id ?? "")
            : String(item.item ?? ""),
        itemCode:
          typeof item.item === "object"
            ? item.item.itemCode || ""
            : item.itemCode || "",
        itemName:
          typeof item.item === "object"
            ? item.item.itemDescription || ""
            : item.itemName || "",
        oldRate: item.oldRate ?? 0,
        newRate: item.newRate ?? 0,
        validFrom: item.validFrom || "",
        validTo: item.validTo || "",
        newValidDate: item.newValidDate || "",
      }));
    }
    return [emptyDetailRow()];
  });

  const [summary, setSummary] = useState({
    remarks: data?.remarks || "",
  });

  /* ---------------- Lookup loading ---------------- */

  const loadPlants = useCallback(async () => {
    setLoadingPlants(true);
    try {
      let branches = [];
      try {
        branches = await branchAPI.getBranchByOrgId(orgId);
      } catch (err) {
        console.error("getBranchByOrgId failed, falling back:", err);
      }
      if (!branches || branches.length === 0) {
        branches = await salesContractAmendmentAPI.getBranches(orgId);
      }
      setPlantOptions(
        (branches || []).map((b) => ({
          value: b.id,
          label: b.branchName || b.branchCode || b.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load plant options:", error);
      setPlantOptions([]);
    } finally {
      setLoadingPlants(false);
    }
  }, [orgId]);

  const loadContracts = useCallback(async () => {
    const activeBranch = Number(header.plantId) || branch;
    if (!orgId || !activeBranch) {
      setContractOptions([]);
      setContractMap({});
      return;
    }
    setLoadingContracts(true);
    try {
      const list =
        await salesContractAmendmentAPI.getContractNoDropdown(
          orgId,
          activeBranch,
        );
      const valid = (list || []).filter((c) => c.contractNo);
      const map = {};
      valid.forEach((c) => {
        map[c.contractNo] = c;
      });
      setContractMap(map);
      setContractOptions(
        valid.map((c) => ({
          value: c.contractNo,
          label: c.contractNo,
        })),
      );
    } catch (error) {
      console.error("Failed to load contract numbers:", error);
      setContractOptions([]);
      setContractMap({});
    } finally {
      setLoadingContracts(false);
    }
  }, [orgId, branch, header.plantId]);

  const loadItems = useCallback(async () => {
    const activeBranch = Number(header.plantId) || branch;
    if (!orgId || !header.contractNo || !activeBranch) {
      setItemOptions([]);
      setItemMap({});
      return;
    }
    setLoadingItems(true);
    try {
      const items = await salesContractAmendmentAPI.getItemDropdown(
        orgId,
        activeBranch,
        header.contractNo,
      );
      const map = {};
      (items || []).forEach((it) => {
        const id = it.itemId ?? it.id ?? it.itemCode;
        if (id != null) map[String(id)] = it;
      });
      setItemMap(map);
      setItemOptions(
        (items || []).map((it) => {
          const val = String(it.itemId ?? it.id ?? it.itemCode ?? "");
          const lbl = it.itemDescription
            ? `${it.itemCode || it.code || val} - ${it.itemDescription}`
            : it.itemCode || it.code || val;
          return { value: val, label: lbl };
        }),
      );

      // Drop any previously selected item that no longer belongs to this contract
      setDetailRows((prev) => {
        let changed = false;
        const cleaned = prev.map((row) => {
          const key = row.item == null ? "" : String(row.item);
          if (key && !map[key]) {
            changed = true;
            return { ...row, item: "", itemCode: "", itemName: "", newRate: 0 };
          }
          return row;
        });
        return changed ? cleaned : prev;
      });
    } catch (error) {
      console.error("Failed to load contract items:", error);
      setItemOptions([]);
      setItemMap({});
    } finally {
      setLoadingItems(false);
    }
  }, [orgId, branch, header.plantId, header.contractNo]);

  useEffect(() => {
    if (orgId) loadPlants();
  }, [orgId, loadPlants]);

  useEffect(() => {
    if (orgId) loadContracts();
  }, [orgId, loadContracts]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Auto-fill P.O. details when a contract is selected
  useEffect(() => {
    const c = header.contractNo ? contractMap[header.contractNo] : null;
    if (c) {
      setHeader((prev) => ({
        ...prev,
        custPONo: c.custPoNo ?? prev.custPONo,
        custPODate: c.custPoDate ? formatDate(c.custPoDate) : prev.custPODate,
        contractDate: c.contractDate
          ? formatDate(c.contractDate)
          : prev.contractDate,
      }));
    } else if (!header.contractNo) {
      setHeader((prev) => ({
        ...prev,
        custPONo: "",
        custPODate: "",
        contractDate: "",
        revisionNo: "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [header.contractNo, contractMap]);

  // Fetch the revision number for the selected item
  const selectedItem = detailRows.find((r) => r.item)?.item || "";
  const activeBranch = Number(header.plantId) || branch;

  useEffect(() => {
    if (!orgId || !activeBranch || !header.contractNo || !selectedItem) return;
    setLoadingRevision(true);
    let cancelled = false;
    (async () => {
      try {
        const revisionNo = await salesContractAmendmentAPI.getRevisionNo(
          orgId,
          activeBranch,
          header.contractNo,
          Number(selectedItem),
        );
        if (!cancelled && revisionNo != null) {
          setHeader((prev) => ({ ...prev, revisionNo: String(revisionNo) }));
        }
      } catch (error) {
        console.error("Failed to load revision number:", error);
      } finally {
        if (!cancelled) setLoadingRevision(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orgId, activeBranch, header.contractNo, selectedItem]);

  /* ---------------- Handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    setSummary((prev) => ({ ...prev, [name]: value }));
  };

  const handleCellChange = (idx, key, value) => {
    setDetailRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        const next = { ...row, [key]: value };
        if (key === "item") {
          const item = itemMap[String(value)];
          if (item) {
            next.itemCode = item.itemCode || item.code || "";
            next.itemName = item.itemDescription || item.itemName || "";
            next.oldRate = item.oldRate ?? row.oldRate ?? 0;
            next.newRate =
              item.newRate != null ? item.newRate : row.newRate ?? 0;
          } else {
            next.itemCode = "";
            next.itemName = "";
            next.oldRate = 0;
            next.newRate = 0;
          }
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
    if (!header.contractNo) errors.contractNo = "Contract No is required";
    if (!header.date) errors.date = "Date is required";
    if (!header.partyPOAmdNo) errors.partyPOAmdNo = "Party P.O. Amd No is required";

    const hasValidRow = detailRows.some((r) => r.item && r.itemCode);
    if (!hasValidRow)
      errors.details =
        "Add at least one item with an Item Code selected";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);

    const detailsDTO = detailRows
      .filter((d) => d.item || d.itemCode)
      .map((d) => ({
        item: Number(d.item) || 0,
        oldRate: Number(d.oldRate) || 0,
        newRate: Number(d.newRate) || 0,
        validFrom: d.validFrom || "",
        validTo: d.validTo || "",
        newValidDate: d.newValidDate || "",
      }));

    const payload = {
      ...(isUpdate ? { id: data.id } : {}),
      orgId,
      branch: Number(header.plantId) || branch,
      contractAmdNo: header.contractAmdNo,
      contractNo: header.contractNo || "",
      contractDate: header.contractDate || "",
      date: header.date || "",
      partyPoAmdNo: header.partyPOAmdNo || "",
      partyPoAmdDate: header.partyPOAmdDate || "",
      custPoNo: header.custPONo || "",
      custPoDate: header.custPODate || "",
      revisionNo: header.revisionNo || "REV-001",
      cancelRemarks: header.cancelRemarks || "",
      active: header.active !== false,
      createdBy: loginUserName,
      remarks: summary.remarks || "",
      salesContractAmdDetailsDTO: detailsDTO,
    };

    try {
      const response = await salesContractAmendmentAPI.createUpdate(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Sales Contract Amendment updated successfully!"
              : "Sales Contract Amendment created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.paramObjectsMap?.message ||
            response?.message ||
            "Failed to save Sales Contract Amendment.",
        );
      }
    } catch (err) {
      console.error("Save SC Amendment Error:", err);
      if (err.response?.data) {
        addToast(
          err.response.data.message ||
            err.response.data.statusMessage ||
            err.response.data.error ||
            JSON.stringify(err.response.data),
        );
      } else {
        addToast(err?.message || "Something went wrong.");
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
          {data ? "Edit Sales Contract Amendment" : "Add Sales Contract Amendment"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Info ---------------- */}
        <div>
          <div className="flex items-center justify-between mb-2">
           
            {/* <div className="flex items-center gap-2">
              {/* <label className={labelClasses}>Active</label> */}
             {/*  <button
                type="button"
                onClick={() =>
                  setHeader((prev) => ({ ...prev, active: !prev.active }))
                }
                className={`relative flex items-center w-12 h-6 rounded-full transition-colors ${
                  header.active ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`absolute h-5 w-5 bg-white rounded-full shadow transition-transform ${
                    header.active ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div> */}
          </div>

          <div className={fieldGrid}>
            <Field
              type="select"
              label="Branch"
              name="plantId"
              value={header.plantId}
              onChange={handleHeaderChange}
              error={fieldErrors.plantId}
              options={plantOptions}
              loading={loadingPlants}
              required
            />
            <Field
              label="Contract Amd No"
              name="contractAmdNo"
              value={header.contractAmdNo}
              onChange={handleHeaderChange}
              disabled
              placeholder="Auto-generated"
            />
            <Field
              type="select"
              label="Contract No"
              name="contractNo"
              value={header.contractNo}
              onChange={handleHeaderChange}
              error={fieldErrors.contractNo}
              options={contractOptions}
              loading={loadingContracts}
              required
            />
            <Field
              type="date"
              label="Date"
              name="date"
              value={header.date}
              onChange={handleHeaderChange}
              error={fieldErrors.date}
              required
            />
            <Field
              label="Party P.O. Amd No"
              name="partyPOAmdNo"
              value={header.partyPOAmdNo}
              onChange={handleHeaderChange}
              error={fieldErrors.partyPOAmdNo}
              required
            />
            <Field
              type="date"
              label="Contract Date"
              name="contractDate"
              value={header.contractDate}
              onChange={handleHeaderChange}
            />
            <Field
              type="date"
              label="Party P.O. Amd Date"
              name="partyPOAmdDate"
              value={header.partyPOAmdDate}
              onChange={handleHeaderChange}
            />
            <Field
              label="Cust. P.O. No."
              name="custPONo"
              value={header.custPONo}
              onChange={handleHeaderChange}
              disabled
            />
            <Field
              label="Revision No"
              name="revisionNo"
              value={header.revisionNo}
              onChange={handleHeaderChange}
              disabled
              placeholder=""
            />
            <Field
              type="date"
              label="Cust. P.O. Date"
              name="custPODate"
              value={header.custPODate}
              onChange={handleHeaderChange}
              disabled
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
                  className={`px-4 py-1 text-xs font-semibold rounded-t whitespace-nowrap ${
                    activeChildTab === tab.key
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

          {/* Sales Contract Details tab */}
          {activeChildTab === "details" && (
            <div className="pt-3">
              <TableWrapper>
                <TableHead
                  headers={[
                    "#",
                    "Item Code",
                    "Item Description",
                    "Old Rate",
                    "New Rate",
                    "Valid From",
                    "Valid To",
                    "New Valid Date",
                    "Action",
                  ]}
                />
                <tbody>
                  {detailRows.map((row, idx) => (
                    <TableRow
                      key={row.id ?? idx}
                      index={idx}
                      onRemove={() => handleRemoveRow(idx)}
                      disabled={detailRows.length <= 1}
                    >
                      <td className="p-2 align-top min-w-[170px]">
                        <select
                          value={row.item ?? ""}
                          onChange={(e) => handleCellChange(idx, "item", e.target.value)}
                          disabled={loadingItems || !header.contractNo}
                          className={cellInputClasses}
                        >
                          <option value="">
                            {header.contractNo
                              ? "-- Select --"
                              : "-- Select --"}
                          </option>
                          {itemOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2 align-top min-w-[180px]">
                        <input
                          value={row.itemCode ?? ""}
                          readOnly
                          className={cellReadOnlyClasses}
                        />
                      </td>
                      <td className="p-2 align-top min-w-[140px]">
                        <input
                          type="number"
                          step="0.01"
                          value={row.oldRate ?? 0}
                          readOnly
                          className={cellReadOnlyClasses}
                        />
                      </td>
                      <td className="p-2 align-top min-w-[140px]">
                        <input
                          type="number"
                          step="0.01"
                          value={row.newRate ?? 0}
                          onChange={(e) =>
                            handleCellChange(idx, "newRate", parseFloat(e.target.value) || 0)
                          }
                          className={cellInputClasses}
                        />
                      </td>
                      <td className="p-2 align-top min-w-[140px]">
                        <input
                          type="date"
                          value={row.validFrom ?? ""}
                          readOnly
                          className={cellReadOnlyClasses}
                        />
                      </td>
                      <td className="p-2 align-top min-w-[140px]">
                        <input
                          type="date"
                          value={row.validTo ?? ""}
                          readOnly
                          className={cellReadOnlyClasses}
                        />
                      </td>
                      <td className="p-2 align-top min-w-[140px]">
                        <input
                          type="date"
                          value={row.newValidDate ?? ""}
                          onChange={(e) =>
                            handleCellChange(idx, "newValidDate", e.target.value)
                          }
                          className={cellInputClasses}
                        />
                      </td>
                    </TableRow>
                  ))}
                </tbody>
              </TableWrapper>
              {fieldErrors.details && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.details}
                </p>
              )}
            </div>
          )}

          {/* Summary tab */}
          {activeChildTab === "summary" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  type="textarea"
                  label="Remarks"
                  name="remarks"
                  value={summary.remarks}
                  onChange={handleSummaryChange}
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

export default SalesContractAmendmentForm;
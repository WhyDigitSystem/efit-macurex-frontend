import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";
import dailyInspectionCumRejectionDataAPI from "../../../api/quality/dailyInspectionCumRejectionDataAPI";
import branchAPI from "../../../api/branchAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import { employeeAPI } from "../../../api/employeeAPI";

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

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

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
        className={`h-5 w-5 rounded text-white flex items-center justify-center ${
          disabled
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
                <td
                  className={`p-2 align-top ${col.minWidth || ""}`}
                  key={col.key}
                >
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
              <td
                className={`p-2 align-top ${col.minWidth || ""}`}
                key={col.key}
              >
                <input
                  type={col.type === "number" ? "number" : "text"}
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
/* Helpers                                                                     */

// itemDescription is display only, it is not sent to the backend.
const emptyRow = () => ({
  fgItem: "",
  itemDescription: "",
  stock: "",
  rate: "",
  inspectionQty: "",
  acceptedQty: "",
  reworkQty: "",
  rejectionQty: "",
  scrapQty: "",
});

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");

// Indian FY starts in April.
// Sep 2026 -> 2026
// Feb 2027 -> 2026
const getFinancialYear = () => {
  const now = dayjs();

  return String(now.month() >= 3 ? now.year() : now.year() - 1);
};

const idOf = (v) => (v && typeof v === "object" ? (v.id ?? "") : (v ?? ""));

/* Location dropdown rows -> select options */
const toLocationOptions = (list) =>
  (list || []).map((l) => ({
    value: l.id,
    label: l.locationName || l.locationId || l.name || String(l.id),
  }));

/* Edit mode: find the detail array whatever backend named it */
const getDetailRows = (data) => {
  if (!data) return [];

  const key = Object.keys(data).find(
    (k) => /details/i.test(k) && Array.isArray(data[k]),
  );

  return key ? data[key] : [];
};

const mapDetailRows = (data) => {
  const raw = getDetailRows(data);

  return raw.length
    ? raw.map((d) => ({
        fgItem: idOf(d.fgItem),
        itemDescription: "",
        stock: d.stock ?? "",
        rate: d.rate ?? "",
        inspectionQty: d.inspectionQty ?? "",
        acceptedQty: d.acceptedQty ?? "",
        reworkQty: d.reworkQty ?? "",
        rejectionQty: d.rejectionQty ?? "",
        scrapQty: d.scrapQty ?? "",
      }))
    : [emptyRow()];
};

/* ---------------------------------------------------------------------------- */
/* Daily Inspection Cum Rejection Data Form                                    */

const DICRForm = ({ data, onBack }) => {
  const { addToast } = useToast();

  const orgId = Number(localStorage.getItem("orgId")) || 0;

  const branch = Number(localStorage.getItem("branchId")) || 0;

  const usersId = localStorage.getItem("usersId") || "";

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");

  const orgName = (
    userData?.companyVO?.companyName ||
    userData?.orgName ||
    ""
  ).trim();

  const isMacurex = ["mecurex", "macurex"].includes(orgName.toLowerCase());

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});

  /* -------------------------------------------------------------------------- */
  /* Header state                                                               */
  /* -------------------------------------------------------------------------- */

  const [header, setHeader] = useState(() => ({
    plantId: idOf(data?.plantId),

    belongsTo: idOf(data?.belongsTo),

    dicrNo: data?.docId || data?.dicrNo || data?.docNo || "",

    date: fmtDate(data?.docDate || data?.date || dayjs()),

    preparedBy: idOf(data?.preparedBy),

    fromLocation: idOf(data?.fromLocation),

    reworkLocation: idOf(data?.reworkLocation),

    rejectionLocation: idOf(data?.rejectionLocation),

    scrapLocation: idOf(data?.scrapLocation),

    toLocation: idOf(data?.toLocation),
  }));

  const [inspectionRows, setInspectionRows] = useState(() =>
    mapDetailRows(data),
  );

  /* -------------------------------------------------------------------------- */
  /* Lookup state                                                               */
  /* -------------------------------------------------------------------------- */

  const [plantOptions, setPlantOptions] = useState([]);

  const [belongsToOptions, setBelongsToOptions] = useState([]);

  const [employeeOptions, setEmployeeOptions] = useState([]);

  const [itemOptions, setItemOptions] = useState([]);

  const [fromLocationOptions, setFromLocationOptions] = useState([]);

  const [reworkLocationOptions, setReworkLocationOptions] = useState([]);

  const [rejectionLocationOptions, setRejectionLocationOptions] = useState([]);

  const [scrapLocationOptions, setScrapLocationOptions] = useState([]);

  const [toLocationOptionsState, setToLocationOptions] = useState([]);

  /* -------------------------------------------------------------------------- */
  /* Load Plants                                                                */
  /* -------------------------------------------------------------------------- */

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
            label: b.branchName || b.branchCode || b.id,
          })),
        );
      }
    } catch {
      setPlantOptions([]);
    }
  }, [orgId, isMacurex]);

  /* -------------------------------------------------------------------------- */
  /* Belongs To                                                                */
  /* -------------------------------------------------------------------------- */

  const loadBelongsTo = useCallback(async () => {
    try {
      const res = await dailyInspectionCumRejectionDataAPI.getBelongsTo(orgId);

      setBelongsToOptions(
        (res || []).map((v) => ({
          value: Number(v.id),
          label: v.valuesDescription,
        })),
      );
    } catch {
      setBelongsToOptions([]);
    }
  }, [orgId]);

  /* -------------------------------------------------------------------------- */
  /* Employees                                                                  */
  /* -------------------------------------------------------------------------- */

  const loadEmployees = useCallback(async () => {
    try {
      const res = await employeeAPI.getEmployeeByOrgId(orgId);

      setEmployeeOptions(
        (res || []).map((e) => ({
          value: e.id,
          label: e.employeeCode || e.employeeName || e.id,
        })),
      );
    } catch {
      setEmployeeOptions([]);
    }
  }, [orgId]);

  /* -------------------------------------------------------------------------- */
  /* FG Items                                                                   */
  /* -------------------------------------------------------------------------- */

  const loadItems = useCallback(async () => {
    try {
      const res = await dailyInspectionCumRejectionDataAPI.getFgItems(
        orgId,
        branch,
      );

      setItemOptions(
        (res || []).map((it) => ({
          value: it.itemId,
          label: it.itemCode || String(it.itemId),
          itemDescription: it.itemDescription || "",
        })),
      );
    } catch {
      setItemOptions([]);
    }
  }, [orgId, branch]);

  /* -------------------------------------------------------------------------- */
  /* Location Dropdowns                                                         */
  /* -------------------------------------------------------------------------- */

  const loadLocationDropdowns = useCallback(async () => {
    const api = dailyInspectionCumRejectionDataAPI;

    const safe = async (fn, setter) => {
      try {
        const result = await fn(orgId, branch);

        setter(toLocationOptions(result));
      } catch {
        setter([]);
      }
    };

    await Promise.all([
      safe(api.getFromLocations, setFromLocationOptions),

      safe(api.getReworkLocations, setReworkLocationOptions),

      safe(api.getRejectionLocations, setRejectionLocationOptions),

      safe(api.getScrapLocations, setScrapLocationOptions),

      // To Location -> /api/commonmaster/getLocationByOrgId (paramObjectsMap.transportList)
      safe(api.getToLocations, setToLocationOptions),
    ]);
  }, [orgId, branch]);

  /* -------------------------------------------------------------------------- */
  /* Initial API loading                                                        */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (orgId) {
      loadPlants();
    }
  }, [orgId, loadPlants]);

  useEffect(() => {
    if (orgId && branch) {
      loadBelongsTo();
      loadEmployees();
      loadItems();
      loadLocationDropdowns();
    }
  }, [
    orgId,
    branch,
    loadBelongsTo,
    loadEmployees,
    loadItems,
    loadLocationDropdowns,
  ]);

  /* -------------------------------------------------------------------------- */
  /* Generate DICR number                                                      */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (data || !orgId) return;

    (async () => {
      const docId = await dailyInspectionCumRejectionDataAPI.getDICRDocId(
        getFinancialYear(),
        orgId,
      );

      if (docId) {
        setHeader((prev) => ({
          ...prev,
          dicrNo: docId,
        }));
      }
    })();
  }, [data, orgId]);

  /* -------------------------------------------------------------------------- */
  /* Handlers                                                                   */
  /* -------------------------------------------------------------------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    setHeader((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCellChange = (idx, key, value) => {
    setInspectionRows((prev) =>
      prev.map((row, i) =>
        i === idx
          ? {
              ...row,
              [key]: value,
            }
          : row,
      ),
    );
  };

  const handleAddRow = () => setInspectionRows((prev) => [...prev, emptyRow()]);

  const handleRemoveRow = (idx) =>
    setInspectionRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx),
    );

  /* -------------------------------------------------------------------------- */
  /* Rows shown in the table (description looked up from the selected item)     */
  /* -------------------------------------------------------------------------- */

  const displayRows = useMemo(
    () =>
      inspectionRows.map((r) => ({
        ...r,
        itemDescription:
          itemOptions.find((o) => String(o.value) === String(r.fgItem))
            ?.itemDescription || "",
      })),
    [inspectionRows, itemOptions],
  );

  /* -------------------------------------------------------------------------- */
  /* Validation                                                                 */
  /* -------------------------------------------------------------------------- */

  const validate = () => {
    const errors = {};

    if (!header.plantId) {
      errors.plantId = "Plant ID is required";
    }

    if (!header.belongsTo) {
      errors.belongsTo = "Belongs To is required";
    }

    if (!header.preparedBy) {
      errors.preparedBy = "Prepared By is required";
    }

    if (!header.reworkLocation) {
      errors.reworkLocation = "Rework Location is required";
    }

    if (!header.rejectionLocation) {
      errors.rejectionLocation = "Rejection Location is required";
    }

    if (!header.scrapLocation) {
      errors.scrapLocation = "Scrap Location is required";
    }

    if (!header.toLocation) {
      errors.toLocation = "To Location is required";
    }

    const validRows = inspectionRows.filter(
      (r) => r.fgItem && r.inspectionQty !== "" && r.acceptedQty !== "",
    );

    if (!validRows.length) {
      errors.inspectionDetails =
        "Add at least one Inspection Detail row with FG Item Code, Inspection Qty and Accepted Qty";
    }

    inspectionRows.forEach((r, i) => {
      if (!r.fgItem) {
        errors[`detail.${i}.fgItem`] = "FG Item Code is required";
      }

      if (r.inspectionQty === "") {
        errors[`detail.${i}.inspectionQty`] = "Inspection Qty is required";
      }

      if (r.acceptedQty === "") {
        errors[`detail.${i}.acceptedQty`] = "Accepted Qty is required";
      }
    });

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  /* -------------------------------------------------------------------------- */
  /* Save                                                                       */
  /* -------------------------------------------------------------------------- */

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);

    const payload = {
      ...(isUpdate ? { id: data.id } : {}),

      orgId,

      branch,

      financialYear: String(data?.financialYear || getFinancialYear()),

      active: isUpdate
        ? data.active === true || data.active === "Active"
        : true,

      belongsTo: Number(header.belongsTo),

      preparedBy: Number(header.preparedBy),

      ...(header.fromLocation
        ? {
            fromLocation: Number(header.fromLocation),
          }
        : {}),

      reworkLocation: Number(header.reworkLocation),

      rejectionLocation: Number(header.rejectionLocation),

      scrapLocation: Number(header.scrapLocation),

      toLocation: Number(header.toLocation),

      dailyInspectionCumRejectionDataDetailsDTO: inspectionRows
        .filter((r) => r.fgItem)
        .map((r) => ({
          fgItem: Number(r.fgItem),

          stock: Number(r.stock) || 0,

          rate: Number(r.rate) || 0,

          inspectionQty: Number(r.inspectionQty) || 0,

          acceptedQty: Number(r.acceptedQty) || 0,

          reworkQty: Number(r.reworkQty) || 0,

          rejectionQty: Number(r.rejectionQty) || 0,

          scrapQty: Number(r.scrapQty) || 0,
        })),

      cancelRemarks: data?.cancelRemarks || "",

      createdBy: String(isUpdate ? data?.createdBy || usersId : usersId),
    };

    try {
      const response =
        await dailyInspectionCumRejectionDataAPI.createUpdateDICR(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Daily Inspection Cum Rejection Data updated successfully!"
              : "Daily Inspection Cum Rejection Data created successfully!"),
        );

        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.longMessage ||
            response?.errors?.[0]?.shortMessage ||
            response?.paramObjectsMap?.errorMessage ||
            response?.paramObjectsMap?.message ||
            response?.message ||
            "Failed to save Daily Inspection Cum Rejection Data.",
        );
      }
    } catch (err) {
      const body = err.response?.data;

      if (body) {
        addToast(
          body.errors?.[0]?.longMessage ||
            body.errors?.[0]?.shortMessage ||
            body.message ||
            body.statusMessage ||
            body.error ||
            JSON.stringify(body),
        );
      } else {
        addToast("Something went wrong.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* Render                                                                     */
  /* -------------------------------------------------------------------------- */

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
          {data
            ? "Edit Daily Inspection Cum Rejection Data"
            : "Add Daily Inspection Cum Rejection Data"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ------------------------------------------------------------------ */}
        {/* Inspection Header                                                  */}
        {/* ------------------------------------------------------------------ */}

        <div>
          <SectionHeader>Inspection Header</SectionHeader>

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
              required
            />

            <Field
              label="DICR No"
              name="dicrNo"
              value={header.dicrNo}
              onChange={handleHeaderChange}
              placeholder="Generated on save"
              disabled
            />

            <Field
              type="date"
              label="Date"
              name="date"
              value={header.date}
              onChange={handleHeaderChange}
              disabled
            />

            <Field
              type="select"
              label="Prepared By"
              name="preparedBy"
              value={header.preparedBy}
              onChange={handleHeaderChange}
              error={fieldErrors.preparedBy}
              options={employeeOptions}
              required
            />

            <Field
              type="select"
              label="From Location"
              name="fromLocation"
              value={header.fromLocation}
              onChange={handleHeaderChange}
              error={fieldErrors.fromLocation}
              options={fromLocationOptions}
            />

            <Field
              type="select"
              label="Rework Location"
              name="reworkLocation"
              value={header.reworkLocation}
              onChange={handleHeaderChange}
              error={fieldErrors.reworkLocation}
              options={reworkLocationOptions}
              required
            />

            <Field
              type="select"
              label="Rejection Location"
              name="rejectionLocation"
              value={header.rejectionLocation}
              onChange={handleHeaderChange}
              error={fieldErrors.rejectionLocation}
              options={rejectionLocationOptions}
              required
            />

            <Field
              type="select"
              label="Scrap Location"
              name="scrapLocation"
              value={header.scrapLocation}
              onChange={handleHeaderChange}
              error={fieldErrors.scrapLocation}
              options={scrapLocationOptions}
              required
            />

            <Field
              type="select"
              label="To Location"
              name="toLocation"
              value={header.toLocation}
              onChange={handleHeaderChange}
              error={fieldErrors.toLocation}
              options={toLocationOptionsState}
              required
            />
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Inspection Details                                                */}
        {/* ------------------------------------------------------------------ */}

        <div>
          <div className="flex items-center justify-between mb-2">
            <SectionHeader>Inspection Details</SectionHeader>

            <button
              type="button"
              onClick={handleAddRow}
              className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>

          <DynamicTable
            columns={[
              {
                key: "fgItem",
                label: "FG Item Code",
                type: "select",
                options: itemOptions,
                minWidth: "min-w-[140px]",
              },

              {
                key: "itemDescription",
                label: "Item Description",
                type: "text",
                readOnly: true,
                minWidth: "min-w-[220px]",
              },

              {
                key: "stock",
                label: "Stock",
                type: "number",
              },

              {
                key: "rate",
                label: "Rate",
                type: "number",
              },

              {
                key: "inspectionQty",
                label: "Inspection Qty",
                type: "number",
              },

              {
                key: "acceptedQty",
                label: "Accepted Qty",
                type: "number",
              },

              {
                key: "reworkQty",
                label: "Rework Qty",
                type: "number",
              },

              {
                key: "rejectionQty",
                label: "Rejection Qty",
                type: "number",
              },

              {
                key: "scrapQty",
                label: "Scrap Qty",
                type: "number",
              },
            ]}
            rows={displayRows}
            onCellChange={handleCellChange}
            onRemoveRow={handleRemoveRow}
          />

          {fieldErrors.inspectionDetails && (
            <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
              {fieldErrors.inspectionDetails}
            </p>
          )}

          {inspectionRows.some((r, i) => fieldErrors[`detail.${i}.fgItem`]) && (
            <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
              FG Item Code is required in every row
            </p>
          )}

          {inspectionRows.some(
            (r, i) => fieldErrors[`detail.${i}.inspectionQty`],
          ) && (
            <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
              Inspection Qty is required in every row
            </p>
          )}

          {inspectionRows.some(
            (r, i) => fieldErrors[`detail.${i}.acceptedQty`],
          ) && (
            <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
              Accepted Qty is required in every row
            </p>
          )}
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Buttons                                                            */}
        {/* ------------------------------------------------------------------ */}

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

export default DICRForm;

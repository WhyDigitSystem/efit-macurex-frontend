import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";
import dailyInspectionCumRejectionDataAPI from "../../../api/quality/dailyInspectionCumRejectionDataAPI";
import branchAPI from "../../../api/branchAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import { departmentAPI } from "../../../api/departmentAPI";
import { employeeAPI } from "../../../api/employeeAPI";
import itemAPI from "../../../api/itemAPI";

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
          rows={2}
          className={
            "w-full px-2 py-1.5 rounded border text-xs transition-colors resize-none scrollbar-hide " +
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
                    rows={2}
                    value={row[col.key] ?? ""}
                    onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                    className={
                      "w-full min-w-[180px] px-2 py-1 rounded border text-xs transition-colors resize-y scrollbar-hide " +
                      "bg-white dark:bg-gray-900 " +
                      "border-gray-300 dark:border-gray-600 " +
                      "text-gray-900 dark:text-gray-100 " +
                      "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
                      "dark:focus:ring-blue-400 dark:focus:border-blue-400"
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
                  value={row[col.key] ?? ""}
                  readOnly={col.readOnly}
                  onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                  className={col.readOnly ? cellReadOnlyClasses : cellInputClasses}
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

const DEFAULT_FROM_LOCATION = "QUALITY OUTWARD – MACUREX";

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");

const generateDICRNo = () =>
  `DICR-${dayjs().format("YYYYMMDD")}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;

/* ---------------------------------------------------------------------------- */
/* Daily Inspection Cum Rejection Data Form                                        */

const DICRForm = ({ data, onBack }) => {
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  /* ---------- Header state ---------- */
  const [header, setHeader] = useState(() => {
    const base = {
      plantId: data?.plantId?.id ?? data?.plantId ?? "",
      belongsTo: data?.belongsTo?.id ?? data?.belongsTo ?? "",
      dicrNo: data?.dicrNo || data?.docNo || "",
      date: data?.date ? fmtDate(data.date) : fmtDate(dayjs()),
      preparedBy: data?.preparedBy?.id ?? data?.preparedBy ?? "",
      fromLocation: data?.fromLocation?.id ?? data?.fromLocation ?? DEFAULT_FROM_LOCATION,
      reworkLocation: data?.reworkLocation?.id ?? data?.reworkLocation ?? "",
      rejectionLocation:
        data?.rejectionLocation?.id ?? data?.rejectionLocation ?? "",
      scrapLocation: data?.scrapLocation?.id ?? data?.scrapLocation ?? "",
      toLocation: data?.toLocation?.id ?? data?.toLocation ?? "",
    };
    if (!base.dicrNo) base.dicrNo = generateDICRNo();
    return base;
  });

  const [inspectionRows, setInspectionRows] = useState(() => {
    const raw = data?.inspectionDetails?.length
      ? data.inspectionDetails
      : data?.details?.length
        ? data.details
        : [];
    if (raw.length) {
      return raw.map((item) => ({
        fgItem: item.fgItem?.id ?? item.fgItem ?? "",
        fgItemDescription: item.fgItemDescription || item.fgName || "",
        stock: item.stock ?? "",
        rate: item.rate ?? "",
        inspectionQty: item.inspectionQty ?? "",
        acceptedQty: item.acceptedQty ?? "",
        dfficen: item.dfficen || item.dffIcen || "",
        reworkQty: item.reworkQty ?? "",
        rejectionQty: item.rejectionQty ?? "",
        scrapQty: item.scrapQty ?? "",
      }));
    }
    return [
      {
        fgItem: "",
        fgItemDescription: "",
        stock: "",
        rate: "",
        inspectionQty: "",
        acceptedQty: "",
        dfficen: "",
        reworkQty: "",
        rejectionQty: "",
        scrapQty: "",
      },
    ];
  });

  /* ---------- Lookup loading ---------- */

  const [plantOptions, setPlantOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);

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
    } catch (error) {
      console.error("Failed to load plant options:", error);
      setPlantOptions([]);
    }
  }, [orgId, isMacurex]);

  const loadLocations = useCallback(async () => {
    try {
      const res = await locationMasterAPI.getLocationMasterByOrgId(orgId, branch);
      const locationList = (res || []).map((l) => ({
        value: l.id,
        label: l.locationName || l.locationId || l.id,
      }));
      const hasDefault = locationList.some(
        (o) => o.label.toUpperCase().includes("QUALITY OUTWARD"),
      );
      const finalList = hasDefault
        ? locationList
        : [
            {
              value: DEFAULT_FROM_LOCATION,
              label: DEFAULT_FROM_LOCATION,
            },
            ...locationList,
          ];
      setLocationOptions(finalList);
    } catch (error) {
      console.error("Failed to load location options:", error);
      setLocationOptions([
        { value: DEFAULT_FROM_LOCATION, label: DEFAULT_FROM_LOCATION },
      ]);
    }
  }, [orgId, branch]);

  const loadDepartments = useCallback(async () => {
    try {
      const res = await departmentAPI.getAllDepartments(orgId, branch);
      const departments = res?.paramObjectsMap?.departmentVO || [];
      setDepartmentOptions(
        departments.map((d) => ({
          value: d.id,
          label: d.departmentName || d.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load department options:", error);
      setDepartmentOptions([]);
    }
  }, [orgId, branch]);

  const loadEmployees = useCallback(async () => {
    try {
      const res = await employeeAPI.getEmployeeByOrgId(orgId);
      setEmployeeOptions(
        (res || []).map((e) => ({
          value: e.id,
          label: e.employeeCode || e.employeeName || e.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load employee options:", error);
      setEmployeeOptions([]);
    }
  }, [orgId]);

  const loadItems = useCallback(async () => {
    try {
      const res = await itemAPI.getItems(orgId, branch);
      setItemOptions(
        (res || []).map((it) => ({
          value: it.id,
          label: it.itemCode || it.id,
          itemDescription: it.itemDescription || it.itemName || "",
        })),
      );
    } catch (error) {
      console.error("Failed to load item options:", error);
      setItemOptions([]);
    }
  }, [orgId, branch]);

  useEffect(() => {
    if (orgId) {
      loadPlants();
      loadLocations();
      loadDepartments();
      loadEmployees();
      loadItems();
    }
  }, [orgId, loadPlants, loadLocations, loadDepartments, loadEmployees, loadItems]);

  /* ---------------------------------------------------------------------------- */
  /* Handlers                                                                     */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  const handleCellChange = (idx, key, value) => {
    setInspectionRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        const next = { ...row, [key]: value };
        if (key === "fgItem") {
          const item = itemOptions.find((it) => String(it.value) === String(value));
          next.fgItemDescription = item?.itemDescription || "";
        }
        return next;
      }),
    );
  };

  const handleAddRow = () =>
    setInspectionRows((prev) => [
      ...prev,
      {
        fgItem: "",
        fgItemDescription: "",
        stock: "",
        rate: "",
        inspectionQty: "",
        acceptedQty: "",
        dfficen: "",
        reworkQty: "",
        rejectionQty: "",
        scrapQty: "",
      },
    ]);

  const handleRemoveRow = (idx) =>
    setInspectionRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx),
    );

  /* ---------------------------------------------------------------------------- */
  /* Validation & Save                                                            */

  const validate = () => {
    const errors = {};

    if (!header.plantId) errors.plantId = "Plant ID is required";
    if (!header.belongsTo) errors.belongsTo = "Belongs To is required";
    if (!header.dicrNo?.trim()) errors.dicrNo = "DICR No is required";
    if (!header.date) errors.date = "Date is required";
    if (!header.preparedBy) errors.preparedBy = "Prepared By is required";
    if (!header.reworkLocation)
      errors.reworkLocation = "Rework Location is required";
    if (!header.rejectionLocation)
      errors.rejectionLocation = "Rejection Location is required";
    if (!header.scrapLocation)
      errors.scrapLocation = "Scrap Location is required";
    if (!header.toLocation) errors.toLocation = "To Location is required";

    const validRows = inspectionRows.filter(
      (r) => r.fgItem && r.inspectionQty !== "" && r.acceptedQty !== "",
    );
    if (!validRows.length)
      errors.inspectionDetails =
        "Add at least one Inspection Detail row with FG Item Code, Inspection Qty and Accepted Qty";
    inspectionRows.forEach((r, i) => {
      if (!r.fgItem) errors[`detail.${i}.fgItem`] = "FG Item Code is required";
      if (r.inspectionQty === "" || r.inspectionQty === null || r.inspectionQty === undefined)
        errors[`detail.${i}.inspectionQty`] = "Inspection Qty is required";
      if (r.acceptedQty === "" || r.acceptedQty === null || r.acceptedQty === undefined)
        errors[`detail.${i}.acceptedQty`] = "Accepted Qty is required";
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);

    const payload = {
      ...(isUpdate ? { id: data.id } : {}),
      orgId,
      branch,
      ...header,
      inspectionDetails: inspectionRows.filter((r) => r.fgItem),
      createdBy: isUpdate ? data?.createdBy || usersId : usersId,
      ...(isUpdate ? { updatedBy: usersId } : {}),
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
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            response?.paramObjectsMap?.message ||
            "Failed to save Daily Inspection Cum Rejection Data.",
        );
      }
    } catch (err) {
      console.error("Save DICR Error:", err);
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

  /* ---------------------------------------------------------------------------- */

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
        {/* ---------------- Header Info ---------------- */}
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
              options={departmentOptions}
              required
            />
            <Field
              label="DICR No"
              name="dicrNo"
              value={header.dicrNo}
              onChange={handleHeaderChange}
              error={fieldErrors.dicrNo}
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
              options={locationOptions}
            />
            <Field
              type="select"
              label="Rework Location"
              name="reworkLocation"
              value={header.reworkLocation}
              onChange={handleHeaderChange}
              error={fieldErrors.reworkLocation}
              options={locationOptions}
              required
            />
            <Field
              type="select"
              label="Rejection Location"
              name="rejectionLocation"
              value={header.rejectionLocation}
              onChange={handleHeaderChange}
              error={fieldErrors.rejectionLocation}
              options={locationOptions}
              required
            />
            <Field
              type="select"
              label="Scrap Location"
              name="scrapLocation"
              value={header.scrapLocation}
              onChange={handleHeaderChange}
              error={fieldErrors.scrapLocation}
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
          </div>
        </div>

        {/* ---------------- Inspection Details ---------------- */}
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
              },
              {
                key: "fgItemDescription",
                label: "FG Item Description",
                type: "text",
                readOnly: true,
              },
              { key: "stock", label: "Stock", type: "number" },
              { key: "rate", label: "Rate", type: "number" },
              { key: "inspectionQty", label: "Inspection Qty", type: "number" },
              { key: "acceptedQty", label: "Accepted Qty", type: "number" },
              { key: "dfficen", label: "dff/icen", type: "text" },
              { key: "reworkQty", label: "Rework Qty", type: "number" },
              { key: "rejectionQty", label: "Rejection Qty", type: "number" },
              { key: "scrapQty", label: "Scrap Qty", type: "number" },
            ]}
            rows={inspectionRows}
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
          {inspectionRows.some((r, i) => fieldErrors[`detail.${i}.acceptedQty`]) && (
            <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
              Accepted Qty is required in every row
            </p>
          )}
        </div>
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

export default DICRForm;
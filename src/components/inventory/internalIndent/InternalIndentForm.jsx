import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import internalIndentAPI from "../../../api/Inventory/internalIndentAPI";
import branchAPI from "../../../api/branchAPI";
// CONFIRMED: departmentAPI.js exports a named export, not a default export
// (the earlier "does not provide an export named 'default'" error proved
// this). Reverted to named imports for both — employeeAPI.js follows the
// same module pattern in this codebase.
import { departmentAPI } from "../../../api/departmentAPI";
import { employeeAPI } from "../../../api/employeeAPI";
import itemAPI from "../../../api/itemAPI";
import { toast } from "../../../utils/toast";

/* ========================================================================= */
/* DESIGN TOKENS (match existing app styling)                                */
/* ========================================================================= */

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const cellInputClasses =
  "w-full h-8 px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-2 items-start";

/* ========================================================================= */
/* HELPERS                                                                  */
/* ========================================================================= */

const todayISO = () => new Date().toISOString().slice(0, 10);

const nowTime = () => new Date().toTimeString().slice(0, 5); // "HH:MM"

const pickArray = (source, keys) => {
  if (Array.isArray(source)) return source;

  for (const key of keys) {
    const value = key
      .split(".")
      .reduce((acc, k) => (acc ? acc[k] : undefined), source);

    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
};

const asId = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return value.id ?? "";
  return value;
};

const emptyHeader = () => ({
  branch: "",
  docId: "",
  belongTo: "",
  docDate: todayISO(),
  department: "",
  timeOfIndent: nowTime(),
});

const emptySummary = () => ({
  approvedByPM: "Pending",
  preparedBy: "",
  authorizedBy: "",
  remarks: "",
});

const emptyItemRow = () => ({
  itemCode: "",
  itemDescription: "",
  unit: "",
  unitLabel: "",
  requiredQty: "",
  purpose: "",
});

/* ========================================================================= */
/* FIELD                                                                     */
/* ========================================================================= */

const Field = ({
  label,
  name,
  value,
  onChange,
  error,
  required,
  type = "text",
  options = [],
  disabled = false,
  className = "",
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
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          className={`${controlClasses} ${error ? "border-red-500 focus:border-red-500" : ""}`}
        >
          <option value="">-- Select --</option>
          {(options || []).map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="text-[11px] text-red-500 mt-0.5">{error}</p>}
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
          value={value ?? ""}
          onChange={onChange}
          rows={4}
          disabled={disabled}
          placeholder={placeholder}
          className={
            "w-full px-2 py-1.5 rounded border text-xs leading-snug bg-white dark:bg-gray-900 " +
            "border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 " +
            `focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none ${error ? "border-red-500" : ""}`
          }
        />
        {error && <p className="text-[11px] text-red-500 mt-0.5">{error}</p>}
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
        value={value ?? ""}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`${controlClasses} ${error ? "border-red-500 focus:border-red-500" : ""}`}
      />
      {error && <p className="text-[11px] text-red-500 mt-0.5">{error}</p>}
    </div>
  );
};

const SectionHeader = ({ children }) => (
  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
    {children}
  </h3>
);

const TableWrapper = ({ children }) => (
  <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
    <table className="w-full text-xs">{children}</table>
  </div>
);

const TableHead = ({ headers }) => (
  <thead className="bg-gray-100 dark:bg-gray-700">
    <tr>
      {headers.map((header, index) => (
        <th
          key={index}
          className={`p-1 whitespace-nowrap dark:text-white ${
            index === 0
              ? "w-8 text-center"
              : index === headers.length - 1
                ? "w-20 text-center"
                : "text-left"
          }`}
        >
          {header}
        </th>
      ))}
    </tr>
  </thead>
);

/* ========================================================================= */
/* INTERNAL INDENT FORM                                                      */
/* ========================================================================= */

const InternalIndentForm = ({ onBack, onSave, editData }) => {
  const ORG_ID = Number(localStorage.getItem("orgId"));
  const BRANCH_ID = localStorage.getItem("branchId");
  // FIX: this app stores the financial year under the key "finYear" in
  // localStorage (confirmed against the working TransportBillForm doc-id
  // flow), not "financialYear". Reading the wrong key meant FINANCIAL_YEAR
  // was always "", which tripped the "orgId or financialYear is missing"
  // guard and blocked doc-id generation entirely.
  const FINANCIAL_YEAR = localStorage.getItem("finYear") || "";
  const USER_NAME =
    localStorage.getItem("userName") ||
    localStorage.getItem("username") ||
    "SYSTEM";

  const isEditMode = Boolean(editData?.id);

  const [loading, setLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("indentDetail");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loadingItemRow, setLoadingItemRow] = useState(null);
  const [generatingDocId, setGeneratingDocId] = useState(false);

  const [header, setHeader] = useState(emptyHeader());
  const [summary, setSummary] = useState(emptySummary());
  const [itemRows, setItemRows] = useState([emptyItemRow()]);

  /* ----------------------------------------------------------------------- */
  /* MASTER DATA - real dropdowns, same pattern as PurchaseIndentForm         */
  /* ----------------------------------------------------------------------- */

  const [branchOptions, setBranchOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);

  const loadBranches = useCallback(async () => {
    try {
      const response = await branchAPI.getBranchByOrgId(ORG_ID);

      setBranchOptions(
        (response || []).map((branch) => ({
          id: branch.id,
          label: branch.branchName,
        })),
      );
    } catch (error) {
      console.error("Failed to load branches:", error);
      setBranchOptions([]);
    }
  }, [ORG_ID]);

  const loadDepartments = useCallback(async () => {
    try {
      const response = await departmentAPI.getAllDepartments(ORG_ID);

      const list = pickArray(response, [
        "paramObjectsMap.departmentVO",
        "paramObjectsMap.departmentMasterVO",
        "paramObjectsMap.departmentList",
        "paramObjectsMap.department",
        "data.paramObjectsMap.departmentVO",
      ]);

      setDepartmentOptions(
        list.map((department) => ({
          id: department.id,
          label: department.departmentName ?? department.name,
        })),
      );
    } catch (error) {
      console.error("Failed to load departments:", error);
      setDepartmentOptions([]);
    }
  }, [ORG_ID]);

  const loadEmployees = useCallback(async () => {
    try {
      const response = await employeeAPI.getEmployeeByOrgId(ORG_ID);

      setEmployeeOptions(
        (response || []).map((employee) => ({
          id: employee.id,
          label: employee.employeeName,
        })),
      );
    } catch (error) {
      console.error("Failed to load employees:", error);
      setEmployeeOptions([]);
    }
  }, [ORG_ID]);

  const loadItems = useCallback(async () => {
    try {
      const response = await itemAPI.getItems(ORG_ID, BRANCH_ID);

      setItemOptions(
        (response || []).map((item) => ({
          id: item.id,
          label: item.itemCode ?? item.code ?? item.itemName,
        })),
      );
    } catch (error) {
      console.error("Failed to load items:", error);
      setItemOptions([]);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadBranches();
    loadDepartments();
    loadEmployees();
    loadItems();
  }, [loadBranches, loadDepartments, loadEmployees, loadItems]);

  const approvalOptions = useMemo(
    () => [
      { id: "Pending", label: "Pending" },
      { id: "Approved", label: "Approved" },
      { id: "Rejected", label: "Rejected" },
    ],
    [],
  );

  /* ----------------------------------------------------------------------- */
  /* LOAD EDIT DATA (via getInternalIndentById - not from the list row)       */
  /* ----------------------------------------------------------------------- */

  useEffect(() => {
    if (!isEditMode) {
      setHeader({
        ...emptyHeader(),
        branch: BRANCH_ID ? String(BRANCH_ID) : "",
      });
      setSummary(emptySummary());
      setItemRows([emptyItemRow()]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadEditData = async () => {
      setLoading(true);

      try {
        const data = await internalIndentAPI.getInternalIndentById(editData.id);

        if (cancelled) return;

        if (!data) {
          toast.error("Internal Indent details not found");
          return;
        }

        setHeader({
          branch: asId(data.branch),
          docId: data.docId || "",
          belongTo: data.belongTo || "",
          docDate: data.docDate || todayISO(),
          department: asId(data.department),
          // FIX #3: trim any "HH:MM:SS" coming back from the API down to
          // "HH:MM" so the <input type="time"> can actually display it.
          timeOfIndent: (data.timeOfIndent || nowTime()).slice(0, 5),
        });

        setSummary({
          approvedByPM: data.approvedByPM || "Pending",
          preparedBy: asId(data.preparedBy?.employeeId ?? data.preparedBy),
          authorizedBy: asId(
            data.authorizedBy?.employeeId ?? data.authorizedBy,
          ),
          remarks: data.remarks || "",
        });

        const details = data.internalIndentDetailsResponseDTO || [];

        setItemRows(
          details.length > 0
            ? details.map((detail) => ({
                itemCode: asId(detail.item),
                itemDescription: detail.item?.itemDescription || "",
                unit: asId(detail.item?.unit),
                unitLabel:
                  detail.item?.unit?.unitName ?? detail.item?.unit?.name ?? "",
                requiredQty: detail.requiredQty ?? "",
                purpose: detail.purpose || "",
              }))
            : [emptyItemRow()],
        );

        setHeader((prev) => ({ ...prev }));
      } catch (error) {
        console.error("Error loading Internal Indent:", error);
        toast.error("Failed to load Internal Indent details");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadEditData();

    return () => {
      cancelled = true;
    };
  }, [editData?.id, isEditMode, BRANCH_ID]);

  /* ----------------------------------------------------------------------- */
  /* GENERATE DOC ID FOR NEW RECORD ONLY (never regenerate on edit)           */
  /* ----------------------------------------------------------------------- */

  useEffect(() => {
    if (isEditMode) return;

    const generateDocId = async () => {
      console.log("========== INTERNAL INDENT DOC ID ==========");
      console.log("ORG_ID:", ORG_ID);
      console.log("FINANCIAL_YEAR:", FINANCIAL_YEAR);
      console.log("BRANCH_ID:", BRANCH_ID);

      if (!ORG_ID || !FINANCIAL_YEAR) {
        console.warn("orgId or financialYear is missing", {
          ORG_ID,
          FINANCIAL_YEAR,
        });

        toast.error("Organization ID or Financial Year is missing");
        return;
      }

      setGeneratingDocId(true);

      // Clear old/generated document number before requesting a new one
      setHeader((prev) => ({
        ...prev,
        docId: "",
      }));

      try {
        const docId = await internalIndentAPI.getInternalIndentDocId({
          orgId: ORG_ID,
          financialYear: FINANCIAL_YEAR,
        });

        console.log("========== GENERATED INTERNAL INDENT DOC ID ==========");
        console.log("docId:", docId);

        if (!docId) {
          toast.error(
            "Document number was not generated. Please check Document Type Mapping.",
          );
          return;
        }

        setHeader((prev) => ({
          ...prev,
          docId: docId,
        }));
      } catch (error) {
        console.error("========== INTERNAL INDENT DOC ID ERROR ==========");

        console.error("Full error:", error);

        const errorData = error?.response?.data;

        console.error("Backend error response:", errorData);

        const message =
          errorData?.paramObjectsMap?.errorMessage ||
          errorData?.paramObjectsMap?.message ||
          errorData?.message ||
          error?.message ||
          "Failed to generate document number";

        toast.error(message);
      } finally {
        setGeneratingDocId(false);
      }
    };

    generateDocId();
  }, [isEditMode, ORG_ID, FINANCIAL_YEAR]);

  /* ----------------------------------------------------------------------- */
  /* FIELD HANDLERS                                                          */
  /* ----------------------------------------------------------------------- */

  const handleHeaderChange = (event) => {
    const { name, value } = event.target;
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  const handleSummaryChange = (event) => {
    const { name, value } = event.target;
    setSummary((prev) => ({ ...prev, [name]: value }));
  };

  // FIX #5: guard against a stale response landing on the wrong row if rows
  // are added/removed while an item lookup is still in flight. We capture the
  // itemId we fetched for and only apply the result if that row still wants it.
  const handleItemSelect = async (index, itemId) => {
    setItemRows((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...emptyItemRow(),
              itemCode: itemId,
              requiredQty: row.requiredQty,
              purpose: row.purpose,
            }
          : row,
      ),
    );

    if (!itemId) return;

    setLoadingItemRow(index);

    try {
      const itemDetail = await itemAPI.getItemById(itemId);

      if (!itemDetail) return;

      const unitObject =
        itemDetail.unit ?? itemDetail.primaryUnits ?? itemDetail.uom ?? null;

      setItemRows((prev) =>
        prev.map((row, rowIndex) => {
          if (rowIndex !== index) return row;
          // Row was changed to a different item while this fetch was in
          // flight - don't clobber it with stale data.
          if (String(row.itemCode) !== String(itemId)) return row;

          return {
            ...row,
            itemDescription:
              itemDetail.itemDescription ?? itemDetail.description ?? "",
            unit: unitObject?.id ?? "",
            unitLabel:
              unitObject?.unitName ??
              unitObject?.primaryUnit ??
              unitObject?.name ??
              "",
          };
        }),
      );
    } catch (error) {
      console.error("Failed to load item:", error);
    } finally {
      setLoadingItemRow((current) => (current === index ? null : current));
    }
  };

  const handleItemChange = (index, key, value) => {
    if (key === "itemCode") {
      handleItemSelect(index, value);
      return;
    }

    setItemRows((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: value } : row,
      ),
    );
  };

  const addItemRow = () => setItemRows((prev) => [...prev, emptyItemRow()]);

  const removeItemRow = (index) => {
    setItemRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== index),
    );
  };

  /* ----------------------------------------------------------------------- */
  /* VALIDATION                                                              */
  /* ----------------------------------------------------------------------- */

  const validate = () => {
    const errors = {};

    if (!header.branch) errors.branch = "Branch is required";
    if (!header.docDate) errors.docDate = "Doc Date is required";
    if (!header.department) errors.department = "Department is required";

    if (!itemRows.length) {
      errors.items = "At least one item is required";
    }

    itemRows.forEach((row, index) => {
      if (!row.itemCode) {
        errors[`itemCode_${index}`] = "Item is required";
      }

      if (row.requiredQty === "" || Number(row.requiredQty) <= 0) {
        errors[`requiredQty_${index}`] =
          "Required quantity must be greater than 0";
      }
    });

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error(Object.values(errors)[0]);
      return false;
    }

    return true;
  };

  /* ----------------------------------------------------------------------- */
  /* BUILD PAYLOAD                                                           */
  /* ----------------------------------------------------------------------- */

  const buildPayload = () => {
    const payload = {
      ...(isEditMode && editData?.id
        ? {
            id: Number(editData.id),
          }
        : {}),

      branch: header.branch ? Number(header.branch) : null,

      belongTo: header.belongTo || "Domestic",

      // FIX: was hard-coded to "" which caused the backend to fail its
      // Document Type Mapping lookup. Send the actual generated/loaded docId.
      docId: header.docId || "",

      docDate: header.docDate || todayISO(),

      department: header.department ? Number(header.department) : null,

      // FIX: backend needs financialYear to resolve the Document Type Mapping,
      // same value used to generate the docId in the first place.
      financialYear: FINANCIAL_YEAR,

      timeOfIndent: header.timeOfIndent
        ? header.timeOfIndent.length === 5
          ? `${header.timeOfIndent}:00`
          : header.timeOfIndent
        : "00:00:00",

      approvedByPM: summary.approvedByPM || "Pending",

      preparedBy:
        summary.preparedBy !== "" &&
        summary.preparedBy !== null &&
        summary.preparedBy !== undefined
          ? Number(summary.preparedBy)
          : null,

      authorizedBy:
        summary.authorizedBy !== "" &&
        summary.authorizedBy !== null &&
        summary.authorizedBy !== undefined
          ? Number(summary.authorizedBy)
          : null,

      remarks: summary.remarks || "",

      // FIX: API expects this key even if empty.
      cancelRemarks: editData?.cancelRemarks || "",

      orgId: Number(ORG_ID),

      active: true,

      createdBy: editData?.createdBy || USER_NAME,

      // FIX: key renamed from internalIndentDetailsResponseDTO ->
      // internalIndentDetailsDTO to match the API's expected request shape
      // (the "Response" suffix is only used on the way BACK from the server).
      internalIndentDetailsDTO: itemRows
        .filter((row) => row.itemCode)
        .map((row) => ({
          item: Number(row.itemCode),
          requiredQty: Number(row.requiredQty),
          purpose: row.purpose?.trim() || "",
        })),
    };

    console.log("========== INTERNAL INDENT FINAL PAYLOAD ==========");
    console.log(JSON.stringify(payload, null, 2));

    return payload;
  };

  /* ----------------------------------------------------------------------- */
  /* SAVE - the ONLY place that calls the save API. Master must not call it. */
  /* ----------------------------------------------------------------------- */ 

  const handleSave = async () => {
    if (isSubmitting) return;
    if (!validate()) return;

    const payload = buildPayload();

    try {
      setIsSubmitting(true);

      const response =
        await internalIndentAPI.updateCreateInternalIndent(payload);

      const success =
        response?.status === true || response?.statusFlag === "Ok";

      if (!success) {
        const message =
          response?.paramObjectsMap?.errorMessage ||
          response?.paramObjectsMap?.message ||
          response?.message ||
          "Failed to save Internal Indent";
        toast.error(message);
        return;
      }

      toast.success(
        isEditMode
          ? "Internal Indent updated successfully"
          : "Internal Indent created successfully",
      );

      // Master's onSave only switches the screen - it does not save again.
      onSave?.(response?.paramObjectsMap?.internalIndentVO || payload);
    } catch (error) {
      console.error("Internal Indent save error:", error);
      const message =
        error?.response?.data?.paramObjectsMap?.errorMessage ||
        error?.response?.data?.paramObjectsMap?.message ||
        "Failed to save Internal Indent";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ----------------------------------------------------------------------- */
  /* RENDER                                                                  */
  /* ----------------------------------------------------------------------- */

  return (
    <div className="p-2 max-w-7xl">
      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {isEditMode ? "Edit Internal Indent" : "Internal Indent"}
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        <div>
          <SectionHeader>Indent Details</SectionHeader>
          <div className={fieldGrid}>
            <Field
              type="select"
              label="Branch"
              name="branch"
              value={header.branch}
              onChange={handleHeaderChange}
              options={branchOptions}
              error={fieldErrors.branch}
              required
              disabled={isEditMode}
            />
            <Field
              label="Doc ID"
              name="docId"
              value={header.docId}
              placeholder={generatingDocId ? "Generating..." : ""}
              disabled
            />
            <Field
              label="Belongs To"
              name="belongTo"
              value={header.belongTo}
              onChange={handleHeaderChange}
            />
            <Field
              type="date"
              label="Doc Date"
              name="docDate"
              value={header.docDate}
              onChange={handleHeaderChange}
              error={fieldErrors.docDate}
              required
            />
            <Field
              type="select"
              label="Department"
              name="department"
              value={header.department}
              onChange={handleHeaderChange}
              options={departmentOptions}
              error={fieldErrors.department}
              required
            />
            <Field
              type="time"
              label="Time Of Indent"
              name="timeOfIndent"
              value={header.timeOfIndent}
              onChange={handleHeaderChange}
            />
          </div>
        </div>

        <section>
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
            <div className="flex">
              <button
                type="button"
                onClick={() => setActiveTab("indentDetail")}
                className={`px-4 py-1 text-xs font-semibold rounded-t ${
                  activeTab === "indentDetail"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                1-Indent Detail
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("summary")}
                className={`px-4 py-1 text-xs font-semibold rounded-t ${
                  activeTab === "summary"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                2-Summary
              </button>
            </div>

            {activeTab === "indentDetail" && (
              <button
                type="button"
                onClick={addItemRow}
                disabled={isSubmitting}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {activeTab === "indentDetail" && (
            <div className="mt-2">
              <TableWrapper>
                <TableHead
                  headers={[
                    "#",
                    "Item Code",
                    "Item Description",
                    "Unit",
                    "Required Qty",
                    "Purpose",
                    "Action",
                  ]}
                />
                <tbody>
                  {itemRows.map((row, index) => (
                    <tr
                      key={index}
                      className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="p-1 text-center dark:text-white">
                        {index + 1}
                      </td>

                      <td className="p-1 align-top">
                        <select
                          value={row.itemCode}
                          onChange={(e) =>
                            handleItemChange(index, "itemCode", e.target.value)
                          }
                          className={cellInputClasses}
                        >
                          <option value="">-- Select Item --</option>
                          {itemOptions.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                        {fieldErrors[`itemCode_${index}`] && (
                          <p className="text-[10px] text-red-500 mt-0.5">
                            {fieldErrors[`itemCode_${index}`]}
                          </p>
                        )}
                      </td>

                      <td className="p-1 align-top">
                        <input
                          type="text"
                          value={
                            loadingItemRow === index
                              ? "Loading..."
                              : row.itemDescription || ""
                          }
                          readOnly
                          className={`${cellInputClasses} bg-gray-50 dark:bg-gray-800`}
                        />
                      </td>

                      <td className="p-1 align-top">
                        <input
                          type="text"
                          value={row.unitLabel || ""}
                          readOnly
                          className={`${cellInputClasses} bg-gray-50 dark:bg-gray-800`}
                        />
                      </td>

                      <td className="p-1 align-top">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={row.requiredQty}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "requiredQty",
                              e.target.value,
                            )
                          }
                          className={cellInputClasses}
                        />
                        {fieldErrors[`requiredQty_${index}`] && (
                          <p className="text-[10px] text-red-500 mt-0.5">
                            {fieldErrors[`requiredQty_${index}`]}
                          </p>
                        )}
                      </td>

                      <td className="p-1 align-top">
                        <input
                          type="text"
                          value={row.purpose || ""}
                          onChange={(e) =>
                            handleItemChange(index, "purpose", e.target.value)
                          }
                          className={cellInputClasses}
                        />
                      </td>

                      <td className="p-1 text-center">
                        <button
                          type="button"
                          onClick={() => removeItemRow(index)}
                          disabled={itemRows.length <= 1 || isSubmitting}
                          className={`h-5 w-5 rounded text-white inline-flex items-center justify-center ${
                            itemRows.length <= 1 || isSubmitting
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-red-600 hover:bg-red-700"
                          }`}
                        >
                          <Trash2 size={10} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </TableWrapper>
            </div>
          )}

          {activeTab === "summary" && (
            <div className="pt-3">
              <div className={fieldGrid}>
                <Field
                  type="select"
                  label="Approved By PM"
                  name="approvedByPM"
                  value={summary.approvedByPM}
                  onChange={handleSummaryChange}
                  options={approvalOptions}
                />
                <Field
                  type="select"
                  label="Prepared By"
                  name="preparedBy"
                  value={summary.preparedBy}
                  onChange={handleSummaryChange}
                  options={employeeOptions}
                />
                <Field
                  type="select"
                  label="Authorised By"
                  name="authorizedBy"
                  value={summary.authorizedBy}
                  onChange={handleSummaryChange}
                  options={employeeOptions}
                />
                <Field
                  type="textarea"
                  label="Remarks"
                  name="remarks"
                  value={summary.remarks}
                  onChange={handleSummaryChange}
                  className="col-span-2 md:col-span-4 xl:col-span-6"
                />
              </div>
            </div>
          )}
        </section>

        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60"
          >
            <X className="h-3 w-3" />
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting || loading}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
          >
            <Save className="h-3 w-3" />
            {isSubmitting ? "Saving..." : isEditMode ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InternalIndentForm;

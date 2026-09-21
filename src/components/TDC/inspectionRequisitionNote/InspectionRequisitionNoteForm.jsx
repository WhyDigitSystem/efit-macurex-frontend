import { ArrowLeft, Save, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";
import inspectionRequisitionNoteAPI from "../../../api/TDC/inspectionRequisitionNoteAPI";
import { employeeAPI } from "../../../api/employeeAPI";

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

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-x-4 gap-y-3 items-start";

// Spacious grid used inside the child tabs so fields breathe more.
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
/* Static config                                                               */

// Each manager tab maps 1:1 to a department used by
// getEmployeesByDepartmentforBOMCorrectionRequestNote, and to the flat
// sign/date field names actually present on inspectionRequisitionNoteDTO.
const MANAGER_TABS = [
  {
    key: "managerPurchase",
    label: "Manager-Purchase",
    department: "Purchase",
    signField: "purchaseManager",
    dateField: "purchaseManagerDate",
  },
  {
    key: "managerTdc",
    label: "Manager-TDC",
    department: "TDC",
    signField: "tdcManager",
    dateField: "tdcManagerDate",
  },
  {
    key: "managerQuality",
    label: "Manager-Quality",
    department: "Quality",
    signField: "qualityManager",
    dateField: "qualityManagerDate",
  },
  {
    key: "managerProduction",
    label: "Manager-Production",
    department: "Production",
    signField: "productionManager",
    dateField: "productionManagerDate",
  },
];

const CHILD_TABS = [
  ...MANAGER_TABS.map((t) => ({ key: t.key, label: t.label })),
  { key: "requestApprove", label: "Request and Approve" },
];

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");

// inspectionRequisitionNoteDTO requires a financialYear string but there is
// no dedicated doc-type-mapping endpoint confirmed for this screen yet, so
// this derives it from the header date using the standard Apr-Mar cycle
// (matches the "26-27" style used elsewhere in the app).
const getFinancialYear = (dateStr) => {
  if (!dateStr) return "";
  const d = dayjs(dateStr);
  const year = d.year();
  const month = d.month() + 1; // dayjs months are 0-indexed
  const startYear = month >= 4 ? year : year - 1;
  return `${startYear}-${String(startYear + 1).slice(-2)}`;
};

/* ---------------------------------------------------------------------------- */

const InspectionRequisitionNoteForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId")) || 0;
  const branchId = Number(localStorage.getItem("branchId")) || 0;
  const usersId = localStorage.getItem("usersId");

  const [activeChildTab, setActiveChildTab] = useState(MANAGER_TABS[0].key);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Dropdown sources
  const [requestedByOptions, setRequestedByOptions] = useState([]); // header - list-values (PURCHASE/TDC)
  const [productCategoryOptions, setProductCategoryOptions] = useState([]); // header - list-values
  const [employeeMasterOptions, setEmployeeMasterOptions] = useState([]); // Request & Approve tab
  const [departmentEmployees, setDepartmentEmployees] = useState({
    Purchase: [],
    TDC: [],
    Quality: [],
    Production: [],
  });

  const [header, setHeader] = useState(() => ({
    requestedBy: data?.requestedBy || "",
    productCategory: data?.productCategory || "",
    date: fmtDate(data?.date) || dayjs().format("YYYY-MM-DD"),
    samplesSubmittedTo: data?.samplesSubmittedTo || "",
    partName: data?.partName || "",
    partNumber: data?.partNumber || "",
    sampleQuantity: data?.sampleQuantity ?? "",
    product: data?.product || "",
    customer: data?.customer || "",
    supplier: data?.supplier || "",
    reasonForInspectionRequest: data?.reasonForInspectionRequest || "",
    requestComments: data?.requestComments || "",
    active: data?.active !== false,
  }));

  // One { sign, date } pair per manager tab, keyed by tab key.
  const [managerValues, setManagerValues] = useState(() =>
    MANAGER_TABS.reduce((acc, tab) => {
      acc[tab.key] = {
        sign: data?.[tab.signField] ?? "",
        date: fmtDate(data?.[tab.dateField]) || "",
      };
      return acc;
    }, {}),
  );

  const [requestApprove, setRequestApprove] = useState({
    requestedBy: data?.approvalRequestedBy ?? "",
    approvedBy: data?.approvedBy ?? "",
  });

  /* ---------------- Lookup loading ---------------- */

  const loadHeaderLookups = useCallback(async () => {
    try {
      const [requestedBy, productCategory] = await Promise.all([
        inspectionRequisitionNoteAPI.getRequestedByList(orgId),
        inspectionRequisitionNoteAPI.getProductCategoryList(orgId),
      ]);
      setRequestedByOptions(
        (requestedBy || []).map((v) => ({
          value: v.valuesDescription,
          label: v.valuesDescription,
        })),
      );
      setProductCategoryOptions(
        (productCategory || []).map((v) => ({
          value: v.valuesDescription,
          label: v.valuesDescription,
        })),
      );
    } catch (error) {
      console.error("Failed to load header dropdown lists:", error);
      setRequestedByOptions([]);
      setProductCategoryOptions([]);
    }
  }, [orgId]);

  const loadEmployeeMaster = useCallback(async () => {
    try {
      const res = await employeeAPI.getEmployeeByOrgId(orgId);
      setEmployeeMasterOptions(
        (res || []).map((e) => ({
          value: e.id,
          label: e.employeeName || e.name || e.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load employee master options:", error);
      setEmployeeMasterOptions([]);
    }
  }, [orgId]);

  const loadDepartmentEmployees = useCallback(async () => {
    try {
      const results = await Promise.all(
        MANAGER_TABS.map((tab) =>
          inspectionRequisitionNoteAPI.getEmployeesByDepartment(
            branchId,
            tab.department,
            orgId,
          ),
        ),
      );
      const next = {};
      MANAGER_TABS.forEach((tab, idx) => {
        next[tab.department] = (results[idx] || []).map((e) => ({
          value: e.employeeId,
          label: e.employeeName || e.employeeCode || e.employeeId,
        }));
      });
      setDepartmentEmployees(next);
    } catch (error) {
      console.error("Failed to load department employees:", error);
    }
  }, [branchId, orgId]);

  useEffect(() => {
    if (orgId) {
      loadHeaderLookups();
      loadEmployeeMaster();
    }
    if (orgId && branchId) {
      loadDepartmentEmployees();
    }
  }, [
    orgId,
    branchId,
    loadHeaderLookups,
    loadEmployeeMaster,
    loadDepartmentEmployees,
  ]);

  /* ---------------- Handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  const handleManagerChange = (tabKey) => (e) => {
    const { name, value } = e.target;
    const errKey = `${tabKey}.${name}`;
    if (fieldErrors[errKey])
      setFieldErrors((prev) => ({ ...prev, [errKey]: "" }));
    setManagerValues((prev) => ({
      ...prev,
      [tabKey]: { ...prev[tabKey], [name]: value },
    }));
  };

  const handleRequestApproveChange = (e) => {
    const { name, value } = e.target;
    const errKey = `requestApprove.${name}`;
    if (fieldErrors[errKey])
      setFieldErrors((prev) => ({ ...prev, [errKey]: "" }));
    setRequestApprove((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------- Validation & Save ---------------- */

  const validate = () => {
    const errors = {};

    if (!header.requestedBy) errors.requestedBy = "Requested By is required";
    if (!header.productCategory)
      errors.productCategory = "Product Category is required";
    if (!header.date) errors.date = "Date is required";
    if (!header.partName?.trim()) errors.partName = "Part Name is required";
    if (!header.partNumber?.trim())
      errors.partNumber = "Part Number is required";
    if (!(Number(header.sampleQuantity) > 0))
      errors.sampleQuantity = "Sample Quantity is required";
    if (!header.reasonForInspectionRequest?.trim())
      errors.reasonForInspectionRequest =
        "Reason for Inspection Request is required";

    MANAGER_TABS.forEach((tab) => {
      const v = managerValues[tab.key];
      if (!v?.sign) errors[`${tab.key}.sign`] = "Sign is required";
      if (!v?.date) errors[`${tab.key}.date`] = "Date is required";
    });

    if (!requestApprove.requestedBy)
      errors["requestApprove.requestedBy"] = "Requested By is required";
    if (!requestApprove.approvedBy)
      errors["requestApprove.approvedBy"] = "Approved By is required";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);

    // Flat payload matching the actual inspectionRequisitionNoteDTO - no
    // irnNo (not part of the DTO) and no nested manager/approval objects.
    const payload = {
      ...(isUpdate ? { id: data.id } : {}),
      orgId,
      branch: branchId,
      requestedBy: header.requestedBy,
      productCategory: header.productCategory,
      date: header.date,
      docDate: header.date,
      financialYear: getFinancialYear(header.date),
      samplesSubmittedTo: header.samplesSubmittedTo,
      partName: header.partName,
      partNumber: header.partNumber,
      sampleQuantity: Number(header.sampleQuantity) || 0,
      product: header.product,
      customer: header.customer,
      supplier: header.supplier,
      reasonForInspectionRequest: header.reasonForInspectionRequest,
      requestComments: header.requestComments,
      active: header.active,
      purchaseManager: Number(managerValues.managerPurchase.sign) || null,
      purchaseManagerDate: managerValues.managerPurchase.date,
      tdcManager: Number(managerValues.managerTdc.sign) || null,
      tdcManagerDate: managerValues.managerTdc.date,
      qualityManager: Number(managerValues.managerQuality.sign) || null,
      qualityManagerDate: managerValues.managerQuality.date,
      productionManager: Number(managerValues.managerProduction.sign) || null,
      productionManagerDate: managerValues.managerProduction.date,
      approvalRequestedBy: Number(requestApprove.requestedBy) || null,
      approvedBy: Number(requestApprove.approvedBy) || null,
      createdBy: isUpdate ? data?.createdBy || usersId : usersId,
      ...(isUpdate ? { updatedBy: usersId } : {}),
    };

    try {
      const response =
        await inspectionRequisitionNoteAPI.createUpdateIrn(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Inspection Requisition Note updated successfully!"
              : "Inspection Requisition Note created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            response?.paramObjectsMap?.message ||
            "Failed to save Inspection Requisition Note.",
        );
      }
    } catch (err) {
      console.error("Save Inspection Requisition Note Error:", err);
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
            ? "Edit Inspection Requisition Note"
            : "Add Inspection Requisition Note"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Info ---------------- */}
        <div>
          <SectionHeader>Inspection Requisition Note</SectionHeader>
          <div className={fieldGrid}>
            <Field
              type="select"
              label="Requested By"
              name="requestedBy"
              value={header.requestedBy}
              onChange={handleHeaderChange}
              error={fieldErrors.requestedBy}
              options={requestedByOptions}
              required
            />
            <Field
              type="select"
              label="Product Category"
              name="productCategory"
              value={header.productCategory}
              onChange={handleHeaderChange}
              error={fieldErrors.productCategory}
              options={productCategoryOptions}
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
              disabled
            />
            <Field
              label="Samples Submitted To"
              name="samplesSubmittedTo"
              value={header.samplesSubmittedTo}
              onChange={handleHeaderChange}
            />
            <Field
              label="Part Name"
              name="partName"
              value={header.partName}
              onChange={handleHeaderChange}
              error={fieldErrors.partName}
              required
            />
            <Field
              label="Part Number"
              name="partNumber"
              value={header.partNumber}
              onChange={handleHeaderChange}
              error={fieldErrors.partNumber}
              required
            />
            <Field
              type="number"
              label="Sample Quantity"
              name="sampleQuantity"
              value={header.sampleQuantity}
              onChange={handleHeaderChange}
              error={fieldErrors.sampleQuantity}
              required
            />
            <Field
              label="Product"
              name="product"
              value={header.product}
              onChange={handleHeaderChange}
            />
            <Field
              label="Customer"
              name="customer"
              value={header.customer}
              onChange={handleHeaderChange}
            />
            <Field
              label="Supplier"
              name="supplier"
              value={header.supplier}
              onChange={handleHeaderChange}
            />
            <Field
              type="textarea"
              label="Reason for Inspection Request"
              name="reasonForInspectionRequest"
              value={header.reasonForInspectionRequest}
              onChange={handleHeaderChange}
              error={fieldErrors.reasonForInspectionRequest}
              required
            />
            <Field
              type="textarea"
              label="Request Comments"
              name="requestComments"
              value={header.requestComments}
              onChange={handleHeaderChange}
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
          </div>

          {/* Manager tabs - each Sign dropdown is scoped to its own department */}
          {MANAGER_TABS.map(
            (tab) =>
              activeChildTab === tab.key && (
                <div key={tab.key} className="pt-3">
                  <div className={subTabFieldGrid}>
                    <Field
                      type="select"
                      label="Sign"
                      name="sign"
                      value={managerValues[tab.key].sign}
                      onChange={handleManagerChange(tab.key)}
                      error={fieldErrors[`${tab.key}.sign`]}
                      options={departmentEmployees[tab.department]}
                      required
                    />
                    <Field
                      type="date"
                      label="Date"
                      name="date"
                      value={managerValues[tab.key].date}
                      onChange={handleManagerChange(tab.key)}
                      error={fieldErrors[`${tab.key}.date`]}
                      required
                    />
                  </div>
                </div>
              ),
          )}

          {/* Request and Approve - unfiltered employee master, no approval-date
              field (not part of inspectionRequisitionNoteDTO) */}
          {activeChildTab === "requestApprove" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  type="select"
                  label="Requested By"
                  name="requestedBy"
                  value={requestApprove.requestedBy}
                  onChange={handleRequestApproveChange}
                  error={fieldErrors["requestApprove.requestedBy"]}
                  options={employeeMasterOptions}
                  required
                />
                <Field
                  type="select"
                  label="Approved By"
                  name="approvedBy"
                  value={requestApprove.approvedBy}
                  onChange={handleRequestApproveChange}
                  error={fieldErrors["requestApprove.approvedBy"]}
                  options={employeeMasterOptions}
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

export default InspectionRequisitionNoteForm;

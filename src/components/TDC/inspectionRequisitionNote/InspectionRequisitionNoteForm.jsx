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

const labelClasses = "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

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
/* Options                                                                      */

const PRODUCT_CATEGORIES = [
  "Raw Material",
  "Semi-Finished",
  "Finished Goods",
  "Component",
  "Spare Parts",
];

const CHILD_TABS = [
  { key: "managerPurchase", label: "Manager-Purchase", kind: "fields" },
  { key: "managerTdc", label: "Manager-TDC", kind: "fields" },
  { key: "managerQuality", label: "Manager-Quality", kind: "fields" },
  { key: "managerProduction", label: "Manager-Production", kind: "fields" },
  { key: "requestApprove", label: "Request and Approve", kind: "fields" },
];

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");

const generateIrnNo = () =>
  `IRN-${dayjs().format("YYYYMMDD")}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;

/* ---------------------------------------------------------------------------- */

const InspectionRequisitionNoteForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId")) || 0;
  const usersId = localStorage.getItem("usersId");

  const [activeChildTab, setActiveChildTab] = useState("managerPurchase");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [employeeOptions, setEmployeeOptions] = useState([]);

  const [header, setHeader] = useState(() => {
    const base = {
      irnNo: data?.irnNo || (data ? "" : generateIrnNo()),
      requestedBy: data?.requestedBy?.id ?? data?.requestedBy ?? "",
      productCategory: data?.productCategory || "",
      date: data?.date || dayjs().format("YYYY-MM-DD"),
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
    };
    base.date = fmtDate(base.date);
    return base;
  });

  const [managerPurchase, setManagerPurchase] = useState({
    sign: data?.managerPurchase?.sign?.id ?? data?.managerPurchase?.sign ?? "",
    date: fmtDate(data?.managerPurchase?.date) || "",
  });

  const [managerTdc, setManagerTdc] = useState({
    sign: data?.managerTdc?.sign?.id ?? data?.managerTdc?.sign ?? "",
    date: fmtDate(data?.managerTdc?.date) || "",
  });

  const [managerQuality, setManagerQuality] = useState({
    sign: data?.managerQuality?.sign?.id ?? data?.managerQuality?.sign ?? "",
    date: fmtDate(data?.managerQuality?.date) || "",
  });

  const [managerProduction, setManagerProduction] = useState({
    sign:
      data?.managerProduction?.sign?.id ?? data?.managerProduction?.sign ?? "",
    date: fmtDate(data?.managerProduction?.date) || "",
  });

  const [requestApprove, setRequestApprove] = useState({
    requestedBy:
      data?.requestApprove?.requestedBy?.id ??
      data?.requestApprove?.requestedBy ??
      "",
    approvedBy:
      data?.requestApprove?.approvedBy?.id ??
      data?.requestApprove?.approvedBy ??
      "",
    approvalDate: fmtDate(data?.requestApprove?.approvalDate) || "",
  });

  /* ---------------- Lookup loading ---------------- */

  const loadEmployees = useCallback(async () => {
    try {
      const res = await employeeAPI.getEmployeeByOrgId(orgId);
      setEmployeeOptions(
        (res || []).map((e) => ({
          value: e.id,
          label: e.employeeName || e.name || e.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load employee options:", error);
      setEmployeeOptions([]);
    }
  }, [orgId]);

  useEffect(() => {
    if (orgId) loadEmployees();
  }, [orgId, loadEmployees]);

  /* ---------------- Handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  const handleManagerPurchaseChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[`managerPurchase.${name}`])
      setFieldErrors((prev) => ({
        ...prev,
        [`managerPurchase.${name}`]: "",
      }));
    setManagerPurchase((prev) => ({ ...prev, [name]: value }));
  };

  const handleManagerTdcChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[`managerTdc.${name}`])
      setFieldErrors((prev) => ({ ...prev, [`managerTdc.${name}`]: "" }));
    setManagerTdc((prev) => ({ ...prev, [name]: value }));
  };

  const handleManagerQualityChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[`managerQuality.${name}`])
      setFieldErrors((prev) => ({ ...prev, [`managerQuality.${name}`]: "" }));
    setManagerQuality((prev) => ({ ...prev, [name]: value }));
  };

  const handleManagerProductionChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[`managerProduction.${name}`])
      setFieldErrors((prev) => ({
        ...prev,
        [`managerProduction.${name}`]: "",
      }));
    setManagerProduction((prev) => ({ ...prev, [name]: value }));
  };

  const handleRequestApproveChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[`requestApprove.${name}`])
      setFieldErrors((prev) => ({
        ...prev,
        [`requestApprove.${name}`]: "",
      }));
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

    if (!managerPurchase.sign)
      errors["managerPurchase.sign"] = "Sign is required";
    if (!managerPurchase.date)
      errors["managerPurchase.date"] = "Date is required";
    if (!managerTdc.sign) errors["managerTdc.sign"] = "Sign is required";
    if (!managerTdc.date) errors["managerTdc.date"] = "Date is required";
    if (!managerQuality.sign)
      errors["managerQuality.sign"] = "Sign is required";
    if (!managerQuality.date)
      errors["managerQuality.date"] = "Date is required";
    if (!managerProduction.sign)
      errors["managerProduction.sign"] = "Sign is required";
    if (!managerProduction.date)
      errors["managerProduction.date"] = "Date is required";
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

    // Single-transaction payload: header + manager approvals + request &
    // approve. The backend keeps the complete inspection request history
    // with approval tracking (server-side validation).
    const payload = {
      ...(isUpdate ? { id: data.id } : {}),
      orgId,
      ...header,
      managerPurchase,
      managerTdc,
      managerQuality,
      managerProduction,
      requestApprove,
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
              label="IRN No"
              name="irnNo"
              value={header.irnNo}
              onChange={handleHeaderChange}
              required
              disabled={!data}
            />
            <Field
              type="select"
              label="Requested By"
              name="requestedBy"
              value={header.requestedBy}
              onChange={handleHeaderChange}
              error={fieldErrors.requestedBy}
              options={employeeOptions}
              required
            />
            <Field
              type="select"
              label="Product Category"
              name="productCategory"
              value={header.productCategory}
              onChange={handleHeaderChange}
              error={fieldErrors.productCategory}
              options={PRODUCT_CATEGORIES}
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

          {/* Tab 1: Manager-Purchase */}
          {activeChildTab === "managerPurchase" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  type="select"
                  label="Sign"
                  name="sign"
                  value={managerPurchase.sign}
                  onChange={handleManagerPurchaseChange}
                  error={fieldErrors["managerPurchase.sign"]}
                  options={employeeOptions}
                  required
                />
                <Field
                  type="date"
                  label="Date"
                  name="date"
                  value={managerPurchase.date}
                  onChange={handleManagerPurchaseChange}
                  error={fieldErrors["managerPurchase.date"]}
                  required
                />
              </div>
            </div>
          )}

          {/* Tab 2: Manager-TDC */}
          {activeChildTab === "managerTdc" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  type="select"
                  label="Sign"
                  name="sign"
                  value={managerTdc.sign}
                  onChange={handleManagerTdcChange}
                  error={fieldErrors["managerTdc.sign"]}
                  options={employeeOptions}
                  required
                />
                <Field
                  type="date"
                  label="Date"
                  name="date"
                  value={managerTdc.date}
                  onChange={handleManagerTdcChange}
                  error={fieldErrors["managerTdc.date"]}
                  required
                />
              </div>
            </div>
          )}

          {/* Tab 3: Manager-Quality */}
          {activeChildTab === "managerQuality" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  type="select"
                  label="Sign"
                  name="sign"
                  value={managerQuality.sign}
                  onChange={handleManagerQualityChange}
                  error={fieldErrors["managerQuality.sign"]}
                  options={employeeOptions}
                  required
                />
                <Field
                  type="date"
                  label="Date"
                  name="date"
                  value={managerQuality.date}
                  onChange={handleManagerQualityChange}
                  error={fieldErrors["managerQuality.date"]}
                  required
                />
              </div>
            </div>
          )}

          {/* Tab 4: Manager-Production */}
          {activeChildTab === "managerProduction" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  type="select"
                  label="Sign"
                  name="sign"
                  value={managerProduction.sign}
                  onChange={handleManagerProductionChange}
                  error={fieldErrors["managerProduction.sign"]}
                  options={employeeOptions}
                  required
                />
                <Field
                  type="date"
                  label="Date"
                  name="date"
                  value={managerProduction.date}
                  onChange={handleManagerProductionChange}
                  error={fieldErrors["managerProduction.date"]}
                  required
                />
              </div>
            </div>
          )}

          {/* Tab 5: Request and Approve */}
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
                  options={employeeOptions}
                  required
                />
                <Field
                  type="select"
                  label="Approved By"
                  name="approvedBy"
                  value={requestApprove.approvedBy}
                  onChange={handleRequestApproveChange}
                  error={fieldErrors["requestApprove.approvedBy"]}
                  options={employeeOptions}
                  required
                />
                <Field
                  type="date"
                  label="Approval Date"
                  name="approvalDate"
                  value={requestApprove.approvalDate}
                  onChange={handleRequestApproveChange}
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

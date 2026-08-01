import {
  ArrowLeft,
  Save,
  CheckCircle2,
  ImagePlus,
  X as XIcon,
} from "lucide-react";
import { useRef, useState } from "react";
import { customerComplaintAPI } from "../../../api/Sales/customerComplaintAPI";
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

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-2 items-start";

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
            <option key={opt} value={opt}>
              {opt}
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
          rows={4}
          className={
            "w-full px-2 py-1.5 rounded border text-xs leading-snug transition-colors resize-none " +
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

/* ---------------------------------------------------------------------------- */
/* Image upload field - single image, preview + replace/remove                 */

const ImageUploadField = ({ label, value, onChange, error, required }) => {
  const fileInputRef = useRef(null);
  const previewUrl =
    value instanceof File ? URL.createObjectURL(value) : value || null;

  return (
    <div className="w-full col-span-2">
      <label className={labelClasses}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

      <div className="flex items-center gap-3">
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`flex items-center justify-center h-[60px] w-[60px] rounded border-2 border-dashed cursor-pointer overflow-hidden ${
            error ? "border-red-500" : "border-gray-300 dark:border-gray-600"
          }`}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Complaint attachment"
              className="h-full w-full object-cover"
            />
          ) : (
            <ImagePlus className="h-5 w-5 text-gray-400" />
          )}
        </div>

        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline text-left"
          >
            {value ? "Replace image" : "Upload image"}
          </button>

          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="flex items-center gap-0.5 text-xs text-red-500 hover:underline text-left"
            >
              <XIcon className="h-3 w-3" />
              Remove
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) onChange(e.target.files[0]);
            e.target.value = "";
          }}
        />
      </div>

      {error && (
        <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
};

/* ---------------------------------------------------------------------------- */
/* Options (swap for real API-driven lists)                                    */

const PLANT_IDS = ["BANGALORE", "CHENNAI", "PUNE", "DELHI"];
const BELONGS_TO = ["APPLIANCES", "ELECTRICALS", "PACKAGING", "RAW MATERIAL"];
const DEPARTMENTS = ["Quality", "Sales", "Production", "Customer Service"];
const COMPLAINT_TYPES = [
  "Dimensional",
  "Functional",
  "Cosmetic/Visual",
  "Packaging",
  "Delivery Delay",
  "Documentation",
];
const ITEM_CODES = ["RM-001", "RM-002", "PKG-001", "SVC-001"];

/* ---------------------------------------------------------------------------- */
/* Empty state                                                                 */

const emptyForm = () => ({
  plantId: "",
  complaintNo: "", // Auto — populated by backend on create
  belongsTo: "",
  complaintDate: "",
  department: "",
  customerPartNo: "",
  complaintType: "",
  qtyNo: "",
  complaintRefNo: "",
  image: null,
  refDate: "",
  customerId: "",
  buyerName: "",
  customerName: "",
  itemCode: "",
  itemDescription: "",
  detailsOfComplaint: "",
  remarks: "",
});

const CustomerComplaintForm = ({ data, onBack }) => {
  const [orgId] = useState(localStorage.getItem("orgId"));
  const { addToast } = useToast();

  const [form, setForm] = useState({ ...emptyForm(), ...data });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (file) => {
    if (fieldErrors.image) setFieldErrors((prev) => ({ ...prev, image: "" }));
    setForm((prev) => ({ ...prev, image: file }));
  };

  const validate = () => {
    const errors = {};

    if (!form.plantId) errors.plantId = "Plant ID is required";
    if (!form.belongsTo) errors.belongsTo = "Belongs to is required";
    if (!form.complaintDate)
      errors.complaintDate = "Complaint Date is required";
    if (!form.department) errors.department = "Department is required";
    if (!form.customerPartNo?.trim())
      errors.customerPartNo = "Customer Part No is required";
    if (!form.complaintType)
      errors.complaintType = "Complaint Type is required";
    if (!form.complaintRefNo?.trim())
      errors.complaintRefNo = "Complaint Ref No. is required";
    if (!form.customerId?.trim()) errors.customerId = "Customer ID is required";
    if (!form.customerName?.trim())
      errors.customerName = "Customer Name is required";
    if (!form.itemCode) errors.itemCode = "Item Code is required";
    if (!form.detailsOfComplaint?.trim())
      errors.detailsOfComplaint = "Details of Complaint is required";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const buildPayload = (status, isUpdate) => ({
    ...(isUpdate ? { id: data.id } : {}),
    orgId: Number(orgId),
    ...form,
    // NOTE: image needs multipart/FormData handling on the API layer once
    // the upload endpoint is confirmed — sending file name only for now.
    image: form.image instanceof File ? form.image.name : form.image,
    status,
    createdBy: isUpdate
      ? data?.createdBy || localStorage.getItem("usersId")
      : localStorage.getItem("usersId"),
    ...(isUpdate ? { updatedBy: localStorage.getItem("usersId") } : {}),
  });

  const persist = async (status) => {
    if (!validate()) return;

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);
    const payload = buildPayload(status, isUpdate);

    try {
      const response =
        await customerComplaintAPI.createUpdateComplaint(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (status === "Submitted"
              ? "Complaint submitted successfully!"
              : "Complaint saved as draft!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            "Failed to save complaint.",
        );
      }
    } catch (err) {
      console.error("Save Customer Complaint Error:", err);
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

  const handleSave = () => persist("Draft");
  const handleSubmit = () => persist("Submitted");

  return (
    <div className="p-2 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data ? "Edit Customer Complaint" : "Customer Complaint Entry"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        <div>
          <SectionHeader>Customer Complaint Entry</SectionHeader>
          <div className={fieldGrid}>
            <Field
              type="select"
              label="Plant ID"
              name="plantId"
              value={form.plantId}
              onChange={handleChange}
              error={fieldErrors.plantId}
              options={PLANT_IDS}
              required
            />
            <Field
              label="Complaint No"
              name="complaintNo"
              value={form.complaintNo}
              onChange={handleChange}
              placeholder="Auto"
              disabled
            />
            <Field
              type="select"
              label="Belongs to"
              name="belongsTo"
              value={form.belongsTo}
              onChange={handleChange}
              error={fieldErrors.belongsTo}
              options={BELONGS_TO}
              required
            />
            <Field
              type="date"
              label="Complaint Date"
              name="complaintDate"
              value={form.complaintDate}
              onChange={handleChange}
              error={fieldErrors.complaintDate}
              required
            />
            <Field
              type="select"
              label="Department"
              name="department"
              value={form.department}
              onChange={handleChange}
              error={fieldErrors.department}
              options={DEPARTMENTS}
              required
            />
            <Field
              label="Customer Part No"
              name="customerPartNo"
              value={form.customerPartNo}
              onChange={handleChange}
              error={fieldErrors.customerPartNo}
              required
            />
            <Field
              type="select"
              label="Complaint Type"
              name="complaintType"
              value={form.complaintType}
              onChange={handleChange}
              error={fieldErrors.complaintType}
              options={COMPLAINT_TYPES}
              required
            />
            <Field
              type="number"
              label="Qty No"
              name="qtyNo"
              value={form.qtyNo}
              onChange={handleChange}
            />
            <Field
              label="Complaint Ref No."
              name="complaintRefNo"
              value={form.complaintRefNo}
              onChange={handleChange}
              error={fieldErrors.complaintRefNo}
              required
            />
            <Field
              type="date"
              label="Ref. Date"
              name="refDate"
              value={form.refDate}
              onChange={handleChange}
            />
            <Field
              label="Customer ID"
              name="customerId"
              value={form.customerId}
              onChange={handleChange}
              error={fieldErrors.customerId}
              required
            />
            <Field
              label="Buyer Name"
              name="buyerName"
              value={form.buyerName}
              onChange={handleChange}
            />
            <Field
              label="Customer Name"
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              error={fieldErrors.customerName}
              required
            />
            <Field
              type="select"
              label="Item Code"
              name="itemCode"
              value={form.itemCode}
              onChange={handleChange}
              error={fieldErrors.itemCode}
              options={ITEM_CODES}
              required
            />
            <Field
              label="Item Description"
              name="itemDescription"
              value={form.itemDescription}
              onChange={handleChange}
              className="col-span-2"
            />

            <ImageUploadField
              label="Image"
              value={form.image}
              onChange={handleImageChange}
              error={fieldErrors.image}
            />

            <Field
              type="textarea"
              label="Details of Complaint"
              name="detailsOfComplaint"
              value={form.detailsOfComplaint}
              onChange={handleChange}
              error={fieldErrors.detailsOfComplaint}
              required
              className="col-span-2 xl:col-span-3"
            />
            <Field
              type="textarea"
              label="Remarks"
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              className="col-span-2 xl:col-span-3"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-3 w-3" />
            {isSubmitting ? "Saving..." : "Save"}
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <CheckCircle2 className="h-3 w-3" />
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerComplaintForm;

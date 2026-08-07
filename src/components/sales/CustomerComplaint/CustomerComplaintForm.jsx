import { ArrowLeft, Save, ImagePlus, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { customerComplaintAPI } from "../../../api/Sales/customerComplaintAPI";
import { departmentAPI } from "../../../api/departmentAPI";
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

const labelClasses = "block text-[11px] text-gray-500 dark:text-gray-400 mb-1";

const fieldGrid =
  "grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-x-6 gap-y-4 items-start";

const BELONGS_TO = ["APPLIANCES", "BOSCH"];
const COMPLAINT_TYPES = ["REGISTER", "VERBAL"];

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
          disabled={disabled}
          className={`${controlClasses} ${error ? controlErrClasses : ""}`}
        >
          <option value="">Select {label}</option>
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

/* ---------------------------------------------------------------------------- */
/* Image upload - drag-and-drop / click-to-upload with previews                 */

const ImageUploadField = ({ images, onChange, error }) => {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const addFiles = (files) => {
    const next = [...files].filter(
      (f) => !images.some((img) => img instanceof File && img.name === f.name),
    );
    onChange([...images, ...next]);
  };

  return (
    <div className="w-full">
      <label className={labelClasses}>
        Image
        <span className="text-red-500"> *</span>
      </label>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed px-3 py-4 cursor-pointer transition-colors ${
          dragOver
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : error
              ? "border-red-500"
              : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
        }`}
      >
        <Upload className="h-4 w-4 text-gray-400 dark:text-gray-500" />
        <span className="text-[11px] text-gray-500 dark:text-gray-400">
          Drag & drop or click to upload
        </span>
      </div>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {images.map((img, index) => {
            const isFile = img instanceof File;
            const previewUrl = isFile ? URL.createObjectURL(img) : img;
            return (
              <div
                key={index}
                className="relative h-[60px] w-[60px] rounded border border-gray-200 dark:border-gray-700 overflow-hidden group"
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={`Complaint attachment ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                    <ImagePlus className="h-4 w-4 text-gray-400" />
                  </div>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(images.filter((_, i) => i !== index));
                  }}
                  className="absolute top-0 right-0 h-4 w-4 bg-red-600 text-white flex items-center justify-center rounded-bl opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={8} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {error && (
        <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
};

/* ---------------------------------------------------------------------------- */
/* Empty state                                                                 */

const emptyForm = () => ({
  active: true,
  branch: "",
  buyerName: "",
  cancelRemarks: "",
  complaintDate: dayjs().format("YYYY-MM-DD"),
  complaintNo: "", // Auto — populated by backend on create
  complaintType: "",
  customer: "",
  customerRefNo: "",
  department: "",
  detailsOfComplaint: "",
  financialYear: "",
  images: [],
  item: "",
  prefix: "",
  preparedBy: "",
  qtyNo: "",

  remarks: "",
  userCategory: "",
});

const CustomerComplaintForm = ({ data, onBack }) => {
  const orgId = Number(localStorage.getItem("orgId"));
  const branch = Number(localStorage.getItem("branchId"));
  const usersId = localStorage.getItem("usersId");
  const financialYear = localStorage.getItem("finYear");
  const { addToast } = useToast();

  const [form, setForm] = useState(() => {
    const base = { ...emptyForm(), ...data };
    base.complaintDate = data?.complaintDate
      ? dayjs(data.complaintDate).format("YYYY-MM-DD")
      : dayjs().format("YYYY-MM-DD");
    base.images =
      Array.isArray(data?.images) && data.images.length ? data.images : [];
    if (data?.item && typeof data.item === "object") {
      base.item = data.item.id;
      base.itemCode = data.item.itemCode;
      base.itemDescription = data.item.itemDescription;
      base.customerPartNo = data.item.customerPartNo;
    }
    if (data?.branch && typeof data.branch === "object") {
      base.branch = data.branch.id;
      base.branchName = data.branch.branchName;
    }
    if (data?.department && typeof data.department === "object") {
      base.department = data.department.id;
      base.departmentName = data.department.departmentName;
    }
    if (data?.customer && typeof data.customer === "object") {
      base.customer = data.customer.id;
      base.customerName = data.customer.customerName;
    }
    return base;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  /* ---------------- Lookup options ---------------- */
  const [branchOptions, setBranchOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [belongsToOptions] = useState(() =>
    BELONGS_TO.map((v) => ({ value: v, label: v })),
  );
  const [customerOptions, setCustomerOptions] = useState([]);
  const [customerMap, setCustomerMap] = useState({});
  const [itemOptions, setItemOptions] = useState([]);
  const [itemMap, setItemMap] = useState({});

  useEffect(() => {
    if (!orgId) return;

    const loadBranches = async () => {
      try {
        const branches = await customerComplaintAPI.getBranchList(orgId);
        setBranchOptions(
          (branches || []).map((b) => ({
            value: b.id,
            label: b.branchName || b.branchCode || b.id,
          })),
        );
      } catch {
        setBranchOptions([]);
      }
    };

    const loadDepartments = async () => {
      try {
        const res = await departmentAPI.getAllDepartments(orgId, branch);
        const departments = res?.paramObjectsMap?.departmentVO || [];
        setDepartmentOptions(
          departments.map((d) => ({ value: d.id, label: d.departmentName })),
        );
      } catch {
        setDepartmentOptions([]);
      }
    };

    const loadCustomers = async () => {
      try {
        const customers = await customerComplaintAPI.getCustomerList(
          orgId,
          branch,
        );
        const map = {};
        const opts = (customers || []).map((c) => {
          const code = c.customerId || c.docId || c.customerCode;
          map[code] = c.customerName || c.name || "";
          return { value: code, label: c.customerName || c.name || code };
        });
        setCustomerOptions(opts);
        setCustomerMap(map);
      } catch {
        setCustomerOptions([]);
        setCustomerMap({});
      }
    };

    const loadItems = async () => {
      try {
        const items = await customerComplaintAPI.getItemList(orgId, branch);
        const map = {};
        const opts = (items || []).map((it) => {
          const id = it.id;
          map[id] = it;
          return {
            value: id,
            label: it.itemCode || it.code || id?.toString() || "",
          };
        });
        setItemOptions(opts);
        setItemMap(map);
      } catch {
        setItemOptions([]);
        setItemMap({});
      }
    };

    Promise.all([
      loadBranches(),
      loadDepartments(),
      loadCustomers(),
      loadItems(),
    ]);
  }, [orgId, branch]);

  /* ---------------- Handlers ---------------- */

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "customer") {
      const custName = customerMap[value];
      setForm((prev) => ({
        ...prev,
        customer: value,
        customerName: custName || prev.customerName,
      }));
    }

    if (name === "item") {
      const it = itemMap[value];
      setForm((prev) => ({
        ...prev,
        item: value,
        itemDescription: it?.itemDescription || prev.itemDescription,
        customerPartNo: it?.customerPartNo || prev.customerPartNo,
      }));
    }
  };

  const handleImagesChange = (images) => {
    if (fieldErrors.images) setFieldErrors((prev) => ({ ...prev, images: "" }));
    setForm((prev) => ({ ...prev, images }));
  };

  /* ---------------- Validation ---------------- */

  const validate = () => {
    const errors = {};

    if (!form.branch) errors.branch = "Plant ID is required";
    if (!form.userCategory) errors.userCategory = "Belongs To is required";
    if (!form.department) errors.department = "Department is required";
    if (!form.complaintType) errors.complaintType = "Complaint Type is required";
    if (!form.complaintNo?.trim()) errors.complaintNo = "Complaint No is required";
    if (!form.complaintDate) errors.complaintDate = "Complaint Date is required";
    if (!form.customer?.trim()) errors.customer = "Customer is required";
    if (!form.item?.trim()) errors.item = "Item Code is required";
    if (!form.detailsOfComplaint?.trim())
      errors.detailsOfComplaint = "Details of Complaint is required";
    if (!form.images.length) errors.images = "At least one image is required";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* ---------------- Persist ---------------- */

  const persist = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);

    // Images are NOT part of the DTO — only new Files go via the multipart
    // "images" part. The DTO must match the expected backend model exactly.
    const newImages = form.images.filter((img) => img instanceof File);

    const dto = {
      active: data?.active ?? true,
      branch: Number(form.branch) || 0,
      buyerName: form.buyerName,
      cancelRemarks: form.cancelRemarks,
      complaintDate: form.complaintDate,
      complaintNo: form.complaintNo,
      complaintType: form.complaintType,
      createdBy: isUpdate ? data?.createdBy || usersId : usersId,
      customer: Number(form.customer) || 0,
      customerRefNo: form.customerRefNo,
      department: Number(form.department) || 0,
      detailsOfComplaint: form.detailsOfComplaint,
      financialYear: form.financialYear || financialYear,
      item: Number(form.item) || 0,
      orgId,
      prefix: form.prefix,
      preparedBy: form.preparedBy,
      qtyNo: Number(form.qtyNo) || 0,
      remarks: form.remarks || null,
      userCategory: form.userCategory,
      ...(isUpdate ? { id: data.id } : {}),
    };

    try {
      const response = await customerComplaintAPI.createUpdateComplaint({
        dto,
        images: newImages,
      });

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            "Customer Complaint saved successfully!",
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            response?.paramObjectsMap?.message ||
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

  return (
    <div className="p-2 max-w-[1500px]">
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
        {/* ---------------- Complaint Header Section ---------------- */}
        <div>
          <SectionHeader>Complaint Header</SectionHeader>
          <div className={fieldGrid}>
            <Field
              type="select"
              label="Plant ID"
              name="branch"
              value={form.branch}
              onChange={handleChange}
              error={fieldErrors.branch}
              options={branchOptions}
              required
            />
            <Field
              type="select"
              label="Belongs To"
              name="userCategory"
              value={form.userCategory}
              onChange={handleChange}
              error={fieldErrors.userCategory}
              options={belongsToOptions}
              required
            />
            <Field
              type="select"
              label="Department"
              name="department"
              value={form.department}
              onChange={handleChange}
              error={fieldErrors.department}
              options={departmentOptions}
              required
            />
            <Field
              type="select"
              label="Complaint Type"
              name="complaintType"
              value={form.complaintType}
              onChange={handleChange}
              error={fieldErrors.complaintType}
              options={COMPLAINT_TYPES.map((v) => ({ value: v, label: v }))}
              required
            />
            <Field
              label="Complaint Ref No"
              name="customerRefNo"
              value={form.customerRefNo}
              onChange={handleChange}
              placeholder="Customer Ref No."
            />
            <Field
              label="Complaint No"
              name="complaintNo"
              value={form.complaintNo}
              onChange={handleChange}
              error={fieldErrors.complaintNo}
              placeholder="Auto"
              // disabled
              // required
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
              label="Customer"
              name="customer"
              value={form.customer}
              onChange={handleChange}
              error={fieldErrors.customer}
              options={customerOptions}
              required
            />
            <Field
              label="Buyer Name"
              name="buyerName"
              value={form.buyerName}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* ---------------- Complaint Details Section ---------------- */}
        <div>
          <SectionHeader>Complaint Details</SectionHeader>
          <div className={fieldGrid}>
            <Field
              type="number"
              label="Qty No"
              name="qtyNo"
              value={form.qtyNo}
              onChange={handleChange}
            />
            <Field
              type="select"
              label="Item Code"
              name="item"
              value={form.item}
              onChange={handleChange}
              error={fieldErrors.item}
              options={itemOptions}
              required
            />
            <Field
              type="textarea"
              label="Details of Complaint"
              name="detailsOfComplaint"
              value={form.detailsOfComplaint}
              onChange={handleChange}
              error={fieldErrors.detailsOfComplaint}
              required
              className="sm:col-span-2"
            />
            <Field
              type="textarea"
              label="Remarks"
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              className="sm:col-span-2"
            />
            <div className="sm:col-span-2">
              <ImageUploadField
                images={form.images}
                onChange={handleImagesChange}
                error={fieldErrors.images}
              />
            </div>
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
            onClick={persist}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-3 w-3" />
            {isSubmitting ? "Saving..." : data ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerComplaintForm;
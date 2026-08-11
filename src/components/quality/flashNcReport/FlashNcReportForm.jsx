import { Save, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

import flashNcReportAPI from "../../../api/quality/flashNcReportAPI";
import { useToast } from "../../Toast/ToastContext";

const todayISO = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const initialForm = {
  id: 0,
  branch: "",
  belongsTo: "",
  frNo: "",
  frDate: todayISO(),
  reference: "",
  supplierName: "",
  from: "",
  to: "",
  description: "",
  itemDescription: "",
  mrnScGrnNo: "",
  mrnDate: "",
  drawingNo: "",
  occ: "",
  invoiceNo: "",
  poNo: "",
  supplierCode: "",
  operationNo: "",
  itemCode: "",
  lotQty: "",
  sampleQty: "",
  ncQty: "",
  disposal: "",
  problemDefectSeen: "",
  problemStatus: "",
  actionOnDefectiveLot: "",
  inspectedBy: "",
  status: "",
  narration: "",
  image: null,

  active: true,
  cancel: false,
  cancelRemarks: "",
};

/* =========================================================
   COMMON FIELD COMPONENT
========================================================= */

const Field = ({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  type = "text",
  options = [],
  disabled = false,
}) => {
  return (
    <div className="min-w-0">
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}

        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {type === "select" ? (
        <select
          name={name}
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-full
            h-9
            px-2
            rounded
            border
            ${error ? "border-red-500" : "border-gray-300 dark:border-gray-600"}
            bg-white
            dark:bg-gray-900
            text-gray-900
            dark:text-gray-100
            text-sm
            focus:outline-none
            focus:ring-1
            focus:ring-blue-500
            disabled:bg-gray-100
            dark:disabled:bg-gray-800
          `}
        >
          <option value="">-- Select --</option>

          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          name={name}
          value={value ?? ""}
          onChange={onChange}
          rows={4}
          disabled={disabled}
          className={`
            w-full
            px-2
            py-2
            rounded
            border
            ${error ? "border-red-500" : "border-gray-300 dark:border-gray-600"}
            bg-white
            dark:bg-gray-900
            text-gray-900
            dark:text-gray-100
            text-sm
            resize-none
            focus:outline-none
            focus:ring-1
            focus:ring-blue-500
            disabled:bg-gray-100
            dark:disabled:bg-gray-800
          `}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-full
            h-9
            px-2
            rounded
            border
            ${error ? "border-red-500" : "border-gray-300 dark:border-gray-600"}
            bg-white
            dark:bg-gray-900
            text-gray-900
            dark:text-gray-100
            text-sm
            focus:outline-none
            focus:ring-1
            focus:ring-blue-500
            disabled:bg-gray-100
            dark:disabled:bg-gray-800
          `}
        />
      )}

      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
    </div>
  );
};

/* =========================================================
   FLASH NC REPORT FORM
========================================================= */

const FlashNcReportForm = ({ onBack, onSave, editData, editId }) => {
  const { addToast } = useToast();

  const [form, setForm] = useState(initialForm);

  const [fieldErrors, setFieldErrors] = useState({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [imagePreview, setImagePreview] = useState("");

  /* =======================================================
     CAPA GRID
  ======================================================= */

  const [capaRows, setCapaRows] = useState([
    {
      id: Date.now(),
      file: null,
      fileName: "",
      preview: "",
    },
  ]);

  /* =======================================================
     OPTIONS
  ======================================================= */

  const branchOptions = [
    { value: "1", label: "Branch 1" },
    { value: "2", label: "Branch 2" },
  ];

  const belongsToOptions = [
    {
      value: "Appliances",
      label: "APPLIANCES",
    },
    {
      value: "Bosch",
      label: "BOSCH",
    },
  ];

  const referenceOptions = [
    {
      value: "1",
      label: "1",
    },
    {
      value: "2",
      label: "2",
    },
    {
      value: "3",
      label: "3",
    },
  ];

  const fromOptions = [
    {
      value: "Quality",
      label: "Quality",
    },
    {
      value: "Production",
      label: "Production",
    },
    {
      value: "Quality Inward",
      label: "Quality Inward",
    },
    {
      value: "Quality Outward",
      label: "Quality Outward",
    },
    {
      value: "Purchase",
      label: "Purchase",
    },
  ];

  const toOptions = [
    {
      value: "Quality",
      label: "Quality",
    },
    {
      value: "Production",
      label: "Production",
    },
    {
      value: "Quality Inward",
      label: "Quality Inward",
    },
    {
      value: "Quality Outward",
      label: "Quality Outward",
    },
    {
      value: "Purchase",
      label: "Purchase",
    },
  ];

  const mrnOptions = [
    {
      value: "MRN001",
      label: "MRN001",
    },
    {
      value: "MRN002",
      label: "MRN002",
    },
    {
      value: "GRN001",
      label: "GRN001",
    },
  ];

  const itemCodeOptions = [
    {
      value: "ITEM001",
      label: "ITEM001",
    },
    {
      value: "ITEM002",
      label: "ITEM002",
    },
    {
      value: "ITEM003",
      label: "ITEM003",
    },
  ];

  const disposalOptions = [
    {
      value: "Rework",
      label: "Rework",
    },
    {
      value: "Reject",
      label: "Reject",
    },
    {
      value: "Return To Supplier",
      label: "Return To Supplier",
    },
    {
      value: "Use As Is",
      label: "Use As Is",
    },
  ];

  const problemStatusOptions = [
    {
      value: "Open",
      label: "Open",
    },
    {
      value: "Under Review",
      label: "Under Review",
    },
    {
      value: "Closed",
      label: "Closed",
    },
  ];

  const inspectedByOptions = [
    {
      value: "Inspector 1",
      label: "Inspector 1",
    },
    {
      value: "Inspector 2",
      label: "Inspector 2",
    },
  ];

  const statusOptions = [
    {
      value: "Open",
      label: "Open",
    },
    {
      value: "Approved",
      label: "Approved",
    },
    {
      value: "Rejected",
      label: "Rejected",
    },
    {
      value: "Closed",
      label: "Closed",
    },
  ];

  /* =======================================================
     INITIALIZE
  ======================================================= */

  useEffect(() => {
    if (editData) {
      populateForm(editData);
      return;
    }

    if (editId) {
      loadReport(editId);
      return;
    }

    setForm({
      ...initialForm,
      frDate: todayISO(),
    });

    setImagePreview("");

    setCapaRows([
      {
        id: Date.now(),
        file: null,
        fileName: "",
        preview: "",
      },
    ]);
  }, [editData, editId]);

  /* =======================================================
     POPULATE EDIT DATA
  ======================================================= */
  const populateForm = (data) => {
    setForm({
      ...initialForm,
      id: data?.id || 0,
      branch: data?.branch || "",
      belongsTo: data?.belongsTo || "",
      frNo: data?.frNo || "",
      frDate: data?.frDate || todayISO(),
      reference: data?.reference || "",
      supplierName: data?.supplierName || "",
      from: data?.from || "",
      to: data?.to || "",
      description: data?.description || "",
      itemDescription: data?.itemDescription || "",
      mrnScGrnNo: data?.mrnScGrnNo || "",
      mrnDate: data?.mrnDate || "",
      drawingNo: data?.drawingNo || "",
      occ: data?.occ ?? "",
      invoiceNo: data?.invoiceNo || "",
      poNo: data?.poNo || "",
      supplierCode: data?.supplierCode || "",
      operationNo: data?.operationNo || "",
      itemCode: data?.itemCode || "",
      lotQty: data?.lotQty ?? "",
      sampleQty: data?.sampleQty ?? "",
      ncQty: data?.ncQty ?? "",
      disposal: data?.disposal || "",
      problemDefectSeen: data?.problemDefectSeen || "",
      problemStatus: data?.problemStatus || "",
      actionOnDefectiveLot: data?.actionOnDefectiveLot || "",
      inspectedBy: data?.inspectedBy || "",
      status: data?.status || "",
      narration: data?.narration || "",
      active:
        data?.active === true ||
        data?.active === "true" ||
        data?.active === "Active",

      cancel:
        data?.cancel === true ||
        data?.cancel === "true" ||
        data?.cancel === "T",
      cancelRemarks: data?.cancelRemarks || "",
    });

    if (data?.imageUrl) {
      setImagePreview(data.imageUrl);
    } else {
      setImagePreview("");
    }
  };
  /* =======================================================
     LOAD REPORT
  ======================================================= */
  const loadReport = async (id) => {
    try {
      const response = await flashNcReportAPI.getById(id);

      const data =
        response?.data ||
        response?.paramObjectsMap?.flashNcReportVO ||
        response?.flashNcReportVO ||
        response;

      if (data) {
        populateForm(data);
      }
    } catch (error) {
      console.error("Failed to load Flash NC Report:", error);

      addToast("Failed to load Flash NC Report", "error");
    }
  };

  /* =======================================================
     INPUT CHANGE
  ======================================================= */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: checked,
      }));

      return;
    }

    /* Numeric validation */

    if (["lotQty", "sampleQty", "ncQty", "occ"].includes(name)) {
      if (value !== "" && !/^\d*\.?\d*$/.test(value)) {
        return;
      }
    }

    /* Supplier Code */

    if (name === "supplierCode") {
      if (!/^[A-Za-z0-9-]*$/.test(value)) {
        return;
      }

      if (value.length > 30) {
        return;
      }
    }

    /* Operation Number */

    if (name === "operationNo") {
      if (!/^[A-Za-z0-9-]*$/.test(value)) {
        return;
      }

      if (value.length > 20) {
        return;
      }
    }

    /* Drawing Number */

    if (name === "drawingNo") {
      if (!/^[A-Za-z0-9./-]*$/.test(value)) {
        return;
      }

      if (value.length > 50) {
        return;
      }
    }

    /* FR Number */

    if (name === "frNo") {
      if (!/^[A-Za-z0-9-]*$/.test(value)) {
        return;
      }

      if (value.length > 20) {
        return;
      }
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =======================================================
     SELECT CHANGE
  ======================================================= */

  const handleSelectChange = (e) => {
    const { name, value } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =======================================================
     MAIN IMAGE
  ======================================================= */

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      addToast("Only image files are allowed", "error");

      e.target.value = "";

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast("Image size must be less than 5 MB", "error");

      e.target.value = "";

      return;
    }

    setForm((prev) => ({
      ...prev,
      image: file,
    }));

    setImagePreview(URL.createObjectURL(file));
  };

  /* =======================================================
     CAPA - ADD ROW
  ======================================================= */

  const handleAddCapaRow = () => {
    setCapaRows((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),

        file: null,
        fileName: "",
        preview: "",
      },
    ]);
  };

  /* =======================================================
     CAPA - FILE CHANGE
  ======================================================= */

  const handleCapaFileChange = (e, rowId) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    /* Image validation */

    if (!file.type.startsWith("image/")) {
      addToast("Only image files are allowed for CAPA", "error");

      e.target.value = "";

      return;
    }

    /* File size */

    if (file.size > 5 * 1024 * 1024) {
      addToast("CAPA image size must be less than 5 MB", "error");

      e.target.value = "";

      return;
    }

    const preview = URL.createObjectURL(file);

    setCapaRows((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? {
              ...row,
              file: file,
              fileName: file.name,
              preview: preview,
            }
          : row,
      ),
    );
  };

  /* =======================================================
     CAPA - REMOVE ROW
  ======================================================= */

  const handleRemoveCapaRow = (rowId) => {
    setCapaRows((prev) => {
      const row = prev.find((item) => item.id === rowId);

      if (row?.preview) {
        URL.revokeObjectURL(row.preview);
      }

      /* Keep minimum one row */

      if (prev.length === 1) {
        return [
          {
            id: Date.now() + Math.random(),

            file: null,
            fileName: "",
            preview: "",
          },
        ];
      }

      return prev.filter((item) => item.id !== rowId);
    });
  };

  //  VALIDATION
  const validateForm = () => {
    const errors = {};

    if (!form.branch) {
      errors.branch = "Plant is required";
    }
    if (!form.reference) {
      errors.reference = "Reference is required";
    }
    if (!form.frNo?.trim()) {
      errors.frNo = "FR No is required";
    }
    if (!form.frDate) {
      errors.frDate = "FR Date is required";
    }
    if (!form.itemCode) {
      errors.itemCode = "Item Code is required";
    }
    if (!form.disposal) {
      errors.disposal = "Disposal is required";
    }
    if (!form.problemStatus) {
      errors.problemStatus = "Problem Status is required";
    }
    if (form.lotQty !== "" && Number(form.lotQty) < 0) {
      errors.lotQty = "Lot Qty cannot be negative";
    }
    if (form.sampleQty !== "" && Number(form.sampleQty) < 0) {
      errors.sampleQty = "Sample Qty cannot be negative";
    }
    if (form.ncQty !== "" && Number(form.ncQty) < 0) {
      errors.ncQty = "NC Qty cannot be negative";
    }
    if (
      form.lotQty !== "" &&
      form.sampleQty !== "" &&
      Number(form.sampleQty) > Number(form.lotQty)
    ) {
      errors.sampleQty = "Sample Qty cannot be greater than Lot Qty";
    }
    if (
      form.sampleQty !== "" &&
      form.ncQty !== "" &&
      Number(form.ncQty) > Number(form.sampleQty)
    ) {
      errors.ncQty = "NC Qty cannot be greater than Sample Qty";
    }
    if (form.occ !== "" && (Number(form.occ) < 0 || Number(form.occ) > 100)) {
      errors.occ = "OCC % must be between 0 and 100";
    }
    //    FROM / TO
    if (form.from && form.to && form.from === form.to) {
      errors.to = "From and To cannot be the same";
    }
    //    DATE
    if (form.frDate) {
      const selectedDate = new Date(form.frDate);
      const today = new Date();
      selectedDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      if (selectedDate > today) {
        errors.frDate = "FR Date cannot be a future date";
      }
    }

    setFieldErrors(errors);
    return errors;
  };

  //  HANDLE SAVE
  const handleSave = async () => {
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      const firstField = Object.keys(errors)[0];
      addToast(errors[firstField], "error");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = new FormData();

      /* ID */
      if (form.id && form.id > 0) {
        payload.append("id", String(form.id));
      }
      /* Main form fields */
      Object.entries(form).forEach(([key, value]) => {
        if (key === "id" || key === "image") {
          return;
        }

        payload.append(
          key,
          value === null || value === undefined ? "" : String(value),
        );
      });

      /* Main image */

      if (form.image) {
        payload.append("image", form.image);
      }

      /* ===================================================
         CAPA FILES
      =================================================== */

      capaRows.forEach((row, index) => {
        if (row.file) {
          payload.append(`capa_${index + 1}`, row.file);
        }
      });

      /* API */

      const response = await flashNcReportAPI.save(payload);

      const success =
        response?.status === true ||
        response?.statusFlag === "Ok" ||
        response?.data?.status === true;

      if (success) {
        addToast(
          form.id
            ? "Flash/NC Report updated successfully"
            : "Flash/NC Report created successfully",
          "success",
        );

        if (onSave) {
          onSave(response);
        } else if (onBack) {
          onBack();
        }
      } else {
        addToast(
          response?.message ||
            response?.paramObjectsMap?.message ||
            "Failed to save Flash/NC Report",
          "error",
        );
      }
    } catch (error) {
      console.error("Flash NC save error:", error);

      addToast(
        error?.response?.data?.message || "Failed to save Flash/NC Report",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {editData || editId ? "Edit Flash NC Report" : "Add Flash NC Report"}
        </h2>
      </div>

      <div
        className="
          bg-white
          dark:bg-gray-800
          border
          border-gray-200
          dark:border-gray-700
          rounded-lg
          p-4
        "
      >
        {/* HEADER FIELDS */}

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            lg:grid-cols-4
            gap-3
            mb-4
          "
        >
          {/* Branch */}

          <Field
            label="Plant"
            name="branch"
            value={form.branch}
            onChange={handleSelectChange}
            options={branchOptions}
            type="select"
            required
            error={fieldErrors.branch}
          />

          {/* FR No */}

          <Field
            label="FR No"
            name="frNo"
            value={form.frNo}
            onChange={handleChange}
            disabled={true}
            required
            error={fieldErrors.frNo}
          />

          {/* FR Date */}

          <Field
            label="FR Date"
            name="frDate"
            value={form.frDate}
            onChange={handleChange}
            type="date"
            required
            error={fieldErrors.frDate}
          />

          {/* Belongs To */}

          <Field
            label="Belongs To"
            name="belongsTo"
            value={form.belongsTo}
            onChange={handleSelectChange}
            options={belongsToOptions}
            type="select"
            error={fieldErrors.belongsTo}
          />

          {/* Reference */}

          <Field
            label="Reference"
            name="reference"
            value={form.reference}
            onChange={handleSelectChange}
            options={referenceOptions}
            type="select"
            required
            error={fieldErrors.reference}
          />

          {/* Supplier Name */}

          <Field
            label="Supplier Name"
            name="supplierName"
            value={form.supplierName}
            onChange={handleChange}
            error={fieldErrors.supplierName}
            disabled={true}
          />

          {/* Description */}

          <Field
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            error={fieldErrors.description}
          />

          {/* Item Description */}

          <Field
            label="Item Description"
            name="itemDescription"
            value={form.itemDescription}
            onChange={handleChange}
            error={fieldErrors.itemDescription}
          />

          {/* Drawing No */}

          <Field
            label="Drawing No."
            name="drawingNo"
            value={form.drawingNo}
            onChange={handleChange}
            error={fieldErrors.drawingNo}
          />

          {/* From */}

          <Field
            label="From"
            name="from"
            value={form.from}
            onChange={handleSelectChange}
            options={fromOptions}
            type="select"
            error={fieldErrors.from}
          />

          {/* To */}

          <Field
            label="To"
            name="to"
            value={form.to}
            onChange={handleSelectChange}
            options={toOptions}
            type="select"
            error={fieldErrors.to}
          />

          {/* MRIN / SC GRN */}

          <Field
            label="MRIN/SC GRN No"
            name="mrnScGrnNo"
            value={form.mrnScGrnNo}
            onChange={handleSelectChange}
            type="select"
            options={mrnOptions}
            error={fieldErrors.mrnScGrnNo}
          />

          {/* MRIN Date */}

          <Field
            label="MRIN Date"
            name="mrnDate"
            value={form.mrnDate}
            onChange={handleChange}
            type="date"
            error={fieldErrors.mrnDate}
          />

          {/* OCC */}

          <Field
            label="OCC %"
            name="occ"
            value={form.occ}
            onChange={handleChange}
            error={fieldErrors.occ}
          />

          {/* Invoice */}

          <Field
            label="Invoice No."
            name="invoiceNo"
            value={form.invoiceNo}
            onChange={handleChange}
            error={fieldErrors.invoiceNo}
            disabled={true}
          />

          {/* PO */}

          <Field
            label="P.O. No."
            name="poNo"
            value={form.poNo}
            onChange={handleChange}
            error={fieldErrors.poNo}
            disabled={true}
          />

          {/* Supplier Code */}

          <Field
            label="Supplier Code"
            name="supplierCode"
            value={form.supplierCode}
            onChange={handleChange}
            error={fieldErrors.supplierCode}
            disabled={true}
          />

          {/* Operation */}

          <Field
            label="Operation No."
            name="operationNo"
            value={form.operationNo}
            onChange={handleChange}
            error={fieldErrors.operationNo}
          />

          {/* Item Code */}

          <Field
            label="Item Code"
            name="itemCode"
            value={form.itemCode}
            onChange={handleSelectChange}
            options={itemCodeOptions}
            type="select"
            required
            error={fieldErrors.itemCode}
          />

          {/* Lot Qty */}

          <Field
            label="Lot Qty"
            name="lotQty"
            value={form.lotQty}
            onChange={handleChange}
            error={fieldErrors.lotQty}
          />

          {/* Sample Qty */}

          <Field
            label="Sample Qty"
            name="sampleQty"
            value={form.sampleQty}
            onChange={handleChange}
            error={fieldErrors.sampleQty}
          />

          {/* NC Qty */}

          <Field
            label="NC Qty"
            name="ncQty"
            value={form.ncQty}
            onChange={handleChange}
            error={fieldErrors.ncQty}
          />

          {/* Disposal */}

          <Field
            label="Disposal"
            name="disposal"
            value={form.disposal}
            onChange={handleSelectChange}
            options={disposalOptions}
            type="select"
            required
            error={fieldErrors.disposal}
          />

          {/* Problem Status */}

          <Field
            label="Problem Status"
            name="problemStatus"
            value={form.problemStatus}
            onChange={handleSelectChange}
            options={problemStatusOptions}
            type="select"
            required
            error={fieldErrors.problemStatus}
          />
          <Field
            label="Action On Defective Lot"
            name="actionOnDefectiveLot"
            value={form.actionOnDefectiveLot}
            onChange={handleChange}
            error={fieldErrors.actionOnDefectiveLot}
          />
          <Field
            label="Inspected by"
            name="inspectedBy"
            value={form.inspectedBy}
            onChange={handleSelectChange}
            options={inspectedByOptions}
            type="select"
            error={fieldErrors.inspectedBy}
          />
          <Field
            label="Status"
            name="status"
            value={form.status}
            onChange={handleSelectChange}
            options={statusOptions}
            type="select"
            error={fieldErrors.status}
          />
          <Field
            label="Problem / Defect Seen"
            name="problemDefectSeen"
            value={form.problemDefectSeen}
            onChange={handleChange}
            type="text"
            error={fieldErrors.problemDefectSeen}
          />
          <Field
            label="Narration"
            name="narration"
            value={form.narration}
            onChange={handleChange}
            type="textarea"
            error={fieldErrors.narration}
          />
        </div>

        {/* GRID Table */}
        <div
          className="
            mt-4
            border-slate-700
            rounded-md
            overflow-hidden
            bg-slate-900
          "
        >
          <div
            className="
              relative
              bg-slate-800
              border-b
              border-slate-700
              h-8
            "
          >
            <div className="flex items-center h-full">
              <div
                className="
                  px-4
                  h-full
                  flex
                  items-center
                  bg-blue-600
                  text-white
                  text-xs
                  font-medium
                "
              >
                CAPA
              </div>
            </div>

            {/* ADD BUTTON */}
            <button
              type="button"
              onClick={handleAddCapaRow}
              disabled={isSubmitting}
              className="
                absolute
                right-1
                top-1
                w-7
                h-7
                flex
                items-center
                justify-center
                rounded
                bg-blue-600
                hover:bg-blue-700
                text-white
                text-base
                font-bold
                disabled:opacity-50
              "
              title="Add CAPA"
            >
              +
            </button>
          </div>

          {/* ===============================================
              CAPA TABLE
          =============================================== */}

          <div className="overflow-x-auto">
            <table
              className="
                w-full
                border-collapse
                text-xs
              "
            >
              {/* TABLE HEADER */}

              <thead>
                <tr
                  className="
                    bg-slate-700
                    text-white
                  "
                >
                  <th
                    className="
                      w-10
                      px-2
                      py-1.5
                      text-left
                      font-semibold
                      border-r
                      border-slate-600
                    "
                  >
                    #
                  </th>

                  <th
                    className="
                      px-2
                      py-1.5
                      text-left
                      font-semibold
                      border-r
                      border-slate-600
                    "
                  >
                    CAPA
                  </th>

                  <th
                    className="
                      w-20
                      px-2
                      py-1.5
                      text-center
                      font-semibold
                    "
                  >
                    Action
                  </th>
                </tr>
              </thead>

              {/* TABLE BODY */}

              <tbody>
                {capaRows.map((row, index) => (
                  <tr
                    key={row.id}
                    className="
                        bg-slate-900
                        hover:bg-slate-800
                        border-b
                        border-slate-700
                      "
                  >
                    {/* S.NO */}

                    <td
                      className="
                          w-10
                          px-2
                          py-1
                          text-white
                          text-center
                          border-r
                          border-slate-700
                        "
                    >
                      {index + 1}
                    </td>

                    {/* CAPA FILE */}

                    <td
                      className="
                          px-2
                          py-1
                          border-r
                          border-slate-700
                        "
                    >
                      <div
                        className="
                            flex
                            items-center
                            gap-2
                          "
                      >
                        {/* Hidden File Input */}

                        <input
                          id={`capa-file-${row.id}`}
                          type="file"
                          accept="
                              .png,
                              .jpg,
                              .jpeg,
                              .gif,
                              .webp,
                              .bmp,
                              .svg
                            "
                          className="hidden"
                          onChange={(e) => handleCapaFileChange(e, row.id)}
                        />

                        {/* Choose File */}

                        <label
                          htmlFor={`capa-file-${row.id}`}
                          className="
                              inline-flex
                              items-center
                              justify-center
                              px-3
                              h-7
                              rounded
                              bg-blue-600
                              hover:bg-blue-700
                              text-white
                              text-xs
                              font-medium
                              cursor-pointer
                              whitespace-nowrap
                            "
                        >
                          Choose File
                        </label>

                        {/* File Name */}

                        <span
                          className="
                              text-gray-300
                              text-xs
                              truncate
                              max-w-[600px]
                            "
                          title={row.fileName || "No file chosen"}
                        >
                          {row.fileName || "No file chosen"}
                        </span>
                      </div>
                    </td>

                    {/* ACTION */}

                    <td
                      className="
                          w-20
                          px-2
                          py-1
                          text-center
                        "
                    >
                      <button
                        type="button"
                        onClick={() => handleRemoveCapaRow(row.id)}
                        disabled={isSubmitting}
                        className="
                            inline-flex
                            items-center
                            justify-center
                            w-7
                            h-7
                            rounded
                            bg-slate-600
                            hover:bg-red-600
                            text-white
                            transition-colors
                            disabled:opacity-50
                          "
                        title="Remove CAPA"
                      >
                        <Trash2
                          className="
                              w-3.5
                              h-3.5
                            "
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SAVE / CANCEL */}
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <X className="h-3 w-3" /> Cancel
          </button>
          <button
            type="submit"
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-3 w-3" />{" "}
            {/* {isSubmitting ? "Saving..." : data?.id ? "Update" : "Save"} */}
            {isSubmitting
              ? "Saving..."
              : editData || editId
                ? "Update"
                : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashNcReportForm;

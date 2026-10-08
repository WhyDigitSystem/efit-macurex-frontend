import { ArrowLeft, Save, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";

import branchAPI from "../../../api/branchAPI";
import { departmentAPI } from "../../../api/departmentAPI";
import { useToast } from "../../Toast/ToastContext";
import flashNcReportAPI from "../../../api/quality/flashNcReportAPI";

/* =========================================================
   HELPERS
========================================================= */

const todayISO = () => dayjs().format("YYYY-MM-DD");
const fmtDate = (v) => (v ? dayjs(v).format("YYYY-MM-DD") : "");

const currentFinancialYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return month >= 4 ? String(year) : String(year - 1);
};

const initialForm = {
  id: 0,
  branch: "",
  belongsTo: "",
  frNo: "",
  frDate: todayISO(),
  reference: "",
  supplierName: "",
  supplierCode: "",
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
  financialYear: currentFinancialYear(),
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
}) => (
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
        className={`w-full h-9 px-2 rounded border ${error ? "border-red-500" : "border-gray-300 dark:border-gray-600"
          } bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800`}
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
        className={`w-full px-2 py-2 rounded border ${error ? "border-red-500" : "border-gray-300 dark:border-gray-600"
          } bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800`}
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        disabled={disabled}
        className={`w-full h-9 px-2 rounded border ${error ? "border-red-500" : "border-gray-300 dark:border-gray-600"
          } bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800`}
      />
    )}

    {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
  </div>
);

/* Small section heading used to visually split the form */
const SectionTitle = ({ children }) => (
  <div className="col-span-full mt-1 mb-1 border-b border-gray-200 dark:border-gray-700 pb-1">
    <h3 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
      {children}
    </h3>
  </div>
);

/* =========================================================
   FLASH NC REPORT FORM
========================================================= */

const FlashNcReportForm = ({ onBack, onSave, editData, editId, data }) => {
  const { addToast } = useToast();

  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
  const BRANCH_ID = Number(localStorage.getItem("branchId")) || 0;

  const [form, setForm] = useState(() => ({
    ...initialForm,
    branch: BRANCH_ID ? String(BRANCH_ID) : "",
  }));

  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [generatingDocId, setGeneratingDocId] = useState(false);

  /* -------- master data -------- */
  const [branchOptions, setBranchOptions] = useState([]);
  const [mrinGrnOptions, setMrinGrnOptions] = useState([]);
  const [inspectedByOptions, setInspectedByOptions] = useState([]);
  const [fromDeptOptions, setFromDeptOptions] = useState([]);
  const [allDeptOptions, setAllDeptOptions] = useState([]);
  const [mrinGrnLookup, setMrinGrnLookup] = useState({});

  /* -------- CAPA grid (images) -------- */
  const [capaRows, setCapaRows] = useState([
    { id: Date.now(), file: null, fileName: "", preview: "" },
  ]);

  /* -------- FILE upload grid (documents) -------- */
  const [fileRows, setFileRows] = useState([
    { id: Date.now() + 1, file: null, fileName: "" },
  ]);

  /* -------- static options -------- */
  const belongsToOptions = [
    { value: "1", label: "APPLIANCES" },
    { value: "2", label: "BOSCH" },
  ];

  const referenceOptions = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
  ];

  const disposalOptions = [
    { value: "1", label: "Rework" },
    { value: "2", label: "Concessional Acceptance" },
    { value: "3", label: "Reject" },
    { value: "4", label: "Segregation" },
  ];

  const problemStatusOptions = [
    { value: "Open", label: "Open" },
    { value: "Under Review", label: "Under Review" },
    { value: "Closed", label: "Closed" },
  ];

  const statusOptions = [
    { value: "1", label: "Open" },
    { value: "2", label: "Close" },
  ];

  /* =======================================================
     DERIVED
  ======================================================= */

  const toDeptOptions = useMemo(
    () =>
      allDeptOptions.filter(
        (opt) => String(opt.value) !== String(form.from || ""),
      ),
    [allDeptOptions, form.from],
  );

  const itemOptions = useMemo(() => {
    const entry = mrinGrnLookup[form.mrnScGrnNo];
    const items = entry?.items || [];
    const seen = new Set();
    return items
      .filter((it) => it.itemCode && !seen.has(it.itemCode))
      .map((it) => {
        seen.add(it.itemCode);
        return {
          value: it.itemCode,
          label: it.itemDescription
            ? `${it.itemCode} — ${it.itemDescription}`
            : it.itemCode,
        };
      });
  }, [mrinGrnLookup, form.mrnScGrnNo]);

  /* =======================================================
     LOAD MASTER DATA
  ======================================================= */

  const loadBranches = useCallback(async () => {
    try {
      if (!ORG_ID) return;

      const response = await branchAPI.getBranchByOrgId(ORG_ID);

      const list = Array.isArray(response)
        ? response
        : response?.paramObjectsMap?.branches ||
        response?.paramObjectsMap?.branchVO ||
        [];

      setBranchOptions(
        list.map((b) => ({
          value: String(b.id),
          label: b.branchName || b.name || b.branchCode || `Branch ${b.id}`,
        })),
      );
    } catch (error) {
      console.error("Failed to load branches:", error);
      setBranchOptions([]);
    }
  }, [ORG_ID]);

  const loadMrinGrnDropdown = useCallback(async () => {
    try {
      if (!form.branch || !ORG_ID) {
        setMrinGrnOptions([]);
        setMrinGrnLookup({});
        return;
      }

      const response =
        await flashNcReportAPI.getMRINGRNDropdownForFlashNCReport({
          branch: Number(form.branch),
          orgId: ORG_ID,
        });

      const list = response?.paramObjectsMap?.mrinGrnDropdown || [];

      const lookup = {};
      list.forEach((entry) => {
        lookup[entry.mrinGrnNo] = entry;
      });
      setMrinGrnLookup(lookup);

      setMrinGrnOptions(
        list.map((entry) => ({
          value: entry.mrinGrnNo,
          label: `${entry.mrinGrnNo}${entry.sourceType ? ` (${entry.sourceType})` : ""
            }`,
        })),
      );
    } catch (error) {
      console.error("Failed to load MRIN/GRN dropdown:", error);
      setMrinGrnOptions([]);
      setMrinGrnLookup({});
    }
  }, [form.branch, ORG_ID]);

  const loadQualityEmployees = useCallback(async () => {
    try {
      if (!form.branch || !ORG_ID) {
        setInspectedByOptions([]);
        return;
      }

      const response =
        await flashNcReportAPI.getQualityEmployeesForFlashNCReport({
          branch: Number(form.branch),
          orgId: ORG_ID,
        });

      const list = response?.paramObjectsMap?.employeeDetails || [];

      setInspectedByOptions(
        list.map((e) => ({
          value: String(e.employeeId),
          label: e.employeeName || e.employeeCode || `Emp ${e.employeeId}`,
        })),
      );
    } catch (error) {
      console.error("Failed to load quality employees:", error);
      setInspectedByOptions([]);
    }
  }, [form.branch, ORG_ID]);

  const loadFromDepartments = useCallback(async () => {
    try {
      if (!form.branch || !ORG_ID) {
        setFromDeptOptions([]);
        return;
      }

      const response =
        await flashNcReportAPI.getFromDeptDropdownForFlashNCReport({
          branch: Number(form.branch),
          orgId: ORG_ID,
        });

      const list = response?.paramObjectsMap?.fromDepartment || [];

      setFromDeptOptions(
        list.map((d) => ({
          value: String(d.id),
          label: d.name || `Dept ${d.id}`,
        })),
      );
    } catch (error) {
      console.error("Failed to load From departments:", error);
      setFromDeptOptions([]);
    }
  }, [form.branch, ORG_ID]);

  const loadAllDepartments = useCallback(async () => {
    try {
      if (!ORG_ID) return;

      const response = await departmentAPI.getAllDepartments(ORG_ID);

      const list =
        response?.paramObjectsMap?.departmentVO ||
        response?.paramObjectsMap?.departmentMasterVO ||
        response?.paramObjectsMap?.departments ||
        (Array.isArray(response) ? response : []);

      setAllDeptOptions(
        list.map((d) => ({
          value: String(d.id),
          label: d.departmentName || d.name || `Dept ${d.id}`,
        })),
      );
    } catch (error) {
      console.error("Failed to load all departments:", error);
      setAllDeptOptions([]);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadBranches();
    loadAllDepartments();
  }, [loadBranches, loadAllDepartments]);

  useEffect(() => {
    loadMrinGrnDropdown();
    loadQualityEmployees();
    loadFromDepartments();
  }, [loadMrinGrnDropdown, loadQualityEmployees, loadFromDepartments]);

  /* =======================================================
     DOC ID (FR NO)
  ======================================================= */

  useEffect(() => {
    if (editId || editData?.id) return;
    if (!ORG_ID) return;

    let cancelled = false;

    const generate = async () => {
      setGeneratingDocId(true);
      try {
        const response = await flashNcReportAPI.getFlashNCReportDocId({
          financialYear: form.financialYear,
          orgId: ORG_ID,
        });

        const docId = response?.paramObjectsMap?.docId || "";

        if (!cancelled && docId) {
          setForm((prev) => ({ ...prev, frNo: docId }));
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to generate FR No:", error);
          addToast("Failed to generate FR No", "error");
        }
      } finally {
        if (!cancelled) setGeneratingDocId(false);
      }
    };

    generate();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.financialYear, editId, editData, ORG_ID]);

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

    setForm((prev) => ({
      ...initialForm,
      branch: prev.branch || (BRANCH_ID ? String(BRANCH_ID) : ""),
      frNo: prev.frNo,
      frDate: todayISO(),
    }));
    setImagePreview("");
    setCapaRows([{ id: Date.now(), file: null, fileName: "", preview: "" }]);
    setFileRows([{ id: Date.now() + 1, file: null, fileName: "" }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData, editId]);

  const populateForm = (d) => {
    setForm({
      ...initialForm,
      id: d?.id || 0,
      branch: d?.branch ?? d?.branchId ?? "",
      belongsTo: d?.belongsTo ?? "",
      frNo: d?.frNo || d?.docId || "",
      frDate: fmtDate(d?.frDate) || todayISO(),
      reference: d?.reference ?? "",
      supplierName: d?.supplierName || "",
      supplierCode: d?.supplierCode || "",
      from: d?.fromDept ?? d?.from ?? "",
      to: d?.toDept ?? d?.to ?? "",
      description: d?.description || "",
      itemDescription: d?.itemDescription || "",
      mrnScGrnNo: d?.mrinSCGRNNO || d?.mrnScGrnNo || "",
      mrnDate: fmtDate(d?.mrinDate) || "",
      drawingNo: d?.drawingNo || "",
      occ: d?.occPercentage ?? d?.occ ?? "",
      invoiceNo: d?.invoiceNo || "",
      poNo: d?.poNo || "",
      operationNo: d?.operationNo || "",
      itemCode: d?.item ?? d?.itemCode ?? "",
      lotQty: d?.lotQty ?? "",
      sampleQty: d?.sampleQty ?? "",
      ncQty: d?.ncQty ?? "",
      disposal: d?.disposal ?? "",
      problemDefectSeen: d?.defectSeen || d?.problemDefectSeen || "",
      problemStatus: d?.problemStatus || "",
      actionOnDefectiveLot: d?.actionOnDefectiveLot || "",
      inspectedBy: d?.inspectedBy ?? "",
      status: d?.status ?? "",
      narration: d?.narration || "",
      active:
        d?.active === true || d?.active === "true" || d?.active === "Active",
      cancel:
        d?.cancel === true || d?.cancel === "true" || d?.cancel === "T",
      cancelRemarks: d?.cancelRemarks || "",
      financialYear: d?.financialYear || currentFinancialYear(),
    });

    setImagePreview(d?.imageUrl || "");
  };

  const loadReport = async (id) => {
    try {
      const response = await flashNcReportAPI.getById(id);
      const d =
        response?.data ||
        response?.paramObjectsMap?.flashNcReportVO ||
        response?.flashNcReportVO ||
        response;

      if (d) populateForm(d);
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
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    if (["lotQty", "sampleQty", "ncQty"].includes(name)) {
      if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;
    }

    if (name === "supplierCode" && value.length > 30) return;
    if (name === "operationNo" && value.length > 20) return;
    if (name === "drawingNo" && value.length > 50) return;

    setForm((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "sampleQty" || name === "ncQty") {
        const s = Number(name === "sampleQty" ? value : next.sampleQty);
        const n = Number(name === "ncQty" ? value : next.ncQty);

        if (Number.isFinite(s) && Number.isFinite(n) && s > 0 && n > 0) {
          next.occ = ((s * n) / 100).toFixed(2);
        } else {
          next.occ = "";
        }
      }

      return next;
    });
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    setForm((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "mrnScGrnNo") {
        const entry = mrinGrnLookup[value];
        if (entry) {
          next.supplierName = entry.supplierName || "";
          next.supplierCode = entry.supplierCode || "";
          next.poNo = entry.poNo || "";
          next.invoiceNo = entry.invoiceNo || "";
          next.lotQty = entry.qty || "";
          next.mrnDate = fmtDate(entry.mrinGrnDate) || "";
        } else {
          next.supplierName = "";
          next.supplierCode = "";
          next.poNo = "";
          next.invoiceNo = "";
          next.mrnDate = "";
        }
        next.itemCode = "";
        next.itemDescription = "";
      }

      if (name === "branch") {
        next.mrnScGrnNo = "";
        next.supplierName = "";
        next.supplierCode = "";
        next.poNo = "";
        next.invoiceNo = "";
        next.mrnDate = "";
        next.inspectedBy = "";
        next.itemCode = "";
        next.itemDescription = "";
        next.from = "";
        next.to = "";
      }

      if (name === "from" && String(value) === String(next.to)) {
        next.to = "";
      }

      return next;
    });
  };

  const handleItemChange = (e) => {
    const { value } = e.target;

    if (fieldErrors.itemCode) {
      setFieldErrors((prev) => ({ ...prev, itemCode: "" }));
    }

    setForm((prev) => {
      const next = { ...prev, itemCode: value };
      const entry = mrinGrnLookup[prev.mrnScGrnNo];
      const match = (entry?.items || []).find((it) => it.itemCode === value);
      next.itemDescription = match?.itemDescription || prev.itemDescription;
      return next;
    });
  };

  /* =======================================================
     MAIN IMAGE
  ======================================================= */

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

    setForm((prev) => ({ ...prev, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  /* =======================================================
     CAPA GRID (images)
  ======================================================= */

  const handleAddCapaRow = () => {
    setCapaRows((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), file: null, fileName: "", preview: "" },
    ]);
  };

  const handleCapaFileChange = (e, rowId) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      addToast("Only image files are allowed for CAPA", "error");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast("CAPA image size must be less than 5 MB", "error");
      e.target.value = "";
      return;
    }

    const preview = URL.createObjectURL(file);

    setCapaRows((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? { ...row, file, fileName: file.name, preview }
          : row,
      ),
    );
  };

  const handleRemoveCapaRow = (rowId) => {
    setCapaRows((prev) => {
      const row = prev.find((item) => item.id === rowId);
      if (row?.preview) URL.revokeObjectURL(row.preview);

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

  /* =======================================================
     FILE GRID (documents / attachments)
  ======================================================= */

  const handleAddFileRow = () => {
    setFileRows((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), file: null, fileName: "" },
    ]);
  };

  const handleFileChange = (e, rowId) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Allow most document types; block obvious size overflows
    if (file.size > 10 * 1024 * 1024) {
      addToast("File size must be less than 10 MB", "error");
      e.target.value = "";
      return;
    }

    setFileRows((prev) =>
      prev.map((row) =>
        row.id === rowId ? { ...row, file, fileName: file.name } : row,
      ),
    );
  };

  const handleRemoveFileRow = (rowId) => {
    setFileRows((prev) => {
      if (prev.length === 1) {
        return [{ id: Date.now() + Math.random(), file: null, fileName: "" }];
      }
      return prev.filter((item) => item.id !== rowId);
    });
  };

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validateForm = () => {
    const errors = {};

    if (!form.branch) errors.branch = "Plant is required";
    if (!form.reference) errors.reference = "Reference is required";
    if (!form.frNo?.trim()) errors.frNo = "FR No is required";
    if (!form.frDate) errors.frDate = "FR Date is required";
    if (!form.itemCode) errors.itemCode = "Item Code is required";
    if (!form.disposal) errors.disposal = "Disposal is required";
    if (!form.problemStatus)
      errors.problemStatus = "Problem Status is required";

    if (form.lotQty !== "" && Number(form.lotQty) < 0)
      errors.lotQty = "Lot Qty cannot be negative";
    if (form.sampleQty !== "" && Number(form.sampleQty) < 0)
      errors.sampleQty = "Sample Qty cannot be negative";
    if (form.ncQty !== "" && Number(form.ncQty) < 0)
      errors.ncQty = "NC Qty cannot be negative";

    if (
      form.lotQty !== "" &&
      form.sampleQty !== "" &&
      Number(form.sampleQty) > Number(form.lotQty)
    )
      errors.sampleQty = "Sample Qty cannot be greater than Lot Qty";

    if (
      form.sampleQty !== "" &&
      form.ncQty !== "" &&
      Number(form.ncQty) > Number(form.sampleQty)
    )
      errors.ncQty = "NC Qty cannot be greater than Sample Qty";

    if (form.from && form.to && String(form.from) === String(form.to))
      errors.to = "From and To cannot be the same";

    if (form.frDate && dayjs(form.frDate).isAfter(dayjs(), "day")) {
      errors.frDate = "FR Date cannot be a future date";
    }

    setFieldErrors(errors);
    return errors;
  };

  /* =======================================================
     SAVE
  ======================================================= */

  const handleSave = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      addToast(errors[Object.keys(errors)[0]], "error");
      return;
    }

    try {
      setIsSubmitting(true);

      const fd = new FormData();

      const isEdit = Boolean(form.id && Number(form.id) > 0);

      const dto = {
        ...(isEdit ? { id: Number(form.id) } : {}),
        orgId: ORG_ID,
        branch: Number(form.branch) || 0,
        financialYear: form.financialYear,
        belongsTo: Number(form.belongsTo) || 0,
        reference: Number(form.reference) || 0,
        fromDept: Number(form.from) || 0,
        toDept: Number(form.to) || 0,
        supplier: Number(form.supplier) || 0,
        item: Number(form.itemCode) || 0,
        inspectedBy: Number(form.inspectedBy) || 0,
        disposal: Number(form.disposal) || 0,
        status: Number(form.status) || 0,
        mrinSCGRNNO: form.mrnScGrnNo || "",
        mrinDate: form.mrnDate || null,
        poNo: form.poNo || "",
        invoiceNo: form.invoiceNo || "",
        drawingNo: form.drawingNo || "",
        operationNo: form.operationNo || "",
        description: form.description || "",
        defectSeen: form.problemDefectSeen || "",
        problemStatus: form.problemStatus || "",
        actionOnDefectiveLot: form.actionOnDefectiveLot || "",
        narration: form.narration || "",
        lotQty: Number(form.lotQty) || 0,
        sampleQty: Number(form.sampleQty) || 0,
        ncQty: Number(form.ncQty) || 0,
        occPercentage: Number(form.occ) || 0,
        active: form.active !== false,
        cancel: form.cancel === true,
        cancelRemarks: form.cancelRemarks || "",
        createdBy: localStorage.getItem("userName") || "SYSTEM",
      };

      // ⬇️ Send DTO as JSON Blob (binary format)
      const dtoBlob = new Blob([JSON.stringify(dto)], {
        type: "application/json",
      });
      fd.append("flashNCReportDTO", dtoBlob, "flashNCReportDTO.json");

      // ⬇️ Main image
      if (form.image) fd.append("image", form.image);

      // ⬇️ CAPA images → "images" array
      capaRows.forEach((row) => {
        if (row.file) fd.append("images", row.file);
      });

      // ⬇️ NEW: Documents → "files" array
      fileRows.forEach((row) => {
        if (row.file) fd.append("files", row.file);
      });

      console.log("Sending Flash/NC Report DTO:", dto);
      console.log("FormData entries:");
      for (let pair of fd.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await flashNcReportAPI.save(fd);

      const success =
        response?.status === true ||
        response?.statusFlag === "Ok" ||
        response?.data?.status === true;

      if (success) {
        addToast(
          isEdit
            ? "Flash/NC Report updated successfully"
            : "Flash/NC Report created successfully",
          "success",
        );
        if (onSave) onSave(response);
        else if (onBack) onBack();
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
        <Save className="h-3 w-3" />
        {isSubmitting ? "Saving..." : saveLabel}
      </button>
    </div>
  );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data ? "Edit Flash NC Report" : "Add Flash NC Report"}
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {/* ---------- 1. Identification ---------- */}
          <SectionTitle>Identification</SectionTitle>

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

          <Field
            label="FR No"
            name="frNo"
            value={generatingDocId ? "Generating..." : form.frNo}
            onChange={() => { }}
            disabled
            required
            error={fieldErrors.frNo}
          />

          <Field
            label="FR Date"
            name="frDate"
            value={form.frDate}
            onChange={handleChange}
            type="date"
            required
            error={fieldErrors.frDate}
          />

          <Field
            label="Belongs To"
            name="belongsTo"
            value={form.belongsTo}
            onChange={handleSelectChange}
            options={belongsToOptions}
            type="select"
            error={fieldErrors.belongsTo}
          />

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

          <Field
            label="From Department"
            name="from"
            value={form.from}
            onChange={handleSelectChange}
            options={fromDeptOptions}
            type="select"
            required
            error={fieldErrors.from}
          />

          <Field
            label="To Department"
            name="to"
            value={form.to}
            onChange={handleSelectChange}
            options={toDeptOptions}
            type="select"
            required
            error={fieldErrors.to}
          />

          {/* ---------- 2. Supplier & Document Info ---------- */}
          <SectionTitle>Supplier & Document Info</SectionTitle>

          <Field
            label="MRIN / SC GRN No"
            name="mrnScGrnNo"
            value={form.mrnScGrnNo}
            onChange={handleSelectChange}
            type="select"
            options={mrinGrnOptions}
            error={fieldErrors.mrnScGrnNo}
          />

          <Field
            label="MRIN Date"
            name="mrnDate"
            value={form.mrnDate}
            onChange={handleChange}
            type="date"
            error={fieldErrors.mrnDate}
            disabled
          />

          <Field
            label="Supplier Name"
            name="supplierName"
            value={form.supplierName}
            onChange={handleChange}
            error={fieldErrors.supplierName}
            disabled
          />

          <Field
            label="Supplier Code"
            name="supplierCode"
            value={form.supplierCode}
            onChange={handleChange}
            error={fieldErrors.supplierCode}
            disabled
          />

          <Field
            label="P.O. No."
            name="poNo"
            value={form.poNo}
            onChange={handleChange}
            error={fieldErrors.poNo}
            disabled
          />

          <Field
            label="Invoice No."
            name="invoiceNo"
            value={form.invoiceNo}
            onChange={handleChange}
            error={fieldErrors.invoiceNo}
            disabled
          />

          <Field
            label="Drawing No."
            name="drawingNo"
            value={form.drawingNo}
            onChange={handleChange}
            error={fieldErrors.drawingNo}
          />

          <Field
            label="Operation No."
            name="operationNo"
            value={form.operationNo}
            onChange={handleChange}
            error={fieldErrors.operationNo}
          />

          {/* ---------- 3. Item Details ---------- */}
          <SectionTitle>Item Details</SectionTitle>

          <Field
            label="Item Code"
            name="itemCode"
            value={form.itemCode}
            onChange={handleItemChange}
            options={itemOptions}
            type="select"
            required
            error={fieldErrors.itemCode}
          />

          <Field
            label="Item Description"
            name="itemDescription"
            value={form.itemDescription}
            onChange={handleChange}
            error={fieldErrors.itemDescription}
          />

          <Field
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            error={fieldErrors.description}
          />

          {/* ---------- 4. Quantity & Disposition ---------- */}
          <SectionTitle>Quantity & Disposition</SectionTitle>

          <Field
            label="Lot Qty"
            name="lotQty"
            value={form.lotQty}
            onChange={handleChange}
            error={fieldErrors.lotQty}
          />

          <Field
            label="Sample Qty"
            name="sampleQty"
            value={form.sampleQty}
            onChange={handleChange}
            error={fieldErrors.sampleQty}
          />

          <Field
            label="NC Qty"
            name="ncQty"
            value={form.ncQty}
            onChange={handleChange}
            error={fieldErrors.ncQty}
          />

          <Field
            label="OCC %"
            name="occ"
            value={form.occ}
            onChange={handleChange}
            error={fieldErrors.occ}
            disabled
          />

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

          {/* ---------- 5. Responsibility ---------- */}
          <SectionTitle>Responsibility</SectionTitle>

          <Field
            label="Inspected By"
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
            label="Action On Defective Lot"
            name="actionOnDefectiveLot"
            value={form.actionOnDefectiveLot}
            onChange={handleChange}
            error={fieldErrors.actionOnDefectiveLot}
          />

          {/* ---------- 6. Notes ---------- */}
          <SectionTitle>Notes</SectionTitle>

          <Field
            label="Problem / Defect Seen"
            name="problemDefectSeen"
            value={form.problemDefectSeen}
            onChange={handleChange}
            type="text"
            error={fieldErrors.problemDefectSeen}
            className="md:col-span-2"
          />

          <Field
            label="Narration"
            name="narration"
            value={form.narration}
            onChange={handleChange}
            type="textarea"
            error={fieldErrors.narration}
            className="md:col-span-2 lg:col-span-4"
          />
        </div>

        {/* ==================================================
            CAPA GRID (Images → "images" field)
        ================================================== */}
        <div className="mt-4 border-slate-700 rounded-md overflow-hidden bg-slate-900">
          <div className="relative bg-slate-800 border-b border-slate-700 h-8">
            <div className="flex items-center h-full">
              <div className="px-4 h-full flex items-center bg-blue-600 text-white text-xs font-medium">
                CAPA
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddCapaRow}
              disabled={isSubmitting}
              className="absolute right-1 top-1 w-7 h-7 flex items-center justify-center rounded bg-blue-600 hover:bg-blue-700 text-white text-base font-bold disabled:opacity-50"
              title="Add CAPA"
            >
              +
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-slate-700 text-white">
                  <th className="w-10 px-2 py-1.5 text-left font-semibold border-r border-slate-600">
                    #
                  </th>
                  <th className="px-2 py-1.5 text-left font-semibold border-r border-slate-600">
                    CAPA
                  </th>
                  <th className="w-20 px-2 py-1.5 text-center font-semibold">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {capaRows.map((row, index) => (
                  <tr
                    key={row.id}
                    className="bg-slate-900 hover:bg-slate-800 border-b border-slate-700"
                  >
                    <td className="w-10 px-2 py-1 text-white text-center border-r border-slate-700">
                      {index + 1}
                    </td>
                    <td className="px-2 py-1 border-r border-slate-700">
                      <div className="flex items-center gap-2">
                        <input
                          id={`capa-file-${row.id}`}
                          type="file"
                          accept=".png,.jpg,.jpeg,.gif,.webp,.bmp,.svg"
                          className="hidden"
                          onChange={(e) => handleCapaFileChange(e, row.id)}
                        />
                        <label
                          htmlFor={`capa-file-${row.id}`}
                          className="inline-flex items-center justify-center px-3 h-7 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium cursor-pointer whitespace-nowrap"
                        >
                          Choose File
                        </label>
                        <span
                          className="text-gray-300 text-xs truncate max-w-[600px]"
                          title={row.fileName || "No file chosen"}
                        >
                          {row.fileName || "No file chosen"}
                        </span>
                      </div>
                    </td>
                    <td className="w-20 px-2 py-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveCapaRow(row.id)}
                        disabled={isSubmitting}
                        className="inline-flex items-center justify-center w-7 h-7 rounded bg-slate-600 hover:bg-red-600 text-white transition-colors disabled:opacity-50"
                        title="Remove CAPA"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ==================================================
            FILE UPLOAD GRID (Documents → "files" field)
        ================================================== */}
        <div className="mt-4 border-slate-700 rounded-md overflow-hidden bg-slate-900">
          <div className="relative bg-slate-800 border-b border-slate-700 h-8">
            <div className="flex items-center h-full">
              <div className="px-4 h-full flex items-center bg-blue-600 text-white text-xs font-medium">
                File Upload
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddFileRow}
              disabled={isSubmitting}
              className="absolute right-1 top-1 w-7 h-7 flex items-center justify-center rounded bg-blue-600 hover:bg-blue-700 text-white text-base font-bold disabled:opacity-50"
              title="Add File"
            >
              +
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-slate-700 text-white">
                  <th className="w-10 px-2 py-1.5 text-left font-semibold border-r border-slate-600">
                    #
                  </th>
                  <th className="px-2 py-1.5 text-left font-semibold border-r border-slate-600">
                    File
                  </th>
                  <th className="w-20 px-2 py-1.5 text-center font-semibold">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {fileRows.map((row, index) => (
                  <tr
                    key={row.id}
                    className="bg-slate-900 hover:bg-slate-800 border-b border-slate-700"
                  >
                    <td className="w-10 px-2 py-1 text-white text-center border-r border-slate-700">
                      {index + 1}
                    </td>
                    <td className="px-2 py-1 border-r border-slate-700">
                      <div className="flex items-center gap-2">
                        <input
                          id={`doc-file-${row.id}`}
                          type="file"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.gif,.webp,.bmp,.svg,.zip,.rar,.txt"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, row.id)}
                        />
                        <label
                          htmlFor={`doc-file-${row.id}`}
                          className="inline-flex items-center justify-center px-3 h-7 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium cursor-pointer whitespace-nowrap"
                        >
                          Choose File
                        </label>
                        <span
                          className="text-gray-300 text-xs truncate max-w-[600px]"
                          title={row.fileName || "No file chosen"}
                        >
                          {row.fileName || "No file chosen"}
                        </span>
                      </div>
                    </td>
                    <td className="w-20 px-2 py-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveFileRow(row.id)}
                        disabled={isSubmitting}
                        className="inline-flex items-center justify-center w-7 h-7 rounded bg-slate-600 hover:bg-red-600 text-white transition-colors disabled:opacity-50"
                        title="Remove File"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

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

export default FlashNcReportForm;
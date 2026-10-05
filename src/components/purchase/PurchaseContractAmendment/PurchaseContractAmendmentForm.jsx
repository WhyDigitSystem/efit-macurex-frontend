import { ArrowLeft, Save, X, Plus, Trash2, Eye } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import dayjs from "dayjs";
import axios from "axios";
import purchaseContractAmendmentAPI from "../../../api/Purchase/purchaseContractAmendmentAPI";
import branchAPI from "../../../api/branchAPI";
import { partyMasterAPI } from "../../../api/partyMasterAPI";
import { useToast } from "../../Toast/ToastContext";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "[color-scheme:light] dark:[color-scheme:dark]";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const FREIGHT_TYPES = ["Macurex", "Supplier"];
const PACKING_TYPES = ["Macurex", "Supplier"];
const MODE_OF_DISPATCH = [
  "By Road",
  "By Air",
  "By Sea",
  "By Sea/Air",
  "By Courier",
];

const asId = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return value.id ?? "";
  return value;
};

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");

const getEmptyDetail = () => ({
  id: "",
  item: "",
  itemCode: "",
  itemName: "",
  unit: "",
  unitName: "",
  oldRate: "",
  newRate: "",
  oldValidFrom: "",
  newValidFrom: "",
  oldValidTo: "",
  newValidTo: "",
});

const getDefaultValues = (branch = "") => ({
  id: "",
  branch,
  belongsTo: "Purchase Contract",
  amendmentNo: "",
  amendmentDate: dayjs().format("YYYY-MM-DD"),
  customer: "",
  customerName: "",
  contractNo: "",
  contractDate: "",
  revisionNo: 1,
  refNo: "",
  refDate: "",
  active: true,
  freightType: "",
  packingType: "",
  insuranceAmount: "",
  modeOfDespatch: "",
  taxDescription: "",
  preparedBy: "",
  authorisedBy: "",
  remarks: "",
  details: [getEmptyDetail()],
  attachments: [{ file: null, existing: null }],
});

/* ------------------------------ Field blocks ------------------------------ */

const SelectField = ({
  control,
  name,
  label,
  options,
  required,
  errors,
  disabled,
}) => {
  const errorMessage = errors?.[name]?.message;
  return (
    <div>
      <label className={labelClasses}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        rules={required ? { required: `${label} is required` } : undefined}
        render={({ field }) => (
          <select
            {...field}
            value={field.value ?? ""}
            disabled={disabled}
            className={`${controlClasses} ${
              errorMessage ? "border-red-500 focus:border-red-500" : ""
            }`}
          >
            <option value="">Select {label}</option>
            {(options || []).map((opt) => (
              <option
                key={typeof opt === "object" ? opt.value : opt}
                value={typeof opt === "object" ? opt.value : opt}
              >
                {typeof opt === "object" ? opt.label : opt}
              </option>
            ))}
          </select>
        )}
      />
      {errorMessage && (
        <p className="text-red-500 text-[11px]">{errorMessage}</p>
      )}
    </div>
  );
};

const InputField = ({
  control,
  name,
  label,
  type = "text",
  required,
  placeholder,
  errors,
  disabled,
  step,
}) => {
  const errorMessage = errors?.[name]?.message;
  return (
    <div>
      <label className={labelClasses}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        rules={required ? { required: `${label} is required` } : undefined}
        render={({ field }) => (
          <input
            {...field}
            value={field.value ?? ""}
            type={type}
            step={step}
            className={`${controlClasses} ${
              disabled ? "bg-gray-100 dark:bg-gray-800 text-gray-500" : ""
            } ${errorMessage ? "border-red-500 focus:border-red-500" : ""}`}
            placeholder={placeholder}
            disabled={disabled}
          />
        )}
      />
      {errorMessage && (
        <p className="text-red-500 text-[11px]">{errorMessage}</p>
      )}
    </div>
  );
};

/* ------------------------------ Table blocks ------------------------------ */

const TableWrapper = ({ children }) => (
  <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
    <table className="w-full text-xs">{children}</table>
  </div>
);

const TableHead = ({ headers }) => (
  <thead className="bg-gray-100 dark:bg-gray-700">
    <tr>
      {headers.map((h, i) => (
        <th
          key={i}
          className={`p-1 whitespace-nowrap ${
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

const TableRow = ({
  children,
  index,
  onRemove,
  disabled,
  showPreview = false,
  previewDisabled = false,
  onPreview,
}) => (
  <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
    <td className="p-1 text-center font-medium dark:text-white">{index + 1}</td>
    {children}
    {showPreview && (
      <td className="p-1 text-center whitespace-nowrap">
        <button
          type="button"
          onClick={onPreview}
          disabled={previewDisabled}
          className={`h-5 w-5 rounded text-white flex items-center justify-center ${
            previewDisabled
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-sky-600 hover:bg-sky-700"
          }`}
          title={previewDisabled ? "No file to preview" : "Preview"}
        >
          <Eye size={10} />
        </button>
      </td>
    )}
    <td className="p-1 text-center whitespace-nowrap">
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

const SelectCell = ({
  control,
  name,
  options,
  required,
  errors,
  disabled,
  onChange,
}) => {
  const errorMessage = errors?.[name]?.message;
  return (
    <td className="p-1 align-top">
      <Controller
        name={name}
        control={control}
        rules={required ? { required: "This field is required" } : undefined}
        render={({ field }) => (
          <select
            {...field}
            value={field.value ?? ""}
            disabled={disabled}
            className={`${controlClasses} h-8 text-xs ${
              disabled ? "bg-gray-100 dark:bg-gray-800 text-gray-500" : ""
            } ${errorMessage ? "border-red-500 focus:border-red-500" : ""}`}
            onChange={(e) => {
              field.onChange(e);
              if (onChange) onChange(e.target.value);
            }}
          >
            <option value="">Select an option</option>
            {(options || []).map((opt) => (
              <option
                key={typeof opt === "object" ? opt.value : opt}
                value={typeof opt === "object" ? opt.value : opt}
              >
                {typeof opt === "object" ? opt.label : opt}
              </option>
            ))}
          </select>
        )}
      />
      {errorMessage && (
        <div className="text-red-500 text-[10px] mt-0.5 whitespace-nowrap">
          {errorMessage}
        </div>
      )}
    </td>
  );
};

const InputCell = ({
  control,
  name,
  type = "text",
  step,
  placeholder,
  required,
  errors,
  readOnly,
}) => {
  const errorMessage = errors?.[name]?.message;
  return (
    <td className="p-1 align-top">
      <Controller
        name={name}
        control={control}
        rules={required ? { required: "This field is required" } : undefined}
        render={({ field }) => (
          <input
            {...field}
            value={field.value ?? ""}
            type={type}
            step={step}
            readOnly={readOnly}
            className={`${controlClasses} ${
              readOnly ? "bg-gray-100 dark:bg-gray-800 text-gray-500" : ""
            } ${errorMessage ? "border-red-500 focus:border-red-500" : ""}`}
            placeholder={placeholder}
          />
        )}
      />
      {errorMessage && (
        <div className="text-red-500 text-[10px] mt-0.5 whitespace-nowrap">
          {errorMessage}
        </div>
      )}
    </td>
  );
};

/* -------------------------------- Component -------------------------------- */

const PurchaseContractAmendmentForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId")) || 0;
  const branchId = Number(localStorage.getItem("branchId")) || 1000000001;
  const loginUserName = localStorage.getItem("userName") || "";

  const isEditMode = Boolean(data?.id);
  const dataLoadedRef = useRef(false);
  const amendmentNoLoadedRef = useRef(false);
  const fileInputRefs = useRef({});

  const [activeTab, setActiveTab] = useState("pcDetail");
  const [saving, setSaving] = useState(false);

  const [branchOptions, setBranchOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [contractOptions, setContractOptions] = useState([]);
  const [belongsToOptions, setBelongsToOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [preview, setPreview] = useState({
    url: "",
    name: "",
    isImage: false,
    loading: false,
    error: "",
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onTouched",
    defaultValues: getDefaultValues(isEditMode ? "" : String(branchId)),
  });

  const detailsArray = useFieldArray({ control, name: "details" });
  const attachmentArray = useFieldArray({ control, name: "attachments" });

  const watchDetails = watch("details");
  const watchContractNo = watch("contractNo");
  const watchCustomer = watch("customer");
  const watchBranch = watch("branch");

  const activeBranch = Number(watchBranch) || branchId;

  const getFieldArray = (tab) =>
    tab === "attachment" ? attachmentArray : detailsArray;

  /* ------------------------------ Loaders ------------------------------ */

  const loadBranches = useCallback(async () => {
    try {
      const response = await branchAPI.getBranchByOrgId(orgId);
      setBranchOptions(
        (response || []).map((b) => ({ value: b.id, label: b.branchName })),
      );
    } catch (error) {
      console.error("Failed to load branches:", error);
      setBranchOptions([]);
    }
  }, [orgId]);

  const loadCustomers = useCallback(async () => {
    try {
      const response = await partyMasterAPI.getPartyByOrgId(orgId, branchId);
      setCustomerOptions(
        (response || []).map((c) => {
          const name =
            c.customerName ??
            c.partyName ??
            `${c.customerCode ?? ""} ${c.customerName ?? ""}`.trim();
          return {
            value: c.id ?? c.customerId ?? c.partyId,
            label: name,
            customerName: name,
          };
        }),
      );
    } catch (error) {
      console.error("Failed to load customers:", error);
      setCustomerOptions([]);
    }
  }, [orgId, branchId]);

  const loadEmployees = useCallback(async () => {
    try {
      const list =
        await purchaseContractAmendmentAPI.getEmployeesByOrgId(orgId);
      setEmployeeOptions(
        (list || []).map((e) => ({
          value: e.id,
          label: e.employeeId
            ? `${e.employeeName} (${e.employeeId})`
            : e.employeeName,
        })),
      );
    } catch (error) {
      console.error("Failed to load employees:", error);
      setEmployeeOptions([]);
    }
  }, [orgId]);

  const loadContracts = useCallback(async () => {
    if (!activeBranch || !orgId || !watchCustomer) {
      setContractOptions([]);
      return;
    }
    try {
      const list = await purchaseContractAmendmentAPI.getContractNoDropdown({
        branch: activeBranch,
        customerId: Number(watchCustomer),
        orgId,
      });
      setContractOptions(
        (list || [])
          .filter((c) => c?.contractNo)
          .map((c) => ({
            value: c.contractNo,
            label: c.contractNo,
            contractDate: c.contractDate,
            id: c.id,
          })),
      );
    } catch (error) {
      console.error("Failed to load contracts:", error);
      setContractOptions([]);
    }
  }, [orgId, activeBranch, watchCustomer]);

  const loadItems = useCallback(
    async (contractNo) => {
      if (!contractNo) {
        if (!isEditMode) setItemOptions([]);
        return;
      }
      try {
        const list = await purchaseContractAmendmentAPI.getItemCodeDropdown(
          activeBranch,
          contractNo,
          orgId,
        );

        const mapped = (list || []).map((item) => ({
          value: item.id,
          label: item.itemCode || String(item.id ?? ""),
          itemCode: item.itemCode || "",
          itemDescription: item.itemDescription || "",
          unit: item.unitId ?? "",
          unitDescription: item.unitDescription || "",
          // not returned by the dropdown yet; falls back to blank
          rate: item.rate ?? item.oldRate ?? "",
          validFrom: item.validFrom || item.oldValidFrom || "",
          validTo: item.validTo || item.oldValidTo || "",
        }));

        if (isEditMode) {
          setItemOptions((prev) => {
            const seen = new Set(mapped.map((o) => String(o.value)));
            return [
              ...mapped,
              ...prev.filter((o) => !seen.has(String(o.value))),
            ];
          });
        } else {
          setItemOptions(mapped);
        }
      } catch (error) {
        console.error("Failed to load items:", error);
        if (!isEditMode) setItemOptions([]);
      }
    },
    [orgId, activeBranch, isEditMode],
  );

  /* ------------------------------ Effects ------------------------------ */

  useEffect(() => {
    loadBranches();
    loadCustomers();
    loadEmployees();
  }, [loadBranches, loadCustomers, loadEmployees]);

  useEffect(() => {
    loadContracts();
  }, [loadContracts]);

  // Load items when contract changes. In create mode, reset detail rows too.
  const prevContractRef = useRef(watchContractNo);
  useEffect(() => {
    if (!isEditMode && prevContractRef.current !== watchContractNo) {
      setValue("details", [getEmptyDetail()]);
    }
    prevContractRef.current = watchContractNo;
    loadItems(watchContractNo);
  }, [watchContractNo, loadItems, isEditMode, setValue]);

  // Contract date auto-fill
  useEffect(() => {
    if (!watchContractNo) {
      setValue("contractDate", "");
      return;
    }
    const match = contractOptions.find(
      (c) => String(c.value) === String(watchContractNo),
    );
    if (match?.contractDate) {
      setValue("contractDate", fmtDate(match.contractDate));
    }
  }, [watchContractNo, contractOptions, setValue]);

  // Belongs-to list
  useEffect(() => {
    purchaseContractAmendmentAPI
      .getListValuesGroup("SDS BELONGS TO", orgId)
      .then((listValues) => {
        setBelongsToOptions(
          (listValues || []).map((item) => ({
            value: item.valuesDescription,
            label: item.valuesDescription,
          })),
        );
      })
      .catch((error) => {
        console.error("Failed to fetch belongs to list:", error);
        setBelongsToOptions([
          { value: "Purchase Contract", label: "Purchase Contract" },
        ]);
      });
  }, [orgId]);

  // Edit mode: populate form from saved data
  useEffect(() => {
    if (!isEditMode || dataLoadedRef.current) return;

    const src = data || {};

    setValue("id", src.id ?? "");
    setValue("branch", asId(src.branch));
    setValue("belongsTo", src.belongsTo || "Purchase Contract");
    setValue("amendmentNo", src.docId || "");
    setValue(
      "amendmentDate",
      fmtDate(src.docDate) || dayjs().format("YYYY-MM-DD"),
    );
    setValue("customer", asId(src.customer));
    setValue("customerName", src.customer?.customerName || "");
    setValue("contractNo", src.contractNo || src.purchaseContractNumber || "");
    setValue("contractDate", fmtDate(src.contractDate));
    setValue("revisionNo", src.revisionNo ?? 1);
    setValue("refNo", src.refNo || "");
    setValue("refDate", fmtDate(src.refDate));
    setValue("active", src.active !== false);
    setValue("freightType", src.freightType || "");
    setValue("packingType", src.packingType || "");
    setValue("insuranceAmount", src.insuranceAmount ?? "");
    setValue("modeOfDespatch", src.modeOfDespatch || "");
    setValue("taxDescription", src.taxDescription || "");
    setValue("preparedBy", asId(src.preparedBy));
    setValue("authorisedBy", asId(src.authorisedBy));
    setValue("remarks", src.remarks || "");

    const details = (src.details || []).map((d) => ({
      id: d.id ?? "",
      item: asId(d.item),
      itemCode: d.item?.itemCode || "",
      itemName: d.item?.itemDescription || "",
      unit: asId(d.unit),
      unitName:
        (d.unit && typeof d.unit === "object"
          ? d.unit.unitId || d.unit.description || d.unit.unitDescription
          : "") ||
        d.unitDescription ||
        "",
      oldRate: d.oldRate ?? "",
      newRate: d.newRate ?? "",
      oldValidFrom: fmtDate(d.validFrom ?? d.oldValidFrom),
      newValidFrom: fmtDate(d.newValidFrom),
      oldValidTo: fmtDate(d.validTo ?? d.oldValidTo),
      newValidTo: fmtDate(d.newValidTo),
    }));

    setValue("details", details.length ? details : [getEmptyDetail()]);

    // make saved items available in the dropdown
    const savedItemOptions = (src.details || [])
      .map((d) => d?.item)
      .filter((it) => it && it.id != null)
      .map((it) => ({
        value: it.id,
        label: it.itemCode || String(it.id),
        itemCode: it.itemCode || "",
        itemDescription: it.itemDescription || "",
        unit: "",
        unitDescription: "",
        rate: "",
        validFrom: "",
        validTo: "",
      }));

    if (savedItemOptions.length) {
      setItemOptions((prev) => {
        const existing = new Set(prev.map((o) => String(o.value)));
        return [
          ...prev,
          ...savedItemOptions.filter((o) => !existing.has(String(o.value))),
        ];
      });
    }

    if ((src.attachments || []).length) {
      setValue(
        "attachments",
        src.attachments.map((a) => ({ file: null, existing: a })),
      );
    }

    dataLoadedRef.current = true;
  }, [isEditMode, data, setValue]);

  // Edit mode: backfill description / unit name from the item dropdown
  useEffect(() => {
    if (!isEditMode || !itemOptions.length) return;
    (watchDetails || []).forEach((row, i) => {
      if (!row?.item) return;
      const opt = itemOptions.find((o) => String(o.value) === String(row.item));
      if (!opt) return;
      if (!row.itemName && opt.itemDescription) {
        setValue(`details.${i}.itemName`, opt.itemDescription);
      }
      if (!row.unitName && opt.unitDescription) {
        setValue(`details.${i}.unitName`, opt.unitDescription);
      }
    });
  }, [isEditMode, itemOptions, watchDetails, setValue]);

  // Amendment No (create mode)
  useEffect(() => {
    if (isEditMode || amendmentNoLoadedRef.current) return;

    let cancelled = false;

    const generateDocId = async () => {
      try {
        const docId = await purchaseContractAmendmentAPI.getDocId({
          financialYear: String(new Date().getFullYear()),
          orgId,
        });
        if (!cancelled && docId) {
          setValue("amendmentNo", docId);
          amendmentNoLoadedRef.current = true;
        }
      } catch (error) {
        console.error("Failed to generate Amendment No:", error);
      }
    };

    generateDocId();
    return () => {
      cancelled = true;
    };
  }, [isEditMode, orgId, setValue]);

  // Party name auto-fill
  useEffect(() => {
    if (!watchCustomer) {
      setValue("customerName", "");
      return;
    }
    const selected = customerOptions.find(
      (c) => String(c.value) === String(watchCustomer),
    );
    if (selected) {
      setValue("customerName", selected.customerName || selected.label || "");
    }
  }, [watchCustomer, customerOptions, setValue]);

  /* ------------------------------ Handlers ------------------------------ */

  // Fires only when the user picks an item in a row.
  const handleItemChange = (index, itemId) => {
    const selected = itemOptions.find(
      (o) => String(o.value) === String(itemId),
    );

    const prefix = `details.${index}`;
    const opts = { shouldDirty: true };

    if (!selected) {
      ["itemCode", "itemName", "unit", "unitName"].forEach((k) =>
        setValue(`${prefix}.${k}`, "", opts),
      );
      return;
    }

    setValue(`${prefix}.itemCode`, selected.itemCode || "", opts);
    setValue(`${prefix}.itemName`, selected.itemDescription || "", opts);
    setValue(`${prefix}.unitName`, selected.unitDescription || "", opts);
    setValue(
      `${prefix}.unit`,
      selected.unit !== null &&
        selected.unit !== undefined &&
        selected.unit !== ""
        ? String(selected.unit)
        : "",
      opts,
    );
    // oldRate / oldValidFrom / oldValidTo / new* are entered by the user
  };

  // hide items already chosen in other rows
  const getRowItemOptions = (index) => {
    const chosenElsewhere = new Set(
      (watchDetails || [])
        .filter((_, i) => i !== index)
        .map((r) => String(r?.item || ""))
        .filter(Boolean),
    );
    return itemOptions.filter((o) => !chosenElsewhere.has(String(o.value)));
  };

  const handleAdd = (tab) => {
    if (tab === "pcDetail") {
      detailsArray.append(getEmptyDetail());
    } else if (tab === "attachment") {
      attachmentArray.append({ file: null, existing: null });
    }
  };

  const handleRemove = (tab, index) => {
    getFieldArray(tab).remove(index);
  };

  const getAttachmentName = (row) => {
    if (!row) return "Attachment";
    if (row.file && row.file instanceof File) {
      return row.file.name || "Attachment";
    }
    const existing = row.existing;
    if (existing && typeof existing === "object") {
      return (
        existing.name ||
        existing.fileName ||
        (existing.filePath || "").split("/").pop() ||
        "Attachment"
      );
    }
    if (existing && typeof existing === "string") {
      return existing.split("/").pop() || existing;
    }
    return "Attachment";
  };

  const closePreview = () =>
    setPreview({
      url: "",
      name: "",
      isImage: false,
      loading: false,
      error: "",
    });

  const handleAttachmentPreview = async (row) => {
    const name = getAttachmentName(row);

    if (row.file && row.file instanceof File) {
      const url = URL.createObjectURL(row.file);
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      setPreview({
        url,
        name,
        isImage:
          row.file.type?.startsWith("image/") ||
          /\.(png|jpe?g|gif|bmp|webp)$/i.test(name),
        loading: false,
        error: "",
      });
      return;
    }

    const existing = row.existing;
    let sourcePath = "";
    if (existing && typeof existing === "object") {
      sourcePath = existing.filePath || "";
    } else if (typeof existing === "string") {
      sourcePath = existing;
    }

    if (!sourcePath) {
      addToast("No file available to preview", "warning");
      return;
    }

    setPreview({ url: "", name, isImage: false, loading: true, error: "" });

    try {
      const token =
        localStorage.getItem("user.token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        JSON.parse(localStorage.getItem("user") || "{}")?.token;

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/files/download?path=${encodeURIComponent(sourcePath)}`,
        {
          responseType: "blob",
          headers: token
            ? { Authorization: `Bearer ${token.replace("Bearer ", "")}` }
            : undefined,
        },
      );

      const blob = response.data;
      if (!blob || blob.size === 0) {
        setPreview({
          url: "",
          name,
          isImage: false,
          loading: false,
          error: "Unable to load file",
        });
        return;
      }

      const url = URL.createObjectURL(blob);
      setPreview({
        url,
        name,
        isImage:
          blob.type?.startsWith("image/") ||
          /\.(png|jpe?g|gif|bmp|webp)$/i.test(name),
        loading: false,
        error: "",
      });
    } catch (error) {
      setPreview({
        url: "",
        name,
        isImage: false,
        loading: false,
        error:
          error?.response?.status === 401
            ? "Unauthorized"
            : "Failed to load file",
      });
    }
  };

  const onSubmit = async (formData) => {
    const validDetails = (formData.details || []).filter(
      (d) => d?.item !== "" && d?.item !== null && d?.item !== undefined,
    );

    if (!validDetails.length) {
      addToast("Add at least one PC detail item", "warning");
      setActiveTab("pcDetail");
      return;
    }

    const badDates = validDetails.some(
      (d) => d.newValidFrom && d.newValidTo && d.newValidTo < d.newValidFrom,
    );
    if (badDates) {
      addToast("New Valid To cannot be before New Valid From", "warning");
      setActiveTab("pcDetail");
      return;
    }

    const isUpdate = Boolean(data?.id);
    const branch = Number(formData.branch || branchId);
    const customer = Number(formData.customer || 0);

    if (!branch) return addToast("Plant is required", "warning");
    if (!customer) return addToast("Party is required", "warning");
    if (!formData.contractNo)
      return addToast("Contract No is required", "warning");
    if (!formData.amendmentNo)
      return addToast("Amendment No is required", "warning");
    if (!formData.amendmentDate)
      return addToast("Amendment Date is required", "warning");

    setSaving(true);

    try {
      const financialYear =
        localStorage.getItem("finYear") || String(new Date().getFullYear());

      const payload = {
        ...(isUpdate ? { id: Number(data.id) } : {}),

        active: formData.active !== false,
        authorisedBy: formData.authorisedBy
          ? String(formData.authorisedBy)
          : "",
        belongsTo: formData.belongsTo || "Purchase Contract",
        branch,
        cancel: false,
        cancelRemarks: data?.cancelRemarks || "",
        contractDate: formData.contractDate || null,
        contractNo: formData.contractNo || "",
        createdBy:
          (isUpdate ? data?.createdBy : null) ||
          localStorage.getItem("usersId") ||
          loginUserName ||
          "SYSTEM",
        customer,
        docId: formData.amendmentNo || "",
        docDate: formData.amendmentDate || null,
        financialYear,
        freightType: formData.freightType || "",
        insuranceAmount: Number(formData.insuranceAmount || 0),
        modeOfDespatch: formData.modeOfDespatch || "",
        orgId,
        packingType: formData.packingType || "",
        preparedBy: formData.preparedBy ? String(formData.preparedBy) : "",
        refDate: formData.refDate || null,
        refNo: formData.refNo || "",
        remarks: formData.remarks || "",
        revisionNo: Number(formData.revisionNo || 1),
        taxDescription: formData.taxDescription || "",

        details: validDetails.map((d) => ({
          ...(d.id ? { id: Number(d.id) } : {}),
          item: Number(d.item),
          unit:
            d.unit !== null && d.unit !== undefined && d.unit !== ""
              ? Number(d.unit)
              : null,
          oldRate: Number(d.oldRate || 0),
          newRate: Number(d.newRate || 0),
          // backend names the OLD dates validFrom / validTo
          validFrom: d.oldValidFrom || null,
          validTo: d.oldValidTo || null,
          newValidFrom: d.newValidFrom || null,
          newValidTo: d.newValidTo || null,
        })),
      };

      // Backend: @RequestPart("purchaseContractAmendment") + @RequestPart("files")
      const body = new FormData();
      body.append(
        "purchaseContractAmendment",
        new Blob([JSON.stringify(payload)], { type: "application/json" }),
        "purchaseContractAmendment.json",
      );
      (formData.attachments || []).forEach((a) => {
        if (a?.file instanceof File) body.append("files", a.file, a.file.name);
      });

      const response = await purchaseContractAmendmentAPI.createUpdate(body);

      const isSuccess =
        response?.status === true ||
        response?.success === true ||
        response?.status === "SUCCESS" ||
        response?.status === 200 ||
        response?.statusCode === 200 ||
        response?.statusFlag === "Ok";

      if (isSuccess) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Amendment updated successfully"
              : "Amendment created successfully"),
          "success",
        );
        reset(getDefaultValues());
        onBack();
        return;
      }

      addToast(
        response?.message ||
          response?.paramObjectsMap?.errorMessage ||
          response?.paramObjectsMap?.message ||
          response?.errorMessage ||
          "Failed to save amendment",
        "error",
      );
    } catch (error) {
      console.error("PC Amendment save error:", error?.response?.data || error);
      const d = error?.response?.data;
      addToast(
        d?.message ||
          d?.errorMessage ||
          d?.error ||
          d?.paramObjectsMap?.errorMessage ||
          d?.paramObjectsMap?.message ||
          error?.message ||
          "Failed to save amendment. Please try again.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  /* ------------------------------- Render ------------------------------- */

  return (
    <div className="w-full mx-auto p-2 max-w-7xl relative">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {isEditMode
            ? "Edit Purchase Contract Amendment"
            : "Add Purchase Contract Amendment"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
        {/* Header Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <SelectField
            control={control}
            name="branch"
            label="Plant Id"
            options={branchOptions}
            required
            errors={errors}
          />
          <InputField
            control={control}
            name="amendmentNo"
            label="Amendment No"
            placeholder="Auto"
            disabled
            errors={errors}
          />
          <SelectField
            control={control}
            name="belongsTo"
            label="Belongs To"
            options={belongsToOptions}
            errors={errors}
          />
          <InputField
            control={control}
            name="amendmentDate"
            label="Amendment Date"
            type="date"
            required
            errors={errors}
          />
          <SelectField
            control={control}
            name="customer"
            label="Party Id"
            options={customerOptions}
            required
            errors={errors}
          />
          <InputField
            control={control}
            name="customerName"
            label="Party Name"
            placeholder="Auto-filled"
            errors={errors}
            disabled
          />
          <SelectField
            control={control}
            name="contractNo"
            label="Contract No"
            options={contractOptions}
            required
            errors={errors}
          />
          <InputField
            control={control}
            name="contractDate"
            label="Contract Date"
            type="date"
            errors={errors}
            disabled
          />
          <InputField
            control={control}
            name="revisionNo"
            label="Revision No"
            type="number"
            errors={errors}
            disabled
          />
          <InputField
            control={control}
            name="refNo"
            label="Ref No."
            placeholder="Enter Ref No."
            errors={errors}
          />
          <InputField
            control={control}
            name="refDate"
            label="Ref Date"
            type="date"
            errors={errors}
          />
        </div>

        {/* Child Tables */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-0">
            <div className="flex">
              {[
                { key: "pcDetail", label: "PC Detail" },
                { key: "summary", label: "Summary" },
                { key: "attachment", label: "Attachment" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-1 text-xs font-semibold rounded-t whitespace-nowrap ${
                    activeTab === tab.key
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {activeTab !== "summary" && (
              <button
                type="button"
                onClick={() => handleAdd(activeTab)}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {/* PC Detail */}
          {activeTab === "pcDetail" && (
            <div className="pt-3">
              <TableWrapper>
                <TableHead
                  headers={[
                    "S.No",
                    "Item Code",
                    "Item Description",
                    "Unit",
                    "Old Rate",
                    "New Rate",
                    "Old Valid From",
                    "New Valid From",
                    "Old Valid To",
                    "New Valid To",
                    "Action",
                  ]}
                />
                <tbody>
                  {detailsArray.fields.map((field, index) => (
                    <TableRow
                      key={field.id}
                      index={index}
                      onRemove={() => handleRemove("pcDetail", index)}
                      disabled={detailsArray.fields.length <= 1}
                    >
                      <SelectCell
                        control={control}
                        name={`details.${index}.item`}
                        options={getRowItemOptions(index)}
                        required
                        errors={errors}
                        onChange={(val) => handleItemChange(index, val)}
                      />
                      <InputCell
                        control={control}
                        name={`details.${index}.itemName`}
                        placeholder="Item Description"
                        readOnly
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`details.${index}.unitName`}
                        placeholder="Unit"
                        readOnly
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`details.${index}.oldRate`}
                        type="number"
                        step="0.01"
                        placeholder="Old Rate"
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`details.${index}.newRate`}
                        type="number"
                        step="0.01"
                        placeholder="New Rate"
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`details.${index}.oldValidFrom`}
                        type="date"
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`details.${index}.newValidFrom`}
                        type="date"
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`details.${index}.oldValidTo`}
                        type="date"
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`details.${index}.newValidTo`}
                        type="date"
                        errors={errors}
                      />
                    </TableRow>
                  ))}
                </tbody>
              </TableWrapper>
            </div>
          )}

          {/* Summary */}
          {activeTab === "summary" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-3">
              <SelectField
                control={control}
                name="freightType"
                label="Freight Type"
                options={FREIGHT_TYPES}
                errors={errors}
              />
              <SelectField
                control={control}
                name="packingType"
                label="Packing Type"
                options={PACKING_TYPES}
                errors={errors}
              />
              <InputField
                control={control}
                name="insuranceAmount"
                label="Insurance Amount"
                type="number"
                step="0.01"
                errors={errors}
              />
              <SelectField
                control={control}
                name="modeOfDespatch"
                label="Mode of Despatch"
                options={MODE_OF_DISPATCH}
                errors={errors}
              />
              <InputField
                control={control}
                name="taxDescription"
                label="Tax Description"
                placeholder="Enter tax description"
                errors={errors}
              />
              <SelectField
                control={control}
                name="preparedBy"
                label="Prepared By"
                options={employeeOptions}
                errors={errors}
              />
              <SelectField
                control={control}
                name="authorisedBy"
                label="Authorised By"
                options={employeeOptions}
                errors={errors}
              />
              <InputField
                control={control}
                name="remarks"
                label="Remarks"
                placeholder="Enter remarks"
                errors={errors}
              />
            </div>
          )}

          {/* Attachment */}
          {activeTab === "attachment" && (
            <div className="pt-3 space-y-2">
              <TableWrapper>
                <TableHead
                  headers={["S.No", "Document", "Preview", "Action"]}
                />
                <tbody>
                  {attachmentArray.fields.map((field, index) => (
                    <TableRow
                      key={field.id}
                      index={index}
                      onRemove={() => handleRemove("attachment", index)}
                      disabled={attachmentArray.fields.length <= 1}
                      showPreview
                      previewDisabled={
                        !field.file &&
                        !field.existing &&
                        !fileInputRefs.current[field.id]?.files?.[0]
                      }
                      onPreview={() => {
                        const domFile =
                          fileInputRefs.current[field.id]?.files?.[0] || null;
                        handleAttachmentPreview({
                          ...field,
                          file: field.file || domFile,
                        });
                      }}
                    >
                      <td className="p-1">
                        {!field.existing && (
                          <Controller
                            name={`attachments.${index}.file`}
                            control={control}
                            render={({ field: f }) => (
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                className={`${controlClasses} h-9 text-xs file:mr-3 file:px-2 sm:file:px-3 file:py-1 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700`}
                                ref={(el) =>
                                  (fileInputRefs.current[field.id] = el)
                                }
                                onChange={(e) =>
                                  f.onChange(e.target.files?.[0] || null)
                                }
                              />
                            )}
                          />
                        )}
                        {field.file || field.existing ? (
                          <span className="block mt-1 text-[10px] text-blue-600 dark:text-blue-400 truncate max-w-[200px]">
                            {getAttachmentName(field)}
                          </span>
                        ) : (
                          <p className="mt-1 text-[10px] text-gray-400">
                            No file chosen
                          </p>
                        )}
                      </td>
                    </TableRow>
                  ))}
                </tbody>
              </TableWrapper>
              <p className="text-[10px] text-gray-400">
                Supported formats: PDF, DOC, DOCX, JPG, PNG
              </p>
            </div>
          )}
        </section>

        {/* Preview popup */}
        {(preview.url || preview.loading || preview.error) && (
          <div
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 sm:p-6"
            onClick={closePreview}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-xs font-medium truncate dark:text-white">
                  {preview.name}
                </span>
                <button
                  type="button"
                  onClick={closePreview}
                  className="text-xs text-red-600 hover:underline dark:text-red-400"
                >
                  Close
                </button>
              </div>
              <div className="flex-1 overflow-auto p-2">
                {preview.loading ? (
                  <p className="py-10 text-center text-xs text-gray-500 dark:text-gray-400">
                    Loading preview...
                  </p>
                ) : preview.error ? (
                  <p className="py-10 text-center text-xs font-medium text-red-600 dark:text-red-400">
                    {preview.error}
                  </p>
                ) : preview.isImage ? (
                  <img
                    src={preview.url}
                    alt={preview.name}
                    className="mx-auto max-w-full"
                  />
                ) : (
                  <iframe
                    src={preview.url}
                    title={preview.name}
                    className="w-full h-[65vh] sm:h-[72vh] rounded border dark:border-gray-700"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onBack}
            disabled={saving}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <X className="h-3 w-3" /> Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={saving}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-3 w-3" />{" "}
            {saving ? "Saving..." : isEditMode ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseContractAmendmentForm;

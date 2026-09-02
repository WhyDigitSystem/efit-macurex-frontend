import { ArrowLeft, Save, X, Plus, Trash2, Eye } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import dayjs from "dayjs";
import axios from "axios";
import purchaseOrderAmendmentAPI from "../../../api/Purchase/purchaseOrderAmendmentAPI";
import branchAPI from "../../../api/branchAPI";
import { partyMasterAPI } from "../../../api/partyMasterAPI";
import { useToast } from "../../Toast/ToastContext";

/* ---------------------------------------------------------------------------- */
/* Shared design tokens                                                        */

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "[color-scheme:light] dark:[color-scheme:dark]";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const BELONGS_TO = ["Purchase", "Import", "Export"];
const FREIGHT_TYPES = ["CIF", "FOB", "CFR", "EXW", "DDP", "ROAD"];
const PACKING_TYPES = [
  "Standard",
  "Export",
  "Waterproof",
  "Wooden Crate",
  "Pallet",
];
const MODE_OF_DISPATCH = [
  "Road",
  "Rail",
  "Air",
  "Sea",
  "Road Transport",
  "Courier",
];

const asId = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return value.id ?? "";
  return value;
};

const getDefaultValues = () => ({
  id: "",
  branch: "",
  belongsTo: "Purchase",
  amendmentNo: "",
  amendmentDate: dayjs().format("YYYY-MM-DD"),
  customer: "",
  customerName: "",
  poNo: "",
  currency: "",
  exchangeRate: "",
  refNo: "",
  refDate: "",
  revisionNo: "",
  active: true,
  freightType: "",
  packingType: "",
  insuranceAmount: "",
  modeOfDespatch: "",
  taxDescription: "",
  remarks: "",
  details: [
    {
      id: "",
      item: "",
      itemCode: "",
      itemName: "",
      unit: "",
      oldQty: "",
      newQty: "",
      oldRate: "",
      newRate: "",
      oldDeliveryDate: "",
      newDeliveryDate: "",
    },
  ],
  attachments: [{ file: null, existing: null }],
});

const fmtDate = (value) =>
  value ? dayjs(value).format("YYYY-MM-DD") : "";

/* Helper Components (mirror Quotation) */
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
  value,
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
        rules={
          required ? { required: `${label} is required` } : undefined
        }
        render={({ field }) => (
          <input
            {...field}
            type={type}
            step={step}
            value={value !== undefined ? value : field.value}
            className={`${controlClasses} ${
              errorMessage ? "border-red-500 focus:border-red-500" : ""
            }`}
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
          className={`p-1 ${
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
showDelete = true,
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
    {showDelete && (
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
    )}
  </tr>
);

const SelectCell = ({ control, name, options, required, errors }) => {
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
            className={`${controlClasses} h-8 text-xs ${
              errorMessage ? "border-red-500 focus:border-red-500" : ""
            }`}
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
  onChange,
  overrideValue,
}) => {
  const errorMessage = errors?.[name]?.message;
  return (
    <td className="p-1 align-top">
      <Controller
        name={name}
        control={control}
        rules={required ? { required: "This field is required" } : undefined}
        render={({ field }) => {
          const hasOverride =
            overrideValue !== undefined &&
            overrideValue !== null &&
            overrideValue !== "";
          const effectiveValue = hasOverride
            ? String(overrideValue)
            : field.value;
          const forceReadOnly = readOnly || (hasOverride && effectiveValue !== field.value);
          return (
            <input
              {...field}
              value={effectiveValue ?? ""}
              type={type}
              step={step}
              readOnly={forceReadOnly}
              className={`${controlClasses} ${
                forceReadOnly ? "bg-gray-100 dark:bg-gray-800 text-gray-500" : ""
              } ${errorMessage ? "border-red-500 focus:border-red-500" : ""}`}
              placeholder={placeholder}
              onChange={(e) => {
                field.onChange(e);
                if (onChange) onChange(e, field);
              }}
            />
          );
        }}
      />
      {errorMessage && (
        <div className="text-red-500 text-[10px] mt-0.5 whitespace-nowrap">
          {errorMessage}
        </div>
      )}
    </td>
  );
};

/* ---------------------------------------------------------------------------- */
/* Main Component                                                              */

const PurchaseOrderAmendmentForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId")) || 0;
  const branchId = Number(localStorage.getItem("branchId")) || 1000000001;
  const loginUserName = localStorage.getItem("userName") || "SYSTEM";

  const isEditMode = Boolean(data?.id);
  const dataLoadedRef = useRef(false);
  const amendmentNoLoadedRef = useRef(false);
  const fileInputRefs = useRef({});
  const mappedItemsRef = useRef(new Set());
  const currencyIdRef = useRef(null);

  const [activeTab, setActiveTab] = useState("poDetail");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const [branchOptions, setBranchOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [poOptions, setPoOptions] = useState([]);
  const [belongsToOptions, setBelongsToOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);
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
    getValues,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onTouched",
    defaultValues: getDefaultValues(),
  });

  const detailsArray = useFieldArray({ control, name: "details" });
  const attachmentArray = useFieldArray({ control, name: "attachments" });

  const watchDetails = watch("details");
  const watchPoNo = watch("poNo");
  const watchCustomer = watch("customer");

  const getFieldArray = (tab) => {
    switch (tab) {
      case "poDetail":
        return detailsArray;
      case "attachment":
        return attachmentArray;
      default:
        return detailsArray;
    }
  };

  /* ---------------- Master data dropdowns ---------------- */

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
        (response || []).map((c) => ({
          value: c.id ?? c.customerId ?? c.partyId,
          label:
            c.customerName ??
            c.partyName ??
            `${c.customerCode ?? ""} ${c.customerName ?? ""}`.trim(),
          customerName:
            c.customerName ??
            c.partyName ??
            `${c.customerCode ?? ""} ${c.customerName ?? ""}`.trim(),
        })),
      );
    } catch (error) {
      console.error("Failed to load customers:", error);
      setCustomerOptions([]);
    }
  }, [orgId, branchId]);

  const loadItems = useCallback(
    async (poNo) => {
      if (!poNo) {
        setItemOptions([]);
        return;
      }
      try {
        const response = await purchaseOrderAmendmentAPI.getItemCodeDropdown(
          branchId,
          poNo,
          orgId,
        );
        setItemOptions(
          (response || []).map((item) => ({
            value: item.id ?? item.itemCode,
            label: item.itemCode || String(item.id ?? ""),
            itemCode: item.itemCode || "",
            itemDescription: item.itemDescription || "",
            hsnSacCode: item.hsnSacCode || "",
          })),
        );
      } catch (error) {
        console.error("Failed to load items:", error);
        if (!isEditMode) setItemOptions([]);
      }
    },
    [orgId, branchId, isEditMode],
  );

  const loadPoOptions = useCallback(async () => {
    if (!branchId || !orgId || !watchCustomer) {
      setPoOptions([]);
      return;
    }
    try {
      const list =
        await purchaseOrderAmendmentAPI.getPurchaseOrderDropdownForPurchaseOrderAmendment(
          {
            branch: branchId,
            customerId: Number(watchCustomer),
            orgId,
          },
        );
      setPoOptions(
        list
          .filter((po) => po?.docId)
          .map((po) => ({
            value: po.docId,
            label: po.docId,
            docId: po.docId,
            id: po.id,
          })),
      );
    } catch (error) {
      console.error("Failed to load purchase orders:", error);
      setPoOptions([]);
    }
  }, [orgId, branchId, watchCustomer]);

  useEffect(() => {
    loadBranches();
    loadCustomers();
    loadPoOptions();
  }, [loadBranches, loadCustomers, loadPoOptions]);

  useEffect(() => {
    if (!branchId) return;
    loadCustomers();
    loadPoOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId, loadCustomers, loadPoOptions]);

  useEffect(() => {
    loadItems(watchPoNo);
    const fetchCurrencyRate = async () => {
      if (!watchPoNo) return;
      try {
        const currencyDetails = await purchaseOrderAmendmentAPI.getCurrencyExchangeRateforPurchaseOrderAmendment(
          branchId,
          watchPoNo,
          orgId,
        );
        if (currencyDetails.length > 0) {
          const first = currencyDetails[0];
          setValue("currency", first.currency || "");
          setValue("exchangeRate", first.exchangeRate ?? first.buyingExRate ?? 0);
        }
      } catch (error) {
        console.error("Failed to fetch currency exchange rate:", error);
      }
    };
    fetchCurrencyRate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchPoNo]);

  /* ---------------- Edit PO reconciliation ---------------- */

  useEffect(() => {
    if (!isEditMode || !data) return;
    if (!poOptions.length) return;
    const savedPoNo = data?.purchaseordernumber;
    if (!savedPoNo) return;
    const match = poOptions.find(
      (po) =>
        String(po?.docId) === String(savedPoNo) ||
        String(po?.id) === String(savedPoNo),
    );
    if (match) setValue("poNo", match.docId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [isEditMode, poOptions, data, setValue]);

/* ---------------- Auto-set Currency & Exchange Rate on PO Select ----------------*/

  //  Fetches currency details from the backend when the PO No changes and stores
  //  the currency ID (e.g. 10006000029203 for EURO) in a ref for use on submit.

   useEffect(() => {
     if (isEditMode) return; // only auto in create mode
     if (!watchPoNo) {
       setValue("currency", "");
       setValue("exchangeRate", "");
       currencyIdRef.current = null;
       return;
     }
     purchaseOrderAmendmentAPI.getCurrencyExchangeRateforPurchaseOrderAmendment(
       branchId,
       watchPoNo,
       orgId,
     ).then((currencyDetails) => {
       if (currencyDetails && currencyDetails.length > 0) {
         const first = currencyDetails[0];
         setValue("currency", first.currency || "");
         setValue("exchangeRate", first.exchangeRate ?? first.buyingExRate ?? 0);
         currencyIdRef.current = first.currencyId || null;
       } else {
         setValue("currency", "");
         setValue("exchangeRate", "");
         currencyIdRef.current = null;
       }
     }).catch((error) => {
       console.error("Failed to fetch currency exchange rate:", error);
       setValue("currency", "");
       setValue("exchangeRate", "");
       currencyIdRef.current = null;
     });
   }, [watchPoNo, isEditMode, branchId, orgId]);

  /* ---------------- Fetch Belongs To list on mount ----------------
   * Populates the belongsTo dropdown from the commonmaster API.
   */
  useEffect(() => {
    purchaseOrderAmendmentAPI.getListValuesGroup(
      "PURCHASE ORDER AMENDMENT",
      orgId,
    ).then((listValues) => {
      setBelongsToOptions(
        listValues.map((item) => ({
          value: item.id,
          label: item.valuesDescription,
        }))
      );
    }).catch((error) => {
      console.error("Failed to fetch belongs to list:", error);
      setBelongsToOptions([
        { value: "Purchase", label: "Purchase" },
      ]);
    });
  }, [orgId]);

  /* ---------------- Fetch Unit Master on mount ----------------
   * Populates the unit dropdown from the commonmaster API.
   */
  useEffect(() => {
    purchaseOrderAmendmentAPI.getUnitMasterByOrgId(orgId).then((unitList) => {
      setUnitOptions(
        unitList.map((item) => ({
          value: item.id,
          label: item.description,
        }))
      );
    }).catch((error) => {
      console.error("Failed to fetch unit master:", error);
      setUnitOptions([
        { value: 1694110000000, label: "BAGS" },
      ]);
    });
  }, [orgId]);

  /* ---------------- Edit data mapping ---------------- */

  useEffect(() => {
    if (!isEditMode || dataLoadedRef.current) return;

    const src = data || {};

    setValue("id", src.id ?? "");
    setValue("branch", asId(src.branch));
    setValue("belongsTo", src.belongsTo || "Purchase");
    setValue("amendmentNo", src.docId || "");
    setValue(
      "amendmentDate",
      src.docDate ? dayjs(src.docDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
    );
    setValue("customer", asId(src.customer));
    setValue("customerName", src.customer?.customerName || "");
    setValue("poNo", src.purchaseordernumber || "");
    setValue("currency", src.currency || "");
    setValue("exchangeRate", src.exchangeRate ?? "");
    setValue("revisionNo", src.revisionNo ?? "");
    setValue("active", src.active !== false);
    setValue("freightType", src.freightType || "");
    setValue("packingType", src.packingType || "");
    setValue("insuranceAmount", src.insuranceAmount ?? "");
    setValue("modeOfDespatch", src.modeOfDespatch || "");
    setValue("taxDescription", src.taxDescription || "");
    setValue("remarks", src.remarks || "");

    const details = (src.details || []).map((d) => ({
      id: d.id ?? "",
      item: asId(d.item),
      itemCode: d.item?.itemCode || "",
      itemName: d.item?.itemDescription || "",
      unit: d.unit || "",
      oldQty: d.oldQty ?? "",
      newQty: d.newQty ?? "",
      oldRate: d.oldRate ?? "",
      newRate: d.newRate ?? "",
      oldDeliveryDate: fmtDate(d.oldDeliveryDate),
      newDeliveryDate: fmtDate(d.newDeliveryDate),
    }));

    setValue("details", details.length ? details : getDefaultValues().details);

    mappedItemsRef.current = new Set(
      details.map((d) => String(asId(d.item))).filter(Boolean),
    );

    const voItemOptions = (src.details || [])
      .map((d) => d?.item)
      .filter((it) => it && it.id != null)
      .map((it) => ({
        value: it.id,
        label: it.itemCode || String(it.id),
        itemCode: it.itemCode || "",
        itemDescription: it.itemDescription || "",
        hsnSacCode: it.hsn || it.hsnSacCode || "",
      }));

    if (voItemOptions.length) {
      setItemOptions((prev) => {
        const existing = new Set(prev.map((o) => String(o.value)));
        const merged = [...prev];
        voItemOptions.forEach((o) => {
          if (!existing.has(String(o.value))) merged.push(o);
        });
        return merged;
      });
    }

    if ((src.attachments || []).length) {
      setValue(
        "attachments",
        src.attachments.map((a) => ({
          file: null,
          existing: a,
        })),
      );
    }

    dataLoadedRef.current = true;
  }, [isEditMode, data, setValue]);

  /* ---------------- Amendment No auto-generation (Add) ---------------- */

  useEffect(() => {
    if (isEditMode || amendmentNoLoadedRef.current) return;

    let cancelled = false;

    const generateDocId = async () => {
      try {
        const docId = await purchaseOrderAmendmentAPI.getDocId({
          financialYear: String(new Date().getFullYear()),
          orgId,
          screenCode: "POA",
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, orgId, setValue]);

  /* ---------------- Revision No auto-fill (Add) ---------------- */

  useEffect(() => {
    if (isEditMode || !watchPoNo) return;

    let cancelled = false;

    const loadRevisionNo = async () => {
      try {
        const revisionNo = await purchaseOrderAmendmentAPI.getRevisionNo({
          branch: branchId,
          orgId,
          purchaseOrderNumber: watchPoNo,
        });
        if (!cancelled) {
          setValue("revisionNo", revisionNo);
        }
      } catch (error) {
        console.error("Failed to load Revision No:", error);
      }
    };

    loadRevisionNo();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, watchPoNo, orgId, setValue]);

  /* ---------------- Tab handlers ---------------- */

  const handleAdd = (tab) => {
    if (tab === "poDetail") {
      detailsArray.append(
        getDefaultValues().details[0],
      );
    } else if (tab === "attachment") {
      attachmentArray.append({ file: null, existing: null });
    }
  };

  const handleRemove = (tab, index) => {
    getFieldArray(tab).remove(index);
  };

  /* ---------------- Attachment preview ---------------- */

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

  const handleAttachmentPreview = async (row) => {
    const name = getAttachmentName(row);

    // New file (just chosen in this session) → local object URL, no auth needed
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

    // Existing attachment → fetch through authenticated download endpoint
    const existing = row.existing;
    let sourcePath = "";
    if (existing && typeof existing === "object") {
      sourcePath = existing.filePath || existing;
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
        `${
          import.meta.env.VITE_API_URL
        }/api/files/download?path=${encodeURIComponent(sourcePath)}`,
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
      if (error?.response?.status === 401) {
        setPreview({
          url: "",
          name,
          isImage: false,
          loading: false,
          error: "Unauthorized",
        });
      } else {
        setPreview({
          url: "",
          name,
          isImage: false,
          loading: false,
          error: "Failed to load file",
        });
      }
    }
  };

  /* ---------------- Save ---------------- */

  const onSubmit = async (formData) => {
  setSaving(true);

  try {
    const isUpdate = Boolean(data?.id);

    // Prepare Purchase Order Amendment data
    const poAmendmentData = {
      ...(isUpdate ? { id: data.id } : {}),

      active: formData.active !== false,

      belongsTo: formData.belongsTo || "Purchase",

      branch: Number(formData.branch),

      cancelRemarks: data?.cancelRemarks || "",

      createdBy:
        (isUpdate ? data?.createdBy : null) ||
        localStorage.getItem("usersId") ||
        loginUserName ||
        "SYSTEM",

      currency: currencyIdRef.current || 0,

      customer: Number(formData.customer),

      exchangeRate: Number(formData.exchangeRate || 0),

      freightType: formData.freightType || "",

      insuranceAmount: Number(formData.insuranceAmount || 0),

      modeOfDespatch: formData.modeOfDespatch || "",

      orgId: orgId,

      packingType: formData.packingType || "",

      purchaseordernumber: formData.poNo || "",

      remarks: formData.remarks || "",

      revisionNo: Number(formData.revisionNo || 1),

      taxDescription: formData.taxDescription || "",

      details: (formData.details || [])
        .filter((item) => item.item)
        .map((item) => {
          const unitMatch = unitOptions.find(
            (u) => String(u.value) === String(item.unit),
          );
          return {
            item: Number(item.item),

            unit: unitMatch
              ? Number(unitMatch.value)
              : item.unit
                ? Number(item.unit)
                : null,

            oldQty: Number(item.oldQty || 0),

            newQty: Number(item.newQty || 0),

            oldRate: Number(item.oldRate || 0),

            newRate: Number(item.newRate || 0),

            oldDeliveryDate: item.oldDeliveryDate || "",

            newDeliveryDate: item.newDeliveryDate || "",
          };
        }),
    };

    // Create multipart FormData
    const formDataToSend = new FormData();

    // Convert PO Amendment JSON into Blob
    const poAmendmentJSON = JSON.stringify(poAmendmentData);

    const poAmendmentBlob = new Blob([poAmendmentJSON], {
      type: "application/json",
    });

    // Append JSON DTO
    formDataToSend.append(
      "PurchaseOrderAmendmentDTO",
      poAmendmentBlob,
      "poAmendmentDTO.json",
    );

    // Add attachment files
    const attachments = formData.attachments || [];

    if (attachments.length > 0) {
      for (let i = 0; i < attachments.length; i++) {
        const attachment = attachments[i]?.file;

        if (attachment instanceof File) {
          // New file
          formDataToSend.append(
            "files",
            attachment,
            attachment.name,
          );
        } else if (
          attachment &&
          typeof attachment === "object" &&
          attachment.filePath
        ) {
          // Existing file
          console.log(
            "Existing file:",
            attachment.filePath,
          );
        } else if (
          attachment &&
          typeof attachment === "string"
        ) {
          // Existing file path
          console.log(
            "Existing file path:",
            attachment,
          );
        }
      }
    }

    // Debug - JSON data
    console.log(
      "Sending PO Amendment data:",
      poAmendmentData,
    );

    // Debug - Multipart contents
    for (const [key, value] of formDataToSend.entries()) {
      console.log("FormData:", key, value);
    }

    // Call API
    const response =
      await purchaseOrderAmendmentAPI.createUpdate(
        formDataToSend,
      );

    console.log(
      "Full PO Amendment API Response:",
      response,
    );

    // Check API success
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
    } else {
      const errorMessage =
        response?.message ||
        response?.paramObjectsMap?.message ||
        response?.errorMessage ||
        response?.error ||
        "Failed to save amendment";

      addToast(errorMessage, "error");
    }
  } catch (error) {
    console.error(
      "Error saving PO amendment:",
      error,
    );

    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.paramObjectsMap?.message ||
      error?.message ||
      "Failed to save amendment. Please try again.";

    addToast(errorMessage, "error");
  } finally {
    setSaving(false);
  }
};

  /* ---------------- Item autofill ---------------- */

  useEffect(() => {
    watchDetails?.forEach((row, index) => {
      if (!row?.item) return;
      const selectedItem = itemOptions.find(
        (item) => String(item.value) === String(row.item),
      );
      if (selectedItem) {
        const isMapped = mappedItemsRef.current.has(String(row.item));
        if (isMapped && (row.itemCode || row.itemName)) return;
        setValue(`details.${index}.itemCode`, selectedItem.itemCode || "");
        setValue(
          `details.${index}.itemName`,
          selectedItem.itemDescription || "",
        );
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchDetails, itemOptions, setValue]);

  /* ---------------- Customer Name autofill ---------------- */

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchCustomer, customerOptions, setValue]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">
          Loading amendment data...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-2 max-w-7xl relative">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data?.id ? "Edit Purchase Order Amendment" : "Add Purchase Order Amendment"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
        {/* Header Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <SelectField
            control={control}
            name="branch"
            label="Branch"
            options={branchOptions}
            required
            errors={errors}
          />
<SelectField
              control={control}
              name="belongsTo"
              label="Belongs To"
              options={belongsToOptions}
              errors={errors}
            />

          <SelectField
            control={control}
            name="customer"
            label="Customer"
            options={customerOptions}
            required
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

          <InputField
            control={control}
            name="amendmentNo"
            label="Amendment No"
            disabled
            value={getValues("amendmentNo") || "Auto"}
            errors={errors}
          />

           <SelectField
            control={control}
            name="poNo"
            label="PO No"
            required
            errors={errors}
            options={poOptions}
            placeholder="Select PO No"
          />

          <InputField
            control={control}
            name="customerName"
            label="Customer Name"
            errors={errors}
            placeholder="Auto-filled"
            disabled
          />

          <InputField
            control={control}
            name="currency"
            label="Currency"
            placeholder="Enter currency"
            errors={errors}
          />

          <InputField
            control={control}
            name="exchangeRate"
            label="Exchange Rate"
            type="number"
            step="0.01"
            errors={errors}
          />

          <InputField
            control={control}
            name="revisionNo"
            label="Revision No"
            type="number"
            errors={errors}
            disabled
          />
        </div>

        {/* Child Tables */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-0">
            <div className="flex">
              {[
                { key: "poDetail", label: "PO Detail" },
                { key: "summary", label: "Summary" },
                { key: "attachment", label: "Attachment" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-1 text-xs font-semibold rounded-t capitalize ${
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

          {/* Tab Content - PO Detail */}
          {activeTab === "poDetail" && (
            <div className="pt-3">
              <TableWrapper>
                <TableHead
                  headers={[
                    "S.No",
                    <>Item <span className="text-red-500">*</span></>,
                    "Item Code",
                    "Item Name",
                    "Unit",
                    "Old Qty",
                    "New Qty",
                    "Old Rate",
                    "New Rate",
                    "Old Delivery Date",
                    "New Delivery Date",
                    "Action",
                  ]}
                />
                <tbody>
                  {detailsArray.fields.map((field, index) => {
                    const selectedItem = itemOptions.find(
                      (o) =>
                        o.value != null && String(o.value) === String(field.item),
                    );
                    return (
                    <TableRow
                      key={field.id}
                      index={index}
                      onRemove={() => handleRemove("poDetail", index)}
                      disabled={detailsArray.fields.length <= 1}
                    >
                      <SelectCell
                        control={control}
                        name={`details.${index}.item`}
                        options={itemOptions}
                        required
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`details.${index}.itemCode`}
                        placeholder="Item Code"
                        readOnly
                        overrideValue={selectedItem?.itemCode}
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`details.${index}.itemName`}
                        placeholder="Item Name"
                        overrideValue={selectedItem?.itemDescription}
                        errors={errors}
                      />
                      <SelectField
                          control={control}
                          name={`details.${index}.unit`}
                          options={unitOptions}
                          errors={errors}
                        />
                      <InputCell
                        control={control}
                        name={`details.${index}.oldQty`}
                        type="number"
                        step="0.001"
                        placeholder="Old Qty"
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`details.${index}.newQty`}
                        type="number"
                        step="0.001"
                        placeholder="New Qty"
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
                        name={`details.${index}.oldDeliveryDate`}
                        type="date"
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`details.${index}.newDeliveryDate`}
                        type="date"
                        errors={errors}
                      />
                    </TableRow>
                    );
                  })}
                </tbody>
              </TableWrapper>
            </div>
          )}

          {/* Tab Content - Summary */}
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
                errors={errors}
                placeholder="Enter tax description"
              />
              <InputField
                control={control}
                name="remarks"
                label="Remarks"
                errors={errors}
                placeholder="Enter remarks"
              />
            </div>
          )}

          {/* Tab Content - Attachment */}
          {activeTab === "attachment" && (
            <div className="pt-3 space-y-2">
              <TableWrapper>
                <TableHead headers={["S.No", "Document", "Preview", "Action"]} />
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
                                onChange={(e) => {
                                  f.onChange(e.target.files?.[0] || null);
                                }}
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
            onClick={() =>
              setPreview({
                url: "",
                name: "",
                isImage: false,
                loading: false,
                error: "",
              })
            }
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
                  onClick={() =>
                    setPreview({
                      url: "",
                      name: "",
                      isImage: false,
                      loading: false,
                      error: "",
                    })
                  }
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
            onClick={onBack}
            disabled={saving}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <X className="h-3 w-3" /> Cancel
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={saving}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-3 w-3" />{" "}
            {saving ? "Saving..." : data?.id ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderAmendmentForm;

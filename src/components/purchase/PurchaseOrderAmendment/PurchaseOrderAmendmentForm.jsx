import { ArrowLeft, Save, X, Plus, Trash2, Eye } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import dayjs from "dayjs";
import axios from "axios";
import purchaseOrderAmendmentAPI from "../../../api/Purchase/purchaseOrderAmendmentAPI";
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
  hsnSacCode: "",
  unit: "",
  unitName: "",
  oldQty: "",
  newQty: "",
  oldRate: "",
  newRate: "",
  oldDeliveryDate: "",
  newDeliveryDate: "",
});

const getDefaultValues = () => ({
  id: "",
  branch: "",
  belongsTo: "Purchase",
  amendmentNo: "",
  amendmentDate: dayjs().format("YYYY-MM-DD"),
  customer: "",
  customerName: "",
  poNo: "",
  poDate: "",
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
  details: [getEmptyDetail()],
  attachments: [{ file: null, existing: null }],
});

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
            onChange={(e) => {
              field.onChange(e);
              if (onChange) onChange(e, field);
            }}
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

const PurchaseOrderAmendmentForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId")) || 0;
  const branchId = Number(localStorage.getItem("branchId")) || 1000000001;
  const loginUserName = localStorage.getItem("userName") || "";

  const isEditMode = Boolean(data?.id);
  const dataLoadedRef = useRef(false);
  const amendmentNoLoadedRef = useRef(false);
  const fileInputRefs = useRef({});
  const currencyIdRef = useRef(null);

  const [activeTab, setActiveTab] = useState("poDetail");
  const [saving, setSaving] = useState(false);
  const [loading] = useState(false);

  const [branchOptions, setBranchOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [poOptions, setPoOptions] = useState([]);
  const [belongsToOptions, setBelongsToOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
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

  const loadItems = useCallback(
    async (poNo) => {
      if (!poNo) {
        if (!isEditMode) setItemOptions([]);
        return;
      }
      try {
        const response = await purchaseOrderAmendmentAPI.getItemCodeDropdown(
          branchId,
          poNo,
          orgId,
        );

        // API may return the array directly or the full response object
        const list = Array.isArray(response)
          ? response
          : response?.paramObjectsMap?.itemCodeDropdown || [];

        const mapped = list.map((item) => ({
          value: item.id,
          label: item.itemCode || String(item.id ?? ""),
          itemCode: item.itemCode || "",
          // backend does not return a description yet; falls back to blank
          itemDescription:
            item.itemDescription || item.itemName || item.description || "",
          hsnSacCode: item.hsnSacCode || "",
          unit: item.unit ?? "",
          unitDescription: item.unitDescription || "",
          qty: item.qty ?? item.oldQty ?? "",
          rate: item.rate ?? item.oldRate ?? "",
          deliveryDate: item.deliveryDate || item.oldDeliveryDate || "",
        }));

        if (isEditMode) {
          // keep items already on the saved amendment, add any new ones
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
        (list || [])
          .filter((po) => po?.docId)
          .map((po) => ({
            value: po.docId,
            label: po.docId,
            docId: po.docId,
            docDate: po.docDate,
            id: po.id,
          })),
      );
    } catch (error) {
      console.error("Failed to load purchase orders:", error);
      setPoOptions([]);
    }
  }, [orgId, branchId, watchCustomer]);

  /* ------------------------------ Effects ------------------------------ */

  useEffect(() => {
    loadBranches();
    loadCustomers();
  }, [loadBranches, loadCustomers]);

  useEffect(() => {
    loadPoOptions();
  }, [loadPoOptions]);

  // Load items when PO changes. In create mode, reset the detail rows too.
  const prevPoRef = useRef(watchPoNo);
  useEffect(() => {
    if (!isEditMode && prevPoRef.current !== watchPoNo) {
      setValue("details", [getEmptyDetail()]);
    }
    prevPoRef.current = watchPoNo;
    loadItems(watchPoNo);
  }, [watchPoNo, loadItems, isEditMode, setValue]);

  // PO date auto-fill
  useEffect(() => {
    if (!watchPoNo) {
      setValue("poDate", "");
      return;
    }
    const match = poOptions.find(
      (po) => String(po.docId) === String(watchPoNo),
    );
    if (match?.docDate) {
      setValue("poDate", dayjs(match.docDate).format("YYYY-MM-DD"));
    }
  }, [watchPoNo, poOptions, setValue]);

  // Edit mode: re-select saved PO once options are loaded
  useEffect(() => {
    if (!isEditMode || !data || !poOptions.length) return;
    const savedPoNo = data?.purchaseordernumber;
    if (!savedPoNo) return;
    const match = poOptions.find(
      (po) =>
        String(po?.docId) === String(savedPoNo) ||
        String(po?.id) === String(savedPoNo),
    );
    if (match) setValue("poNo", match.docId);
  }, [isEditMode, poOptions, data, setValue]);

  // Currency + exchange rate (create mode)
  useEffect(() => {
    if (isEditMode) return;
    if (!watchPoNo) {
      setValue("currency", "");
      setValue("exchangeRate", "");
      currencyIdRef.current = null;
      return;
    }
    purchaseOrderAmendmentAPI
      .getCurrencyExchangeRateforPurchaseOrderAmendment(
        branchId,
        watchPoNo,
        orgId,
      )
      .then((currencyDetails) => {
        if (currencyDetails && currencyDetails.length > 0) {
          const first = currencyDetails[0];
          setValue("currency", first.currency || "");
          setValue(
            "exchangeRate",
            first.exchangeRate ?? first.buyingExRate ?? 0,
          );
          currencyIdRef.current = first.currencyId || null;
        } else {
          setValue("currency", "");
          setValue("exchangeRate", "");
          currencyIdRef.current = null;
        }
      })
      .catch((error) => {
        console.error("Failed to fetch currency exchange rate:", error);
        setValue("currency", "");
        setValue("exchangeRate", "");
        currencyIdRef.current = null;
      });
  }, [watchPoNo, isEditMode, branchId, orgId, setValue]);

  // Belongs-to list
  useEffect(() => {
    purchaseOrderAmendmentAPI
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
        setBelongsToOptions([{ value: "Purchase", label: "Purchase" }]);
      });
  }, [orgId]);

  // Unit master
  useEffect(() => {
    purchaseOrderAmendmentAPI
      .getUnitMasterByOrgId(orgId)
      .then((unitList) => {
        setUnitOptions(
          (unitList || []).map((item) => ({
            value: item.id,
            label: item.description,
          })),
        );
      })
      .catch((error) => {
        console.error("Failed to fetch unit master:", error);
        setUnitOptions([]);
      });
  }, [orgId]);

  // Edit mode: populate form from saved data
  useEffect(() => {
    if (!isEditMode || dataLoadedRef.current) return;

    const src = data || {};

    setValue("id", src.id ?? "");
    setValue("branch", asId(src.branch));
    setValue("belongsTo", src.belongsTo || "Purchase");
    setValue("amendmentNo", src.docId || "");
    setValue(
      "amendmentDate",
      fmtDate(src.docDate) || dayjs().format("YYYY-MM-DD"),
    );
    setValue("customer", asId(src.customer));
    setValue("customerName", src.customer?.customerName || "");
    setValue("poNo", src.purchaseordernumber || "");
    setValue("poDate", fmtDate(src.poDate || src.purchaseOrderDate));

    // currency may be an object ({id, currency}) or a plain value
    if (src.currency && typeof src.currency === "object") {
      setValue(
        "currency",
        src.currency.currency || src.currency.currencyName || "",
      );
      currencyIdRef.current = src.currency.id ?? null;
    } else {
      setValue("currency", src.currency || "");
      currencyIdRef.current = src.currency || null;
    }

    setValue("exchangeRate", src.exchangeRate ?? "");
    setValue("refNo", src.refNo || "");
    setValue("refDate", fmtDate(src.refDate));
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
      hsnSacCode: d.item?.hsnSacCode || d.item?.hsn || "",
      unit: asId(d.unit),
      unitName:
        (d.unit && typeof d.unit === "object"
          ? d.unit.unitId || d.unit.description || d.unit.unitDescription
          : "") ||
        d.unitDescription ||
        "",
      oldQty: d.oldQty ?? "",
      newQty: d.newQty ?? "",
      oldRate: d.oldRate ?? "",
      newRate: d.newRate ?? "",
      oldDeliveryDate: fmtDate(d.oldDeliveryDate),
      newDeliveryDate: fmtDate(d.newDeliveryDate),
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
        hsnSacCode: it.hsn || it.hsnSacCode || "",
        unit: "",
        unitDescription: "",
        qty: "",
        rate: "",
        deliveryDate: "",
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

  // Edit mode: fill unit name from unit master if saved data had only the id
  useEffect(() => {
    if (!isEditMode || !unitOptions.length) return;
    (watchDetails || []).forEach((row, i) => {
      if (row?.unit && !row?.unitName) {
        const u = unitOptions.find((o) => String(o.value) === String(row.unit));
        if (u) setValue(`details.${i}.unitName`, u.label);
      }
    });
  }, [isEditMode, unitOptions, watchDetails, setValue]);

  // Edit mode: saved record may have null HSN / description / unit name,
  // so backfill them from the item dropdown for the same PO
  useEffect(() => {
    if (!isEditMode || !itemOptions.length) return;
    (watchDetails || []).forEach((row, i) => {
      if (!row?.item) return;
      const opt = itemOptions.find((o) => String(o.value) === String(row.item));
      if (!opt) return;
      if (!row.hsnSacCode && opt.hsnSacCode) {
        setValue(`details.${i}.hsnSacCode`, opt.hsnSacCode);
      }
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
  }, [isEditMode, orgId, setValue]);

  // Revision No (create mode)
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
        if (!cancelled) setValue("revisionNo", revisionNo);
      } catch (error) {
        console.error("Failed to load Revision No:", error);
      }
    };

    loadRevisionNo();
    return () => {
      cancelled = true;
    };
  }, [isEditMode, watchPoNo, branchId, orgId, setValue]);

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

  // Fires only when the user picks an item in a row (so it never overwrites
  // saved values in edit mode and never loops).
  const handleItemChange = (index, itemId) => {
    const selected = itemOptions.find(
      (o) => String(o.value) === String(itemId),
    );

    const prefix = `details.${index}`;
    const opts = { shouldDirty: true };

    if (!selected) {
      setValue(`${prefix}.itemCode`, "", opts);
      setValue(`${prefix}.itemName`, "", opts);
      setValue(`${prefix}.hsnSacCode`, "", opts);
      setValue(`${prefix}.unit`, "", opts);
      setValue(`${prefix}.unitName`, "", opts);
      setValue(`${prefix}.oldQty`, "", opts);
      setValue(`${prefix}.newQty`, "", opts);
      setValue(`${prefix}.oldRate`, "", opts);
      setValue(`${prefix}.newRate`, "", opts);
      setValue(`${prefix}.oldDeliveryDate`, "", opts);
      setValue(`${prefix}.newDeliveryDate`, "", opts);
      return;
    }

    const deliveryDate = fmtDate(selected.deliveryDate);

    setValue(`${prefix}.itemCode`, selected.itemCode || "", opts);
    setValue(`${prefix}.itemName`, selected.itemDescription || "", opts);
    setValue(`${prefix}.hsnSacCode`, selected.hsnSacCode || "", opts);

    // unit id (sent on save) + unit description (shown in the grid)
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

    // current PO values become the "Old" values
    setValue(`${prefix}.oldQty`, selected.qty ?? "", opts);
    setValue(`${prefix}.oldRate`, selected.rate ?? "", opts);
    setValue(`${prefix}.oldDeliveryDate`, deliveryDate, opts);

    // "New" values start equal to old; user edits what changed
    setValue(`${prefix}.newQty`, selected.qty ?? "", opts);
    setValue(`${prefix}.newRate`, selected.rate ?? "", opts);
    setValue(`${prefix}.newDeliveryDate`, deliveryDate, opts);
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
    if (tab === "poDetail") {
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
      (detail) =>
        detail?.item !== "" &&
        detail?.item !== null &&
        detail?.item !== undefined,
    );

    if (!validDetails.length) {
      addToast("Add at least one PO detail item", "warning");
      setActiveTab("poDetail");
      return;
    }

    setSaving(true);

    try {
      const isUpdate = Boolean(data?.id);

      const branch = Number(formData.branch || branchId);
      const customer = Number(formData.customer || 0);
      const currency = Number(currencyIdRef.current || 0);
      const exchangeRate = Number(formData.exchangeRate || 0);

      if (!branch) {
        addToast("Branch is required", "warning");
        return;
      }

      if (!customer) {
        addToast("Customer is required", "warning");
        return;
      }

      if (!formData.poNo) {
        addToast("Purchase Order No is required", "warning");
        return;
      }

      if (!formData.amendmentNo) {
        addToast("Amendment No is required", "warning");
        return;
      }

      if (!formData.amendmentDate) {
        addToast("Amendment Date is required", "warning");
        return;
      }

      const financialYear =
        localStorage.getItem("finYear") || String(new Date().getFullYear());

      const poAmendmentData = {
        ...(isUpdate ? { id: Number(data.id) } : {}),

        active: formData.active !== false,
        belongsTo: formData.belongsTo || "Purchase",
        branch,
        docId: formData.amendmentNo || "",
        docDate: formData.amendmentDate || null,
        cancelRemarks: data?.cancelRemarks || "",
        createdBy:
          (isUpdate ? data?.createdBy : null) ||
          localStorage.getItem("usersId") ||
          loginUserName ||
          "SYSTEM",
        currency,
        customer,
        exchangeRate,
        financialYear,
        freightType: formData.freightType || "",
        insuranceAmount: Number(formData.insuranceAmount || 0),
        modeOfDespatch: formData.modeOfDespatch || "",
        orgId,
        packingType: formData.packingType || "",
        purchaseordernumber: formData.poNo || "",
        refNo: formData.refNo || "",
        refDate: formData.refDate || null,
        remarks: formData.remarks || "",
        revisionNo: Number(formData.revisionNo || 1),
        taxDescription: formData.taxDescription || "",

        details: validDetails.map((item) => ({
          ...(item.id ? { id: Number(item.id) } : {}),
          item: Number(item.item),
          unit:
            item.unit !== null && item.unit !== undefined && item.unit !== ""
              ? Number(item.unit)
              : null,
          oldQty: Number(item.oldQty || 0),
          newQty: Number(item.newQty || 0),
          oldRate: Number(item.oldRate || 0),
          newRate: Number(item.newRate || 0),
          oldDeliveryDate: item.oldDeliveryDate || null,
          newDeliveryDate: item.newDeliveryDate || null,
        })),
      };

      const formDataToSend = new FormData();

      // Part name must match @RequestPart("purchaseOrderAmendment") exactly, including case.
      const dtoBlob = new Blob([JSON.stringify(poAmendmentData)], {
        type: "application/json",
      });

      formDataToSend.append(
        "purchaseOrderAmendment",
        dtoBlob,
        "poAmendmentDTO.json",
      );

      (formData.attachments || []).forEach((attachment) => {
        if (attachment?.file instanceof File) {
          formDataToSend.append("files", attachment.file, attachment.file.name);
        }
      });

      const response =
        await purchaseOrderAmendmentAPI.createUpdate(formDataToSend);

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
          response?.paramObjectsMap?.message ||
          response?.errorMessage ||
          response?.error ||
          "Failed to save amendment",
        "error",
      );
    } catch (error) {
      console.error("PO Amendment save error:", error?.response?.data || error);

      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.errorMessage ||
        error?.response?.data?.error ||
        error?.response?.data?.exception ||
        error?.response?.data?.paramObjectsMap?.message ||
        error?.response?.data?.paramObjectsMap?.error ||
        error?.message ||
        "Failed to save amendment. Please try again.";

      addToast(backendMessage, "error");
    } finally {
      setSaving(false);
    }
  };

  /* ------------------------------- Render ------------------------------- */

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
          type="button"
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {isEditMode
            ? "Edit Purchase Order Amendment"
            : "Add Purchase Order Amendment"}
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
          <InputField
            control={control}
            name="amendmentNo"
            label="Amendment No"
            placeholder="Auto"
            disabled
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
            errors={errors}
            placeholder="Auto-filled"
            disabled
          />
          <SelectField
            control={control}
            name="poNo"
            label="PO No"
            required
            errors={errors}
            options={poOptions}
          />
          <InputField
            type="date"
            control={control}
            name="poDate"
            label="P.O.Date"
            errors={errors}
            disabled
          />
          <InputField
            control={control}
            name="currency"
            label="Currency"
            placeholder="Auto-filled"
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
            type="date"
            name="refDate"
            label="Ref Date"
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

          {/* PO Detail */}
          {activeTab === "poDetail" && (
            <div className="pt-3">
              <TableWrapper>
                <TableHead
                  headers={[
                    "S.No",
                    "Item Code",
                    "Item Description",
                    "HSN_SAC_CODE",
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
                  {detailsArray.fields.map((field, index) => (
                    <TableRow
                      key={field.id}
                      index={index}
                      onRemove={() => handleRemove("poDetail", index)}
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
                        name={`details.${index}.hsnSacCode`}
                        placeholder="HSN/SAC Code"
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
                        name={`details.${index}.oldQty`}
                        type="number"
                        step="0.001"
                        placeholder="Old Qty"
                        readOnly
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
                        readOnly
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
                        readOnly
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`details.${index}.newDeliveryDate`}
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

export default PurchaseOrderAmendmentForm;

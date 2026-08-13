import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import dayjs from "dayjs";
import salesOrderAmendmentAPI from "../../../api/Sales/salesOrderAmendmentAPI";
import { useToast } from "../../Toast/ToastContext";
import branchAPI from "../../../api/branchAPI";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "[color-scheme:light] dark:[color-scheme:dark]";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const getDefaultValues = () => ({
  plantId: "",
  soAmndNo: "",
  soNo: "",
  date: dayjs().format("YYYY-MM-DD"),
  partyPOAmdNo: "",
  soDate: "",
  partyPOAmdDate: "",
  poNo: "",
  revisionNo: "",
  poDate: "",
  active: true,
  remarks: "",
  details: [{
    id: Date.now() + 1,
    slNo: 1,
    itemCode: "",
    itemName: "",
    oldQty: 0,
    oldRate: 0,
    newQty: 0,
    newRate: 0,
    oldDlvyDate: "",
    newDlvyDate: "",
  }],
});

const SelectField = ({ control, name, label, options, required, errors, onChange, disabled }) => {
  const getError = () => {
    const parts = name.split(".");
    let error = errors;
    for (const part of parts) {
      if (error && error[part]) {
        error = error[part];
      } else {
        return null;
      }
    }
    return error?.message;
  };

  const errorMessage = getError();

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
            className={`${controlClasses} ${errorMessage ? "border-red-500 focus:border-red-500" : ""}`}
            onChange={(e) => {
              field.onChange(e);
              if (onChange) {
                onChange(e.target.value);
              }
            }}
            disabled={disabled}
          >
            <option value="">Select an option</option>
            {options.map((opt) => {
              if (typeof opt === 'object' && opt !== null) {
                return (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                );
              }
              return (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              );
            })}
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
  const getError = () => {
    const parts = name.split(".");
    let error = errors;
    for (const part of parts) {
      if (error && error[part]) {
        error = error[part];
      } else {
        return null;
      }
    }
    return error?.message;
  };

  const errorMessage = getError();

  return (
    <div>
      <label className={labelClasses}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        rules={{
          ...(required && {
            required: `${label} is required`,
          }),
        }}
        render={({ field }) => (
          <input
            {...field}
            type={type}
            step={step}
            value={value || field.value}
            className={`${controlClasses} ${errorMessage ? "border-red-500 focus:border-red-500" : ""}`}
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
          className={`p-1 ${i === 0 ? "w-8 text-center" : i === headers.length - 1 ? "w-20 text-left" : "text-left"} dark:text-white`}
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
}) => (
  <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
    <td className="p-1 text-center font-medium dark:text-white">{index + 1}</td>
    {children}
    {showDelete && (
      <td className="p-1 text-center">
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className={`h-5 w-5 rounded text-white flex items-center justify-center ${disabled
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

const SelectCell = ({ control, name, options, required, errors, onChange, disabled }) => {
  const getError = () => {
    const parts = name.split(".");
    let error = errors;
    for (const part of parts) {
      if (error && error[part]) {
        error = error[part];
      } else {
        return null;
      }
    }
    return error?.message;
  };

  const errorMessage = getError();

  return (
    <td className="p-1 align-top">
      <Controller
        name={name}
        control={control}
        rules={required ? { required: "This field is required" } : undefined}
        render={({ field }) => (
          <select
            {...field}
            className={`${controlClasses} h-8 text-xs ${errorMessage ? "border-red-500 focus:border-red-500" : ""}`}
            onChange={(e) => {
              field.onChange(e);
              if (onChange) {
                onChange(e.target.value);
              }
            }}
            disabled={disabled}
          >
            <option value="">Select an option</option>
            {options.map((opt) => {
              if (typeof opt === 'object' && opt !== null) {
                return (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                );
              }
              return (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              );
            })}
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
  disabled,
  required,
  errors,
  value,
  onChange,
}) => {
  const getError = () => {
    const parts = name.split(".");
    let error = errors;
    for (const part of parts) {
      if (error && error[part]) {
        error = error[part];
      } else {
        return null;
      }
    }
    return error?.message;
  };

  const errorMessage = getError();

  return (
    <td className="p-1 align-top">
      <div className="flex items-center gap-1">
        <div className="flex-1">
          <Controller
            name={name}
            control={control}
            rules={required ? { required: "This field is required" } : undefined}
            render={({ field }) => (
              <input
                {...field}
                type={type}
                step={step}
                value={value || field.value}
                className={`${controlClasses} h-8 text-xs ${errorMessage ? "border-red-500 focus:border-red-500" : ""}`}
                placeholder={placeholder}
                disabled={disabled}
                onChange={(e) => {
                  field.onChange(e);
                  if (onChange) {
                    onChange(e);
                  }
                }}
              />
            )}
          />
        </div>
      </div>
      {errorMessage && (
        <div className="text-red-500 text-[10px] mt-0.5 whitespace-nowrap">
          {errorMessage}
        </div>
      )}
    </td>
  );
};

const ToggleButton = ({ value, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className={`relative flex items-center w-12 h-6 rounded-full transition-colors ${value ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
      }`}
  >
    <span className={`absolute h-5 w-5 bg-white rounded-full shadow transition-transform ${value ? "translate-x-6" : "translate-x-0.5"
      }`} />
  </button>
);

// Main Component
const SalesOrderAmendmentForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const [orgId] = useState(localStorage.getItem("orgId"));
  const [branchId] = useState(localStorage.getItem("branchId"));
  const loginUserName = localStorage.getItem("userName") || "";

  const [activeTab, setActiveTab] = useState("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [itemOptions, setItemOptions] = useState([]);
  const [rowErrors, setRowErrors] = useState({});
  const [plantData, setPlantData] = useState([]);
  const [soOptions, setSoOptions] = useState([]);
  const [loadedItemData, setLoadedItemData] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onTouched",
    defaultValues: getDefaultValues()
  });

  const details = watch("details");
  const soNo = watch("soNo");

  const loadBranches = useCallback(async () => {
    try {
      const response = await branchAPI.getBranchByOrgId(orgId);

      const options = (response || []).map((branch) => ({
        value: branch.id,
        label: branch.branchName,
      }));

      setPlantData(options);
    } catch (error) {
      console.error("Failed to load branches:", error);
      setPlantData([]);
    }
  }, [orgId]);

  // Load SO options
  const loadSOOptions = useCallback(async () => {
    try {
      const response = await salesOrderAmendmentAPI.getSalesOrderDetails(orgId, branchId);

      const options = (response || []).map((item) => ({
        value: item.docId,
        label: item.docId,
        docDate: item.docDate,
        customerPurchaseOrderNo: item.customerPurchaseOrderNo,
        customerPurchaseOrderDate: item.customerPurchaseOrderDate,
        id: item.id,
      }));

      setSoOptions(options);
    } catch (error) {
      console.error("Failed to load SO options:", error);
      setSoOptions([]);
    }
  }, [orgId, branchId]);

  useEffect(() => {
    if (orgId) {
      loadBranches();
      loadSOOptions();
    }
  }, [orgId, loadBranches, loadSOOptions]);

  const loadEditData = useCallback(async () => {
    if (!data?.id) return;

    setLoadingData(true);

    try {
      const response =
        await salesOrderAmendmentAPI.getById(data.id);

      console.log("Get By ID Response:", response);

      // Handle both possible API response structures
      const amendmentData =
        response?.paramObjectsMap?.salesOrderAmendment ||
        response?.salesOrderAmendment ||
        response;

      if (!amendmentData) {
        console.error("Sales Order Amendment data not found");
        return;
      }

      console.log("Amendment Data:", amendmentData);

      const details =
        (amendmentData.salesOrderAmendmentDetails || [])
          .map((detail, index) => {

            // API returns item as an OBJECT
            const item = detail.item || {};

            return {
              id:
                detail.id ||
                Date.now() + index,

              slNo: index + 1,

              // IMPORTANT
              itemId:
                item.id || 0,

              itemCode:
                item.itemCode || "",

              itemName:
                item.itemDescription || "",

              oldQty:
                Number(detail.oldQty) || 0,

              oldRate:
                Number(detail.oldRate) || 0,

              newQty:
                Number(detail.newQty) || 0,

              newRate:
                Number(detail.newRate) || 0,

              oldDlvyDate:
                detail.oldDeliveryDate || "",

              newDlvyDate:
                detail.newDeliveryDate || "",
            };
          });

      console.log(
        "Mapped Edit Details:",
        details
      );

      const editItemOptions = details
        .filter((item) => item.itemCode)
        .map((item) => ({
          value: String(item.itemCode),
          label: item.itemCode,
        }))
        .filter(
          (item, index, array) =>
            index ===
            array.findIndex(
              (x) =>
                x.value === item.value
            )
        );

      console.log(
        "Edit Item Options:",
        editItemOptions
      );

      setItemOptions(editItemOptions);

      const editItemData = details.map((item) => ({
        itemId: item.itemId,

        itemCode: item.itemCode,

        itemDescription: item.itemName,

        orderQty: item.oldQty,

        oldQty: item.oldQty,

        oldRate: item.oldRate,

        oldDeliveryDate:
          item.oldDlvyDate,
      }));

      setLoadedItemData(editItemData);

      console.log(
        "Edit Loaded Item Data:",
        editItemData
      );

      const formData = {
        plantId:
          amendmentData.branchId?.toString() || "",

        soAmndNo:
          amendmentData.docId ||
          `SOA-${amendmentData.id}`,

        soNo:
          amendmentData.salesOrderNumber || "",

        date:
          amendmentData.docDate ||
          amendmentData.salesOrderDate ||
          dayjs().format("YYYY-MM-DD"),

        partyPOAmdNo:
          amendmentData.partyPoAmendmentNo || "",

        soDate:
          amendmentData.salesOrderDate || "",

        partyPOAmdDate:
          amendmentData.partyPoAmendmentDate || "",

        poNo:
          amendmentData.poNo || "",

        revisionNo:
          amendmentData.revisionNo || 1,

        poDate:
          amendmentData.poDate || "",

        active:
          amendmentData.active !== false,

        remarks:
          amendmentData.remarks || "",

        details:
          details.length > 0
            ? details
            : getDefaultValues().details,
      };

      console.log(
        "Edit Form Data:",
        formData
      );

      // Populate form
      reset(formData);

      setDetailError("");

    } catch (error) {
      console.error(
        "Failed to load amendment data:",
        error
      );

      addToast(
        error?.message ||
        "Failed to load amendment data",
        "error"
      );

    } finally {
      setLoadingData(false);
    }
  }, [data?.id, reset, addToast]);

  // Load edit data when component mounts or data changes
  useEffect(() => {
    if (data?.id) {
      loadEditData();
    }
  }, [data?.id, loadEditData]);

  // Handle item selection
  const handleItemSelect = async (index, itemCode) => {
    try {
      console.log("Selected Item Code:", itemCode);
      console.log("Loaded Item Data:", loadedItemData);

      const selectedItem = loadedItemData.find(
        (item) =>
          String(item.itemCode) === String(itemCode)
      );

      console.log("Selected Item:", selectedItem);

      if (!selectedItem) {
        console.error("Selected item not found");

        setValue(`details.${index}.itemCode`, "");
        setValue(`details.${index}.itemName`, "");
        setValue(`details.${index}.oldQty`, 0);
        setValue(`details.${index}.oldRate`, 0);
        setValue(`details.${index}.newQty`, 0);
        setValue(`details.${index}.newRate`, 0);
        setValue(`details.${index}.oldDlvyDate`, "");
        setValue(`details.${index}.newDlvyDate`, "");

        return;
      }

      // Set selected item code
      setValue(
        `details.${index}.itemCode`,
        selectedItem.itemCode || "",
        { shouldValidate: true, shouldDirty: true }
      );

      // Item Description
      setValue(
        `details.${index}.itemName`,
        selectedItem.itemDescription || selectedItem.itemName || "",
        { shouldDirty: true }
      );

      // Order Qty from API
      setValue(
        `details.${index}.oldQty`,
        Number(selectedItem.oldQty) || 0,
        { shouldDirty: true }
      );

      // API does not provide rate
      setValue(
        `details.${index}.oldRate`,
        Number(selectedItem.oldRate) || 0,
        { shouldDirty: true }
      );

      // New Qty initially same as Order Qty
      // setValue(
      //   `details.${index}.newQty`,
      //   Number(selectedItem.orderQty) || 0,
      //   { shouldDirty: true }
      // );

      // Rate
      // setValue(
      //   `details.${index}.newRate`,
      //   Number(selectedItem.oldRate) || 0,
      //   { shouldDirty: true }
      // );

      // Delivery date
      setValue(
        `details.${index}.oldDlvyDate`,
        selectedItem.oldDeliveryDate || "",
        { shouldDirty: true }
      );

      setValue(
        `details.${index}.newDlvyDate`,
        selectedItem.oldDeliveryDate || "",
        { shouldDirty: true }
      );

      // Store item ID for submit
      setValue(
        `details.${index}.itemId`,
        selectedItem.itemId || selectedItem.item || 0,
        { shouldDirty: true }
      );

      // Get revision number
      try {
        const revisionResponse =
          await salesOrderAmendmentAPI.getRevisionNoDetails(
            orgId,
            branchId,
            selectedItem.itemId || selectedItem.item || 0,
            soNo
          );

        const revisionNo = revisionResponse || 1;

        setValue("revisionNo", revisionNo, {
          shouldDirty: true,
        });

      } catch (error) {
        console.error(
          "Failed to load revision number:",
          error
        );
      }

      // Clear row validation error
      if (rowErrors[index]) {
        const updated = { ...rowErrors };
        delete updated[index];
        setRowErrors(updated);
      }

    } catch (error) {
      console.error("Error selecting item:", error);
    }
  };

  const loadOrderDetails = useCallback(
    async (selectedSoNo) => {
      if (!selectedSoNo || !orgId) {
        const defaultDetails =
          getDefaultValues().details;

        setValue("details", defaultDetails);
        setLoadedItemData([]);
        setItemOptions([]);
        setDetailError("");

        return;
      }

      setLoadingOrder(true);

      try {
        // Find selected SO
        const selectedSO = soOptions.find(
          (opt) =>
            String(opt.value) ===
            String(selectedSoNo)
        );

        // Fill SO related fields
        if (selectedSO) {
          setValue(
            "soDate",
            selectedSO.docDate || ""
          );

          setValue(
            "poNo",
            selectedSO.customerPurchaseOrderNo ||
            ""
          );

          setValue(
            "poDate",
            selectedSO.customerPurchaseOrderDate ||
            ""
          );
        }

        // Call Item API
        const items =
          await salesOrderAmendmentAPI.getItems(
            orgId,
            branchId,
            selectedSoNo
          );

        console.log(
          "Item API Response:",
          items
        );

        // Normalize API response
        const normalizedItems = (
          items || []
        ).map((item) => ({
          itemId:
            item.itemId ||
            item.item ||
            0,

          itemCode:
            item.itemCode || "",

          itemDescription:
            item.itemDescription ||
            item.itemName ||
            "",

          unit:
            item.unit || "",

          unitId:
            item.unitId || 0,

          orderQty:
            Number(item.orderQty) || 0,

          oldQty:
            Number(
              item.oldQty ??
              item.orderQty
            ) || 0,

          oldRate:
            Number(item.oldRate) || 0,

          oldDeliveryDate:
            item.oldDeliveryDate || "",
        }));

        console.log(
          "Normalized Item Data:",
          normalizedItems
        );

        // Store complete item data
        setLoadedItemData(
          normalizedItems
        );

        // Create dropdown options
        const options =
          normalizedItems.map(
            (item) => ({
              value: item.itemCode,
              label: item.itemCode,
            })
          );

        setItemOptions(options);

        // Keep Item Code empty.
        // User must select manually.
        setValue(
          "details",
          getDefaultValues().details
        );

        setDetailError("");

      } catch (error) {
        console.error(
          "Failed to load order details:",
          error
        );

        setDetailError(
          "Failed to load order details"
        );

        setValue(
          "details",
          getDefaultValues().details
        );

        setLoadedItemData([]);
        setItemOptions([]);

      } finally {
        setLoadingOrder(false);
      }
    },
    [
      orgId,
      branchId,
      setValue,
      soOptions,
    ]
  );

  useEffect(() => {
    if (soNo && !data?.id) {
      const timer = setTimeout(() => loadOrderDetails(soNo), 300);
      return () => clearTimeout(timer);
    }
  }, [soNo, loadOrderDetails, data?.id]);

  const validateDetails = () => {
    const errs = {};
    const rows = getValues("details") || [];
    rows.forEach((row, i) => {
      const rowErr = {};
      if (!row.itemCode) rowErr.itemCode = "Required";
      if (!row.newQty || Number(row.newQty) <= 0) rowErr.newQty = "Required";
      if (!row.newDlvyDate) rowErr.newDlvyDate = "Required";
      if (Object.keys(rowErr).length) errs[i] = rowErr;
    });
    setRowErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (formData) => {
    try {
      // Validate header fields
      if (!formData.plantId) {
        addToast("Plant ID is required", "error");
        return;
      }

      if (!formData.soNo) {
        addToast("S.O.No is required", "error");
        return;
      }

      if (!formData.date) {
        addToast("Date is required", "error");
        return;
      }

      if (!formData.partyPOAmdNo) {
        addToast("Party P.O.Amnd No is required", "error");
        return;
      }

      // Validate details
      if (
        !formData.details ||
        formData.details.length === 0
      ) {
        setDetailError(
          "At least one order detail item is required"
        );
        setActiveTab("details");
        addToast(
          "At least one order detail item is required",
          "error"
        );
        return;
      }

      if (!validateDetails()) {
        setActiveTab("details");
        addToast(
          "Please fill all mandatory fields in detail rows",
          "error"
        );
        return;
      }

      setIsSubmitting(true);

      // Common payload
      const payload = {
        active: formData.active,
        branch: parseInt(branchId),
        cancelRemarks: "",
        createdBy: loginUserName,

        details: (formData.details || []).map((d) => ({
          item: d.itemId || 0,
          newDeliveryDate: d.newDlvyDate || "",
          newQty: Number(d.newQty) || 0,
          newRate: Number(d.newRate) || 0,
          oldDeliveryDate: d.oldDlvyDate || "",
          oldQty: Number(d.oldQty) || 0,
          oldRate: Number(d.oldRate) || 0,
        })),

        orgId: parseInt(orgId),
        partyPoAmendmentDate:
          formData.partyPOAmdDate || "",
        partyPoAmendmentNo:
          formData.partyPOAmdNo || "",
        poDate: formData.poDate || "",
        poNo: formData.poNo || "",
        remarks: formData.remarks || "",
        revisionNo:
          Number(formData.revisionNo) || 1,
        salesOrderDate: formData.soDate || "",
        salesOrderNumber: formData.soNo || "",
      };

      // ONLY SEND ID DURING UPDATE
      if (data?.id) {
        payload.id = data.id;
      }

      console.log(
        data?.id
          ? "UPDATE PAYLOAD:"
          : "CREATE PAYLOAD:",
        payload
      );

      const response =
        await salesOrderAmendmentAPI.createUpdate(
          payload
        );

      if (response?.status) {
        addToast(
          data
            ? "Amendment updated successfully"
            : "Amendment created successfully",
          "success"
        );

        setTimeout(() => {
          onBack();
        }, 1500);
      } else {
        addToast(
          response?.message ||
          "Failed to save amendment",
          "error"
        );
      }

    } catch (error) {
      console.error(
        "Error saving amendment:",
        error
      );

      addToast(
        error?.message ||
        "Failed to save amendment",
        "error"
      );

    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = () => {
    handleSubmit(onSubmit)();
  };

  const addDetailRow = () => {
    const current = getValues("details") || [];
    setValue("details", [
      ...current,
      {
        id: Date.now(),
        slNo: current.length + 1,
        itemCode: "",
        itemName: "",
        oldQty: 0,
        oldRate: 0,
        newQty: 0,
        newRate: 0,
        oldDlvyDate: "",
        newDlvyDate: "",
      },
    ]);
    setDetailError("");
  };

  const removeDetailRow = (index) => {
    const current = getValues("details") || [];
    if (current.length <= 1) return;
    const updated = current.filter((_, i) => i !== index).map((d, i) => ({ ...d, slNo: i + 1 }));
    setValue("details", updated);
    setRowErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return Object.keys(next).reduce((acc, k) => {
        const ki = Number(k);
        acc[ki > index ? ki - 1 : ki] = next[k];
        return acc;
      }, {});
    });
  };

  const updateDetail = (index, field, value) => {
    const current =
      getValues("details") || [];

    const updated = [...current];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setValue(
      "details",
      updated,
      {
        shouldDirty: true,
        shouldValidate: true,
      }
    );

    // Clear row validation error
    if (rowErrors[index]) {
      const updatedErrors = {
        ...rowErrors,
      };

      delete updatedErrors[index];

      setRowErrors(updatedErrors);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-2 max-w-7xl relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {data ? "Edit Sales Order Amendment" : "Add Sales Order Amendment"}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <label className={labelClasses}>Active</label>
          <Controller
            name="active"
            control={control}
            render={({ field }) => <ToggleButton value={field.value} onChange={field.onChange} />}
          />
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
        {/* Header Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <SelectField
            control={control}
            name="plantId"
            label="Plant ID"
            options={plantData}
            required
            errors={errors}
          />
          <InputField
            control={control}
            name="soAmndNo"
            label="S.O.Amnd No"
            disabled
            placeholder="Auto-generated"
            errors={errors}
          />
          <InputField
            control={control}
            name="date"
            label="Date"
            type="date"
            required
            errors={errors}
          />
          <SelectField
            control={control}
            name="soNo"
            label="S.O.No"
            options={soOptions}
            required
            errors={errors}
          />
          <InputField
            control={control}
            name="partyPOAmdNo"
            label="Party P.O.Amnd No"
            required
            errors={errors}
          />
          <InputField
            control={control}
            name="partyPOAmdDate"
            label="Party P.O.Amnd Date"
            type="date"
            errors={errors}
          />
          <InputField
            control={control}
            name="soDate"
            label="S.O.Date"
            type="date"
            errors={errors}
          />
          <InputField
            control={control}
            name="poNo"
            label="P.O.No"
            errors={errors}
          />
          <InputField
            control={control}
            name="revisionNo"
            label="Revision No"
            type="number"
            disabled
            errors={errors}
          />
          <InputField
            control={control}
            name="poDate"
            label="P.O.Date"
            type="date"
            errors={errors}
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-0">
          <div className="flex">
            {["details", "summary"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1 text-xs font-semibold rounded-t capitalize ${activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-300"
                  }`}
              >
                {tab === "details" ? "Sales Order Details" : "Summary"}
              </button>
            ))}
          </div>
          {activeTab !== "summary" && (
            <button
              type="button"
              onClick={addDetailRow}
              className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
            >
              <Plus size={12} />
            </button>
          )}
        </div>

        {/* Tab Content - Details */}
        {activeTab === "details" && (
          <div className="space-y-2">
            {loadingOrder && (
              <div className="text-xs text-gray-500">Loading order details...</div>
            )}
            {detailError && (
              <div className="text-red-500 text-[10px]">{detailError}</div>
            )}
            <TableWrapper>
              <TableHead
                headers={[
                  "S.No",
                  "Item Code *",
                  "Item Description",
                  "Old Qty",
                  "Old Rate",
                  "New Qty *",
                  "New Rate",
                  "Old Dlvy Date",
                  "New Dlvy Date *",
                  "Action",
                ]}
              />
              <tbody>
                {(details || []).map((item, index) => {
                  const rErr = rowErrors[index] || {};
                  const hasItems = itemOptions.length > 0;

                  return (
                    <TableRow
                      key={item.id || index}
                      index={index}
                      onRemove={() => removeDetailRow(index)}
                      disabled={details.length <= 1}
                    >
                      <td className="p-1 align-top">
                        {/* {hasItems ? ( */}
                        <select
                          value={item.itemCode || ""}
                          onChange={(e) =>
                            handleItemSelect(
                              index,
                              e.target.value
                            )
                          }
                          className={`${controlClasses} h-8 text-xs ${rErr.itemCode
                            ? "border-red-500"
                            : ""
                            }`}
                        >
                          <option value="">
                            Select Item
                          </option>

                          {itemOptions.map((opt) => (
                            <option
                              key={opt.value}
                              value={opt.value}
                            >
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        {/* ) : ( */}
                        {/* <input
                          value={item.itemCode || ""}
                          disabled
                          className={`${controlClasses} h-8 text-xs bg-gray-50 dark:bg-gray-800 ${rErr.itemCode
                            ? "border-red-500"
                            : ""
                            }`}
                        /> */}
                        {/* )} */}
                        {rErr.itemCode && <div className="text-red-500 text-[10px] mt-0.5">Required</div>}
                      </td>
                      <td className="p-1 align-top">
                        <input
                          value={item.itemName || ""}
                          disabled
                          className={`${controlClasses} h-8 text-xs bg-gray-50 dark:bg-gray-800`}
                        />
                      </td>
                      <td className="p-1 align-top">
                        <input
                          type="number"
                          step="0.001"
                          value={item.oldQty ?? ""}
                          onChange={(e) =>
                            updateDetail(
                              index,
                              "oldQty",
                              e.target.value === ""
                                ? ""
                                : parseFloat(e.target.value)
                            )
                          }
                          className={`${controlClasses} h-8 text-xs text-center`}
                        />
                      </td>
                      <td className="p-1 align-top">
                        <input
                          type="number"
                          step="0.01"
                          value={item.oldRate ?? ""}
                          onChange={(e) =>
                            updateDetail(
                              index,
                              "oldRate",
                              e.target.value === ""
                                ? ""
                                : parseFloat(e.target.value)
                            )
                          }
                          className={`${controlClasses} h-8 text-xs text-center`}
                        />
                      </td>
                      <td className="p-1 align-top">
                        <input
                          type="number"
                          step="0.001"
                          value={item.newQty ?? 0}
                          onChange={(e) => updateDetail(index, "newQty", parseFloat(e.target.value) || 0)}
                          className={`${controlClasses} h-8 text-xs text-center ${rErr.newQty ? "border-red-500" : ""}`}
                        />
                        {rErr.newQty && <div className="text-red-500 text-[10px] mt-0.5">Required</div>}
                      </td>
                      <td className="p-1 align-top">
                        <input
                          type="number"
                          step="0.01"
                          value={item.newRate ?? 0}
                          onChange={(e) => updateDetail(index, "newRate", parseFloat(e.target.value) || 0)}
                          className={`${controlClasses} h-8 text-xs text-center`}
                        />
                      </td>
                      {/* Old Delivery Date */}
                      <td className="p-1 align-top">
                        <input
                          type="date"
                          value={item.oldDlvyDate || ""}
                          onChange={(e) =>
                            updateDetail(
                              index,
                              "oldDlvyDate",
                              e.target.value
                            )
                          }
                          className={`${controlClasses} h-8 text-xs`}
                        />
                      </td>
                      <td className="p-1 align-top">
                        <input
                          type="date"
                          value={item.newDlvyDate || ""}
                          onChange={(e) => updateDetail(index, "newDlvyDate", e.target.value)}
                          className={`${controlClasses} h-8 text-xs ${rErr.newDlvyDate ? "border-red-500" : ""}`}
                        />
                        {rErr.newDlvyDate && <div className="text-red-500 text-[10px] mt-0.5">Required</div>}
                      </td>
                    </TableRow>
                  );
                })}
              </tbody>
            </TableWrapper>
          </div>
        )}

        {/* Tab Content - Summary */}
        {activeTab === "summary" && (
          <div className="grid grid-cols-1 gap-3 p-3 max-w-2xl">
            <InputField
              control={control}
              name="remarks"
              label="Remarks"
              placeholder="Enter remarks"
              errors={errors}
            />
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <X className="h-3 w-3" /> Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-3 w-3" />{" "}
            {isSubmitting ? "Saving..." : data ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesOrderAmendmentForm;
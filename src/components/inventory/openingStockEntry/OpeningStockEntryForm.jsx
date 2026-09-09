import { ArrowLeft, Save, X, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";

import openingStockEntryAPI from "../../../api/Inventory/openingStockEntryAPI";
import { branchAPI } from "../../../api/branchAPI";
import { useToast } from "../../Toast/ToastContext";

/* -------------------------------------------------------------------------- */
/* Styles                                                                     */
/* -------------------------------------------------------------------------- */

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 " +
  "disabled:text-gray-900 dark:disabled:text-gray-100 " +
  "disabled:opacity-100 disabled:cursor-not-allowed";

const controlErrClasses =
  "border-red-500 dark:border-red-500 " +
  "focus:ring-red-500 focus:border-red-500";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] " +
  "gap-x-4 gap-y-3 items-start";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const getToday = () => dayjs().format("YYYY-MM-DD");

const formatDate = (value) => {
  if (!value) return "";

  const date = dayjs(value);

  return date.isValid() ? date.format("YYYY-MM-DD") : "";
};

const calculateAmount = (quantity, rate) => {
  const qty = Number(quantity);
  const price = Number(rate);

  if (
    quantity === "" ||
    rate === "" ||
    !Number.isFinite(qty) ||
    !Number.isFinite(price) ||
    qty <= 0 ||
    price < 0
  ) {
    return "";
  }

  return (qty * price).toFixed(2);
};

const getLocalStorageNumber = (key) => {
  const value = Number(localStorage.getItem(key));

  return Number.isFinite(value) && value > 0 ? value : null;
};

const getCurrentUser = () => {
  return (
    localStorage.getItem("userId") ||
    localStorage.getItem("usersId") ||
    localStorage.getItem("userName") ||
    localStorage.getItem("username") ||
    ""
  );
};

/* -------------------------------------------------------------------------- */
/* Extract Item Information                                                   */
/* -------------------------------------------------------------------------- */

const getItemCode = (item) => {
  if (!item) return "";

  if (typeof item === "string") {
    return item;
  }

  return item?.itemCode || item?.code || item?.item_code || "";
};

const getItemDescription = (item) => {
  if (!item || typeof item === "string") {
    return "";
  }

  return (
    item?.itemDescription ||
    item?.description ||
    item?.itemName ||
    item?.name ||
    ""
  );
};

const getItemUnit = (item) => {
  if (!item || typeof item === "string") {
    return "";
  }

  return item?.unitId || item?.unit || item?.uom || item?.unitName || "";
};

/* -------------------------------------------------------------------------- */
/* Field                                                                      */
/* -------------------------------------------------------------------------- */

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
  readOnly = false,
  placeholder = "",
  step,
  min,
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
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          className={`${controlClasses} ${error ? controlErrClasses : ""}`}
        >
          <option value="">-- Select --</option>

          {(options || []).map((opt) => (
            <option key={String(opt.value)} value={opt.value}>
              {opt.label}
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
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          rows={3}
          placeholder={placeholder}
          className={
            "w-full px-2 py-1.5 rounded border text-xs leading-snug " +
            "transition-colors resize-none " +
            "bg-white dark:bg-gray-900 " +
            "text-gray-900 dark:text-gray-100 " +
            "placeholder-gray-400 dark:placeholder-gray-500 " +
            "disabled:bg-gray-100 dark:disabled:bg-gray-800 " +
            "disabled:text-gray-900 dark:disabled:text-gray-100 " +
            "disabled:opacity-100 " +
            "focus:outline-none focus:ring-1 focus:ring-blue-500 " +
            "focus:border-blue-500 " +
            `${
              error ? controlErrClasses : "border-gray-300 dark:border-gray-600"
            }`
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
        value={value ?? ""}
        onChange={onChange}
        disabled={disabled}
        readOnly={readOnly}
        placeholder={placeholder}
        step={step}
        min={min}
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

/* -------------------------------------------------------------------------- */
/* Buttons                                                                    */
/* -------------------------------------------------------------------------- */

const FormButtons = ({ onCancel, onSave, isSubmitting, saveLabel }) => (
  <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
    <button
      type="button"
      onClick={onCancel}
      disabled={isSubmitting}
      className={
        "flex items-center gap-1 px-3 py-1.5 rounded text-xs " +
        "border border-gray-300 dark:border-gray-600 " +
        "text-gray-700 dark:text-gray-200 " +
        "bg-white dark:bg-gray-800 " +
        "hover:bg-gray-50 dark:hover:bg-gray-700 " +
        "disabled:opacity-60 disabled:cursor-not-allowed"
      }
    >
      <X className="h-3 w-3" />
      Cancel
    </button>

    <button
      type="button"
      onClick={onSave}
      disabled={isSubmitting}
      className={
        "flex items-center gap-1 px-3 py-1.5 rounded text-xs " +
        "text-white bg-blue-600 hover:bg-blue-700 " +
        "dark:bg-blue-600 dark:hover:bg-blue-500 " +
        "disabled:opacity-60 disabled:cursor-not-allowed"
      }
    >
      {isSubmitting ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Save className="h-3 w-3" />
      )}

      {isSubmitting ? "Saving..." : saveLabel}
    </button>
  </div>
);

/* -------------------------------------------------------------------------- */
/* Initial Header                                                             */
/* -------------------------------------------------------------------------- */

const createInitialHeader = () => ({
  plant: "",
  docDate: getToday(),
  asOnDate: getToday(),
  docId: "",
  location: "",
  itemCode: "",
  itemDescription: "",
  unit: "",
  quantity: "",
  rate: "",
  amount: "",
  remarks: "",
});

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

const OpeningStockEntryForm = ({ data, onBack }) => {
  const { addToast } = useToast();

  const orgId = getLocalStorageNumber("orgId");
  const branchId = getLocalStorageNumber("branchId");

  const currentUser = getCurrentUser();

  const existingId =
    data?.id ?? data?.header?.id ?? data?.openStockEntryId ?? null;

  const isEdit = Boolean(existingId);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loadingMasters, setLoadingMasters] = useState(false);

  const [loadingLocations, setLoadingLocations] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});

  const [plantOptions, setPlantOptions] = useState([]);

  const [locationOptions, setLocationOptions] = useState([]);

  const [itemOptions, setItemOptions] = useState([]);

  const [itemMap, setItemMap] = useState({});

  /* ---------------------------------------------------------------------- */
  /* Initial Header                                                         */
  /* ---------------------------------------------------------------------- */

  const getInitialHeader = () => {
    const source = data?.header || data?.openStockEntry || data || {};

    const detail =
      data?.stockDetails?.[0] ||
      data?.stockDetailList?.[0] ||
      data?.openStockEntryDetails?.[0] ||
      data?.details?.[0] ||
      source?.detail ||
      {};

    const item = detail?.item || source?.item || data?.item || null;

    const itemCode =
      getItemCode(item) ||
      detail?.itemCode ||
      source?.itemCode ||
      data?.itemCode ||
      "";

    const itemDescription =
      getItemDescription(item) ||
      detail?.itemDescription ||
      detail?.itemDesc ||
      detail?.description ||
      source?.itemDescription ||
      data?.itemDescription ||
      "";

    const unit =
      getItemUnit(item) ||
      detail?.unit ||
      detail?.unitId ||
      detail?.uom ||
      source?.unit ||
      data?.unit ||
      "";

    const quantity =
      detail?.quantity ??
      detail?.qty ??
      source?.quantity ??
      source?.qty ??
      data?.quantity ??
      data?.qty ??
      "";

    return {
      ...createInitialHeader(),

      plant:
        source?.branch?.id ??
        source?.plant ??
        source?.branch ??
        source?.branchId ??
        data?.branch?.id ??
        data?.plant ??
        data?.branch ??
        data?.branchId ??
        "",

      docDate: formatDate(source?.docDate ?? data?.docDate ?? getToday()),

      asOnDate: formatDate(source?.asOnDate ?? data?.asOnDate ?? getToday()),

      docId: source?.docId || data?.docId || "",

      location:
        source?.location?.id ??
        source?.location ??
        source?.locationId ??
        data?.location?.id ??
        data?.location ??
        data?.locationId ??
        "",

      itemCode,

      itemDescription,

      unit,

      quantity,

      rate: detail?.rate ?? source?.rate ?? data?.rate ?? "",

      amount: detail?.amount ?? source?.amount ?? data?.amount ?? "",

      remarks: source?.remarks || data?.remarks || "",
    };
  };

  const [header, setHeader] = useState(getInitialHeader);

  /* ---------------------------------------------------------------------- */
  /* Recalculate Amount                                                     */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (header.quantity === "" || header.rate === "") {
      return;
    }

    const calculatedAmount = calculateAmount(header.quantity, header.rate);

    if (calculatedAmount !== header.amount) {
      setHeader((previous) => ({
        ...previous,
        amount: calculatedAmount,
      }));
    }
  }, [header.quantity, header.rate, header.amount]);

  /* ---------------------------------------------------------------------- */
  /* Load Branch + Items                                                    */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    let cancelled = false;

    const loadMasters = async () => {
      if (!orgId || !branchId) {
        return;
      }

      try {
        setLoadingMasters(true);

        const [branches, items] = await Promise.all([
          branchAPI.getBranchByOrgId(orgId),
          openingStockEntryAPI.getItemCodeDropdown(branchId, orgId),
        ]);

        if (cancelled) {
          return;
        }

        /* ---------------- Branches ---------------- */

        const branchList = Array.isArray(branches) ? branches : [];

        const branchOptions = branchList
          .map((branch) => ({
            value: branch?.id ?? branch?.branchId ?? "",

            label:
              branch?.branchName ||
              branch?.name ||
              branch?.branchCode ||
              String(branch?.id ?? branch?.branchId ?? ""),
          }))
          .filter((option) => option.value !== "");

        setPlantOptions(branchOptions);

        /* ---------------- Default Branch ---------------- */

        if (!isEdit && branchId) {
          setHeader((previous) => ({
            ...previous,
            plant: previous.plant || String(branchId),
          }));
        }

        /* ---------------- Items ---------------- */

        const itemList = Array.isArray(items) ? items : [];

        const nextItemMap = {};

        const nextItemOptions = itemList
          .map((item) => {
            const code = getItemCode(item);

            if (!code) {
              return null;
            }

            nextItemMap[code] = item;

            return {
              value: code,
              label: code,
            };
          })
          .filter(Boolean);

        /* Preserve edit item */

        if (isEdit && header.itemCode && !nextItemMap[header.itemCode]) {
          nextItemOptions.unshift({
            value: header.itemCode,
            label: header.itemCode,
          });
        }

        setItemMap(nextItemMap);
        setItemOptions(nextItemOptions);
      } catch (error) {
        console.error("Opening Stock Entry master loading error:", error);

        if (!cancelled) {
          setPlantOptions([]);
          setItemOptions([]);
          setItemMap({});

          addToast("Failed to load Opening Stock Entry master data.", "error");
        }
      } finally {
        if (!cancelled) {
          setLoadingMasters(false);
        }
      }
    };

    loadMasters();

    return () => {
      cancelled = true;
    };
  }, [orgId, branchId, isEdit]);

  /* ---------------------------------------------------------------------- */
  /* Load Locations                                                         */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    let cancelled = false;

    const loadLocations = async () => {
      if (!orgId || !header.plant) {
        setLocationOptions([]);
        return;
      }

      try {
        setLoadingLocations(true);

        const locations = await openingStockEntryAPI.getLocationByOrgId(
          orgId,
          Number(header.plant),
        );

        if (cancelled) {
          return;
        }

        const list = Array.isArray(locations) ? locations : [];

        const options = list
          .map((location) => ({
            value: location?.id ?? location?.locationId ?? "",

            label:
              location?.locationName ||
              location?.name ||
              String(location?.id ?? location?.locationId ?? ""),
          }))
          .filter((option) => option.value !== "");

        /* Preserve existing edit location */

        if (
          isEdit &&
          header.location &&
          !options.some(
            (option) => String(option.value) === String(header.location),
          )
        ) {
          options.unshift({
            value: header.location,
            label:
              data?.location?.locationName ||
              data?.locationName ||
              String(header.location),
          });
        }

        setLocationOptions(options);
      } catch (error) {
        console.error("Opening Stock Entry location loading error:", error);

        if (!cancelled) {
          setLocationOptions([]);

          addToast("Failed to load locations.", "error");
        }
      } finally {
        if (!cancelled) {
          setLoadingLocations(false);
        }
      }
    };

    loadLocations();

    return () => {
      cancelled = true;
    };
  }, [orgId, header.plant, isEdit]);

  /* ---------------------------------------------------------------------- */
  /* Generate Document ID                                                   */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    let cancelled = false;

    const generateDocId = async () => {
      if (isEdit) {
        return;
      }

      if (!orgId || header.docId) {
        return;
      }

      const financialYear = dayjs().format("YYYY");

      try {
        const docId = await openingStockEntryAPI.getOpenStockEntryDocId(
          financialYear,
          orgId,
          "OSE",
        );

        if (!cancelled && docId) {
          setHeader((previous) => ({
            ...previous,
            docId,
          }));
        }
      } catch (error) {
        console.error("Opening Stock Entry Doc ID generation error:", error);

        if (!cancelled) {
          addToast("Failed to generate Opening Stock Entry Doc Id.", "error");
        }
      }
    };

    generateDocId();

    return () => {
      cancelled = true;
    };
  }, [orgId, isEdit, header.docId]);

  /* ---------------------------------------------------------------------- */
  /* Item Options                                                           */
  /* ---------------------------------------------------------------------- */

  const finalItemOptions = useMemo(() => {
    const options = [...itemOptions];

    if (
      header.itemCode &&
      !options.some(
        (option) => String(option.value) === String(header.itemCode),
      )
    ) {
      options.unshift({
        value: header.itemCode,
        label: header.itemCode,
      });
    }

    return options;
  }, [itemOptions, header.itemCode]);

  /* ---------------------------------------------------------------------- */
  /* Change Handler                                                         */
  /* ---------------------------------------------------------------------- */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFieldErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    /* ---------------- Plant ---------------- */

    if (name === "plant") {
      setHeader((previous) => ({
        ...previous,
        plant: value,
        location: "",
      }));

      setFieldErrors((previous) => ({
        ...previous,
        plant: "",
        location: "",
      }));

      return;
    }

    /* ---------------- Item Code ---------------- */

    if (name === "itemCode") {
      const selectedItem = itemMap[value];

      setHeader((previous) => ({
        ...previous,

        itemCode: value,

        itemDescription:
          getItemDescription(selectedItem) || previous.itemDescription,

        unit: getItemUnit(selectedItem) || previous.unit,
      }));

      setFieldErrors((previous) => ({
        ...previous,
        itemCode: "",
        itemDescription: "",
        unit: "",
      }));

      return;
    }

    /* ---------------- Quantity / Rate ---------------- */

    if (name === "quantity" || name === "rate") {
      setHeader((previous) => {
        const quantity = name === "quantity" ? value : previous.quantity;

        const rate = name === "rate" ? value : previous.rate;

        return {
          ...previous,
          [name]: value,
          amount: calculateAmount(quantity, rate),
        };
      });

      return;
    }

    /* ---------------- Other Fields ---------------- */

    setHeader((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* ---------------------------------------------------------------------- */
  /* Validation                                                             */
  /* ---------------------------------------------------------------------- */

  const validate = () => {
    const errors = {};

    if (!header.plant) {
      errors.plant = "Plant is required";
    }

    if (!header.docDate) {
      errors.docDate = "Doc Date is required";
    }

    if (!header.asOnDate) {
      errors.asOnDate = "As On Date is required";
    }

    if (!header.docId?.trim()) {
      errors.docId = "Doc Id is required";
    }

    if (!header.location) {
      errors.location = "Location is required";
    }

    if (!header.itemCode?.trim()) {
      errors.itemCode = "Item Code is required";
    }

    if (!header.itemDescription?.trim()) {
      errors.itemDescription = "Item Description is required";
    }

    if (!header.unit?.trim()) {
      errors.unit = "Unit is required";
    }

    if (
      header.quantity === "" ||
      !Number.isFinite(Number(header.quantity)) ||
      Number(header.quantity) <= 0
    ) {
      errors.quantity = "Qty must be greater than 0";
    }

    if (
      header.rate === "" ||
      !Number.isFinite(Number(header.rate)) ||
      Number(header.rate) < 0
    ) {
      errors.rate = "Rate cannot be negative";
    }

    const amount = calculateAmount(header.quantity, header.rate);

    if (!amount) {
      errors.amount = "Invalid Qty / Rate";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  /* ---------------------------------------------------------------------- */
  /* Build Payload                                                          */
  /* ---------------------------------------------------------------------- */

  const buildPayload = () => {
    const isUpdate = Boolean(existingId);

    const amount = calculateAmount(header.quantity, header.rate);

    return {
      ...(isUpdate
        ? {
            id: Number(existingId),
          }
        : {}),

      orgId: Number(orgId),

      branch: Number(header.plant),

      docDate: header.docDate,

      asOnDate: header.asOnDate,

      docId: header.docId,

      location: Number(header.location),

      itemCode: header.itemCode,

      itemDescription: header.itemDescription,

      unit: header.unit,

      quantity: Number(header.quantity),

      rate: Number(header.rate),

      amount: Number(amount),

      remarks: header.remarks || "",

      active: typeof data?.active === "boolean" ? data.active : true,

      createdBy: isUpdate
        ? data?.createdBy || data?.header?.createdBy || currentUser
        : currentUser,

      ...(isUpdate
        ? {
            updatedBy: currentUser,
          }
        : {}),
    };
  };

  /* ---------------------------------------------------------------------- */
  /* Save                                                                   */
  /* ---------------------------------------------------------------------- */

  const handleSave = async () => {
    if (!validate()) {
      addToast("Please fill all mandatory fields before saving.", "error");

      return;
    }

    try {
      setIsSubmitting(true);

      const payload = buildPayload();

      console.log(
        "================ OPENING STOCK ENTRY PAYLOAD ================",
      );

      console.log(JSON.stringify(payload, null, 2));

      const response = await openingStockEntryAPI.createUpdate(payload);

      if (response?.status === true) {
        const message =
          response?.paramObjectsMap?.message ||
          (isEdit
            ? "Opening Stock Entry updated successfully!"
            : "Opening Stock Entry created successfully!");

        addToast(message, "success");

        onBack?.();

        return;
      }

      const errorMessage =
        response?.errors?.[0]?.shortMessage ||
        response?.errors?.[0]?.longMessage ||
        response?.paramObjectsMap?.errorMessage ||
        response?.paramObjectsMap?.message ||
        response?.message ||
        "Failed to save Opening Stock Entry.";

      addToast(errorMessage, "error");
    } catch (error) {
      console.error("Opening Stock Entry Save Error:", error);

      const responseData = error?.response?.data;

      const errorMessage =
        responseData?.errors?.[0]?.shortMessage ||
        responseData?.errors?.[0]?.longMessage ||
        responseData?.paramObjectsMap?.errorMessage ||
        responseData?.paramObjectsMap?.message ||
        responseData?.message ||
        error?.message ||
        "Something went wrong while saving.";

      addToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Render                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="p-2 max-w-7xl">
      {/* Header */}

      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className={
            "p-1 rounded-md text-gray-600 " +
            "dark:text-gray-300 " +
            "hover:bg-gray-100 " +
            "dark:hover:bg-gray-700 " +
            "hover:text-gray-900 " +
            "dark:hover:text-white " +
            "disabled:opacity-50"
          }
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {isEdit ? "Edit Opening Stock Entry" : "Add Opening Stock Entry"}
        </h2>
      </div>

      {/* Main Card */}

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* Document Details */}

        <div>
          <div className={fieldGrid}>
            <Field
              type="select"
              label="Plant"
              name="plant"
              value={header.plant}
              onChange={handleChange}
              options={plantOptions}
              error={fieldErrors.plant}
              required
              disabled={loadingMasters || isEdit}
            />

            <Field
              type="date"
              label="Doc Date"
              name="docDate"
              value={header.docDate}
              onChange={handleChange}
              error={fieldErrors.docDate}
              required
              disabled={isSubmitting}
            />

            <Field
              type="date"
              label="As On Date"
              name="asOnDate"
              value={header.asOnDate}
              onChange={handleChange}
              error={fieldErrors.asOnDate}
              required
              disabled={isSubmitting}
            />

            <Field
              label="Doc Id"
              name="docId"
              value={header.docId}
              onChange={handleChange}
              error={fieldErrors.docId}
              required
              disabled
              placeholder="Auto generated"
            />
          </div>
        </div>

        {/* Stock Details */}

        <div>
          <div className={fieldGrid}>
            <Field
              type="select"
              label="Location"
              name="location"
              value={header.location}
              onChange={handleChange}
              options={locationOptions}
              error={fieldErrors.location}
              required
              disabled={!header.plant || loadingLocations}
            />

            <Field
              type="select"
              label="Item Code"
              name="itemCode"
              value={header.itemCode}
              onChange={handleChange}
              options={finalItemOptions}
              error={fieldErrors.itemCode}
              required
              disabled={loadingMasters}
            />

            <Field
              label="Item Description"
              name="itemDescription"
              value={header.itemDescription}
              onChange={handleChange}
              error={fieldErrors.itemDescription}
              required
              disabled
            />

            <Field
              label="Unit"
              name="unit"
              value={header.unit}
              onChange={handleChange}
              error={fieldErrors.unit}
              required
              disabled
            />

            <Field
              type="number"
              label="Qty"
              name="quantity"
              value={header.quantity}
              onChange={handleChange}
              error={fieldErrors.quantity}
              required
              min="0"
              step="0.001"
              placeholder="0.000"
              disabled={isSubmitting}
            />

            <Field
              type="number"
              label="Rate"
              name="rate"
              value={header.rate}
              onChange={handleChange}
              error={fieldErrors.rate}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
              disabled={isSubmitting}
            />

            <Field
              type="number"
              label="Amount"
              name="amount"
              value={header.amount}
              error={fieldErrors.amount}
              readOnly
              disabled
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Remarks */}

        <div>
          <div className={fieldGrid}>
            <Field
              type="textarea"
              label="Remarks"
              name="remarks"
              value={header.remarks}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Enter remarks..."
              className="col-span-full"
            />
          </div>
        </div>

        {/* Buttons */}

        <FormButtons
          onCancel={onBack}
          onSave={handleSave}
          isSubmitting={isSubmitting}
          saveLabel={isEdit ? "Update" : "Save"}
        />
      </div>
    </div>
  );
};

export default OpeningStockEntryForm;

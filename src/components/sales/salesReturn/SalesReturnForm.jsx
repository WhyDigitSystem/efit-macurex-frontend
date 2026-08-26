import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import salesReturnAPI from "../../../api/Sales/salesReturnAPI";
import branchAPI from "../../../api/branchAPI";
import partyMasterAPI from "../../../api/partyMasterAPI";
import itemAPI from "../../../api/itemAPI";
import docTypeMappingAPI from "../../../api/docTypeMappingAPI";
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

const getDefaultValues = () => ({
  id: "",
  salesReturnNo: "",
  salesReturnDate: new Date().toISOString().split("T")[0],
  branchId: "",
  customerId: "",
  customerName: "",
  customerCode: "",
  invoiceNo: "",
  invoiceDate: "",
  remarks: "",
  items: [
    {
      itemCode: "",
      itemDescription: "",
      unit: "",
      qty: 0,
      rate: 0,
      amount: 0,
      returnReason: "",
    },
  ],
  taxDetails: [
    { particulars: "", amount: 0 },
  ],
});

const InputField = ({
  control,
  name,
  label,
  type = "text",
  required,
  errors,
  disabled,
  placeholder,
  value,
}) => {
  const getError = () => {
    const parts = name.split(".");
    let error = errors;
    for (const part of parts) {
      if (error && error[part]) error = error[part];
      else return null;
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
          <input
            {...field}
            type={type}
            value={value !== undefined ? value : field.value}
            className={`${controlClasses} ${errorMessage ? "border-red-500" : ""}`}
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

const SelectField = ({
  control,
  name,
  label,
  options,
  required,
  errors,
  disabled,
  onChange: onChangeProp,
}) => {
  const getError = () => {
    const parts = name.split(".");
    let error = errors;
    for (const part of parts) {
      if (error && error[part]) error = error[part];
      else return null;
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
            disabled={disabled}
            className={`${controlClasses} ${errorMessage ? "border-red-500" : ""}`}
            onChange={(e) => {
              field.onChange(e);
              if (onChangeProp) onChangeProp(e);
            }}
          >
            <option value="">Select</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
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

const SalesReturnForm = ({ data, onBack }) => {
  const [orgId] = useState(localStorage.getItem("orgId"));
  const [branchId] = useState(localStorage.getItem("branchId"));
  const [userId] = useState(localStorage.getItem("userId"));
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [branchData, setBranchData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [itemData, setItemData] = useState([]);
  const { addToast } = useToast();

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

  const itemsArray = useFieldArray({ control, name: "items" });
  const taxArray = useFieldArray({ control, name: "taxDetails" });

  const watchItems = watch("items");

  const grossAmount = (watchItems || []).reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0,
  );

  useEffect(() => {
    setValue("taxDetails.0.amount", grossAmount.toFixed(2));
  }, [grossAmount, setValue]);

  useEffect(() => {
    loadBranches();
    loadCustomers();
    loadItems();
  }, []);

  useEffect(() => {
    if (data?.id) loadSalesReturnData(data);
  }, [data]);

  const loadBranches = useCallback(async () => {
    try {
      const response = await branchAPI.getBranchByOrgId(orgId);
      setBranchData(
        (response || []).map((b) => ({ value: b.id, label: b.branchName })),
      );
    } catch {
      setBranchData([]);
    }
  }, [orgId]);

  const loadCustomers = useCallback(async () => {
    try {
      const response = await partyMasterAPI.getPartyByOrgId(orgId, branchId);
      setCustomerData(
        (response || []).map((c) => ({
          value: c.id,
          label: c.customerName,
          customerCode: c.customerCode,
        })),
      );
    } catch {
      setCustomerData([]);
    }
  }, [orgId, branchId]);

  const loadItems = useCallback(async () => {
    try {
      const response = await itemAPI.getItems(orgId, branchId);
      setItemData(
        (response || []).map((i) => ({
          value: i.id,
          label: i.itemCode,
          itemDescription: i.itemDescription,
          unit: i.primaryUnits?.primaryUnit || "",
        })),
      );
    } catch {
      setItemData([]);
    }
  }, [orgId, branchId]);

  const loadSalesReturnData = async (raw) => {
    setLoading(true);
    try {
      const response = await salesReturnAPI.getSalesReturnById(raw.id);
      const sr = response?.paramObjectsMap?.salesReturnResponseVO;
      if (!sr) {
        addToast("Failed to load Sales Return data", "error");
        return;
      }

      setValue("id", sr.id);
      setValue("salesReturnNo", sr.salesReturnNo || sr.docId || "");
      setValue("salesReturnDate", sr.salesReturnDate || sr.docDate || "");
      setValue("branchId", sr.branch?.id || sr.branchId || "");
      setValue("customerId", sr.customer?.customerId || sr.customerId || "");
      setValue("customerName", sr.customer?.customerName || sr.customerName || "");
      setValue("customerCode", sr.customer?.customerCode || sr.customerCode || "");
      setValue("invoiceNo", sr.invoiceNo || "");
      setValue("invoiceDate", sr.invoiceDate || "");
      setValue("remarks", sr.remarks || "");

      if (sr.salesReturnItemDetailsDTO?.length > 0) {
        const items = sr.salesReturnItemDetailsDTO.map((it) => ({
          itemCode: it.item?.id || it.itemCode || "",
          itemDescription: it.item?.itemDescription || it.itemDescription || "",
          unit: it.unit || "",
          qty: it.qty || 0,
          rate: it.rate || 0,
          amount: it.amount || 0,
          returnReason: it.returnReason || "",
        }));
        itemsArray.replace(items);
      }

      if (sr.salesReturnTaxDetailsDTO?.length > 0) {
        const taxes = sr.salesReturnTaxDetailsDTO.map((t) => ({
          particulars: t.particulars || "",
          amount: t.amount || 0,
        }));
        taxArray.replace(taxes);
      }

      addToast("Sales Return data loaded", "success");
    } catch (error) {
      console.error("Error loading sales return:", error);
      addToast("Failed to load Sales Return data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    itemsArray.append(getDefaultValues().items[0]);
  };

  const handleRemoveItem = (index) => {
    if (itemsArray.fields.length > 1) itemsArray.remove(index);
  };

  const handleAddTax = () => {
    taxArray.append(getDefaultValues().taxDetails[0]);
  };

  const handleRemoveTax = (index) => {
    if (taxArray.fields.length > 1) taxArray.remove(index);
  };

  const formatDateForAPI = (dateString) => {
    if (!dateString) return null;
    try {
      const d = new Date(dateString);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    } catch {
      return null;
    }
  };

  const onSubmit = async (formData) => {
    setSaving(true);
    try {
      const payload = {
        active: true,
        orgId: parseInt(orgId),
        branchId: Number(formData.branchId || branchId),
        salesReturnNo: formData.salesReturnNo || "",
        salesReturnDate: formatDateForAPI(formData.salesReturnDate) || "",
        customerId: Number(formData.customerId),
        customerName: formData.customerName || "",
        customerCode: formData.customerCode || "",
        invoiceNo: formData.invoiceNo || "",
        invoiceDate: formatDateForAPI(formData.invoiceDate) || "",
        totalAmount: grossAmount,
        remarks: formData.remarks || "",
        createdBy: userId || "admin",
        updatedBy: userId || "admin",
        screenCode: "SALES_RETURN",
        screenName: "Sales Return",
        salesReturnItemDetailsDTO: (formData.items || []).map((item) => ({
          item: Number(item.itemCode),
          itemDescription: item.itemDescription || "",
          unit: item.unit || "",
          qty: Number(item.qty || 0),
          rate: Number(item.rate || 0),
          amount: Number(item.amount || 0),
          returnReason: item.returnReason || "",
        })),
        salesReturnTaxDetailsDTO: (formData.taxDetails || []).map((tax) => ({
          particulars: String(tax.particulars),
          amount: Number(tax.amount || 0),
        })),
      };

      if (data?.id) payload.id = data.id;

      const response =
        await salesReturnAPI.createUpdateSalesReturn(payload);

      const isSuccess =
        response?.status === true ||
        response?.success === true ||
        response?.statusCode === 200;

      if (isSuccess) {
        addToast(
          data?.id
            ? "Sales Return updated successfully"
            : "Sales Return created successfully",
          "success",
        );
        reset(getDefaultValues());
        onBack();
      } else {
        addToast(response?.message || "Something went wrong", "error");
      }
    } catch (error) {
      console.error("Error saving sales return:", error);
      addToast("Failed to save Sales Return", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading sales return data...</div>
      </div>
    );
  }

  return (
    <div className="p-2 max-w-7xl">
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data ? "Edit Sales Return" : "Add Sales Return"}
        </h2>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3"
      >
        {/* Header Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <SelectField
            control={control}
            name="branchId"
            label="Plant"
            options={branchData}
            required
            errors={errors}
          />
          <InputField
            control={control}
            name="salesReturnNo"
            label="Sales Return No"
            errors={errors}
            disabled
          />
          <InputField
            control={control}
            name="salesReturnDate"
            label="Sales Return Date"
            type="date"
            required
            errors={errors}
          />
          <SelectField
            control={control}
            name="customerId"
            label="Customer"
            options={customerData}
            required
            errors={errors}
            onChange={(e) => {
              const selected = customerData.find(
                (c) => String(c.value) === String(e.target.value),
              );
              if (selected) {
                setValue("customerName", selected.label);
                setValue("customerCode", selected.customerCode);
              }
            }}
          />
          <InputField
            control={control}
            name="invoiceNo"
            label="Invoice No"
            errors={errors}
          />
          <InputField
            control={control}
            name="invoiceDate"
            label="Invoice Date"
            type="date"
            errors={errors}
          />
          <InputField
            control={control}
            name="remarks"
            label="Remarks"
            errors={errors}
          />
        </div>

        {/* Items Table */}
        <section>
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-2 pb-1">
            <h3 className="text-xs font-semibold uppercase text-gray-500">
              Return Items
            </h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
            >
              <Plus size={12} />
            </button>
          </div>

          <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
            <table className="w-full text-xs">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="p-1 w-8 text-center">S.No</th>
                  <th className="p-1 text-left">Item Code *</th>
                  <th className="p-1 text-left">Description</th>
                  <th className="p-1 text-left">Unit</th>
                  <th className="p-1 text-left">Qty *</th>
                  <th className="p-1 text-left">Rate *</th>
                  <th className="p-1 text-left">Amount</th>
                  <th className="p-1 text-left">Return Reason</th>
                  <th className="p-1 w-10 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {itemsArray.fields.map((field, index) => {
                  const qty = Number(watchItems?.[index]?.qty || 0);
                  const rate = Number(watchItems?.[index]?.rate || 0);
                  const amount = qty * rate;

                  return (
                    <tr
                      key={field.id}
                      className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="p-1 text-center font-medium">
                        {index + 1}
                      </td>
                      <td className="p-1">
                        <Controller
                          control={control}
                          name={`items.${index}.itemCode`}
                          render={({ field: f }) => (
                            <select
                              {...f}
                              className={controlClasses}
                              onChange={(e) => {
                                f.onChange(e);
                                const sel = itemData.find(
                                  (i) =>
                                    String(i.value) === String(e.target.value),
                                );
                                if (sel) {
                                  setValue(
                                    `items.${index}.itemDescription`,
                                    sel.itemDescription || "",
                                  );
                                  setValue(
                                    `items.${index}.unit`,
                                    sel.unit || "",
                                  );
                                }
                              }}
                            >
                              <option value="">Select</option>
                              {itemData.map((i) => (
                                <option key={i.value} value={i.value}>
                                  {i.label}
                                </option>
                              ))}
                            </select>
                          )}
                        />
                      </td>
                      <td className="p-1">
                        <Controller
                          control={control}
                          name={`items.${index}.itemDescription`}
                          render={({ field: f }) => (
                            <input
                              {...f}
                              className={controlClasses}
                              readOnly
                            />
                          )}
                        />
                      </td>
                      <td className="p-1">
                        <Controller
                          control={control}
                          name={`items.${index}.unit`}
                          render={({ field: f }) => (
                            <input
                              {...f}
                              className={controlClasses}
                              readOnly
                            />
                          )}
                        />
                      </td>
                      <td className="p-1">
                        <Controller
                          control={control}
                          name={`items.${index}.qty`}
                          render={({ field: f }) => (
                            <input
                              {...f}
                              type="number"
                              className={controlClasses}
                              onChange={(e) => {
                                f.onChange(e);
                                const newQty = Number(e.target.value || 0);
                                const curRate = Number(
                                  watchItems?.[index]?.rate || 0,
                                );
                                setValue(
                                  `items.${index}.amount`,
                                  newQty * curRate,
                                );
                              }}
                            />
                          )}
                        />
                      </td>
                      <td className="p-1">
                        <Controller
                          control={control}
                          name={`items.${index}.rate`}
                          render={({ field: f }) => (
                            <input
                              {...f}
                              type="number"
                              step="0.01"
                              className={controlClasses}
                              onChange={(e) => {
                                f.onChange(e);
                                const curQty = Number(
                                  watchItems?.[index]?.qty || 0,
                                );
                                const newRate = Number(e.target.value || 0);
                                setValue(
                                  `items.${index}.amount`,
                                  curQty * newRate,
                                );
                              }}
                            />
                          )}
                        />
                      </td>
                      <td className="p-1">
                        <Controller
                          control={control}
                          name={`items.${index}.amount`}
                          render={({ field: f }) => (
                            <input
                              {...f}
                              type="number"
                              step="0.01"
                              className={controlClasses}
                              readOnly
                              value={amount.toFixed(2)}
                            />
                          )}
                        />
                      </td>
                      <td className="p-1">
                        <Controller
                          control={control}
                          name={`items.${index}.returnReason`}
                          render={({ field: f }) => (
                            <input {...f} className={controlClasses} />
                          )}
                        />
                      </td>
                      <td className="p-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          disabled={itemsArray.fields.length <= 1}
                          className={`h-5 w-5 rounded text-white flex items-center justify-center ${
                            itemsArray.fields.length <= 1
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-red-600 hover:bg-red-700"
                          }`}
                        >
                          <Trash2 size={10} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Tax Details */}
        <section>
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-2 pb-1">
            <h3 className="text-xs font-semibold uppercase text-gray-500">
              Tax Details
            </h3>
            <button
              type="button"
              onClick={handleAddTax}
              className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
            >
              <Plus size={12} />
            </button>
          </div>

          <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
            <table className="w-full text-xs">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="p-1 w-8 text-center">S.No</th>
                  <th className="p-1 text-left">Particulars</th>
                  <th className="p-1 text-left">Amount</th>
                  <th className="p-1 w-10 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {taxArray.fields.map((field, index) => (
                  <tr
                    key={field.id}
                    className="border-t dark:border-gray-700"
                  >
                    <td className="p-1 text-center font-medium">
                      {index + 1}
                    </td>
                    <td className="p-1">
                      <Controller
                        control={control}
                        name={`taxDetails.${index}.particulars`}
                        render={({ field: f }) => (
                          <input {...f} className={controlClasses} />
                        )}
                      />
                    </td>
                    <td className="p-1">
                      <Controller
                        control={control}
                        name={`taxDetails.${index}.amount`}
                        render={({ field: f }) => (
                          <input
                            {...f}
                            type="number"
                            step="0.01"
                            className={controlClasses}
                            readOnly={index === 0}
                            value={index === 0 ? grossAmount.toFixed(2) : f.value}
                          />
                        )}
                      />
                    </td>
                    <td className="p-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveTax(index)}
                        disabled={taxArray.fields.length <= 1}
                        className={`h-5 w-5 rounded text-white flex items-center justify-center ${
                          taxArray.fields.length <= 1
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700"
                        }`}
                      >
                        <Trash2 size={10} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-1.5 text-xs font-medium rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1 px-4 py-1.5 text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={12} />
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SalesReturnForm;

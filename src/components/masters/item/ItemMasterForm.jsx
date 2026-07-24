import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const labelClasses = "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const getDefaultValues = () => ({
  itemGroup: "",
  capitalInput: "",
  itemType: "",
  groupItem: "",
  grade: "",
  itemCode: "",
  tariffNo: "",
  itemDescription: "",
  thickness: 0,
  width: 0,
  length: 0,
  weight: 0,
  primaryUnit: "",
  inspection: "",
  abcGrade: "",
  drawingNo: "",
  lotSize: 0,
  importLocal: "",
  safetyStock: 0,
  rawMaterialMake: "",
  hsnCode: "",
  stock: false,
  protoType: false,
  psw: false,
  qcApproval: false,
  sellifePart: false,
  grn: false,
  active: true,
  units: [{ purchaseUnit: "", sellingUnit: "", pricingUnit: "", secondaryUnit: "" }],
  inventory: [{
    manufactured: "", defaultLocation: "", alternateLocation: "",
    leadTime: 0, reorderLevel: 0, rackNo: "", rowNo: "", position: "",
    minimumOrderQty: 0, maximumOrderQty: 0, binSize: "", binQty: 0
  }],
  purchase: [{
    defaultSupplier: "", leadTime1: 0, alternateSupplier: "", leadTime2: 0,
    purchaseTolerance: 0, rate: 0, date: "", landedCostRate: 0, branch: "",
    toolOwner: "", toolNo: ""
  }],
  slaes: [{
    costRate: 0, itemBlockedForInvoicing: "", minimumSellingPrice: 0,
    salesAccount: "", leadTime: 0, customerPartNo: ""
  }],
  others: [{ supplierPartNo: "", technicalSpecification: "" }],
  drawing: [{ attchement: null }],
});

const SELECT_OPTIONS = {
  itemGroup: ["Opsm Front Pcb Sub Assy", "Aerospace"],
  capitalInput: ["Capital", "Input", "Others"],
  itemType: ["Capital", "Input", "Others"],
  groupItem: ["Capital", "Input", "Others"],
  grade: ["Capital", "Input", "Others"],
  tariffNo: ["Capital", "Input", "Others"],
  inspection: ["Capital", "Input", "Others"],
  abcGrade: ["Capital", "Input", "Others"],
  importLocal: ["Capital", "Input", "Others"],
  hsnSACCode: ["Capital", "Input", "Others"],
  primaryUnit: ["Nos", "Box", "Kg", "Meter"],
  manufactured: ["Manufactured", "Bought Out"],
  location: ["Warehouse A", "Warehouse B", "Warehouse C"],
  supplier: ["ABC Traders", "XYZ Industries", "Global Supplier"],
  branch: ["Chennai", "Bangalore", "Hyderabad"],
  salesAccount: ["Domestic Sales", "Export Sales", "Retail Sales"],
  yesNo: ["Yes", "No"],
};

// ============================================================================
// HELPER COMPONENTS
// ============================================================================
const SelectField = ({ control, name, label, options, required, errors }) => (
  <div>
    <label className={labelClasses}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <Controller
      name={name}
      control={control}
      rules={required ? { required: `${label} is required` } : undefined}
      render={({ field }) => (
        <select {...field} className={controlClasses}>
          <option value="">Select</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}
    />
    {!name.includes('.') && errors?.[name] && (
      <p className="text-red-500 text-[11px]">{errors[name].message}</p>
    )}
  </div>
);

const InputField = ({ control, name, label, type = "text", required, placeholder, errors }) => (
  <div>
    <label className={labelClasses}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <Controller
      name={name}
      control={control}
      rules={required ? { required: `${label} is required` } : undefined}
      render={({ field }) => (
        <input {...field} type={type} className={controlClasses} placeholder={placeholder} />
      )}
    />
    {!name.includes('.') && errors?.[name] && (
      <p className="text-red-500 text-[11px]">{errors[name].message}</p>
    )}
  </div>
);

const ToggleButton = ({ control, name }) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <button
        type="button"
        onClick={() => field.onChange(!field.value)}
        className={`relative flex items-center w-12 h-6 rounded-full transition-colors ${
          field.value ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
        }`}
      >
        <span className={`absolute h-5 w-5 bg-white rounded-full shadow transition-transform ${
          field.value ? "translate-x-6" : "translate-x-0.5"
        }`} />
      </button>
    )}
  />
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const ItemMasterForm = ({ data, onBack }) => {
  const [orgId] = useState(localStorage.getItem("orgId"));
  const [activeChildTab, setActiveChildTab] = useState("unit");
  
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    mode: "onTouched",
    defaultValues: getDefaultValues(),
  });

  // Field Arrays
  const tabConfig = {
    unit: useFieldArray({ control, name: "units" }),
    inventory: useFieldArray({ control, name: "inventory" }),
    purchase: useFieldArray({ control, name: "purchase" }),
    sales: useFieldArray({ control, name: "slaes" }),
    others: useFieldArray({ control, name: "others" }),
    drawing: useFieldArray({ control, name: "drawing" }),
  };

  const getFieldArray = (tab) => tabConfig[tab] || tabConfig.unit;
  const handleAdd = (tab) => getFieldArray(tab).append(getDefaultValues()[tab]?.[0] || {});
  const handleRemove = (tab, index) => {
    const { fields, remove } = getFieldArray(tab);
    if (fields.length > 1) remove(index);
  };

  const onSubmit = async (formData) => {
    try {
      console.log("Form Data:", formData, "Org Id:", orgId);
      // API call here
    } catch (error) {
      console.error(error);
    }
  };

  // Helper to check if a field has error
  const getFieldError = (fieldName) => {
    const parts = fieldName.split('.');
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

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="p-2 max-w-7xl relative">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <button onClick={onBack} className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data ? "Edit Item" : "Add Item"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
        {/* Basic Details Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <SelectField control={control} name="itemGroup" label="Item Group" options={SELECT_OPTIONS.itemGroup} errors={errors} />
          <SelectField control={control} name="capitalInput" label="Capital / Input" options={SELECT_OPTIONS.capitalInput} required errors={errors} />
          <SelectField control={control} name="itemType" label="Item Type" options={SELECT_OPTIONS.itemType} errors={errors} />
          <SelectField control={control} name="groupItem" label="Group Item" options={SELECT_OPTIONS.groupItem} required errors={errors} />
          <SelectField control={control} name="grade" label="Grade" options={SELECT_OPTIONS.grade} required errors={errors} />
          
          <InputField control={control} name="itemCode" label="Item Code" required placeholder="Enter Item Code" errors={errors} />
          <SelectField control={control} name="tariffNo" label="Excise Tariff No" options={SELECT_OPTIONS.tariffNo} required errors={errors} />
          <InputField control={control} name="itemDescription" label="Item Description" required placeholder="Enter Item Description" errors={errors} />
          
          <InputField control={control} name="thickness" label="Thickness" type="number" errors={errors} />
          <InputField control={control} name="width" label="Width" type="number" errors={errors} />
          <InputField control={control} name="length" label="Length" type="number" errors={errors} />
          <InputField control={control} name="weight" label="Weight (Kgs)" type="number" errors={errors} />
          
          <SelectField control={control} name="primaryUnit" label="Primary Unit" options={SELECT_OPTIONS.primaryUnit} errors={errors} />
          <SelectField control={control} name="inspection" label="Inspection" options={SELECT_OPTIONS.inspection} required errors={errors} />
          <SelectField control={control} name="abcGrade" label="ABC Grade" options={SELECT_OPTIONS.abcGrade} required errors={errors} />
          <InputField control={control} name="drawingNo" label="Drawing No" required placeholder="Enter Drawing No" errors={errors} />
          
          <InputField control={control} name="lotSize" label="Lot Size" type="number" errors={errors} />
          <SelectField control={control} name="sellifePart" label="Shelf life Part" options={SELECT_OPTIONS.itemGroup} errors={errors} />
          <SelectField control={control} name="importLocal" label="Import / Local" options={SELECT_OPTIONS.importLocal} required errors={errors} />
          <InputField control={control} name="safetyStock" label="Safety Stock/MSL" type="number" errors={errors} />
          <InputField control={control} name="rawMaterialMake" label="Raw Materials Make" required placeholder="Enter Raw Material Make" errors={errors} />
          <SelectField control={control} name="hsnSACCode" label="HSN_SAC_Code" options={SELECT_OPTIONS.hsnSACCode} required errors={errors} />
          
          <div>
            <label className={labelClasses}>Active</label>
            <ToggleButton control={control} name="active" />
          </div>
        </form>

        {/* Child Tables */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-0">
            <div className="flex">
              {["unit", "inventory", "purchase", "sales", "others", "drawing"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveChildTab(tab)}
                  className={`px-4 py-1 text-xs font-semibold rounded-t capitalize ${
                    activeChildTab === tab ? "bg-blue-600 text-white" : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {tab === "drawing" ? "Drawing Attachment" : tab}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => handleAdd(activeChildTab)}
              className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Tab Content - With inline errors for child tables */}
          {activeChildTab === "unit" && (
            <TableWrapper>
              <TableHead headers={["#", "Purchase Unit", "Selling Unit", "Pricing Unit", "Secondary Unit", "Action"]} />
              <tbody>
                {tabConfig.unit.fields.map((field, index) => (
                  <TableRow key={field.id} index={index} onRemove={() => handleRemove("unit", index)} disabled={tabConfig.unit.fields.length <= 1}>
                    <SelectCell 
                      control={control} 
                      name={`units.${index}.purchaseUnit`} 
                      options={SELECT_OPTIONS.primaryUnit}
                      errors={errors}
                    />
                    <SelectCell 
                      control={control} 
                      name={`units.${index}.sellingUnit`} 
                      options={SELECT_OPTIONS.primaryUnit}
                      errors={errors}
                    />
                    <SelectCell 
                      control={control} 
                      name={`units.${index}.pricingUnit`} 
                      options={SELECT_OPTIONS.primaryUnit}
                      errors={errors}
                    />
                    <SelectCell 
                      control={control} 
                      name={`units.${index}.secondaryUnit`} 
                      options={SELECT_OPTIONS.primaryUnit}
                      errors={errors}
                    />
                  </TableRow>
                ))}
              </tbody>
            </TableWrapper>
          )}

          {activeChildTab === "inventory" && (
            <TableWrapper>
              <TableHead headers={["#", "Manufactured / Bought Out *", "Default Location", "Alternate Location", "Lead Time", "Reorder Level", "Rack No", "Row No", "Position", "Min Order Qty", "Max Order Qty", "Bin Size", "Bin Qty", "Action"]} />
              <tbody>
                {tabConfig.inventory.fields.map((field, index) => (
                  <TableRow key={field.id} index={index} onRemove={() => handleRemove("inventory", index)} disabled={tabConfig.inventory.fields.length <= 1}>
                    <SelectCell 
                      control={control} 
                      name={`inventory.${index}.manufactured`} 
                      options={SELECT_OPTIONS.manufactured} 
                      required 
                      errors={errors}
                    />
                    <SelectCell 
                      control={control} 
                      name={`inventory.${index}.defaultLocation`} 
                      options={SELECT_OPTIONS.location}
                      errors={errors}
                    />
                    <SelectCell 
                      control={control} 
                      name={`inventory.${index}.alternateLocation`} 
                      options={SELECT_OPTIONS.location}
                      errors={errors}
                    />
                    <InputCell 
                      control={control} 
                      name={`inventory.${index}.leadTime`} 
                      type="number"
                      errors={errors}
                    />
                    <InputCell 
                      control={control} 
                      name={`inventory.${index}.reorderLevel`} 
                      type="number"
                      errors={errors}
                    />
                    <InputCell 
                      control={control} 
                      name={`inventory.${index}.rackNo`}
                      errors={errors}
                    />
                    <InputCell 
                      control={control} 
                      name={`inventory.${index}.rowNo`}
                      errors={errors}
                    />
                    <InputCell 
                      control={control} 
                      name={`inventory.${index}.position`}
                      errors={errors}
                    />
                    <InputCell 
                      control={control} 
                      name={`inventory.${index}.minimumOrderQty`} 
                      type="number"
                      errors={errors}
                    />
                    <InputCell 
                      control={control} 
                      name={`inventory.${index}.maximumOrderQty`} 
                      type="number"
                      errors={errors}
                    />
                    <InputCell 
                      control={control} 
                      name={`inventory.${index}.binSize`}
                      errors={errors}
                    />
                    <InputCell 
                      control={control} 
                      name={`inventory.${index}.binQty`} 
                      type="number"
                      errors={errors}
                    />
                  </TableRow>
                ))}
              </tbody>
            </TableWrapper>
          )}

          {activeChildTab === "purchase" && (
            <TableWrapper>
              <TableHead headers={["#", "Default Supplier", "Lead Time 1", "Alternate Supplier", "Lead Time 2", "Purchase Tolerance %", "Rate", "Date", "Landed Cost Rate", "Branch", "Tool Owner", "Tool No", "Action"]} />
              <tbody>
                {tabConfig.purchase.fields.map((field, index) => (
                  <TableRow key={field.id} index={index} onRemove={() => handleRemove("purchase", index)} disabled={tabConfig.purchase.fields.length <= 1}>
                    <SelectCell 
                      control={control} 
                      name={`purchase.${index}.defaultSupplier`} 
                      options={SELECT_OPTIONS.supplier}
                      errors={errors}
                    />
                    <InputCell 
                      control={control} 
                      name={`purchase.${index}.leadTime1`} 
                      type="number"
                      errors={errors}
                    />
                    <SelectCell 
                      control={control} 
                      name={`purchase.${index}.alternateSupplier`} 
                      options={SELECT_OPTIONS.supplier}
                      errors={errors}
                    />
                    <InputCell 
                      control={control} 
                      name={`purchase.${index}.leadTime2`} 
                      type="number"
                      errors={errors}
                    />
                    <InputCell 
                      control={control} 
                      name={`purchase.${index}.purchaseTolerance`} 
                      type="number" 
                      step="0.01"
                      errors={errors}
                    />
                    <InputCell 
                      control={control} 
                      name={`purchase.${index}.rate`} 
                      type="number" 
                      step="0.01"
                      errors={errors}
                    />
                    <InputCell 
                      control={control} 
                      name={`purchase.${index}.date`} 
                      type="date"
                      errors={errors}
                    />
                    <InputCell 
                      control={control} 
                      name={`purchase.${index}.landedCostRate`} 
                      type="number" 
                      step="0.01"
                      errors={errors}
                    />
                    <SelectCell 
                      control={control} 
                      name={`purchase.${index}.branch`} 
                      options={SELECT_OPTIONS.branch}
                      errors={errors}
                    />
                    <InputCell 
                      control={control} 
                      name={`purchase.${index}.toolOwner`}
                      errors={errors}
                    />
                    <InputCell 
                      control={control} 
                      name={`purchase.${index}.toolNo`}
                      errors={errors}
                    />
                  </TableRow>
                ))}
              </tbody>
            </TableWrapper>
          )}

          {activeChildTab === "sales" && (
            <TableWrapper>
              <TableHead headers={["#", "Cost Rate", "Item Blocked For Invoicing ? *", "Minimum Selling Price", "Sales Account", "Lead Time To Despatch (Days)", "Customer Part No *", "Action"]} />
              <tbody>
                {tabConfig.sales.fields.map((field, index) => (
                  <TableRow key={field.id} index={index} onRemove={() => handleRemove("sales", index)} disabled={tabConfig.sales.fields.length <= 1}>
                    <InputCell 
                      control={control} 
                      name={`sales.${index}.costRate`} 
                      type="number" 
                      step="0.01"
                      errors={errors}
                    />
                    <SelectCell 
                      control={control} 
                      name={`sales.${index}.itemBlockedForInvoicing`} 
                      options={SELECT_OPTIONS.yesNo} 
                      required 
                      errors={errors}
                    />
                    <InputCell 
                      control={control} 
                      name={`sales.${index}.minimumSellingPrice`} 
                      type="number" 
                      step="0.01"
                      errors={errors}
                    />
                    <SelectCell 
                      control={control} 
                      name={`sales.${index}.salesAccount`} 
                      options={SELECT_OPTIONS.salesAccount}
                      errors={errors}
                    />
                    <InputCell 
                      control={control} 
                      name={`sales.${index}.leadTime`} 
                      type="number"
                      errors={errors}
                    />
                    <InputCell 
                      control={control} 
                      name={`sales.${index}.customerPartNo`} 
                      required 
                      errors={errors}
                    />
                  </TableRow>
                ))}
              </tbody>
            </TableWrapper>
          )}

          {activeChildTab === "others" && (
            <TableWrapper>
              <TableHead headers={["#", "Supplier Part No", "Technical Specification", "Action"]} />
              <tbody>
                {tabConfig.others.fields.map((field, index) => (
                  <TableRow key={field.id} index={index} onRemove={() => handleRemove("others", index)} disabled={tabConfig.others.fields.length <= 1}>
                    <InputCell 
                      control={control} 
                      name={`others.${index}.supplierPartNo`} 
                      placeholder="Supplier Part No."
                      errors={errors}
                    />
                    <InputCell 
                      control={control} 
                      name={`others.${index}.technicalSpecification`} 
                      placeholder="Technical Specification"
                      errors={errors}
                    />
                  </TableRow>
                ))}
              </tbody>
            </TableWrapper>
          )}

          {activeChildTab === "drawing" && (
            <TableWrapper>
              <TableHead headers={["#", "Attachment", "Action"]} />
              <tbody>
                {tabConfig.drawing.fields.map((field, index) => (
                  <TableRow key={field.id} index={index} onRemove={() => handleRemove("drawing", index)} disabled={tabConfig.drawing.fields.length <= 1}>
                    <td className="p-1">
                      <Controller
                        name={`drawing.${index}.attchement`}
                        control={control}
                        render={({ field: { onChange } }) => (
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.gif,.webp,.bmp,.svg,.zip,.rar,.txt"
                            className={`${controlClasses} h-9 text-xs file:mr-3 file:px-3 file:py-1 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700`}
                            onChange={(e) => onChange(e.target.files?.[0] || null)}
                          />
                        )}
                      />
                    </td>
                  </TableRow>
                ))}
              </tbody>
            </TableWrapper>
          )}
        </section>

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onBack} disabled={isSubmitting} className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
            <X className="h-3 w-3" /> Cancel
          </button>
          <button onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
            <Save className="h-3 w-3" /> {isSubmitting ? "Saving..." : data ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// TABLE HELPER COMPONENTS
// ============================================================================
const TableWrapper = ({ children }) => (
  <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
    <table className="w-full text-xs">{children}</table>
  </div>
);

const TableHead = ({ headers }) => (
  <thead className="bg-gray-100 dark:bg-gray-700">
    <tr>
      {headers.map((h, i) => (
        <th key={i} className={`p-1 ${i === 0 ? "w-8 text-center" : i === headers.length - 1 ? "w-20 text-left" : "text-left"} dark:text-white`}>
          {h}
        </th>
      ))}
    </tr>
  </thead>
);

const TableRow = ({ children, index, onRemove, disabled }) => (
  <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
    <td className="p-1 text-center font-medium dark:text-white">{index + 1}</td>
    {children}
    <td className="p-1 text-center">
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className={`h-7 w-7 rounded text-white flex items-center justify-center ${
          disabled ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
        }`}
      >
        <Trash2 size={14} />
      </button>
    </td>
  </tr>
);

const SelectCell = ({ control, name, options, required, errors }) => {
  const getError = () => {
    const parts = name.split('.');
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
          <select {...field} className={`${controlClasses} h-8 text-xs ${errorMessage ? 'border-red-500 focus:border-red-500' : ''}`}>
            <option value="">Select</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
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

const InputCell = ({ control, name, type = "text", step, placeholder, required, errors }) => {
  const getError = () => {
    const parts = name.split('.');
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
          <input 
            {...field} 
            type={type} 
            step={step} 
            className={`${controlClasses} h-8 text-xs ${errorMessage ? 'border-red-500 focus:border-red-500' : ''}`} 
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

export default ItemMasterForm;
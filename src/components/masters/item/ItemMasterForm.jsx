import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import listOfValuesAPI from "../../../api/listOfValuesAPI";
import itemGradeAPI from "../../../api/itemGradeAPI";
import unitMasterAPI from "../../../api/unitAPI";
import hsnSacAPI from "../../../api/hsnSacAPI";
import itemAPI from "../../../api/itemAPI";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const labelClasses = "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const getDefaultValues = () => ({
  id: 0,
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
  stock: "",
  protoType: "",
  psw: "",
  qcApproval: "",
  excisableItem: "",
  sellifePart: "",
  grn: "",
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
  yesNo: [
    { value: "Yes", label: "Yes" },
    { value: "No", label: "No" },
  ],

  groupItem: [
    { value: "Group", label: "Group" },
    { value: "Item", label: "Item" },
  ],

  abcGrade: [
    { value: "A", label: "A" },
    { value: "B", label: "B" },
    { value: "C", label: "C" },
  ],

  importLocal: [
    { value: "Import", label: "Import" },
    { value: "Local", label: "Local" }
  ],
};

const SelectField = ({ control, name, label, options = [], required, errors }) => (
  <div>
    <label className={labelClasses}>
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>

    <Controller
      name={name}
      control={control}
      rules={required ? { required: `${label} is required` } : undefined}
      render={({ field }) => (
        <select {...field} className={controlClasses}>
          <option value="">Select</option>

          {options.map(option => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
      )}
    />

    {!name.includes(".") && errors?.[name] && (
      <p className="text-red-500 text-[11px]">
        {errors[name].message}
      </p>
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

const ItemMasterForm = ({ data, onBack }) => {
  const [orgId] = useState(localStorage.getItem("orgId"));
  const [branch] = useState(localStorage.getItem("branchId"));
  const [finYear] = useState(localStorage.getItem("finYear"));
  const [activeChildTab, setActiveChildTab] = useState("unit");
  const [itemGroupOptions, setItemGroupOptions] = useState([]);
  const [gradeData, setGradeData] = useState([]);
  const [unitData, setUnitData] = useState([]);
  const [hsnData, setHsnData] = useState([]);
  const [listOfValuesData, setListOfValuesData] = useState({});
  const [toastMessage, setToastMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, formState: { errors }, reset } = useForm({
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

  const ListOfValues_GROUPS = {
    itemGroup: "Item Group",
    capitalInput: "CAPITAL/INPUT",
    itemType: "ITEM TYPE",
    tariffNo: "EXCISE TARIFF NO",
    inspection: "INSPECTION",
  };

  // Load data on mount
  useEffect(() => {
    loadListOfValuesData();
    loadGradeData();
    loadUnitData();
    loadHsnData();
  }, []);
  
  useEffect(() => {
    if (data && data.id) {
      fetchItemData(data.id);
    }
  }, [data]);
  
  const fetchItemData = async (id) => {
    setIsLoading(true);
    try {
      const itemData = await itemAPI.getItemById(id);
      if (itemData) {
        console.log("Fetched item data:", itemData);
        const formData = mapApiResponseToForm(itemData);
        reset(formData);
      } else {
        setToastMessage({
          type: "error",
          message: "Item data not found"
        });
      }
    } catch (error) {
      console.error("Error fetching item data:", error);
      setToastMessage({
        type: "error",
        message: "Failed to load item data for editing"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const mapApiResponseToForm = (apiData) => {
    return {
      // Basic Info
      id: apiData.id || 0,
      itemGroup: apiData.itemGroups?.id || "",
      capitalInput: apiData.capitalOrInputs?.id || "",
      itemType: apiData.itemTypes?.id || "",
      groupItem: apiData.groupItem || "",
      grade: apiData.listOfGrades?.id || "",
      itemCode: apiData.itemCode || "",
      tariffNo: apiData.exciseTariffNos?.id || "",
      itemDescription: apiData.itemDescription || "",
      thickness: apiData.thickness || 0,
      width: apiData.width || 0,
      length: apiData.length || 0,
      weight: apiData.weight || 0,
      primaryUnit: apiData.primaryUnits?.id || "",
      inspection: apiData.inspections?.id || "",
      abcGrade: apiData.abcGrade || "",
      drawingNo: apiData.drawingNo || "",
      lotSize: apiData.lotSize || 0,
      importLocal: apiData.importOrLocal || "",
      safetyStock: parseInt(apiData.saftyStockMsl) || 0,
      rawMaterialMake: apiData.rawMaterialsMake || "",
      hsnCode: apiData.itemHsn?.id || "",
      stock: apiData.stock || "",
      excisableItem: apiData.excisbleItem || "",
      excisbleItem: apiData.excisableItem || "",
      protoType: apiData.prototype || "",
      psw: apiData.psw || "",
      qcApproval: apiData.needQcApproval || "",
      excisableItem: apiData.isExciseItem || "",
      sellifePart: apiData.shelfLifePart || "",
      grn: apiData.isGrnRequired || "",
      active: apiData.active !== undefined ? (apiData.active ? "Yes" : "No") : "Yes",

      // Units - Map from API objects to form structure
      units: [{
        purchaseUnit: apiData.purchaseUnit?.id || "",
        sellingUnit: apiData.sellingUnit?.id || "",
        pricingUnit: apiData.pricingUnit?.id || "",
        secondaryUnit: apiData.secondaryUnit?.id || "",
      }],

      // Inventory
      inventory: [{
        manufactured: apiData.manufacturedOrBoughtout || "",
        defaultLocation: apiData.locationDefalutReponse?.id || "",
        alternateLocation: apiData.locationAlterReponse?.id || "",
        leadTime: apiData.leadTime || 0,
        reorderLevel: parseInt(apiData.reorderLevel) || 0,
        rackNo: apiData.rackNo || "",
        rowNo: apiData.rowNo || "",
        position: apiData.position || "",
        minimumOrderQty: apiData.minimumOrderQty || 0,
        maximumOrderQty: apiData.maximumOrderQty || 0,
        binSize: apiData.binSize || 0,
        binQty: apiData.binQty || 0,
      }],

      // Purchase
      purchase: [{
        defaultSupplier: apiData.defaultSupplier || "",
        leadTime1: 0, // Not in API response
        alternateSupplier: apiData.alternativeSupplier || "",
        leadTime2: 0, // Not in API response
        purchaseTolerance: parseFloat(apiData.pruchaseTalerance) || 0,
        rate: apiData.rate || 0,
        date: apiData.date || "",
        landedCostRate: parseFloat(apiData.landedCostRate) || 0,
        branch: apiData.branch?.branchName || "",
        toolOwner: apiData.toolOwner || "",
        toolNo: apiData.toolNo || "",
      }],

      // Sales
      slaes: [{
        costRate: apiData.costRate || 0,
        itemBlockedForInvoicing: apiData.isItemBlockedForInvoicing || "",
        minimumSellingPrice: apiData.minSellPrice || 0,
        salesAccount: apiData.salesAccount?.toString() || "",
        leadTime: parseInt(apiData.leadTimeToDispatch) || 0,
        customerPartNo: apiData.customerPartNo || "",
      }],

      // Others
      others: [{
        supplierPartNo: apiData.supplierPartNo || "",
        technicalSpecification: apiData.techSpec || "",
      }],

      // Drawing attachments (if any)
      drawing: apiData.itemDrawingDTO?.length > 0
        ? apiData.itemDrawingDTO.map(drawing => ({ attchement: drawing }))
        : [{ attchement: null }],
    };
  };

  const loadListOfValuesData = async () => {
    try {
      const result = {};

      await Promise.all(
        Object.entries(ListOfValues_GROUPS).map(async ([key, group]) => {
          try {
            const response = await listOfValuesAPI.getListValuesGroup(group, orgId);

            result[key] = Array.isArray(response)
              ? response.map(item => ({
                value: item.id,
                label: item.valuesDescription,
                ...item,
              }))
              : [];
          } catch (err) {
            console.error(`${group} failed`, err);
            result[key] = [];
          }
        })
      );

      setListOfValuesData(result);
    } catch (err) {
      console.error(err);
    }
  };

  const loadGradeData = useCallback(async () => {
    try {
      const response = await itemGradeAPI.getAll(orgId, branch);
      const options = (response || []).map(item => ({
        value: item.id,
        label: item.gradeDescription,
      }));
      setGradeData(options);
    } catch (error) {
      console.error("Failed to load item grades:", error);
      setGradeData([]);
    }
  }, [orgId, branch]);

  const loadUnitData = useCallback(async () => {
    try {
      const response = await unitMasterAPI.getUnits(branch, orgId);
      const options = (response || []).map(item => ({
        value: item.id,
        label: item.unitId,
      }));
      setUnitData(options);
    } catch (error) {
      console.error("Failed to load item units:", error);
      setUnitData([]);
    }
  }, [orgId, branch]);

  const loadHsnData = useCallback(async () => {
    try {
      const response = await hsnSacAPI.getAll(orgId, branch);
      const options = (response || []).map(item => ({
        value: item.id,
        label: item.hsn,
      }));
      setHsnData(options);
    } catch (error) {
      console.error("Failed to load HSN data:", error);
      setHsnData([]);
    }
  }, [orgId, branch]);

  const onSubmit = async (formData) => {
    setIsSubmitting(true);
    setToastMessage(null);

    try {
      console.log("Form Data:", formData);

      // Build the payload
      const payload = buildPayload(formData);

      console.log("Sending payload:", payload);

      const response = await itemAPI.createUpdateItem(payload);

      console.log("API Response:", response);

      if (response?.status === true) {
        setToastMessage({
          type: "success",
          message: data?.id ? "Item Updated Successfully!" : "Item Saved Successfully!"
        });

        // Close the form after short delay
        setTimeout(() => {
          onBack();
        }, 1500);
      } else {
        setToastMessage({
          type: "error",
          message: response?.message || "Failed to save item"
        });
      }
    } catch (error) {
      console.error("Error saving item:", error);
      setToastMessage({
        type: "error",
        message: error.message || "Error saving item"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const buildPayload = (formData) => {
    // Get the first row of each tab for the main payload
    const unitData = formData.units && formData.units.length > 0 ? formData.units[0] : {};
    const inventoryData = formData.inventory && formData.inventory.length > 0 ? formData.inventory[0] : {};
    const purchaseData = formData.purchase && formData.purchase.length > 0 ? formData.purchase[0] : {};
    const salesData = formData.slaes && formData.slaes.length > 0 ? formData.slaes[0] : {};
    const othersData = formData.others && formData.others.length > 0 ? formData.others[0] : {};

    const payload = {
      ...(formData.id && formData.id !== 0 ? { id: formData.id } : {}),

      abcGrade: formData.abcGrade || "",
      active: true,
      alternativeLocationId: inventoryData.alternateLocation ? Number(inventoryData.alternateLocation) : 0,
      alternativeSupplierId: purchaseData.alternateSupplier ? Number(purchaseData.alternateSupplier) : 0,
      binQty: Number(inventoryData.binQty) || 0,
      binSize: Number(inventoryData.binSize) || 0,
      branchId: Number(branch),
      cancel: true,
      cancelRemarks: "",
      capitalOrInput: Number(formData.capitalInput) || "",
      capitalOrInputId: Number(formData.capitalInput) || 0,
      costRate: Number(salesData.costRate) || 0,
      createdBy: localStorage.getItem("userName") || "",
      customerPartNo: salesData.customerPartNo || "",
      date: purchaseData.date || "",
      defaultLocationId: inventoryData.defaultLocation ? Number(inventoryData.defaultLocation) : 0,
      defaultSupplierId: purchaseData.defaultSupplier ? Number(purchaseData.defaultSupplier) : 0,
      drawingNo: formData.drawingNo || "",
      excisbleItem: formData.excisableItem !== undefined ? String(formData.excisableItem) : "",
      shelfLifePart: formData.sellifePart !== undefined ? String(formData.sellifePart) : "",
      exciseTariffNoId: formData.tariffNo ? Number(formData.tariffNo) : 0,
      financialYear: finYear,
      gradeId: formData.grade ? Number(formData.grade) : 0,
      groupItem: formData.groupItem || "",
      hsnId: formData.hsnCode ? Number(formData.hsnCode) : 0,
      importOrLocal: formData.importLocal || "",
      inspection: formData.inspection || "",
      inspectionId: Number(formData.inspection) || 0,
      isGrnRequired: formData.grn !== undefined ? String(formData.grn) : "",
      isItemBlockedForInvoicing: salesData.itemBlockedForInvoicing !== undefined ? String(salesData.itemBlockedForInvoicing) : "",
      isShelfLifePart: formData.sellifePart !== undefined ? String(formData.sellifePart) : "",
      stock: formData.stock !== undefined ? String(formData.stock) : "",
      isStock: formData.stock !== undefined ? String(formData.stock) : "",
      itemCode: formData.itemCode || "",
      itemDescription: formData.itemDescription || "",
      itemGroupId: formData.itemGroup ? Number(formData.itemGroup) : 0,
      itemTypeId: formData.itemType ? Number(formData.itemType) : 0,
      landedCostRate: String(purchaseData.landedCostRate) || "0",
      leadTime: Number(inventoryData.leadTime) || 0,
      leadTimeToDispatch: String(salesData.leadTime) || "0",
      length: Number(formData.length) || 0,
      lotSize: Number(formData.lotSize) || 0,
      manufacturedOrBoughtout: inventoryData.manufactured || "",
      maxOrderQty: Number(inventoryData.maximumOrderQty) || 0,
      maximumOrderQty: Number(inventoryData.maximumOrderQty) || 0,
      minOrderQty: Number(inventoryData.minimumOrderQty) || 0,
      minSellPrice: Number(salesData.minimumSellingPrice) || 0,
      minimumOrderQty: Number(inventoryData.minimumOrderQty) || 0,
      needQcApproval: formData.qcApproval !== undefined ? String(formData.qcApproval) : "",
      orgId: Number(orgId),
      position: inventoryData.position || "",
      pricingUnitId: unitData.pricingUnit ? Number(unitData.pricingUnit) : 0,
      primaryUnitId: formData.primaryUnit ? Number(formData.primaryUnit) : 0,
      prototype: formData.protoType !== undefined ? String(formData.protoType) : "",
      pruchaseTalerance: String(purchaseData.purchaseTolerance) || "0",
      psw: formData.psw !== undefined ? String(formData.psw) : "",
      purchaseUnitId: unitData.purchaseUnit ? Number(unitData.purchaseUnit) : 0,
      rackNo: inventoryData.rackNo || "",
      rate: Number(purchaseData.rate) || 0,
      rawMaterialsMake: formData.rawMaterialMake || "",
      reorderLevel: String(inventoryData.reorderLevel) || "0",
      rowNo: inventoryData.rowNo || "",
      saftyStockMsl: String(formData.safetyStock) || "0",
      saleAmt: 0,
      salesAccount: Number(salesData.salesAccount) || 0,
      screenCode: "ITEM_MASTER",
      screenName: "Item Master",
      secondaryPurchaseUnit: unitData.secondaryUnit ? Number(unitData.secondaryUnit) : 0,
      secondaryUnitId: unitData.secondaryUnit ? Number(unitData.secondaryUnit) : 0,
      sellingUnitId: unitData.sellingUnit ? Number(unitData.sellingUnit) : 0,
      supplierPartNo: othersData.supplierPartNo || "",
      techSpec: othersData.technicalSpecification || "",
      thickness: Number(formData.thickness) || 0,
      toolNo: purchaseData.toolNo || "",
      toolOwner: purchaseData.toolOwner || "",
      updatedBy: localStorage.getItem("userName") || "",
      weight: Number(formData.weight) || 0,
      width: Number(formData.width) || 0,
    };

    // Clean up empty/undefined values
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined || payload[key] === null) {
        payload[key] = 0;
      }
    });

    // Remove id if it's 0 or undefined (for new items)
    if (!payload.id || payload.id === 0) {
      delete payload.id;
    }

    return payload;
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-2 max-w-7xl relative">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading item data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 max-w-7xl relative">
      {/* Toast Message */}
      {toastMessage && (
        <div className={`mb-3 p-3 rounded-lg ${toastMessage.type === "success"
          ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400"
          : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
          }`}>
          {toastMessage.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <button onClick={onBack} className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data?.id ? "Edit Item" : "Add Item"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
        {/* Basic Details Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <SelectField control={control} name="itemGroup" label="Item Group" options={listOfValuesData.itemGroup || []} errors={errors} />
          <SelectField control={control} name="capitalInput" label="Capital / Input" options={listOfValuesData.capitalInput} required errors={errors} />
          <SelectField control={control} name="itemType" label="Item Type" options={listOfValuesData.itemType} errors={errors} />
          <SelectField control={control} name="groupItem" label="Group Item" options={SELECT_OPTIONS.groupItem} required errors={errors} />
          <SelectField control={control} name="grade" label="Grade" options={gradeData} required errors={errors} />

          <InputField control={control} name="itemCode" label="Item Code" required placeholder="Enter Item Code" errors={errors} />
          <SelectField control={control} name="tariffNo" label="Excise Tariff No" options={listOfValuesData.tariffNo} required errors={errors} />
          <InputField control={control} name="itemDescription" label="Item Description" required placeholder="Enter Item Description" errors={errors} />

          <InputField control={control} name="thickness" label="Thickness" type="number" errors={errors} />
          <InputField control={control} name="width" label="Width" type="number" errors={errors} />
          <InputField control={control} name="length" label="Length" type="number" errors={errors} />
          <InputField control={control} name="weight" label="Weight (Kgs)" type="number" errors={errors} />

          <SelectField control={control} name="primaryUnit" label="Primary Unit" options={unitData} errors={errors} />
          <SelectField control={control} name="inspection" label="Inspection" options={listOfValuesData.inspection} required errors={errors} />
          <SelectField control={control} name="abcGrade" label="ABC Grade" options={SELECT_OPTIONS.abcGrade} required errors={errors} />
          <InputField control={control} name="drawingNo" label="Drawing No" required placeholder="Enter Drawing No" errors={errors} />

          <InputField control={control} name="lotSize" label="Lot Size" type="number" errors={errors} />

          {/* Yes/No Select Fields */}
          <SelectField control={control} name="stock" label="Stock" options={SELECT_OPTIONS.yesNo} errors={errors} />
          <SelectField control={control} name="protoType" label="Prototype" options={SELECT_OPTIONS.yesNo} errors={errors} />
          <SelectField control={control} name="psw" label="PSW" options={SELECT_OPTIONS.yesNo} errors={errors} />
          <SelectField control={control} name="qcApproval" label="Need QC Approval" options={SELECT_OPTIONS.yesNo} errors={errors} />
          <SelectField control={control} name="excisableItem" label="Excisable Item" options={SELECT_OPTIONS.yesNo} errors={errors} />
          <SelectField control={control} name="sellifePart" label="Shelf life Part" options={SELECT_OPTIONS.yesNo} errors={errors} />
          <SelectField control={control} name="grn" label="GRN Required?" options={SELECT_OPTIONS.yesNo} errors={errors} />

          <SelectField control={control} name="importLocal" label="Import / Local" options={SELECT_OPTIONS.importLocal} required errors={errors} />
          <InputField control={control} name="safetyStock" label="Safety Stock/MSL" type="number" errors={errors} />
          <InputField control={control} name="rawMaterialMake" label="Raw Materials Make" required placeholder="Enter Raw Material Make" errors={errors} />
          <SelectField control={control} name="hsnCode" label="HSN_SAC_Code" options={hsnData} required errors={errors} />

          <SelectField control={control} name="active" label="Active" options={SELECT_OPTIONS.yesNo} errors={errors} />
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
                  className={`px-4 py-1 text-xs font-semibold rounded-t capitalize ${activeChildTab === tab ? "bg-blue-600 text-white" : "text-gray-600 dark:text-gray-300"
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

          {/* Tab Content */}
          {activeChildTab === "unit" && (
            <TableWrapper>
              <TableHead headers={["#", "Purchase Unit", "Selling Unit", "Pricing Unit", "Secondary Unit", "Action"]} />
              <tbody>
                {tabConfig.unit.fields.map((field, index) => (
                  <TableRow key={field.id} index={index} onRemove={() => handleRemove("unit", index)} disabled={tabConfig.unit.fields.length <= 1}>
                    <SelectCell
                      control={control}
                      name={`units.${index}.purchaseUnit`}
                      options={unitData}
                      errors={errors}
                    />
                    <SelectCell
                      control={control}
                      name={`units.${index}.sellingUnit`}
                      options={unitData}
                      errors={errors}
                    />
                    <SelectCell
                      control={control}
                      name={`units.${index}.pricingUnit`}
                      options={unitData}
                      errors={errors}
                    />
                    <SelectCell
                      control={control}
                      name={`units.${index}.secondaryUnit`}
                      options={unitData}
                      errors={errors}
                    />
                  </TableRow>
                ))}
              </tbody>
            </TableWrapper>
          )}

          {activeChildTab === "inventory" && (
            <TableWrapper>
              <TableHead headers={["#", "Manufactured / Bought Out", "Default Location", "Alternate Location", "Lead Time", "Reorder Level", "Rack No", "Row No", "Position", "Min Order Qty", "Max Order Qty", "Bin Size", "Bin Qty", "Action"]} />
              <tbody>
                {tabConfig.inventory.fields.map((field, index) => (
                  <TableRow key={field.id} index={index} onRemove={() => handleRemove("inventory", index)} disabled={tabConfig.inventory.fields.length <= 1}>
                    <InputCell
                      control={control}
                      name={`inventory.${index}.manufactured`}
                      placeholder="Manufactured/Bought Out"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`inventory.${index}.defaultLocation`}
                      placeholder="Default Location"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`inventory.${index}.alternateLocation`}
                      placeholder="Alternate Location"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`inventory.${index}.leadTime`}
                      type="number"
                      placeholder="Lead Time"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`inventory.${index}.reorderLevel`}
                      type="number"
                      placeholder="Reorder Level"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`inventory.${index}.rackNo`}
                      placeholder="Rack No"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`inventory.${index}.rowNo`}
                      placeholder="Row No"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`inventory.${index}.position`}
                      placeholder="Position"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`inventory.${index}.minimumOrderQty`}
                      type="number"
                      placeholder="Min Order Qty"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`inventory.${index}.maximumOrderQty`}
                      type="number"
                      placeholder="Max Order Qty"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`inventory.${index}.binSize`}
                      placeholder="Bin Size"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`inventory.${index}.binQty`}
                      type="number"
                      placeholder="Bin Qty"
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
                    <InputCell
                      control={control}
                      name={`purchase.${index}.defaultSupplier`}
                      placeholder="Default Supplier"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`purchase.${index}.leadTime1`}
                      type="number"
                      placeholder="Lead Time 1"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`purchase.${index}.alternateSupplier`}
                      placeholder="Alternate Supplier"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`purchase.${index}.leadTime2`}
                      type="number"
                      placeholder="Lead Time 2"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`purchase.${index}.purchaseTolerance`}
                      type="number"
                      step="0.01"
                      placeholder="Tolerance %"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`purchase.${index}.rate`}
                      type="number"
                      step="0.01"
                      placeholder="Rate"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`purchase.${index}.date`}
                      type="date"
                      placeholder="Date"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`purchase.${index}.landedCostRate`}
                      type="number"
                      step="0.01"
                      placeholder="Landed Cost Rate"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`purchase.${index}.branch`}
                      placeholder="Branch"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`purchase.${index}.toolOwner`}
                      placeholder="Tool Owner"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`purchase.${index}.toolNo`}
                      placeholder="Tool No"
                      errors={errors}
                    />
                  </TableRow>
                ))}
              </tbody>
            </TableWrapper>
          )}

          {activeChildTab === "sales" && (
            <TableWrapper>
              <TableHead headers={["#", "Cost Rate", "Item Blocked For Invoicing ? ", "Minimum Selling Price", "Sales Account", "Lead Time To Despatch (Days)", "Customer Part No ", "Action"]} />
              <tbody>
                {tabConfig.sales.fields.map((field, index) => (
                  <TableRow key={field.id} index={index} onRemove={() => handleRemove("sales", index)} disabled={tabConfig.sales.fields.length <= 1}>
                    <InputCell
                      control={control}
                      name={`slaes.${index}.costRate`}
                      type="number"
                      step="0.01"
                      placeholder="Cost Rate"
                      errors={errors}
                    />
                    <SelectCell
                      control={control}
                      name={`slaes.${index}.itemBlockedForInvoicing`}
                      options={SELECT_OPTIONS.yesNo}
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`slaes.${index}.minimumSellingPrice`}
                      type="number"
                      step="0.01"
                      placeholder="Min Selling Price"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`slaes.${index}.salesAccount`}
                      placeholder="Sales Account"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`slaes.${index}.leadTime`}
                      type="number"
                      placeholder="Lead Time"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`slaes.${index}.customerPartNo`}
                      placeholder="Customer Part No"
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
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <X className="h-3 w-3" /> Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-3 w-3" /> {isSubmitting ? "Saving..." : data?.id ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Table Helper Components
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
        className={`h-5 w-5 rounded text-white flex items-center justify-center ${disabled ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
          }`}
      >
        <Trash2 size={10} />
      </button>
    </td>
  </tr>
);

const SelectCell = ({ control, name, options = [], required, errors }) => {
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
            {(options || []).map((opt) => {
              if (typeof opt === 'string') {
                return <option key={opt} value={opt}>{opt}</option>;
              } else if (typeof opt === 'object' && opt !== null) {
                const value = opt.value ?? opt.id;
                const label = opt.label ?? opt.valuesDescription ?? opt.name;
                return (
                  <option key={value} value={value}>
                    {label}
                  </option>
                );
              }
              return null;
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
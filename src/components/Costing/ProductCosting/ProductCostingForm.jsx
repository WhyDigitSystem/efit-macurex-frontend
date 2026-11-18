import React, { useState } from "react";
import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const Field = ({
  label,
  name,
  value,
  onChange,
  error,
  required,
  type = "text",
  options = [],
  className = "",
  placeholder = "",
  disabled = false,
  step,
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
          value={value}
          onChange={onChange}
          className={`${controlClasses} ${error ? "border-red-500" : ""}`}
          disabled={disabled}
        >
          <option value="">-- Select --</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
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

  return (
    <div className={`w-full ${className}`}>
      <label className={labelClasses}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`${controlClasses} ${error ? "border-red-500" : ""}`}
        placeholder={placeholder}
        disabled={disabled}
        step={step}
      />
      {error && (
        <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
};

const fieldGrid =
  "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-2 items-start";

// Dummy data for dropdowns
const FG_ITEM_OPTIONS = [
  { value: "fg_001", label: "FG001" },
  { value: "fg_002", label: "FG002" },
  { value: "fg_003", label: "FG003" },
];

// Cost Rate Master - percentages fill the Product Cost Summary on selection
const COST_RATE_MASTER_OPTIONS = [
  {
    value: "crm_000001",
    label: "CRM-000001",
    commissionPct: "2.50",
    indirectProdPct: "8.00",
    adminPct: "5.00",
    distPct: "3.00",
    handlingPct: "1.50",
  },
  {
    value: "crm_000002",
    label: "CRM-000002",
    commissionPct: "3.00",
    indirectProdPct: "9.50",
    adminPct: "6.50",
    distPct: "3.50",
    handlingPct: "2.00",
  },
];

const MATERIAL_OPTIONS = [
  {
    value: "item_001",
    label: "ITEM001",
    description: "Steel Sheet 1.2mm",
    uom: "KG",
    grade: "IS 513 D",
    rate: "85.00",
  },
  {
    value: "item_002",
    label: "ITEM002",
    description: "Aluminium Strip",
    uom: "KG",
    grade: "6061-T6",
    rate: "240.00",
  },
  {
    value: "item_003",
    label: "ITEM003",
    description: "Copper Wire",
    uom: "MTR",
    grade: "ETP",
    rate: "32.00",
  },
  {
    value: "item_004",
    label: "ITEM004",
    description: "Fastener Set",
    uom: "NOS",
    grade: "8.8",
    rate: "12.00",
  },
];

const MACHINE_OPTIONS = [
  { value: "mc_001", label: "CNC Lathe 01" },
  { value: "mc_002", label: "Press 100T" },
  { value: "mc_003", label: "VMC 02" },
  { value: "mc_004", label: "Powder Coating Line" },
];

const OPERATION_OPTIONS = [
  { value: "turning", label: "Turning" },
  { value: "pressing", label: "Pressing" },
  { value: "milling", label: "Milling" },
  { value: "coating", label: "Coating" },
  { value: "assembly", label: "Assembly" },
];

const APPROVED_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const emptyMaterialRow = () => ({
  id: Date.now() + Math.random(),
  itemCode: "",
  itemDescription: "",
  qty: "",
  uom: "",
  grade: "",
  rate: "",
});

const emptyMachineRow = () => ({
  id: Date.now() + Math.random(),
  machineName: "",
  operation: "",
  mcCost: "",
  labourCost: "",
  toolCost: "",
  consumablesCost: "",
});

const num = (v) => parseFloat(v) || 0;
const fmt = (v) => v.toFixed(2);

const TABS = [
  { key: "directMaterial", label: "1-Direct Material Details" },
  { key: "machineCost", label: "2-Machine Cost Details" },
  { key: "costSummary", label: "3-Product Cost Summary" },
];

const ProductCostingForm = ({ data, onBack }) => {
  const [activeTab, setActiveTab] = useState("directMaterial");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    fgItemId: data?.fgItemId || "",
    prodCostNo: data?.prodCostNo || "",
    costRateMasterId: data?.costRateMasterId || "",
    date: data?.date || "",
    // Percentages - filled from the Cost Rate Master, editable afterwards
    commissionPct: data?.commissionPct || "",
    indirectProdPct: data?.indirectProdPct || "",
    adminPct: data?.adminPct || "",
    distPct: data?.distPct || "",
    handlingPct: data?.handlingPct || "",
    // Entered by hand
    indirectMaterial: data?.indirectMaterial || "",
    profitPct: data?.profitPct || "",
    approved: data?.approved || "",
  });

  const [materialRows, setMaterialRows] = useState([emptyMaterialRow()]);
  const [machineRows, setMachineRows] = useState([emptyMachineRow()]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    setForm((prev) => {
      const next = { ...prev, [name]: type === "checkbox" ? checked : value };

      // Cost Rate Master selection fills the percentages
      if (name === "costRateMasterId") {
        const crm = COST_RATE_MASTER_OPTIONS.find((c) => c.value === value);
        next.commissionPct = crm?.commissionPct || "";
        next.indirectProdPct = crm?.indirectProdPct || "";
        next.adminPct = crm?.adminPct || "";
        next.distPct = crm?.distPct || "";
        next.handlingPct = crm?.handlingPct || "";
      }

      return next;
    });
  };

  // Direct material rows
  const handleMaterialRowChange = (index, field, value) => {
    const updatedRows = [...materialRows];
    let row = { ...updatedRows[index], [field]: value };

    if (field === "itemCode") {
      const item = MATERIAL_OPTIONS.find((i) => i.value === value);
      row = {
        ...row,
        itemDescription: item?.description || "",
        uom: item?.uom || "",
        grade: item?.grade || "",
        rate: item?.rate || "",
      };
    }

    updatedRows[index] = row;
    setMaterialRows(updatedRows);
  };

  const handleAddMaterialRow = () =>
    setMaterialRows([...materialRows, emptyMaterialRow()]);
  const handleRemoveMaterialRow = (index) => {
    if (materialRows.length > 1)
      setMaterialRows(materialRows.filter((_, i) => i !== index));
  };

  const getAvailableItems = (currentIndex) => {
    const selected = materialRows
      .filter((_, i) => i !== currentIndex)
      .map((r) => r.itemCode);
    return MATERIAL_OPTIONS.filter((item) => !selected.includes(item.value));
  };

  // Machine rows
  const handleMachineRowChange = (index, field, value) => {
    const updatedRows = [...machineRows];
    updatedRows[index] = { ...updatedRows[index], [field]: value };
    setMachineRows(updatedRows);
  };

  const handleAddMachineRow = () =>
    setMachineRows([...machineRows, emptyMachineRow()]);
  const handleRemoveMachineRow = (index) => {
    if (machineRows.length > 1)
      setMachineRows(machineRows.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errors = {};
    if (!form.fgItemId) errors.fgItemId = "FG Item Id is required";
    if (!form.costRateMasterId)
      errors.costRateMasterId = "Cost Rate Master Id is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Row costs
  const materialCosts = materialRows.map((r) => num(r.qty) * num(r.rate));

  // Product cost summary (all derived from the two grids and the percentages)
  const directMaterial = materialCosts.reduce((s, c) => s + c, 0);
  const machineCost = machineRows.reduce((s, r) => s + num(r.mcCost), 0);
  const labourCost = machineRows.reduce((s, r) => s + num(r.labourCost), 0);
  const totalToolCost = machineRows.reduce((s, r) => s + num(r.toolCost), 0);
  const totalConsumablesCost = machineRows.reduce(
    (s, r) => s + num(r.consumablesCost),
    0,
  );
  const indirectMaterial = num(form.indirectMaterial);

  const indirectProductionCost =
    ((directMaterial + machineCost + labourCost) * num(form.indirectProdPct)) /
    100;
  const productionCost =
    directMaterial +
    indirectMaterial +
    machineCost +
    labourCost +
    totalToolCost +
    totalConsumablesCost +
    indirectProductionCost;

  const adminOverHeads = (productionCost * num(form.adminPct)) / 100;
  const distributionOverHeads = (productionCost * num(form.distPct)) / 100;
  const handlingCharges = (productionCost * num(form.handlingPct)) / 100;
  const costOfSale =
    productionCost + adminOverHeads + distributionOverHeads + handlingCharges;

  const commission = (costOfSale * num(form.commissionPct)) / 100;
  const profit = (costOfSale * num(form.profitPct)) / 100;
  const grossSellingPrice = costOfSale + commission + profit;

  const costRateLabel =
    COST_RATE_MASTER_OPTIONS.find((c) => c.value === form.costRateMasterId)
      ?.label || "";

  const handleSave = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    const payload = {
      ...form,
      materialRows: materialRows.map((r, i) => ({
        ...r,
        cost: fmt(materialCosts[i]),
      })),
      machineRows,
      summary: {
        directMaterial: fmt(directMaterial),
        machineCost: fmt(machineCost),
        manufacturingLabourCost: fmt(labourCost),
        indirectMaterial: fmt(indirectMaterial),
        indirectProductionCost: fmt(indirectProductionCost),
        totalToolCost: fmt(totalToolCost),
        totalConsumablesCost: fmt(totalConsumablesCost),
        productionCost: fmt(productionCost),
        adminOverHeads: fmt(adminOverHeads),
        distributionOverHeads: fmt(distributionOverHeads),
        handlingCharges: fmt(handlingCharges),
        costOfSale: fmt(costOfSale),
        commission: fmt(commission),
        profit: fmt(profit),
        grossSellingPrice: fmt(grossSellingPrice),
      },
    };
    console.log("Saving payload:", payload);

    setTimeout(() => {
      alert(
        data
          ? "Product Costing Updated Successfully!"
          : "Product Costing Saved Successfully!",
      );
      setIsSubmitting(false);
      onBack();
    }, 1000);
  };

  const tabButtonClass = (key) =>
    `px-4 py-1.5 text-xs font-semibold rounded-t transition-colors ${
      activeTab === key
        ? "bg-blue-600 text-white"
        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
    }`;

  const removeBtnClass = (disabled) =>
    `h-5 w-5 rounded text-white flex items-center justify-center transition-colors ${
      disabled
        ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
        : "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
    }`;

  const addBtnClass =
    "h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors";
  const sectionTitle =
    "text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400";
  const cellInput = `${controlClasses} h-8 text-xs w-full min-w-[90px]`;
  const th = "p-1 text-left dark:text-gray-200";
  const rowClass =
    "border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors";
  const noop = () => {};

  return (
    <div className="p-2 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data
            ? "Edit Product Costing/Pricing"
            : "Add Product Costing/Pricing"}
        </h2>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
        {/* Form Fields */}
        <div className={fieldGrid}>
          <Field
            type="select"
            label="FG Item Id"
            name="fgItemId"
            value={form.fgItemId}
            onChange={handleChange}
            error={fieldErrors.fgItemId}
            required
            options={FG_ITEM_OPTIONS}
          />
          <Field
            label="Prod. Cost No"
            name="prodCostNo"
            value={form.prodCostNo || "Auto"}
            onChange={handleChange}
            disabled
          />
          <Field
            type="select"
            label="Cost Rate Master Id"
            name="costRateMasterId"
            value={form.costRateMasterId}
            onChange={handleChange}
            error={fieldErrors.costRateMasterId}
            required
            options={COST_RATE_MASTER_OPTIONS.map(({ value, label }) => ({
              value,
              label,
            }))}
          />
          <Field
            type="date"
            label="Date"
            name="date"
            value={form.date}
            onChange={handleChange}
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-gray-200 dark:border-gray-700 mt-4">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={tabButtonClass(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 1 - Direct Material Details */}
        {activeTab === "directMaterial" && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className={sectionTitle}>Direct Material Details</h3>
              <button
                type="button"
                onClick={handleAddMaterialRow}
                className={addBtnClass}
              >
                <Plus size={12} />
              </button>
            </div>

            <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs min-w-[950px]">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="p-1 text-center w-10 dark:text-gray-200">
                      S.no
                    </th>
                    <th className={`${th} min-w-[130px]`}>Item Code *</th>
                    <th className={`${th} min-w-[200px]`}>Item Description</th>
                    <th className={`${th} min-w-[100px]`}>Qty</th>
                    <th className={`${th} min-w-[80px]`}>UOM</th>
                    <th className={`${th} min-w-[100px]`}>Grade</th>
                    <th className={`${th} min-w-[100px]`}>Rate</th>
                    <th className={`${th} min-w-[110px]`}>Cost</th>
                    <th className="p-1 text-center w-10 dark:text-gray-200">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {materialRows.map((row, index) => (
                    <tr key={row.id} className={rowClass}>
                      <td className="p-1 text-center font-medium dark:text-gray-300">
                        {index + 1}
                      </td>
                      <td className="p-1">
                        <select
                          value={row.itemCode}
                          onChange={(e) =>
                            handleMaterialRowChange(
                              index,
                              "itemCode",
                              e.target.value,
                            )
                          }
                          className={`${controlClasses} h-8 text-xs w-full min-w-[120px]`}
                        >
                          <option value="">Select</option>
                          {getAvailableItems(index).map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={row.itemDescription}
                          className={`${controlClasses} h-8 text-xs w-full min-w-[190px]`}
                          disabled
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          value={row.qty}
                          onChange={(e) =>
                            handleMaterialRowChange(
                              index,
                              "qty",
                              e.target.value,
                            )
                          }
                          className={cellInput}
                          placeholder="0.00"
                          step="0.01"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={row.uom}
                          className={`${controlClasses} h-8 text-xs w-full min-w-[70px]`}
                          disabled
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={row.grade}
                          className={cellInput}
                          disabled
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          value={row.rate}
                          onChange={(e) =>
                            handleMaterialRowChange(
                              index,
                              "rate",
                              e.target.value,
                            )
                          }
                          className={cellInput}
                          placeholder="0.00"
                          step="0.01"
                        />
                      </td>
                      <td className="p-1 pt-2 dark:text-gray-300 text-right font-medium">
                        {fmt(materialCosts[index])}
                      </td>
                      <td className="p-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveMaterialRow(index)}
                          disabled={materialRows.length <= 1}
                          className={removeBtnClass(materialRows.length <= 1)}
                        >
                          <Trash2 size={10} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-700/50">
                  <tr className="border-t border-gray-200 dark:border-gray-700">
                    <td
                      colSpan={7}
                      className="p-1 text-right font-semibold dark:text-gray-200"
                    >
                      Total Direct Material
                    </td>
                    <td className="p-1 text-right font-semibold dark:text-gray-200">
                      {fmt(directMaterial)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* 2 - Machine Cost Details */}
        {activeTab === "machineCost" && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className={sectionTitle}>Machine Cost Details</h3>
              <button
                type="button"
                onClick={handleAddMachineRow}
                className={addBtnClass}
              >
                <Plus size={12} />
              </button>
            </div>

            <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs min-w-[900px]">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="p-1 text-center w-10 dark:text-gray-200">
                      S.No
                    </th>
                    <th className={`${th} min-w-[170px]`}>Machine Name</th>
                    <th className={`${th} min-w-[140px]`}>Operation</th>
                    <th className={`${th} min-w-[110px]`}>M/C Cost</th>
                    <th className={`${th} min-w-[110px]`}>Labour Cost</th>
                    <th className={`${th} min-w-[110px]`}>Tool Cost</th>
                    <th className={`${th} min-w-[120px]`}>Consumables Cost</th>
                    <th className="p-1 text-center w-10 dark:text-gray-200">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {machineRows.map((row, index) => (
                    <tr key={row.id} className={rowClass}>
                      <td className="p-1 text-center font-medium dark:text-gray-300">
                        {index + 1}
                      </td>
                      <td className="p-1">
                        <select
                          value={row.machineName}
                          onChange={(e) =>
                            handleMachineRowChange(
                              index,
                              "machineName",
                              e.target.value,
                            )
                          }
                          className={`${controlClasses} h-8 text-xs w-full min-w-[160px]`}
                        >
                          <option value="">Select</option>
                          {MACHINE_OPTIONS.map((m) => (
                            <option key={m.value} value={m.value}>
                              {m.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-1">
                        <select
                          value={row.operation}
                          onChange={(e) =>
                            handleMachineRowChange(
                              index,
                              "operation",
                              e.target.value,
                            )
                          }
                          className={`${controlClasses} h-8 text-xs w-full min-w-[130px]`}
                        >
                          <option value="">Select</option>
                          {OPERATION_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      {[
                        "mcCost",
                        "labourCost",
                        "toolCost",
                        "consumablesCost",
                      ].map((field) => (
                        <td key={field} className="p-1">
                          <input
                            type="number"
                            value={row[field]}
                            onChange={(e) =>
                              handleMachineRowChange(
                                index,
                                field,
                                e.target.value,
                              )
                            }
                            className={cellInput}
                            placeholder="0.00"
                            step="0.01"
                          />
                        </td>
                      ))}
                      <td className="p-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveMachineRow(index)}
                          disabled={machineRows.length <= 1}
                          className={removeBtnClass(machineRows.length <= 1)}
                        >
                          <Trash2 size={10} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-700/50">
                  <tr className="border-t border-gray-200 dark:border-gray-700">
                    <td
                      colSpan={3}
                      className="p-1 text-right font-semibold dark:text-gray-200"
                    >
                      Totals
                    </td>
                    <td className="p-1 pl-3 font-semibold dark:text-gray-200">
                      {fmt(machineCost)}
                    </td>
                    <td className="p-1 pl-3 font-semibold dark:text-gray-200">
                      {fmt(labourCost)}
                    </td>
                    <td className="p-1 pl-3 font-semibold dark:text-gray-200">
                      {fmt(totalToolCost)}
                    </td>
                    <td className="p-1 pl-3 font-semibold dark:text-gray-200">
                      {fmt(totalConsumablesCost)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* 3 - Product Cost Summary */}
        {activeTab === "costSummary" && (
          <div className="mt-2 space-y-3">
            <div className={fieldGrid}>
              <Field
                label="Cost Rate"
                name="costRate"
                value={costRateLabel}
                onChange={noop}
                disabled
              />
              <Field
                label="Direct Material"
                name="directMaterial"
                value={fmt(directMaterial)}
                onChange={noop}
                disabled
              />
              <Field
                label="Indirect Material"
                name="indirectMaterial"
                type="number"
                step="0.01"
                value={form.indirectMaterial}
                onChange={handleChange}
                placeholder="0.00"
              />
              <Field
                label="Machine Cost"
                name="machineCost"
                value={fmt(machineCost)}
                onChange={noop}
                disabled
              />

              <Field
                label="Manufacturing Labour cost"
                name="labourCost"
                value={fmt(labourCost)}
                onChange={noop}
                disabled
              />
              <Field
                label="Total Tool Cost"
                name="totalToolCost"
                value={fmt(totalToolCost)}
                onChange={noop}
                disabled
              />
              <Field
                label="Total Consumables Cost"
                name="totalConsumablesCost"
                value={fmt(totalConsumablesCost)}
                onChange={noop}
                disabled
              />
              <Field
                label="Indirect Production Cost %"
                name="indirectProdPct"
                type="number"
                step="0.01"
                value={form.indirectProdPct}
                onChange={handleChange}
                placeholder="0.00"
              />

              <Field
                label="Indirect Production Cost"
                name="indirectProductionCost"
                value={fmt(indirectProductionCost)}
                onChange={noop}
                disabled
              />
              <Field
                label="Production Cost"
                name="productionCost"
                value={fmt(productionCost)}
                onChange={noop}
                disabled
              />
              <Field
                label="Admin. Over Head %"
                name="adminPct"
                type="number"
                step="0.01"
                value={form.adminPct}
                onChange={handleChange}
                placeholder="0.00"
              />
              <Field
                label="Admin. Over Heads"
                name="adminOverHeads"
                value={fmt(adminOverHeads)}
                onChange={noop}
                disabled
              />

              <Field
                label="Distribution Over Head %"
                name="distPct"
                type="number"
                step="0.01"
                value={form.distPct}
                onChange={handleChange}
                placeholder="0.00"
              />
              <Field
                label="Distribution Over Heads"
                name="distributionOverHeads"
                value={fmt(distributionOverHeads)}
                onChange={noop}
                disabled
              />
              <Field
                label="Handling Charges %"
                name="handlingPct"
                type="number"
                step="0.01"
                value={form.handlingPct}
                onChange={handleChange}
                placeholder="0.00"
              />
              <Field
                label="Handling Charges"
                name="handlingCharges"
                value={fmt(handlingCharges)}
                onChange={noop}
                disabled
              />

              <Field
                label="Cost Of Sale"
                name="costOfSale"
                value={fmt(costOfSale)}
                onChange={noop}
                disabled
              />
              <Field
                label="Commission %"
                name="commissionPct"
                type="number"
                step="0.01"
                value={form.commissionPct}
                onChange={handleChange}
                placeholder="0.00"
              />
              <Field
                label="Commission"
                name="commission"
                value={fmt(commission)}
                onChange={noop}
                disabled
              />
              <Field
                label="Profit %"
                name="profitPct"
                type="number"
                step="0.01"
                value={form.profitPct}
                onChange={handleChange}
                placeholder="0.00"
              />

              <Field
                label="Profit"
                name="profit"
                value={fmt(profit)}
                onChange={noop}
                disabled
              />
              <Field
                label="Gross Selling Price"
                name="grossSellingPrice"
                value={fmt(grossSellingPrice)}
                onChange={noop}
                disabled
              />
              <Field
                type="select"
                label="Approved"
                name="approved"
                value={form.approved}
                onChange={handleChange}
                options={APPROVED_OPTIONS}
              />
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <X className="h-3 w-3" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-3 w-3" />
            {isSubmitting ? "Saving..." : data ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCostingForm;

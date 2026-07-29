import { ArrowLeft, Save, X, Plus, Trash2, UploadCloud } from "lucide-react";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import importGRNAPI from "../../../api/Inventory/importGRNAPI";
import { useToast } from "../../Toast/ToastContext";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const labelClasses = "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid = "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-2 items-start";

const SectionHeader = ({ children }) => (
  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
    {children}
  </h3>
);

const ToggleButton = ({ value, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className={`relative flex items-center w-12 h-6 rounded-full transition-colors ${
      value ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
    }`}
  >
    <span className={`absolute h-5 w-5 bg-white rounded-full shadow transition-transform ${
      value ? "translate-x-6" : "translate-x-0.5"
    }`} />
  </button>
);

const PLANT_OPTIONS = ["Plant 1", "Plant 2", "Plant 3"];
const BELONGS_TO_OPTIONS = ["Own", "Third Party"];
const LOCATION_OPTIONS = ["Warehouse A", "Warehouse B", "Warehouse C"];

const ImportGRNForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId")) || 0;
  const branch = Number(localStorage.getItem("branchId")) || 1000000001;

  const [activeTab, setActiveTab] = useState("items");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [rowErrors, setRowErrors] = useState({});

  const [form, setForm] = useState({
    plantId: data?.plantId || "",
    belongsTo: data?.belongsTo || "",
    docId: data?.docId || "GRN" + String(Date.now()).slice(-6),
    docDate: data?.docDate || dayjs().format("YYYY-MM-DD"),
    supplierId: data?.supplierId || "",
    supplierName: data?.supplierName || "",
    shipmentNo: data?.shipmentNo || "",
    shipmentDate: data?.shipmentDate || "",
    blNo: data?.blNo || "",
    blDate: data?.blDate || "",
    gatePassNo: data?.gatePassNo || "",
    transporter: data?.transporter || "",
    poNo: data?.poNo || "",
    forwarderName: data?.forwarderName || "",
    poDate: data?.poDate || "",
    vehicleNo: data?.vehicleNo || "",
    totalPackages: data?.totalPackages || "",
    totalGrossWeight: data?.totalGrossWeight || "",
    invoiceNo: data?.invoiceNo || "",
    invoiceDate: data?.invoiceDate || "",
    grnTime: data?.grnTime || dayjs().format("HH:mm"),
    poCurrency: data?.poCurrency || "",
    lrNo: data?.lrNo || "",
    poExchangeRate: data?.poExchangeRate || "",
    locationId: data?.locationId || "",
    active: data?.active === "Active" || data?.active !== false,
    id: data?.id || 0,
  });

  const [items, setItems] = useState(
    data?.grnItems || [
      { id: Date.now() + Math.random(), itemCode: "", description: "", poQty: "", receivedQty: "", fobValue: "", customsDuty: "", freight: "", landingValue: "", inventoryCost: "" },
    ]
  );

  const [invoices, setInvoices] = useState(
    data?.grnAttachments || []
  );

  const [summary, setSummary] = useState({
    totalFobValue: data?.totalFobValue || "",
    totalCustomsDuty: data?.totalCustomsDuty || "",
    totalFreight: data?.totalFreight || "",
    totalLandingValue: data?.totalLandingValue || "",
    totalInventoryCost: data?.totalInventoryCost || "",
    receivedBy: data?.receivedBy || "",
    qualityCheckBy: data?.qualityCheckBy || "",
    remarks: data?.remarks || "",
  });

  useEffect(() => {
    const itemFob = items.reduce((s, r) => s + (parseFloat(r.fobValue) || 0), 0);
    const itemCustoms = items.reduce((s, r) => s + (parseFloat(r.customsDuty) || 0), 0);
    const itemFreight = items.reduce((s, r) => s + (parseFloat(r.freight) || 0), 0);
    setSummary((prev) => ({
      ...prev,
      totalFobValue: itemFob.toFixed(2),
      totalCustomsDuty: itemCustoms.toFixed(2),
      totalFreight: itemFreight.toFixed(2),
      totalLandingValue: (itemFob + itemCustoms + itemFreight).toFixed(2),
      totalInventoryCost: (itemFob + itemCustoms + itemFreight).toFixed(2),
    }));
  }, [items]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const addItem = () => {
    setItems((prev) => [...prev, { id: Date.now() + Math.random(), itemCode: "", description: "", poQty: "", receivedQty: "", fobValue: "", customsDuty: "", freight: "", landingValue: "", inventoryCost: "" }]);
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((r) => r.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setItems((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        if (field === "receivedQty" || field === "fobValue" || field === "customsDuty" || field === "freight") {
          const newFob = parseFloat(updated.fobValue) || 0;
          const newCustoms = parseFloat(updated.customsDuty) || 0;
          const newFreight = parseFloat(updated.freight) || 0;
          updated.landingValue = (newFob + newCustoms + newFreight).toFixed(2);
          updated.inventoryCost = (newFob + newCustoms + newFreight).toFixed(2);
        }
        return updated;
      })
    );
    setRowErrors((prev) => ({ ...prev, [`${id}-${field}`]: "" }));
  };

  const addInvoice = () => {
    setInvoices((prev) => [...prev, { id: Date.now() + Math.random(), fileName: "", file: null, remarks: "" }]);
  };

  const removeInvoice = (id) => {
    setInvoices((prev) => prev.filter((r) => r.id !== id));
  };

  const handleInvoiceChange = (id, field, value) => {
    setInvoices((prev) =>
      prev.map((r) => (r.id !== id ? r : { ...r, [field]: value }))
    );
  };

  const validate = () => {
    const errors = {};
    if (!form.supplierId.trim()) errors.supplierId = "Supplier ID is required";
    if (!form.poNo.trim()) errors.poNo = "PO No is required";

    const itemErrs = {};
    items.forEach((r, idx) => {
      if (!r.itemCode.trim()) itemErrs[`${r.id}-itemCode`] = "Item Code is required";
    });
    setFieldErrors(errors);
    setRowErrors(itemErrs);
    return Object.keys(errors).length === 0 && Object.keys(itemErrs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    const payload = {
      ...(form.id ? { id: form.id } : {}),
      orgId,
      branch,
      ...form,
      totalFobValue: summary.totalFobValue,
      totalCustomsDuty: summary.totalCustomsDuty,
      totalFreight: summary.totalFreight,
      totalLandingValue: summary.totalLandingValue,
      totalInventoryCost: summary.totalInventoryCost,
      receivedBy: summary.receivedBy,
      qualityCheckBy: summary.qualityCheckBy,
      remarks: summary.remarks,
      grnItems: items.map(({ id, ...rest }) => rest),
      grnAttachments: invoices,
      createdBy: localStorage.getItem("userName") || "SYSTEM",
      cancelRemarks: "",
    };

    try {
      await importGRNAPI.createUpdate(payload);
      addToast(data ? "GRN Updated Successfully!" : "GRN Saved Successfully!", "success");
      onBack();
    } catch (error) {
      addToast("Failed to save GRN.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { key: "items", label: "Item Particulars" },
    { key: "summary", label: "GRN Summary" },
    { key: "attachments", label: "Attached Invoice Copy" },
  ];

  return (
    <div className="animate-fadeIn px-3 py-3 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <button onClick={onBack} className="p-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data ? "Edit Import GRN" : "New Import GRN"}
        </h2>
        <div className="ml-auto flex items-center gap-2">
          <label className={labelClasses}>Active</label>
          <ToggleButton value={form.active} onChange={(v) => setForm((p) => ({ ...p, active: v }))} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
        <SectionHeader>GRN Header</SectionHeader>
        <div className={fieldGrid}>
          <div>
            <label className={labelClasses}>Plant ID</label>
            <select name="plantId" value={form.plantId} onChange={handleFormChange} className={controlClasses}>
              <option value="">Select</option>
              {PLANT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClasses}>Belongs To</label>
            <select name="belongsTo" value={form.belongsTo} onChange={handleFormChange} className={controlClasses}>
              <option value="">Select</option>
              {BELONGS_TO_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClasses}>Doc ID</label>
            <input type="text" name="docId" value={form.docId} disabled className={controlClasses} />
          </div>
          <div>
            <label className={labelClasses}>Doc Date</label>
            <input type="date" name="docDate" value={form.docDate} onChange={handleFormChange} className={controlClasses} />
          </div>
          <div>
            <label className={labelClasses}>Supplier ID <span className="text-red-500">*</span></label>
            <input type="text" name="supplierId" value={form.supplierId} onChange={handleFormChange} placeholder="Enter Supplier ID" className={`${controlClasses} ${fieldErrors.supplierId ? "border-red-500" : ""}`} />
            {fieldErrors.supplierId && <p className="text-[10px] text-red-500 mt-0.5">{fieldErrors.supplierId}</p>}
          </div>
          <div>
            <label className={labelClasses}>Supplier Name</label>
            <input type="text" name="supplierName" value={form.supplierName} disabled className={controlClasses} placeholder="Auto-filled" />
          </div>
          <div>
            <label className={labelClasses}>Shipment No</label>
            <input type="text" name="shipmentNo" value={form.shipmentNo} onChange={handleFormChange} className={controlClasses} />
          </div>
          <div>
            <label className={labelClasses}>Shipment Date</label>
            <input type="date" name="shipmentDate" value={form.shipmentDate} onChange={handleFormChange} className={controlClasses} />
          </div>
          <div>
            <label className={labelClasses}>BL No</label>
            <input type="text" name="blNo" value={form.blNo} onChange={handleFormChange} className={controlClasses} />
          </div>
          <div>
            <label className={labelClasses}>BL Date</label>
            <input type="date" name="blDate" value={form.blDate} onChange={handleFormChange} className={controlClasses} />
          </div>
          <div>
            <label className={labelClasses}>Gate Pass No</label>
            <input type="text" name="gatePassNo" value={form.gatePassNo} onChange={handleFormChange} className={controlClasses} />
          </div>
          <div>
            <label className={labelClasses}>Transporter</label>
            <input type="text" name="transporter" value={form.transporter} onChange={handleFormChange} className={controlClasses} />
          </div>
          <div>
            <label className={labelClasses}>PO No <span className="text-red-500">*</span></label>
            <input type="text" name="poNo" value={form.poNo} onChange={handleFormChange} placeholder="Enter PO No" className={`${controlClasses} ${fieldErrors.poNo ? "border-red-500" : ""}`} />
            {fieldErrors.poNo && <p className="text-[10px] text-red-500 mt-0.5">{fieldErrors.poNo}</p>}
          </div>
          <div>
            <label className={labelClasses}>Forwarder Name</label>
            <input type="text" name="forwarderName" value={form.forwarderName} onChange={handleFormChange} className={controlClasses} />
          </div>
          <div>
            <label className={labelClasses}>PO Date</label>
            <input type="date" name="poDate" value={form.poDate} onChange={handleFormChange} className={controlClasses} />
          </div>
          <div>
            <label className={labelClasses}>Vehicle No</label>
            <input type="text" name="vehicleNo" value={form.vehicleNo} onChange={handleFormChange} className={controlClasses} />
          </div>
          <div>
            <label className={labelClasses}>Total Packages</label>
            <input type="number" name="totalPackages" value={form.totalPackages} onChange={handleFormChange} className={controlClasses} />
          </div>
          <div>
            <label className={labelClasses}>Total Gross Weight</label>
            <input type="number" step="0.01" name="totalGrossWeight" value={form.totalGrossWeight} onChange={handleFormChange} className={controlClasses} />
          </div>
          <div>
            <label className={labelClasses}>Invoice No</label>
            <input type="text" name="invoiceNo" value={form.invoiceNo} onChange={handleFormChange} className={controlClasses} />
          </div>
          <div>
            <label className={labelClasses}>Invoice Date</label>
            <input type="date" name="invoiceDate" value={form.invoiceDate} onChange={handleFormChange} className={controlClasses} />
          </div>
          <div>
            <label className={labelClasses}>GRN Time</label>
            <input type="time" name="grnTime" value={form.grnTime} onChange={handleFormChange} className={controlClasses} />
          </div>
          <div>
            <label className={labelClasses}>PO Currency</label>
            <input type="text" name="poCurrency" value={form.poCurrency} onChange={handleFormChange} className={controlClasses} />
          </div>
          <div>
            <label className={labelClasses}>LR No</label>
            <input type="text" name="lrNo" value={form.lrNo} onChange={handleFormChange} className={controlClasses} />
          </div>
          <div>
            <label className={labelClasses}>PO Exchange Rate</label>
            <input type="number" step="0.0001" name="poExchangeRate" value={form.poExchangeRate} onChange={handleFormChange} className={controlClasses} />
          </div>
          <div>
            <label className={labelClasses}>Location ID</label>
            <select name="locationId" value={form.locationId} onChange={handleFormChange} className={controlClasses}>
              <option value="">Select</option>
              {LOCATION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex">
            {tabs.map((tab) => (
              <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-t transition-colors ${
                  activeTab === tab.key
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "items" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <SectionHeader>Item Particulars</SectionHeader>
              <button type="button" onClick={addItem}
                className="flex items-center gap-1 px-2 py-1 rounded text-[11px] bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors">
                <Plus className="h-3 w-3" /> Add Item
              </button>
            </div>
            <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    {["#", "Item Code", "Description", "PO Qty", "Received Qty", "FOB Value", "Customs Duty", "Freight", "Landing Value", "Inventory Cost", "Action"].map((h) => (
                      <th key={h} className="px-1.5 py-1 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((row, idx) => (
                    <tr key={row.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-1.5 py-1 text-gray-500 dark:text-gray-400">{idx + 1}</td>
                      <td className="px-1.5 py-1">
                        <input type="text" value={row.itemCode}
                          onChange={(e) => handleItemChange(row.id, "itemCode", e.target.value)}
                          className={`${controlClasses} w-[100px] ${rowErrors[`${row.id}-itemCode`] ? "border-red-500" : ""}`} />
                        {rowErrors[`${row.id}-itemCode`] && <p className="text-[10px] text-red-500">{rowErrors[`${row.id}-itemCode`]}</p>}
                      </td>
                      <td className="px-1.5 py-1"><input type="text" value={row.description} onChange={(e) => handleItemChange(row.id, "description", e.target.value)} className={`${controlClasses} w-[120px]`} /></td>
                      <td className="px-1.5 py-1"><input type="number" value={row.poQty} onChange={(e) => handleItemChange(row.id, "poQty", e.target.value)} className={`${controlClasses} w-[70px]`} /></td>
                      <td className="px-1.5 py-1"><input type="number" value={row.receivedQty} onChange={(e) => handleItemChange(row.id, "receivedQty", e.target.value)} className={`${controlClasses} w-[70px]`} /></td>
                      <td className="px-1.5 py-1"><input type="number" step="0.01" value={row.fobValue} onChange={(e) => handleItemChange(row.id, "fobValue", e.target.value)} className={`${controlClasses} w-[90px]`} /></td>
                      <td className="px-1.5 py-1"><input type="number" step="0.01" value={row.customsDuty} onChange={(e) => handleItemChange(row.id, "customsDuty", e.target.value)} className={`${controlClasses} w-[90px]`} /></td>
                      <td className="px-1.5 py-1"><input type="number" step="0.01" value={row.freight} onChange={(e) => handleItemChange(row.id, "freight", e.target.value)} className={`${controlClasses} w-[80px]`} /></td>
                      <td className="px-1.5 py-1"><input type="text" value={row.landingValue} readOnly className={`${controlClasses} w-[90px] bg-gray-50 dark:bg-gray-800`} /></td>
                      <td className="px-1.5 py-1"><input type="text" value={row.inventoryCost} readOnly className={`${controlClasses} w-[90px] bg-gray-50 dark:bg-gray-800`} /></td>
                      <td className="px-1.5 py-1 text-center">
                        <button onClick={() => removeItem(row.id)} disabled={items.length <= 1}
                          className="p-0.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-30">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "summary" && (
          <div className="space-y-3">
            <SectionHeader>GRN Summary</SectionHeader>
            <div className={fieldGrid}>
              <div>
                <label className={labelClasses}>Total FOB Value</label>
                <input type="text" value={summary.totalFobValue} readOnly className={`${controlClasses} bg-gray-50 dark:bg-gray-800`} />
              </div>
              <div>
                <label className={labelClasses}>Total Customs Duty</label>
                <input type="text" value={summary.totalCustomsDuty} readOnly className={`${controlClasses} bg-gray-50 dark:bg-gray-800`} />
              </div>
              <div>
                <label className={labelClasses}>Total Freight</label>
                <input type="text" value={summary.totalFreight} readOnly className={`${controlClasses} bg-gray-50 dark:bg-gray-800`} />
              </div>
              <div>
                <label className={labelClasses}>Total Landing Value</label>
                <input type="text" value={summary.totalLandingValue} readOnly className={`${controlClasses} bg-gray-50 dark:bg-gray-800`} />
              </div>
              <div>
                <label className={labelClasses}>Total Inventory Cost</label>
                <input type="text" value={summary.totalInventoryCost} readOnly className={`${controlClasses} bg-gray-50 dark:bg-gray-800`} />
              </div>
              <div>
                <label className={labelClasses}>Received By</label>
                <input type="text" value={summary.receivedBy} onChange={(e) => setSummary((p) => ({ ...p, receivedBy: e.target.value }))} className={controlClasses} />
              </div>
              <div>
                <label className={labelClasses}>Quality Check By</label>
                <input type="text" value={summary.qualityCheckBy} onChange={(e) => setSummary((p) => ({ ...p, qualityCheckBy: e.target.value }))} className={controlClasses} />
              </div>
              <div className="col-span-1 md:col-span-2 xl:col-span-3">
                <label className={labelClasses}>Remarks</label>
                <textarea value={summary.remarks} onChange={(e) => setSummary((p) => ({ ...p, remarks: e.target.value }))} rows={2} className={`${controlClasses} h-auto min-h-[30px] resize-none pt-1`} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "attachments" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <SectionHeader>Attached Invoice Copy</SectionHeader>
              <button type="button" onClick={addInvoice}
                className="flex items-center gap-1 px-2 py-1 rounded text-[11px] bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors">
                <Plus className="h-3 w-3" /> Add Document
              </button>
            </div>
            {invoices.length > 0 ? (
              <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
                <table className="w-full text-xs">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="px-2 py-1.5 text-left font-semibold text-gray-600 dark:text-gray-300">#</th>
                      <th className="px-2 py-1.5 text-left font-semibold text-gray-600 dark:text-gray-300">Document Name</th>
                      <th className="px-2 py-1.5 text-left font-semibold text-gray-600 dark:text-gray-300">File</th>
                      <th className="px-2 py-1.5 text-left font-semibold text-gray-600 dark:text-gray-300">Remarks</th>
                      <th className="px-2 py-1.5 text-center font-semibold text-gray-600 dark:text-gray-300">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv, idx) => (
                      <tr key={inv.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-2 py-1 text-gray-500 dark:text-gray-400">{idx + 1}</td>
                        <td className="px-2 py-1">
                          <input type="text" value={inv.fileName} onChange={(e) => handleInvoiceChange(inv.id, "fileName", e.target.value)} placeholder="Document name" className={controlClasses + " w-[150px]"} />
                        </td>
                        <td className="px-2 py-1">
                          <label className="flex items-center gap-1 px-2 py-1 rounded text-[11px] bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 cursor-pointer transition-colors">
                            <UploadCloud className="h-3 w-3" />
                            {inv.file ? inv.file.name : "Upload"}
                            <input type="file" className="hidden" onChange={(e) => handleInvoiceChange(inv.id, "file", e.target.files[0])} />
                          </label>
                        </td>
                        <td className="px-2 py-1">
                          <input type="text" value={inv.remarks} onChange={(e) => handleInvoiceChange(inv.id, "remarks", e.target.value)} placeholder="Remarks" className={controlClasses + " w-[150px]"} />
                        </td>
                        <td className="px-2 py-1 text-center">
                          <button onClick={() => removeInvoice(inv.id)}
                            className="p-0.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-gray-500 dark:text-gray-400">
                <UploadCloud className="h-6 w-6 mx-auto mb-1 opacity-40" />
                Click <strong>Add Document</strong> to attach invoice copies
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button type="button" onClick={onBack} disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
            <X className="h-3 w-3" /> Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
            <Save className="h-3 w-3" /> {isSubmitting ? "Saving..." : data ? "Update" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportGRNForm;

import { ArrowLeft, Save, X, Plus, Trash2, UploadCloud, Copy } from "lucide-react";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import apiClient from "../../../api/apiClient";
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
const BELONGS_TO_OPTIONS = ["Company", "Individual", "Other"];
const ISSUE_TO_OPTIONS = ["Production", "Warehouse", "Subcontractor", "Store"];
const ITEM_CATEGORY_OPTIONS = ["Raw Material", "Finished Goods", "Consumable", "Service"];
const TAX_STRUCTURE_OPTIONS = ["GST", "Non-GST", "Composite"];
const SUBTYPE_OPTIONS = ["Regular", "Casual", "SEZ", "EOU"];
const GST_STATE_OPTIONS = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli",
  "Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh",
  "Lakshadweep", "Puducherry",
];
const GST_STATE_CODE_MAP = {
  "Andhra Pradesh": "37", "Arunachal Pradesh": "12", "Assam": "18", "Bihar": "10",
  "Chhattisgarh": "22", "Goa": "30", "Gujarat": "24", "Haryana": "06",
  "Himachal Pradesh": "02", "Jharkhand": "20", "Karnataka": "29", "Kerala": "32",
  "Madhya Pradesh": "23", "Maharashtra": "27", "Manipur": "14", "Meghalaya": "17",
  "Mizoram": "15", "Nagaland": "13", "Odisha": "21", "Punjab": "03",
  "Rajasthan": "08", "Sikkim": "11", "Tamil Nadu": "33", "Telangana": "36",
  "Tripura": "16", "Uttar Pradesh": "09", "Uttarakhand": "05", "West Bengal": "19",
  "Andaman and Nicobar Islands": "35", "Chandigarh": "04", "Dadra and Nagar Haveli": "26",
  "Daman and Diu": "25", "Delhi": "07", "Jammu and Kashmir": "01", "Ladakh": "38",
  "Lakshadweep": "31", "Puducherry": "34",
};
const DEALER_TYPE_OPTIONS = ["Regular", "Composition", "Unregistered", "SEZ"];
const TAX_TYPE_OPTIONS = ["GST", "IGST", "Nil Rated", "Exempted", "Non-GST"];
const UNIT_OPTIONS = ["Nos", "Kg", "Gms", "Ltr", "Mtr", "Pcs", "Box", "Pair"];
const LEDGER_ACCOUNT_OPTIONS = [
  "Input CGST", "Input SGST", "Input IGST", "CENVAT", "VAT", "Service Tax",
];

const DirectPurchaseForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId")) || 0;
  const branch = Number(localStorage.getItem("branchId")) || 1000000001;

  const [activeTab, setActiveTab] = useState("cashDetail");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [rowErrors, setRowErrors] = useState({});

  const [form, setForm] = useState({
    plantId: data?.plantId || "",
    docNo: data?.docNo || "DP" + String(Date.now()).slice(-6),
    docDate: data?.docDate || dayjs().format("YYYY-MM-DD"),
    belongsTo: data?.belongsTo || "",
    supplierName: data?.supplierName || "",
    invNo: data?.invNo || "",
    invDate: data?.invDate || "",
    issueTo: data?.issueTo || "",
    itemCategory: data?.itemCategory || "",
    taxStructure: data?.taxStructure || "",
    tariffHeading: data?.tariffHeading || "",
    creditAcName: data?.creditAcName || "",
    subType: data?.subType || "",
    eccNo: data?.eccNo || "",
    tallyRefNo: data?.tallyRefNo || "",
    gstState: data?.gstState || "",
    gstStateCode: data?.gstStateCode || "",
    gstNo: data?.gstNo || "",
    dealerType: data?.dealerType || "",
    isIgstApplicable: data?.isIgstApplicable || false,
    reverseCharge: data?.reverseCharge || false,
    active: data?.active === "Active" || data?.active !== false,
    id: data?.id || 0,
  });

  const [cashItems, setCashItems] = useState(
    data?.cashItems || [
      {
        id: Date.now() + Math.random(),
        itemCode: "", description: "", hsn: "",
        qty: "", rate: "", amount: "",
        taxType: "", taxPerc: "", unit: "", taxDescription: "",
        sgstPerc: "", cgstPerc: "", igstPerc: "",
      },
    ]
  );

  const [taxRows, setTaxRows] = useState(
    data?.taxDetails || [
      { id: Date.now() + Math.random(), particulars: "", taxId: "", taxPerc: "", acceptedAmt: "", revisedAmt: "", ledgerAcName: "" },
    ]
  );

  const [summary, setSummary] = useState({
    basicAmount: data?.basicAmount || "",
    discount: data?.discount || "",
    afterDiscountTotal: data?.afterDiscountTotal || "",
    totalAmount: data?.totalAmount || "",
    preparedBy: data?.preparedBy || "",
    remarks: data?.remarks || "",
  });

  const [attachments, setAttachments] = useState(data?.attachments || []);

  useEffect(() => {
    if (form.gstState) {
      const code = GST_STATE_CODE_MAP[form.gstState] || "";
      setForm((prev) => ({ ...prev, gstStateCode: code }));
    } else {
      setForm((prev) => ({ ...prev, gstStateCode: "" }));
    }
  }, [form.gstState]);

  useEffect(() => {
    let total = 0;
    cashItems.forEach((r) => {
      total += parseFloat(r.amount) || 0;
    });
    const discount = parseFloat(summary.discount) || 0;
    const afterDiscount = total - discount;
    setSummary((prev) => ({
      ...prev,
      basicAmount: total.toFixed(2),
      afterDiscountTotal: afterDiscount.toFixed(2),
      totalAmount: afterDiscount.toFixed(2),
    }));
  }, [cashItems, summary.discount]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const addCashItem = () => {
    setCashItems((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), itemCode: "", description: "", hsn: "", qty: "", rate: "", amount: "", taxType: "", taxPerc: "", unit: "", taxDescription: "", sgstPerc: "", cgstPerc: "", igstPerc: "" },
    ]);
  };

  const removeCashItem = (id) => {
    setCashItems((prev) => prev.filter((r) => r.id !== id));
  };

  const copyCashItem = (source) => {
    const newRow = { ...source, id: Date.now() + Math.random() };
    setCashItems((prev) => [...prev, newRow]);
  };

  const handleCashItemChange = (id, field, value) => {
    setCashItems((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        if (field === "qty" || field === "rate") {
          const qty = parseFloat(updated.qty) || 0;
          const rate = parseFloat(updated.rate) || 0;
          updated.amount = (qty * rate).toFixed(2);
        }
        if (field === "taxType") {
          if (value === "GST") {
            updated.taxDescription = "GST";
            updated.sgstPerc = "9";
            updated.cgstPerc = "9";
            updated.igstPerc = "0";
            updated.taxPerc = "18";
          } else if (value === "IGST") {
            updated.taxDescription = "IGST";
            updated.sgstPerc = "0";
            updated.cgstPerc = "0";
            updated.igstPerc = "18";
            updated.taxPerc = "18";
          } else if (value === "Nil Rated") {
            updated.taxDescription = "Nil Rated";
            updated.sgstPerc = "0";
            updated.cgstPerc = "0";
            updated.igstPerc = "0";
            updated.taxPerc = "0";
          } else {
            updated.taxDescription = value || "";
            updated.sgstPerc = "";
            updated.cgstPerc = "";
            updated.igstPerc = "";
            updated.taxPerc = "";
          }
        }
        return updated;
      })
    );
    setRowErrors((prev) => ({ ...prev, [`${id}-${field}`]: "" }));
  };

  const addTaxRow = () => {
    setTaxRows((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), particulars: "", taxId: "", taxPerc: "", acceptedAmt: "", revisedAmt: "", ledgerAcName: "" },
    ]);
  };

  const removeTaxRow = (id) => {
    setTaxRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleTaxRowChange = (id, field, value) => {
    setTaxRows((prev) =>
      prev.map((r) => (r.id !== id ? r : { ...r, [field]: value }))
    );
  };

  const addAttachment = () => {
    setAttachments((prev) => [...prev, { id: Date.now() + Math.random(), fileName: "", file: null }]);
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAttachmentChange = (id, field, value) => {
    setAttachments((prev) =>
      prev.map((r) => (r.id !== id ? r : { ...r, [field]: value }))
    );
  };

  const validate = () => {
    const errors = {};
    if (!form.supplierName.trim()) errors.supplierName = "Supplier Name is required";
    if (!form.plantId.trim()) errors.plantId = "Plant ID is required";

    const itemErrs = {};
    cashItems.forEach((r) => {
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
      ...summary,
      cashItems: cashItems.map(({ id, ...rest }) => rest),
      taxDetails: taxRows.map(({ id, ...rest }) => rest),
      attachments: attachments.filter((a) => a.file || a.fileName),
      createdBy: localStorage.getItem("userName") || "SYSTEM",
      cancelRemarks: "",
    };

    try {
      await apiClient.post("/api/dev/createUpdateDirectPurchaseMaster", payload);
      addToast(data ? "Direct Purchase Updated Successfully!" : "Direct Purchase Saved Successfully!", "success");
      onBack();
    } catch (error) {
      addToast("Failed to save Direct Purchase.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { key: "cashDetail", label: "Cash Detail" },
    { key: "taxDetails", label: "Tax Details" },
    { key: "summary", label: "Summary" },
    { key: "attachments", label: "Attached Invoice Copy" },
  ];

  const renderCashDetailTab = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <SectionHeader>Cash Detail</SectionHeader>
        <button type="button" onClick={addCashItem}
          className="flex items-center gap-1 px-2 py-1 rounded text-[11px] bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors">
          <Plus className="h-3 w-3" /> Add Item
        </button>
      </div>
      <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
        <table className="w-full text-xs">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              {["#", "Item Code", "Description", "HSN", "Qty", "Rate", "Amount", "Tax Type", "Tax %", "Unit", "Tax Description", "SGST %", "CGST %", "IGST %", "Action"].map((h) => (
                <th key={h} className="px-1.5 py-1 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cashItems.map((row, idx) => (
              <tr key={row.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-1.5 py-1 text-gray-500 dark:text-gray-400">{idx + 1}</td>
                <td className="px-1.5 py-1">
                  <input type="text" value={row.itemCode}
                    onChange={(e) => handleCashItemChange(row.id, "itemCode", e.target.value)}
                    className={`${controlClasses} w-[100px] ${rowErrors[`${row.id}-itemCode`] ? "border-red-500" : ""}`} />
                  {rowErrors[`${row.id}-itemCode`] && <p className="text-[10px] text-red-500">{rowErrors[`${row.id}-itemCode`]}</p>}
                </td>
                <td className="px-1.5 py-1"><input type="text" value={row.description} onChange={(e) => handleCashItemChange(row.id, "description", e.target.value)} className={`${controlClasses} w-[120px]`} /></td>
                <td className="px-1.5 py-1"><input type="text" value={row.hsn} onChange={(e) => handleCashItemChange(row.id, "hsn", e.target.value)} className={`${controlClasses} w-[70px]`} /></td>
                <td className="px-1.5 py-1"><input type="number" value={row.qty} onChange={(e) => handleCashItemChange(row.id, "qty", e.target.value)} className={`${controlClasses} w-[60px]`} /></td>
                <td className="px-1.5 py-1"><input type="number" step="0.01" value={row.rate} onChange={(e) => handleCashItemChange(row.id, "rate", e.target.value)} className={`${controlClasses} w-[70px]`} /></td>
                <td className="px-1.5 py-1"><input type="text" value={row.amount} readOnly className={`${controlClasses} w-[80px] bg-gray-50 dark:bg-gray-800`} /></td>
                <td className="px-1.5 py-1">
                  <select value={row.taxType} onChange={(e) => handleCashItemChange(row.id, "taxType", e.target.value)} className={`${controlClasses} w-[85px]`}>
                    <option value="">Select</option>
                    {TAX_TYPE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </td>
                <td className="px-1.5 py-1"><input type="text" value={row.taxPerc} readOnly className={`${controlClasses} w-[50px] bg-gray-50 dark:bg-gray-800`} /></td>
                <td className="px-1.5 py-1">
                  <select value={row.unit} onChange={(e) => handleCashItemChange(row.id, "unit", e.target.value)} className={`${controlClasses} w-[60px]`}>
                    <option value="">-</option>
                    {UNIT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </td>
                <td className="px-1.5 py-1"><input type="text" value={row.taxDescription} onChange={(e) => handleCashItemChange(row.id, "taxDescription", e.target.value)} className={`${controlClasses} w-[85px]`} /></td>
                <td className="px-1.5 py-1"><input type="text" value={row.sgstPerc} readOnly className={`${controlClasses} w-[50px] bg-gray-50 dark:bg-gray-800`} /></td>
                <td className="px-1.5 py-1"><input type="text" value={row.cgstPerc} readOnly className={`${controlClasses} w-[50px] bg-gray-50 dark:bg-gray-800`} /></td>
                <td className="px-1.5 py-1"><input type="text" value={row.igstPerc} readOnly className={`${controlClasses} w-[50px] bg-gray-50 dark:bg-gray-800`} /></td>
                <td className="px-1.5 py-1 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-0.5">
                    <button type="button" onClick={() => copyCashItem(row)}
                      className="p-0.5 rounded text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      title="Copy row">
                      <Copy className="h-3 w-3" />
                    </button>
                    <button onClick={() => removeCashItem(row.id)} disabled={cashItems.length <= 1}
                      className="p-0.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-30"
                      title="Delete row">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTaxDetailsTab = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <SectionHeader>Tax Details</SectionHeader>
        <button type="button" onClick={addTaxRow}
          className="flex items-center gap-1 px-2 py-1 rounded text-[11px] bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors">
          <Plus className="h-3 w-3" /> Add Tax Row
        </button>
      </div>
      <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
        <table className="w-full text-xs">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              {["#", "Particulars", "Tax ID", "Tax %", "Accepted Qty Amount", "Revised Amount", "Ledger Account Name", "Action"].map((h) => (
                <th key={h} className="px-1.5 py-1 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {taxRows.map((row, idx) => (
              <tr key={row.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-1.5 py-1 text-gray-500 dark:text-gray-400">{idx + 1}</td>
                <td className="px-1.5 py-1">
                  <select value={row.particulars} onChange={(e) => handleTaxRowChange(row.id, "particulars", e.target.value)} className={`${controlClasses} w-[100px]`}>
                    <option value="">Select</option>
                    {["SGST", "CGST", "IGST", "CESS", "SWS"].map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </td>
                <td className="px-1.5 py-1"><input type="text" value={row.taxId} onChange={(e) => handleTaxRowChange(row.id, "taxId", e.target.value)} className={`${controlClasses} w-[80px]`} /></td>
                <td className="px-1.5 py-1"><input type="text" value={row.taxPerc} onChange={(e) => handleTaxRowChange(row.id, "taxPerc", e.target.value)} className={`${controlClasses} w-[55px]`} /></td>
                <td className="px-1.5 py-1"><input type="number" step="0.01" value={row.acceptedAmt} onChange={(e) => handleTaxRowChange(row.id, "acceptedAmt", e.target.value)} className={`${controlClasses} w-[100px]`} /></td>
                <td className="px-1.5 py-1"><input type="number" step="0.01" value={row.revisedAmt} onChange={(e) => handleTaxRowChange(row.id, "revisedAmt", e.target.value)} className={`${controlClasses} w-[100px]`} /></td>
                <td className="px-1.5 py-1">
                  <select value={row.ledgerAcName} onChange={(e) => handleTaxRowChange(row.id, "ledgerAcName", e.target.value)} className={`${controlClasses} w-[120px]`}>
                    <option value="">Select</option>
                    {LEDGER_ACCOUNT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </td>
                <td className="px-1.5 py-1 text-center">
                  <button onClick={() => removeTaxRow(row.id)} disabled={taxRows.length <= 1}
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
  );

  const renderSummaryTab = () => (
    <div className="space-y-3">
      <SectionHeader>Summary</SectionHeader>
      <div className={fieldGrid}>
        <div>
          <label className={labelClasses}>Basic Amount</label>
          <input type="text" value={summary.basicAmount} readOnly className={`${controlClasses} bg-gray-50 dark:bg-gray-800`} />
        </div>
        <div>
          <label className={labelClasses}>Discount</label>
          <input type="number" step="0.01" value={summary.discount}
            onChange={(e) => setSummary((p) => ({ ...p, discount: e.target.value }))}
            className={controlClasses} />
        </div>
        <div>
          <label className={labelClasses}>After Discount Total</label>
          <input type="text" value={summary.afterDiscountTotal} readOnly className={`${controlClasses} bg-gray-50 dark:bg-gray-800`} />
        </div>
        <div>
          <label className={labelClasses}>Total Amount</label>
          <input type="text" value={summary.totalAmount} readOnly className={`${controlClasses} bg-gray-50 dark:bg-gray-800`} />
        </div>
        <div>
          <label className={labelClasses}>Prepared By</label>
          <input type="text" value={summary.preparedBy}
            onChange={(e) => setSummary((p) => ({ ...p, preparedBy: e.target.value }))}
            className={controlClasses} />
        </div>
        <div className="col-span-1 md:col-span-2 xl:col-span-3">
          <label className={labelClasses}>Remarks</label>
          <textarea value={summary.remarks}
            onChange={(e) => setSummary((p) => ({ ...p, remarks: e.target.value }))}
            rows={2} className={`${controlClasses} h-auto min-h-[30px] resize-none pt-1`} />
        </div>
      </div>
    </div>
  );

  const renderAttachmentsTab = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <SectionHeader>Attached Invoice Copy</SectionHeader>
        <button type="button" onClick={addAttachment}
          className="flex items-center gap-1 px-2 py-1 rounded text-[11px] bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors">
          <Plus className="h-3 w-3" /> Add Document
        </button>
      </div>
      {attachments.length > 0 ? (
        <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
          <table className="w-full text-xs">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-2 py-1.5 text-left font-semibold text-gray-600 dark:text-gray-300">#</th>
                <th className="px-2 py-1.5 text-left font-semibold text-gray-600 dark:text-gray-300">File</th>
                <th className="px-2 py-1.5 text-center font-semibold text-gray-600 dark:text-gray-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {attachments.map((att, idx) => (
                <tr key={att.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-2 py-1 text-gray-500 dark:text-gray-400">{idx + 1}</td>
                  <td className="px-2 py-1">
                    <label className="flex items-center gap-1 px-2 py-1 rounded text-[11px] bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 cursor-pointer transition-colors">
                      <UploadCloud className="h-3 w-3" />
                      {att.file ? att.file.name : "Upload"}
                      <input type="file" className="hidden" onChange={(e) => handleAttachmentChange(att.id, "file", e.target.files[0])} />
                    </label>
                  </td>
                  <td className="px-2 py-1 text-center">
                    <button onClick={() => removeAttachment(att.id)}
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
  );

  return (
    <div className="animate-fadeIn px-3 py-3 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <button onClick={onBack} className="p-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data ? "Edit Direct Purchase" : "New Direct Purchase"}
        </h2>
        <div className="ml-auto flex items-center gap-2">
          <label className={labelClasses}>Active</label>
          <ToggleButton value={form.active} onChange={(v) => setForm((p) => ({ ...p, active: v }))} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
        <SectionHeader>Direct Purchase Header</SectionHeader>
        <div className={fieldGrid}>
          <div>
            <label className={labelClasses}>Plant ID <span className="text-red-500">*</span></label>
            <select name="plantId" value={form.plantId} onChange={handleFormChange} className={`${controlClasses} ${fieldErrors.plantId ? "border-red-500" : ""}`}>
              <option value="">Select</option>
              {PLANT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            {fieldErrors.plantId && <p className="text-[10px] text-red-500 mt-0.5">{fieldErrors.plantId}</p>}
          </div>
          <div>
            <label className={labelClasses}>Doc No</label>
            <input type="text" name="docNo" value={form.docNo} disabled className={controlClasses} />
          </div>
          <div>
            <label className={labelClasses}>Doc Date</label>
            <input type="date" name="docDate" value={form.docDate} onChange={handleFormChange} className={controlClasses} />
          </div>
          <div>
            <label className={labelClasses}>Belongs To</label>
            <select name="belongsTo" value={form.belongsTo} onChange={handleFormChange} className={controlClasses}>
              <option value="">Select</option>
              {BELONGS_TO_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClasses}>Supplier Name <span className="text-red-500">*</span></label>
            <input type="text" name="supplierName" value={form.supplierName} onChange={handleFormChange} placeholder="Enter Supplier Name" className={`${controlClasses} ${fieldErrors.supplierName ? "border-red-500" : ""}`} />
            {fieldErrors.supplierName && <p className="text-[10px] text-red-500 mt-0.5">{fieldErrors.supplierName}</p>}
          </div>
          <div>
            <label className={labelClasses}>Inv No</label>
            <input type="text" name="invNo" value={form.invNo} onChange={handleFormChange} className={controlClasses} />
          </div>
          <div>
            <label className={labelClasses}>Inv Date</label>
            <input type="date" name="invDate" value={form.invDate} onChange={handleFormChange} className={controlClasses} />
          </div>
          <div>
            <label className={labelClasses}>Issue To</label>
            <select name="issueTo" value={form.issueTo} onChange={handleFormChange} className={controlClasses}>
              <option value="">Select</option>
              {ISSUE_TO_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClasses}>Item Category</label>
            <select name="itemCategory" value={form.itemCategory} onChange={handleFormChange} className={controlClasses}>
              <option value="">Select</option>
              {ITEM_CATEGORY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClasses}>Tax Structure</label>
            <select name="taxStructure" value={form.taxStructure} onChange={handleFormChange} className={controlClasses}>
              <option value="">Select</option>
              {TAX_STRUCTURE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClasses}>Tariff Heading</label>
            <input type="text" name="tariffHeading" value={form.tariffHeading} onChange={handleFormChange} className={controlClasses} />
          </div>
          <div>
            <label className={labelClasses}>Credit A/c Name</label>
            <input type="text" name="creditAcName" value={form.creditAcName} onChange={handleFormChange} className={controlClasses} />
          </div>
          <div>
            <label className={labelClasses}>Subtype</label>
            <select name="subType" value={form.subType} onChange={handleFormChange} className={controlClasses}>
              <option value="">Select</option>
              {SUBTYPE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClasses}>ECC No./ST. No</label>
            <input type="text" name="eccNo" value={form.eccNo} onChange={handleFormChange} className={controlClasses} />
          </div>
          <div>
            <label className={labelClasses}>Tally Ref No</label>
            <input type="text" name="tallyRefNo" value={form.tallyRefNo} onChange={handleFormChange} className={controlClasses} />
          </div>
          <div>
            <label className={labelClasses}>GST State</label>
            <select name="gstState" value={form.gstState} onChange={handleFormChange} className={controlClasses}>
              <option value="">Select</option>
              {GST_STATE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClasses}>GST State Code</label>
            <input type="text" name="gstStateCode" value={form.gstStateCode} disabled className={`${controlClasses} bg-gray-50 dark:bg-gray-800`} />
          </div>
          <div>
            <label className={labelClasses}>GSTIN No</label>
            <input type="text" name="gstNo" value={form.gstNo} onChange={handleFormChange} className={controlClasses} />
          </div>
          <div>
            <label className={labelClasses}>Dealer Type</label>
            <select name="dealerType" value={form.dealerType} onChange={handleFormChange} className={controlClasses}>
              <option value="">Select</option>
              {DEALER_TYPE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="flex items-end gap-4 pb-1">
            <div className="flex items-center gap-2">
              <label className={labelClasses}>IGST Applicable</label>
              <ToggleButton value={form.isIgstApplicable} onChange={(v) => setForm((p) => ({ ...p, isIgstApplicable: v }))} />
            </div>
            <div className="flex items-center gap-2">
              <label className={labelClasses}>Reverse Charge</label>
              <ToggleButton value={form.reverseCharge} onChange={(v) => setForm((p) => ({ ...p, reverseCharge: v }))} />
            </div>
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

        {activeTab === "cashDetail" && renderCashDetailTab()}
        {activeTab === "taxDetails" && renderTaxDetailsTab()}
        {activeTab === "summary" && renderSummaryTab()}
        {activeTab === "attachments" && renderAttachmentsTab()}

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

export default DirectPurchaseForm;

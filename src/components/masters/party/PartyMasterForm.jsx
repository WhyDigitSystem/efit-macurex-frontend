import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
// import { masterAPI } from "../../../api/partyAPI";

/* ---------------------------------------------------------------------------- */
/* Shared design tokens                                                        */

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const labelClasses = "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid = "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-2 items-start";

/* ---------------------------------------------------------------------------- */
/* Shared building blocks                                                      */

const Field = ({
  label,
  name,
  value,
  onChange,
  error,
  required,
  type = "text",
  options,
  multiple,
  className = "",
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
          multiple={multiple}
          className={multiple ? controlClasses.replace("h-[30px]", "h-[64px]") : controlClasses}
        >
          {!multiple && <option value="">Select {label}</option>}
          {(options || []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        {error && <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">{error}</p>}
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
          value={value}
          onChange={onChange}
          rows={3}
          className={
            "w-full px-2 py-1.5 rounded border text-xs leading-snug transition-colors resize-none " +
            "bg-white dark:bg-gray-900 " +
            "border-gray-300 dark:border-gray-600 " +
            "text-gray-900 dark:text-gray-100 " +
            "placeholder-gray-400 dark:placeholder-gray-500 " +
            "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
            "dark:focus:ring-blue-400 dark:focus:border-blue-400"
          }
        />

        {error && <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">{error}</p>}
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <label className={labelClasses}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

      <input type={type} name={name} value={value} onChange={onChange} className={controlClasses} />

      {error && <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">{error}</p>}
    </div>
  );
};

const SectionHeader = ({ children }) => (
  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
    {children}
  </h3>
);

const FormButtons = ({ onCancel, onSave, isSubmitting, saveLabel }) => (
  <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
    <button
      onClick={onCancel}
      disabled={isSubmitting}
      className="
        flex items-center gap-1 px-3 py-1.5 rounded text-xs
        border border-gray-300 dark:border-gray-600
        text-gray-700 dark:text-gray-200
        bg-white dark:bg-gray-800
        hover:bg-gray-50 dark:hover:bg-gray-700
        disabled:opacity-60 disabled:cursor-not-allowed
        transition-colors
      "
    >
      <X className="h-3 w-3" />
      Cancel
    </button>

    <button
      onClick={onSave}
      disabled={isSubmitting}
      className="
        flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white
        bg-blue-600 hover:bg-blue-700
        dark:bg-blue-600 dark:hover:bg-blue-500
        disabled:opacity-60 disabled:cursor-not-allowed
        transition-colors
      "
    >
      <Save className="h-3 w-3" />
      {isSubmitting ? "Saving..." : saveLabel}
    </button>
  </div>
);

/* ---------------------------------------------------------------------------- */
/* Generic dynamic table (Contact Whom / Address Book / Sales-Purchase Item)   */

const DynamicTable = ({ title, columns, rows, onCellChange, onAddRow, onRemoveRow }) => {
  const cellInputClasses =
    "w-full h-[28px] px-1.5 rounded border text-xs leading-none bg-transparent " +
    "border-transparent hover:border-gray-300 dark:hover:border-gray-600 " +
    "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
    "text-gray-900 dark:text-gray-100 transition-colors";

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <SectionHeader>{title}</SectionHeader>

        <button
          type="button"
          onClick={onAddRow}
          className="
            flex items-center gap-1 px-2 py-1 rounded text-[11px]
            bg-blue-50 text-blue-700 hover:bg-blue-100
            dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50
            transition-colors
          "
        >
          <Plus className="h-3 w-3" />
          Add Row
        </button>
      </div>

      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900/60">
              <th className="px-2 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 w-10">
                S.No
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-2 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
              <th className="px-2 py-2 border-b border-gray-200 dark:border-gray-700 w-10"></th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={idx}
                className="border-b last:border-b-0 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/40"
              >
                <td className="px-2 py-1 text-gray-500 dark:text-gray-400">{idx + 1}</td>

                {columns.map((col) => (
                  <td key={col.key} className="px-1 py-1 min-w-[140px]">
                    {col.type === "select" ? (
                      <select
                        value={row[col.key]}
                        onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                        className={cellInputClasses}
                      >
                        <option value="">-- Select --</option>
                        {(col.options || []).map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={row[col.key]}
                        onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                        className={cellInputClasses}
                      />
                    )}
                  </td>
                ))}

                <td className="px-2 py-1 text-center">
                  {rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemoveRow(idx)}
                      className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------------------- */
/* Options (swap for real API-driven lists)                                    */

const PARTY_CATEGORIES = ["SUPPLIER", "CUSTOMER", "TRANSPORTER", "CONTRACTOR"];
const SALUTATIONS = ["Mr.", "Mrs.", "Ms.", "M/s.", "Dr."];
const PARTY_TYPES = ["PVT.LTD", "LTD", "LLP", "PROPRIETORSHIP", "PARTNERSHIP", "INDIVIDUAL"];
const ACCOUNT_NAMES = ["Sundry Creditors", "Sundry Debtors"];
const YES_NO = ["YES", "NO"];
const GROUP_INDIVIDUAL = ["Group", "Individual"];
const SUPPLIER_CATEGORIES = ["LOCAL SUPPLIER", "IMPORT SUPPLIER", "SERVICE PROVIDER"];
const PLANT_IDS = ["BANGALORE", "CHENNAI", "PUNE", "DELHI"];
const GST_TYPES = ["Registered", "Unregistered", "Composition"];
const GST_STATES = ["Karnataka", "Maharashtra", "Tamil Nadu", "Delhi", "Gujarat"];
const BELONGS_TO = ["APPLIANCES", "ELECTRICALS", "PACKAGING", "RAW MATERIAL"];
const ZONE_IDS = ["North", "South", "East", "West"];
const IF_GROUPS = ["Group A", "Group B", "Group C"];
const CITIES = ["Bangalore", "Chennai", "Mumbai", "Delhi", "Pune"];
const COUNTRIES = ["India", "United States", "United Kingdom", "UAE", "Singapore"];
const ECC_TYPES = ["Manufacturer", "Dealer", "Trader"];
const ISO_STATUS = ["Certified", "In Progress", "Not Applicable", "Expired"];
const ITEM_CODES = ["RM-001", "RM-002", "PKG-001", "SVC-001"];
const MODE_OF_PAYMENT = ["NEFT", "RTGS", "Cheque", "Cash", "IMPS"];
const CONTACT_PURPOSES = ["Sales", "Accounts", "Logistics", "Quality", "Management"];
const ADDRESS_TYPES = ["Registered Office", "Branch", "Factory", "Warehouse"];

/* ---------------------------------------------------------------------------- */

const emptyGeneralInfo = () => ({
  // Party details
  partyCategories: [],
  salutation: "",
  partyType: "",
  accountName: "",
  vendorCustomerId: "",
  partyName: "",
  active: "YES",
  groupIndividual: "",

  // Category & credit
  supplierCategory: "",
  plantId: "",
  registered: "",
  excisable: "",
  partyCreditLimit: "",
  partyCreditPeriod: "",

  // GST details
  gstType: "",
  gstnNo: "",
  gstState: "",
  gstStateCode: "",
  gstStateId: "",
  isIgstAppl: "",

  // Other details
  belongsTo: "",
  buyerName: "",
  logistics: "",
  zoneId: "",
  vendorCode: "",
  ifGroupName: "",
  legalName: "",
  tradeName: "",
  logisticCost: "",
  date: "",

  // Address & compliance
  address: "",
  city: "",
  pincode: "",
  state: "",
  country: "",
  email: "",
  website: "",
  cinNo: "",
  overDueIntPct: "",
  introdBy: "",
  cstNo: "",
  eccNo: "",
  eccType: "",
  pan: "",
  esiNo: "",
  tinNo: "",
  kstNo: "",
  phone: "",
  contactPerson: "",
  mobile: "",
  fax: "",
  effFrom: "",
});

const emptySupplierDetails = () => ({
  dateOfApproval: "",
  isoCertificationStatus: "",
  typeExtentOfControl: "",
  reAssessmentDate: "",
  creditPeriod: "",
  approved: "",
  scopeOfSupply: "",
  basisOfApproval: "",
});

const emptyShippingAddress = () => ({
  addressLine1: "",
  addressLine2: "",
  addressLine3: "",
  city: "",
  pincode: "",
  state: "",
  country: "",
});

const emptyBankDetails = () => ({
  bankName: "",
  bankAccountNo: "",
  modeOfPayment: "",
  branch: "",
  ifscSwiftCode: "",
});

const emptyContactRow = () => ({
  purpose: "",
  contactName: "",
  designation: "",
  phone: "",
  fax: "",
  email: "",
  webSite: "",
});

const emptyAddressBookRow = () => ({
  type: "",
  name: "",
  address: "",
  phone: "",
  fax: "",
  email: "",
});

const emptyItemRow = () => ({
  itemCode: "",
  itemDescription: "",
  unit: "",
});

/* ---------------------------------------------------------------------------- */

const TABS = [
  { key: "general", label: "General Info" },
  { key: "contact", label: "Contact Whom" },
  { key: "addressBook", label: "Address Book" },
  { key: "supplier", label: "Supplier Details" },
  { key: "items", label: "Sales/Purchase/S.C/L.C Item" },
  { key: "shipping", label: "Shipping Address Details" },
  { key: "bank", label: "Supplier Bank Account Details" },
];

const PartyMasterForm = ({ data, onBack }) => {
  const [activeTab, setActiveTab] = useState("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [general, setGeneral] = useState({ ...emptyGeneralInfo(), ...data?.general });
  const [supplier, setSupplier] = useState({ ...emptySupplierDetails(), ...data?.supplier });
  const [shipping, setShipping] = useState({ ...emptyShippingAddress(), ...data?.shipping });
  const [bank, setBank] = useState({ ...emptyBankDetails(), ...data?.bank });

  const [contactRows, setContactRows] = useState(
    data?.contactWhom?.length ? data.contactWhom : [emptyContactRow()]
  );
  const [addressBookRows, setAddressBookRows] = useState(
    data?.addressBook?.length ? data.addressBook : [emptyAddressBookRow()]
  );
  const [itemRows, setItemRows] = useState(data?.items?.length ? data.items : [emptyItemRow()]);

  /* -- generic handlers for the plain-object tabs -- */
  const makeChangeHandler = (setter) => (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setter((prev) => ({ ...prev, [name]: value }));
  };

  const handleGeneralChange = makeChangeHandler(setGeneral);
  const handleSupplierChange = makeChangeHandler(setSupplier);
  const handleShippingChange = makeChangeHandler(setShipping);
  const handleBankChange = makeChangeHandler(setBank);

  const handlePartyCategoriesChange = (e) => {
    const values = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setGeneral((prev) => ({ ...prev, partyCategories: values }));
  };

  /* -- generic handlers for dynamic-table tabs -- */
  const makeTableHandlers = (setter, emptyRow) => ({
    onCellChange: (idx, key, value) =>
      setter((prev) => prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row))),
    onAddRow: () => setter((prev) => [...prev, emptyRow()]),
    onRemoveRow: (idx) => setter((prev) => prev.filter((_, i) => i !== idx)),
  });

  const contactHandlers = makeTableHandlers(setContactRows, emptyContactRow);
  const addressBookHandlers = makeTableHandlers(setAddressBookRows, emptyAddressBookRow);
  const itemHandlers = makeTableHandlers(setItemRows, emptyItemRow);

  const validate = () => {
    const errors = {};

    if (!general.partyName.trim()) errors.partyName = "Party Name is required";
    if (!general.salutation) errors.salutation = "Salutation is required";
    if (!general.partyType) errors.partyType = "Party Type is required";
    if (!general.groupIndividual) errors.groupIndividual = "This field is required";
    if (!general.supplierCategory) errors.supplierCategory = "Supplier Category is required";
    if (!general.plantId) errors.plantId = "Plant ID is required";
    if (!general.excisable) errors.excisable = "This field is required";
    if (!general.gstType) errors.gstType = "GST Type is required";
    if (!general.gstState) errors.gstState = "GST State is required";
    if (!general.gstStateId.trim()) errors.gstStateId = "GST State ID is required";
    if (!general.isIgstAppl) errors.isIgstAppl = "This field is required";
    if (!general.belongsTo) errors.belongsTo = "This field is required";
    if (!general.address.trim()) errors.address = "Address is required";
    if (!general.city) errors.city = "City is required";
    if (!general.pincode.trim()) errors.pincode = "Pincode is required";
    if (!general.country) errors.country = "Country is required";
    if (!general.eccType) errors.eccType = "ECC Type is required";

    if (general.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(general.email.trim()))
      errors.email = "Enter a valid email address";

    setFieldErrors(errors);

    // jump to General Info tab if that's where the errors are
    if (Object.keys(errors).length) setActiveTab("general");

    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const payload = {
      ...(data?.id && { id: data.id }),
      general,
      supplier,
      shipping,
      bank,
      contactWhom: contactRows,
      addressBook: addressBookRows,
      items: itemRows,
      cancel: false,
      createdBy: "ITC001",
    };

    console.log(payload);

    try {
      // await masterAPI.saveParty(payload);

      alert(data ? "Party Updated Successfully!" : "Party Saved Successfully!");
      onBack();
    } catch (error) {
      console.error(error);
      alert("Failed to save Party.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-2 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="
            p-1 rounded-md
            text-gray-600 dark:text-gray-300
            hover:bg-gray-100 dark:hover:bg-gray-700
            hover:text-gray-900 dark:hover:text-white
            transition-colors
          "
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data ? "Edit Party" : "Add Party"}
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-700 mb-3  whitespace-nowrap">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={
              "relative px-1 pb-2 text-xs font-medium transition-colors shrink-0 " +
              (activeTab === tab.key
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
            }
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-blue-600 dark:bg-blue-400 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">

        {/* ---------------- General Info ---------------- */}
        {activeTab === "general" && (
          <>
            <div>
              <SectionHeader>Party Details</SectionHeader>
              <div className={fieldGrid}>
                <Field
                  type="select"
                  label="Party Category(s)"
                  name="partyCategories"
                  value={general.partyCategories}
                  onChange={handlePartyCategoriesChange}
                  options={PARTY_CATEGORIES}
                  multiple
                  className="col-span-2"
                />
                <Field
                  type="select"
                  label="Salutation"
                  name="salutation"
                  value={general.salutation}
                  onChange={handleGeneralChange}
                  error={fieldErrors.salutation}
                  options={SALUTATIONS}
                  required
                />
                <Field
                  type="select"
                  label="Party Type"
                  name="partyType"
                  value={general.partyType}
                  onChange={handleGeneralChange}
                  error={fieldErrors.partyType}
                  options={PARTY_TYPES}
                  required
                />
                <Field
                  type="select"
                  label="Account Name"
                  name="accountName"
                  value={general.accountName}
                  onChange={handleGeneralChange}
                  options={ACCOUNT_NAMES}
                />
                <Field
                  label="Vendor/Customer ID"
                  name="vendorCustomerId"
                  value={general.vendorCustomerId}
                  onChange={handleGeneralChange}
                />
                <Field
                  label="Party Name"
                  name="partyName"
                  value={general.partyName}
                  onChange={handleGeneralChange}
                  error={fieldErrors.partyName}
                  required
                  className="col-span-2"
                />
                <Field
                  type="select"
                  label="Active"
                  name="active"
                  value={general.active}
                  onChange={handleGeneralChange}
                  options={YES_NO}
                  required
                />
                <Field
                  type="select"
                  label="Group / Individual"
                  name="groupIndividual"
                  value={general.groupIndividual}
                  onChange={handleGeneralChange}
                  error={fieldErrors.groupIndividual}
                  options={GROUP_INDIVIDUAL}
                  required
                />
              </div>
            </div>

            <div>
              <SectionHeader>Category &amp; Credit</SectionHeader>
              <div className={fieldGrid}>
                <Field
                  type="select"
                  label="Supplier Category"
                  name="supplierCategory"
                  value={general.supplierCategory}
                  onChange={handleGeneralChange}
                  error={fieldErrors.supplierCategory}
                  options={SUPPLIER_CATEGORIES}
                  required
                />
                <Field
                  type="select"
                  label="Plant ID"
                  name="plantId"
                  value={general.plantId}
                  onChange={handleGeneralChange}
                  error={fieldErrors.plantId}
                  options={PLANT_IDS}
                  required
                />
                <Field
                  type="select"
                  label="Registered ?"
                  name="registered"
                  value={general.registered}
                  onChange={handleGeneralChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="Excisable?"
                  name="excisable"
                  value={general.excisable}
                  onChange={handleGeneralChange}
                  error={fieldErrors.excisable}
                  options={YES_NO}
                  required
                />
                <Field
                  type="number"
                  label="Party Credit Limit"
                  name="partyCreditLimit"
                  value={general.partyCreditLimit}
                  onChange={handleGeneralChange}
                />
                <Field
                  type="number"
                  label="Party Credit Period(Days)"
                  name="partyCreditPeriod"
                  value={general.partyCreditPeriod}
                  onChange={handleGeneralChange}
                />
              </div>
            </div>

            <div>
              <SectionHeader>GST Details</SectionHeader>
              <div className={fieldGrid}>
                <Field
                  type="select"
                  label="GST Type"
                  name="gstType"
                  value={general.gstType}
                  onChange={handleGeneralChange}
                  error={fieldErrors.gstType}
                  options={GST_TYPES}
                  required
                />
                <Field label="GSTN No" name="gstnNo" value={general.gstnNo} onChange={handleGeneralChange} />
                <Field
                  type="select"
                  label="GST State"
                  name="gstState"
                  value={general.gstState}
                  onChange={handleGeneralChange}
                  error={fieldErrors.gstState}
                  options={GST_STATES}
                  required
                />
                <Field
                  label="GST State Code"
                  name="gstStateCode"
                  value={general.gstStateCode}
                  onChange={handleGeneralChange}
                />
                <Field
                  label="GST State ID"
                  name="gstStateId"
                  value={general.gstStateId}
                  onChange={handleGeneralChange}
                  error={fieldErrors.gstStateId}
                  required
                />
                <Field
                  type="select"
                  label="Is IGST Appl"
                  name="isIgstAppl"
                  value={general.isIgstAppl}
                  onChange={handleGeneralChange}
                  error={fieldErrors.isIgstAppl}
                  options={YES_NO}
                  required
                />
              </div>
            </div>

            <div>
              <SectionHeader>Other Details</SectionHeader>
              <div className={fieldGrid}>
                <Field
                  type="select"
                  label="Belongs To"
                  name="belongsTo"
                  value={general.belongsTo}
                  onChange={handleGeneralChange}
                  error={fieldErrors.belongsTo}
                  options={BELONGS_TO}
                  required
                />
                <Field
                  type="select"
                  label="Buyer Name"
                  name="buyerName"
                  value={general.buyerName}
                  onChange={handleGeneralChange}
                  options={[]}
                />
                <Field
                  label="Logistics"
                  name="logistics"
                  value={general.logistics}
                  onChange={handleGeneralChange}
                />
                <Field
                  type="select"
                  label="ZoneId"
                  name="zoneId"
                  value={general.zoneId}
                  onChange={handleGeneralChange}
                  options={ZONE_IDS}
                />
                <Field
                  label="Vendor Code"
                  name="vendorCode"
                  value={general.vendorCode}
                  onChange={handleGeneralChange}
                />
                <Field
                  type="select"
                  label="IF Group. Group Name"
                  name="ifGroupName"
                  value={general.ifGroupName}
                  onChange={handleGeneralChange}
                  options={IF_GROUPS}
                />
                <Field
                  label="Legal Name"
                  name="legalName"
                  value={general.legalName}
                  onChange={handleGeneralChange}
                  className="col-span-2"
                />
                <Field
                  label="Trade Name"
                  name="tradeName"
                  value={general.tradeName}
                  onChange={handleGeneralChange}
                  className="col-span-2"
                />
                <Field
                  label="Logistic Cost"
                  name="logisticCost"
                  value={general.logisticCost}
                  onChange={handleGeneralChange}
                />
                <Field
                  type="date"
                  label="Date"
                  name="date"
                  value={general.date}
                  onChange={handleGeneralChange}
                />
              </div>
            </div>

            <div>
              <SectionHeader>Address &amp; Compliance</SectionHeader>
              <div className={fieldGrid}>
                <Field
                  type="textarea"
                  label="Address"
                  name="address"
                  value={general.address}
                  onChange={handleGeneralChange}
                  error={fieldErrors.address}
                  required
                  className="col-span-2 md:col-span-4 xl:col-span-6"
                />
                <Field
                  type="select"
                  label="City"
                  name="city"
                  value={general.city}
                  onChange={handleGeneralChange}
                  error={fieldErrors.city}
                  options={CITIES}
                  required
                />
                <Field
                  label="Pincode"
                  name="pincode"
                  value={general.pincode}
                  onChange={handleGeneralChange}
                  error={fieldErrors.pincode}
                  required
                />
                <Field
                  type="select"
                  label="State"
                  name="state"
                  value={general.state}
                  onChange={handleGeneralChange}
                  options={GST_STATES}
                />
                <Field
                  type="select"
                  label="Country"
                  name="country"
                  value={general.country}
                  onChange={handleGeneralChange}
                  error={fieldErrors.country}
                  options={COUNTRIES}
                  required
                />
                <Field
                  type="email"
                  label="Email"
                  name="email"
                  value={general.email}
                  onChange={handleGeneralChange}
                  error={fieldErrors.email}
                />
                <Field
                  label="Http://"
                  name="website"
                  value={general.website}
                  onChange={handleGeneralChange}
                />
                <Field label="CINNO" name="cinNo" value={general.cinNo} onChange={handleGeneralChange} />
                <Field
                  type="number"
                  label="Over Due Int. %"
                  name="overDueIntPct"
                  value={general.overDueIntPct}
                  onChange={handleGeneralChange}
                />
                <Field
                  label="Introd. by"
                  name="introdBy"
                  value={general.introdBy}
                  onChange={handleGeneralChange}
                />
                <Field label="CST No." name="cstNo" value={general.cstNo} onChange={handleGeneralChange} />
                <Field label="ECC. No" name="eccNo" value={general.eccNo} onChange={handleGeneralChange} />
                <Field
                  type="select"
                  label="ECC Type"
                  name="eccType"
                  value={general.eccType}
                  onChange={handleGeneralChange}
                  error={fieldErrors.eccType}
                  options={ECC_TYPES}
                  required
                />
                <Field label="PAN" name="pan" value={general.pan} onChange={handleGeneralChange} />
                <Field label="ESI No." name="esiNo" value={general.esiNo} onChange={handleGeneralChange} />
                <Field label="TIN No." name="tinNo" value={general.tinNo} onChange={handleGeneralChange} />
                <Field label="KST No." name="kstNo" value={general.kstNo} onChange={handleGeneralChange} />
                <Field label="Phone" name="phone" value={general.phone} onChange={handleGeneralChange} />
                <Field
                  label="Contact Person"
                  name="contactPerson"
                  value={general.contactPerson}
                  onChange={handleGeneralChange}
                  className="col-span-2"
                />
                <Field label="Mobile" name="mobile" value={general.mobile} onChange={handleGeneralChange} />
                <Field label="Fax" name="fax" value={general.fax} onChange={handleGeneralChange} />
                <Field
                  type="date"
                  label="Eff. from"
                  name="effFrom"
                  value={general.effFrom}
                  onChange={handleGeneralChange}
                />
              </div>
            </div>
          </>
        )}

        {/* ---------------- Contact Whom ---------------- */}
        {activeTab === "contact" && (
          <DynamicTable
            title="Contact Whom"
            columns={[
              { key: "purpose", label: "Purpose", type: "select", options: CONTACT_PURPOSES },
              { key: "contactName", label: "Contact Name" },
              { key: "designation", label: "Designation" },
              { key: "phone", label: "Phone" },
              { key: "fax", label: "Fax" },
              { key: "email", label: "Email" },
              { key: "webSite", label: "Web Site" },
            ]}
            rows={contactRows}
            {...contactHandlers}
          />
        )}

        {/* ---------------- Address Book ---------------- */}
        {activeTab === "addressBook" && (
          <DynamicTable
            title="Address Book"
            columns={[
              { key: "type", label: "Type", type: "select", options: ADDRESS_TYPES },
              { key: "name", label: "Name" },
              { key: "address", label: "Address" },
              { key: "phone", label: "Phone" },
              { key: "fax", label: "Fax" },
              { key: "email", label: "Email" },
            ]}
            rows={addressBookRows}
            {...addressBookHandlers}
          />
        )}

        {/* ---------------- Supplier Details ---------------- */}
        {activeTab === "supplier" && (
          <div>
            <SectionHeader>Supplier Details</SectionHeader>
            <div className={fieldGrid}>
              <Field
                type="date"
                label="Date OF Approval"
                name="dateOfApproval"
                value={supplier.dateOfApproval}
                onChange={handleSupplierChange}
              />
              <Field
                type="select"
                label="Status Of ISO Certification"
                name="isoCertificationStatus"
                value={supplier.isoCertificationStatus}
                onChange={handleSupplierChange}
                options={ISO_STATUS}
              />
              <Field
                label="Type Extent Of Control"
                name="typeExtentOfControl"
                value={supplier.typeExtentOfControl}
                onChange={handleSupplierChange}
                className="col-span-2"
              />
              <Field
                type="date"
                label="Re-assessment Date"
                name="reAssessmentDate"
                value={supplier.reAssessmentDate}
                onChange={handleSupplierChange}
              />
              <Field
                label="Credit Period"
                name="creditPeriod"
                value={supplier.creditPeriod}
                onChange={handleSupplierChange}
              />
              <Field
                label="Approved"
                name="approved"
                value={supplier.approved}
                onChange={handleSupplierChange}
              />
              <Field
                type="textarea"
                label="Scope Of Supply"
                name="scopeOfSupply"
                value={supplier.scopeOfSupply}
                onChange={handleSupplierChange}
                className="col-span-2 md:col-span-4 xl:col-span-6"
              />
              <Field
                type="textarea"
                label="Basis Of Approval"
                name="basisOfApproval"
                value={supplier.basisOfApproval}
                onChange={handleSupplierChange}
                className="col-span-2 md:col-span-4 xl:col-span-6"
              />
            </div>
          </div>
        )}

        {/* ---------------- Sales/Purchase/S.C/L.C Item ---------------- */}
        {activeTab === "items" && (
          <DynamicTable
            title="Sales/Purchase/S.C/L.C Item"
            columns={[
              { key: "itemCode", label: "Item Code", type: "select", options: ITEM_CODES },
              { key: "itemDescription", label: "Item Description" },
              { key: "unit", label: "Unit" },
            ]}
            rows={itemRows}
            {...itemHandlers}
          />
        )}

        {/* ---------------- Shipping Address Details ---------------- */}
        {activeTab === "shipping" && (
          <div>
            <SectionHeader>Shipping Address Details</SectionHeader>
            <div className={fieldGrid}>
              <Field
                label="Address Line 1"
                name="addressLine1"
                value={shipping.addressLine1}
                onChange={handleShippingChange}
                className="col-span-2 md:col-span-4 xl:col-span-6"
              />
              <Field
                label="Address Line 2"
                name="addressLine2"
                value={shipping.addressLine2}
                onChange={handleShippingChange}
                className="col-span-2 md:col-span-4 xl:col-span-6"
              />
              <Field
                label="Address Line 3"
                name="addressLine3"
                value={shipping.addressLine3}
                onChange={handleShippingChange}
                className="col-span-2 md:col-span-4 xl:col-span-6"
              />
              <Field
                type="select"
                label="City"
                name="city"
                value={shipping.city}
                onChange={handleShippingChange}
                options={CITIES}
              />
              <Field
                label="PinCode"
                name="pincode"
                value={shipping.pincode}
                onChange={handleShippingChange}
              />
              <Field
                type="select"
                label="State"
                name="state"
                value={shipping.state}
                onChange={handleShippingChange}
                options={GST_STATES}
              />
              <Field
                type="select"
                label="Country"
                name="country"
                value={shipping.country}
                onChange={handleShippingChange}
                options={COUNTRIES}
              />
            </div>
          </div>
        )}

        {/* ---------------- Supplier Bank Account Details ---------------- */}
        {activeTab === "bank" && (
          <div>
            <SectionHeader>Supplier Bank Account Details</SectionHeader>
            <div className={fieldGrid}>
              <Field
                label="Bank Name"
                name="bankName"
                value={bank.bankName}
                onChange={handleBankChange}
                className="col-span-2"
              />
              <Field
                label="Bank Account No."
                name="bankAccountNo"
                value={bank.bankAccountNo}
                onChange={handleBankChange}
              />
              <Field
                type="select"
                label="Mode Of Payment"
                name="modeOfPayment"
                value={bank.modeOfPayment}
                onChange={handleBankChange}
                options={MODE_OF_PAYMENT}
              />
              <Field label="Branch" name="branch" value={bank.branch} onChange={handleBankChange} />
              <Field
                label="IFSC / SWIFT Code"
                name="ifscSwiftCode"
                value={bank.ifscSwiftCode}
                onChange={handleBankChange}
              />
            </div>
          </div>
        )}

        <FormButtons
          onCancel={onBack}
          onSave={handleSave}
          isSubmitting={isSubmitting}
          saveLabel={data ? "Update" : "Save"}
        />
      </div>
    </div>
  );
};

export default PartyMasterForm;
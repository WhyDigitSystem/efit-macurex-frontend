import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import listOfValuesAPI from "../../../api/listOfValuesAPI";
import branchAPI from "../../../api/branchAPI";
import salesZoneAPI from "../../../api/salesZoneAPI";
import stateAPI from "../../../api/stateAPI";
import cityAPI from "../../../api/cityAPI";
import countryAPI from "../../../api/countryAPI";
import itemAPI from "../../../api/itemAPI";
import partyMasterAPI from "../../../api/partyMasterAPI";
import { departmentAPI } from "../../../api/departmentAPI";
import gstStateApi from "../../../api/gstStateApi";

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

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-2 items-start";

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
          className={
            multiple
              ? controlClasses.replace("h-[30px]", "h-[64px]")
              : controlClasses
          }
        >
          {!multiple && <option value="">Select {label}</option>}
          {(options || []).map((opt) => (
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
        className={controlClasses}
      />

      {error && (
        <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">
          {error}
        </p>
      )}
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
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <X className="h-3 w-3" />
      Cancel
    </button>

    <button
      onClick={onSave}
      disabled={isSubmitting}
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <Save className="h-3 w-3" />
      {isSubmitting ? "Saving..." : saveLabel}
    </button>
  </div>
);

/* ---------------------------------------------------------------------------- */
/* Hardcoded options (for fields not in ListOfValues)                           */

const YES_NO = [
  { value: "YES", label: "YES" },
  { value: "NO", label: "NO" },
];

const SALUTATIONS = [
  { value: "M/s.", label: "M/s." },
  { value: "Mr.", label: "Mr." }
];

const PARTY_TYPE = [
  { value: "Government Sector", label: "Government Sector" },
  { value: "Public LTD", label: "Public LTD" },
  { value: "PVT LTD", label: "PVT LTD" },
  { value: "SSI", label: "SSI" },
];

const GROUP_INDIVIDUAL = [
  { value: "Group", label: "Group" },
  { value: "Individual", label: "Individual" },
];

const GST_TYPE = [
  { value: "Registered", label: "Registered" },
  { value: "Unregistered", label: "Unregistered" },
  { value: "Importer", label: "Importer" },
  { value: "SEZ", label: "SEZ" },
  { value: "Export", label: "Export" },
];

const ECC_TYPES = [
  { value: "Manufacturer", label: "Manufacturer" },
  { value: "Dealer", label: "Dealer" },
  { value: "Both", label: "Both" },
];

const ADDRESS_TYPES = [
  { value: "Warehouse", label: "Warehouse" },
  { value: "Regd. Office", label: "Regd. Office" },
  { value: "Delivery Godown", label: "Delivery Godown" },
  { value: "Corporate Office", label: "Corporate Office" },
];

/* ---------------------------------------------------------------------------- */

const emptyGeneralInfo = () => ({
  partyCategories: [],
  partyCategories2: "",
  partyCategories3: "",
  salutation: "",
  partyType: "",
  accountName: "",
  vendorCustomerId: "",
  partyName: "",
  active: "YES",
  groupIndividual: "",
  supplierCategory: "",
  plantId: "",
  registered: "",
  excisable: "",
  partyCreditLimit: "",
  partyCreditPeriod: "",
  gstType: "",
  gstnNo: "",
  gstState: "",
  gstStateCode: "",
  gstStateId: "",
  isIgstAppl: "",
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
  range: "",
  remarks: "",
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
/* Tab configuration                                                           */

const CHILD_TABS = [
  { key: "generalInfo", label: "General Info" },
  { key: "contact", label: "Contact Whom" },
  { key: "addressBook", label: "Address Book" },
  { key: "supplierDetails", label: "Supplier Details" },
  { key: "salesPurchase", label: "Sales/Purchase/S.C./L.C Item" },
  { key: "shippingAddress", label: "Shipping Address Details" }
];

/* ---------------------------------------------------------------------------- */

const PartyMasterForm = ({ data, onBack }) => {
  const [orgId] = useState(localStorage.getItem("orgId"));
  const [branch] = useState(localStorage.getItem("branchId"));
  const [finYear] = useState(localStorage.getItem("finYear"));
  const [activeChildTab, setActiveChildTab] = useState("generalInfo");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [toastMessage, setToastMessage] = useState(null);

  // State for API-loaded options
  const [listOfValuesData, setListOfValuesData] = useState({});
  const [cityData, setCityData] = useState([]);
  const [countryData, setCountryData] = useState([]);
  const [logisticsData, setLogisticsData] = useState([]);
  const [supplierCategoryData, setSupplierCategoryData] = useState([]);
  const [ifGroupData, setIfGroupData] = useState([]);
  const [belongsToData, setBelongsToData] = useState([]);
  const [gstStateData, setGstStateData] = useState([]);
  const [plantData, setPlantData] = useState([]);
  const [zoneData, setZoneData] = useState([]);
  const [stateData, setStateData] = useState([]);
  const [itemData, setItemData] = useState([]);
  const [buyerData, setBuyerData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);

  const [general, setGeneral] = useState({
    ...emptyGeneralInfo(),
    ...data?.general,
  });
  const [supplier, setSupplier] = useState({
    ...emptySupplierDetails(),
    ...data?.supplier,
  });
  const [shipping, setShipping] = useState({
    ...emptyShippingAddress(),
    ...data?.shipping,
  });
  const [bank, setBank] = useState({ ...emptyBankDetails(), ...data?.bank });

  // Party Category filtered options
  const partyCategoryOptions = listOfValuesData.partyCategory || [];

  const partyCategory2Options = partyCategoryOptions.filter(
    option => !general.partyCategories.includes(String(option.value))
  );

  const partyCategory3Options = partyCategoryOptions.filter(
    option =>
      !general.partyCategories.includes(String(option.value)) &&
      String(option.value) !== String(general.partyCategories2)
  );

  const [contactRows, setContactRows] = useState(
    data?.contactWhom?.length ? data.contactWhom : [emptyContactRow()],
  );
  const [addressBookRows, setAddressBookRows] = useState(
    data?.addressBook?.length ? data.addressBook : [emptyAddressBookRow()],
  );
  const [itemRows, setItemRows] = useState(
    data?.items?.length ? data.items : [emptyItemRow()],
  );

  // ListOfValues groups mapping
  const LIST_OF_VALUES_GROUPS = {
    partyCategory: "Party Category",
    supplierCategory: "Supplier Category",
    belongsToData: "Belongs To"
  };

  // Load data on mount
  useEffect(() => {
    loadListOfValuesData();
    loadBranches();
    loadZones();
    loadStates();
    loadGstStates();
    loadCities();
    loadCountries();
    loadItems();
    loadBuyerDetails();
    loadDepartments();
  }, []);

  useEffect(() => {
    if (data && data.id) {
      fetchPartyData(data.id);
    }
  }, [data]);

  const fetchPartyData = async (id) => {
    setIsLoading(true);
    try {
      const response = await partyMasterAPI.getPartyById(id);
      // The response has the customer data inside paramObjectsMap.customer
      const partyData = response?.paramObjectsMap?.customer;

      if (partyData) {
        console.log("Fetched party data:", partyData);
        const formData = mapApiResponseToForm(partyData);
        setGeneral(formData.general);
        setSupplier(formData.supplier);
        setShipping(formData.shipping);
        setBank(formData.bank);
        if (formData.contactWhom) setContactRows(formData.contactWhom);
        if (formData.addressBook) setAddressBookRows(formData.addressBook);
        if (formData.items) setItemRows(formData.items);
      } else {
        setToastMessage({
          type: "error",
          message: "Party data not found"
        });
      }
    } catch (error) {
      console.error("Error fetching party data:", error);
      setToastMessage({
        type: "error",
        message: "Failed to load party data for editing"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const mapApiResponseToForm = (apiData) => {
    // Helper to get nested object id
    const getId = (obj) => obj?.id ? String(obj.id) : "";

    return {
      general: {
        id: apiData.id || 0,
        // Party Categories - using the id from the nested objects
        partyCategories: apiData.customerCategory?.id ? [String(apiData.customerCategory.id)] : [],
        partyCategories2: getId(apiData.customerCategory1),
        partyCategories3: getId(apiData.customerCategory2),
        salutation: apiData.salutation || "",
        partyType: apiData.customerType || "",
        accountName: apiData.accountName || "",
        vendorCustomerId: apiData.docId || "",
        partyName: apiData.customerName || "",
        active: apiData.active === "Active" ? "YES" : "NO",
        groupIndividual: apiData.groupCompany ? "Group" : "Individual",
        supplierCategory: getId(apiData.supplierType),
        plantId: getId(apiData.branch),
        registered: apiData.registered ? "YES" : "NO",
        excisable: apiData.excisable ? "YES" : "NO",
        partyCreditLimit: apiData.partyCreditLimit?.toString() || "",
        partyCreditPeriod: apiData.partyCreditPeriod?.toString() || "",
        gstType: apiData.gstType || "",
        gstnNo: apiData.gstNo || "",
        gstState: getId(apiData.gstState),
        gstStateCode: apiData.gstState?.stateCode || "",
        gstStateId: apiData.gstState?.gstStateId || "",
        isIgstAppl: apiData.gstApplicable ? "YES" : "NO",
        belongsTo: getId(apiData.belongsTo),
        buyerName: getId(apiData.buyerName),
        logistics: "",
        zoneId: getId(apiData.zone),
        vendorCode: apiData.vendorCode || "",
        ifGroupName: apiData.groupName || "",
        legalName: apiData.customerLegalName || "",
        tradeName: apiData.tradeName || "",
        logisticCost: "",
        date: apiData.docDate || "",
        address: apiData.address || "",
        city: getId(apiData.city),
        pincode: apiData.pincode || "",
        state: getId(apiData.state),
        country: getId(apiData.country),
        email: apiData.email || "",
        website: apiData.webAddress || "",
        cinNo: apiData.cinNo || "",
        overDueIntPct: apiData.overDueInterest?.toString() || "",
        introdBy: apiData.introducedBy || "",
        cstNo: apiData.cstNo || "",
        eccNo: apiData.eccNo || "",
        eccType: apiData.eccType || "",
        pan: apiData.panNo || "",
        esiNo: apiData.esiNo || "",
        tinNo: apiData.tinNo || "",
        kstNo: apiData.kstNo || "",
        phone: apiData.phone || "",
        contactPerson: apiData.contactPerson || "",
        mobile: "",
        fax: "",
        effFrom: apiData.effectiveFrom || "",
        range: apiData.range || "",
        remarks: apiData.remarks || "",
      },
      supplier: {
        dateOfApproval: apiData.dateOfApproval || "",
        isoCertificationStatus: apiData.isoStatus || "",
        typeExtentOfControl: apiData.typeExtentOfControl || "",
        reAssessmentDate: apiData.reAssessmentDate || "",
        creditPeriod: apiData.creditPeriod?.toString() || "",
        approved: apiData.approved ? "YES" : "NO",
        scopeOfSupply: apiData.scopeOfSupply || "",
        basisOfApproval: apiData.basisOfApproval || "",
      },
      shipping: apiData.customerShippingDetails?.length > 0 ? {
        addressLine1: apiData.customerShippingDetails[0].shippingAddress || "",
        addressLine2: "",
        addressLine3: "",
        city: getId(apiData.customerShippingDetails[0].shippingCity),
        pincode: apiData.customerShippingDetails[0].shippingPincode || "",
        state: getId(apiData.customerShippingDetails[0].shippingState),
        country: getId(apiData.customerShippingDetails[0].shippingCountry),
      } : emptyShippingAddress(),
      bank: {
        bankName: apiData.bankName || "",
        bankAccountNo: apiData.bankAccountNo || "",
        modeOfPayment: apiData.paymentMode || "",
        branch: "",
        ifscSwiftCode: apiData.ifscCode || "",
      },
      contactWhom: apiData.customerContactDetails?.length > 0
        ? apiData.customerContactDetails.map(contact => ({
          purpose: getId(contact.purpose),
          contactName: contact.contactName || "",
          designation: contact.designation || "",
          phone: contact.phone || "",
          fax: "",
          email: contact.email || "",
          webSite: contact.website || "",
        }))
        : [emptyContactRow()],
      items: apiData.customerItemDetails?.length > 0
        ? apiData.customerItemDetails.map(item => ({
          itemCode: item.item?.id ? String(item.item.id) : "",
          itemDescription: item.item?.itemDescription || "",
          unit: item.item?.unit?.unitId || "",
        }))
        : [emptyItemRow()],
      // Address Book - mapping shipping address types
      addressBook: apiData.customerShippingDetails?.length > 0
        ? apiData.customerShippingDetails.map(shipping => ({
          type: shipping.shippingAddressType || "",
          name: "",
          address: shipping.shippingAddress || "",
          phone: "",
          fax: "",
          email: "",
        }))
        : [emptyAddressBookRow()],
    };
  };

  const loadBranches = useCallback(async () => {
    try {
      const response = await branchAPI.getBranchByOrgId(orgId);
      const options = (response || []).map(branch => ({
        value: branch.id,
        label: branch.branchName,
      }));
      setPlantData(options);
    } catch (error) {
      console.error("Failed to load branches:", error);
      setPlantData([]);
    }
  }, [orgId]);

  const loadZones = useCallback(async () => {
    try {
      const response = await salesZoneAPI.getSalesZoneByOrgId(orgId, branch);
      const options = (response || []).map(branch => ({
        value: branch.id,
        label: branch.zoneId,
      }));
      setZoneData(options);
    } catch (error) {
      console.error("Failed to load sales zones:", error);
      setZoneData([]);
    }
  }, [orgId, branch]);

  const loadGstStates = useCallback(async () => {
    try {
      const response = await gstStateApi.getGstStateList(branch, orgId);
      const options = (response || []).map(state => ({
        value: state.id,
        label: state.stateName,
        stateCode: state.stateCode,
        stateNumber: state.gstStateId,
      }));
      setGstStateData(options);
    } catch (error) {
      console.error("Failed to load states:", error);
      setStateData([]);
    }
  }, [orgId]);

  const loadStates = useCallback(async () => {
    try {
      const response = await stateAPI.getStates(orgId);
      const options = (response || []).map(state => ({
        value: state.id,
        label: state.stateName,
        stateCode: state.stateCode,
        stateNumber: state.gstStateId,
      }));
      setStateData(options);
    } catch (error) {
      console.error("Failed to load states:", error);
      setStateData([]);
    }
  }, [orgId]);

  const loadCities = useCallback(async () => {
    try {
      const response = await cityAPI.getCities(orgId);
      const options = (response || []).map(state => ({
        value: state.id,
        label: state.cityName,
      }));
      setCityData(options);
    } catch (error) {
      console.error("Failed to load cities:", error);
      setCityData([]);
    }
  }, [orgId]);

  const loadCountries = useCallback(async () => {
    try {
      const response = await countryAPI.getCountries(orgId);
      const options = (response || []).map(state => ({
        value: state.id,
        label: state.countryName,
      }));
      setCountryData(options);
    } catch (error) {
      console.error("Failed to load countries:", error);
      setCountryData([]);
    }
  }, [orgId]);

  const loadItems = useCallback(async () => {
    try {
      const response = await itemAPI.getItems(orgId, branch);
      const options = (response || []).map(item => ({
        value: item.id,
        label: item.itemCode,
        itemDescription: item.itemDescription,
        unit: item.primaryUnits?.primaryUnit,
      }));
      setItemData(options);
    } catch (error) {
      console.error("Failed to load items:", error);
      setItemData([]);
    }
  }, [orgId, branch]);

  const loadBuyerDetails = useCallback(async () => {
    try {
      const response = await partyMasterAPI.getBuyerDetails(orgId, branch);
      const options = (response || []).map(item => ({
        value: item.employeeId,
        label: item.employeeName,
      }));
      setBuyerData(options);
    } catch (error) {
      console.error("Failed to load items:", error);
      setBuyerData([]);
    }
  }, [orgId, branch]);

  const loadDepartments = useCallback(async () => {
    try {
      const response = await departmentAPI.getAllDepartments(orgId, branch);
      const departments = response?.paramObjectsMap?.departmentVO || [];
      const options = departments.map(item => ({
        value: item.id,
        label: item.departmentName,
      }));
      setDepartmentData(options);
    } catch (error) {
      console.error("Failed to load departments:", error);
      setDepartmentData([]);
    }
  }, [orgId, branch]);

  const loadListOfValuesData = async () => {
    try {
      const result = {};

      await Promise.all(
        Object.entries(LIST_OF_VALUES_GROUPS).map(async ([key, group]) => {
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
      setSupplierCategoryData(result.supplierCategory || []);
      setIfGroupData(result.ifGroupName || []);
      setBelongsToData(result.belongsToData || []);

    } catch (err) {
      console.error("Error loading ListOfValues:", err);
    }
  };

  const makeChangeHandler = (setter) => (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setter((prev) => ({ ...prev, [name]: value }));
  };

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: "" }));
    }

    if (name === "gstState") {
      const selectedState = gstStateData.find(
        state => String(state.value) === String(value)
      );

      setGeneral(prev => ({
        ...prev,
        gstState: value,
        gstStateCode: selectedState?.stateCode || "",
        gstStateId: selectedState?.stateNumber || "",
      }));

      return;
    }

    setGeneral(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (index, value) => {
    const selectedItem = itemData.find(
      item => String(item.value) === String(value)
    );

    const newRows = [...itemRows];

    newRows[index] = {
      ...newRows[index],
      itemCode: value,
      itemDescription: selectedItem?.itemDescription || "",
      unit: selectedItem?.unit || "",
    };

    setItemRows(newRows);
  };

  const handleSupplierChange = makeChangeHandler(setSupplier);
  const handleShippingChange = makeChangeHandler(setShipping);
  const handleBankChange = makeChangeHandler(setBank);

  const handlePartyCategoriesChange = (e) => {
    const values = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setGeneral((prev) => ({ ...prev, partyCategories: values }));
  };

  const validate = () => {
    const errors = {};

    if (!general.partyName.trim()) errors.partyName = "Party Name is required";
    if (!general.salutation) errors.salutation = "Salutation is required";
    if (!general.partyType) errors.partyType = "Party Type is required";
    if (!general.groupIndividual)
      errors.groupIndividual = "This field is required";
    if (!general.supplierCategory)
      errors.supplierCategory = "Supplier Category is required";
    if (!general.plantId) errors.plantId = "Plant ID is required";
    if (!general.excisable) errors.excisable = "This field is required";
    if (!general.gstType) errors.gstType = "GST Type is required";
    if (!general.gstState) errors.gstState = "GST State is required";
    if (!general.isIgstAppl) errors.isIgstAppl = "This field is required";
    if (!general.belongsTo) errors.belongsTo = "This field is required";
    if (!general.address.trim()) errors.address = "Address is required";
    if (!general.city) errors.city = "City is required";
    if (!general.pincode.trim()) errors.pincode = "Pincode is required";
    if (!general.country) errors.country = "Country is required";
    if (!general.eccType) errors.eccType = "ECC Type is required";

    if (
      general.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(general.email.trim())
    )
      errors.email = "Enter a valid email address";

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const buildPayload = () => {
    const payload = {
      // Basic Info
      accountName: general.accountName || "",
      active: general.active === "YES",
      address: general.address || "",
      approved: supplier.approved === "YES",
      bankAccountNo: bank.bankAccountNo || "",
      bankName: bank.bankName || "",
      basisOfApproval: supplier.basisOfApproval || "",
      belongsTo: general.belongsTo ? Number(general.belongsTo) : 0,
      branch: Number(general.plantId) || 0,
      buyerName: general.buyerName ? Number(general.buyerName) : 0,
      cancelRemarks: "",

      // Customer Identification
      cinNo: general.cinNo || "",
      city: general.city ? Number(general.city) : 0,
      contactPerson: general.contactPerson || "",
      country: general.country ? Number(general.country) : 0,
      createdBy: localStorage.getItem("userName") || "",
      creditPeriod: supplier.creditPeriod ? Number(supplier.creditPeriod) : 0,
      cstNo: general.cstNo || "",

      // Customer Categories
      customerCategory: general.partyCategories.length > 0 ? Number(general.partyCategories[0]) : 0,
      customerCategory1: general.partyCategories2 ? Number(general.partyCategories2) : 0,
      customerCategory2: general.partyCategories3 ? Number(general.partyCategories3) : 0,

      // Customer Contact Details
      customerContactDetails: contactRows
        .filter(row => row.contactName || row.purpose)
        .map(row => ({
          contactName: row.contactName || "",
          designation: row.designation || "",
          email: row.email || "",
          phone: row.phone || "",
          purpose: row.purpose ? Number(row.purpose) : 0,
          website: row.webSite || "",
        })),

      // Customer Item Details
      customerItemDetailsDTO: itemRows
        .filter(row => row.itemCode)
        .map(row => ({
          itemId: Number(row.itemCode),
        })),

      // Customer Names
      customerLegalName: general.legalName || "",
      customerName: general.partyName || "",

      // Customer Shipping Details
      customerShippingDetails: [{
        shippingAddress: shipping.addressLine1 || "",
        shippingAddressType: addressBookRows.length > 0 ? addressBookRows[0].type : "",
        shippingCity: shipping.city ? Number(shipping.city) : 0,
        shippingCountry: shipping.country ? Number(shipping.country) : 0,
        shippingPincode: shipping.pincode || "",
        shippingState: shipping.state ? Number(shipping.state) : 0,
      }],

      customerType: general.partyType || "",

      // Dates
      dateOfApproval: supplier.dateOfApproval || "",
      docDate: general.date || "",
      docId: general.vendorCustomerId || "",

      // ECC Details
      eccNo: general.eccNo || "",
      eccType: general.eccType || "",
      panNo: general.pan || "",
      esiNo: general.esiNo || "",
      tinNo: general.tinNo || "",
      effectiveFrom: general.effFrom || "",
      email: general.email || "",
      excisable: general.excisable === "YES",
      financialYear: finYear || "",

      // Group Info
      groupCompany: general.groupIndividual === "Group",
      groupName: general.ifGroupName || "",

      // GST Details
      gstApplicable: general.isIgstAppl === "YES",
      gstNo: general.gstnNo || "",
      gstState: general.gstState ? Number(general.gstState) : 0,
      gstType: general.gstType || "",

      // IDs
      id: data?.id || 0,
      ifscCode: bank.ifscSwiftCode || "",
      introducedBy: general.introdBy || "",
      isoStatus: supplier.isoCertificationStatus || "",
      kstNo: general.kstNo || "",
      orgId: Number(orgId),
      overDueInterest: general.overDueIntPct ? Number(general.overDueIntPct) : 0,

      // Party Credit
      partyCreditLimit: general.partyCreditLimit ? Number(general.partyCreditLimit) : 0,
      partyCreditPeriod: general.partyCreditPeriod ? Number(general.partyCreditPeriod) : 0,
      paymentMode: bank.modeOfPayment || "",
      phone: general.phone || "",
      pincode: general.pincode || "",

      // Additional Info
      range: general.range || "",
      reAssessmentDate: supplier.reAssessmentDate || "",
      registered: general.registered === "YES",
      remarks: general.remarks || "",
      salutation: general.salutation || "",
      scopeOfSupply: supplier.scopeOfSupply || "",
      state: general.state ? Number(general.state) : 0,
      supplierType: general.supplierCategory ? Number(general.supplierCategory) : 0,
      tradeName: general.tradeName || "",
      typeExtentOfControl: supplier.typeExtentOfControl || "",
      vendorCode: general.vendorCode || "",
      webAddress: general.website || "",
      zone: general.zoneId ? Number(general.zoneId) : 0,
    };

    // Clean up empty/undefined values
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined || payload[key] === null || payload[key] === "") {
        if (key !== "id" && key !== "orgId" && key !== "branch") {
          delete payload[key];
        }
      }
    });

    // Remove id if it's 0 (new record)
    if (payload.id === 0) {
      delete payload.id;
    }

    return payload;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setToastMessage(null);

    try {
      const payload = buildPayload();
      console.log("Saving payload:", payload);

      const response = await partyMasterAPI.createUpdatePartyMaster(payload);
      console.log("API Response:", response);

      if (response?.status === true) {
        setToastMessage({
          type: "success",
          message: data?.id ? "Party Updated Successfully!" : "Party Saved Successfully!"
        });

        setTimeout(() => {
          onBack();
        }, 1500);
      } else {
        setToastMessage({
          type: "error",
          message: response?.message || "Failed to save party"
        });
      }
    } catch (error) {
      console.error("Error saving party:", error);
      setToastMessage({
        type: "error",
        message: error.message || "Error saving party"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-2 max-w-7xl relative">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading party data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 max-w-7xl">
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
        <button
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data ? "Edit Party" : "Add Party"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Party Details (always visible) ---------------- */}
        <div>
          <SectionHeader>Party Details</SectionHeader>
          <div className={fieldGrid}>
            <Field
              type="select"
              label="Party Category(s)"
              name="partyCategories"
              value={general.partyCategories}
              onChange={handlePartyCategoriesChange}
              error={fieldErrors.partyCategories}
              options={listOfValuesData.partyCategory || []}
              required
            />
            <Field
              type="select"
              label="Party Category"
              name="partyCategories2"
              value={general.partyCategories2}
              onChange={handleGeneralChange}
              error={fieldErrors.partyCategories2}
              options={partyCategory2Options}
            />
            <Field
              type="select"
              label="Party Category"
              name="partyCategories3"
              value={general.partyCategories3}
              onChange={handleGeneralChange}
              error={fieldErrors.partyCategories3}
              options={partyCategory3Options}
            />

            <Field
              type="select"
              label="Supplier Category"
              name="supplierCategory"
              value={general.supplierCategory}
              onChange={handleGeneralChange}
              error={fieldErrors.supplierCategory}
              options={supplierCategoryData}
              required
            />

            <Field
              type="select"
              label="Plant ID"
              name="plantId"
              value={general.plantId}
              onChange={handleGeneralChange}
              error={fieldErrors.plantId}
              options={plantData}
              required
            />

            <Field
              type="date"
              label="Date"
              name="date"
              value={general.date}
              onChange={handleGeneralChange}
              error={fieldErrors.date}
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
              options={PARTY_TYPE}
              required
            />

            <Field
              label="Account Name"
              name="accountName"
              value={general.accountName}
              onChange={handleGeneralChange}
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
              type="select"
              label="Group / Individual"
              name="groupIndividual"
              value={general.groupIndividual}
              onChange={handleGeneralChange}
              error={fieldErrors.groupIndividual}
              options={GROUP_INDIVIDUAL}
              required
            />

            <Field
              type="select"
              label="ZoneId"
              name="zoneId"
              value={general.zoneId}
              onChange={handleGeneralChange}
              options={zoneData}
            />

            <Field
              label="Vendor Code"
              name="vendorCode"
              value={general.vendorCode}
              onChange={handleGeneralChange}
            />

            <Field
              label="IF Group, Group Name"
              name="ifGroupName"
              value={general.ifGroupName}
              onChange={handleGeneralChange}
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

            <Field
              type="select"
              label="Belongs To"
              name="belongsTo"
              value={general.belongsTo}
              onChange={handleGeneralChange}
              error={fieldErrors.belongsTo}
              options={belongsToData}
              required
            />

            <Field
              type="select"
              label="Buyer Name"
              name="buyerName"
              value={general.buyerName}
              onChange={handleGeneralChange}
              options={buyerData}
            />

            <Field
              label="Logistics"
              name="logistics"
              value={general.logistics}
              onChange={handleGeneralChange}
            />

            <Field
              label="Logistic Cost"
              name="logisticCost"
              value={general.logisticCost}
              onChange={handleGeneralChange}
            />

            <Field
              type="select"
              label="GST Type"
              name="gstType"
              value={general.gstType}
              onChange={handleGeneralChange}
              error={fieldErrors.gstType}
              options={GST_TYPE}
              required
            />

            <Field
              label="GSTN No"
              name="gstnNo"
              value={general.gstnNo}
              onChange={handleGeneralChange}
            />

            <Field
              type="select"
              label="GST State"
              name="gstState"
              value={general.gstState}
              onChange={handleGeneralChange}
              error={fieldErrors.gstState}
              options={gstStateData}
              required
            />

            <Field
              label="GST State Code"
              name="gstStateCode"
              value={general.gstStateCode}
              readOnly
            />

            <Field
              label="GST State ID"
              name="gstStateId"
              value={general.gstStateId}
              readOnly
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

        {/* ---------------- Tabs Section ---------------- */}
        <section className="mt-4 bg-white dark:bg-gray-800">
          {/* Tabs Header */}
          <div className="flex flex-wrap items-center border-b border-gray-200 dark:border-gray-700 mb-3">
            <div className="flex flex-wrap">
              {CHILD_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveChildTab(tab.key)}
                  className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${activeChildTab === tab.key
                    ? "border-blue-600 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-2">
            {activeChildTab === "generalInfo" && (
              <div className={fieldGrid}>
                <Field
                  label="Address"
                  name="address"
                  value={general.address}
                  onChange={handleGeneralChange}
                  error={fieldErrors.address}
                  required
                  className="col-span-2"
                />

                <Field
                  type="select"
                  label="City"
                  name="city"
                  value={general.city}
                  onChange={handleGeneralChange}
                  error={fieldErrors.city}
                  options={cityData}
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
                  options={stateData}
                />

                <Field
                  type="select"
                  label="Country"
                  name="country"
                  value={general.country}
                  onChange={handleGeneralChange}
                  error={fieldErrors.country}
                  options={countryData}
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
                  label="Website"
                  name="website"
                  value={general.website}
                  onChange={handleGeneralChange}
                />

                <Field
                  label="CIN No"
                  name="cinNo"
                  value={general.cinNo}
                  onChange={handleGeneralChange}
                />

                <Field
                  type="number"
                  label="Over Due Int %"
                  name="overDueIntPct"
                  value={general.overDueIntPct}
                  onChange={handleGeneralChange}
                />

                <Field
                  label="Introd By"
                  name="introdBy"
                  value={general.introdBy}
                  onChange={handleGeneralChange}
                />

                <Field
                  label="CST No"
                  name="cstNo"
                  value={general.cstNo}
                  onChange={handleGeneralChange}
                />

                <Field
                  label="ECC No"
                  name="eccNo"
                  value={general.eccNo}
                  onChange={handleGeneralChange}
                />

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

                <Field
                  label="PAN"
                  name="pan"
                  value={general.pan}
                  onChange={handleGeneralChange}
                />

                <Field
                  label="ESI No"
                  name="esiNo"
                  value={general.esiNo}
                  onChange={handleGeneralChange}
                />

                <Field
                  label="TIN No"
                  name="tinNo"
                  value={general.tinNo}
                  onChange={handleGeneralChange}
                />

                <Field
                  label="KST No"
                  name="kstNo"
                  value={general.kstNo}
                  onChange={handleGeneralChange}
                />

                <Field
                  label="Phone"
                  name="phone"
                  value={general.phone}
                  onChange={handleGeneralChange}
                />

                <Field
                  label="Contact Person"
                  name="contactPerson"
                  value={general.contactPerson}
                  onChange={handleGeneralChange}
                  className="col-span-2"
                />

                <Field
                  label="Mobile"
                  name="phone"
                  value={general.phone}
                  onChange={handleGeneralChange}
                />

                <Field
                  label="Fax"
                  name="fax"
                  value={general.fax}
                  onChange={handleGeneralChange}
                />

                <Field
                  type="date"
                  label="Eff From"
                  name="effFrom"
                  value={general.effFrom}
                  onChange={handleGeneralChange}
                />

                <Field
                  label="Range"
                  name="range"
                  value={general.range}
                  onChange={handleGeneralChange}
                />

                <Field
                  label="Remarks"
                  name="remarks"
                  value={general.remarks}
                  onChange={handleGeneralChange}
                  className="col-span-2"
                />
              </div>
            )}

            {activeChildTab === "contact" && (
              <div>
                <div className="mb-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setContactRows((prev) => [...prev, emptyContactRow()]);
                    }}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                  >
                    <Plus size={12} />
                    Add Row
                  </button>
                </div>
                <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                      <tr>
                        <th className="p-1 w-8 text-center dark:text-white">#</th>
                        <th className="p-1 text-left dark:text-white">Purpose</th>
                        <th className="p-1 text-left dark:text-white">Contact Name</th>
                        <th className="p-1 text-left dark:text-white">Designation</th>
                        <th className="p-1 text-left dark:text-white">Phone</th>
                        <th className="p-1 text-left dark:text-white">Fax</th>
                        <th className="p-1 text-left dark:text-white">Email</th>
                        <th className="p-1 text-left dark:text-white">Web Site</th>
                        <th className="p-1 w-20 text-center dark:text-white">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contactRows.map((row, idx) => (
                        <tr key={idx} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="p-1 text-center font-medium dark:text-white">{idx + 1}</td>
                          <td className="p-1 align-top">
                            <select
                              value={row.purpose}
                              onChange={(e) => {
                                const newRows = [...contactRows];
                                newRows[idx].purpose = e.target.value;
                                setContactRows(newRows);
                              }}
                              className="w-full h-8 px-2 rounded border text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">-- Select --</option>
                              {departmentData.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </td>
                          <td className="p-1 align-top">
                            <input
                              type="text"
                              value={row.contactName}
                              onChange={(e) => {
                                const newRows = [...contactRows];
                                newRows[idx].contactName = e.target.value;
                                setContactRows(newRows);
                              }}
                              className="w-full h-8 px-2 rounded border text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="p-1 align-top">
                            <input
                              type="text"
                              value={row.designation}
                              onChange={(e) => {
                                const newRows = [...contactRows];
                                newRows[idx].designation = e.target.value;
                                setContactRows(newRows);
                              }}
                              className="w-full h-8 px-2 rounded border text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="p-1 align-top">
                            <input
                              type="text"
                              value={row.phone}
                              onChange={(e) => {
                                const newRows = [...contactRows];
                                newRows[idx].phone = e.target.value;
                                setContactRows(newRows);
                              }}
                              className="w-full h-8 px-2 rounded border text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="p-1 align-top">
                            <input
                              type="text"
                              value={row.fax}
                              onChange={(e) => {
                                const newRows = [...contactRows];
                                newRows[idx].fax = e.target.value;
                                setContactRows(newRows);
                              }}
                              className="w-full h-8 px-2 rounded border text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="p-1 align-top">
                            <input
                              type="text"
                              value={row.email}
                              onChange={(e) => {
                                const newRows = [...contactRows];
                                newRows[idx].email = e.target.value;
                                setContactRows(newRows);
                              }}
                              className="w-full h-8 px-2 rounded border text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="p-1 align-top">
                            <input
                              type="text"
                              value={row.webSite}
                              onChange={(e) => {
                                const newRows = [...contactRows];
                                newRows[idx].webSite = e.target.value;
                                setContactRows(newRows);
                              }}
                              className="w-full h-8 px-2 rounded border text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="p-1 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (contactRows.length > 1) {
                                  setContactRows(contactRows.filter((_, i) => i !== idx));
                                }
                              }}
                              disabled={contactRows.length <= 1}
                              className={`h-5 w-5 rounded text-white flex items-center justify-center ${contactRows.length <= 1
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
              </div>
            )}

            {activeChildTab === "addressBook" && (
              <div>
                <div className="mb-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setAddressBookRows((prev) => [...prev, emptyAddressBookRow()]);
                    }}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                  >
                    <Plus size={12} />
                    Add Row
                  </button>
                </div>
                <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                      <tr>
                        <th className="p-1 w-8 text-center dark:text-white">#</th>
                        <th className="p-1 text-left dark:text-white">Type</th>
                        <th className="p-1 text-left dark:text-white">Name</th>
                        <th className="p-1 text-left dark:text-white">Address</th>
                        <th className="p-1 text-left dark:text-white">Phone</th>
                        <th className="p-1 text-left dark:text-white">Fax</th>
                        <th className="p-1 text-left dark:text-white">Email</th>
                        <th className="p-1 w-20 text-center dark:text-white">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {addressBookRows.map((row, idx) => (
                        <tr key={idx} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="p-1 text-center font-medium dark:text-white">{idx + 1}</td>
                          <td className="p-1 align-top">
                            <select
                              value={row.type}
                              onChange={(e) => {
                                const newRows = [...addressBookRows];
                                newRows[idx].type = e.target.value;
                                setAddressBookRows(newRows);
                              }}
                              className="w-full h-8 px-2 rounded border text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">-- Select --</option>
                              {ADDRESS_TYPES.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </td>
                          <td className="p-1 align-top">
                            <input
                              type="text"
                              value={row.name}
                              onChange={(e) => {
                                const newRows = [...addressBookRows];
                                newRows[idx].name = e.target.value;
                                setAddressBookRows(newRows);
                              }}
                              className="w-full h-8 px-2 rounded border text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="p-1 align-top">
                            <input
                              type="text"
                              value={row.address}
                              onChange={(e) => {
                                const newRows = [...addressBookRows];
                                newRows[idx].address = e.target.value;
                                setAddressBookRows(newRows);
                              }}
                              className="w-full h-8 px-2 rounded border text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="p-1 align-top">
                            <input
                              type="text"
                              value={row.phone}
                              onChange={(e) => {
                                const newRows = [...addressBookRows];
                                newRows[idx].phone = e.target.value;
                                setAddressBookRows(newRows);
                              }}
                              className="w-full h-8 px-2 rounded border text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="p-1 align-top">
                            <input
                              type="text"
                              value={row.fax}
                              onChange={(e) => {
                                const newRows = [...addressBookRows];
                                newRows[idx].fax = e.target.value;
                                setAddressBookRows(newRows);
                              }}
                              className="w-full h-8 px-2 rounded border text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="p-1 align-top">
                            <input
                              type="text"
                              value={row.email}
                              onChange={(e) => {
                                const newRows = [...addressBookRows];
                                newRows[idx].email = e.target.value;
                                setAddressBookRows(newRows);
                              }}
                              className="w-full h-8 px-2 rounded border text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="p-1 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (addressBookRows.length > 1) {
                                  setAddressBookRows(addressBookRows.filter((_, i) => i !== idx));
                                }
                              }}
                              disabled={addressBookRows.length <= 1}
                              className={`h-5 w-5 rounded text-white flex items-center justify-center ${addressBookRows.length <= 1
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
              </div>
            )}

            {activeChildTab === "supplierDetails" && (
              <div className={fieldGrid}>
                <Field
                  type="date"
                  label="Date of Approval"
                  name="dateOfApproval"
                  value={supplier.dateOfApproval}
                  onChange={handleSupplierChange}
                />
                <Field
                  type="select"
                  label="Status of ISO Certification"
                  name="isoCertificationStatus"
                  value={supplier.isoCertificationStatus}
                  onChange={handleSupplierChange}
                  options={YES_NO}
                />
                <Field
                  label="Type Extent of Control"
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
                  type="select"
                  label="Approved"
                  name="approved"
                  value={supplier.approved}
                  onChange={handleSupplierChange}
                  options={YES_NO}
                />
                <Field
                  label="Scope of Supply"
                  name="scopeOfSupply"
                  value={supplier.scopeOfSupply}
                  onChange={handleSupplierChange}
                  className="col-span-2"
                />
                <Field
                  label="Basis of Approval"
                  name="basisOfApproval"
                  value={supplier.basisOfApproval}
                  onChange={handleSupplierChange}
                  className="col-span-2"
                />
              </div>
            )}

            {activeChildTab === "salesPurchase" && (
              <div>
                <div className="mb-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setItemRows((prev) => [...prev, emptyItemRow()]);
                    }}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                  >
                    <Plus size={12} />
                    Add Row
                  </button>
                </div>
                <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                      <tr>
                        <th className="p-1 w-8 text-center dark:text-white">#</th>
                        <th className="p-1 text-left dark:text-white">Item Code</th>
                        <th className="p-1 text-left dark:text-white">Item Description</th>
                        <th className="p-1 text-left dark:text-white">Unit</th>
                        <th className="p-1 w-20 text-center dark:text-white">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemRows.map((row, idx) => (
                        <tr key={idx} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="p-1 text-center font-medium dark:text-white">{idx + 1}</td>
                          <td className="p-1 align-top">
                            <select
                              value={row.itemCode}
                              onChange={(e) => handleItemChange(idx, e.target.value)}
                              className="w-full h-8 px-2 rounded border text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">Select Item</option>
                              {itemData.map((item) => (
                                <option key={item.value} value={item.value}>
                                  {item.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-1 align-top">
                            <input
                              type="text"
                              value={row.itemDescription}
                              readOnly
                              className="w-full h-8 px-2 rounded border text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="p-1 align-top">
                            <input
                              type="text"
                              value={row.unit}
                              readOnly
                              className="w-full h-8 px-2 rounded border text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="p-1 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (itemRows.length > 1) {
                                  setItemRows(itemRows.filter((_, i) => i !== idx));
                                }
                              }}
                              disabled={itemRows.length <= 1}
                              className={`h-5 w-5 rounded text-white flex items-center justify-center ${itemRows.length <= 1
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
              </div>
            )}

            {activeChildTab === "shippingAddress" && (
              <div className={fieldGrid}>
                <Field
                  label="Address Line 1"
                  name="addressLine1"
                  value={shipping.addressLine1}
                  onChange={handleShippingChange}
                  className="col-span-2"
                />
                <Field
                  label="Address Line 2"
                  name="addressLine2"
                  value={shipping.addressLine2}
                  onChange={handleShippingChange}
                  className="col-span-2"
                />
                <Field
                  label="Address Line 3"
                  name="addressLine3"
                  value={shipping.addressLine3}
                  onChange={handleShippingChange}
                  className="col-span-2"
                />
                <Field
                  type="select"
                  label="City"
                  name="city"
                  value={shipping.city}
                  onChange={handleShippingChange}
                  options={cityData}
                />
                <Field
                  label="Pincode"
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
                  options={stateData}
                />
                <Field
                  type="select"
                  label="Country"
                  name="country"
                  value={shipping.country}
                  onChange={handleShippingChange}
                  options={countryData}
                />
              </div>
            )}
          </div>
        </section>

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
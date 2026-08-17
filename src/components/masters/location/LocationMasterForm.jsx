import { ArrowLeft, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "../../Toast/ToastContext";
import locationMasterAPI from "../../../api/locationMasterAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";
import { employeeAPI } from "../../../api/employeeAPI";
import { masterAPI } from "../../../api/customerAPI";
import branchAPI from "../../../api/branchAPI";
import partyMasterAPI from "../../../api/partyMasterAPI";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

// List codes for the dropdowns backed by List Of Values. Adjust if the
// backend uses different list codes.
const LOCATION_TYPE_LIST_CODE = "location Type";
const BELONGS_TO_LIST_CODE = "location";

const YES_NO_OPTIONS = ["Yes", "No"];
const FALLBACK_LOCATION_TYPES = ["Main Warehouse", "Raw Material Store", "Finished Goods Store"];
const FALLBACK_BELONGS = ["PURCHASE", "SALES", "STORE", "PRODUCTION"];

const getFinancialYears = () => {
  const year = new Date().getFullYear();
  return [String(year), String(year + 1), String(year - 1)];
};

const refId = (ref) => (ref?.id ? String(ref.id) : "");

const LocationMasterForm = ({ data, onBack }) => {
  const ORG_ID = parseInt(localStorage.getItem("orgId"));
  const branchId = parseInt(localStorage.getItem("branchId"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const orgName = (userData?.companyVO?.companyName || userData?.orgName || "").trim();
  const isMacurex = ["mecurex", "macurex"].includes(orgName.toLowerCase());

  const [plants, setPlants] = useState([]);
  const [locationTypes, setLocationTypes] = useState([]);
  const [belongsList, setBelongsList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [parties, setParties] = useState([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    id: data?.id || 0,
    plantId: refId(data?.plantId),
    locationId: data?.locationId || "",
    locationName: data?.locationName || "",
    locationTypeId: refId(data?.locationTypeId),
    belongsToId: refId(data?.belongsToId),
    address: data?.address || "",
    contactPersonNameId: refId(data?.contactPersonNameId),
    phoneNo: data?.phoneNo ?? "",
    faxNo: data?.faxNo || "",
    email: data?.email || "",
    considerMrp: data?.considerMrp || "Yes",
    partyNameId: refId(data?.partyNameId),
    financialYear: data?.financialYear || String(new Date().getFullYear()),
    cancelRemarks: data?.cancelRemarks || "",
    active: !(data?.cancelRemarks),
    orgId: ORG_ID,
    createdBy: localStorage.getItem("userName") || "SYSTEM",
    branchId: Number(localStorage.getItem("branchId")) ,
  });

  const fieldLabels = {
    plantId: isMacurex ? "Plant ID" : "Branch",
    locationId: "Location ID",
    locationTypeId: "Location Type",
    belongsToId: "Belongs To",
  };

  useEffect(() => {
    const loadLookups = async () => {
      setLookupLoading(true);
      try {
        if (isMacurex) {
          const plantRes = await locationMasterAPI.getPlants(ORG_ID);
          setPlants((plantRes || []).map((p) => ({ id: p.id, label: p.plantName || p.plantId || p.id })));
        } else {
          const branchRes = await branchAPI.getBranchByOrgId(ORG_ID);
          setPlants((branchRes || []).map((b) => ({ id: b.id, label: b.branchName || b.id })));
        }
      } catch (error) {
        console.warn("Failed to load plant/branch options", error);
        setPlants([]);
      }
      try {
        const lt = await listOfValuesAPI.getListValuesGroup(LOCATION_TYPE_LIST_CODE, ORG_ID);
        setLocationTypes((lt || []).map((v) => ({ id: v.id, label: v.valuesDescription || v.valueDescription || v.valueCode || v.id })));
      } catch (error) {
        console.warn(`Failed to load location types (list code: ${LOCATION_TYPE_LIST_CODE})`, error);
        setLocationTypes(FALLBACK_LOCATION_TYPES.map((t) => ({ id: t, label: t })));
      }
      try {
        const bt = await listOfValuesAPI.getListValuesGroup(BELONGS_TO_LIST_CODE, ORG_ID);
        setBelongsList((bt || []).map((v) => ({ id: v.id, label: v.valuesDescription || v.valueDescription || v.valueCode || v.id })));
      } catch (error) {
        console.warn(`Failed to load belongs-to values (list code: ${BELONGS_TO_LIST_CODE})`, error);
        setBelongsList(FALLBACK_BELONGS.map((b) => ({ id: b, label: b })));
      }
      try {
        const emp = await employeeAPI.getEmployeeByOrgId(ORG_ID);
        setEmployees((emp || []).map((e) => ({ id: e.id, label: e.employeeName || e.id })));
      } catch (error) {
        console.warn("Failed to load employees", error);
        setEmployees([]);
      }
      try {
        const cust = await partyMasterAPI.getPartyByOrgId(ORG_ID, branchId);
        setParties((cust || []).map((c) => ({ id: c.id, label: c.customerName || c.id })));
      } catch (error) {
        console.warn("Failed to load customers", error);
        setParties([]);
      }
      setLookupLoading(false);
    };
    if (ORG_ID) loadLookups();
  }, [ORG_ID, isMacurex]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const renderOptions = (options) =>
    options.map((opt) => (
      <option key={opt.id} value={opt.id}>
        {opt.label}
      </option>
    ));

  const handleSave = async () => {
    const errors = {};

    if (!form.plantId) errors.plantId = "Plant ID is required";
    if (!form.locationId.trim()) errors.locationId = "Location ID is required";
    if (!form.locationTypeId) errors.locationTypeId = "Location Type is required";
    if (!form.belongsToId) errors.belongsToId = "Belongs To is required";

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0];
      const fieldLabel = fieldLabels[firstErrorField] || firstErrorField;
      addToast(`${fieldLabel}: ${errors[firstErrorField]}`, "error");
      return;
    }

    setIsSubmitting(true);

    const toNumber = (val) => (val ? Number(val) || val : "");
    const payload = {
      address: form.address,
      belongsToId: toNumber(form.belongsToId),
      branchId: form.branchId,
      cancelRemarks: form.active ? "" : form.cancelRemarks,
      considerMrp: form.considerMrp,
      contactPersonNameId: toNumber(form.contactPersonNameId),
      createdBy: form.createdBy,
      email: form.email,
      faxNo: form.faxNo,
      financialYear: form.financialYear,
      locationId: form.locationId,
      locationName: form.locationName,
      locationTypeId: toNumber(form.locationTypeId),
      orgId: form.orgId,
      partyNameId: toNumber(form.partyNameId),
      phoneNo: toNumber(form.phoneNo),
      plantId: toNumber(form.plantId),
    };

    if (form.id && form.id > 0) {
      payload.id = form.id;
    }

    console.log("Saving Location Payload:", payload);

    try {
      const response = await locationMasterAPI.createUpdateLocationMaster(payload);

      const status = response?.status === true || response?.statusFlag === "Ok";

      if (status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (form.id && form.id > 0
              ? "Location updated successfully!"
              : "Location created successfully!"),
          "success"
        );
        onBack();
      } else {
        const errorMessage =
          response?.paramObjectsMap?.message ||
          response?.paramObjectsMap?.errorMessage ||
          response?.message ||
          "Failed to save location";

        addToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("Save Error:", error);
      const errorMessage =
        error.response?.data?.paramObjectsMap?.message ||
        error.response?.data?.paramObjectsMap?.errorMessage ||
        error.response?.data?.message ||
        "Save failed! Try again.";

      addToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-2 max-w-7xl">
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data ? "Edit Location" : "Add Location"}
        </h2>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Plant / Branch */}
          <div>
            <label className={labelClasses}>
              {isMacurex ? "Plant ID" : "Branch"} <span className="text-red-500">*</span>
            </label>
            <select
              name="plantId"
              value={form.plantId}
              onChange={handleChange}
              disabled={lookupLoading}
              className={`${controlClasses} ${fieldErrors.plantId ? "border-red-500" : ""}`}
            >
              <option value="">{isMacurex ? "Select Plant" : "Select Branch"}</option>
              {renderOptions(plants)}
            </select>
            {fieldErrors.plantId && (
              <p className="text-red-500 text-[10px] mt-0.5">{fieldErrors.plantId}</p>
            )}
          </div>

          {/* Location ID */}
          <div>
            <label className={labelClasses}>
              Location ID <span className="text-red-500">*</span>
            </label>
            <input
              name="locationId"
              value={form.locationId}
              onChange={handleChange}
              placeholder="Enter location id"
              className={`${controlClasses} ${fieldErrors.locationId ? "border-red-500" : ""}`}
            />
            {fieldErrors.locationId && (
              <p className="text-red-500 text-[10px] mt-0.5">{fieldErrors.locationId}</p>
            )}
          </div>

          {/* Location Name */}
          <div>
            <label className={labelClasses}>Location Name</label>
            <input
              name="locationName"
              value={form.locationName}
              onChange={handleChange}
              placeholder="Enter location name"
              className={controlClasses}
            />
          </div>

          {/* Location Type */}
          <div>
            <label className={labelClasses}>
              Location Type <span className="text-red-500">*</span>
            </label>
            <select
              name="locationTypeId"
              value={form.locationTypeId}
              onChange={handleChange}
              disabled={lookupLoading}
              className={`${controlClasses} ${fieldErrors.locationTypeId ? "border-red-500" : ""}`}
            >
              <option value="">Select</option>
              {renderOptions(locationTypes)}
            </select>
            {fieldErrors.locationTypeId && (
              <p className="text-red-500 text-[10px] mt-0.5">{fieldErrors.locationTypeId}</p>
            )}
          </div>

          {/* Belongs To */}
          <div>
            <label className={labelClasses}>
              Belongs To <span className="text-red-500">*</span>
            </label>
            <select
              name="belongsToId"
              value={form.belongsToId}
              onChange={handleChange}
              disabled={lookupLoading}
              className={`${controlClasses} ${fieldErrors.belongsToId ? "border-red-500" : ""}`}
            >
              <option value="">Select</option>
              {renderOptions(belongsList)}
            </select>
            {fieldErrors.belongsToId && (
              <p className="text-red-500 text-[10px] mt-0.5">{fieldErrors.belongsToId}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className={labelClasses}>Address</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Enter address"
              className={controlClasses}
            />
          </div>

          {/* Contact Person Name */}
          <div>
            <label className={labelClasses}>Contact Person Name</label>
            <select
              name="contactPersonNameId"
              value={form.contactPersonNameId}
              onChange={handleChange}
              disabled={lookupLoading}
              className={controlClasses}
            >
              <option value="">Select</option>
              {renderOptions(employees)}
            </select>
          </div>

          {/* Phone No */}
          <div>
            <label className={labelClasses}>Phone No</label>
            <input
              name="phoneNo"
              value={form.phoneNo}
              onChange={handleChange}
              placeholder="eg: 9659597177"
              className={controlClasses}
            />
          </div>

          {/* Fax No */}
          <div>
            <label className={labelClasses}>Fax No</label>
            <input
              name="faxNo"
              value={form.faxNo}
              onChange={handleChange}
              placeholder="eg: Enter fax no"
              className={controlClasses}
            />
          </div>

          {/* E-mail */}
          <div>
            <label className={labelClasses}>E-mail</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="eg: whydigit@gmail.com"
              className={controlClasses}
            />
          </div>

          {/* Consider MRP */}
          <div>
            <label className={labelClasses}>Consider MRP</label>
            <select
              name="considerMrp"
              value={form.considerMrp}
              onChange={handleChange}
              className={controlClasses}
            >
              {YES_NO_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

          {/* Party Name */}
          <div>
            <label className={labelClasses}>Party Name</label>
            <select
              name="partyNameId"
              value={form.partyNameId}
              onChange={handleChange}
              disabled={lookupLoading}
              className={controlClasses}
            >
              <option value="">Select</option>
              {renderOptions(parties)}
            </select>
          </div>

          {/* Financial Year */}
          <div>
            <label className={labelClasses}>Financial Year</label>
            <select
              name="financialYear"
              value={form.financialYear}
              onChange={handleChange}
              className={controlClasses}
            >
              {getFinancialYears().map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Active */}
          <div>
            <label className={labelClasses}>Active</label>
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, active: !prev.active }))}
              className={`relative flex items-center w-12 h-6 rounded-full transition-colors ${
                form.active ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`absolute h-5 w-5 bg-white rounded-full shadow transition-transform ${
                  form.active ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {/* Cancel Remarks - only relevant when marking inactive */}
          {!form.active && (
            <div className="lg:col-span-3">
              <label className={labelClasses}>Cancel Remarks</label>
              <input
                name="cancelRemarks"
                value={form.cancelRemarks}
                onChange={handleChange}
                placeholder="Reason for cancellation"
                className={controlClasses}
              />
            </div>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-2 pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60"
          >
            <X className="h-3 w-3" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
          >
            <Save className="h-3 w-3" />
            {isSubmitting ? "Saving..." : data ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationMasterForm;

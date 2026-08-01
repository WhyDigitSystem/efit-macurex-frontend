import { ArrowLeft, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { FloatingInput, FloatingSelect } from "../../../utils/InputFields";
import { cityAPI } from "../../../api/cityAPI";
import { useToast } from "../../Toast/ToastContext";
import countryAPI from "../../../api/countryAPI";
import stateAPI from "../../../api/stateAPI";

const CityMasterForm = ({ onBack, onSave, editData, editId }) => {
  const ORG_ID = parseInt(localStorage.getItem("orgId"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  // Use globalParams similar to StateForm
  const globalParam = JSON.parse(localStorage.getItem("globalParams") || "{}");

  const loginBranchCode = globalParam?.branchcode || localStorage.getItem("branchcode") || "";
  const loginBranch = globalParam?.branch || localStorage.getItem("branch") || "";
  const loginWarehouse = globalParam?.warehouse || localStorage.getItem("warehouse") || "";
  const loginCustomer = globalParam?.customer || localStorage.getItem("customer") || "";
  const loginClient = globalParam?.client || localStorage.getItem("client") || "";
  const loginUserName = localStorage.getItem("userName") || "SYSTEM";

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    id: 0,
    cityName: "",
    cityCode: "",
    country: "", // Will store country ID
    state: "", // Will store state ID
    active: true,
    cancel: false,
    cancelRemarks: "",

    // Additional fields from localStorage
    branch: loginBranch,
    branchCode: loginBranchCode,
    warehouse: loginWarehouse,
    customer: loginCustomer,
    client: loginClient,
    orgId: ORG_ID,
    createdBy: loginUserName,
  });

  // Field labels for toast messages
  const fieldLabels = {
    cityName: "City Name",
    cityCode: "City Code",
    country: "Country",
    state: "State",
  };

  // Load city data for editing
  useEffect(() => {
    const initializeForm = async () => {
      // If editing with editId, fetch the city data
      if (editId && editId > 0) {
        await loadCityData(editId);
      } else if (editData) {
        // If editData is passed directly (from list)
        populateFormFromEditData(editData);
      }

      // Load countries
      await fetchCountries();
    };

    initializeForm();
  }, [editId, editData]);

  const populateFormFromEditData = (data) => {
    // Extract IDs from nested objects if they exist
    const countryId = data.country?.id || data.countryId || '';
    const stateId = data.state?.id || data.stateId || '';

    setForm({
      id: data.id || 0,
      cityName: data.cityName || "",
      cityCode: data.cityCode || "",
      country: countryId,
      state: stateId,
      active: data.active === "Active" ? true : (data.active === true || data.active === "true"),
      cancel: data.cancel === "T" ? true : (data.cancel === true || data.cancel === "true"),
      cancelRemarks: data.cancelRemarks || "",

      // Additional fields
      branch: data.branch || loginBranch,
      branchCode: data.branchCode || loginBranchCode,
      warehouse: data.warehouse || loginWarehouse,
      customer: data.customer || loginCustomer,
      client: data.client || loginClient,
      orgId: data.orgId || ORG_ID,
      createdBy: data.createdBy || loginUserName,
    });

    // Load states for the selected country
    if (countryId) {
      fetchStatesByCountry(countryId);
    }
  };

  const loadCityData = async (cityId) => {
    try {
      setLoading(true);
      const cityData = await cityAPI.getCityById(cityId);

      if (cityData) {
        // Extract IDs from nested objects
        const countryId = cityData.country?.id || '';
        const stateId = cityData.state?.id || '';

        setForm({
          id: cityData.id || 0,
          cityName: cityData.cityName || "",
          cityCode: cityData.cityCode || "",
          country: countryId,
          state: stateId,
          active: cityData.active === "Active" ? true : false,
          cancel: cityData.cancel === "T" ? true : false,
          cancelRemarks: cityData.cancelRemarks || "",

          // Additional fields
          branch: cityData.branch || loginBranch,
          branchCode: cityData.branchCode || loginBranchCode,
          warehouse: cityData.warehouse || loginWarehouse,
          customer: cityData.customer || loginCustomer,
          client: cityData.client || loginClient,
          orgId: cityData.orgId || ORG_ID,
          createdBy: cityData.createdBy || loginUserName,
        });

        // Load states for the selected country
        if (countryId) {
          await fetchStatesByCountry(countryId);
        }
      }
    } catch (error) {
      console.error("Error loading city data:", error);
      addToast("Failed to load city data", 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      const countriesData = await countryAPI.getCountries(ORG_ID);
      const sortedCountries = countriesData.sort((a, b) =>
        a.countryName.localeCompare(b.countryName)
      );
      setCountries(sortedCountries);
    } catch (error) {
      console.error("Error fetching countries:", error);
      addToast("Failed to load countries", 'error');
    }
  };

  const fetchStatesByCountry = async (countryId) => {
    try {
      const statesData = await stateAPI.getStatesByCountry(countryId, ORG_ID);
      const sortedStates = statesData.sort((a, b) =>
        a.stateName.localeCompare(b.stateName)
      );
      setStates(sortedStates);
    } catch (error) {
      console.error("Error fetching states:", error);
      addToast("Failed to load states", "error");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    const alphanumericRegex = /^[A-Za-z0-9]*$/;
    const nameRegex = /^[A-Za-z ]*$/;

    let errorMessage = "";

    if (name === "active" || name === "cancel") {
      setForm(prev => ({ ...prev, [name]: checked }));
      return;
    }

    switch (name) {
      case "cityName":
        if (!nameRegex.test(value)) {
          errorMessage = "Only alphabets and spaces are allowed";
        }
        break;
      case "cityCode":
        if (!alphanumericRegex.test(value)) {
          errorMessage = "Only alphanumeric characters are allowed";
        } else if (value.length > 10) {
          errorMessage = "City Code must be maximum 10 characters";
        }
        break;
      default:
        break;
    }

    if (errorMessage) {
      setFieldErrors(prev => ({ ...prev, [name]: errorMessage }));
    } else {
      const updatedValue = value.toUpperCase();
      setForm(prev => ({ ...prev, [name]: updatedValue }));
    }
  };

  const handleSelectChange = async (name, value) => {
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "country") {
      setForm(prev => ({
        ...prev,
        [name]: value,
        state: "" // Reset state when country changes
      }));
      setStates([]); // Clear states

      // Fetch states for selected country
      if (value) {
        await fetchStatesByCountry(value);
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    const errors = {};

    if (!form.cityName.trim()) errors.cityName = "City Name is required";
    if (!form.cityCode.trim()) errors.cityCode = "City Code is required";
    if (!form.country) errors.country = "Country is required";
    if (!form.state) errors.state = "State is required";

    // Validate lengths
    if (form.cityCode && form.cityCode.length > 10) errors.cityCode = "City Code must be maximum 10 characters";

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0];
      const fieldLabel = fieldLabels[firstErrorField] || firstErrorField;
      const errorMessage = errors[firstErrorField];

      addToast(`${fieldLabel}: ${errorMessage}`, 'error');
      return;
    }

    setIsSubmitting(true);

    // Prepare payload - sending country and state as IDs
    const payload = {
      // Only include id if we're editing (id exists and is greater than 0)
      ...(form.id && form.id > 0 && { id: form.id }),
      cityName: form.cityName,
      cityCode: form.cityCode,
      country: parseInt(form.country), // Send country ID
      state: parseInt(form.state), // Send state ID
      active: Boolean(form.active),
      cancel: Boolean(form.cancel),
      cancelRemarks: form.cancelRemarks || "",
      orgId: form.orgId,
      createdBy: form.createdBy,
    };

    console.log("📤 Saving City Payload:", payload);

    try {
      const response = await cityAPI.saveCity(payload);
      console.log("📥 Save Response:", response);

      // Check response status
      const status = response?.status === true || response?.statusFlag === "Ok";

      if (status) {
        const successMessage = response?.paramObjectsMap?.message ||
          (form.id && form.id > 0 ? "City updated successfully!" : "City created successfully!");

        addToast(successMessage, 'success');

        // Call the parent's onSave callback
        if (onSave) {
          // Pass the saved data back to parent
          const savedData = {
            ...payload,
            id: response?.paramObjectsMap?.cityVO?.id || payload.id
          };
          onSave(savedData);
        } else {
          // If no onSave callback, just go back
          onBack();
        }
      } else {
        const errorMessage = response?.paramObjectsMap?.message ||
          response?.paramObjectsMap?.errorMessage ||
          response?.message ||
          "Failed to save city";

        addToast(errorMessage, 'error');
      }
    } catch (error) {
      console.error("❌ Save Error:", error);
      const errorMessage = error.response?.data?.paramObjectsMap?.message ||
        error.response?.data?.paramObjectsMap?.errorMessage ||
        error.response?.data?.message ||
        "Save failed! Try again.";

      addToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Options
  const countryOptions = countries.map(country => ({
    value: country.id,
    label: country.countryName
  }));

  const stateOptions = states.map(state => ({
    value: state.id,
    label: state.stateName
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-2 max-w-7xl">
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={onBack}
          className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {editData || editId ? "Edit City" : "Add City"}
        </h2>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        {/* MAIN FORM GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          <FloatingInput
            label="City Name"
            name="cityName"
            value={form.cityName}
            onChange={handleChange}
            error={fieldErrors.cityName}
            required
          />

          <FloatingInput
            label="City Code"
            name="cityCode"
            value={form.cityCode}
            onChange={handleChange}
            error={fieldErrors.cityCode}
            required
          />

          <FloatingSelect
            label="Country"
            name="country"
            value={form.country}
            onChange={(name, value) => handleSelectChange(name, value)}
            options={countryOptions}
            error={fieldErrors.country}
            required
          />

          <FloatingSelect
            label="State"
            name="state"
            value={form.state}
            onChange={(name, value) => handleSelectChange(name, value)}
            options={stateOptions}
            error={fieldErrors.state}
            required
            disabled={!form.country}
          />

          {/* STATUS CHECKBOX */}
          <div className="flex flex-col gap-3 p-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <X className="h-3 w-3" /> Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-3 w-3" />
            {isSubmitting ? "Saving..." : (editData || editId ? "Update" : "Save")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CityMasterForm;
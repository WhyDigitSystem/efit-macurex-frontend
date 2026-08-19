import { ArrowLeft, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "../../Toast/ToastContext";
import docTypeAPI from "../../../api/docTypeAPI";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

// editId: pass the row's id when editing; leave undefined/null for create.
const DocTypeMasterForm = ({ onBack, onSave, editId }) => {
  const ORG_ID = parseInt(localStorage.getItem("orgId"));
  const isEditMode = Boolean(editId);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRecord, setIsLoadingRecord] = useState(isEditMode);
  const { addToast } = useToast();

  const [screenCodes, setScreenCodes] = useState([]);
  const [screenCodeLoading, setScreenCodeLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    id: null,
    screenCode: "",
    screenName: "",
    docCode: "",
    description: "",
    orgId: ORG_ID,
    createdBy: localStorage.getItem("userName") || "SYSTEM",
  });

  const fieldLabels = {
    screenCode: "Code",
    docCode: "Doc Code",
  };

  useEffect(() => {
    fetchScreenCodes();
  }, []);

  useEffect(() => {
    if (editId) {
      fetchRecordById(editId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  const fetchScreenCodes = async () => {
    try {
      setScreenCodeLoading(true);
      const response = await docTypeAPI.getAllScreenCode(ORG_ID);
      setScreenCodes(response || []);
    } catch (error) {
      console.error("Error fetching screen codes:", error);
      addToast("Failed to load codes", "error");
    } finally {
      setScreenCodeLoading(false);
    }
  };

  const fetchRecordById = async (id) => {
    try {
      setIsLoadingRecord(true);
      const record = await docTypeAPI.getDocumentTypeMasterById(id);

      if (record) {
        setForm((prev) => ({
          ...prev,
          id: record.id,
          screenCode: record.screenCode || "",
          screenName: record.screenName || "",
          docCode: record.docCode || "",
          description: record.description || "",
          orgId: record.orgId || ORG_ID,
        }));
      } else {
        addToast("Document type not found", "error");
      }
    } catch (error) {
      console.error("Error fetching document type:", error);
      addToast("Failed to load document type", "error");
    } finally {
      setIsLoadingRecord(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    const alphanumericRegex = /^[A-Za-z0-9]*$/;

    switch (name) {
      case "docCode":
        if (!alphanumericRegex.test(value)) {
          setFieldErrors((prev) => ({
            ...prev,
            docCode: "Only alphanumeric characters are allowed",
          }));
          return;
        }
        if (value.length > 10) {
          setFieldErrors((prev) => ({
            ...prev,
            docCode: "Doc Code must be maximum 10 characters",
          }));
          return;
        }
        break;

      case "description":
        if (value.length > 250) {
          setFieldErrors((prev) => ({
            ...prev,
            description: "Description must be maximum 250 characters",
          }));
          return;
        }
        break;

      default:
        break;
    }

    const updatedValue = name === "docCode" ? value.toUpperCase() : value;

    setForm((prev) => ({ ...prev, [name]: updatedValue }));
  };

  const handleScreenCodeChange = (e) => {
    const selectedCode = e.target.value;
    const selected = screenCodes.find((s) => s.screenCode === selectedCode);

    if (fieldErrors.screenCode) {
      setFieldErrors((prev) => ({ ...prev, screenCode: "" }));
    }

    setForm((prev) => ({
      ...prev,
      screenCode: selectedCode,
      screenName: selected?.screenName || "",
    }));
  };

  const handleSave = async () => {
    const errors = {};

    if (!form.screenCode) errors.screenCode = "Code is required";
    if (!form.docCode.trim()) errors.docCode = "Doc Code is required";

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0];
      const fieldLabel = fieldLabels[firstErrorField] || firstErrorField;
      addToast(`${fieldLabel}: ${errors[firstErrorField]}`, "error");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      screenCode: form.screenCode,
      screenName: form.screenName,
      docCode: form.docCode,
      description: form.description,
      createdBy: form.createdBy,
      orgId: form.orgId,
    };

    if (form.id) {
      payload.id = form.id;
    }

    try {
      const response = await docTypeAPI.createUpdateDocumentType(payload);

      const status = response?.status === true || response?.statusFlag === "Ok";

      if (status) {
        const successMessage =
          response?.paramObjectsMap?.message ||
          (form.id
            ? "Doc Type updated successfully!"
            : "Doc Type created successfully!");

        addToast(successMessage, "success");

        if (onSave)
          onSave(response?.paramObjectsMap?.documentTypeMasterVO || payload);
      } else {
        const errorMessage =
          response?.paramObjectsMap?.message ||
          response?.paramObjectsMap?.errorMessage ||
          response?.message ||
          "Failed to save doc type";

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
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {isEditMode ? "Edit Document Type" : "Add Document Type"}
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        {isLoadingRecord ? (
          <div className="text-xs text-gray-500 dark:text-gray-400 py-6 text-center">
            Loading document type...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Code (screenCode dropdown) */}
            <div>
              <label className={labelClasses}>
                Code <span className="text-red-500">*</span>
              </label>

              <select
                name="screenCode"
                value={form.screenCode}
                onChange={handleScreenCodeChange}
                disabled={screenCodeLoading}
                className={`${controlClasses} ${
                  fieldErrors.screenCode ? "border-red-500" : ""
                }`}
              >
                <option value="">Select Code</option>

                {screenCodes.map((item) => (
                  <option key={item.screenCode} value={item.screenCode}>
                    {item.screenCode} - {item.screenName}
                  </option>
                ))}
              </select>

              {fieldErrors.screenCode && (
                <p className="text-red-500 text-[11px] mt-1">
                  {fieldErrors.screenCode}
                </p>
              )}
            </div>

            {/* Name (auto-filled from selected code) */}
            <div>
              <label className={labelClasses}>Name</label>

              <input
                name="screenName"
                value={form.screenName}
                readOnly
                className={`${controlClasses} bg-gray-100 dark:bg-gray-800 cursor-not-allowed`}
              />
            </div>

            {/* Doc Code */}
            <div>
              <label className={labelClasses}>
                Doc Code <span className="text-red-500">*</span>
              </label>

              <input
                name="docCode"
                value={form.docCode}
                onChange={handleChange}
                className={`${controlClasses} ${
                  fieldErrors.docCode ? "border-red-500" : ""
                }`}
              />

              {fieldErrors.docCode && (
                <p className="text-red-500 text-[11px] mt-1">
                  {fieldErrors.docCode}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className={labelClasses}>Description</label>

              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                className={`${controlClasses} ${
                  fieldErrors.description ? "border-red-500" : ""
                }`}
              />

              {fieldErrors.description && (
                <p className="text-red-500 text-[11px] mt-1">
                  {fieldErrors.description}
                </p>
              )}
            </div>
          </div>
        )}

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
            disabled={isSubmitting || isLoadingRecord}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
          >
            <Save className="h-3 w-3" />
            {isSubmitting ? "Saving..." : isEditMode ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocTypeMasterForm;

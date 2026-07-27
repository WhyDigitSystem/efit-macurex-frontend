import { ArrowLeft, Save, X } from "lucide-react";
import { useState, useEffect } from "react";
import { designationAPI } from "../../../api/designationAPI";
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

const DesignationMasterForm = ({ editData, onBack }) => {
    const ORG_ID = parseInt(localStorage.getItem("orgId"));
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const [form, setForm] = useState({
        designationCode: "",
        designationName: "",
        active: true,
    });

    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        if (editData) {
            setForm({
                designationCode: editData.designationCode || editData.code || "",
                designationName: editData.designation || editData.designationName || "",
                active: editData.active === "Active" || editData.active === true,
            });
        }
    }, [editData]);

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === "checkbox") {
            setForm((prev) => ({ ...prev, [name]: checked }));
            return;
        }

        if (name === "designationName") {
            if (!/^[A-Za-z ]*$/.test(value)) {
                setFieldErrors((prev) => ({ ...prev, [name]: "Only alphabets allowed" }));
                return;
            }
        }

        if (name === "designationCode") {
            if (!/^[a-zA-Z0-9#_\-\/\\]*$/.test(value)) {
                setFieldErrors((prev) => ({ ...prev, [name]: "Invalid Format" }));
                return;
            }
        }

        setForm((prev) => ({ ...prev, [name]: value.toUpperCase() }));
        setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validateForm = () => {
        const errors = {};
        if (!form.designationName) errors.designationName = "Designation Name is required";
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const payload = {
                ...(editData?.id && { id: editData.id }),
                designationCode: form.designationCode,
                designation: form.designationName,
                active: form.active,
                orgId: ORG_ID,
                createdBy: localStorage.getItem("userName") || "SYSTEM",
            };

            const response = await designationAPI.saveDesignation(payload);

            if (response?.status === true) {
                const successMessage =
                    response?.paramObjectsMap?.message ||
                    (editData?.id ? "Designation updated successfully!" : "Designation created successfully!");
                addToast(successMessage, "success");
                onBack();
            } else {
                const errorMessage =
                    response?.paramObjectsMap?.errorMessage ||
                    response?.paramObjectsMap?.message ||
                    response?.message ||
                    "Failed to save designation";
                addToast(errorMessage, "error");
            }
        } catch (error) {
            console.error("Save Error:", error);
            const errorMessage =
                error.response?.data?.paramObjectsMap?.errorMessage ||
                error.response?.data?.paramObjectsMap?.message ||
                error.response?.data?.message ||
                "Save failed! Please try again.";
            addToast(errorMessage, "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-2 max-w-7xl">
            <div className="flex items-center gap-2 mb-3">
                <button
                    onClick={onBack}
                    className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                </button>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                    {editData ? "Edit Designation" : "Add Designation"}
                </h2>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
                <div className={fieldGrid}>
                    <div>
                        <label className={labelClasses}>
                            Designation Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="designationName"
                            value={form.designationName || ""}
                            onChange={handleFormChange}
                            className={controlClasses + (fieldErrors.designationName ? " border-red-500" : "")}
                            placeholder="Enter designation name"
                        />
                        {fieldErrors.designationName && (
                            <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">{fieldErrors.designationName}</p>
                        )}
                    </div>

                    <div>
                        <label className={labelClasses}>Active</label>
                        <div className="pt-1">
                            <ToggleButton
                                value={form.active}
                                onChange={(v) => setForm((p) => ({ ...p, active: v }))}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onBack}
                        disabled={isLoading}
                        className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                        <X className="h-3 w-3" />
                        Cancel
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                        <Save className="h-3 w-3" />
                        {isLoading ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DesignationMasterForm;

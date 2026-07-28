import React, { useEffect, useState } from "react";
import { Save, X } from "lucide-react";
import { useToast } from "../../Toast/ToastContext";
import { getAllActiveScreens } from "../../../utils/CommonFunctions";
import apiClient from "../../../api/apiClient";
import CommonListViewTable from "../../../utils/CommonListViewTable";

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
    checked = false,
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
                    <option value="">Select</option>
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                {error && <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">{error}</p>}
            </div>
        );
    }

    if (type === "checkbox") {
        return (
            <div className={`w-full ${className}`}>
                <label className={`${labelClasses} select-none`}>
                    {label}
                    {required && <span className="text-red-500"> *</span>}
                </label>
                <label className={`${controlClasses} flex items-center gap-2 cursor-pointer h-[30px]`}>
                    <input
                        type="checkbox"
                        name={name}
                        checked={checked}
                        onChange={onChange}
                        className="h-3.5 w-3.5 accent-blue-600 dark:accent-blue-500"
                    />
                    <span className="text-gray-700 dark:text-gray-200 text-xs">{label}</span>
                </label>
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
            />
            {error && <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">{error}</p>}
        </div>
    );
};

const fieldGrid = "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-2 items-start";

const Responsibilities = () => {
    const [listView, setListView] = useState(false);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [orgId] = useState(localStorage.getItem("orgId") || "1000000006");
    const [editId, setEditId] = useState("");
    const [loginUserName] = useState(localStorage.getItem("userName") || "SYSTEM");
    const [screenList, setScreenList] = useState([]);
    const [selectedScreens, setSelectedScreens] = useState([]);
    const { addToast } = useToast();

    const [form, setForm] = useState({
        name: "",
        active: true
    });

    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        loadResponsibilities();
        loadScreens();
    }, []);

    const loadResponsibilities = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(`/api/auth/allResponsibilityByOrgId?orgId=${orgId}`);
            if (response && response.paramObjectsMap?.responsibilityVO) {
                const data = response.paramObjectsMap.responsibilityVO.map((item) => ({
                    id: item.id,
                    responsibility: item.responsibility || "",
                    screensVO: item.screensVO || [],
                    active: item.active === "Active" ? true : (item.active ?? true),
                }));
                data.sort((a, b) => b.id - a.id);
                setData(data);
            }
        } catch (error) {
            console.error("Error loading responsibilities:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadScreens = async () => {
        try {
            const screens = await getAllActiveScreens(orgId);
            setScreenList(screens || []);
        } catch (error) {
            console.error("Error fetching screens:", error);
        }
    };

    const getResponsibilityById = async (row) => {
        try {
            const response = await apiClient.get(`/api/auth/responsibilityById?id=${row.id}`);
            if (response && response.paramObjectsMap?.responsibilityVO) {
                const particularResponsibility = response.paramObjectsMap.responsibilityVO;
                setEditId(row.id);
                setForm({
                    name: particularResponsibility.responsibility || "",
                    active: particularResponsibility.active === "Active" ? true : false
                });
                setSelectedScreens(particularResponsibility.screensVO?.map((k) => k.screenName) || []);
                setListView(false);
            }
        } catch (error) {
            console.error("Error fetching responsibility:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: "" }));
        }

        if (name === "active") {
            setForm((prev) => ({ ...prev, active: checked }));
            return;
        }

        setForm((prev) => ({
            ...prev,
            [name]: value.toUpperCase()
        }));
    };

    const handleMultiSelectChange = (value) => {
        setSelectedScreens(value);
    };

    const validate = () => {
        const errors = {};
        if (!form.name.trim()) errors.name = "Responsibility Name is required";
        if (selectedScreens.length <= 0) errors.selectedScreens = "Screens is required";
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        const screenVo = selectedScreens.map((row) => ({
            screenName: row.toLowerCase()
        }));

        const payload = {
            ...(editId && { id: editId }),
            active: form.active,
            responsibility: form.name,
            orgId: parseInt(orgId),
            createdby: loginUserName,
            screensDTO: screenVo
        };

        console.log("Saving payload:", payload);

        try {
            const response = await apiClient.put(`/api/auth/createUpdateResponsibility`, payload);
            if (response.status === true) {
                addToast(editId ? "Responsibility Updated Successfully!" : "Responsibility Created Successfully!", 'success');
                handleClear();
                loadResponsibilities();
            } else {
                addToast(response.paramObjectsMap?.errorMessage || "Responsibility creation failed", 'error');
            }
        } catch (error) {
            console.error("Error saving responsibility:", error);
            addToast("Responsibility creation failed", 'error');
        }
    };

    const handleClear = () => {
        setForm({ name: "", active: true });
        setSelectedScreens([]);
        setFieldErrors({});
        setEditId("");
    };

    const columns = [
        {
            key: "responsibility",
            label: "Responsibility",
            accessor: "responsibility",
            type: "text",
        },
        {
            key: "screens",
            label: "Screens",
            accessor: (item) => item.screensVO?.map((s) => s.screenName).join(", ") || "-",
            type: "text",
        },
        {
            key: "active",
            label: "Status",
            accessor: "active",
            type: "status",
            statusVariants: {
                true: {
                    label: "Active",
                    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
                },
                false: {
                    label: "Inactive",
                    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
                },
            },
        },
        {
            key: "actions",
            label: "Actions",
            type: "actions",
            align: "center",
            width: "90px",
        },
    ];

    const searchFields = ["responsibility"];

    return (
        <div>
            {/* Action Buttons */}
            <div className="flex gap-2 mb-3 flex-wrap">
                <button
                    onClick={handleSave}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                >
                    <Save className="h-3 w-3" />
                    Save
                </button>
                <button
                    onClick={handleClear}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors"
                >
                    <X className="h-3 w-3" />
                    Clear
                </button>
                <button
                    onClick={() => setListView(!listView)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors"
                >
                    {listView ? "Form View" : "List View"}
                </button>
            </div>

            {listView ? (
                <CommonListViewTable
                    title="Responsibilities"
                    data={data}
                    loading={loading}
                    columns={columns}
                    searchFields={searchFields}
                    onEdit={getResponsibilityById}
                    onView={false}
                    showSerialNumber={true}
                    itemsPerPageOptions={[5, 10, 20, 50, 100]}
                    defaultItemsPerPage={10}
                    emptyMessage="No Responsibilities found"
                    loadingMessage="Loading Responsibilities..."
                />
            ) : (
                // Form View
                <div className={fieldGrid}>
                    <Field
                        label="Responsibility Name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        error={fieldErrors.name}
                        required
                        placeholder="Enter Responsibility Name"
                    />

                    <div className="w-full">
                        <label className={labelClasses}>
                            Screens *
                            {fieldErrors.selectedScreens && (
                                <span className="text-red-500 text-[11px] ml-1">{fieldErrors.selectedScreens}</span>
                            )}
                        </label>
                        <select
                            multiple
                            value={selectedScreens}
                            onChange={(e) => {
                                const options = Array.from(e.target.selectedOptions, (option) => option.value);
                                handleMultiSelectChange(options);
                            }}
                            className={`${controlClasses} min-h-[100px] ${fieldErrors.selectedScreens ? "border-red-500" : ""}`}
                        >
                            {screenList.map((item) => (
                                <option key={item.id} value={item.screenName}>
                                    {item.screenName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Field
                        type="checkbox"
                        label="Active"
                        name="active"
                        checked={form.active}
                        onChange={handleChange}
                    />
                </div>
            )}
        </div>
    );
};

export default Responsibilities;
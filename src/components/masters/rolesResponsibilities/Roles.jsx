import React, { useEffect, useState } from "react";
import { Save, X, Plus, Trash2, Search, Pencil } from "lucide-react";
import { useToast } from "../../Toast/ToastContext";
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

const Roles = () => {
    const [listView, setListView] = useState(false);
    const [orgId] = useState(localStorage.getItem("orgId") || "1000000006");
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editId, setEditId] = useState("");
    const [loginUserName] = useState(localStorage.getItem("userName") || "SYSTEM");
    const [selectedRes, setSelectedRes] = useState([]);
    const [responsibilityList, setResponsibilityList] = useState([]);
    const [screenList, setScreenList] = useState([]);
    const [selectedResponsibilitiesDetails, setSelectedResponsibilitiesDetails] = useState({});
    const { addToast } = useToast();

    const [form, setForm] = useState({
        role: "",
        active: true
    });

    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        loadRoles();
        loadResponsibilities();
    }, []);

    const loadRoles = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(`/api/auth/allRolesByOrgId?orgId=${orgId}`);
            if (response && response.paramObjectsMap?.rolesVO) {
                const data = response.paramObjectsMap.rolesVO.map((item) => ({
                    id: item.id,
                    role: item.role || "",
                    rolesReposibilitiesVO: item.rolesReposibilitiesVO || [],
                    active: item.active === "Active" ? true : (item.active ?? true),
                }));
                data.sort((a, b) => b.id - a.id);
                setData(data);
            }
        } catch (error) {
            console.error("Error loading roles:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadResponsibilities = async () => {
        try {
            const response = await apiClient.get(`/api/auth/allActiveResponsibilityByOrgId?orgId=${orgId}`);
            if (response && response.paramObjectsMap?.resposResponsibilityVO) {
                setResponsibilityList(response.paramObjectsMap.resposResponsibilityVO);
            }
        } catch (error) {
            console.error("Error fetching responsibilities:", error);
        }
    };

    const getRoleById = async (row) => {
        try {
            const response = await apiClient.get(`/api/auth/rolesById?id=${row.id}`);
            if (response && response.paramObjectsMap?.rolesVO) {
                const particularRole = response.paramObjectsMap.rolesVO;
                setEditId(row.id);
                setForm({
                    role: particularRole.role || "",
                    active: particularRole.active === "Active" ? true : false
                });
                const responsibilities = particularRole.rolesReposibilitiesVO || [];
                setSelectedRes(responsibilities.map((k) => k.responsibility));
                setSelectedResponsibilitiesDetails(
                    responsibilities.map((res) => ({
                        responsibility: res.responsibility,
                        responsibilityId: res.responsibilityId
                    }))
                );
                setListView(false);
            }
        } catch (error) {
            console.error("Error fetching role:", error);
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
        setSelectedRes(value);

        const selectedResScreen = responsibilityList
            .filter((res) => value.includes(res.responsibility))
            .map((res) => res.screensVO?.map((screen) => screen.screenName) || [])
            .flat();

        setScreenList(selectedResScreen);

        const selectedResDetails = responsibilityList
            .filter((res) => value.includes(res.responsibility))
            .map((res) => ({ responsibility: res.responsibility, responsibilityId: res.id }));
        setSelectedResponsibilitiesDetails(selectedResDetails);
    };

    const validate = () => {
        const errors = {};
        if (!form.role.trim()) errors.role = "Role is required";
        if (selectedRes.length <= 0) errors.selectedRes = "Responsibilities is required";
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        const payload = {
            ...(editId && { id: editId }),
            active: form.active,
            role: form.role,
            rolesResponsibilityDTO: selectedResponsibilitiesDetails,
            orgId: parseInt(orgId),
            createdby: loginUserName
        };

        console.log("Saving payload:", payload);

        try {
            const response = await apiClient.put(`/api/auth/createUpdateRoles`, payload);
            if (response.status === true) {
                addToast(editId ? "Role Updated Successfully!" : "Role Created Successfully!", 'success');
                handleClear();
                loadRoles();
            } else {
                addToast(response.paramObjectsMap?.errorMessage || "Role creation failed", 'error');
            }
        } catch (error) {
            console.error("Error saving role:", error);
            addToast("Role creation failed", 'error');
        }
    };

    const handleClear = () => {
        setForm({ role: "", active: true });
        setSelectedRes([]);
        setScreenList([]);
        setSelectedResponsibilitiesDetails({});
        setFieldErrors({});
        setEditId("");
    };

    const columns = [
        {
            key: "role",
            label: "Role",
            accessor: "role",
            type: "text",
        },
        {
            key: "responsibilities",
            label: "Responsibilities",
            accessor: (item) => item.rolesReposibilitiesVO?.map((r) => r.responsibility).join(", ") || "-",
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

    const searchFields = ["role"];

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
                    title="Roles"
                    data={data}
                    loading={loading}
                    columns={columns}
                    searchFields={searchFields}
                    onEdit={getRoleById}
                    onView={false}
                    showSerialNumber={true}
                    itemsPerPageOptions={[5, 10, 20, 50, 100]}
                    defaultItemsPerPage={10}
                    emptyMessage="No Roles found"
                    loadingMessage="Loading Roles..."
                />
            ) : (
                // Form View
                <div className={fieldGrid}>
                    <Field
                        label="Role"
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        error={fieldErrors.role}
                        required
                        placeholder="Enter Role Name"
                    />

                    {/* Responsibilities */}
                    <div className="w-full">
                        <label className={labelClasses}>
                            Responsibilities *
                            {fieldErrors.selectedRes && (
                                <span className="ml-1 text-[11px] text-red-500">
                                    {fieldErrors.selectedRes}
                                </span>
                            )}
                        </label>

                        <select
                            multiple
                            value={selectedRes}
                            onChange={(e) => {
                                const options = Array.from(
                                    e.target.selectedOptions,
                                    (option) => option.value
                                );
                                handleMultiSelectChange(options);
                            }}
                            className={`${controlClasses} min-h-[100px] ${fieldErrors.selectedRes ? "border-red-500" : ""
                                }`}
                        >
                            {responsibilityList.map((item) => (
                                <option key={item.id} value={item.responsibility}>
                                    {item.responsibility}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Active Checkbox */}
                    <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                            <input
                                type="checkbox"
                                name="active"
                                checked={form.active}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:checked:bg-blue-600 dark:focus:ring-blue-500"
                            />
                            <span>Active</span>
                        </label>
                    </div>

                    {/* Available Screens */}
                    {screenList.length > 0 && (
                        <div className="col-span-full">
                            <label className="block mb-2 text-[11px] text-gray-500 dark:text-gray-400">
                                Available Screens
                            </label>

                            <div className="flex flex-wrap gap-2">
                                {screenList.map((name, index) => (
                                    <span
                                        key={index}
                                        className="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                    >
                                        {name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Roles;
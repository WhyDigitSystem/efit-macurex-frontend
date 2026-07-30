import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, X, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import dayjs from "dayjs";
import { userCreationAPI } from "../../../api/userCreationApi";
import { useToast } from "../../Toast/ToastContext";

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

const UserCreationForm = ({ data, onBack }) => {
    const [orgId] = useState(localStorage.getItem("orgId") || "1000000006");
    const [branch] = useState(localStorage.getItem("branch") || "");
    const [editId, setEditId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [empList, setEmpList] = useState([]);
    const [roleList, setRoleList] = useState([]);
    const [branchList, setBranchList] = useState([]);
    const [activeTab, setActiveTab] = useState("roles");
    const { addToast } = useToast();

    const [form, setForm] = useState({
        id: data?.id || null,
        employeeCode: data?.employeeId || "",
        employeeName: data?.employeeName || "",
        userName: data?.userName || "",
        password: "",
        email: data?.email || "",
        active: data?.active ?? true,
        allIndiaAccess: data?.allIndiaAccess || false,
        userType: data?.userType || "",
        orgId: parseInt(orgId),
    });

    const [fieldErrors, setFieldErrors] = useState({});

    // Role Table Data
    const [roleTableData, setRoleTableData] = useState([
        { id: 1, role: "", roleId: "", startDate: null, endDate: null }
    ]);
    const [roleTableErrors, setRoleTableErrors] = useState([
        { role: "", startDate: "" }
    ]);

    // Branch Table Data
    const [branchTableData, setBranchTableData] = useState([
        { id: 1, branchId: "", branchCode: "", branch: "" }
    ]);
    const [branchTableErrors, setBranchTableErrors] = useState([
        { branchCode: "" }
    ]);

    // Load initial data
    useEffect(() => {
        loadEmployees();
        loadRoles();
        loadBranches();
        if (data?.id) {
            fetchUserData(data.id);
        }
    }, []);

    useEffect(() => {
        console.log("Edit Data:", data);

        loadEmployees();
        loadRoles();
        loadBranches();

        if (data?.id) {
            console.log("Calling getUserById:", data.id);
            fetchUserData(data.id);
        }
    }, []);

    // const loadEmployees = async () => {
    //     try {
    //         const response = await userCreationAPI.getAllEmployees(orgId, branch);
    //         if (response && response.data) {
    //             setEmpList(response.data);
    //         }
    //     } catch (error) {
    //         console.error("Error loading employees:", error);
    //     }
    // };

    const loadEmployees = async () => {
        try {
            const response = await userCreationAPI.getAllEmployees(orgId);

            if (response?.paramObjectsMap?.employeeMasterVO) {
                const employeeData = response.paramObjectsMap.employeeMasterVO || [];

                // If API returns a single employee
                setEmpList(employeeData);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const loadRoles = async () => {
        try {
            const response = await userCreationAPI.getAllRoles(orgId);
            if (response && response.paramObjectsMap?.rolesVO) {
                setRoleList(response.paramObjectsMap.rolesVO);
            } else if (response && response.data) {
                setRoleList(response.data);
            } else {
                setRoleList([]);
            }
        } catch (error) {
            console.error("Error loading roles:", error);
            setRoleList([]);
        }
    };

    const loadBranches = async () => {
        try {
            const response = await userCreationAPI.getAllBranches(orgId);
            if (response && response.paramObjectsMap?.branchList) {
                setBranchList(response.paramObjectsMap.branchList);
            } else if (response && response.data) {
                setBranchList(response.data);
            } else {
                setBranchList([]);
            }
        } catch (error) {
            console.error("Error loading branches:", error);
            setBranchList([]);
        }
    };

    const fetchUserData = async (userId) => {
        setLoading(true);

        try {
            const response = await userCreationAPI.getUserById(userId);

            const user = response?.paramObjectsMap?.userVO;

            if (!user) return;

            setEditId(user.usersId);

            setForm({
                id: user.usersId,
                employeeCode: user.employeeId || "",
                employeeName: user.employeeName || "",
                userName: user.userName || "",
                password: "",
                email: user.email || "",
                active: user.active === "Active",
                allIndiaAccess: user.allIndiaAcces,
                userType: user.userType || "",
                orgId: Number(orgId),
            });

            // Roles
            if (user.roles?.length) {
                setRoleTableData(
                    user.roles.map((role, index) => ({
                        id: index + 1,
                        role: role.role,
                        roleId: role.roleId,
                        startDate: role.startDate,
                        endDate: role.endDate,
                    }))
                );
            }

            // Branches
            if (user.branches?.length) {
                setBranchTableData(
                    user.branches.map((branch, index) => ({
                        id: index + 1,
                        branchId: branch.branchId,
                        branchCode: branch.branchCode,
                        branch: branch.branch,
                    }))
                );
            }

        } catch (error) {
            console.error("Error fetching user:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: "" }));
        }

        // Handle employee selection
        if (name === "employeeCode") {
            const selectedEmp = empList.find(
                (emp) => String(emp.id) === value
            );

            if (selectedEmp) {
                setForm((prev) => ({
                    ...prev,
                    employeeCode: selectedEmp.id,          // Save employee id
                    employeeName: selectedEmp.employeeName,
                    email: selectedEmp.email,
                    userName: selectedEmp.employeeId,      // EMP001
                }));
                return;
            }
        }

        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleRoleChange = (index, field, value) => {
        const updatedRows = [...roleTableData];
        updatedRows[index][field] = value;

        // If role is selected, find and set roleId
        if (field === "role") {
            const selectedRole = roleList.find((r) => r.role === value);
            if (selectedRole) {
                updatedRows[index].roleId = selectedRole.id;
            }
        }

        setRoleTableData(updatedRows);

        // Clear error
        const errors = [...roleTableErrors];
        errors[index][field] = "";
        setRoleTableErrors(errors);
    };

    const handleBranchChange = (index, field, value) => {
        const updatedRows = [...branchTableData];
        updatedRows[index][field] = value;

        // If branchCode is selected, find and set branch name
        if (field === "branchCode") {
            // Find the selected branch from branchList
            const selectedBranch = branchList.find((b) => b.branchCode === value);
            if (selectedBranch) {
                updatedRows[index].branchId = selectedBranch.id;
                // Set both branchCode and branchName
                updatedRows[index].branchCode = selectedBranch.branchCode;
                updatedRows[index].branch = selectedBranch.branchName || selectedBranch.branch || "";
            } else {
                // If no branch found, clear the branch name
                updatedRows[index].branch = "";
            }
        }

        setBranchTableData(updatedRows);

        // Clear error
        const errors = [...branchTableErrors];
        errors[index][field] = "";
        setBranchTableErrors(errors);
    };

    const handleAddRoleRow = () => {
        setRoleTableData([
            ...roleTableData,
            { id: Date.now(), role: "", roleId: "", startDate: null, endDate: null }
        ]);
        setRoleTableErrors([...roleTableErrors, { role: "", startDate: "" }]);
    };

    const handleRemoveRoleRow = (index) => {
        if (roleTableData.length > 1) {
            setRoleTableData(roleTableData.filter((_, i) => i !== index));
            setRoleTableErrors(roleTableErrors.filter((_, i) => i !== index));
        }
    };

    const handleAddBranchRow = () => {
        setBranchTableData([
            ...branchTableData,
            { id: Date.now(), branchId: "", branchCode: "", branch: "" }
        ]);
        setBranchTableErrors([...branchTableErrors, { branchId: "", branchCode: "" }]);
    };

    const handleRemoveBranchRow = (index) => {
        if (branchTableData.length > 1) {
            setBranchTableData(branchTableData.filter((_, i) => i !== index));
            setBranchTableErrors(branchTableErrors.filter((_, i) => i !== index));
        }
    };

    const getAvailableRoles = (currentIndex) => {
        const selectedRoles = roleTableData
            .filter((_, index) => index !== currentIndex)
            .map((row) => row.role);
        return roleList.filter((role) => !selectedRoles.includes(role.role));
    };

    const getAvailableBranches = (currentIndex) => {
        const selectedBranches = branchTableData
            .filter((_, index) => index !== currentIndex)
            .map((row) => row.branchCode);
        return branchList.filter((branch) => !selectedBranches.includes(branch.branchCode));
    };

    const validate = () => {
        const errors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!form.userName) errors.userName = "User Name is required";
        if (!form.userType) errors.userType = "User Type is required";
        if (!form.employeeCode) errors.employeeCode = "Employee Code is required";
        if (!form.email) errors.email = "Email is required";
        else if (!emailRegex.test(form.email)) errors.email = "Invalid email format";

        // Validate role table
        let roleValid = true;
        const roleErrors = roleTableData.map((row) => {
            const rowErrors = {};
            if (!row.role) {
                rowErrors.role = "Role is required";
                roleValid = false;
            }
            if (!row.startDate) {
                rowErrors.startDate = "Start Date is required";
                roleValid = false;
            }
            return rowErrors;
        });
        setRoleTableErrors(roleErrors);

        // Validate branch table
        let branchValid = true;
        const branchErrors = branchTableData.map((row) => {
            const rowErrors = {};
            if (!row.branchCode) {
                rowErrors.branchCode = "Branch Code is required";
                branchValid = false;
            }
            return rowErrors;
        });
        setBranchTableErrors(branchErrors);

        setFieldErrors(errors);
        return Object.keys(errors).length === 0 && roleValid && branchValid;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setIsSubmitting(true);

        const payload = {
            active: form.active,
            allIndiaAcces: form.allIndiaAccess,
            createdBy: localStorage.getItem("userName") || "",
            email: form.email,
            employee: Number(form.employeeCode),
            orgId: Number(orgId),
            userName: form.userName,
            userType: form.userType,

            roleAccessDTO: roleTableData.map((row) => ({
                roleId: Number(row.roleId),
                startDate: row.startDate
                    ? dayjs(row.startDate).format("YYYY-MM-DD")
                    : null,
                endDate: row.endDate
                    ? dayjs(row.endDate).format("YYYY-MM-DD")
                    : null,
            })),

            branchAccessDTOList: branchTableData.map((row) => ({
                branch: Number(row.branchId),
            })),
        };

        // Only add id for update
        if (editId) {
            payload.id = editId;
        }

        // Only add password for new users
        if (!editId) {
            payload.password = "Wds@2022"; // Default password
        }

        console.log("Saving payload:", payload);

        try {
            const response = await userCreationAPI.saveUser(payload);
            const successMessage =
                response?.paramObjectsMap?.message ||
                (form.id && form.id > 0
                    ? "User updated successfully!"
                    : "User created successfully!");

            addToast(successMessage, "success");
            onBack();
        } catch (error) {
            console.error("Error saving user:", error);
            alert(error.response?.data?.message || "Failed to save user.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-gray-500 dark:text-gray-400">Loading...</div>
            </div>
        );
    }

    return (
        <div className="p-2 max-w-7xl">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <button
                    onClick={onBack}
                    className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                </button>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                    {editId ? "Edit User" : "Add User"}
                </h2>
            </div>

            {/* Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">

                {/* Form Fields */}
                <div className={fieldGrid}>
                    <Field
                        type="select"
                        label="Employee Code"
                        name="employeeCode"
                        value={form.employeeCode}
                        onChange={handleChange}
                        error={fieldErrors.employeeCode}
                        required
                        options={empList.map((emp) => ({
                            value: emp.id,
                            label: emp.employeeId,
                        }))}
                    />

                    <Field
                        label="Employee Name"
                        name="employeeName"
                        value={form.employeeName}
                        onChange={handleChange}
                        error={fieldErrors.employeeName}
                        disabled
                        placeholder="Employee Name"
                    />

                    <Field
                        label="Email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        error={fieldErrors.email}
                        disabled
                        placeholder="Enter Email"
                    />

                    <Field
                        label="User Name"
                        name="userName"
                        value={form.userName}
                        onChange={handleChange}
                        error={fieldErrors.userName}
                        required
                        placeholder="Enter User Name"
                        disabled={!!editId}
                    />

                    {/* {!editId && (
                        <div className="relative">
                            <Field
                                label="Password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Enter Password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-[26px] text-gray-500 dark:text-gray-400"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    )} */}

                    <Field
                        type="select"
                        label="User Type"
                        name="userType"
                        value={form.userType}
                        onChange={handleChange}
                        error={fieldErrors.userType}
                        required
                        options={[
                            { value: "ADMIN", label: "ADMIN" },
                            { value: "USER", label: "USER" },
                        ]}
                    />

                    <Field
                        type="checkbox"
                        label="All India Access"
                        name="allIndiaAccess"
                        checked={form.allIndiaAccess}
                        onChange={handleChange}
                    />

                    <Field
                        type="checkbox"
                        label="Active"
                        name="active"
                        checked={form.active}
                        onChange={handleChange}
                    />
                </div>

                {/* Tabs */}
                <div className="flex items-center border-b border-gray-200 dark:border-gray-700 mt-4">
                    <button
                        type="button"
                        onClick={() => setActiveTab("roles")}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-t transition-colors ${activeTab === "roles"
                            ? "bg-blue-600 text-white"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                    >
                        Roles
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("branches")}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-t transition-colors ${activeTab === "branches"
                            ? "bg-blue-600 text-white"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                    >
                        Branch Accessible
                    </button>
                </div>

                {/* Roles Tab */}
                {activeTab === "roles" && (
                    <div className="mt-2">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Roles
                            </h3>
                            <button
                                type="button"
                                onClick={handleAddRoleRow}
                                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                            >
                                <Plus size={12} />
                            </button>
                        </div>

                        <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
                            <table className="w-full text-xs min-w-[500px]">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        <th className="p-1 text-center w-10 dark:text-gray-200">S.No</th>
                                        <th className="p-1 text-left min-w-[150px] dark:text-gray-200">Role</th>
                                        <th className="p-1 text-left min-w-[130px] dark:text-gray-200">Start Date</th>
                                        <th className="p-1 text-left min-w-[130px] dark:text-gray-200">End Date</th>
                                        <th className="p-1 text-center w-10 dark:text-gray-200">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roleTableData.map((row, index) => (
                                        <tr key={row.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="p-1 text-center font-medium dark:text-gray-300">
                                                {index + 1}
                                            </td>
                                            <td className="p-1">
                                                <select
                                                    value={row.role}
                                                    onChange={(e) => handleRoleChange(index, "role", e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[140px] ${roleTableErrors[index]?.role ? "border-red-500" : ""}`}
                                                >
                                                    <option value="">Select</option>
                                                    {getAvailableRoles(index).map((role) => (
                                                        <option key={role.id} value={role.role}>
                                                            {role.role}
                                                        </option>
                                                    ))}
                                                </select>
                                                {roleTableErrors[index]?.role && (
                                                    <p className="text-red-500 text-[10px] mt-0.5">{roleTableErrors[index].role}</p>
                                                )}
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="date"
                                                    value={row.startDate || ""}
                                                    onChange={(e) => handleRoleChange(index, "startDate", e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[120px] ${roleTableErrors[index]?.startDate ? "border-red-500" : ""}`}
                                                />
                                                {roleTableErrors[index]?.startDate && (
                                                    <p className="text-red-500 text-[10px] mt-0.5">{roleTableErrors[index].startDate}</p>
                                                )}
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="date"
                                                    value={row.endDate || ""}
                                                    onChange={(e) => handleRoleChange(index, "endDate", e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[120px]`}
                                                />
                                            </td>
                                            <td className="p-1 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveRoleRow(index)}
                                                    disabled={roleTableData.length <= 1}
                                                    className={`h-5 w-5 rounded text-white flex items-center justify-center transition-colors ${roleTableData.length <= 1
                                                        ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                                                        : "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
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

                {/* Branch Accessible Tab */}
                {activeTab === "branches" && (
                    <div className="mt-2">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Branch Accessible
                            </h3>
                            <button
                                type="button"
                                onClick={handleAddBranchRow}
                                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                            >
                                <Plus size={12} />
                            </button>
                        </div>

                        <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
                            <table className="w-full text-xs min-w-[400px]">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        <th className="p-1 text-center w-10 dark:text-gray-200">S.No</th>
                                        <th className="p-1 text-left min-w-[150px] dark:text-gray-200">Branch Code</th>
                                        <th className="p-1 text-left min-w-[150px] dark:text-gray-200">Branch Name</th>
                                        <th className="p-1 text-center w-10 dark:text-gray-200">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {branchTableData.map((row, index) => (
                                        <tr key={row.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="p-1 text-center font-medium dark:text-gray-300">
                                                {index + 1}
                                            </td>
                                            <td className="p-1">
                                                <select
                                                    value={row.branchCode}
                                                    onChange={(e) => handleBranchChange(index, "branchCode", e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[140px] ${branchTableErrors[index]?.branchCode ? "border-red-500" : ""}`}
                                                >
                                                    <option value="">Select</option>
                                                    {getAvailableBranches(index).map((branch) => (
                                                        <option key={branch.id} value={branch.branchCode}>
                                                            {branch.branchCode}
                                                        </option>
                                                    ))}
                                                </select>
                                                {branchTableErrors[index]?.branchCode && (
                                                    <p className="text-red-500 text-[10px] mt-0.5">{branchTableErrors[index].branchCode}</p>
                                                )}
                                            </td>
                                            <td className="p-1 pt-2 dark:text-gray-300">
                                                {row.branch || "-"}
                                            </td>
                                            <td className="p-1 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveBranchRow(index)}
                                                    disabled={branchTableData.length <= 1}
                                                    className={`h-5 w-5 rounded text-white flex items-center justify-center transition-colors ${branchTableData.length <= 1
                                                        ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                                                        : "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
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

                {/* Buttons */}
                <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onBack}
                        disabled={isSubmitting}
                        className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                        <X className="h-3 w-3" />
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                        <Save className="h-3 w-3" />
                        {isSubmitting ? "Saving..." : editId ? "Update" : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserCreationForm;
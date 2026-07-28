import React, { useEffect, useState, useCallback } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { userCreationAPI } from "../../../api/userCreationApi";

const UserCreationList = ({ onAddNew, onEdit, onBack }) => {
    const [userData, setUserData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [orgId] = useState(localStorage.getItem("orgId") || "1000000006");

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);

            const response = await userCreationAPI.getAllUsers(orgId);
            console.log("Full API Response:", response);

            // Extract user list - handle different response structures
            let userList = [];

            // Check if response has the expected structure
            if (response) {
                if (response) {
                    userList = response.paramObjectsMap.userVO;
                }
            }

            console.log("Extracted User List:", userList);

            if (!userList || userList.length === 0) {
                console.warn("No users found in response");
                setUserData([]);
                return;
            }

            const mappedUsers = userList.map((item) => ({
                id: item.id || 0,
                employeeCode: item.employee?.employeeCode || item.employeeCode || "",
                employeeName: item.employee?.employeeName || item.employeeName || "",
                userName: item.userName || "",
                email: item.email || "",
                active: item.active === "Active" ? true : (item.active === true || item.active === "true"),
            }));

            const sortedUsers = mappedUsers.sort(
                (a, b) => (b.id || 0) - (a.id || 0),
            );

            setUserData(sortedUsers);
        } catch (error) {
            console.error("Failed to load users:", error);
            setUserData([]);
        } finally {
            setLoading(false);
        }
    }, [orgId]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleEdit = (user) => {
        onEdit(user);
    };

    const columns = [
        {
            key: "employeeCode",
            label: "Employee Code",
            accessor: "employeeCode",
            type: "text",
            noWrap: true,
        },
        {
            key: "employeeName",
            label: "Employee Name",
            accessor: "employeeName",
            type: "text",
        },
        {
            key: "userName",
            label: "User Name",
            accessor: "userName",
            type: "text",
            noWrap: true,
        },
        {
            key: "email",
            label: "Email",
            accessor: "email",
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

    const searchFields = [
        "employeeCode",
        "employeeName",
        "userName",
        "email",
    ];

    const filterOptions = [
        {
            value: "all",
            label: "All",
            field: null,
        },
        {
            value: "active",
            label: "Active",
            field: "active",
            filterValue: "active",
            activeValue: "Active",
        },
        {
            value: "inactive",
            label: "Inactive",
            field: "active",
            filterValue: "inactive",
            activeValue: "Active",
        },
    ];

    return (
        <CommonListViewTable
            title="User Creation"
            data={userData}
            loading={loading}
            columns={columns}
            searchFields={searchFields}
            filterOptions={filterOptions}
            defaultFilter="all"
            onBack={onBack}
            onAddNew={onAddNew}
            onEdit={handleEdit}
            onView={false}
            showSerialNumber={true}
            itemsPerPageOptions={[5, 10, 20, 50, 100]}
            defaultItemsPerPage={10}
            emptyMessage="No Users found"
            loadingMessage="Loading Users..."
            enableRefresh={true}
            onRefresh={loadUsers}
            enableExport={true}
            exportFileName="User_Creation"
        />
    );
};

export default UserCreationList;
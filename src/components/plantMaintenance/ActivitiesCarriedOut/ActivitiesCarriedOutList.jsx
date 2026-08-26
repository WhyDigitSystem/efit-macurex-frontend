// ActivitiesCarriedOutList.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";

const ActivitiesCarriedOutList = ({ onAddNew, onEdit, onBack }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        // Dummy data for now - replace with actual API call
        const dummyData = [
            {
                id: 1,
                docId: "ACO/2026/0001",
                plantId: "Plant 001",
                department: "Production",
                machineTool: "Machine A",
                date: "25/08/2026",
                maintenanceType: "Preventive",
                status: "Completed",
                totalAmount: 1500.00,
                active: true,
            },
            {
                id: 2,
                docId: "ACO/2026/0002",
                plantId: "Plant 002",
                department: "Maintenance",
                machineTool: "Tool B",
                date: "26/08/2026",
                maintenanceType: "Corrective",
                status: "Pending",
                totalAmount: 750.50,
                active: true,
            },
        ];
        dummyData.sort((a, b) => b.id - a.id);
        setData(dummyData);
        setLoading(false);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleEdit = (row) => {
        onEdit(row);
    };

    const columns = [
        {
            key: "docId",
            label: "Doc ID",
            accessor: "docId",
            type: "text",
            noWrap: true,
        },
        {
            key: "plantId",
            label: "Plant ID",
            accessor: "plantId",
            type: "text",
        },
        {
            key: "department",
            label: "Department",
            accessor: "department",
            type: "text",
        },
        {
            key: "machineTool",
            label: "Machine/Tool",
            accessor: "machineTool",
            type: "text",
        },
        {
            key: "date",
            label: "Date",
            accessor: "date",
            type: "text",
            noWrap: true,
        },
        {
            key: "maintenanceType",
            label: "Maintenance Type",
            accessor: "maintenanceType",
            type: "text",
        },
        {
            key: "status",
            label: "Status",
            accessor: "status",
            type: "status",
            statusVariants: {
                "Completed": {
                    label: "Completed",
                    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
                },
                "Pending": {
                    label: "Pending",
                    className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
                },
                "In Progress": {
                    label: "In Progress",
                    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
                },
            },
        },
        {
            key: "totalAmount",
            label: "Total Amount",
            accessor: "totalAmount",
            type: "text",
            align: "right",
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
        "docId",
        "plantId",
        "department",
        "machineTool",
        "maintenanceType",
    ];

    const filterOptions = [
        {
            value: "all",
            label: "All",
            field: null,
        },
        {
            value: "completed",
            label: "Completed",
            field: "status",
            filterValue: "completed",
            activeValue: "Completed",
        },
        {
            value: "pending",
            label: "Pending",
            field: "status",
            filterValue: "pending",
            activeValue: "Pending",
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
            title="Activities Carried Out"
            data={data}
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
            emptyMessage="No Activities Carried Out records found"
            loadingMessage="Loading Activities Carried Out records..."
            enableRefresh={true}
            onRefresh={loadData}
            enableExport={true}
            exportFileName="Activities_Carried_Out"
        />
    );
};

export default ActivitiesCarriedOutList;
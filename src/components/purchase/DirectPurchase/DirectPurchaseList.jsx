import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";

const DirectPurchaseList = ({ onAddNew, onEdit, onBack }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadData = async () => {
        setLoading(true);
        // Dummy Data
        const dummyData = [
            {
                id: 1,
                billNo: "DP001",
                plantId: "Plant 001",
                supplierName: "ABC Suppliers",
                department: "Purchase",
                location: "Location 001",
                totalAmount: "15000.00",
                date: "27/07/2026",
                status: "Pending",
                active: true,
            },
            {
                id: 2,
                billNo: "DP002",
                plantId: "Plant 002",
                supplierName: "XYZ Traders",
                department: "Finance",
                location: "Location 002",
                totalAmount: "25000.00",
                date: "27/07/2026",
                status: "Approved",
                active: true,
            },
            {
                id: 3,
                billNo: "DP003",
                plantId: "Plant 001",
                supplierName: "PQR Enterprises",
                department: "Production",
                location: "Location 003",
                totalAmount: "8000.00",
                date: "27/07/2026",
                status: "Rejected",
                active: false,
            },
        ];
        dummyData.sort((a, b) => b.id - a.id);
        setData(dummyData);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleEdit = (row) => {
        onEdit(row);
    };

    const columns = [
        {
            key: "billNo",
            label: "Bill No",
            accessor: "billNo",
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
            key: "supplierName",
            label: "Supplier Name",
            accessor: "supplierName",
            type: "text",
        },
        {
            key: "department",
            label: "Department",
            accessor: "department",
            type: "text",
        },
        {
            key: "location",
            label: "Location",
            accessor: "location",
            type: "text",
        },
        {
            key: "totalAmount",
            label: "Total Amount",
            accessor: "totalAmount",
            type: "text",
            align: "right",
        },
        {
            key: "date",
            label: "Date",
            accessor: "date",
            type: "text",
            noWrap: true,
        },
        {
            key: "status",
            label: "Status",
            accessor: "status",
            type: "status",
            statusVariants: {
                "Pending": {
                    label: "Pending",
                    className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
                },
                "Approved": {
                    label: "Approved",
                    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
                },
                "Rejected": {
                    label: "Rejected",
                    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
                },
            },
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
        "billNo",
        "plantId",
        "supplierName",
        "department",
        "location",
    ];

    const filterOptions = [
        {
            value: "all",
            label: "All",
            field: null,
        },
        {
            value: "pending",
            label: "Pending",
            field: "status",
            filterValue: "pending",
            activeValue: "Pending",
        },
        {
            value: "approved",
            label: "Approved",
            field: "status",
            filterValue: "approved",
            activeValue: "Approved",
        },
        {
            value: "rejected",
            label: "Rejected",
            field: "status",
            filterValue: "rejected",
            activeValue: "Rejected",
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
            title="Direct Purchase"
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
            emptyMessage="No Direct Purchase records found"
            loadingMessage="Loading Direct Purchase records..."
            enableRefresh={true}
            onRefresh={loadData}
            enableExport={true}
            exportFileName="Direct_Purchase"
        />
    );
};

export default DirectPurchaseList;
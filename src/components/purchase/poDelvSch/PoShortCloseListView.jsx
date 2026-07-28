import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";

const PoShortCloseListView = ({ onAddNew, onEdit, onBack }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadData = async () => {
        setLoading(true);
        // Dummy Data
        const dummyData = [
            {
                id: 1,
                shortCloseNo: "SC001",
                plantId: "Plant 001",
                supplierCode: "SUP001",
                supplierName: "ABC Suppliers",
                poNo: "PO001",
                shortCloseDate: "27/07/2026",
                orderStatus: "Pending",
                totalPendingQty: "150.000",
                active: true,
            },
            {
                id: 2,
                shortCloseNo: "SC002",
                plantId: "Plant 002",
                supplierCode: "SUP002",
                supplierName: "XYZ Traders",
                poNo: "PO002",
                shortCloseDate: "27/07/2026",
                orderStatus: "Approved",
                totalPendingQty: "75.500",
                active: true,
            },
            {
                id: 3,
                shortCloseNo: "SC003",
                plantId: "Plant 001",
                supplierCode: "SUP003",
                supplierName: "PQR Enterprises",
                poNo: "PO003",
                shortCloseDate: "27/07/2026",
                orderStatus: "Closed",
                totalPendingQty: "0.000",
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
            key: "shortCloseNo",
            label: "Short Close No.",
            accessor: "shortCloseNo",
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
            key: "supplierCode",
            label: "Supplier Code",
            accessor: "supplierCode",
            type: "text",
            noWrap: true,
        },
        {
            key: "supplierName",
            label: "Supplier Name",
            accessor: "supplierName",
            type: "text",
        },
        {
            key: "poNo",
            label: "PO/Del.Sch.No",
            accessor: "poNo",
            type: "text",
            noWrap: true,
        },
        {
            key: "shortCloseDate",
            label: "Short Close Date",
            accessor: "shortCloseDate",
            type: "text",
            noWrap: true,
        },
        {
            key: "totalPendingQty",
            label: "Total Pending Qty",
            accessor: "totalPendingQty",
            type: "text",
            align: "right",
        },
        {
            key: "orderStatus",
            label: "Order Status",
            accessor: "orderStatus",
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
                "Closed": {
                    label: "Closed",
                    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
                },
                "Partial": {
                    label: "Partial",
                    className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
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
        "shortCloseNo",
        "plantId",
        "supplierCode",
        "supplierName",
        "poNo",
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
            field: "orderStatus",
            filterValue: "pending",
            activeValue: "Pending",
        },
        {
            value: "approved",
            label: "Approved",
            field: "orderStatus",
            filterValue: "approved",
            activeValue: "Approved",
        },
        {
            value: "closed",
            label: "Closed",
            field: "orderStatus",
            filterValue: "closed",
            activeValue: "Closed",
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
            title="PO/Delv.Sch. Shortclose"
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
            emptyMessage="No PO Short Close records found"
            loadingMessage="Loading PO Short Close records..."
            enableRefresh={true}
            onRefresh={loadData}
            enableExport={true}
            exportFileName="PO_Short_Close"
        />
    );
};

export default PoShortCloseListView;
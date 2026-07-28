import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";

const PurchaseBillList = ({ onAddNew, onEdit, onBack }) => {
    const [purchaseData, setPurchaseData] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadPurchaseBills = async () => {
        setLoading(true);

        // Dummy Data
        const data = [
            {
                id: 1,
                pbNo: "PB001",
                supplierName: "ABC Suppliers",
                pbDate: "27/07/2026",
                grnNo: "GRN001",
                totalAmount: "15000.00",
                status: "Pending",
                active: true,
            },
            {
                id: 2,
                pbNo: "PB002",
                supplierName: "XYZ Traders",
                pbDate: "27/07/2026",
                grnNo: "GRN002",
                totalAmount: "25000.00",
                status: "Approved",
                active: true,
            },
            {
                id: 3,
                pbNo: "PB003",
                supplierName: "PQR Enterprises",
                pbDate: "27/07/2026",
                grnNo: "GRN003",
                totalAmount: "8000.00",
                status: "Rejected",
                active: false,
            },
        ];

        data.sort((a, b) => b.id - a.id);
        setPurchaseData(data);
        setLoading(false);
    };

    useEffect(() => {
        loadPurchaseBills();
    }, []);

    const handleEdit = (purchase) => {
        onEdit(purchase);
    };

    const columns = [
        {
            key: "pbNo",
            label: "PB No",
            accessor: "pbNo",
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
            key: "pbDate",
            label: "PB Date",
            accessor: "pbDate",
            type: "text",
            noWrap: true,
        },
        {
            key: "grnNo",
            label: "GRN No",
            accessor: "grnNo",
            type: "text",
            noWrap: true,
        },
        {
            key: "totalAmount",
            label: "Total Amount",
            accessor: "totalAmount",
            type: "text",
            align: "right",
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
            label: "Active",
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
        "pbNo",
        "supplierName",
        "grnNo",
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
    ];

    return (
        <CommonListViewTable
            title="Purchase Bill"
            data={purchaseData}
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
            emptyMessage="No Purchase Bills found"
            loadingMessage="Loading Purchase Bills..."
            enableRefresh={true}
            onRefresh={loadPurchaseBills}
            enableExport={true}
            exportFileName="Purchase_Bills"
        />
    );
};

export default PurchaseBillList;
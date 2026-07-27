import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";

const TaxDefinationList = ({ onAddNew, onEdit, onBack }) => {
    const [taxData, setTaxData] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadTaxDefinitions = async () => {
        setLoading(true);

        // Dummy Data
        const data = [
            {
                id: 1,
                taxNo: "TAX001",
                taxDescription: "GST on Sales",
                module: "Sales",
                effectiveDate: "27/07/2026",
                isActive: true,
                createdOn: "27/07/2026",
                fillCopyOf: "Original",
                printName: true,
            },
            {
                id: 2,
                taxNo: "TAX002",
                taxDescription: "GST on Purchase",
                module: "Purchase",
                effectiveDate: "27/07/2026",
                isActive: true,
                createdOn: "27/07/2026",
                fillCopyOf: "Duplicate",
                printName: false,
            },
            {
                id: 3,
                taxNo: "TAX003",
                taxDescription: "Service Tax",
                module: "Finance",
                effectiveDate: "27/07/2026",
                isActive: false,
                createdOn: "27/07/2026",
                fillCopyOf: "None",
                printName: true,
            },
        ];

        data.sort((a, b) => b.id - a.id);
        setTaxData(data);
        setLoading(false);
    };

    useEffect(() => {
        loadTaxDefinitions();
    }, []);

    const handleEdit = (tax) => {
        onEdit(tax);
    };

    const columns = [
        {
            key: "taxNo",
            label: "Tax No",
            accessor: "taxNo",
            type: "text",
            noWrap: true,
        },
        {
            key: "taxDescription",
            label: "Tax Description",
            accessor: "taxDescription",
            type: "text",
        },
        {
            key: "module",
            label: "Module",
            accessor: "module",
            type: "text",
        },
        {
            key: "effectiveDate",
            label: "Effective Date",
            accessor: "effectiveDate",
            type: "text",
            noWrap: true,
        },
        {
            key: "createdOn",
            label: "Created On",
            accessor: "createdOn",
            type: "text",
            noWrap: true,
        },
        {
            key: "fillCopyOf",
            label: "Fill Copy Of",
            accessor: "fillCopyOf",
            type: "text",
        },
        {
            key: "isActive",
            label: "Status",
            accessor: "isActive",
            type: "status",
            statusVariants: {
                true: {
                    label: "Active",
                    className:
                        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
                },
                false: {
                    label: "Inactive",
                    className:
                        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
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
        "taxNo",
        "taxDescription",
        "module",
        "fillCopyOf",
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
            field: "isActive",
            filterValue: "active",
            activeValue: "Active",
        },
        {
            value: "inactive",
            label: "Inactive",
            field: "isActive",
            filterValue: "inactive",
            activeValue: "Active",
        },
    ];

    return (
        <CommonListViewTable
            title="Tax Definition"
            data={taxData}
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
            emptyMessage="No Tax Definition records found"
            loadingMessage="Loading Tax Definition records..."
            enableRefresh={true}
            onRefresh={loadTaxDefinitions}
            enableExport={true}
            exportFileName="Tax_Definition_Master"
        />
    );
};

export default TaxDefinationList;
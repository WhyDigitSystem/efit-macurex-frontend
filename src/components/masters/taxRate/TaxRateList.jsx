import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";

const TaxRateList = ({ onAddNew, onEdit, onBack }) => {
    const [taxData, setTaxData] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadTaxRates = async () => {
        setLoading(true);

        // Dummy Data - Matching the image format
        const data = [
            {
                id: 1,
                category: "Goods",
                hsnCode: "HSN 1 - 0101",
                description: "Agricultural Products",
                wef: "01/04/2025",
                igstRate: "5",
                sgstRate: "6",
                taxableYN: "Yes",
                rate: "5.00",
                cgstRate: "2.5",
                active: true,
            },
            {
                id: 2,
                category: "Goods",
                hsnCode: "HSN 2 - 0201",
                description: "Processed Food Items",
                wef: "01/04/2025",
                igstRate: "12",
                sgstRate: "10",
                taxableYN: "Yes",
                rate: "12.00",
                cgstRate: "6",
                active: true,
            },
            {
                id: 3,
                category: "Services",
                hsnCode: "HSN 3 - 0301",
                description: "IT Services",
                wef: "01/04/2025",
                igstRate: "18",
                sgstRate: "12",
                taxableYN: "Yes",
                rate: "18.00",
                cgstRate: "9",
                active: true,
            },
            {
                id: 4,
                category: "Goods",
                hsnCode: "HSN 4 - 0401",
                description: "Electronic Items",
                wef: "01/04/2025",
                igstRate: "28",
                sgstRate: "20",
                taxableYN: "Yes",
                rate: "28.00",
                cgstRate: "14",
                active: false,
            },
            {
                id: 5,
                category: "Services",
                hsnCode: "HSN 5 - 0501",
                description: "Consultancy Services",
                wef: "01/04/2025",
                igstRate: "18",
                sgstRate: "10",
                taxableYN: "No",
                rate: "0.00",
                cgstRate: "0",
                active: true,
            },
        ];

        data.sort((a, b) => b.id - a.id);
        setTaxData(data);
        setLoading(false);
    };

    useEffect(() => {
        loadTaxRates();
    }, []);

    const handleEdit = (tax) => {
        onEdit(tax);
    };

    const columns = [
        {
            key: "category",
            label: "Category",
            accessor: "category",
            type: "text",
            noWrap: true,
        },
        {
            key: "hsnCode",
            label: "HSN/SAC Code",
            accessor: "hsnCode",
            type: "text",
            noWrap: true,
        },
        {
            key: "description",
            label: "Description",
            accessor: "description",
            type: "text",
        },
        {
            key: "wef",
            label: "WEF",
            accessor: "wef",
            type: "text",
            noWrap: true,
        },
        {
            key: "igstRate",
            label: "IGST Rate",
            accessor: "igstRate",
            type: "text",
            align: "right",
        },
        {
            key: "taxableYN",
            label: "Taxable Y/N",
            accessor: "taxableYN",
            type: "text",
            align: "center",
        },
        {
            key: "rate",
            label: "Rate",
            accessor: "rate",
            type: "text",
            align: "right",
        },
        {
            key: "igstRate",
            label: "IGST Rate",
            accessor: "igstRate",
            type: "text",
            align: "right",
        },
        {
            key: "sgstRate",
            label: "SGST Rate",
            accessor: "sgstRate",
            type: "text",
            align: "right",
        },
        {
            key: "cgstRate",
            label: "CGST Rate",
            accessor: "cgstRate",
            type: "text",
            align: "right",
        },
        // {
        //     key: "active",
        //     label: "Status",
        //     accessor: "active",
        //     type: "status",
        //     statusVariants: {
        //         true: {
        //             label: "Active",
        //             className:
        //                 "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        //         },
        //         false: {
        //             label: "Inactive",
        //             className:
        //                 "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
        //         },
        //     },
        // },
        {
            key: "actions",
            label: "Actions",
            type: "actions",
            align: "center",
            width: "90px",
        },
    ];

    const searchFields = [
        "category",
        "hsnCode",
        "description",
        "rate",
        "taxableYN",
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
            title="Tax Rate"
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
            emptyMessage="No Tax Rate records found"
            loadingMessage="Loading Tax Rate records..."
            enableRefresh={true}
            onRefresh={loadTaxRates}
            enableExport={true}
            exportFileName="Tax_Rate_Master"
        />
    );
};

export default TaxRateList;
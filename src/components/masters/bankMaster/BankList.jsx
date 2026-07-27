import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";

const BankList = ({ onAddNew, onEdit, onBack }) => {
    const [bankData, setBankData] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadBanks = async () => {
        setLoading(true);

        // Dummy Data - Matching the image format
        const data = [
            {
                id: 1,
                tsBank: "HDFC001",
                beneficiaryName: "John Doe",
                bankName: "HDFC Bank",
                acNo: "123456789012",
                branch: "MG Road, Bangalore",
                ifscCode: "HDFC0001234",
                active: true,
            },
            {
                id: 2,
                tsBank: "SBI002",
                beneficiaryName: "Jane Smith",
                bankName: "State Bank of India",
                acNo: "987654321098",
                branch: "Commercial Street, Bangalore",
                ifscCode: "SBIN0005678",
                active: true,
            },
            {
                id: 3,
                tsBank: "ICICI003",
                beneficiaryName: "Robert Wilson",
                bankName: "ICICI Bank",
                acNo: "456789123456",
                branch: "Koramangala, Bangalore",
                ifscCode: "ICIC0009101",
                active: true,
            },
            {
                id: 4,
                tsBank: "AXIS004",
                beneficiaryName: "Maria Garcia",
                bankName: "Axis Bank",
                acNo: "789123456789",
                branch: "Indiranagar, Bangalore",
                ifscCode: "UTIB0001121",
                active: false,
            },
            {
                id: 5,
                tsBank: "KOTAK005",
                beneficiaryName: "David Lee",
                bankName: "Kotak Mahindra Bank",
                acNo: "321654987321",
                branch: "JP Nagar, Bangalore",
                ifscCode: "KKBK0003141",
                active: true,
            },
        ];

        data.sort((a, b) => b.id - a.id);
        setBankData(data);
        setLoading(false);
    };

    useEffect(() => {
        loadBanks();
    }, []);

    const handleEdit = (bank) => {
        onEdit(bank);
    };

    const columns = [
        {
            key: "beneficiaryName",
            label: "Beneficiary Name",
            accessor: "beneficiaryName",
            type: "text",
        },
        {
            key: "bankName",
            label: "Bank Name",
            accessor: "bankName",
            type: "text",
        },
        {
            key: "acNo",
            label: "AC No",
            accessor: "acNo",
            type: "text",
            noWrap: true,
        },
        {
            key: "branch",
            label: "Branch",
            accessor: "branch",
            type: "text",
        },
        {
            key: "ifscCode",
            label: "IFSC Code",
            accessor: "ifscCode",
            type: "text",
            noWrap: true,
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
        "tsBank",
        "beneficiaryName",
        "bankName",
        "acNo",
        "branch",
        "ifscCode",
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
            title="Bank"
            data={bankData}
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
            emptyMessage="No Bank records found"
            loadingMessage="Loading Bank records..."
            enableRefresh={true}
            onRefresh={loadBanks}
            enableExport={true}
            exportFileName="Bank_Master"
        />
    );
};

export default BankList;
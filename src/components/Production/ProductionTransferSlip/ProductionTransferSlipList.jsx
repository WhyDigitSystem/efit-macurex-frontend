import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import productionTransferSlipAPI from "../../../api/Production/productionTransferSlipAPI";
import { toast } from "../../../utils/toast";

const ProductionTransferSlipList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);

    const ORG_ID = localStorage.getItem("orgId");
    const BRANCH_ID = localStorage.getItem("branchId");

    const loadRecords = useCallback(async () => {
        try {
            setLoading(true);
            const data = await productionTransferSlipAPI.getByOrgId(ORG_ID, BRANCH_ID);
            data.sort((a, b) => (b.id || 0) - (a.id || 0));
            setRecords(data);
        } catch (error) {
            console.error("Failed to load production transfer slips:", error);
            setRecords([]);
            toast.error("Failed to fetch Production Transfer Slips");
        } finally {
            setLoading(false);
        }
    }, [ORG_ID, BRANCH_ID]);

    useEffect(() => {
        loadRecords();
    }, [loadRecords, refreshTrigger]);

    const columns = [
        {
            key: "issueNo",
            label: "Issue No.",
            accessor: (row) => row.issueNo || row.docId || row.transferNo,
            type: "text",
            noWrap: true,
        },
        {
            key: "issueDate",
            label: "Issue Date",
            accessor: (row) => row.issueDate || row.docDate || row.date,
            type: "text",
            noWrap: true,
        },
        {
            key: "plant",
            label: "Plant",
            accessor: (row) => row.plant?.plantName || row.plantName || row.plantId,
            type: "text",
        },
        {
            key: "fgPartNo",
            label: "FG Part No.",
            accessor: (row) => row.fgPartNo || row.fgItem?.itemCode || row.fgItemCode,
            type: "text",
        },
        {
            key: "sfgPartNo",
            label: "SFG Part No",
            accessor: (row) => row.sfgPartNo || row.sfgItem?.itemCode || row.sfgItemCode,
            type: "text",
        },
        {
            key: "belongsTo",
            label: "Belongs To",
            accessor: (row) => row.belongsTo,
            type: "text",
        },
        {
            key: "issueQty",
            label: "Issue Qty",
            accessor: (row) => row.issueQty,
            type: "text",
            noWrap: true,
        },
        {
            key: "active",
            label: "Status",
            accessor: "active",
            type: "status",
            statusVariants: {
                Active: {
                    label: "Active",
                    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
                },
                Inactive: {
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
        "issueNo",
        "docId",
        "transferNo",
        "issueDate",
        "docDate",
        "date",
        "plant.plantName",
        "plantName",
        "fgPartNo",
        "fgItem.itemCode",
        "fgItemCode",
        "sfgPartNo",
        "sfgItem.itemCode",
        "sfgItemCode",
        "belongsTo",
        "fromLocation",
        "toLocation",
    ];

    const filterOptions = [
        { value: "all", label: "All", field: null },
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
            title="Production Transfer Slip"
            subtitle="Manage Production Transfer Slips"
            data={records}
            loading={loading}
            columns={columns}
            searchFields={searchFields}
            filterOptions={filterOptions}
            defaultFilter="all"
            onBack={onBack}
            onAddNew={onAddNew}
            onEdit={onEdit}
            onView={false}
            showSerialNumber={true}
            itemsPerPageOptions={[5, 10, 20, 50, 100]}
            defaultItemsPerPage={10}
            emptyMessage="No Production Transfer Slips found"
            loadingMessage="Loading Production Transfer Slips..."
            enableRefresh={true}
            onRefresh={loadRecords}
            enableExport={true}
            exportFileName="ProductionTransferSlips"
        />
    );
};

export default ProductionTransferSlipList;
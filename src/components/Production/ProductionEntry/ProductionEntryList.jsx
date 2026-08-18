import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import productionEntryAPI from "../../../api/Production/productionEntryAPI";
import { toast } from "../../../utils/toast";

const ProductionEntryList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);

    const ORG_ID = localStorage.getItem("orgId");
    const BRANCH_ID = localStorage.getItem("branchId");

    const loadRecords = useCallback(async () => {
        try {
            setLoading(true);
            const data = await productionEntryAPI.getByOrgId(ORG_ID, BRANCH_ID);
            data.sort((a, b) => (b.id || 0) - (a.id || 0));
            setRecords(data);
        } catch (error) {
            console.error("Failed to load production entries:", error);
            setRecords([]);
            toast.error("Failed to fetch Production Entries");
        } finally {
            setLoading(false);
        }
    }, [ORG_ID, BRANCH_ID]);

    useEffect(() => {
        loadRecords();
    }, [loadRecords, refreshTrigger]);

    const columns = [
        {
            key: "docNo",
            label: "Doc No.",
            accessor: (row) => row.docNo || row.docId || row.entryNo,
            type: "text",
            noWrap: true,
        },
        {
            key: "date",
            label: "Date",
            accessor: (row) => row.date || row.docDate || row.entryDate,
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
            key: "fgItemCode",
            label: "FG Item Code",
            accessor: (row) => row.fgItem?.itemCode || row.fgItemCode || row.itemCode,
            type: "text",
        },
        {
            key: "fgItemDescription",
            label: "FG Item Description",
            accessor: (row) => row.fgItem?.itemDescription || row.fgItemDescription || row.itemDescription,
            type: "text",
        },
        {
            key: "productionQty",
            label: "Production QTY",
            accessor: (row) => row.productionQty,
            type: "text",
            noWrap: true,
        },
        {
            key: "belongsTo",
            label: "Belongs To",
            accessor: (row) => row.belongsTo,
            type: "text",
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
        "docNo",
        "docId",
        "entryNo",
        "date",
        "docDate",
        "entryDate",
        "plant.plantName",
        "plantName",
        "fgItem.itemCode",
        "fgItemCode",
        "itemCode",
        "fgItem.itemDescription",
        "fgItemDescription",
        "itemDescription",
        "belongsTo",
        "shift",
        "location",
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
            title="Production Entry"
            subtitle="Manage Production Entries"
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
            emptyMessage="No Production Entries found"
            loadingMessage="Loading Production Entries..."
            enableRefresh={true}
            onRefresh={loadRecords}
            enableExport={true}
            exportFileName="ProductionEntries"
        />
    );
};

export default ProductionEntryList;
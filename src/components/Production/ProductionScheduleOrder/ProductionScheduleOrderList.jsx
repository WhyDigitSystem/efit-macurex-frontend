import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import productionScheduleOrderAPI from "../../../api/Production/productionScheduleOrderAPI";
// import { toast } from "../../../utils/toast";

const ProductionScheduleOrderList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);

    const ORG_ID = localStorage.getItem("orgId");
    const BRANCH_ID = localStorage.getItem("branchId");

    const loadRecords = useCallback(async () => {
        try {
            setLoading(true);
            const data = await productionScheduleOrderAPI.getProductionScheduleOrderByOrgId(
                ORG_ID,
                BRANCH_ID,
            );
            data.sort((a, b) => (b.id || 0) - (a.id || 0));
            setRecords(data);
        } catch (error) {
            console.error("Failed to load production schedule orders:", error);
            setRecords([]);
            // toast.error("Failed to fetch Production Schedule Orders");
        } finally {
            setLoading(false);
        }
    }, [ORG_ID, BRANCH_ID]);

    useEffect(() => {
        loadRecords();
    }, [loadRecords, refreshTrigger]);

    const columns = [
        {
            key: "scheduleOrderNo",
            label: "Sch. Order No",
            accessor: (row) => row.scheduleOrderNo || row.docId || row.orderNo,
            type: "text",
            noWrap: true,
        },
        {
            key: "scheduleOrderType",
            label: "Sch. Order Type",
            accessor: (row) => row.scheduleOrderType || row.orderType,
            type: "text",
        },
        {
            key: "date",
            label: "Date",
            accessor: (row) => row.date || row.docDate || row.orderDate,
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
            label: "FG / SFG Item Code",
            accessor: (row) => row.fgItem?.itemCode || row.fgItemCode || row.itemCode,
            type: "text",
        },
        {
            key: "fgItemDescription",
            label: "FG / SFG Item Desc.",
            accessor: (row) => row.fgItem?.itemDescription || row.fgItemDescription || row.itemDescription,
            type: "text",
        },
        {
            key: "batchQty",
            label: "Batch Qty",
            accessor: (row) => row.batchQty,
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
        "scheduleOrderNo",
        "docId",
        "orderNo",
        "scheduleOrderType",
        "orderType",
        "date",
        "docDate",
        "orderDate",
        "plant.plantName",
        "plantName",
        "fgItem.itemCode",
        "fgItemCode",
        "itemCode",
        "fgItem.itemDescription",
        "fgItemDescription",
        "itemDescription",
        "lcPoNo",
        "compRouteNo",
        "bomId",
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
            title="Production Schedule Order"
            subtitle="Manage Production Schedule Orders"
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
            emptyMessage="No Production Schedule Orders found"
            loadingMessage="Loading Production Schedule Orders..."
            enableRefresh={true}
            onRefresh={loadRecords}
            enableExport={true}
            exportFileName="ProductionScheduleOrders"
        />
    );
};

export default ProductionScheduleOrderList;
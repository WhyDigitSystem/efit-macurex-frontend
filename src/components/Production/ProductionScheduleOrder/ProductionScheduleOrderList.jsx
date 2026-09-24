import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import productionScheduleOrderAPI from "../../../api/Production/productionScheduleOrderAPI";
// import { toast } from "../../../utils/toast";

const ProductionScheduleOrderList = ({
    onAddNew,
    onEdit,
    onBack,
    refreshTrigger,
}) => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);

    const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
    const BRANCH_ID = Number(localStorage.getItem("branchId")) || 0;

    const loadRecords = useCallback(async () => {
        if (!ORG_ID || !BRANCH_ID) return;
        try {
            setLoading(true);
            const data = await productionScheduleOrderAPI.getByOrgIdAndBranch({
                branch: BRANCH_ID,
                orgId: ORG_ID,
            });
            data.sort((a, b) => (b.id || 0) - (a.id || 0));
            setRecords(data);
        } catch (error) {
            console.error("Failed to load production schedule orders:", error);
            setRecords([]);
        } finally {
            setLoading(false);
        }
    }, [ORG_ID, BRANCH_ID]);

    useEffect(() => {
        loadRecords();
    }, [loadRecords, refreshTrigger]);

    /* ---------------- Accessors ---------------- */

    const getPlantLabel = (row) =>
        row?.branch?.branchName ||
        row?.branch?.branchCode ||
        row?.branch?.id ||
        "";

    const getFgItemCode = (row) => row?.fgItem?.itemCode || "";

    const getFgItemDescription = (row) =>
        row?.fgItem?.itemDescription || "";

    const getCompRouteLabel = (row) =>
        row?.compRouteNo?.docId ||
        row?.compRouteNo?.id ||
        "";

    const getBomLabel = (row) => row?.bom?.docId || row?.bom?.id || "";

    /* ---------------- Columns ---------------- */

    const columns = [
        {
            key: "docId",
            label: "Sch. Order No",
            accessor: (row) => row?.docId || "",
            type: "text",
            noWrap: true,
        },
        {
            key: "orderType",
            label: "Sch. Order Type",
            accessor: (row) => row?.orderType || "",
            type: "text",
        },
        {
            key: "docDate",
            label: "Date",
            accessor: (row) => row?.docDate || "",
            type: "date",
            noWrap: true,
        },
        {
            key: "branch",
            label: "Plant",
            accessor: (row) => getPlantLabel(row),
            type: "text",
        },
        {
            key: "fgItem",
            label: "FG / SFG Item Code",
            accessor: (row) => getFgItemCode(row),
            type: "text",
        },
        {
            key: "fgItemDescription",
            label: "FG / SFG Item Desc.",
            accessor: (row) => getFgItemDescription(row),
            type: "text",
        },
        {
            key: "compRouteNo",
            label: "Comp.Route No.",
            accessor: (row) => getCompRouteLabel(row),
            type: "text",
        },
        {
            key: "bom",
            label: "BOM Id",
            accessor: (row) => getBomLabel(row),
            type: "text",
        },
        {
            key: "batchQty",
            label: "Batch Qty",
            accessor: (row) => row?.batchQty ?? "",
            type: "text",
            noWrap: true,
        },
        {
            key: "active",
            label: "Status",
            accessor: (row) =>
                row?.active === true || row?.active === "Active"
                    ? "Active"
                    : "Inactive",
            type: "status",
            statusVariants: {
                Active: {
                    label: "Active",
                    className:
                        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
                },
                Inactive: {
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
        "docId",
        "orderType",
        "docDate",
        "branch.branchName",
        "fgItem.itemCode",
        "fgItem.itemDescription",
        "lcPoNo",
        "compRouteNo.docId",
        "bom.docId",
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
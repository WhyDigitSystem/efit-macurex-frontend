import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import materialIndentForProductionAPI from "../../../api/Production/materialIndentForProductionAPI";
import { toast } from "../../../utils/toast";

const MaterialIndentForProductionList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);

    const ORG_ID = localStorage.getItem("orgId");
    const BRANCH_ID = localStorage.getItem("branchId");

    const loadRecords = useCallback(async () => {
        try {
            setLoading(true);
            const data = await materialIndentForProductionAPI.getMaterialIndentsByOrgId(
                ORG_ID,
                BRANCH_ID,
            );
            data.sort((a, b) => (b.id || 0) - (a.id || 0));
            setRecords(data);
        } catch (error) {
            console.error("Failed to load material indents:", error);
            setRecords([]);
            toast.error("Failed to fetch Material Indents");
        } finally {
            setLoading(false);
        }
    }, [ORG_ID, BRANCH_ID]);

    useEffect(() => {
        loadRecords();
    }, [loadRecords, refreshTrigger]);

    const columns = [
        {
            key: "indentNo",
            label: "Indent No.",
            accessor: (row) => row.indentNo || row.docId || row.indentNumber,
            type: "text",
            noWrap: true,
        },
        {
            key: "indentDate",
            label: "Indent Date",
            accessor: (row) => row.indentDate || row.docDate || row.date,
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
            key: "department",
            label: "Department",
            accessor: (row) => row.department?.departmentName || row.departmentName || row.department,
            type: "text",
        },
        {
            key: "scheduleOrderNo",
            label: "Sch. Order No.",
            accessor: (row) => row.scheduleOrderNo || row.scheduleOrder?.docId || row.schOrderNo,
            type: "text",
        },
        {
            key: "fgItemCode",
            label: "FG/SFG Item Code",
            accessor: (row) => row.fgItem?.itemCode || row.fgItemCode || row.itemCode,
            type: "text",
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
        "indentNo",
        "docId",
        "indentNumber",
        "indentDate",
        "docDate",
        "date",
        "plant.plantName",
        "plantName",
        "department.departmentName",
        "departmentName",
        "department",
        "scheduleOrderNo",
        "schOrderNo",
        "fgItem.itemCode",
        "fgItemCode",
        "itemCode",
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
            title="Material Indent For Production"
            subtitle="Manage Material Indents"
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
            emptyMessage="No Material Indents found"
            loadingMessage="Loading Material Indents..."
            enableRefresh={true}
            onRefresh={loadRecords}
            enableExport={true}
            exportFileName="MaterialIndents"
        />
    );
};

export default MaterialIndentForProductionList;
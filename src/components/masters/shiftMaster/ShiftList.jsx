import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import shiftAPI from "../../../api/shiftAPI";
import { toast } from "../../../utils/toast";

const ShiftList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);

    const ORG_ID = localStorage.getItem("orgId");

    const loadRecords = useCallback(async () => {
        try {
            setLoading(true);
            const list = await shiftAPI.getByOrgId(ORG_ID);
            const arr = Array.isArray(list) ? list : [];
            arr.sort((a, b) => (b.id || 0) - (a.id || 0));
            setRecords(arr);
        } catch (error) {
            console.error("Failed to load shifts:", error);
            setRecords([]);
            toast.error("Failed to fetch Shift records");
        } finally {
            setLoading(false);
        }
    }, [ORG_ID]);

    useEffect(() => {
        loadRecords();
    }, [loadRecords, refreshTrigger]);

    const columns = [
        { key: "shiftCode", label: "Shift Code", accessor: "shiftCode" },
        { key: "shiftName", label: "Shift Name", accessor: "shiftName" },
        { key: "shiftType", label: "Shift Type", accessor: "shiftType" },
        { key: "timing", label: "Timing", accessor: "timing" },
        {
            key: "effectiveFrom",
            label: "Eff. From",
            accessor: (row) =>
                row.fromHour
                    ? String(row.fromHour).includes("T")
                        ? String(row.fromHour).slice(0, 10)
                        : String(row.fromHour).slice(0, 5)
                    : "",
        },
        {
            key: "active",
            label: "Status",
            accessor: "active",
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

    return (
        <CommonListViewTable
            title="Shift Master"
            data={records}
            loading={loading}
            columns={columns}
            searchFields={["shiftCode", "shiftName", "shiftType", "timing"]}
            onBack={onBack}
            onAddNew={onAddNew}
            onEdit={onEdit}
            onView={false}
            showSerialNumber
            itemsPerPageOptions={[5, 10, 20, 50, 100]}
            defaultItemsPerPage={10}
            emptyMessage="No Shift records found"
            loadingMessage="Loading Shift records..."
            enableRefresh
            onRefresh={loadRecords}
            enableExport
            exportFileName="ShiftMaster"
        />
    );
};

export default ShiftList;
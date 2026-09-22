import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import machineSettingPlanAPI from "../../../api/Production/machineSettingPlanAPI";
import { toast } from "../../../utils/toast";

const MachineSettingPlanList = ({
    onAddNew,
    onEdit,
    onBack,
    refreshTrigger,
}) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
    const BRANCH_ID = Number(localStorage.getItem("branchId")) || 0;

    const loadData = useCallback(async () => {
        if (!ORG_ID || !BRANCH_ID) {
            setData([]);
            return;
        }

        try {
            setLoading(true);

            const list = await machineSettingPlanAPI.getByOrgIdAndBranch({
                branch: BRANCH_ID,
                orgId: ORG_ID,
            });

            const sortedData = (list || []).sort(
                (a, b) => (b.id || 0) - (a.id || 0),
            );

            setData(sortedData);
        } catch (error) {
            console.error("Failed to load machine setting plans:", error);
            setData([]);
            toast.error("Failed to fetch records");
        } finally {
            setLoading(false);
        }
    }, [ORG_ID, BRANCH_ID]);

    useEffect(() => {
        loadData();
    }, [loadData, refreshTrigger]);

    /* ---------------- Accessors ---------------- */

    const getPlantLabel = (row) =>
        row?.branch?.branchName ||
        row?.branch?.branchCode ||
        row?.branch?.id ||
        "";

    const getItemCode = (row) => row?.item?.itemCode || "";

    const getItemDescription = (row) => row?.item?.itemDescription || "";

    /* ---------------- Columns ---------------- */

    const columns = [
        {
            key: "docId",
            label: "Doc No.",
            accessor: (row) => row?.docId || "",
            type: "text",
            noWrap: true,
        },
        {
            key: "docDate",
            label: "Date",
            accessor: (row) => row?.docDate || "",
            type: "text",
        },
        {
            key: "branch",
            label: "Plant",
            accessor: (row) => getPlantLabel(row),
            type: "text",
        },
        {
            key: "item",
            label: "Item Code",
            accessor: (row) => getItemCode(row),
            type: "text",
        },
        {
            key: "itemDescription",
            label: "Item Description",
            accessor: (row) => getItemDescription(row),
            type: "text",
        },
        {
            key: "operationNo",
            label: "Operation No.",
            accessor: (row) => row?.operationNo || "",
            type: "text",
        },
        {
            key: "operationName",
            label: "Operation Name",
            accessor: (row) => row?.operationName || "",
            type: "text",
        },
        {
            key: "machineNo",
            label: "Machine No.",
            accessor: (row) => row?.machineNo || "",
            type: "text",
        },
        {
            key: "machineName",
            label: "Machine Name",
            accessor: (row) => row?.machineName || "",
            type: "text",
        },
        {
            key: "processSheetNo",
            label: "Process Sheet No",
            accessor: (row) => row?.processSheetNo || "",
            type: "text",
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
        "item.itemCode",
        "item.itemDescription",
        "operationNo",
        "machineNo",
        "processSheetNo",
    ];

    return (
        <div className="h-full flex flex-col">
            <CommonListViewTable
                title="Machine Setting Plan"
                data={data}
                loading={loading}
                columns={columns}
                searchFields={searchFields}
                onBack={onBack}
                onAddNew={onAddNew}
                onEdit={onEdit}
                onView={false}
                showSerialNumber={true}
                itemsPerPageOptions={[5, 10, 20, 50, 100]}
                defaultItemsPerPage={10}
                emptyMessage="No machine setting plan records found"
                loadingMessage="Loading machine setting plans..."
                enableRefresh={true}
                onRefresh={loadData}
                enableExport={true}
                exportFileName="MachineSettingPlan"
            />
        </div>
    );
};

export default MachineSettingPlanList;
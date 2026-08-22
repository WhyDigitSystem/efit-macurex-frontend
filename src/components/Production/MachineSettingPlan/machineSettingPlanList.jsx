import React, { useState, useEffect, useCallback } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";
import machineSettingPlanAPI from "../../../api/Production/machineSettingPlanAPI";

const MachineSettingPlanList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const ORG_ID = Number(localStorage.getItem("orgId"));
    const BRANCH_ID = Number(localStorage.getItem("branchId"));

    // Define columns
    const columns = [
        {
            key: "docNo",
            label: "Doc No.",
            accessor: (row) => row.docNo,
            type: "text",
        },
        {
            key: "date",
            label: "Date",
            accessor: (row) => row.date,
            type: "date",
        },
        {
            key: "plant",
            label: "Plant",
            accessor: (row) => row.plant?.name || row.plantName,
            type: "text",
        },
        {
            key: "itemCode",
            label: "Item Code",
            accessor: (row) => row.itemCode,
            type: "text",
        },
        {
            key: "itemDescription",
            label: "Item Description",
            accessor: (row) => row.itemDescription,
            type: "text",
        },
        {
            key: "operationNo",
            label: "Operation No.",
            accessor: (row) => row.operationNo,
            type: "text",
        },
        {
            key: "machineNo",
            label: "Machine No.",
            accessor: (row) => row.machineNo,
            type: "text",
        },
        {
            key: "processSheetNo",
            label: "Process Sheet No",
            accessor: (row) => row.processSheetNo,
            type: "text",
        },
        { key: "active", label: "Status", accessor: "active", type: "status" },
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
        "itemCode",
        "itemDescription",
        "operationNo",
        "machineNo",
        "processSheetNo"
    ];

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await machineSettingPlanAPI.getMachineSettingPlans(ORG_ID, BRANCH_ID);
            const list = response?.paramObjectsMap?.machineSettingPlanList || [];
            const sortedData = list.sort((a, b) => (b.id || 0) - (a.id || 0));
            setData(sortedData);
        } catch (error) {
            console.error("Failed to load data:", error);
            setData([]);
            toast.error("Failed to fetch records");
        } finally {
            setLoading(false);
        }
    }, [ORG_ID, BRANCH_ID]);

    useEffect(() => {
        loadData();
    }, [loadData, refreshTrigger]);

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
import React, { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import machineMasterAPI from "../../../api/Production/machineMasterAPI";
import { toast } from "../../../utils/toast";

const MachineMasterList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);

    const ORG_ID = localStorage.getItem("orgId");
    const BRANCH_ID = localStorage.getItem("branchId");

    const loadRecords = useCallback(async () => {
        if (!ORG_ID) return;
        try {
            setLoading(true);
            const response = await machineMasterAPI.getMachineMaster(ORG_ID, BRANCH_ID);
            console.log("API Response:", response);

            // Extract data from response
            let data = [];
            if (response?.paramObjectsMap?.machineMasterResponseVO) {
                data = response.paramObjectsMap.machineMasterResponseVO;
            } else if (response?.paramObjectsMap?.machineMasterList) {
                data = response.paramObjectsMap.machineMasterList;
            } else if (Array.isArray(response)) {
                data = response;
            } else if (response?.data?.paramObjectsMap?.machineMasterResponseVO) {
                data = response.data.paramObjectsMap.machineMasterResponseVO;
            }

            // Map the data for the table
            const mappedData = data.map((item) => ({
                id: item.id,
                machineInstrumentNo: item.machineInstrumentNo || "",
                machineInstrumentName: item.machineInstrumentName || "",
                type: typeof item.type === "object"
                    ? (item.type?.description || item.type?.code || "")
                    : item.type || "",
                department: typeof item.department === "object"
                    ? (item.department?.departmentName || item.department?.departmentCode || "")
                    : item.department || "",
                location: typeof item.location === "object"
                    ? (item.location?.locationName || "")
                    : item.location || "",
                active: item.active ? "Active" : "Inactive",
                status: item.active ? "Active" : "Inactive",
                // Store full data for edit
                _fullData: item,
            }));

            // Sort by ID descending (newest first)
            mappedData.sort((a, b) => (b.id || 0) - (a.id || 0));
            setRecords(mappedData);
        } catch (error) {
            console.error("Failed to load machine master:", error);
            setRecords([]);
            toast.error("Failed to fetch Machine/Instrument Master");
        } finally {
            setLoading(false);
        }
    }, [ORG_ID, BRANCH_ID]);

    useEffect(() => {
        loadRecords();
    }, [loadRecords, refreshTrigger]);

    const columns = [
        {
            key: "machineInstrumentNo",
            label: "Machine/Instrument No",
            accessor: "machineInstrumentNo",
            type: "text",
            noWrap: true,
        },
        {
            key: "machineInstrumentName",
            label: "Machine/Instrument Name",
            accessor: "machineInstrumentName",
            type: "text",
        },
        {
            key: "type",
            label: "Type",
            accessor: "type",
            type: "text",
        },
        {
            key: "department",
            label: "Department",
            accessor: "department",
            type: "text",
        },
        {
            key: "location",
            label: "Location",
            accessor: "location",
            type: "text",
        },
        {
            key: "status",
            label: "Status",
            accessor: "status",
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
        "machineInstrumentNo",
        "machineInstrumentName",
        "type",
        "department",
        "location",
    ];

    const filterOptions = [
        { value: "all", label: "All", field: null },
        {
            value: "active",
            label: "Active",
            field: "status",
            filterValue: "Active",
            activeValue: "Active",
        },
        {
            value: "inactive",
            label: "Inactive",
            field: "status",
            filterValue: "Inactive",
            activeValue: "Active",
        },
    ];

    return (
        <CommonListViewTable
            title="Machine / Instrument Master"
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
            emptyMessage="No Machine/Instrument records found"
            loadingMessage="Loading Machine/Instrument records..."
            enableRefresh={true}
            onRefresh={loadRecords}
            enableExport={true}
            exportFileName="MachineInstrumentMaster"
        />
    );
};

export default MachineMasterList;
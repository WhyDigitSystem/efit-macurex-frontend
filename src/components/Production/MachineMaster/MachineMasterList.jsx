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
        try {
            setLoading(true);
            const response = await machineMasterAPI.getMachineMaster(ORG_ID, BRANCH_ID);
            const data = response?.paramObjectsMap?.machineMasterList || [];
            data.sort((a, b) => (b.id || 0) - (a.id || 0));
            setRecords(data);
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
            accessor: (row) => row.machineInstrumentNo || row.machineInstrumentNumber,
            type: "text",
            noWrap: true,
        },
        {
            key: "machineInstrumentName",
            label: "Machine/Instrument Name",
            accessor: (row) => row.machineInstrumentName || row.name,
            type: "text",
        },
        {
            key: "type",
            label: "Type",
            accessor: (row) =>
                typeof row.type === "object"
                    ? row.type.valuesDescription || row.type.valueDescription
                    : row.type,
            type: "text",
        },
        {
            key: "department",
            label: "Department",
            accessor: (row) =>
                typeof row.department === "object"
                    ? row.department.valuesDescription || row.department.valueDescription
                    : row.department,
            type: "text",
        },
        {
            key: "location",
            label: "Location",
            accessor: (row) =>
                typeof row.location === "object"
                    ? row.location.valuesDescription || row.location.valueDescription
                    : row.location,
            type: "text",
        },
        {
            key: "status",
            label: "Status",
            accessor: "active",
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
        "machineInstrumentNumber",
        "machineInstrumentName",
        "name",
        "type",
        "department",
        "location",
    ];

    const filterOptions = [
        { value: "all", label: "All", field: null },
        {
            value: "active",
            label: "Active",
            field: "active",
            filterValue: "Active",
            activeValue: "Active",
        },
        {
            value: "inactive",
            label: "Inactive",
            field: "active",
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
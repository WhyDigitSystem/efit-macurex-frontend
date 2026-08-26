// MachineToolBreakdownList.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";

const MachineToolBreakdownList = ({ onAddNew, onEdit, onBack }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        // Dummy data for now - replace with actual API call
        const dummyData = [
            {
                id: 1,
                breakdownNo: "MTB/2026/0001",
                plantId: "Plant 001",
                department: "Production",
                machineTool: "Machine A",
                date: "25/08/2026",
                machineName: "Lathe Machine",
                location: "Workshop A",
                maintenanceType: "Preventive",
                breakdownType: "Major",
                status: "Completed",
                operatorName: "John Doe",
                active: true,
            },
            {
                id: 2,
                breakdownNo: "MTB/2026/0002",
                plantId: "Plant 002",
                department: "Maintenance",
                machineTool: "Tool B",
                date: "26/08/2026",
                machineName: "Drill Machine",
                location: "Workshop B",
                maintenanceType: "Corrective",
                breakdownType: "Minor",
                status: "Pending",
                operatorName: "Jane Smith",
                active: true,
            },
        ];
        dummyData.sort((a, b) => b.id - a.id);
        setData(dummyData);
        setLoading(false);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleEdit = (row) => {
        onEdit(row);
    };

    const columns = [
        {
            key: "breakdownNo",
            label: "Breakdown No",
            accessor: "breakdownNo",
            type: "text",
            noWrap: true,
        },
        {
            key: "plantId",
            label: "Plant ID",
            accessor: "plantId",
            type: "text",
        },
        {
            key: "department",
            label: "Department",
            accessor: "department",
            type: "text",
        },
        {
            key: "machineTool",
            label: "Machine/Tool",
            accessor: "machineTool",
            type: "text",
        },
        {
            key: "machineName",
            label: "Machine Name",
            accessor: "machineName",
            type: "text",
        },
        {
            key: "date",
            label: "Date",
            accessor: "date",
            type: "text",
            noWrap: true,
        },
        {
            key: "location",
            label: "Location",
            accessor: "location",
            type: "text",
        },
        {
            key: "maintenanceType",
            label: "Maintenance Type",
            accessor: "maintenanceType",
            type: "text",
        },
        {
            key: "breakdownType",
            label: "Breakdown Type",
            accessor: "breakdownType",
            type: "text",
        },
        {
            key: "active",
            label: "Status",
            accessor: "active",
            type: "status",
            statusVariants: {
                true: {
                    label: "Active",
                    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
                },
                false: {
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
        "breakdownNo",
        "plantId",
        "department",
        "machineTool",
        "machineName",
        "location",
        "maintenanceType",
        "operatorName",
    ];

    const filterOptions = [
        {
            value: "all",
            label: "All",
            field: null,
        },
        {
            value: "completed",
            label: "Completed",
            field: "status",
            filterValue: "completed",
            activeValue: "Completed",
        },
        {
            value: "pending",
            label: "Pending",
            field: "status",
            filterValue: "pending",
            activeValue: "Pending",
        },
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
            title="Machine/Tool Breakdown"
            data={data}
            loading={loading}
            columns={columns}
            searchFields={searchFields}
            filterOptions={filterOptions}
            defaultFilter="all"
            onBack={onBack}
            onAddNew={onAddNew}
            onEdit={handleEdit}
            onView={false}
            showSerialNumber={true}
            itemsPerPageOptions={[5, 10, 20, 50, 100]}
            defaultItemsPerPage={10}
            emptyMessage="No Machine/Tool Breakdown records found"
            loadingMessage="Loading Machine/Tool Breakdown records..."
            enableRefresh={true}
            onRefresh={loadData}
            enableExport={true}
            exportFileName="Machine_Tool_Breakdown"
        />
    );
};

export default MachineToolBreakdownList;
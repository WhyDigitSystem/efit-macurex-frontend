// MachineToolBreakdownList.jsx
import React, { useEffect, useState, useCallback } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import machineToolBreakdownAPI from "../../../api/machineToolBreakdownAPI";

const MachineToolBreakdownList = ({ onAddNew, onEdit, onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const orgId = localStorage.getItem("orgId");
  const branchId = localStorage.getItem("branchId");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const list = await machineToolBreakdownAPI.getMachineToolBreakdownByOrgId(
        orgId,
        branchId,
      );

      const mapped = (list || []).map((row) => ({
        id: row.id,
        breakdownNo: row.docId || row.breakdownNo || `MTB-${row.id}`,
        plantId: row.branch?.branchName || "-",
        department: row.department?.departmentName || "-",
        machineTool:
          row.selectMachineToolInst?.applicableFor ||
          row.selectMachineToolInst?.apllicableFor ||
          "-",
        date: row.reportedDate || "-",
        machineName: row.machineName || "-",
        location: row.location || "-",
        maintenanceType: row.maintenanceType?.description || "-",
        breakdownType: row.breakdownType?.description || "-",
        operatorName: row.operatorName?.employeeName || "-",
        active: row.active,
        raw: row,
      }));

      mapped.sort((a, b) => b.id - a.id);
      setData(mapped);
    } catch (error) {
      console.error("Failed to load machine tool breakdown list:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [orgId, branchId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEdit = (row) => {
    onEdit(row.raw || row);
  };

  const columns = [
    {
      key: "breakdownNo",
      label: "Breakdown No",
      accessor: "breakdownNo",
      type: "text",
      noWrap: true,
    },
    { key: "plantId", label: "Plant ID", accessor: "plantId", type: "text" },
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
    { key: "location", label: "Location", accessor: "location", type: "text" },
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
          className:
            "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        },
        false: {
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

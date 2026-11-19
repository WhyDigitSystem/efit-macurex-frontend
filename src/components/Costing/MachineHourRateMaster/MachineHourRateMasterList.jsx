import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";

const MachineHourRateMasterList = ({ onAddNew, onEdit, onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    // Dummy Data
    const dummyData = [
      {
        id: 1,
        mcCostId: "MC001",
        plantId: "Plant 001",
        machineName: "CNC Lathe 01",
        machineLocation: "Location 001",
        date: "19/11/2026",
        machineHourRate: "412.50",
        machineHourRateWithSurcharge: "433.13",
        status: "Pending",
      },
      {
        id: 2,
        mcCostId: "MC002",
        plantId: "Plant 001",
        machineName: "Press 100T",
        machineLocation: "Location 002",
        date: "19/11/2026",
        machineHourRate: "286.00",
        machineHourRateWithSurcharge: "300.30",
        status: "Approved",
      },
      {
        id: 3,
        mcCostId: "MC003",
        plantId: "Plant 002",
        machineName: "VMC 02",
        machineLocation: "Location 003",
        date: "05/11/2026",
        machineHourRate: "534.75",
        machineHourRateWithSurcharge: "561.49",
        status: "Approved",
      },
    ];
    dummyData.sort((a, b) => b.id - a.id);
    setData(dummyData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (row) => {
    onEdit(row);
  };

  const columns = [
    {
      key: "mcCostId",
      label: "M/C Cost Id",
      accessor: "mcCostId",
      type: "text",
      noWrap: true,
    },
    { key: "plantId", label: "Plant Id", accessor: "plantId", type: "text" },
    {
      key: "machineName",
      label: "Machine Name",
      accessor: "machineName",
      type: "text",
    },
    {
      key: "machineLocation",
      label: "Machine Location",
      accessor: "machineLocation",
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
      key: "machineHourRate",
      label: "Machine Hour Rate",
      accessor: "machineHourRate",
      type: "text",
      align: "right",
    },
    {
      key: "machineHourRateWithSurcharge",
      label: "Rate Incl. Surcharge",
      accessor: "machineHourRateWithSurcharge",
      type: "text",
      align: "right",
    },
    {
      key: "status",
      label: "Status",
      accessor: "status",
      type: "status",
      statusVariants: {
        Pending: {
          label: "Pending",
          className:
            "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
        },
        Approved: {
          label: "Approved",
          className:
            "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
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
    "mcCostId",
    "plantId",
    "machineName",
    "machineLocation",
  ];

  const filterOptions = [
    { value: "all", label: "All", field: null },
    {
      value: "pending",
      label: "Pending",
      field: "status",
      filterValue: "pending",
      activeValue: "Pending",
    },
    {
      value: "approved",
      label: "Approved",
      field: "status",
      filterValue: "approved",
      activeValue: "Approved",
    },
  ];

  return (
    <CommonListViewTable
      title="Machine Hour Rate Master"
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
      emptyMessage="No Machine Hour Rate Master records found"
      loadingMessage="Loading Machine Hour Rate Master records..."
      enableRefresh={true}
      onRefresh={loadData}
      enableExport={true}
      exportFileName="Machine_Hour_Rate_Master"
    />
  );
};

export default MachineHourRateMasterList;

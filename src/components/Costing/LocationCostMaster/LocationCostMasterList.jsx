import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";

const LocationCostMasterList = ({ onAddNew, onEdit, onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    // Dummy Data
    const dummyData = [
      {
        id: 1,
        locationCostId: "LC001",
        plantId: "Plant 001",
        location: "Location 001",
        date: "19/11/2026",
        totalBuildingCost: "25000000.00",
        totalDepreciationForLocation: "62500.00",
        noOfMachines: "12",
        status: "Pending",
      },
      {
        id: 2,
        locationCostId: "LC002",
        plantId: "Plant 001",
        location: "Location 002",
        date: "19/11/2026",
        totalBuildingCost: "25000000.00",
        totalDepreciationForLocation: "93750.00",
        noOfMachines: "18",
        status: "Approved",
      },
      {
        id: 3,
        locationCostId: "LC003",
        plantId: "Plant 002",
        location: "Location 003",
        date: "05/11/2026",
        totalBuildingCost: "18000000.00",
        totalDepreciationForLocation: "45000.00",
        noOfMachines: "8",
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
      key: "locationCostId",
      label: "Location Cost Id",
      accessor: "locationCostId",
      type: "text",
      noWrap: true,
    },
    { key: "plantId", label: "Plant Id", accessor: "plantId", type: "text" },
    { key: "location", label: "Location", accessor: "location", type: "text" },
    {
      key: "date",
      label: "Date",
      accessor: "date",
      type: "text",
      noWrap: true,
    },
    {
      key: "totalBuildingCost",
      label: "Total Building Cost",
      accessor: "totalBuildingCost",
      type: "text",
      align: "right",
    },
    {
      key: "totalDepreciationForLocation",
      label: "Depreciation For Location/Annum",
      accessor: "totalDepreciationForLocation",
      type: "text",
      align: "right",
    },
    {
      key: "noOfMachines",
      label: "No. of Machines",
      accessor: "noOfMachines",
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

  const searchFields = ["locationCostId", "plantId", "location"];

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
      title="Location Cost Master"
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
      emptyMessage="No Location Cost Master records found"
      loadingMessage="Loading Location Cost Master records..."
      enableRefresh={true}
      onRefresh={loadData}
      enableExport={true}
      exportFileName="Location_Cost_Master"
    />
  );
};

export default LocationCostMasterList;

import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";

const LCDespatchInstructionList = ({ onAddNew, onEdit, onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    // Dummy Data
    const dummyData = [
      {
        id: 1,
        diNo: "LCDI001",
        plantId: "Plant 001",
        partyName: "ABC Appliances",
        scheduleNo: "SCH001",
        date: "17/11/2026",
        modeOfTransport: "Road",
        consignee: "ABC Appliances - Bengaluru",
        active: true,
      },
      {
        id: 2,
        diNo: "LCDI002",
        plantId: "Plant 002",
        partyName: "Bosch Ltd",
        scheduleNo: "SCH002",
        date: "17/11/2026",
        modeOfTransport: "Rail",
        consignee: "Bosch Ltd - Chennai",
        active: true,
      },
      {
        id: 3,
        diNo: "LCDI003",
        plantId: "Plant 001",
        partyName: "XYZ Industries",
        scheduleNo: "SCH003",
        date: "14/11/2026",
        modeOfTransport: "Road",
        consignee: "XYZ Industries - Pune",
        active: false,
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
      key: "diNo",
      label: "DI No.",
      accessor: "diNo",
      type: "text",
      noWrap: true,
    },
    { key: "plantId", label: "Plant ID", accessor: "plantId", type: "text" },
    {
      key: "partyName",
      label: "Party Name",
      accessor: "partyName",
      type: "text",
    },
    {
      key: "scheduleNo",
      label: "Schedule No.",
      accessor: "scheduleNo",
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
      key: "modeOfTransport",
      label: "Mode Of Transport",
      accessor: "modeOfTransport",
      type: "text",
    },
    {
      key: "consignee",
      label: "Consignee",
      accessor: "consignee",
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
    "diNo",
    "plantId",
    "partyName",
    "scheduleNo",
    "consignee",
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
      title="LC Despatch Instruction"
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
      emptyMessage="No LC Despatch Instruction records found"
      loadingMessage="Loading LC Despatch Instruction records..."
      enableRefresh={true}
      onRefresh={loadData}
      enableExport={true}
      exportFileName="LC_Despatch_Instruction"
    />
  );
};

export default LCDespatchInstructionList;

import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";

const LCDeliveryScheduleList = ({ onAddNew, onEdit, onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    // Dummy Data
    const dummyData = [
      {
        id: 1,
        docNo: "LCDS001",
        plantId: "Plant 001",
        customerName: "ABC Appliances",
        monthOfSchedule: "November",
        monthYear: "Nov-2026",
        docDate: "17/11/2026",
        active: true,
      },
      {
        id: 2,
        docNo: "LCDS002",
        plantId: "Plant 002",
        customerName: "Bosch Ltd",
        monthOfSchedule: "November",
        monthYear: "Nov-2026",
        docDate: "17/11/2026",
        active: true,
      },
      {
        id: 3,
        docNo: "LCDS003",
        plantId: "Plant 001",
        customerName: "XYZ Industries",
        monthOfSchedule: "October",
        monthYear: "Oct-2026",
        docDate: "01/10/2026",
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
      key: "docNo",
      label: "Doc. No.",
      accessor: "docNo",
      type: "text",
      noWrap: true,
    },
    { key: "plantId", label: "Plant ID", accessor: "plantId", type: "text" },
    {
      key: "customerName",
      label: "Customer Name",
      accessor: "customerName",
      type: "text",
    },
    {
      key: "monthOfSchedule",
      label: "Month Of Schedule",
      accessor: "monthOfSchedule",
      type: "text",
    },
    {
      key: "monthYear",
      label: "Month-Year",
      accessor: "monthYear",
      type: "text",
      noWrap: true,
    },
    {
      key: "docDate",
      label: "Doc. Date",
      accessor: "docDate",
      type: "text",
      noWrap: true,
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
    "docNo",
    "plantId",
    "customerName",
    "monthOfSchedule",
    "monthYear",
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
      title="LC Delivery Schedule"
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
      emptyMessage="No LC Delivery Schedule records found"
      loadingMessage="Loading LC Delivery Schedule records..."
      enableRefresh={true}
      onRefresh={loadData}
      enableExport={true}
      exportFileName="LC_Delivery_Schedule"
    />
  );
};

export default LCDeliveryScheduleList;

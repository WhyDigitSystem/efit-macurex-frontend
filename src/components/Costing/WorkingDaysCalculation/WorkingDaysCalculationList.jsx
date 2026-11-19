import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";

const WorkingDaysCalculationList = ({ onAddNew, onEdit, onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    // Dummy Data
    const dummyData = [
      {
        id: 1,
        year: "2026",
        noOfYearDays: "365",
        noOfTotalHolidays: "62",
        noOfWorkingDays: "303",
        active: true,
      },
      {
        id: 2,
        year: "2025",
        noOfYearDays: "365",
        noOfTotalHolidays: "60",
        noOfWorkingDays: "305",
        active: true,
      },
      {
        id: 3,
        year: "2024",
        noOfYearDays: "366",
        noOfTotalHolidays: "61",
        noOfWorkingDays: "305",
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
      key: "year",
      label: "Year",
      accessor: "year",
      type: "text",
      noWrap: true,
    },
    {
      key: "noOfYearDays",
      label: "No. Of Year Days",
      accessor: "noOfYearDays",
      type: "text",
      align: "right",
    },
    {
      key: "noOfTotalHolidays",
      label: "No. Of Total Holidays",
      accessor: "noOfTotalHolidays",
      type: "text",
      align: "right",
    },
    {
      key: "noOfWorkingDays",
      label: "No. Of Working Days",
      accessor: "noOfWorkingDays",
      type: "text",
      align: "right",
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

  const searchFields = ["year"];

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
      title="Working Days Calculation"
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
      emptyMessage="No Working Days Calculation records found"
      loadingMessage="Loading Working Days Calculation records..."
      enableRefresh={true}
      onRefresh={loadData}
      enableExport={true}
      exportFileName="Working_Days_Calculation"
    />
  );
};

export default WorkingDaysCalculationList;

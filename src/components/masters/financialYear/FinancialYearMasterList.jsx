import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";

const FinancialYearMasterList = ({ onAddNew, onEdit,onBack }) => {
  const [financialYearData, setFinancialYearData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadFinancialYears = async () => {
    setLoading(true);

    // Dummy Data
    const data = [
      {
        id: 6,
        financialYearCode: "FY25-26",
        financialYear: "2025-2026",
        fromDate: "01-Apr-2025",
        toDate: "31-Mar-2026",
        isCurrent: true,
        active: true,
      },
      {
        id: 5,
        financialYearCode: "FY24-25",
        financialYear: "2024-2025",
        fromDate: "01-Apr-2024",
        toDate: "31-Mar-2025",
        isCurrent: false,
        active: true,
      },
      {
        id: 4,
        financialYearCode: "FY23-24",
        financialYear: "2023-2024",
        fromDate: "01-Apr-2023",
        toDate: "31-Mar-2024",
        isCurrent: false,
        active: true,
      },
      {
        id: 3,
        financialYearCode: "FY22-23",
        financialYear: "2022-2023",
        fromDate: "01-Apr-2022",
        toDate: "31-Mar-2023",
        isCurrent: false,
        active: true,
      },
      {
        id: 2,
        financialYearCode: "FY21-22",
        financialYear: "2021-2022",
        fromDate: "01-Apr-2021",
        toDate: "31-Mar-2022",
        isCurrent: false,
        active: false,
      },
      {
        id: 1,
        financialYearCode: "FY20-21",
        financialYear: "2020-2021",
        fromDate: "01-Apr-2020",
        toDate: "31-Mar-2021",
        isCurrent: false,
        active: false,
      },
    ];

    data.sort((a, b) => b.id - a.id);

    setFinancialYearData(data);
    setLoading(false);
  };

  useEffect(() => {
    loadFinancialYears();
  }, []);

  const handleEdit = (financialYear) => {
    onEdit(financialYear);
  };

  const columns = [
    {
      key: "financialYearCode",
      label: "FY Code",
      accessor: "financialYearCode",
      type: "text",
      noWrap: true,
    },
    {
      key: "financialYear",
      label: "Financial Year",
      accessor: "financialYear",
      type: "text",
    },
    {
      key: "fromDate",
      label: "From Date",
      accessor: "fromDate",
      type: "text",
    },
    {
      key: "toDate",
      label: "To Date",
      accessor: "toDate",
      type: "text",
    },
    {
      key: "isCurrent",
      label: "Current FY",
      accessor: "isCurrent",
      type: "status",
      statusVariants: {
        true: {
          label: "Yes",
          className:
            "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
        },
        false: {
          label: "No",
          className:
            "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
        },
      },
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
    "financialYearCode",
    "financialYear",
    "fromDate",
    "toDate",
  ];

  const filterOptions = [
    {
      value: "all",
      label: "All",
      field: null,
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
      title="Financial Year "
      data={financialYearData}
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
      emptyMessage="No Financial Years found"
      loadingMessage="Loading Financial Years..."
      enableRefresh={true}
      onRefresh={loadFinancialYears}
      enableExport={true}
      exportFileName="FinancialYears"
    />
  );
};

export default FinancialYearMasterList;
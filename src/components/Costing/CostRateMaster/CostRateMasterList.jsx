import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";

const CostRateMasterList = ({ onAddNew, onEdit, onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    // Dummy Data
    const dummyData = [
      {
        id: 1,
        docId: "CR001",
        costDescription: "Standard Cost Rate - FY 2026",
        date: "18/11/2026",
        adminOverHead: "5.00",
        commissionPercentage: "2.50",
        costOfEnergyPerHour: "45.00",
        insuranceRate: "0.80",
        active: true,
      },
      {
        id: 2,
        docId: "CR002",
        costDescription: "Export Cost Rate",
        date: "18/11/2026",
        adminOverHead: "6.50",
        commissionPercentage: "3.00",
        costOfEnergyPerHour: "48.50",
        insuranceRate: "1.20",
        active: true,
      },
      {
        id: 3,
        docId: "CR003",
        costDescription: "Standard Cost Rate - FY 2025",
        date: "01/04/2025",
        adminOverHead: "4.50",
        commissionPercentage: "2.00",
        costOfEnergyPerHour: "42.00",
        insuranceRate: "0.75",
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
      key: "docId",
      label: "DocId",
      accessor: "docId",
      type: "text",
      noWrap: true,
    },
    {
      key: "costDescription",
      label: "Cost Description",
      accessor: "costDescription",
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
      key: "adminOverHead",
      label: "Admin Over Head",
      accessor: "adminOverHead",
      type: "text",
      align: "right",
    },
    {
      key: "commissionPercentage",
      label: "Commission %",
      accessor: "commissionPercentage",
      type: "text",
      align: "right",
    },
    {
      key: "costOfEnergyPerHour",
      label: "Cost of Energy/Hour",
      accessor: "costOfEnergyPerHour",
      type: "text",
      align: "right",
    },
    {
      key: "insuranceRate",
      label: "Insurance Rate",
      accessor: "insuranceRate",
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

  const searchFields = ["docId", "costDescription"];

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
      title="Cost Rate Master"
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
      emptyMessage="No Cost Rate Master records found"
      loadingMessage="Loading Cost Rate Master records..."
      enableRefresh={true}
      onRefresh={loadData}
      enableExport={true}
      exportFileName="Cost_Rate_Master"
    />
  );
};

export default CostRateMasterList;

import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";

const LCPurchaseOrderShortCloseList = ({ onAddNew, onEdit, onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    // Dummy Data
    const dummyData = [
      {
        id: 1,
        shortCloseNo: "LCSC001",
        customerName: "ABC Appliances",
        saNo: "SA001",
        date: "17/11/2026",
        referenceForShortClose: "Customer request",
        active: true,
      },
      {
        id: 2,
        shortCloseNo: "LCSC002",
        customerName: "Bosch Ltd",
        saNo: "SA002",
        date: "17/11/2026",
        referenceForShortClose: "Order cancelled",
        active: true,
      },
      {
        id: 3,
        shortCloseNo: "LCSC003",
        customerName: "XYZ Industries",
        saNo: "SA003",
        date: "14/11/2026",
        referenceForShortClose: "Excess quantity",
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
      key: "shortCloseNo",
      label: "Short Close No",
      accessor: "shortCloseNo",
      type: "text",
      noWrap: true,
    },
    {
      key: "customerName",
      label: "Customer Name",
      accessor: "customerName",
      type: "text",
    },
    { key: "saNo", label: "S.A.NO.", accessor: "saNo", type: "text" },
    {
      key: "date",
      label: "Date",
      accessor: "date",
      type: "text",
      noWrap: true,
    },
    {
      key: "referenceForShortClose",
      label: "Reference for Short Close",
      accessor: "referenceForShortClose",
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
    "shortCloseNo",
    "customerName",
    "saNo",
    "referenceForShortClose",
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
      title="LC Purchase Order Short Close"
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
      emptyMessage="No LC Purchase Order Short Close records found"
      loadingMessage="Loading LC Purchase Order Short Close records..."
      enableRefresh={true}
      onRefresh={loadData}
      enableExport={true}
      exportFileName="LC_Purchase_Order_Short_Close"
    />
  );
};

export default LCPurchaseOrderShortCloseList;

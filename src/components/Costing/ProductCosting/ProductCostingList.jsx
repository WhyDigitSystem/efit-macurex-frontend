import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";

const ProductCostingList = ({ onAddNew, onEdit, onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    // Dummy Data
    const dummyData = [
      {
        id: 1,
        prodCostNo: "PC001",
        fgItemId: "FG001",
        costRateMasterId: "CRM-000001",
        date: "18/11/2026",
        productionCost: "8450.00",
        grossSellingPrice: "10890.00",
        status: "Pending",
      },
      {
        id: 2,
        prodCostNo: "PC002",
        fgItemId: "FG002",
        costRateMasterId: "CRM-000001",
        date: "18/11/2026",
        productionCost: "5120.00",
        grossSellingPrice: "6740.00",
        status: "Approved",
      },
      {
        id: 3,
        prodCostNo: "PC003",
        fgItemId: "FG003",
        costRateMasterId: "CRM-000002",
        date: "10/11/2026",
        productionCost: "3980.00",
        grossSellingPrice: "5010.00",
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
      key: "prodCostNo",
      label: "Prod. Cost No",
      accessor: "prodCostNo",
      type: "text",
      noWrap: true,
    },
    {
      key: "fgItemId",
      label: "FG Item Id",
      accessor: "fgItemId",
      type: "text",
    },
    {
      key: "costRateMasterId",
      label: "Cost Rate Master Id",
      accessor: "costRateMasterId",
      type: "text",
      noWrap: true,
    },
    {
      key: "date",
      label: "Date",
      accessor: "date",
      type: "text",
      noWrap: true,
    },
    {
      key: "productionCost",
      label: "Production Cost",
      accessor: "productionCost",
      type: "text",
      align: "right",
    },
    {
      key: "grossSellingPrice",
      label: "Gross Selling Price",
      accessor: "grossSellingPrice",
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

  const searchFields = ["prodCostNo", "fgItemId", "costRateMasterId"];

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
      title="Product Costing/Pricing"
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
      emptyMessage="No Product Costing records found"
      loadingMessage="Loading Product Costing records..."
      enableRefresh={true}
      onRefresh={loadData}
      enableExport={true}
      exportFileName="Product_Costing"
    />
  );
};

export default ProductCostingList;

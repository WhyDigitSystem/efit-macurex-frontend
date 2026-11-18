import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";

const LCMaterialReturnList = ({ onAddNew, onEdit, onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    // Dummy Data
    const dummyData = [
      {
        id: 1,
        docNo: "LCMR001",
        plantId: "Plant 001",
        customerName: "ABC Appliances",
        invoiceNo: "LCINV001",
        returnType: "Rejection",
        netAmount: "5900.00",
        date: "17/11/2026",
        active: true,
      },
      {
        id: 2,
        docNo: "LCMR002",
        plantId: "Plant 002",
        customerName: "Bosch Ltd",
        invoiceNo: "LCINV002",
        returnType: "Excess Supply",
        netAmount: "12980.00",
        date: "17/11/2026",
        active: true,
      },
      {
        id: 3,
        docNo: "LCMR003",
        plantId: "Plant 001",
        customerName: "XYZ Industries",
        invoiceNo: "LCINV003",
        returnType: "Rejection",
        netAmount: "2360.00",
        date: "13/11/2026",
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
      label: "Doc. No",
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
      key: "invoiceNo",
      label: "Invoice No",
      accessor: "invoiceNo",
      type: "text",
    },
    {
      key: "returnType",
      label: "Return Type",
      accessor: "returnType",
      type: "text",
    },
    {
      key: "netAmount",
      label: "Net Amount",
      accessor: "netAmount",
      type: "text",
      align: "right",
    },
    {
      key: "date",
      label: "Date",
      accessor: "date",
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
    "invoiceNo",
    "returnType",
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
      title="LC Material Return"
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
      emptyMessage="No LC Material Return records found"
      loadingMessage="Loading LC Material Return records..."
      enableRefresh={true}
      onRefresh={loadData}
      enableExport={true}
      exportFileName="LC_Material_Return"
    />
  );
};

export default LCMaterialReturnList;

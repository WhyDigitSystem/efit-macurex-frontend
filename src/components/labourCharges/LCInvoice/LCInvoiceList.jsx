import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";

const LCInvoiceList = ({ onAddNew, onEdit, onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    // Dummy Data
    const dummyData = [
      {
        id: 1,
        invoiceNo: "LCINV001",
        plantId: "Plant 001",
        department: "Sales",
        customerName: "ABC Appliances",
        lcPoNo: "LC001",
        invoiceDate: "16/11/2026",
        totalAmount: "59000.00",
        active: true,
      },
      {
        id: 2,
        invoiceNo: "LCINV002",
        plantId: "Plant 002",
        department: "Dispatch",
        customerName: "Bosch Ltd",
        lcPoNo: "LC002",
        invoiceDate: "16/11/2026",
        totalAmount: "84960.00",
        active: true,
      },
      {
        id: 3,
        invoiceNo: "LCINV003",
        plantId: "Plant 001",
        department: "Sales",
        customerName: "XYZ Industries",
        lcPoNo: "LC003",
        invoiceDate: "15/11/2026",
        totalAmount: "21240.00",
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
      key: "invoiceNo",
      label: "LC Invoice No",
      accessor: "invoiceNo",
      type: "text",
      noWrap: true,
    },
    { key: "plantId", label: "Plant ID", accessor: "plantId", type: "text" },
    {
      key: "department",
      label: "Department",
      accessor: "department",
      type: "text",
    },
    {
      key: "customerName",
      label: "Customer Name",
      accessor: "customerName",
      type: "text",
    },
    { key: "lcPoNo", label: "LC PO No", accessor: "lcPoNo", type: "text" },
    {
      key: "invoiceDate",
      label: "Invoice Date",
      accessor: "invoiceDate",
      type: "text",
      noWrap: true,
    },
    {
      key: "totalAmount",
      label: "Total Amount",
      accessor: "totalAmount",
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

  const searchFields = [
    "invoiceNo",
    "plantId",
    "department",
    "customerName",
    "lcPoNo",
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
      title="LC Invoice - Tax Invoice"
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
      emptyMessage="No LC Invoice records found"
      loadingMessage="Loading LC Invoice records..."
      enableRefresh={true}
      onRefresh={loadData}
      enableExport={true}
      exportFileName="LC_Invoice"
    />
  );
};

export default LCInvoiceList;

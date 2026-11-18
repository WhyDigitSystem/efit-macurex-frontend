import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";

const LCPurchaseOrderList = ({ onAddNew, onEdit, onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    // Dummy Data
    const dummyData = [
      {
        id: 1,
        workNumber: "LC001",
        plantId: "Plant 001",
        department: "Production",
        customerName: "ABC Appliances",
        partName: "Housing Cover",
        serviceName: "Powder Coating",
        outgoingQty: "500.00",
        totalAmount: "59000.00",
        workDate: "16/11/2026",
        status: "Pending",
      },
      {
        id: 2,
        workNumber: "LC002",
        plantId: "Plant 002",
        department: "Purchase",
        customerName: "Bosch Ltd",
        partName: "Bracket Assembly",
        serviceName: "Zinc Plating",
        outgoingQty: "1200.00",
        totalAmount: "84960.00",
        workDate: "16/11/2026",
        status: "Approved",
      },
      {
        id: 3,
        workNumber: "LC003",
        plantId: "Plant 001",
        department: "Production",
        customerName: "XYZ Industries",
        partName: "Base Plate",
        serviceName: "Heat Treatment",
        outgoingQty: "300.00",
        totalAmount: "21240.00",
        workDate: "15/11/2026",
        status: "Rejected",
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
      key: "workNumber",
      label: "Work Number",
      accessor: "workNumber",
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
    { key: "partName", label: "Part Name", accessor: "partName", type: "text" },
    {
      key: "serviceName",
      label: "Service Name",
      accessor: "serviceName",
      type: "text",
    },
    {
      key: "outgoingQty",
      label: "Outgoing Qty",
      accessor: "outgoingQty",
      type: "text",
      align: "right",
    },
    {
      key: "totalAmount",
      label: "Total Amount",
      accessor: "totalAmount",
      type: "text",
      align: "right",
    },
    {
      key: "workDate",
      label: "Work Date",
      accessor: "workDate",
      type: "text",
      noWrap: true,
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
        Rejected: {
          label: "Rejected",
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
    "workNumber",
    "plantId",
    "department",
    "customerName",
    "partName",
    "serviceName",
  ];

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
    {
      value: "rejected",
      label: "Rejected",
      field: "status",
      filterValue: "rejected",
      activeValue: "Rejected",
    },
  ];

  return (
    <CommonListViewTable
      title="LC Purchase Order"
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
      emptyMessage="No LC Purchase Order records found"
      loadingMessage="Loading LC Purchase Order records..."
      enableRefresh={true}
      onRefresh={loadData}
      enableExport={true}
      exportFileName="LC_Purchase_Order"
    />
  );
};

export default LCPurchaseOrderList;

import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";

const MaterialReceiptsLCList = ({ onAddNew, onEdit, onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    // Dummy Data
    const dummyData = [
      {
        id: 1,
        lcGrnNo: "LCGRN001",
        plantId: "Plant 001",
        department: "Stores",
        customerName: "ABC Appliances",
        gatePassNo: "GP001",
        challanNo: "CH-1001",
        lcGrnDate: "16/11/2026",
        active: true,
      },
      {
        id: 2,
        lcGrnNo: "LCGRN002",
        plantId: "Plant 002",
        department: "Production",
        customerName: "Bosch Ltd",
        gatePassNo: "GP002",
        challanNo: "CH-1002",
        lcGrnDate: "16/11/2026",
        active: true,
      },
      {
        id: 3,
        lcGrnNo: "LCGRN003",
        plantId: "Plant 001",
        department: "Stores",
        customerName: "XYZ Industries",
        gatePassNo: "GP003",
        challanNo: "CH-1003",
        lcGrnDate: "15/11/2026",
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
      key: "lcGrnNo",
      label: "LC GRN No",
      accessor: "lcGrnNo",
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
    {
      key: "gatePassNo",
      label: "Gate Pass No",
      accessor: "gatePassNo",
      type: "text",
    },
    {
      key: "challanNo",
      label: "Challan No",
      accessor: "challanNo",
      type: "text",
    },
    {
      key: "lcGrnDate",
      label: "LC GRN Date",
      accessor: "lcGrnDate",
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
    "lcGrnNo",
    "plantId",
    "department",
    "customerName",
    "gatePassNo",
    "challanNo",
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
      title="Material Receipts - LC"
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
      emptyMessage="No Material Receipts - LC records found"
      loadingMessage="Loading Material Receipts - LC records..."
      enableRefresh={true}
      onRefresh={loadData}
      enableExport={true}
      exportFileName="Material_Receipts_LC"
    />
  );
};

export default MaterialReceiptsLCList;

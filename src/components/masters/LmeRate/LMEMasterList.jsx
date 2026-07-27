import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";

const LMEMasterList = ({ onAddNew, onEdit, onBack }) => {
  const [lmeData, setLmeData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadLME = async () => {
    setLoading(true);

    // Dummy Data - Matching the image format
    const data = [
      {
        id: 1,
        currencySymbol: "USD",
        currencyName: "US Dollar",
        lmeRate: "10.15",
        lmeDateFrom: "01/08/2025",
        lmeDateTo: "31/08/2025",
        active: true,
      },
      {
        id: 2,
        currencySymbol: "EUR",
        currencyName: "Euro",
        lmeRate: "12.50",
        lmeDateFrom: "01/08/2025",
        lmeDateTo: "31/08/2025",
        active: true,
      },
      {
        id: 3,
        currencySymbol: "GBP",
        currencyName: "British Pound",
        lmeRate: "15.75",
        lmeDateFrom: "01/08/2025",
        lmeDateTo: "31/08/2025",
        active: true,
      },
      {
        id: 4,
        currencySymbol: "INR",
        currencyName: "Indian Rupee",
        lmeRate: "0.12",
        lmeDateFrom: "01/08/2025",
        lmeDateTo: "31/08/2025",
        active: false,
      },
      {
        id: 5,
        currencySymbol: "JPY",
        currencyName: "Japanese Yen",
        lmeRate: "0.068",
        lmeDateFrom: "01/08/2025",
        lmeDateTo: "31/08/2025",
        active: true,
      },
    ];

    data.sort((a, b) => b.id - a.id);
    setLmeData(data);
    setLoading(false);
  };

  useEffect(() => {
    loadLME();
  }, []);

  const handleEdit = (lme) => {
    onEdit(lme);
  };

  const columns = [
    {
      key: "currencySymbol",
      label: "Currency Symbol",
      accessor: "currencySymbol",
      type: "text",
      noWrap: true,
    },
    {
      key: "currencyName",
      label: "Currency Name",
      accessor: "currencyName",
      type: "text",
    },
    {
      key: "lmeRate",
      label: "LME Rate",
      accessor: "lmeRate",
      type: "text",
      align: "right",
    },
    {
      key: "lmeDateFrom",
      label: "LME Date From",
      accessor: "lmeDateFrom",
      type: "text",
    },
    {
      key: "lmeDateTo",
      label: "LME Date To",
      accessor: "lmeDateTo",
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
    "currencySymbol",
    "currencyName",
    "lmeRate",
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
      title="LME"
      data={lmeData}
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
      emptyMessage="No LME records found"
      loadingMessage="Loading LME records..."
      enableRefresh={true}
      onRefresh={loadLME}
      enableExport={true}
      exportFileName="LME_Master"
    />
  );
};

export default LMEMasterList;
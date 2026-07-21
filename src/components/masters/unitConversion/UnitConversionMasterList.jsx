import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";

const UnitConversionMasterList = ({ onAddNew, onEdit,onBack }) => {
  const [conversionData, setConversionData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadConversions = async () => {
    setLoading(true);

    // Dummy Data
    const data = [
      {
        id: 8,
        conversionCode: "UC008",
        fromUnit: "Kg",
        toUnit: "Gram",
        conversionFactor: 1000,
        active: true,
      },
      {
        id: 7,
        conversionCode: "UC007",
        fromUnit: "Liter",
        toUnit: "Milliliter",
        conversionFactor: 1000,
        active: true,
      },
      {
        id: 6,
        conversionCode: "UC006",
        fromUnit: "Meter",
        toUnit: "Centimeter",
        conversionFactor: 100,
        active: true,
      },
      {
        id: 5,
        conversionCode: "UC005",
        fromUnit: "Box",
        toUnit: "Nos",
        conversionFactor: 12,
        active: true,
      },
      {
        id: 4,
        conversionCode: "UC004",
        fromUnit: "Dozen",
        toUnit: "Nos",
        conversionFactor: 12,
        active: false,
      },
      {
        id: 3,
        conversionCode: "UC003",
        fromUnit: "Ton",
        toUnit: "Kg",
        conversionFactor: 1000,
        active: true,
      },
      {
        id: 2,
        conversionCode: "UC002",
        fromUnit: "Feet",
        toUnit: "Inch",
        conversionFactor: 12,
        active: true,
      },
      {
        id: 1,
        conversionCode: "UC001",
        fromUnit: "Hour",
        toUnit: "Minute",
        conversionFactor: 60,
        active: false,
      },
    ];

    data.sort((a, b) => b.id - a.id);

    setConversionData(data);
    setLoading(false);
  };

  useEffect(() => {
    loadConversions();
  }, []);

  const handleEdit = (conversion) => {
    onEdit(conversion);
  };

  const columns = [
    {
      key: "conversionCode",
      label: "Conversion Code",
      accessor: "conversionCode",
      type: "text",
      noWrap: true,
    },
    {
      key: "fromUnit",
      label: "From Unit",
      accessor: "fromUnit",
      type: "text",
    },
    {
      key: "toUnit",
      label: "To Unit",
      accessor: "toUnit",
      type: "text",
    },
    {
      key: "conversionFactor",
      label: "Factor",
      accessor: "conversionFactor",
      type: "text",
      align: "center",
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
    "conversionCode",
    "fromUnit",
    "toUnit",
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
      title="Unit Conversion Master"
      subtitle="Manage Unit Conversions"
      data={conversionData}
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
      emptyMessage="No Unit Conversions found"
      loadingMessage="Loading Unit Conversions..."
      enableRefresh={true}
      onRefresh={loadConversions}
      enableExport={true}
      exportFileName="UnitConversions"
    />
  );
};

export default UnitConversionMasterList;
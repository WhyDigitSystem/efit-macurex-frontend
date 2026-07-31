import React, { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import unitConversionAPI from "../../../api/unitConversionAPI";

const UnitConversionMasterList = ({ onAddNew, onEdit, onBack }) => {
  const [conversionData, setConversionData] = useState([]);
  const [loading, setLoading] = useState(false);

  const branchId = localStorage.getItem("branchId");
  const orgId = localStorage.getItem("orgId");

  const loadConversions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await unitConversionAPI.getUnitConversion(branchId, orgId);
      setConversionData(data);
    } catch (error) {
      console.error("Failed to load HSN/SAC data:", error);
      setConversionData([]);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    loadConversions();
  }, []);

  const handleEdit = (conversion) => {
    onEdit(conversion);
  };

  const columns = [
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
      key: "multiplicationFactor",
      label: "Factor",
      accessor: "multiplicationFactor",
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
      title="Unit Conversion"
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
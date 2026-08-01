import React, { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import unitConversionAPI from "../../../api/unitConversionAPI";

const UnitConversionMasterList = ({ onAddNew, onEdit, onBack }) => {
  const [displayData, setDisplayData] = useState([]);
  const [originalDataMap, setOriginalDataMap] = useState({});
  const [loading, setLoading] = useState(false);

  const branchId = localStorage.getItem("branchId");
  const orgId = localStorage.getItem("orgId");

  const loadConversions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await unitConversionAPI.getUnitConversion(branchId, orgId);
      console.log("Loaded conversion data:", data);

      // Store original data in a map for easy retrieval
      const dataMap = {};
      if (Array.isArray(data)) {
        data.forEach(item => {
          dataMap[item.id] = item;
        });
      }
      setOriginalDataMap(dataMap);

      // Transform for display
      const transformedData = Array.isArray(data) ? data.map((item) => ({
        ...item,
        fromUnitDisplay: item.fromUnit?.unitId || item.fromUnit || "",
        toUnitDisplay: item.toUnit?.unitId || item.toUnit || "",
        branchName: item.branch?.branchName || "",
      })) : [];

      setDisplayData(transformedData);
    } catch (error) {
      console.error("Failed to load Unit Conversions:", error);
      setDisplayData([]);
      setOriginalDataMap({});
    } finally {
      setLoading(false);
    }
  }, [branchId, orgId]);

  useEffect(() => {
    loadConversions();
  }, [loadConversions]);

  const handleEdit = (conversion) => {
    console.log("=== DEBUGGING EDIT ===");
    console.log("Conversion object:", conversion);
    console.log("Conversion ID:", conversion?.id);
    console.log("=====================");

    // Get the original data from the map
    const originalData = originalDataMap[conversion?.id];

    if (originalData) {
      console.log("Found original data with nested objects:", originalData);
      // Pass the original data with nested objects
      onEdit(originalData);
    } else {
      console.warn("Original data not found for ID:", conversion?.id);
      // Pass what we have
      onEdit(conversion);
    }
  };

  const columns = [
    {
      key: "fromUnitDisplay",
      label: "From Unit",
      accessor: "fromUnitDisplay",
      type: "text",
    },
    {
      key: "toUnitDisplay",
      label: "To Unit",
      accessor: "toUnitDisplay",
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
      key: "actions",
      label: "Actions",
      type: "actions",
      align: "center",
      width: "90px",
    },
  ];

  const searchFields = [
    "fromUnitDisplay",
    "toUnitDisplay",
    "branchName",
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
      filterValue: true,
    },
    {
      value: "inactive",
      label: "Inactive",
      field: "active",
      filterValue: false,
    },
  ];

  return (
    <CommonListViewTable
      title="Unit Conversion"
      subtitle="Manage Unit Conversions"
      data={displayData}
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
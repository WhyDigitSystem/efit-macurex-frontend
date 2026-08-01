import React, { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import itemAPI from "../../../api/itemAPI";

const ItemMasterList = ({ onAddNew, onEdit, onBack }) => {
  const [itemData, setItemData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orgId] = useState(localStorage.getItem("orgId") || "");
  const [branch] = useState(localStorage.getItem("branchId") || "");

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await itemAPI.getItems(orgId, branch);
      console.log("API Response:", response);

      // Store original data
      setOriginalData(response);

      // Transform data for display
      const transformedData = transformItemData(response);
      console.log("Transformed Data:", transformedData);

      setItemData(transformedData);
    } catch (error) {
      console.error("Failed to load items:", error);
      setItemData([]);
      setOriginalData([]);
    } finally {
      setLoading(false);
    }
  }, [orgId, branch]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const transformItemData = (data) => {
    if (!Array.isArray(data)) return [];

    return data.map((item) => ({
      ...item, // Keep all original data
      // Flatten nested objects for display
      itemType: item.itemTypes?.valueDescription || item.itemType || "",
      itemGroup: item.itemGroups?.valueDescription || "",
      materialGroup: item.itemGroups?.valueDescription || "",
      materialSubGroup: item.capitalOrInputs?.valueDescription || "",
      grade: item.listOfGrades?.gradeDescription || "",
      itemCode: item.itemCode || "",
      itemDescription: item.itemDescription || "",
      // capitalOrInputs: item.capitalOrInputs?.valueDescription || "",
      primaryUnit: item.primaryUnits?.primaryUnit || "",
      hsnCode: item.itemHsn?.hsnCode || "",
      importLocal: item.importOrLocal || "",
      minimumOrderQuantity: item.minimumOrderQty || 0,
      stockLocation: item.defaultLocationId || "",
      reorderLevel: item.reorderLevel || "0",
      needQCApproval: item.needQcApproval || "",
      inspection: item.inspections?.valueDescription || "",
      // Keep nested objects for editing
      itemTypes: item.itemTypes,
      itemGroups: item.itemGroups,
      primaryUnits: item.primaryUnits,
      itemHsn: item.itemHsn,
      inspections: item.inspections,
      listOfGrades: item.listOfGrades,
      capitalOrInputs: item.capitalOrInputs,
      exciseTariffNos: item.exciseTariffNos,
      purchaseUnit: item.purchaseUnit,
      sellingUnit: item.sellingUnit,
      pricingUnit: item.pricingUnit,
      secondaryUnit: item.secondaryUnit,
    }));
  };

  const handleEdit = (item) => {
    console.log("Edit clicked with item:", item);

    // Find the original data from the stored originalData array
    const originalItem = originalData.find(orig => orig.id === item.id);

    if (originalItem) {
      console.log("Original data found:", originalItem);
      onEdit(originalItem);
    } else {
      console.warn("Original data not found, using transformed data");
      onEdit(item);
    }
  };

  const columns = [
    {
      key: "materialGroup",
      label: "Item Group",
      accessor: "materialGroup",
      type: "text",
    },
    {
      key: "materialSubGroup",
      label: "Capital/Inputs",
      accessor: "materialSubGroup",
      type: "text",
    },
    {
      key: "itemType",
      label: "Item Type",
      accessor: "itemType",
      type: "text",
    },
    {
      key: "grade",
      label: "Grade",
      accessor: "grade",
      type: "text",
      noWrap: true,
    },
    {
      key: "itemCode",
      label: "Item Code",
      accessor: "itemCode",
      type: "text",
      noWrap: true,
    },

    {
      key: "itemDescription",
      label: "Item Name",
      accessor: "itemDescription",
      type: "text",
    },


    {
      key: "primaryUnit",
      label: "Primary Unit",
      accessor: "primaryUnit",
      type: "text",
    },
    {
      key: "hsnCode",
      label: "HSN Code",
      accessor: "hsnCode",
      type: "text",
    },
    {
      key: "importLocal",
      label: "Import/Local",
      accessor: "importLocal",
      type: "text",
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
    "itemCode",
    "itemType",
    "itemDescription",
    "materialGroup",
    "primaryUnit",
    "hsnCode",
    "stockLocation",
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
      title="Item"
      data={itemData}
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
      emptyMessage="No Items found"
      loadingMessage="Loading Items..."
      enableRefresh={true}
      onRefresh={loadItems}
      enableExport={true}
      exportFileName="Items"
    />
  );
};

export default ItemMasterList;
import React, { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import itemAPI from "../../../api/itemAPI";

const ItemMasterList = ({ onAddNew, onEdit,onBack }) => {
  const [itemData, setItemData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orgId] = useState(localStorage.getItem("orgId") || "");

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);

      const response = await itemAPI.getItems(orgId);

      setItemData(response);
    } catch (error) {
      console.error("Failed to load countries:", error);
      setItemData([]);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    loadItems();
  }, []);

  const handleEdit = (item) => {
    onEdit(item);
  };

  const columns = [
  {
    key: "itemCode",
    label: "Item Code",
    accessor: "itemCode",
    type: "text",
    noWrap: true,
  },
  {
    key: "itemType",
    label: "Item Type",
    accessor: "itemType",
    type: "text",
  },
  {
    key: "itemName",
    label: "Item Name",
    accessor: "itemName",
    type: "text",
  },
  {
    key: "materialGroup",
    label: "Material Group",
    accessor: "materialGroup",
    type: "text",
  },
  {
    key: "materialSubGroup",
    label: "Sub Group",
    accessor: "materialSubGroup",
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
    key: "minimumOrderQuantity",
    label: "Min Order Qty",
    accessor: "minimumOrderQuantity",
    type: "text",
  },
  {
    key: "stockLocation",
    label: "Stock Location",
    accessor: "stockLocation",
    type: "text",
  },
  {
    key: "reorderLevel",
    label: "Reorder Level",
    accessor: "reorderLevel",
    type: "text",
  },
  {
    key: "needQCApproval",
    label: "QC Approval",
    accessor: "needQCApproval",
    type: "text",
  },
  {
    key: "inspection",
    label: "Inspection",
    accessor: "inspection",
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
  "itemCode",
  "itemType",
  "itemName",
  "itemDescription",
  "materialType",
  "materialGroup",
  "materialSubGroup",
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
import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";

const GSTStateList = ({ onAddNew, onEdit,onBack }) => {
  const [itemData, setItemData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadItems = async () => {
    setLoading(true);

    // Dummy Data
    const data = [
  {
    id: 8,
    itemCode: "ITM008",
    itemType: "Finished Goods",
    itemName: "Wireless Mouse",
    itemDescription: "2.4GHz Wireless Optical Mouse",
    needQCApproval: "No",
    materialType: "Electronic",
    materialGroup: "Computer Accessories",
    materialSubGroup: "Mouse",
    inspection: "No",
    instrumentSeqCode: "INS008",
    primaryUnit: "Nos",
    hsnCode: "84716070",
    importLocal: "Local",
    minimumOrderQuantity: 20,
    stockLocation: "Main Warehouse",
    reorderLevel: 50,
    active: true,
  },
  {
    id: 7,
    itemCode: "ITM007",
    itemType: "Finished Goods",
    itemName: "Mechanical Keyboard",
    itemDescription: "RGB Mechanical Keyboard",
    needQCApproval: "Yes",
    materialType: "Electronic",
    materialGroup: "Computer Accessories",
    materialSubGroup: "Keyboard",
    inspection: "Yes",
    instrumentSeqCode: "INS007",
    primaryUnit: "Nos",
    hsnCode: "84716040",
    importLocal: "Import",
    minimumOrderQuantity: 10,
    stockLocation: "Warehouse A",
    reorderLevel: 25,
    active: true,
  },
  {
    id: 6,
    itemCode: "ITM006",
    itemType: "Raw Material",
    itemName: "Steel Sheet",
    itemDescription: "MS Steel Sheet 2mm",
    needQCApproval: "Yes",
    materialType: "Metal",
    materialGroup: "Steel",
    materialSubGroup: "MS Sheet",
    inspection: "Yes",
    instrumentSeqCode: "INS006",
    primaryUnit: "Kg",
    hsnCode: "72083990",
    importLocal: "Local",
    minimumOrderQuantity: 500,
    stockLocation: "Raw Material Store",
    reorderLevel: 1000,
    active: true,
  },
  {
    id: 5,
    itemCode: "ITM005",
    itemType: "Consumable",
    itemName: "A4 Paper",
    itemDescription: "A4 Copier Paper",
    needQCApproval: "No",
    materialType: "Paper",
    materialGroup: "Stationery",
    materialSubGroup: "Paper",
    inspection: "No",
    instrumentSeqCode: "INS005",
    primaryUnit: "Pack",
    hsnCode: "48025690",
    importLocal: "Local",
    minimumOrderQuantity: 50,
    stockLocation: "Stationery Store",
    reorderLevel: 100,
    active: false,
  },
  {
    id: 4,
    itemCode: "ITM004",
    itemType: "Finished Goods",
    itemName: "Office Chair",
    itemDescription: "High Back Office Chair",
    needQCApproval: "No",
    materialType: "Furniture",
    materialGroup: "Office",
    materialSubGroup: "Chair",
    inspection: "No",
    instrumentSeqCode: "INS004",
    primaryUnit: "Nos",
    hsnCode: "94013000",
    importLocal: "Import",
    minimumOrderQuantity: 5,
    stockLocation: "Finished Goods Store",
    reorderLevel: 10,
    active: true,
  },
  {
    id: 3,
    itemCode: "ITM003",
    itemType: "Raw Material",
    itemName: "Copper Wire",
    itemDescription: "Copper Wire 2.5mm",
    needQCApproval: "Yes",
    materialType: "Metal",
    materialGroup: "Copper",
    materialSubGroup: "Wire",
    inspection: "Yes",
    instrumentSeqCode: "INS003",
    primaryUnit: "Meter",
    hsnCode: "74081900",
    importLocal: "Import",
    minimumOrderQuantity: 100,
    stockLocation: "Raw Material Store",
    reorderLevel: 500,
    active: true,
  },
  {
    id: 2,
    itemCode: "ITM002",
    itemType: "Finished Goods",
    itemName: "LED Monitor",
    itemDescription: "24 Inch Full HD Monitor",
    needQCApproval: "No",
    materialType: "Electronic",
    materialGroup: "Displays",
    materialSubGroup: "Monitor",
    inspection: "No",
    instrumentSeqCode: "INS002",
    primaryUnit: "Nos",
    hsnCode: "85285200",
    importLocal: "Import",
    minimumOrderQuantity: 5,
    stockLocation: "Warehouse B",
    reorderLevel: 15,
    active: false,
  },
  {
    id: 1,
    itemCode: "ITM001",
    itemType: "Finished Goods",
    itemName: "Laptop",
    itemDescription: "Core i7 Business Laptop",
    needQCApproval: "No",
    materialType: "Electronic",
    materialGroup: "Computers",
    materialSubGroup: "Laptop",
    inspection: "No",
    instrumentSeqCode: "INS001",
    primaryUnit: "Nos",
    hsnCode: "84713010",
    importLocal: "Import",
    minimumOrderQuantity: 2,
    stockLocation: "Main Warehouse",
    reorderLevel: 8,
    active: true,
  },
];

    data.sort((a, b) => b.id - a.id);

    setItemData(data);
    setLoading(false);
  };

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
      title="GST State List"
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
      exportFileName="GST State List"
    />
  );
};

export default GSTStateList;
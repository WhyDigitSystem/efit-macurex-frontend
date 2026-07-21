import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";

const ItemMasterList = ({ onAddNew, onEdit }) => {
  const [itemData, setItemData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadItems = async () => {
    setLoading(true);

    // Dummy Data
    const data = [
      {
        id: 8,
        itemCode: "ITM008",
        itemName: "Wireless Mouse",
        category: "Electronics",
        uom: "Nos",
        price: 799,
        stock: 120,
        active: true,
      },
      {
        id: 7,
        itemCode: "ITM007",
        itemName: "Mechanical Keyboard",
        category: "Electronics",
        uom: "Nos",
        price: 2499,
        stock: 45,
        active: true,
      },
      {
        id: 6,
        itemCode: "ITM006",
        itemName: "Office Chair",
        category: "Furniture",
        uom: "Nos",
        price: 5999,
        stock: 20,
        active: true,
      },
      {
        id: 5,
        itemCode: "ITM005",
        itemName: "Writing Notebook",
        category: "Stationery",
        uom: "Nos",
        price: 120,
        stock: 500,
        active: false,
      },
      {
        id: 4,
        itemCode: "ITM004",
        itemName: "A4 Paper Bundle",
        category: "Stationery",
        uom: "Pack",
        price: 350,
        stock: 180,
        active: true,
      },
      {
        id: 3,
        itemCode: "ITM003",
        itemName: "USB Cable",
        category: "Accessories",
        uom: "Nos",
        price: 250,
        stock: 300,
        active: true,
      },
      {
        id: 2,
        itemCode: "ITM002",
        itemName: "LED Monitor",
        category: "Electronics",
        uom: "Nos",
        price: 11999,
        stock: 15,
        active: false,
      },
      {
        id: 1,
        itemCode: "ITM001",
        itemName: "Laptop",
        category: "Electronics",
        uom: "Nos",
        price: 58999,
        stock: 12,
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
      key: "itemName",
      label: "Item Name",
      accessor: "itemName",
      type: "text",
    },
    {
      key: "category",
      label: "Category",
      accessor: "category",
      type: "text",
    },
    {
      key: "uom",
      label: "UOM",
      accessor: "uom",
      type: "text",
    },
    {
      key: "price",
      label: "Price",
      accessor: "price",
      type: "text",
    },
    {
      key: "stock",
      label: "Stock",
      accessor: "stock",
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
    "itemName",
    "category",
    "uom",
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
      title="Item Master"
      subtitle="Manage Items"
      data={itemData}
      loading={loading}
      columns={columns}
      searchFields={searchFields}
      filterOptions={filterOptions}
      defaultFilter="all"
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
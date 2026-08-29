import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import gstStateApi from "../../../api/gstStateApi";
const GSTStateList = ({ onAddNew, onEdit, onBack }) => {
  const [itemData, setItemData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orgId] = useState(localStorage.getItem("orgId"));
  const branch = localStorage.getItem("branchId");


  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await gstStateApi.getGstStateList(orgId);
      setItemData(data);

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleEdit = (item) => {
    onEdit(item);
  };

  const columns = [
    {
      key: "statecode",
      label: "State Code",
      accessor: "stateCode",
      type: "text",
      noWrap: true,
    },
    {
      key: "stateName",
      label: "State Name",
      accessor: "stateName",
      type: "text",
    },
    {
      key: "gststateid",
      label: "GST State ID",
      accessor: "gstStateId",
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
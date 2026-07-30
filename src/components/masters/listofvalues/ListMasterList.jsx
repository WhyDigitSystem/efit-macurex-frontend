import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import listformApi from "../../../api/listformApi";

const ListMasterList = ({ onAddNew, onEdit,onBack }) => {
  const [itemData, setItemData] = useState([]);
  const [editId, setEditId] = useState(null);
  const [mode, setMode] = useState("list");
  const [loading, setLoading] = useState(false);
    const [orgId] = useState(localStorage.getItem("orgId"));
    const [branch] = useState(localStorage.getItem("branch"));



  const loadItems = async () => {
    try{
    setLoading(true);
    const data = await listformApi.getList(Number(branch),orgId);
    setItemData(data);

    }catch(error){
       console.log(error);
    }finally{
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleEdit = (row) => {
    onEdit(row);
  };

const columns = [
  {
    key: "listCode",
    label: "List Code",
    accessor: "listCode",
    type: "text",
    noWrap: true,
  },
  {
    key: "listDescription",
    label: "List Desc",
    accessor: "listDescription",
    type: "text",
  },
  {
    key: "branchName",
    label: "Branch",
    accessor: "branch.branchName",
    type: "text",
  },
 
  {
    key: "active",
    label: "Status",
    accessor: "active",
    type: "status",
    statusVariants: {
      Active: {
        label: "Active",
        className:
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      },
      Inactive: {
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
  "listCode",
  "listDescription",
  "branchName",
  "createdBy",
  "active",
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
      title="List Of Values"
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
      exportFileName="List Of Values"
    />
  );
};

export default ListMasterList;
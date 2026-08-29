import React, { useCallback, useEffect, useState } from "react";
import itemGradeAPI from "../../../api/itemGradeAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const ItemGradeMasterList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const ORG_ID = parseInt(localStorage.getItem("orgId"));
  const BRANCH = Number(localStorage.getItem("branchId"));

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const list = await itemGradeAPI.getAll(ORG_ID);
      const sorted = (list || []).sort((a, b) => (b.id || 0) - (a.id || 0));
      setData(sorted);
    } catch (error) {
      console.error("Failed to load item grades:", error);
      setData([]);
      toast.error("Failed to fetch Item Grades");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshTrigger]);

  const columns = [
    {
      key: "gradeCode",
      label: "Grade Code",
      accessor: "gradeCode",
      type: "text",
      noWrap: true,
    },
    {
      key: "gradeDescription",
      label: "Grade Description",
      accessor: "gradeDescription",
      type: "text",
    },
    {
      key: "active",
      label: "Status",
      accessor: "active",
      type: "status",
    },
    {
      key: "actions",
      label: "Actions",
      type: "actions",
      align: "center",
      width: "90px",
    },
  ];

  const searchFields = ["gradeCode", "gradeDescription"];

  const filterOptions = [
    { value: "all", label: "All" },
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

  const handleEdit = (row) => {
    onEdit(row);
  };

  return (
    <CommonListViewTable
      title="Item Grade"
      data={data}
      loading={loading}
      columns={columns}
      searchFields={searchFields}
      filterOptions={filterOptions}
      defaultFilter="all"
      onBack={onBack}
      onAddNew={onAddNew}
      onEdit={handleEdit}
      onView={false}
      itemsPerPageOptions={[5, 10, 20, 50, 100]}
      defaultItemsPerPage={10}
      showSerialNumber={true}
      emptyMessage="No Item Grades found"
      loadingMessage="Loading Item Grades..."
      enableRefresh={true}
      onRefresh={loadData}
      enableExport={true}
      exportFileName="ItemGrades"
    />
  );
};

export default ItemGradeMasterList;

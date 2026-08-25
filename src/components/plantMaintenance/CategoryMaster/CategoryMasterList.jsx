import { useCallback, useEffect, useState } from "react";
import categoryMasterAPI from "../../../api/plantMaintenance/categoryMasterAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const CategoryMasterList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = parseInt(localStorage.getItem("orgId"));

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);

      const response = await categoryMasterAPI.getCategories(ORG_ID);

      const sortedCategories = (response || []).sort(
        (a, b) => (b.id || 0) - (a.id || 0),
      );

      setCategoryData(sortedCategories);
    } catch (error) {
      console.error("Failed to load categories:", error);
      setCategoryData([]);
      toast.error("Failed to fetch Categories");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories, refreshTrigger]);

  const handleEdit = (category) => {
    onEdit(category);
  };

  const columns = [
    {
      key: "applicableFor",
      label: "Applicable For",
      accessor: "applicableFor",
      type: "text",
      noWrap: true,
    },
    {
      key: "category",
      label: "Category",
      accessor: "category",
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

  const searchFields = ["applicableFor", "category"];

  return (
    <CommonListViewTable
      title="Category Master"
      subtitle="Plant Maintenance - Manage categories and history"
      data={categoryData}
      loading={loading}
      columns={columns}
      searchFields={searchFields}
      onBack={onBack}
      onAddNew={onAddNew}
      onEdit={handleEdit}
      onView={false}
      itemsPerPageOptions={[5, 10, 25, 50, 100]}
      defaultItemsPerPage={10}
      showSerialNumber={true}
      emptyMessage="No Categories found"
      loadingMessage="Loading Categories..."
      enableRefresh={true}
      onRefresh={loadCategories}
      enableExport={true}
      exportFileName="Categories"
    />
  );
};

export default CategoryMasterList;

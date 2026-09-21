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

  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;

  const loadCategories = useCallback(async () => {
    if (!ORG_ID) {
      setCategoryData([]);
      return;
    }

    try {
      setLoading(true);

      const response = await categoryMasterAPI.getByOrgId(ORG_ID);

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

  /* ---------------- Accessors ---------------- */

  const getApplicableForLabel = (row) =>
    row?.applicableFor?.description ||
    row?.applicableFor?.code ||
    (typeof row?.applicableFor === "string" ? row.applicableFor : "") ||
    "";

  /* ---------------- Columns ---------------- */

  const columns = [
    {
      key: "applicableFor",
      label: "Applicable For",
      accessor: (row) => getApplicableForLabel(row),
      type: "text",
      noWrap: true,
    },
    {
      key: "category",
      label: "Category",
      accessor: (row) => row?.category || "",
      type: "text",
    },
    {
      key: "active",
      label: "Status",
      accessor: (row) =>
        row?.active === true || row?.active === "Active"
          ? "Active"
          : "Inactive",
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

  const searchFields = ["applicableFor.description", "category"];

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
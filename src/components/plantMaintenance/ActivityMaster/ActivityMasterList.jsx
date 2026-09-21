import { useCallback, useEffect, useState } from "react";
import activityMasterAPI from "../../../api/plantMaintenance/activityMasterAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const ActivityMasterList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;

  const loadActivities = useCallback(async () => {
    if (!ORG_ID) {
      setActivityData([]);
      return;
    }

    try {
      setLoading(true);

      const response = await activityMasterAPI.getByOrgId(ORG_ID);

      const sortedActivities = (response || []).sort(
        (a, b) => (b.id || 0) - (a.id || 0),
      );

      setActivityData(sortedActivities);
    } catch (error) {
      console.error("Failed to load activities:", error);
      setActivityData([]);
      toast.error("Failed to fetch Activities");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities, refreshTrigger]);

  const handleEdit = (activity) => {
    onEdit(activity);
  };

  /* ---------------- Accessors ---------------- */

  const getDepartmentLabel = (row) =>
    row?.department?.departmentName ||
    row?.department?.departmentCode ||
    (typeof row?.department === "string" ? row.department : "") ||
    "";

  /* ---------------- Columns ---------------- */

  const columns = [
    {
      key: "department",
      label: "Department",
      accessor: (row) => getDepartmentLabel(row),
      type: "text",
      noWrap: true,
    },
    {
      key: "activity",
      label: "Activity",
      accessor: (row) => row?.activity || "",
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

  const searchFields = ["department.departmentName", "activity"];

  return (
    <CommonListViewTable
      title="Activity Master"
      subtitle="Plant Maintenance - Manage activities and history"
      data={activityData}
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
      emptyMessage="No Activities found"
      loadingMessage="Loading Activities..."
      enableRefresh={true}
      onRefresh={loadActivities}
      enableExport={true}
      exportFileName="Activities"
    />
  );
};

export default ActivityMasterList;
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

  const ORG_ID = parseInt(localStorage.getItem("orgId"));

  const loadActivities = useCallback(async () => {
    try {
      setLoading(true);

      const response = await activityMasterAPI.getActivities(ORG_ID);

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

  const columns = [
    {
      key: "department",
      label: "Department",
      accessor: "department",
      type: "text",
      noWrap: true,
    },
    {
      key: "activity",
      label: "Activity",
      accessor: "activity",
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

  const searchFields = ["department", "activity"];

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

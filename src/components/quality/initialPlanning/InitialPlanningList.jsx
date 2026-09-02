import { useCallback, useEffect, useState } from "react";
import initialPlanningAPI from "../../../api/quality/initialPlanningAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const InitialPlanningList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [planningData, setPlanningData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = parseInt(localStorage.getItem("orgId"));

  const loadPlannings = useCallback(async () => {
    try {
      setLoading(true);

      // Use the correct API endpoint
      const response = await initialPlanningAPI.getInitialPlannings(ORG_ID);

      console.log("Initial Planning List Response:", response);

      // The response should be an array of planning records
      const planningList = Array.isArray(response) ? response : [];

      // Sort by ID descending (newest first)
      const sortedPlannings = planningList.sort(
        (a, b) => (b.id || 0) - (a.id || 0),
      );

      setPlanningData(sortedPlannings);
    } catch (error) {
      console.error("Failed to load initial plannings:", error);
      setPlanningData([]);
      toast.error("Failed to fetch Initial Plannings");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadPlannings();
  }, [loadPlannings, refreshTrigger]);

  const handleEdit = (planning) => {
    onEdit(planning);
  };

  const columns = [
    {
      key: "docNo",
      label: "Doc No",
      accessor: "docId", // Use docId from API response
      type: "text",
      noWrap: true,
    },
    {
      key: "docDate",
      label: "Doc Date",
      accessor: "docDate",
      type: "text",
    },
    {
      key: "itemCode",
      label: "Item Code",
      accessor: (row) => row.item?.itemCode || row.itemCode || "",
      type: "text",
    },
    {
      key: "itemDesc",
      label: "Item Description",
      accessor: (row) => row.item?.itemDescription || row.itemDesc || "",
      type: "text",
    },
    {
      key: "itemGrade",
      label: "Item Grade",
      accessor: (row) => row.item_grade?.gradeDescription || row.itemGrade || "",
      type: "text",
    },
    {
      key: "source",
      label: "Source",
      accessor: (row) => row.source?.customerName || row.source || "",
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

  const searchFields = ["docId", "itemCode", "itemDesc", "itemGrade", "source"];

  return (
    <CommonListViewTable
      title="Initial Planning"
      subtitle="Quality - Plan initial inspections for items"
      data={planningData}
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
      emptyMessage="No Initial Plannings found"
      loadingMessage="Loading Initial Plannings..."
      enableRefresh={true}
      onRefresh={loadPlannings}
      enableExport={true}
      exportFileName="InitialPlannings"
    />
  );
};

export default InitialPlanningList;
import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import initialStageInspectionAPI from "../../../api/quality/initialStageInspectionAPI";
import { toast } from "../../../utils/toast";

const InitialStageInspectionList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data = await initialStageInspectionAPI.getInitialStageInspectionByOrgId(
        ORG_ID,
        BRANCH_ID,
      );
      data.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(data);
    } catch (error) {
      console.error("Failed to fetch initial stage inspections:", error);
      setRecords([]);
      toast.error("Failed to fetch Initial Stage Inspection Entries");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const columns = [
    {
      key: "inspectionNo",
      label: "Inspection No",
      accessor: (row) => row.inspectionNo,
      type: "text",
      noWrap: true,
    },
    {
      key: "plantId",
      label: "Plant",
      accessor: (row =>
        typeof row.plantId === "object"
          ? row.plantId.branchName || row.plantId.plantName || row.plantId.id
          : row.plantName || row.plantId),
      type: "text",
    },
    {
      key: "shift",
      label: "Shift",
      accessor: (row) => row.shift || "",
      type: "text",
    },
    {
      key: "date",
      label: "Date",
      accessor: (row) => row.date || "",
      type: "text",
    },
    {
      key: "workOrderNo",
      label: "Work Order No",
      accessor: (row) => row.workOrderNo || "",
      type: "text",
    },
    {
      key: "recommendedForProduction",
      label: "Recommended for Production",
      accessor: (row) => row.recommendedForProduction || "",
      type: "text",
    },
    {
      key: "actions",
      label: "Actions",
      type: "actions",
      align: "center",
      width: "120px",
    },
  ];

  const searchFields = [
    "inspectionNo",
    "plantId",
    "shift",
    "date",
    "workOrderNo",
    "recommendedForProduction",
  ];

  return (
    <CommonListViewTable
      title="Initial Stage Inspection"
      data={records}
      loading={loading}
      columns={columns}
      searchFields={searchFields}
      onBack={onBack}
      onAddNew={onAddNew}
      onEdit={onEdit}
      onView={false}
      showSerialNumber={true}
      itemsPerPageOptions={[5, 10, 20, 50, 100]}
      defaultItemsPerPage={10}
      emptyMessage="No Initial Stage Inspection Entries found"
      loadingMessage="Loading Initial Stage Inspection Entries..."
      enableRefresh={true}
      onRefresh={loadRecords}
    />
  );
};

export default InitialStageInspectionList;
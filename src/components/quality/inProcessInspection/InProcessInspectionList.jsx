import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import inProcessInspectionAPI from "../../../api/quality/inProcessInspectionAPI";
import { toast } from "../../../utils/toast";

const InProcessInspectionList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data = await inProcessInspectionAPI.getInProcessInspectionByOrgId(
        ORG_ID,
        BRANCH_ID,
      );
      data.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(data);
    } catch (error) {
      console.error("Failed to fetch in-process inspections:", error);
      setRecords([]);
      toast.error("Failed to fetch In-Process Inspection Entries");
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
      accessor: (row) =>
        typeof row.plantId === "object"
          ? row.plantId.branchName || row.plantId.plantName || row.plantId.id
          : row.plantName || row.plantId,
      type: "text",
    },
    {
      key: "department",
      label: "Department",
      accessor: (row) =>
        typeof row.department === "object"
          ? row.department.departmentName || row.department.id
          : row.department || "",
      type: "text",
    },
    {
      key: "inspectionDate",
      label: "Inspection Date",
      accessor: (row) => row.inspectionDate || "",
      type: "text",
    },
    {
      key: "partNo",
      label: "Part No",
      accessor: (row) =>
        typeof row.partNo === "object"
          ? row.partNo.itemCode || row.partNo.id
          : row.partNo || "",
      type: "text",
    },
    {
      key: "operationNo",
      label: "Operation No",
      accessor: (row) =>
        typeof row.operationNo === "object"
          ? row.operationNo.operationNo || row.operationNo.id
          : row.operationNo || "",
      type: "text",
    },
    {
      key: "shift",
      label: "Shift",
      accessor: (row) => row.shift || "",
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
    "department",
    "inspectionDate",
    "partNo",
    "operationNo",
    "shift",
  ];

  return (
    <CommonListViewTable
      title="In-Process Inspection"
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
      emptyMessage="No In-Process Inspection Entries found"
      loadingMessage="Loading In-Process Inspection Entries..."
      enableRefresh={true}
      onRefresh={loadRecords}
    />
  );
};

export default InProcessInspectionList;
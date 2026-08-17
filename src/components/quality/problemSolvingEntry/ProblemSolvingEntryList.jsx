import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import problemSolvingEntryAPI from "../../../api/quality/problemSolvingEntryAPI";
import { toast } from "../../../utils/toast";

const ProblemSolvingEntryList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data = await problemSolvingEntryAPI.getProblemSolvingEntryByOrgId(
        ORG_ID,
        BRANCH_ID,
      );
      data.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(data);
    } catch (error) {
      console.error("Failed to fetch problem solving entries:", error);
      setRecords([]);
      toast.error("Failed to fetch Problem Solving Entries");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const columns = [
    {
      key: "analysisNo",
      label: "Analysis No",
      accessor: (row) => row.analysisNo,
      type: "text",
      noWrap: true,
    },
    {
      key: "analysisDate",
      label: "Analysis Date",
      accessor: (row) => row.analysisDate || "",
      type: "text",
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
      key: "customerId",
      label: "Customer",
      accessor: (row) =>
        typeof row.customerId === "object"
          ? row.customerId.customerCode || row.customerId.customerName || row.customerId.id
          : row.customerName || row.customerId,
      type: "text",
    },
    {
      key: "itemCode",
      label: "Item Code",
      accessor: (row) =>
        typeof row.itemCode === "object"
          ? row.itemCode.itemCode || row.itemCode.id
          : row.itemCode || "",
      type: "text",
    },
    {
      key: "defectDescription",
      label: "Defect Description",
      accessor: (row) => row.defectDescription || "",
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
    "analysisNo",
    "analysisDate",
    "plantId",
    "department",
    "customerId",
    "itemCode",
    "defectDescription",
  ];

  return (
    <CommonListViewTable
      title="Problem Solving Entry"
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
      emptyMessage="No Problem Solving Entries found"
      loadingMessage="Loading Problem Solving Entries..."
      enableRefresh={true}
      onRefresh={loadRecords}
    />
  );
};

export default ProblemSolvingEntryList;
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
      key: "docId",
      label: "Analysis No",
      accessor: (row) => row.docId || row.analysisNo || "",
      type: "text",
      noWrap: true,
    },
    {
      key: "docDate",
      label: "Analysis Date",
      accessor: (row) => row.docDate || "",
      type: "text",
    },
    {
      key: "branch",
      label: "Plant",
      accessor: (row) =>
        typeof row.branch === "object"
          ? row.branch.branchName || row.branch.branchCode || row.branch.id
          : row.branch || "",
      type: "text",
    },
    {
      key: "department",
      label: "Department",
      accessor: (row) =>
        typeof row.department === "object"
          ? row.department.departmentName ||
            row.department.departmentCode ||
            row.department.id
          : row.department || "",
      type: "text",
    },
    {
      key: "customer",
      label: "Customer",
      accessor: (row) =>
        typeof row.customer === "object"
          ? row.customer.customerName || row.customer.id
          : row.customerName || row.customer || "",
      type: "text",
    },
    {
      key: "item",
      label: "Item Code",
      accessor: (row) =>
        typeof row.item === "object"
          ? row.item.itemCode || row.item.id
          : row.item || "",
      type: "text",
    },
    {
      key: "defectDesciption",
      label: "Defect Description",
      accessor: (row) => row.defectDesciption || "",
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
    "docId",
    "docDate",
    "branch",
    "department",
    "customer",
    "item",
    "defectDesciption",
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
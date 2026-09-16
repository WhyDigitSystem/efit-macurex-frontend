import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import zeroKmFailureAPI from "../../../api/quality/zeroKmFailureAPI";
import { toast } from "../../../utils/toast";

const ZeroKmFailureList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data = await zeroKmFailureAPI.getZeroKmFailureEntryByOrgId(
        ORG_ID,
        BRANCH_ID,
      );
      data.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(data);
    } catch (error) {
      console.error("Failed to load zero km failure entries:", error);
      setRecords([]);
      toast.error("Failed to fetch Zero Km Failure Entries");
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
      label: "Doc No",
      accessor: (row) => row.docId,
      type: "text",
      noWrap: true,
    },
    {
      key: "docDate",
      label: "Doc Date",
      accessor: (row) => row.docDate,
      type: "text",
    },
    {
      key: "branch",
      label: "Plant",
      accessor: (row) =>
        typeof row.branch === "object"
          ? row.branch.branchName || row.branch.branchCode || row.branch.id
          : row.branch,
      type: "text",
    },
    {
      key: "customer",
      label: "Party",
      accessor: (row) =>
        typeof row.customer === "object"
          ? row.customer.customerCode || row.customer.id
          : row.customer,
      type: "text",
    },
    {
      key: "partyName",
      label: "Party Name",
      accessor: (row) => row.partyName,
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

  const searchFields = [
    "docId",
    "docDate",
    "branch",
    "branch.branchName",
    "customer",
    "customer.customerCode",
    "partyName",
  ];

  return (
    <CommonListViewTable
      title="Zero Km Failure Entry"
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
      emptyMessage="No Zero Km Failure Entries found"
      loadingMessage="Loading Zero Km Failure Entries..."
      enableRefresh={true}
      onRefresh={loadRecords}
      enableExport={true}
      exportFileName="ZeroKmFailures"
    />
  );
};

export default ZeroKmFailureList;

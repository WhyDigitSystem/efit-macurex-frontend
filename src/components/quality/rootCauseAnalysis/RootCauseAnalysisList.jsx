import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import rootCauseAnalysisAPI from "../../../api/quality/rootCauseAnalysisAPI";
import { toast } from "../../../utils/toast";

const RootCauseAnalysisList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data = await rootCauseAnalysisAPI.getRootCauseByOrgId(
        ORG_ID,
        BRANCH_ID,
      );
      data.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(data);
    } catch (error) {
      console.error("Failed to load root cause analyses:", error);
      setRecords([]);
      toast.error("Failed to fetch Root Cause Analyses");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const columns = [
    {
      key: "rcNo",
      label: "RC No",
      accessor: (row) => row.rcNo || row.rcNumber,
      type: "text",
      noWrap: true,
    },
    {
      key: "rcDate",
      label: "RC Date",
      accessor: (row) => row.rcDate,
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
      key: "complaintNo",
      label: "Complaint No",
      accessor: (row) => row.complaintNo,
      type: "text",
    },
    {
      key: "complaintDate",
      label: "Complaint Date",
      accessor: (row) => row.complaintDate,
      type: "text",
    },
    {
      key: "itemCode",
      label: "Item Code",
      accessor: (row) =>
        typeof row.itemCode === "object"
          ? row.itemCode.itemCode || row.itemCode.id
          : row.itemCode,
      type: "text",
    },
    {
      key: "itemDescription",
      label: "Item Description",
      accessor: (row) =>
        typeof row.itemDescription === "object"
          ? row.itemDescription.itemDescription || row.itemDescription.id
          : row.itemDescription,
      type: "text",
    },
    {
      key: "complaintType",
      label: "Complaint Type",
      accessor: (row) => row.complaintType,
      type: "text",
    },
    {
      key: "customerId",
      label: "Customer",
      accessor: (row) =>
        typeof row.customerId === "object"
          ? row.customerId.customerName || row.customerId.customerCode || row.customerId.id
          : row.customerCode || row.customerId,
      type: "text",
    },
    {
      key: "customerName",
      label: "Customer Name",
      accessor: (row) => row.customerName,
      type: "text",
    },
    {
      key: "customerPartNo",
      label: "Customer Part No",
      accessor: (row) => row.customerPartNo,
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
    "rcNo",
    "rcNumber",
    "rcDate",
    "plantId",
    "plantId.branchName",
    "plantName",
    "complaintNo",
    "complaintDate",
    "itemCode",
    "itemCode.itemCode",
    "itemDescription",
    "complaintType",
    "customerId",
    "customerCode",
    "customerName",
    "customerPartNo",
  ];

  return (
    <CommonListViewTable
      title="Root Cause Analysis"
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
      emptyMessage="No Root Cause Analyses found"
      loadingMessage="Loading Root Cause Analyses..."
      enableRefresh={true}
      onRefresh={loadRecords}
      enableExport={true}
      exportFileName="RootCauseAnalyses"
    />
  );
};

export default RootCauseAnalysisList;

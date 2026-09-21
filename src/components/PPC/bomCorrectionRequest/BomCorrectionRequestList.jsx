import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import bomCorrectionRequestAPI from "../../../api/PPC/bomCorrectionRequestAPI";
import { toast } from "../../../utils/toast";

const BomCorrectionRequestList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
  const BRANCH_ID = Number(localStorage.getItem("branchId")) || 0;

  const loadRecords = useCallback(async () => {
    if (!ORG_ID || !BRANCH_ID) {
      setData([]);
      return;
    }

    try {
      setLoading(true);

      const records = await bomCorrectionRequestAPI.getByOrgIdAndBranch({
        branch: BRANCH_ID,
        orgId: ORG_ID,
      });

      // newest first
      records.sort((a, b) => (b.id || 0) - (a.id || 0));

      setData(records);
    } catch (error) {
      console.error("Failed to load BOM correction requests:", error);
      setData([]);
      toast.error("Failed to fetch BOM Correction Requests");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const getFgPartNo = (row) =>
    row?.fgPartNo?.itemCode || row?.fgPartNo || "";

  const getRequestedByName = (row) =>
    row?.correctionRequestedBy?.employeeName ||
    row?.correctionRequestedBy ||
    "";

  const getApprovedByName = (row) =>
    row?.correctionRequestApprovedBy?.employeeName ||
    row?.correctionRequestApprovedBy ||
    "";

  const getDocDate = (row) => {
    const d = row?.docDate;
    if (!d) return "";
    // Already YYYY-MM-DD; keep as-is. Swap to dayjs if you want formatted output.
    return d;
  };

  const columns = [
    {
      key: "docId",
      label: "Doc Id",
      accessor: (row) => row?.docId || "",
      type: "text",
    },
    {
      key: "docDate",
      label: "Date",
      accessor: (row) => getDocDate(row),
      type: "text",
    },
    {
      key: "fgPartNo",
      label: "FG Part No",
      accessor: (row) => getFgPartNo(row),
      type: "text",
    },
    {
      key: "correctionRequestedBy",
      label: "Requested By",
      accessor: (row) => getRequestedByName(row),
      type: "text",
    },
    {
      key: "correctionRequestApprovedBy",
      label: "Approved By",
      accessor: (row) => getApprovedByName(row),
      type: "text",
    },
    {
      key: "reasonForChange",
      label: "Reason for Change",
      accessor: (row) => row?.reasonForChange || "",
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

  const searchFields = [
    "docId",
    "fgPartNo.itemCode",
    "correctionRequestedBy.employeeName",
    "correctionRequestApprovedBy.employeeName",
    "productName",
    "customerName",
    "supplier",
    "reasonForChange",
  ];

  const filterOptions = [
    { value: "all", label: "All", field: null },
    {
      value: "active",
      label: "Active",
      field: "active",
      filterValue: "active",
      activeValue: true,
    },
    {
      value: "inactive",
      label: "Inactive",
      field: "active",
      filterValue: "inactive",
      activeValue: true,
    },
  ];

  return (
    <CommonListViewTable
      title="BOM Correction Request/Note"
      data={data}
      loading={loading}
      columns={columns}
      searchFields={searchFields}
      filterOptions={filterOptions}
      defaultFilter="all"
      onBack={onBack}
      onAddNew={onAddNew}
      onEdit={onEdit}
      onView={false}
      showSerialNumber={true}
      itemsPerPageOptions={[5, 10, 20, 50, 100]}
      defaultItemsPerPage={10}
      emptyMessage="No BOM Correction Requests found"
      loadingMessage="Loading BOM Correction Requests..."
      enableRefresh={true}
      onRefresh={loadRecords}
      enableExport={true}
      exportFileName="BomCorrectionRequests"
    />
  );
};

export default BomCorrectionRequestList;
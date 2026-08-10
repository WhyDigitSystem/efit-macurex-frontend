import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import setUpApprovalAPI from "../../../api/quality/setUpApprovalAPI";
import { toast } from "../../../utils/toast";

const SetUpApprovalList = ({
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
      const data = await setUpApprovalAPI.getSetUpApprovalByOrgId(
        ORG_ID,
        BRANCH_ID,
      );
      data.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(data);
    } catch (error) {
      console.error("Failed to load set up approvals:", error);
      setRecords([]);
      toast.error("Failed to fetch Set Up Approvals");
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
      key: "date",
      label: "Date",
      accessor: (row) => row.date,
      type: "text",
    },
    {
      key: "plantId",
      label: "Plant",
      accessor: (row) =>
        typeof row.plantId === "object"
          ? row.plantId.branchName || row.plantId.id
          : row.plantName || row.plantId,
      type: "text",
    },
    {
      key: "shift",
      label: "Shift",
      accessor: (row) => row.shift,
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
      key: "processSheetNo",
      label: "Process Sheet No",
      accessor: (row) => row.processSheetNo,
      type: "text",
    },
    {
      key: "partyId",
      label: "Party",
      accessor: (row) =>
        typeof row.partyId === "object"
          ? row.partyId.customerCode || row.partyId.id
          : row.partyCode || row.partyId,
      type: "text",
    },
    {
      key: "active",
      label: "Status",
      accessor: "active",
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
    "inspectionNo",
    "date",
    "plantId",
    "plantId.branchName",
    "plantName",
    "shift",
    "itemCode",
    "itemCode.itemCode",
    "itemDescription",
    "processSheetNo",
    "partyId",
    "partyId.customerCode",
    "partyCode",
  ];

  const filterOptions = [
    { value: "all", label: "All", field: null },
    {
      value: "active",
      label: "Active",
      field: "active",
      filterValue: "active",
      activeValue: "Active",
    },
    {
      value: "inactive",
      label: "Inactive",
      field: "active",
      filterValue: "inactive",
      activeValue: "Active",
    },
  ];

  return (
    <CommonListViewTable
      title="Set Up Approval"
      data={records}
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
      emptyMessage="No Set Up Approvals found"
      loadingMessage="Loading Set Up Approvals..."
      enableRefresh={true}
      onRefresh={loadRecords}
      enableExport={true}
      exportFileName="SetUpApprovals"
    />
  );
};

export default SetUpApprovalList;

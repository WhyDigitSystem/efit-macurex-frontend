import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import scrapNoteAPI from "../../../api/Production/scrapNoteAPI";
import { toast } from "../../../utils/toast";

const ScrapNoteList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
  const BRANCH_ID = Number(localStorage.getItem("branchId")) || 0;

  const loadRecords = useCallback(async () => {
    if (!ORG_ID || !BRANCH_ID) return;
    try {
      setLoading(true);
      const data = await scrapNoteAPI.getByOrgIdAndBranch({
        branch: BRANCH_ID,
        orgId: ORG_ID,
      });
      data.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(data);
    } catch (error) {
      console.error("Failed to fetch Scrap Note records:", error);
      setRecords([]);
      toast.error("Failed to fetch Scrap Notes");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  /* ---------------- Accessors ---------------- */

  const getBranchLabel = (row) =>
    row?.branch?.branchName ||
    row?.branch?.branchCode ||
    row?.branch?.id ||
    "";

  const getDepartmentLabel = (row) =>
    row?.department?.departmentName ||
    row?.department?.departmentCode ||
    row?.department?.id ||
    "";

  const getFgPartLabel = (row) =>
    row?.fgPart?.itemCode || row?.fgPart?.id || "";

  const getBomLabel = (row) => row?.bom?.docId || row?.bom?.id || "";

  const getScrapPartLabel = (row) =>
    row?.scrapPart?.itemCode || row?.scrapPart?.id || "";

  const getFromLocationLabel = (row) =>
    row?.fromLocation?.locationName || row?.fromLocation?.id || "";

  const getToLocationLabel = (row) =>
    row?.toLocation?.locationName || row?.toLocation?.id || "";

  /* ---------------- Columns ---------------- */

  const columns = [
    {
      key: "docId",
      label: "Scrap Note No",
      accessor: (row) => row?.docId || "",
      type: "text",
      noWrap: true,
    },
    {
      key: "docDate",
      label: "Scrap Note Date",
      accessor: (row) => row?.docDate || "",
      type: "date",
      noWrap: true,
    },
    {
      key: "branch",
      label: "Branch",
      accessor: (row) => getBranchLabel(row),
      type: "text",
    },
    {
      key: "department",
      label: "Department",
      accessor: (row) => getDepartmentLabel(row),
      type: "text",
    },
    {
      key: "fgPart",
      label: "FG Part No",
      accessor: (row) => getFgPartLabel(row),
      type: "text",
    },
    {
      key: "schOrderNo",
      label: "Schedule Order No",
      accessor: (row) => row?.schOrderNo || "",
      type: "text",
    },
    {
      key: "bom",
      label: "BOM ID",
      accessor: (row) => getBomLabel(row),
      type: "text",
    },
    {
      key: "scrapPart",
      label: "Scrap Part No",
      accessor: (row) => getScrapPartLabel(row),
      type: "text",
    },
    {
      key: "fromLocation",
      label: "From Location",
      accessor: (row) => getFromLocationLabel(row),
      type: "text",
    },
    {
      key: "toLocation",
      label: "To Location",
      accessor: (row) => getToLocationLabel(row),
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
      width: "120px",
    },
  ];

  const searchFields = [
    "docId",
    "docDate",
    "branch.branchName",
    "department.departmentName",
    "fgPart.itemCode",
    "schOrderNo",
    "bom.docId",
    "scrapPart.itemCode",
    "narration",
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
      title="Scrap Note"
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
      emptyMessage="No Scrap Notes found"
      loadingMessage="Loading Scrap Notes..."
      enableRefresh={true}
      onRefresh={loadRecords}
    />
  );
};

export default ScrapNoteList;
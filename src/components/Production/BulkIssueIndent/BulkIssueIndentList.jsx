import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import bulkIssueIndentAPI from "../../../api/Production/bulkIssueIndentAPI";
import { toast } from "../../../utils/toast";

const BulkIssueIndentList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [indentData, setIndentData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
  const BRANCH_ID = Number(localStorage.getItem("branchId")) || 0;

  const loadBulkIssueIndents = useCallback(async () => {
    if (!ORG_ID || !BRANCH_ID) {
      setIndentData([]);
      return;
    }

    try {
      setLoading(true);

      const response =
        await bulkIssueIndentAPI.getByOrgIdAndBranch({
          branch: BRANCH_ID,
          orgId: ORG_ID,
        });

      const sortedData = (response || []).sort(
        (a, b) => (b.id || 0) - (a.id || 0),
      );

      setIndentData(sortedData);
    } catch (error) {
      console.error("Failed to load bulk issue indents:", error);
      setIndentData([]);
      toast.error("Failed to fetch bulk issue indents");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadBulkIssueIndents();
  }, [loadBulkIssueIndents, refreshTrigger]);

  /* ---------------- Accessors ---------------- */

  const getPlantLabel = (row) =>
    row?.branch?.branchName ||
    row?.branch?.branchCode ||
    row?.branch?.id ||
    "";

  const getDepartmentLabel = (row) =>
    row?.department?.departmentName ||
    row?.department?.departmentCode ||
    row?.department?.id ||
    "";

  const getFgDescription = (row) =>
    row?.fgSfgItem?.itemDescription ||
    row?.fgSfgItem?.itemCode ||
    "";

  /* ---------------- Columns ---------------- */

  const columns = [
    {
      key: "docId",
      label: "DocId",
      accessor: (row) => row?.docId || "",
      type: "text",
      noWrap: true,
    },
    {
      key: "docDate",
      label: "DocDate",
      accessor: (row) => row?.docDate || "",
      type: "text",
    },
    {
      key: "branch",
      label: "Plant",
      accessor: (row) => getPlantLabel(row),
      type: "text",
    },
    {
      key: "department",
      label: "Department",
      accessor: (row) => getDepartmentLabel(row),
      type: "text",
    },
    {
      key: "fgDescription",
      label: "FG Description",
      accessor: (row) => getFgDescription(row),
      type: "text",
    },
    {
      key: "approvedByPM",
      label: "Approved By PM",
      accessor: (row) => row?.approvedByPM || "",
      type: "badge",
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
    "department.departmentName",
    "fgSfgItem.itemDescription",
    "belongsTo",
  ];

  return (
    <div className="h-full flex flex-col">
      <CommonListViewTable
        title="Bulk Issue Indent"
        data={indentData}
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
        emptyMessage="No Bulk Issue Indents found"
        loadingMessage="Loading Bulk Issue Indents..."
        enableRefresh={true}
        onRefresh={loadBulkIssueIndents}
        enableExport={true}
        exportFileName="BulkIssueIndents"
      />
    </div>
  );
};

export default BulkIssueIndentList;
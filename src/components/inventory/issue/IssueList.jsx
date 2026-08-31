import { useCallback, useEffect, useState } from "react";
import issueAPI from "../../../api/Inventory/issueAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";

const IssueList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [issueData, setIssueData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId"));
  const BRANCH_ID = Number(localStorage.getItem("branchId"));

  const loadIssues = useCallback(async () => {
    if (!ORG_ID || !BRANCH_ID) return;

    try {
      setLoading(true);

      const response = await issueAPI.getIssueByOrgId(BRANCH_ID, ORG_ID);

      const transformedData = (response || []).map((item) => ({
        id: item.id,
        issNo: item.docId || "",
        issDate: item.docDate || "",
        department: item.department?.departmentName || "",
        belongsTo: item.belongsTo || "",
        time: item.time || "",
        refNo: item.refNo || "",
        refDate: item.refDate || "",
        indentNo: item.indentNo || "",
        issueFrom: item.issueFrom?.locationName || "",
        issueTo: item.issueTo?.locationName || "",
        plantId: item.branch?.branchName || "",
        narration: item.narration || "",
        active: item.active ? "Active" : "Inactive",
        issuesDetails: item.issuesDetails || [],
        cancelRemarks: item.cancelRemarks || "",
        createdBy: item.createdBy || "",
      }));

      transformedData.sort((a, b) => (b.id || 0) - (a.id || 0));

      setIssueData(transformedData);
    } catch (error) {
      console.error("Failed to load issues:", error);
      setIssueData([]);
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadIssues();
  }, [loadIssues, refreshTrigger]);

  const columns = [
    {
      key: "issNo",
      label: "Iss. No.",
      accessor: "issNo",
      type: "text",
    },
    {
      key: "issDate",
      label: "Iss. Date",
      accessor: "issDate",
      type: "date",
    },
    {
      key: "department",
      label: "Department",
      accessor: "department",
      type: "text",
    },
    {
      key: "plantId",
      label: "Plant",
      accessor: "plantId",
      type: "text",
    },
    {
      key: "issueFrom",
      label: "Issues From",
      accessor: "issueFrom",
      type: "text",
    },
    {
      key: "issueTo",
      label: "Issue To",
      accessor: "issueTo",
      type: "text",
    },
    {
      key: "indentNo",
      label: "Indent No",
      accessor: "indentNo",
      type: "text",
    },
    {
      key: "active",
      label: "Status",
      accessor: "active",
      type: "status",
    },
    {
      key: "actions",
      label: "Actions",
      type: "actions",
      align: "center",
      width: "90px",
    },
  ];

  const searchFields = ["issNo", "department", "indentNo", "issueTo"];

  const filterOptions = [
    { value: "all", label: "All", activeValue: "All" },
    { value: "active", label: "Active", activeValue: "Active" },
    { value: "inactive", label: "Inactive", activeValue: "Active" },
  ];

  return (
    <div className="h-full flex flex-col">
      <CommonListViewTable
        title="Issues"
        data={issueData}
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
        emptyMessage="No Issues found"
        loadingMessage="Loading Issues..."
        enableRefresh={true}
        onRefresh={loadIssues}
        enableExport={true}
        exportFileName="Issues"
      />
    </div>
  );
};

export default IssueList;

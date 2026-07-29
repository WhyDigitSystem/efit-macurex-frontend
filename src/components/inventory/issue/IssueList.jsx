import { useCallback, useEffect, useState } from "react";
import issueAPI from "../../../api/Inventory/issueAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const IssueList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [issueData, setIssueData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId"));

  const loadIssues = useCallback(async () => {
    try {
      setLoading(true);

      const response = await issueAPI.getIssueByOrgId(ORG_ID);

      const sortedData = (response || []).sort(
        (a, b) => (b.id || 0) - (a.id || 0),
      );

      setIssueData(sortedData);
    } catch (error) {
      console.error("Failed to load issues:", error);
      setIssueData([]);
      toast.error("Failed to fetch issues");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadIssues();
  }, [loadIssues, refreshTrigger]);

  const columns = [
    {
      key: "issNo",
      label: "Iss. No.",
      accessor: (row) => row.header?.issNo,
      type: "text",
    },
    {
      key: "issDate",
      label: "Iss. Date",
      accessor: (row) => row.header?.issDate,
      type: "date",
    },
    {
      key: "department",
      label: "Department",
      accessor: (row) => row.header?.department,
      type: "text",
    },
    {
      key: "issuesFrom",
      label: "Issues From",
      accessor: (row) => row.header?.issuesFrom,
      type: "text",
    },
    {
      key: "issueTo",
      label: "Issue To",
      accessor: (row) => row.header?.issueTo,
      type: "text",
    },
    {
      key: "indentNo",
      label: "Indent No",
      accessor: (row) => row.header?.indentNo,
      type: "text",
    },
    {
      key: "plantId",
      label: "Plant ID",
      accessor: (row) => row.header?.plantId,
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

  const searchFields = ["header.issNo", "header.department", "header.indentNo"];

  return (
    <div className="h-full flex flex-col">
      <CommonListViewTable
        title="Issues"
        data={issueData}
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

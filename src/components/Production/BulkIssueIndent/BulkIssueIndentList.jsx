import { useCallback, useEffect, useState } from "react";

import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const BulkIssueIndentList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [indentData, setIndentData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId"));

  const loadBulkIssueIndents = useCallback(async () => {
    try {
      setLoading(true);

      const response =
        await bulkIssueIndentAPI.getBulkIssueIndentByOrgId(ORG_ID);

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
  }, [ORG_ID]);

  useEffect(() => {
    loadBulkIssueIndents();
  }, [loadBulkIssueIndents, refreshTrigger]);

  const columns = [
    {
      key: "docId",
      label: "DocId",
      accessor: (row) => row.header?.docId,
      type: "text",
    },
    {
      key: "docDate",
      label: "DocDate",
      accessor: (row) => row.header?.docDate,
      type: "date",
    },
    {
      key: "plant",
      label: "Plant",
      accessor: (row) => row.header?.plant,
      type: "text",
    },
    {
      key: "department",
      label: "Department",
      accessor: (row) => row.header?.department,
      type: "text",
    },
    {
      key: "fgDescription",
      label: "FG Description",
      accessor: (row) => row.header?.fgDescription,
      type: "text",
    },
    {
      key: "approvedByPM",
      label: "Approved By PM",
      accessor: (row) => row.indentSummary?.approvedByPM,
      type: "badge",
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

  const searchFields = [
    "header.docId",
    "header.department",
    "header.fgDescription",
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

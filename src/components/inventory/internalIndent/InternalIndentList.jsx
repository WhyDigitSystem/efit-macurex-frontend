import { useCallback, useEffect, useState } from "react";
import internalIndentAPI from "../../../api/Inventory/internalIndentAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const InternalIndentList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [indentData, setIndentData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId"));

  const loadIndents = useCallback(async () => {
    try {
      setLoading(true);

      const response = await internalIndentAPI.getInternalIndentByOrgId(ORG_ID);

      const sortedData = (response || []).sort(
        (a, b) => (b.id || 0) - (a.id || 0),
      );

      setIndentData(sortedData);
    } catch (error) {
      console.error("Failed to load internal indents:", error);
      setIndentData([]);
      toast.error("Failed to fetch internal indents");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadIndents();
  }, [loadIndents, refreshTrigger]);

  const columns = [
    {
      key: "docId",
      label: "Doc Id",
      accessor: (row) => row.header?.docId,
      type: "text",
    },
    {
      key: "docDate",
      label: "Doc Date",
      accessor: (row) => row.header?.docDate,
      type: "date",
    },
    {
      key: "department",
      label: "Department",
      accessor: (row) => row.header?.department,
      type: "text",
    },
    {
      key: "plant",
      label: "Plant",
      accessor: (row) => row.header?.plant,
      type: "text",
    },
    {
      key: "approvedByPM",
      label: "Approved By PM",
      accessor: (row) => row.summary?.approvedByPM,
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

  const searchFields = ["header.docId", "header.department"];

  return (
    <div className="h-full flex flex-col">
      <CommonListViewTable
        title="Internal Indent"
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
        emptyMessage="No Internal Indents found"
        loadingMessage="Loading Internal Indents..."
        enableRefresh={true}
        onRefresh={loadIndents}
        enableExport={true}
        exportFileName="InternalIndents"
      />
    </div>
  );
};

export default InternalIndentList;

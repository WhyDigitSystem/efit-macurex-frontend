import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const MachineToolsScrapNoteList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [scrapNoteData, setScrapNoteData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId"));

  const loadScrapNotes = useCallback(async () => {
    try {
      setLoading(true);

      const response =
        await machineToolsScrapNoteAPI.getMachineToolsScrapNoteByOrgId(ORG_ID);

      const sortedData = (response || []).sort(
        (a, b) => (b.id || 0) - (a.id || 0),
      );

      setScrapNoteData(sortedData);
    } catch (error) {
      console.error("Failed to load machine tools scrap notes:", error);
      setScrapNoteData([]);
      toast.error("Failed to fetch machine tools scrap notes");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadScrapNotes();
  }, [loadScrapNotes, refreshTrigger]);

  const columns = [
    {
      key: "msnNo",
      label: "MSN No",
      accessor: (row) => row.header?.msnNo,
      type: "text",
    },
    {
      key: "msnDate",
      label: "MSN Date",
      accessor: (row) => row.header?.msnDate,
      type: "date",
    },
    {
      key: "plant",
      label: "Plant ID",
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
      key: "fromLocation",
      label: "From Location",
      accessor: (row) => row.header?.fromLocation,
      type: "text",
    },
    {
      key: "toLocation",
      label: "To Location",
      accessor: (row) => row.header?.toLocation,
      type: "text",
    },
    {
      key: "storeApproval",
      label: "Store Approval",
      accessor: (row) => row.scrapDetails?.storeApproval,
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

  const searchFields = ["header.msnNo", "header.department"];

  return (
    <div className="h-full flex flex-col">
      <CommonListViewTable
        title="Machine Tools Scrap Note"
        data={scrapNoteData}
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
        emptyMessage="No Machine Tools Scrap Notes found"
        loadingMessage="Loading Machine Tools Scrap Notes..."
        enableRefresh={true}
        onRefresh={loadScrapNotes}
        enableExport={true}
        exportFileName="MachineToolsScrapNotes"
      />
    </div>
  );
};

export default MachineToolsScrapNoteList;

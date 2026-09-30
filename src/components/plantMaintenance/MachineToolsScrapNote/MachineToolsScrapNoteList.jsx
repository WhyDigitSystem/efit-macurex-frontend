import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import machineToolsScrapNoteAPI from "../../../api/plantMaintenance/machineToolsScrapNoteAPI";
import { useToast } from "../../Toast/ToastContext";

const MachineToolsScrapNoteList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [scrapNoteData, setScrapNoteData] = useState([]);
  const [loading, setLoading] = useState(false);

  const { addToast } = useToast();

  const ORG_ID = Number(localStorage.getItem("orgId"));
  const BRANCH_ID = Number(localStorage.getItem("branchId"));

  const loadScrapNotes = useCallback(async () => {
    if (!ORG_ID || !BRANCH_ID) {
      setScrapNoteData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const list =
        await machineToolsScrapNoteAPI.getMachineToolsScrapNoteByOrgId(
          BRANCH_ID,
          ORG_ID
        );

      const sorted = (list || []).sort(
        (a, b) => Number(b.id || 0) - Number(a.id || 0)
      );

      setScrapNoteData(sorted);
    } catch (error) {
      console.error("Failed to load machine tools scrap notes:", error);
      addToast("Failed to fetch machine tools scrap notes", "error");
      setScrapNoteData([]);
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID, addToast]);

  useEffect(() => {
    loadScrapNotes();
  }, [loadScrapNotes, refreshTrigger]);

  const columns = [
    {
      key: "msnNo",
      label: "MSN No",
      accessor: (row) => row.docId || row.msnNo || "-",
      type: "text",
    },
    {
      key: "msnDate",
      label: "MSN Date",
      accessor: (row) => row.docDate || row.msnDate || "-",
      type: "date",
    },
    {
      key: "plant",
      label: "Plant ID",
      accessor: (row) =>
        row.branch?.branchName || row.branch?.branchCode || "-",
      type: "text",
    },
    {
      key: "department",
      label: "Department",
      accessor: (row) =>
        row.departement?.departmentName ||
        row.department?.departmentName ||
        row.departement?.departmentCode ||
        row.department?.departmentCode ||
        "-",
      type: "text",
    },
    {
      key: "fromLocation",
      label: "From Location",
      accessor: (row) => row.fromLocation?.locationName || "-",
      type: "text",
    },
    {
      key: "toLocation",
      label: "To Location",
      accessor: (row) => row.toLocation?.locationName || "-",
      type: "text",
    },
    {
      key: "storeApproval",
      label: "Store Approval",
      accessor: (row) => row.storeApproval || "-",
      type: "badge",
    },
    {
      key: "active",
      label: "Status",
      accessor: (row) =>
        row.active === "Active" || row.active === true
          ? "Active"
          : "Inactive",
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

  const searchFields = ["departement.departmentName", "belongsTo.description"];

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
import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import materialTransferReturnNoteAPI from "../../../api/Production/materialTransferReturnNoteAPI";
import { toast } from "../../../utils/toast";

const MTRNList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data = await materialTransferReturnNoteAPI.getByOrgId(
        ORG_ID,
        BRANCH_ID,
      );
      data.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(data);
    } catch (error) {
      console.error("Failed to fetch MTRN records:", error);
      setRecords([]);
      toast.error("Failed to fetch Material Transfer/Return Notes");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const columns = [
    {
      key: "mtrnNo",
      label: "MTRN No",
      accessor: (row) => row.mtrnNo || row.docNo || "",
      type: "text",
      noWrap: true,
    },
    {
      key: "mtrnDate",
      label: "MTRN Date",
      accessor: (row) => row.mtrnDate || row.docDate || "",
      type: "date",
      noWrap: true,
    },
    {
      key: "type",
      label: "Type",
      accessor: (row) => row.type || "",
      type: "text",
    },
    {
      key: "plantId",
      label: "Branch",
      accessor: (row) =>
        typeof row.plantId === "object"
          ? row.plantId.branchName || row.plantId.plantName || row.plantId.id
          : row.plantName || row.plantId,
      type: "text",
    },
    {
      key: "fgSfgPartNo",
      label: "FG/SFG Part No",
      accessor: (row) =>
        typeof row.fgSfgPartNo === "object"
          ? row.fgSfgPartNo.itemCode || row.fgSfgPartNo.id
          : row.fgSfgPartNo || "",
      type: "text",
    },
    {
      key: "subOrderNo",
      label: "Sub Order No",
      accessor: (row) =>
        typeof row.subOrderNo === "object"
          ? row.subOrderNo.docId || row.subOrderNo.id
          : row.subOrderNo || "",
      type: "text",
    },
    {
      key: "fromLocation",
      label: "From Location",
      accessor: (row) =>
        typeof row.fromLocation === "object"
          ? row.fromLocation.locationName || row.fromLocation.id
          : row.fromLocation || "",
      type: "text",
    },
    {
      key: "toLocation",
      label: "To Location",
      accessor: (row) =>
        typeof row.toLocation === "object"
          ? row.toLocation.locationName || row.toLocation.id
          : row.toLocation || "",
      type: "text",
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
    "mtrnNo",
    "mtrnDate",
    "type",
    "plantId",
    "fgSfgPartNo",
    "subOrderNo",
    "fromLocation",
    "toLocation",
  ];

  return (
    <CommonListViewTable
      title="Material Transfer/Return Note"
      data={records}
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
      emptyMessage="No Material Transfer/Return Notes found"
      loadingMessage="Loading Material Transfer/Return Notes..."
      enableRefresh={true}
      onRefresh={loadRecords}
    />
  );
};

export default MTRNList;
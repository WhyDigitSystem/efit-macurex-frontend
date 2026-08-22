import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import scrapNoteAPI from "../../../api/Production/scrapNoteAPI";
import { toast } from "../../../utils/toast";

const ScrapNoteList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data = await scrapNoteAPI.getByOrgId(ORG_ID, BRANCH_ID);
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

  const columns = [
    {
      key: "scrapNoteNo",
      label: "Scrap Note No",
      accessor: (row) => row.scrapNoteNo || row.docNo || "",
      type: "text",
      noWrap: true,
    },
    {
      key: "scrapNoteDate",
      label: "Scrap Note Date",
      accessor: (row) => row.scrapNoteDate || row.docDate || "",
      type: "date",
      noWrap: true,
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
      key: "department",
      label: "Department",
      accessor: (row) =>
        typeof row.department === "object"
          ? row.department.departmentName || row.department.id
          : row.departmentName || row.department || "",
      type: "text",
    },
    {
      key: "fgPartNo",
      label: "FG Part No",
      accessor: (row) =>
        typeof row.fgPartNo === "object"
          ? row.fgPartNo.itemCode || row.fgPartNo.id
          : row.fgPartNo || "",
      type: "text",
    },
    {
      key: "scheduleOrderNo",
      label: "Schedule Order No",
      accessor: (row) =>
        typeof row.scheduleOrderNo === "object"
          ? row.scheduleOrderNo.docId || row.scheduleOrderNo.id
          : row.scheduleOrderNo || "",
      type: "text",
    },
    {
      key: "bomId",
      label: "BOM ID",
      accessor: (row) =>
        typeof row.bomId === "object"
          ? row.bomId.bomName || row.bomId.bomId || row.bomId.id
          : row.bomName || row.bomId || "",
      type: "text",
    },
    {
      key: "scrapPartNo",
      label: "Scrap Part No",
      accessor: (row) =>
        typeof row.scrapPartNo === "object"
          ? row.scrapPartNo.itemCode || row.scrapPartNo.id
          : row.scrapPartNo || "",
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
    "scrapNoteNo",
    "scrapNoteDate",
    "plantId",
    "department",
    "fgPartNo",
    "scheduleOrderNo",
    "bomId",
    "scrapPartNo",
    "fromLocation",
    "toLocation",
  ];

  return (
    <CommonListViewTable
      title="Scrap Note"
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
      emptyMessage="No Scrap Notes found"
      loadingMessage="Loading Scrap Notes..."
      enableRefresh={true}
      onRefresh={loadRecords}
    />
  );
};

export default ScrapNoteList;
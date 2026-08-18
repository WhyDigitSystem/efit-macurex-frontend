import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import dailyInspectionCumRejectionDataAPI from "../../../api/quality/dailyInspectionCumRejectionDataAPI";
import { toast } from "../../../utils/toast";

const DICRList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dailyInspectionCumRejectionDataAPI.getDICRByOrgId(
        ORG_ID,
        BRANCH_ID,
      );
      data.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(data);
    } catch (error) {
      console.error("Failed to fetch DICR records:", error);
      setRecords([]);
      toast.error("Failed to fetch Daily Inspection Cum Rejection Data");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const columns = [
    {
      key: "dicrNo",
      label: "DICR No",
      accessor: (row) => row.dicrNo || row.docNo || "",
      type: "text",
      noWrap: true,
    },
    {
      key: "date",
      label: "Date",
      accessor: (row) => row.date || row.docDate || "",
      type: "text",
      noWrap: true,
    },
    {
      key: "plantId",
      label: "Plant",
      accessor: (row) =>
        typeof row.plantId === "object"
          ? row.plantId.branchName || row.plantId.plantName || row.plantId.id
          : row.plantName || row.plantId,
      type: "text",
    },
    {
      key: "belongsTo",
      label: "Belongs To",
      accessor: (row) =>
        typeof row.belongsTo === "object"
          ? row.belongsTo.departmentName || row.belongsTo.id
          : row.belongsTo || "",
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
      key: "reworkLocation",
      label: "Rework Location",
      accessor: (row) =>
        typeof row.reworkLocation === "object"
          ? row.reworkLocation.locationName || row.reworkLocation.id
          : row.reworkLocation || "",
      type: "text",
    },
    {
      key: "rejectionLocation",
      label: "Rejection Location",
      accessor: (row) =>
        typeof row.rejectionLocation === "object"
          ? row.rejectionLocation.locationName || row.rejectionLocation.id
          : row.rejectionLocation || "",
      type: "text",
    },
    {
      key: "scrapLocation",
      label: "Scrap Location",
      accessor: (row) =>
        typeof row.scrapLocation === "object"
          ? row.scrapLocation.locationName || row.scrapLocation.id
          : row.scrapLocation || "",
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
    "dicrNo",
    "date",
    "plantId",
    "belongsTo",
    "fromLocation",
    "reworkLocation",
    "rejectionLocation",
    "scrapLocation",
  ];

  return (
    <CommonListViewTable
      title="Daily Inspection Cum Rejection Data"
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
      emptyMessage="No Daily Inspection Cum Rejection Data found"
      loadingMessage="Loading Daily Inspection Cum Rejection Data..."
      enableRefresh={true}
      onRefresh={loadRecords}
    />
  );
};

export default DICRList;
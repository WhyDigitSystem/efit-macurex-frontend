import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import productionScheduleOrderShortCloseAPI from "../../../api/Production/productionScheduleOrderShortCloseAPI";
import { toast } from "../../../utils/toast";

const ScheduleOrderShortCloseList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data = await productionScheduleOrderShortCloseAPI.getByOrgId(
        ORG_ID,
        BRANCH_ID,
      );
      data.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(data);
    } catch (error) {
      console.error("Failed to fetch Short Close records:", error);
      setRecords([]);
      toast.error("Failed to fetch Production Schedule Order Short Closes");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const columns = [
    {
      key: "shortCloseNo",
      label: "Short Close No",
      accessor: (row) => row.shortCloseNo || row.docNo || "",
      type: "text",
      noWrap: true,
    },
    {
      key: "date",
      label: "Date",
      accessor: (row) => row.date || row.docDate || "",
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
      key: "itemCode",
      label: "Item Code",
      accessor: (row) =>
        typeof row.itemCode === "object"
          ? row.itemCode.itemCode || row.itemCode.id
          : row.itemCode || "",
      type: "text",
    },
    {
      key: "itemDescription",
      label: "Item Description",
      accessor: (row) => row.itemDescription || "",
      type: "text",
    },
    {
      key: "unit",
      label: "Unit",
      accessor: (row) =>
        typeof row.unit === "object"
          ? row.unit.unitId || row.unit.id
          : row.unitName || row.unit || "",
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
    "shortCloseNo",
    "date",
    "plantId",
    "itemCode",
    "itemDescription",
    "unit",
  ];

  return (
    <CommonListViewTable
      title="Production Schedule Order Short-Closed"
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
      emptyMessage="No Short Close records found"
      loadingMessage="Loading Short Close records..."
      enableRefresh={true}
      onRefresh={loadRecords}
    />
  );
};

export default ScheduleOrderShortCloseList;
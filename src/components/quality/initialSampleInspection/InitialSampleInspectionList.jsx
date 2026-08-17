import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import initialSampleInspectionAPI from "../../../api/quality/initialSampleInspectionAPI";
import { toast } from "../../../utils/toast";

const InitialSampleInspectionList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data = await initialSampleInspectionAPI.getInitialSampleInspectionByOrgId(
        ORG_ID,
        BRANCH_ID,
      );
      data.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(data);
    } catch (error) {
      console.error("Failed to fetch initial sample inspections:", error);
      setRecords([]);
      toast.error("Failed to fetch Initial Sample Inspection Entries");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const columns = [
    {
      key: "inspectionNo",
      label: "Inspection No",
      accessor: (row) => row.inspectionNo,
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
      key: "department",
      label: "Department",
      accessor: (row) =>
        typeof row.department === "object"
          ? row.department.departmentName || row.department.id
          : row.department || "",
      type: "text",
    },
    {
      key: "date",
      label: "Date",
      accessor: (row) => row.date || "",
      type: "text",
    },
    {
      key: "supplierId",
      label: "Supplier",
      accessor: (row) =>
        typeof row.supplierId === "object"
          ? row.supplierId.customerCode || row.supplierId.customerName || row.supplierId.id
          : row.supplierName || row.supplierId,
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
      key: "decision",
      label: "Decision",
      accessor: (row) => row.decision || "",
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
    "inspectionNo",
    "plantId",
    "department",
    "date",
    "supplierId",
    "itemCode",
    "decision",
  ];

  return (
    <CommonListViewTable
      title="Initial Sample Inspection"
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
      emptyMessage="No Initial Sample Inspection Entries found"
      loadingMessage="Loading Initial Sample Inspection Entries..."
      enableRefresh={true}
      onRefresh={loadRecords}
    />
  );
};

export default InitialSampleInspectionList;
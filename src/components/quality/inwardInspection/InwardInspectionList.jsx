import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import inwardInspectionAPI from "../../../api/quality/inwardInspectionAPI";
import { toast } from "../../../utils/toast";

const InwardInspectionList = ({
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
      const data = await inwardInspectionAPI.getInwardInspectionByOrgId(
        ORG_ID,
        BRANCH_ID,
      );
      data.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(data);
    } catch (error) {
      console.error("Failed to load inward inspections:", error);
      setRecords([]);
      toast.error("Failed to fetch Inward Inspections");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const columns = [
    {
      key: "docNo",
      label: "Doc No",
      accessor: (row) => row.docNo,
      type: "text",
      noWrap: true,
    },
    {
      key: "docDate",
      label: "Doc Date",
      accessor: (row) => row.docDate,
      type: "text",
    },
    {
      key: "plantId",
      label: "Plant",
      accessor: (row) =>
        typeof row.plantId === "object"
          ? row.plantId.branchName || row.plantId.id
          : row.plantName || row.plantId,
      type: "text",
    },
    {
      key: "inwardType",
      label: "Inward Type",
      accessor: (row) => row.inwardType,
      type: "text",
    },
    {
      key: "supplierCode",
      label: "Supplier Code",
      accessor: (row) =>
        typeof row.supplierCode === "object"
          ? row.supplierCode.customerCode || row.supplierCode.id
          : row.supplierCode,
      type: "text",
    },
    {
      key: "supplierName",
      label: "Supplier Name",
      accessor: (row) =>
        typeof row.supplierName === "object"
          ? row.supplierName.customerName || row.supplierName.name || row.supplierName.id
          : row.supplierName,
      type: "text",
    },
    {
      key: "mrnNo",
      label: "MRN/SC GRN No",
      accessor: (row) => row.mrnNo || row.mrnScGrnNo,
      type: "text",
    },
    {
      key: "approved",
      label: "Approved",
      accessor: (row) => (row.approved ? "Yes" : "No"),
      type: "status",
      statusVariants: {
        Yes: {
          label: "Yes",
          className:
            "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        },
        No: {
          label: "No",
          className:
            "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
        },
      },
    },
    {
      key: "active",
      label: "Status",
      accessor: "active",
      type: "status",
      statusVariants: {
        Active: {
          label: "Active",
          className:
            "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        },
        Inactive: {
          label: "Inactive",
          className:
            "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
        },
      },
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
    "docNo",
    "docDate",
    "plantId",
    "plantId.branchName",
    "plantName",
    "inwardType",
    "supplierCode",
    "supplierCode.customerCode",
    "supplierName",
    "supplierName.customerName",
    "mrnNo",
    "mrnScGrnNo",
  ];

  const filterOptions = [
    { value: "all", label: "All", field: null },
    {
      value: "approved",
      label: "Approved",
      field: "approved",
      filterValue: true,
      activeValue: true,
    },
    {
      value: "active",
      label: "Active",
      field: "active",
      filterValue: "active",
      activeValue: "Active",
    },
    {
      value: "inactive",
      label: "Inactive",
      field: "active",
      filterValue: "inactive",
      activeValue: "Active",
    },
  ];

  return (
    <CommonListViewTable
      title="Inward Inspection"
      data={records}
      loading={loading}
      columns={columns}
      searchFields={searchFields}
      filterOptions={filterOptions}
      defaultFilter="all"
      onBack={onBack}
      onAddNew={onAddNew}
      onEdit={onEdit}
      onView={false}
      showSerialNumber={true}
      itemsPerPageOptions={[5, 10, 20, 50, 100]}
      defaultItemsPerPage={10}
      emptyMessage="No Inward Inspections found"
      loadingMessage="Loading Inward Inspections..."
      enableRefresh={true}
      onRefresh={loadRecords}
      enableExport={true}
      exportFileName="InwardInspections"
    />
  );
};

export default InwardInspectionList;

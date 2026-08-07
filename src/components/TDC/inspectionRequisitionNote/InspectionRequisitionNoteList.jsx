import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import inspectionRequisitionNoteAPI from "../../../api/TDC/inspectionRequisitionNoteAPI";
import { toast } from "../../../utils/toast";

const InspectionRequisitionNoteList = ({
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
      const data = await inspectionRequisitionNoteAPI.getIrnByOrgId(
        ORG_ID,
        BRANCH_ID,
      );
      data.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(data);
    } catch (error) {
      console.error("Failed to load inspection requisition notes:", error);
      setRecords([]);
      toast.error("Failed to fetch Inspection Requisition Notes");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const columns = [
    {
      key: "irnNo",
      label: "IRN No",
      accessor: (row) => row.irnNo,
      type: "text",
      noWrap: true,
    },
    {
      key: "date",
      label: "Date",
      accessor: (row) => row.date,
      type: "text",
    },
    {
      key: "requestedBy",
      label: "Requested By",
      accessor: (row) =>
        typeof row.requestedBy === "object"
          ? row.requestedBy.employeeName || row.requestedBy.id
          : row.requestedBy,
      type: "text",
    },
    {
      key: "productCategory",
      label: "Product Category",
      accessor: (row) => row.productCategory,
      type: "text",
    },
    {
      key: "partName",
      label: "Part Name",
      accessor: (row) => row.partName,
      type: "text",
    },
    {
      key: "partNumber",
      label: "Part Number",
      accessor: (row) => row.partNumber,
      type: "text",
    },
    {
      key: "sampleQuantity",
      label: "Sample Qty",
      accessor: (row) => row.sampleQuantity,
      type: "text",
    },
    {
      key: "product",
      label: "Product",
      accessor: (row) => row.product,
      type: "text",
    },
    {
      key: "customer",
      label: "Customer",
      accessor: (row) => row.customer,
      type: "text",
    },
    {
      key: "supplier",
      label: "Supplier",
      accessor: (row) => row.supplier,
      type: "text",
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
    "irnNo",
    "date",
    "requestedBy",
    "requestedBy.employeeName",
    "productCategory",
    "partName",
    "partNumber",
    "sampleQuantity",
    "product",
    "customer",
    "supplier",
  ];

  const filterOptions = [
    { value: "all", label: "All", field: null },
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
      title="Inspection Requisition Note"
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
      emptyMessage="No Inspection Requisition Notes found"
      loadingMessage="Loading Inspection Requisition Notes..."
      enableRefresh={true}
      onRefresh={loadRecords}
      enableExport={true}
      exportFileName="InspectionRequisitionNotes"
    />
  );
};

export default InspectionRequisitionNoteList;

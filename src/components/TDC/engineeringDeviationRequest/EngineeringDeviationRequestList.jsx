import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import engineeringDeviationRequestAPI from "../../../api/TDC/engineeringDeviationRequestAPI";
import { toast } from "../../../utils/toast";

const EngineeringDeviationRequestList = ({
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
      const data = await engineeringDeviationRequestAPI.getEdrByOrgId(
        ORG_ID,
        BRANCH_ID,
      );
      data.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(data);
    } catch (error) {
      console.error("Failed to load engineering deviation requests:", error);
      setRecords([]);
      toast.error("Failed to fetch Engineering Deviation Requests");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const columns = [
    {
      key: "requestNo",
      label: "Request No",
      accessor: (row) => row.requestNo,
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
      key: "to",
      label: "To",
      accessor: (row) =>
        typeof row.to === "object"
          ? row.to.departmentName || row.to.id
          : row.to,
      type: "text",
    },
    {
      key: "deviationRequestedBy",
      label: "Deviation Requested By",
      accessor: (row) =>
        typeof row.deviationRequestedBy === "object"
          ? row.deviationRequestedBy.employeeName ||
            row.deviationRequestedBy.id
          : row.deviationRequestedBy,
      type: "text",
    },
    {
      key: "customerId",
      label: "Customer",
      accessor: (row) =>
        typeof row.customerId === "object"
          ? row.customerId.customerName || row.customerId.id
          : row.customerName || row.customerId,
      type: "text",
    },
    {
      key: "productName",
      label: "Product Name",
      accessor: (row) => row.productName,
      type: "text",
    },
    {
      key: "partDescription",
      label: "Part Description",
      accessor: (row) => row.partDescription,
      type: "text",
    },
    {
      key: "partNoDrawingNo",
      label: "Part No / Drawing No",
      accessor: (row) => row.partNoDrawingNo,
      type: "text",
    },
    {
      key: "quantityReceived",
      label: "Qty Received",
      accessor: (row) => row.quantityReceived,
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
    "requestNo",
    "date",
    "to",
    "to.departmentName",
    "deviationRequestedBy",
    "deviationRequestedBy.employeeName",
    "customerId",
    "customerId.customerName",
    "customerName",
    "productName",
    "partDescription",
    "partNoDrawingNo",
    "quantityReceived",
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
      title="Engineering Deviation Request/Note"
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
      emptyMessage="No Engineering Deviation Requests found"
      loadingMessage="Loading Engineering Deviation Requests..."
      enableRefresh={true}
      onRefresh={loadRecords}
      enableExport={true}
      exportFileName="EngineeringDeviationRequests"
    />
  );
};

export default EngineeringDeviationRequestList;

import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import supplierChangeRequestAPI from "../../../api/TDC/supplierChangeRequestAPI";
import { toast } from "../../../utils/toast";

const SupplierChangeRequestList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data = await supplierChangeRequestAPI.getScrByOrgId(
        ORG_ID,
        BRANCH_ID,
      );
      data.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(data);
    } catch (error) {
      console.error("Failed to load supplier change requests:", error);
      setRecords([]);
      toast.error("Failed to fetch Supplier Change Requests");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const columns = [
    {
      key: "scrNo",
      label: "SCR No",
      accessor: (row) => row.scrNo,
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
      key: "plantId",
      label: "Plant",
      accessor: (row) =>
        typeof row.plantId === "object"
          ? row.plantId.branchName || row.plantId.id
          : row.plantName || row.plantId,
      type: "text",
    },
    {
      key: "vendorCode",
      label: "Vendor",
      accessor: (row) =>
        typeof row.vendorCode === "object"
          ? row.vendorCode.customerName || row.vendorCode.docId || row.vendorCode.id
          : row.supplierName || row.vendorCode,
      type: "text",
    },
    {
      key: "supplierName",
      label: "Supplier Name",
      accessor: (row) => row.supplierName,
      type: "text",
    },
    {
      key: "partNumber",
      label: "Part Number",
      accessor: (row) => row.partNumber,
      type: "text",
    },
    {
      key: "partDescription",
      label: "Part Description",
      accessor: (row) => row.partDescription,
      type: "text",
    },
    {
      key: "buyerName",
      label: "Buyer Name",
      accessor: (row) =>
        typeof row.buyerName === "object"
          ? row.buyerName.employeeName || row.buyerName.id
          : row.buyerName,
      type: "text",
    },
    {
      key: "sourceTriggeredBy",
      label: "Source/Process Triggered By",
      accessor: (row) =>
        typeof row.sourceTriggeredBy === "object"
          ? row.sourceTriggeredBy.employeeName || row.sourceTriggeredBy.id
          : row.sourceTriggeredBy,
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
    "scrNo",
    "date",
    "plantId",
    "plantId.branchName",
    "plantName",
    "vendorCode",
    "vendorCode.customerName",
    "supplierName",
    "partNumber",
    "partDescription",
    "buyerName",
    "buyerName.employeeName",
    "sourceTriggeredBy",
    "sourceTriggeredBy.employeeName",
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
      title="Supplier Change Request"
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
      emptyMessage="No Supplier Change Requests found"
      loadingMessage="Loading Supplier Change Requests..."
      enableRefresh={true}
      onRefresh={loadRecords}
      enableExport={true}
      exportFileName="SupplierChangeRequests"
    />
  );
};

export default SupplierChangeRequestList;

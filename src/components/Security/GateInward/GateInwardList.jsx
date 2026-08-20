import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";
import gateInwardAPI from "../../../api/Security/gateInwardAPI";

const GateInwardList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data = await gateInwardAPI.getByOrgId(ORG_ID, BRANCH_ID);
      data.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(data);
    } catch (error) {
      console.error("Failed to load gate inward entries:", error);
      setRecords([]);
      toast.error("Failed to fetch Gate Inward entries");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const columns = [
    {
      key: "gatePassNo",
      label: "Gate Pass No",
      accessor: (row) => row.gatePassNo || row.docId || row.docNumber,
      type: "text",
      noWrap: true,
    },
    {
      key: "date",
      label: "Date",
      accessor: (row) => row.date || row.docDate || row.entryDate,
      type: "text",
      noWrap: true,
    },
    {
      key: "branch",
      label: "Plant",
      accessor: (row) => row.branch?.branchName || row.plantName || row.branchId,
      type: "text",
    },
    {
      key: "customer",
      label: "Party Name",
      accessor: (row) => row.customer?.customerName || row.customerName || row.partyName,
      type: "text",
    },
    {
      key: "customerCode",
      label: "Party ID",
      accessor: (row) => row.customer?.customerCode || row.customerCode || row.partyId,
      type: "text",
    },
    {
      key: "address",
      label: "Address",
      accessor: (row) => row.address,
      type: "text",
    },
    {
      key: "docType",
      label: "Doc Type",
      accessor: (row) => row.docType,
      type: "text",
    },
    {
      key: "modvatCopyReceived",
      label: "Modvat Copy Received",
      accessor: (row) => row.modvatCopyReceived,
      type: "text",
    },
    {
      key: "supplierInvoiceNumber",
      label: "Supplier INV. No.",
      accessor: (row) => row.supplierInvoiceNumber || row.supplierInvNo,
      type: "text",
    },
    {
      key: "invoiceNumber",
      label: "Invoice No.",
      accessor: (row) => row.invoiceNumber || row.invoiceNo,
      type: "text",
    },
    {
      key: "supplierInvoiceDate",
      label: "Supplier INV. Date",
      accessor: (row) => row.supplierInvoiceDate || row.supplierInvDate,
      type: "text",
      noWrap: true,
    },
    {
      key: "timeOfEntry",
      label: "Time of Entry",
      accessor: (row) => row.timeOfEntry,
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
          className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        },
        Inactive: {
          label: "Inactive",
          className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
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
    "gatePassNo",
    "docId",
    "docNumber",
    "date",
    "docDate",
    "entryDate",
    "branch.branchName",
    "branchName",
    "customer.customerName",
    "customerName",
    "partyName",
    "customer.customerCode",
    "customerCode",
    "partyId",
    "docType",
    "supplierInvoiceNumber",
    "supplierInvNo",
    "invoiceNumber",
    "invoiceNo",
    "address",
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
      title="Gate Inward"
      subtitle="Manage Gate Inward Entries"
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
      emptyMessage="No Gate Inward entries found"
      loadingMessage="Loading Gate Inward entries..."
      enableRefresh={true}
      onRefresh={loadRecords}
      enableExport={true}
      exportFileName="GateInwardList"
    />
  );
};

export default GateInwardList;
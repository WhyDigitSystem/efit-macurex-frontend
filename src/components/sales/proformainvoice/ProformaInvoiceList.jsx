import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import proformaInvoiceAPI from "../../../api/Sales/proformaInvoiceAPI";
import { toast } from "../../../utils/toast";

const ProformaInvoiceList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data = await proformaInvoiceAPI.getProformaInvoiceByOrgId(
        ORG_ID,
        BRANCH_ID,
      );
      data.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(data);
    } catch (error) {
      console.error("Failed to load proforma invoices:", error);
      setRecords([]);
      toast.error("Failed to fetch Proforma Invoices");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const columns = [
    {
      key: "invoiceNo",
      label: "Invoice No",
      accessor: (row) =>
        row.invoiceNo || row.salesInvoiceNo || row.docNo,
      type: "text",
      noWrap: true,
    },
    {
      key: "invoiceDate",
      label: "Invoice Date",
      accessor: (row) => row.invoiceDate || row.date,
      type: "text",
      noWrap: true,
    },
    {
      key: "customerName",
      label: "Customer",
      accessor: (row) => row.customerName,
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
      key: "belongsTo",
      label: "Belongs To",
      accessor: (row) => row.belongsTo,
      type: "text",
    },
    {
      key: "grossAmount",
      label: "Gross Amount",
      accessor: (row) => row.grossAmount,
      type: "text",
      noWrap: true,
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
    "invoiceNo",
    "salesInvoiceNo",
    "docNo",
    "invoiceDate",
    "date",
    "customerName",
    "plantId",
    "plantId.branchName",
    "plantName",
    "belongsTo",
    "poNo",
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
      title="Proforma Invoice"
      subtitle="Manage Proforma Invoices"
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
      emptyMessage="No Proforma Invoices found"
      loadingMessage="Loading Proforma Invoices..."
      enableRefresh={true}
      onRefresh={loadRecords}
      enableExport={true}
      exportFileName="ProformaInvoices"
    />
  );
};

export default ProformaInvoiceList;
import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { rejectionInvoiceAPI } from "../../../api/Sales/rejectionInvoiceAPI";
import { toast } from "../../../utils/toast";

const RejectionInvoiceList = ({ onAddNew, onEdit, refreshTrigger, onBack }) => {
  const [invoiceData, setInvoiceData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");

  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);

      const invoices = await rejectionInvoiceAPI.getInvoiceByOrgId(ORG_ID);

      invoices.sort((a, b) => (b.id || 0) - (a.id || 0));

      setInvoiceData(invoices);
    } catch (error) {
      console.error("Failed to load rejection invoices:", error);
      setInvoiceData([]);
      toast.error("Failed to fetch Rejection Invoices");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices, refreshTrigger]);

  const columns = [
    {
      key: "rejectionInvoiceNo",
      label: "Rejection Invoice No",
      accessor: "rejectionInvoiceNo",
      type: "text",
    },
    {
      key: "invoiceDate",
      label: "Invoice Date",
      accessor: "invoiceDate",
      type: "text",
    },
    {
      key: "plantId",
      label: "Plant Id",
      accessor: "plantId",
      type: "text",
    },
    {
      key: "locationId",
      label: "Location ID",
      accessor: "locationId",
      type: "text",
    },
    {
      key: "docType",
      label: "Doc Type",
      accessor: "docType",
      type: "text",
    },
    {
      key: "customerCode",
      label: "Customer Code",
      accessor: "customerCode",
      type: "text",
    },
    {
      key: "customerName",
      label: "Customer Name",
      accessor: "customerName",
      type: "text",
    },
    {
      key: "invoiceType",
      label: "Invoice Type",
      accessor: "invoiceType",
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
    "rejectionInvoiceNo",
    "plantId",
    "locationId",
    "docType",
    "customerCode",
    "customerName",
    "invoiceType",
  ];

  const filterOptions = [
    {
      value: "all",
      label: "All",
      field: null,
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
      title="Rejection Invoice"
      data={invoiceData}
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
      emptyMessage="No Rejection Invoices found"
      loadingMessage="Loading Rejection Invoices..."
      enableRefresh={true}
      onRefresh={loadInvoices}
      enableExport={true}
      exportFileName="RejectionInvoices"
    />
  );
};

export default RejectionInvoiceList;

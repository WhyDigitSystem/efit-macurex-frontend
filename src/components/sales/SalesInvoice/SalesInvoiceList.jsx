import { useCallback, useEffect, useMemo, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";
import salesInvoiceAPI from "../../../api/Sales/salesInvoiceAPI";

const DOC_TYPE_INVOICE = "Invoice";
const DOC_TYPE_REJECTION = "Rejection";
const DOC_TYPE_OTHER_SALES = "Other Sales Invoice";

const DOC_TYPE_OPTIONS = [
  { key: DOC_TYPE_INVOICE, label: "Invoice" },
  { key: DOC_TYPE_REJECTION, label: "Rejection" },
  { key: DOC_TYPE_OTHER_SALES, label: "Other Sales Invoice" },
];

// Add "All" option for the filter
const FILTER_OPTIONS = [
  { key: "all", label: "All" },
  ...DOC_TYPE_OPTIONS,
];

/* Column sets mirror what's captured on each side of the form. */

const INVOICE_COLUMNS = [
  {
    key: "salesInvoiceNo",
    label: "Sales Invoice No",
    accessor: (row) => row.docId,
    type: "text",
  },
  {
    key: "invoiceDate",
    label: "Invoice Date",
    accessor: (row) => row.docDate,
    type: "date",
  },
  {
    key: "plant",
    label: "Plant Id",
    accessor: (row) => row.branch?.branchCode,
    type: "text",
  },
  {
    key: "locationId",
    label: "Location ID",
    accessor: (row) => row.location?.locationName,
    type: "text",
  },
  {
    key: "customerName",
    label: "Customer Name",
    accessor: (row) => row.customer?.customerName,
    type: "text",
  },
  {
    key: "invoiceType",
    label: "Invoice Type",
    accessor: (row) => row.docType,
    type: "text",
  },
  {
    key: "stockPosting",
    label: "Stock Posting?",
    accessor: (row) => row.stockPosting ? "Yes" : "No",
    type: "badge",
  },
  { key: "active", label: "Status", accessor: "active", type: "status" },
  {
    key: "actions",
    label: "Actions",
    type: "actions",
    align: "center",
    width: "90px",
  },
];

// Similar updates for REJECTION_COLUMNS and OTHER_SALES_COLUMNS
// ... (rest of the column definitions)

const REJECTION_COLUMNS = [
  {
    key: "rejectionInvoiceNo",
    label: "Rejection Invoice No",
    accessor: (row) => row.docId,
    type: "text",
  },
  {
    key: "invoiceDate",
    label: "Invoice Date",
    accessor: (row) => row.docDate,
    type: "date",
  },
  {
    key: "plant",
    label: "Plant Id",
    accessor: (row) => row.branch?.branchCode,
    type: "text",
  },
  {
    key: "locationId",
    label: "Location ID",
    accessor: (row) => row.location?.locationName,
    type: "text",
  },
  {
    key: "customerName",
    label: "Customer Name",
    accessor: (row) => row.customer?.customerName,
    type: "text",
  },
  {
    key: "refNo",
    label: "Ref No",
    accessor: (row) => row.refNo,
    type: "text",
  },
  {
    key: "supplierInvNo",
    label: "Supplier Inv No",
    accessor: (row) => row.supplierInvoiceNo,
    type: "text",
  },
  { key: "active", label: "Status", accessor: "active", type: "status" },
  {
    key: "actions",
    label: "Actions",
    type: "actions",
    align: "center",
    width: "90px",
  },
];

const OTHER_SALES_COLUMNS = [
  {
    key: "salesInvoiceNo",
    label: "Sales Invoice No",
    accessor: (row) => row.docId,
    type: "text",
  },
  {
    key: "invoiceDate",
    label: "Invoice Date",
    accessor: (row) => row.docDate,
    type: "date",
  },
  {
    key: "plant",
    label: "Plant Id",
    accessor: (row) => row.branch?.branchCode,
    type: "text",
  },
  {
    key: "monthYear",
    label: "Month Year",
    accessor: (row) => row.monthYear,
    type: "text",
  },
  {
    key: "customerName",
    label: "Customer Name",
    accessor: (row) => row.customer?.customerName,
    type: "text",
  },
  {
    key: "invoiceType",
    label: "Invoice Type",
    accessor: (row) => row.docType,
    type: "text",
  },
  {
    key: "stockPosting",
    label: "Stock Posting?",
    accessor: (row) => row.stockPosting ? "Yes" : "No",
    type: "badge",
  },
  { key: "active", label: "Status", accessor: "active", type: "status" },
  {
    key: "actions",
    label: "Actions",
    type: "actions",
    align: "center",
    width: "90px",
  },
];

const SEARCH_FIELDS_BY_TYPE = {
  [DOC_TYPE_INVOICE]: [
    "docId",
    "customer.customerName",
    "customer.customerCode",
  ],
  [DOC_TYPE_REJECTION]: [
    "docId",
    "customer.customerName",
    "refNo",
  ],
  [DOC_TYPE_OTHER_SALES]: [
    "docId",
    "customer.customerName",
    "customer.customerCode",
  ],
};

const COLUMNS_BY_TYPE = {
  [DOC_TYPE_INVOICE]: INVOICE_COLUMNS,
  [DOC_TYPE_REJECTION]: REJECTION_COLUMNS,
  [DOC_TYPE_OTHER_SALES]: OTHER_SALES_COLUMNS,
};

const TITLE_BY_TYPE = {
  [DOC_TYPE_INVOICE]: "Invoice",
  [DOC_TYPE_REJECTION]: "Rejection",
  [DOC_TYPE_OTHER_SALES]: "Other Sales Invoice",
};

const SalesInvoiceList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [invoiceData, setInvoiceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeDocType, setActiveDocType] = useState("all");

  const ORG_ID = Number(localStorage.getItem("orgId"));
  const BRANCH_ID = Number(localStorage.getItem("branchId")); // Add this

  const loadSalesInvoices = useCallback(async () => {
    try {
      setLoading(true);

      // Pass both orgId AND branchId
      const response = await salesInvoiceAPI.getSalesInvoiceByOrgId(ORG_ID, BRANCH_ID);

      // Extract the list from the response structure
      const invoiceList = response?.paramObjectsMap?.salesRejectionInvoiceList || [];

      const sortedData = invoiceList.sort(
        (a, b) => (b.id || 0) - (a.id || 0),
      );

      setInvoiceData(sortedData);
    } catch (error) {
      console.error("Failed to load sales invoices:", error);
      setInvoiceData([]);
      toast.error("Failed to fetch sales invoices");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadSalesInvoices();
  }, [loadSalesInvoices, refreshTrigger]);

  // Filter data based on active document type
  const filteredData = useMemo(() => {
    if (activeDocType === "all") {
      return invoiceData;
    }
    return invoiceData.filter(
      (row) => (row.docType || DOC_TYPE_INVOICE) === activeDocType,
    );
  }, [invoiceData, activeDocType]);

  // Determine which columns and search fields to use based on active filter
  const getColumns = () => {
    if (activeDocType === "all") {
      return COLUMNS_BY_TYPE[DOC_TYPE_INVOICE];
    }
    return COLUMNS_BY_TYPE[activeDocType] || COLUMNS_BY_TYPE[DOC_TYPE_INVOICE];
  };

  const getSearchFields = () => {
    if (activeDocType === "all") {
      return SEARCH_FIELDS_BY_TYPE[DOC_TYPE_INVOICE];
    }
    return SEARCH_FIELDS_BY_TYPE[activeDocType] || SEARCH_FIELDS_BY_TYPE[DOC_TYPE_INVOICE];
  };

  const getTitle = () => {
    if (activeDocType === "all") {
      return "All Sales Invoices";
    }
    return TITLE_BY_TYPE[activeDocType] || "Sales Invoices";
  };

  const columns = getColumns();
  const searchFields = getSearchFields();

  // Build filter options for the document type with "All" option
  const filterOptions = FILTER_OPTIONS.map((option) => ({
    value: option.key,
    label: option.label,
    field: null,
  }));

  // Handle filter change from CommonListViewTable
  const handleFilterChange = (filterValue) => {
    setActiveDocType(filterValue);
  };

  return (
    <div className="h-full flex flex-col">
      <CommonListViewTable
        title={getTitle()}
        data={filteredData}
        loading={loading}
        columns={columns}
        searchFields={searchFields}
        filterOptions={filterOptions}
        defaultFilter="all"
        filterLabel="Document Type"
        onFilterChange={handleFilterChange}
        onBack={onBack}
        onAddNew={onAddNew}
        onEdit={onEdit}
        onView={false}
        showSerialNumber={true}
        itemsPerPageOptions={[5, 10, 20, 50, 100]}
        defaultItemsPerPage={10}
        emptyMessage={`No ${getTitle().toLowerCase()} records found`}
        loadingMessage="Loading Sales Invoices..."
        enableRefresh={true}
        onRefresh={loadSalesInvoices}
        enableExport={true}
        exportFileName={`SalesInvoices_${activeDocType.replace(/\s+/g, "")}`}
      />
    </div>
  );
};

export default SalesInvoiceList;
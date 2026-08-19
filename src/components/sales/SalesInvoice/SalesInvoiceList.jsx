import { useCallback, useEffect, useMemo, useState } from "react";

import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const DOC_TYPE_INVOICE = "Invoice";
const DOC_TYPE_REJECTION = "Rejection";
const DOC_TYPE_OTHER_SALES = "Other Sales Invoice";

const DOC_TYPE_TABS = [
  { key: DOC_TYPE_INVOICE, label: "Invoice" },
  { key: DOC_TYPE_REJECTION, label: "Rejection" },
  { key: DOC_TYPE_OTHER_SALES, label: "Other Sales Invoice" },
];

/* Column sets mirror what's captured on each side of the form. */

const INVOICE_COLUMNS = [
  {
    key: "salesInvoiceNo",
    label: "Sales Invoice No",
    accessor: (row) => row.invoiceHeader?.salesInvoiceNo,
    type: "text",
  },
  {
    key: "invoiceDate",
    label: "Invoice Date",
    accessor: (row) => row.invoiceHeader?.invoiceDate,
    type: "date",
  },
  {
    key: "plant",
    label: "Plant Id",
    accessor: (row) => row.commonHeader?.plant,
    type: "text",
  },
  {
    key: "locationId",
    label: "Location ID",
    accessor: (row) => row.invoiceHeader?.locationId,
    type: "text",
  },
  {
    key: "customerName",
    label: "Customer Name",
    accessor: (row) => row.invoiceHeader?.customerName,
    type: "text",
  },
  {
    key: "invoiceType",
    label: "Invoice Type",
    accessor: (row) => row.invoiceHeader?.invoiceType,
    type: "text",
  },
  {
    key: "stockPosting",
    label: "Stock Posting?",
    accessor: (row) => row.invoiceHeader?.stockPosting,
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

const REJECTION_COLUMNS = [
  {
    key: "rejectionInvoiceNo",
    label: "Rejection Invoice No",
    accessor: (row) => row.rejectionHeader?.rejectionInvoiceNo,
    type: "text",
  },
  {
    key: "invoiceDate",
    label: "Invoice Date",
    accessor: (row) => row.rejectionHeader?.invoiceDate,
    type: "date",
  },
  {
    key: "plant",
    label: "Plant Id",
    accessor: (row) => row.commonHeader?.plant,
    type: "text",
  },
  {
    key: "locationId",
    label: "Location ID",
    accessor: (row) => row.rejectionHeader?.locationId,
    type: "text",
  },
  {
    key: "customerName",
    label: "Customer Name",
    accessor: (row) => row.rejectionHeader?.customerName,
    type: "text",
  },
  {
    key: "refNo",
    label: "Ref No",
    accessor: (row) => row.rejectionHeader?.refNo,
    type: "text",
  },
  {
    key: "supplierInvNo",
    label: "Supplier Inv No",
    accessor: (row) => row.rejectionHeader?.supplierInvNo,
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
    accessor: (row) => row.otherSalesHeader?.salesInvoiceNo,
    type: "text",
  },
  {
    key: "invoiceDate",
    label: "Invoice Date",
    accessor: (row) => row.otherSalesHeader?.invoiceDate,
    type: "date",
  },
  {
    key: "plant",
    label: "Plant Id",
    accessor: (row) => row.commonHeader?.plant,
    type: "text",
  },
  {
    key: "monthYear",
    label: "Month Year",
    accessor: (row) => row.otherSalesHeader?.monthYear,
    type: "text",
  },
  {
    key: "customerName",
    label: "Customer Name",
    accessor: (row) => row.otherSalesHeader?.customerName,
    type: "text",
  },
  {
    key: "invoiceType",
    label: "Invoice Type",
    accessor: (row) => row.otherSalesHeader?.invoiceType,
    type: "text",
  },
  {
    key: "stockPosting",
    label: "Stock Posting?",
    accessor: (row) => row.otherSalesHeader?.stockPosting,
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
    "invoiceHeader.salesInvoiceNo",
    "invoiceHeader.customerName",
    "invoiceHeader.customerCode",
  ],
  [DOC_TYPE_REJECTION]: [
    "rejectionHeader.rejectionInvoiceNo",
    "rejectionHeader.customerName",
    "rejectionHeader.refNo",
  ],
  [DOC_TYPE_OTHER_SALES]: [
    "otherSalesHeader.salesInvoiceNo",
    "otherSalesHeader.customerName",
    "otherSalesHeader.customerCode",
  ],
};

const COLUMNS_BY_TYPE = {
  [DOC_TYPE_INVOICE]: INVOICE_COLUMNS,
  [DOC_TYPE_REJECTION]: REJECTION_COLUMNS,
  [DOC_TYPE_OTHER_SALES]: OTHER_SALES_COLUMNS,
};

const SalesInvoiceList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [invoiceData, setInvoiceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeDocType, setActiveDocType] = useState(DOC_TYPE_INVOICE);

  const ORG_ID = Number(localStorage.getItem("orgId"));

  const loadSalesInvoices = useCallback(async () => {
    try {
      setLoading(true);

      const response = await salesInvoiceAPI.getSalesInvoiceByOrgId(ORG_ID);

      const sortedData = (response || []).sort(
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
  }, [ORG_ID]);

  useEffect(() => {
    loadSalesInvoices();
  }, [loadSalesInvoices, refreshTrigger]);

  // Rows without a saved docType (legacy data) default to Invoice, same as the form.
  const filteredData = useMemo(
    () =>
      invoiceData.filter(
        (row) =>
          (row.commonHeader?.docType || DOC_TYPE_INVOICE) === activeDocType,
      ),
    [invoiceData, activeDocType],
  );

  const columns = COLUMNS_BY_TYPE[activeDocType];
  const searchFields = SEARCH_FIELDS_BY_TYPE[activeDocType];

  return (
    <div className="h-full flex flex-col">
      {/* Doc Type tabs - same look as the form's child tabs */}
      <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 mb-2">
        {DOC_TYPE_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveDocType(tab.key)}
            className={`px-4 py-1 text-xs font-semibold rounded-t whitespace-nowrap ${
              activeDocType === tab.key
                ? "bg-blue-600 text-white"
                : "text-gray-600 dark:text-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <CommonListViewTable
        title={`${activeDocType}`}
        data={filteredData}
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
        emptyMessage={`No ${activeDocType} records found`}
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

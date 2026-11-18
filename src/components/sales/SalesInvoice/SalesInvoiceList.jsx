import { useCallback, useEffect, useMemo, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";
import salesInvoiceAPI from "../../../api/Sales/salesInvoiceAPI";
import generateSalesInvoicePDF from "./SalesInvoicePDF";
import PDFPreviewModal from "../../../utils/PDFPreviewModal";

const DOC_TYPE_INVOICE = "Invoice";
const DOC_TYPE_REJECTION = "Rejection";
const DOC_TYPE_OTHER_SALES = "Other Sales Invoice";

const DOC_TYPE_OPTIONS = [
  { key: DOC_TYPE_INVOICE, label: "Invoice" },
  { key: DOC_TYPE_REJECTION, label: "Rejection" },
  { key: DOC_TYPE_OTHER_SALES, label: "Other Sales Invoice" },
];

const FILTER_OPTIONS = [
  { key: "all", label: "All" },
  ...DOC_TYPE_OPTIONS,
];

const safeStr = (v) => {
  if (v === undefined || v === null) return "";
  const s = String(v).trim();
  return s.length === 0 ? "" : s;
};

const safeNum = (v) => {
  if (v === undefined || v === null || v === "") return 0;
  const n = Number(v);
  return isNaN(n) ? 0 : n;
};

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
    accessor: (row) => (row.stockPosting ? "Yes" : "No"),
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
    accessor: (row) => (row.stockPosting ? "Yes" : "No"),
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
  [DOC_TYPE_REJECTION]: ["docId", "customer.customerName", "refNo"],
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
  const [pdfPreview, setPdfPreview] = useState(null);

  const ORG_ID = Number(localStorage.getItem("orgId"));
  const BRANCH_ID = Number(localStorage.getItem("branchId"));

  const loadSalesInvoices = useCallback(async () => {
    try {
      setLoading(true);

      const response = await salesInvoiceAPI.getSalesInvoiceByOrgId(
        ORG_ID,
        BRANCH_ID,
      );

      const invoiceList =
        response?.paramObjectsMap?.salesRejectionInvoiceList || [];

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

  const filteredData = useMemo(() => {
    if (activeDocType === "all") {
      return invoiceData;
    }
    return invoiceData.filter(
      (row) => (row.docType || DOC_TYPE_INVOICE) === activeDocType,
    );
  }, [invoiceData, activeDocType]);

  /* =========================================================
     PDF DOWNLOAD
     ========================================================= */
  const handleDownloadPDF = async (row) => {
    try {
      // The row IS the raw record (data passed directly from invoiceData)
      const raw = row;

      const items = Array.isArray(raw.salesRejectionInvoiceDetails)
        ? raw.salesRejectionInvoiceDetails
        : [];

      const taxDetails = Array.isArray(raw.salesRejectionInvoiceTaxDetails)
        ? raw.salesRejectionInvoiceTaxDetails
        : [];

      const result = generateSalesInvoicePDF({
        company: {
          name: raw.branch?.branchName || "Company Name",
        },
        invoice: {
          docId: safeStr(raw.docId),
          docDate: raw.docDate || "",
          docType: safeStr(raw.docType),
          branchName: safeStr(raw.branch?.branchName),
          locationName: safeStr(raw.location?.locationName),
          vehicle: safeStr(raw.vehicle),

          customerName: safeStr(raw.customer?.customerName),
          customerCode: safeStr(raw.customer?.customerCode),
          customerGstNo: safeStr(raw.customer?.gstNo),
          customerGstState: safeStr(raw.customer?.gstState),
          customerGstType: safeStr(raw.customer?.gstType),
          shippingAddress: safeStr(raw.customer?.shippingAddress),
          shippingCity: safeStr(raw.customer?.shippingCity),
          shippingPincode: safeStr(raw.customer?.shippingPincode),

          currencyName: safeStr(raw.currency?.currencyName),
          scheduleNo: safeStr(raw.scheduleNo),
          scheduleDate: raw.scheduleDate || "",
          dispatchInstructionNo: safeStr(raw.dispatchInstructionNo),
          dispatchInstructionDate: raw.dispatchInstructionDate || "",
          timeOfIssue: safeStr(raw.timeOfIssue),
          timeOfRemoval: safeStr(raw.timeOfRemoval),
          modeOfTransport: safeStr(raw.modeOfTransport),

          refNo: safeStr(raw.refNo),
          supplierInvoiceNo: safeStr(raw.supplierInvoiceNo),
          kanbanCardNo: safeStr(raw.kanbanCardNo),
          purchaseOrder: safeStr(raw.purchaseOrder),
          purchaseOrderDate: raw.purchaseOrderDate || "",
          deliveryTo: safeStr(raw.deliveryTo),
          paymentTerms: safeStr(raw.paymentTerms),
          narration: safeStr(raw.narration),

          totalInsurance: safeNum(raw.totalInsurance),
          totalFreight: safeNum(raw.totalFreight),
          totalAssVal: safeNum(raw.totalAssVal),
          tcsAmount: safeNum(raw.tcsAmount),
          netAmount: safeNum(raw.netAmount),
          amountInWords: safeStr(raw.amountInWords),
          netWeight: safeNum(raw.netWeight),
          grossWeight: safeNum(raw.grossWeight),
          financialYear: safeStr(raw.financialYear),
          createdBy: safeStr(raw.createdBy),
        },
        items,
        taxDetails,
      });

      if (result?.blobUrl) {
        setPdfPreview(result);
      } else {
        toast.error("Failed to generate PDF preview");
      }
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF: " + error.message);
    }
  };

  const getColumns = () => {
    if (activeDocType === "all") {
      return COLUMNS_BY_TYPE[DOC_TYPE_INVOICE];
    }
    return (
      COLUMNS_BY_TYPE[activeDocType] || COLUMNS_BY_TYPE[DOC_TYPE_INVOICE]
    );
  };

  const getSearchFields = () => {
    if (activeDocType === "all") {
      return SEARCH_FIELDS_BY_TYPE[DOC_TYPE_INVOICE];
    }
    return (
      SEARCH_FIELDS_BY_TYPE[activeDocType] ||
      SEARCH_FIELDS_BY_TYPE[DOC_TYPE_INVOICE]
    );
  };

  const getTitle = () => {
    if (activeDocType === "all") {
      return "All Sales Invoices";
    }
    return TITLE_BY_TYPE[activeDocType] || "Sales Invoices";
  };

  const columns = getColumns();
  const searchFields = getSearchFields();

  const filterOptions = FILTER_OPTIONS.map((option) => ({
    value: option.key,
    label: option.label,
    field: null,
  }));

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
        onDownload={handleDownloadPDF}
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

      {pdfPreview && (
        <PDFPreviewModal
          blobUrl={pdfPreview.blobUrl}
          fileName={pdfPreview.fileName}
          onClose={() => {
            if (pdfPreview.blobUrl)
              URL.revokeObjectURL(pdfPreview.blobUrl);
            setPdfPreview(null);
          }}
        />
      )}
    </div>
  );
};

export default SalesInvoiceList;
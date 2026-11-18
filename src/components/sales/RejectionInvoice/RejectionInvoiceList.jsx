import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { rejectionInvoiceAPI } from "../../../api/Sales/rejectionInvoiceAPI";
import { toast } from "../../../utils/toast";
import generateRejectionInvoicePDF from "./RejectionInvoicePDF";
import PDFPreviewModal from "../../../utils/PDFPreviewModal";

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

const RejectionInvoiceList = ({ onAddNew, onEdit, refreshTrigger, onBack }) => {
  const [invoiceData, setInvoiceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfPreview, setPdfPreview] = useState(null);

  const ORG_ID = localStorage.getItem("orgId");

  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);

      const invoices = await rejectionInvoiceAPI.getInvoiceByOrgId(ORG_ID);
      const list = Array.isArray(invoices) ? invoices : [];
      list.sort((a, b) => (b.id || 0) - (a.id || 0));

      const wrapped = list.map((row) => ({ ...row, _raw: row }));
      setInvoiceData(wrapped);
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

  /* =========================================================
     PDF DOWNLOAD
     ========================================================= */
  const handleDownloadPDF = async (row) => {
    try {
      const raw = row._raw || row;

      const items = Array.isArray(raw.salesRejectionInvoiceDetails)
        ? raw.salesRejectionInvoiceDetails
        : [];

      const taxDetails = Array.isArray(raw.salesRejectionInvoiceTaxDetails)
        ? raw.salesRejectionInvoiceTaxDetails
        : [];

      const result = generateRejectionInvoicePDF({
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

  /* =========================================================
     COLUMNS
     ========================================================= */
  const columns = [
    {
      key: "docId",
      label: "Invoice No",
      accessor: (row) => row.docId || "-",
      type: "text",
      noWrap: true,
    },
    {
      key: "docDate",
      label: "Invoice Date",
      accessor: (row) => row.docDate || row.date || "",
      type: "date",
    },
    {
      key: "docType",
      label: "Doc Type",
      accessor: (row) => row.docType || "-",
      type: "text",
    },
    {
      key: "branchName",
      label: "Plant",
      accessor: (row) =>
        typeof row.branch === "object"
          ? row.branch.branchName || row.branch.id
          : row.branch || "-",
      type: "text",
    },
    {
      key: "locationName",
      label: "Location",
      accessor: (row) =>
        typeof row.location === "object"
          ? row.location.locationName || row.location.id
          : row.location || "-",
      type: "text",
    },
    {
      key: "customerCode",
      label: "Customer Code",
      accessor: (row) =>
        typeof row.customer === "object"
          ? row.customer.customerCode
          : row.customerCode || "-",
      type: "text",
    },
    {
      key: "customerName",
      label: "Customer Name",
      accessor: (row) =>
        typeof row.customer === "object"
          ? row.customer.customerName
          : row.customerName || "-",
      type: "text",
    },
    {
      key: "netAmount",
      label: "Net Amount",
      accessor: (row) => row.netAmount || 0,
      type: "currency",
      noWrap: true,
    },
    {
      key: "active",
      label: "Status",
      accessor: (row) => (row.active ? "Active" : "Inactive"),
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
    "docId",
    "docType",
    "branch.branchName",
    "location.locationName",
    "customer.customerCode",
    "customer.customerName",
    "netAmount",
    "vehicle",
    "supplierInvoiceNo",
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
    <>
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
        onDownload={handleDownloadPDF}
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
    </>
  );
};

export default RejectionInvoiceList;
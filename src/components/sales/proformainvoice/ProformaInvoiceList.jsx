import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import proformaInvoiceAPI from "../../../api/Sales/proformaInvoiceAPI";
import { useToast } from "../../Toast/ToastContext";
import generateProformaInvoicePDF from "../../../utils/generateProformaInvoicePDF";
import PDFPreviewModal from "../../../utils/PDFPreviewModal";

const ProformaInvoiceList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfPreview, setPdfPreview] = useState(null);
  const { addToast } = useToast();

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data = await proformaInvoiceAPI.getProformaInvoiceByOrgId(
        ORG_ID,
        BRANCH_ID,
      );
      // Sort by id descending (newest first)
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

  const handleDownloadPDF = async (row) => {
    try {
      const full = await proformaInvoiceAPI.getProformaInvoiceById(row.id);
      if (!full) {
        addToast("Invoice data not found", "error");
        return;
      }

      const items = (full.proformaInvoiceDetailsResponseDTO || []).map((item) => ({
        itemCode: item.item?.itemCode || "",
        customerPartNo: item.item?.customerPoNo || "",
        itemDescription: item.item?.itemDescription || "",
        hsCode: item.hsnCode || "",
        taxType: item.taxType || "",
        taxPercentage: item.taxPercentage || "",
        dispatchQty: item.despatchQty || "",
        unit: item.item?.unit?.unitId || "",
        orderRate: item.orderRate || "",
        amount: item.amount || "",
        sgstRate: item.sgstRate || "",
        sgstAmount: item.sgstAmount || "",
        cgstRate: item.cgstRate || "",
        cgstAmount: item.cgstAmount || "",
        igstRate: item.igstRate || "",
        igstAmount: item.igstAmount || "",
      }));

      const taxDetails = (full.proformaInvoiceTaxDetailsResponseDTO || []).map((tax) => ({
        particulars: tax.particulars || "",
        amount: tax.amount || 0,
      }));

      const result = generateProformaInvoicePDF({
        company: { name: full.branch?.branchName || row.branch || "Company Name" },
        invoice: {
          plantName: full.branch?.branchName || "",
          invoiceNo: full.docId || "",
          invoiceDate: full.docDate || "",
          customerName: full.customer?.customerName || "",
          customerCode: full.customer?.customerCode || "",
          belongsTo: full.belongsTo || "",
          poNo: full.purchaseOrderNo || "",
          poDate: full.purchaseOrderDate || "",
          gstnNo: full.customer?.customerGstNo || "",
          grossAmount: full.grossAmount || 0,
          kindAttention: full.kindAttention || "",
          designation: full.designation || "",
          isIgstApplicable: full.isIgstApplicable || "No",
        },
        items,
        taxDetails,
        terms: {
          insurance: full.insurance === 1 ? "Yes" : "No",
          freight: full.freight === 1 ? "Yes" : "No",
          noOfPkg: full.noOfPkg || "",
          pkgType: full.pkgType || "",
          modeOfTransport: full.modeOfTransport || "",
          rateOfDuty: full.rateOfDuty || "",
          tariffNo: full.tariffNo || "",
          basicValue: full.basicValue || 0,
          grossAmount: full.grossAmount || 0,
          amountInWords: full.amountInWords || "",
          deliveryTo: full.deliveryTo || "",
          paymentTerms: full.paymentTerms || "",
          paymentPercentage: full.paymentPercentage || "",
          narration: full.narration || "",
        },
      });

      if (result && result.blobUrl) {
        setPdfPreview(result);
      } else {
        addToast("Failed to generate PDF preview", "error");
      }
    } catch (error) {
      console.error("PDF generation failed:", error);
      addToast("Failed to generate PDF: " + error.message, "error");
    }
  };

  const columns = [
    {
      key: "docId",
      label: "Invoice No",
      accessor: (row) => row.docId || row.invoiceNo || row.salesInvoiceNo,
      type: "text",
      noWrap: true,
    },
    {
      key: "docDate",
      label: "Invoice Date",
      accessor: (row) => row.docDate || row.invoiceDate || row.date,
      type: "date",
      noWrap: true,
    },
    {
      key: "customer",
      label: "Customer",
      accessor: (row) => row.customer?.customerName || row.customerName,
      type: "text",
    },
    {
      key: "branch",
      label: "Plant",
      accessor: (row) => row.branch?.branchName || row.plantName || row.plantId,
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
    "docId",
    "invoiceNo",
    "salesInvoiceNo",
    "docDate",
    "invoiceDate",
    "date",
    "customer.customerName",
    "customerName",
    "branch.branchName",
    "plantName",
    "belongsTo",
    "purchaseOrderNo",
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
    <>
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
      onDownload={handleDownloadPDF}
    />

    {pdfPreview && (
      <PDFPreviewModal
        blobUrl={pdfPreview.blobUrl}
        fileName={pdfPreview.fileName}
        onClose={() => {
          URL.revokeObjectURL(pdfPreview.blobUrl);
          setPdfPreview(null);
        }}
      />
    )}
  </>
);
}
export default ProformaInvoiceList;
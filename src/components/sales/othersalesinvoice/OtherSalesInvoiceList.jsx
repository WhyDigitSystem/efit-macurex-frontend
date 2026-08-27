import { useCallback, useEffect, useRef, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import PDFPreviewModal from "../../../utils/PDFPreviewModal";
import otherSalesInvoiceAPI from "../../../api/Sales/otherSalesInvoiceAPI";
import { generateOtherSalesInvoicePDF } from "../../../utils/generateOtherSalesInvoicePDF";
import { useToast } from "../../Toast/ToastContext";

const normalizeActive = (value) => {
  if (value === true || value === "Yes" || value === "Active") return true;
  return false;
};

const OtherSalesInvoiceList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfPreview, setPdfPreview] = useState({ open: false, blobUrl: null, fileName: "" });
  const { addToast } = useToast();
  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
  const BRANCH = Number(localStorage.getItem("branchId")) || 1000000001;
  const prevRefreshRef = useRef(refreshTrigger);

  const loadData = useCallback(async () => {
    if (!ORG_ID) return;
    setLoading(true);
    try {
      const res = await otherSalesInvoiceAPI.getAll(ORG_ID, BRANCH);
      const sorted = (res || []).sort((a, b) => (b.id || 0) - (a.id || 0));
      setData(sorted);
    } catch (error) {
      console.error("Failed to load Other Sales Invoice records:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (prevRefreshRef.current !== refreshTrigger) {
      prevRefreshRef.current = refreshTrigger;
      loadData();
    }
  }, [refreshTrigger, loadData]);

  const handleDownloadPDF = async (row) => {
    try {
      const fullData = await otherSalesInvoiceAPI.getById(row.id);
      if (!fullData) {
        addToast("Invoice data not found", "error");
        return;
      }
      const pdfData = {
        invoice: {
          salesInvoiceNo:  fullData.salesInvoiceNo,
          invoiceDate:     fullData.invoiceDate,
          plantId:         fullData.plantId,
          customerName:    fullData.customerName,
          customerCode:    fullData.customerCode,
          belongsTo:       fullData.belongsTo,
          currency:        fullData.currency,
          grossAmount:     fullData.grossAmount,
          docType:         fullData.docType,
          invoiceType:     fullData.invoiceType,
          gstnNo:          fullData.gstnNo,
          vehicle:         fullData.vehicle,
          isIgstApplicable: fullData.isIgstApplicable,
          timeOfIssue:     fullData.timeOfIssue,
          timeOfRemoval:   fullData.timeOfRemoval,
          exchangeRate:    fullData.exchangeRate,
          monthYear:       fullData.monthYear,
        },
        items:     fullData.itemDetails  || [],
        taxDetails: fullData.taxDetails  || [],
        terms: {
          totalInsurance:        fullData.totalInsurance,
          totalFreight:          fullData.totalFreight,
          totalAssessableValue:  fullData.totalAssessableValue,
          modeOfTransport:       fullData.modeOfTransport,
          salesTax:              fullData.salesTax,
          grossAmount:           fullData.grossAmount,
          amountInWords:         fullData.amountInWords,
          deliveryTo:            fullData.deliveryTo,
          paymentTerms:          fullData.paymentTerms,
          narration:             fullData.narration,
        },
      };
      const { blobUrl, fileName } = generateOtherSalesInvoicePDF(pdfData);
      setPdfPreview({ open: true, blobUrl, fileName });
    } catch (error) {
      console.error("PDF generation error:", error);
      addToast("Failed to generate PDF", "error");
    }
  };

  const columns = [
    { key: "salesInvoiceNo", label: "Invoice No",  accessor: "salesInvoiceNo", type: "text",    noWrap: true },
    { key: "invoiceDate",    label: "Invoice Date", accessor: "invoiceDate",    type: "date",    noWrap: true },
    { key: "customerName",   label: "Customer",     accessor: "customerName",   type: "text" },
    { key: "plantId",        label: "Plant",        accessor: "plantId",        type: "text" },
    { key: "belongsTo",      label: "Belongs To",   accessor: "belongsTo",      type: "text" },
    { key: "currency",       label: "Currency",     accessor: "currency",       type: "text",    noWrap: true },
    { key: "grossAmount",    label: "Gross Amount", accessor: "grossAmount",    type: "text",    noWrap: true },
    {
      key: "active", label: "Status", accessor: "active",
      render: (value) => {
        const isActive = normalizeActive(value);
        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
            isActive
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
          }`}>
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    { key: "actions", label: "Actions", type: "actions", align: "center", width: "90px" },
  ];

  const searchFields = ["salesInvoiceNo", "customerName", "plantId", "belongsTo"];

  const filterOptions = [
    { value: "all",      label: "All",      filterFn: () => true },
    { value: "active",   label: "Active",   filterFn: (item) => normalizeActive(item.active) },
    { value: "inactive", label: "Inactive", filterFn: (item) => !normalizeActive(item.active) },
  ];

  return (
    <>
      <CommonListViewTable
        title="Other Sales Invoice"
        subtitle="Manage Other Sales Invoices"
        data={data}
        loading={loading}
        columns={columns}
        searchFields={searchFields}
        filterOptions={filterOptions}
        defaultFilter="all"
        onBack={onBack}
        onAddNew={onAddNew}
        onEdit={(row) => onEdit(row)}
        onDownload={handleDownloadPDF}
        onView={false}
        showSerialNumber={true}
        itemsPerPageOptions={[5, 10, 20, 50, 100]}
        defaultItemsPerPage={10}
        emptyMessage="No Other Sales Invoice records found"
        loadingMessage="Loading Other Sales Invoice records..."
        enableRefresh={true}
        onRefresh={loadData}
        enableExport={true}
        exportFileName="OtherSalesInvoice"
      />
      <PDFPreviewModal
        isOpen={pdfPreview.open}
        onClose={() => { URL.revokeObjectURL(pdfPreview.blobUrl); setPdfPreview({ open: false, blobUrl: null, fileName: "" }); }}
        blobUrl={pdfPreview.blobUrl}
        fileName={pdfPreview.fileName}
      />
    </>
  );
};

export default OtherSalesInvoiceList;

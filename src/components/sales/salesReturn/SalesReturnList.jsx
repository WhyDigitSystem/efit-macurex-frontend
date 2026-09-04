import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import salesReturnAPI from "../../../api/Sales/salesReturnAPI";
import { useToast } from "../../Toast/ToastContext";
import generateSalesReturnPDF from "../../../utils/generateSalesReturnPDF";
import PDFPreviewModal from "../../../utils/PDFPreviewModal";

const SalesReturnList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [itemData, setItemData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfPreview, setPdfPreview] = useState(null);
  const { addToast } = useToast();

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await salesReturnAPI.getSalesReturnByOrgId(ORG_ID, BRANCH_ID);

      const list =
        response?.paramObjectsMap?.salesReturn ||
        response?.paramObjectsMap?.salesReturnList ||
        response?.paramObjectsMap?.salesReturnResponseVO ||
        [];

      const transformed = Array.isArray(list)
        ? list.map((item) => ({
            id: item.id,
            docNo: item.docNo || item.salesReturnNo || item.docId || "",
            date: item.date || item.salesReturnDate || item.docDate || "",
            customerName: item.customerName || item.customer?.customerName || "",
            customerCode: item.customerCode || item.customer?.customerCode || "",
            plantName: item.branchName || item.branch?.branchName || "",
            returnType: item.returnType || "",
            invoiceNo: item.invoiceNo || "",
            currency: item.currency?.currencyName || item.currency || "INR",
            netAmount: item.netAmount || item.totalAmount || 0,
            active: item.active,
            _raw: item,
          }))
        : [];

      transformed.sort((a, b) => (b.id || 0) - (a.id || 0));
      setItemData(transformed);
    } catch (error) {
      console.error("Error loading sales returns:", error);
      setItemData([]);
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadItems();
  }, [loadItems, refreshTrigger]);

  const handleDownloadPDF = async (row) => {
    try {
      const raw = row._raw || {};

      const items = (raw.salesReturnItemDetailsDTO || []).map((item) => ({
        itemCode: item.item?.itemCode || item.itemCode || "",
        itemDescription: item.item?.itemDescription || item.itemDescription || "",
        hsCode: item.hsnCode || item.hsCode || "",
        taxType: item.taxType || "",
        taxPercentage: item.taxPercentage || "",
        unit: item.unit || "",
        stock: item.stock || 0,
        qtySold: item.qtySold || 0,
        receivedQty: item.receivedQty || item.qty || 0,
        rate: item.rate || 0,
        rateInCurrency: item.rateInCurrency || 0,
        amountInCurrency: item.amountInCurrency || 0,
        amount: item.amount || 0,
      }));

      const taxDetails = (raw.salesReturnTaxDetailsDTO || []).map((tax) => ({
        sgstRate: tax.sgstRate || 0,
        sgstAmount: tax.sgstAmount || 0,
        cgstRate: tax.cgstRate || 0,
        cgstAmount: tax.cgstAmount || 0,
        igstRate: tax.igstRate || 0,
        igstAmount: tax.igstAmount || 0,
      }));

      const result = generateSalesReturnPDF({
        company: { name: row.plantName || "Company Name" },
        salesReturn: {
          docNo: row.docNo || "",
          date: row.date || "",
          customerName: row.customerName || "",
          customerCode: row.customerCode || "",
          plantName: row.plantName || "",
          returnType: row.returnType || "",
          invoiceNo: row.invoiceNo || "",
          currency: row.currency || "INR",
          netAmount: row.netAmount || 0,
          belongsTo: raw.belongsTo || "",
          partyGSTState: raw.partyGSTState || "",
          isIGSTApplicable: raw.isIgstApplicable || raw.isIGSTApplicable || "No",
          amountInWords: raw.amountInWords || "",
          narration: raw.narration || "",
        },
        items,
        taxDetails,
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
      key: "docNo",
      label: "Doc No",
      accessor: "docNo",
      type: "text",
      noWrap: true,
    },
    {
      key: "date",
      label: "Date",
      accessor: "date",
      type: "date",
      noWrap: true,
    },
    {
      key: "customerName",
      label: "Customer",
      accessor: "customerName",
      type: "text",
    },
    {
      key: "plantName",
      label: "Plant",
      accessor: "plantName",
      type: "text",
    },
    {
      key: "returnType",
      label: "Return Type",
      accessor: "returnType",
      type: "text",
    },
    {
      key: "invoiceNo",
      label: "Invoice No",
      accessor: "invoiceNo",
      type: "text",
    },
    {
      key: "currency",
      label: "Currency",
      accessor: "currency",
      type: "text",
    },
    {
      key: "netAmount",
      label: "Net Amount",
      accessor: "netAmount",
      type: "currency",
      noWrap: true,
    },
    {
      key: "active",
      label: "Status",
      accessor: "active",
      type: "status",
      statusVariants: {
        Active: { label: "Active", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
        Inactive: { label: "Inactive", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
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

  const searchFields = ["docNo", "customerName", "customerCode", "plantName", "invoiceNo", "returnType"];

  const filterOptions = [
    { value: "all", label: "All", field: null },
    { value: "active", label: "Active", field: "active", filterValue: "active", activeValue: "Active" },
    { value: "inactive", label: "Inactive", field: "active", filterValue: "inactive", activeValue: "Active" },
  ];

  return (
    <>
      <CommonListViewTable
        title="Sales Return"
        data={itemData}
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
        emptyMessage="No Sales Returns found"
        loadingMessage="Loading Sales Returns..."
        enableRefresh={true}
        onRefresh={loadItems}
        enableExport={true}
        exportFileName="SalesReturns"
      />

      {pdfPreview && (
        <PDFPreviewModal
          blobUrl={pdfPreview.blobUrl}
          fileName={pdfPreview.fileName}
          onClose={() => {
            if (pdfPreview.blobUrl) URL.revokeObjectURL(pdfPreview.blobUrl);
            setPdfPreview(null);
          }}
        />
      )}
    </>
  );
};

export default SalesReturnList;

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
      const response = await salesReturnAPI.getSalesReturnByOrgId(
        ORG_ID,
        BRANCH_ID,
      );

      const list =
        response?.paramObjectsMap?.salesReturnList ||
        response?.paramObjectsMap?.salesReturnResponseVO ||
        [];

      const transformed = Array.isArray(list)
        ? list.map((item) => ({
            id: item.id,
            salesReturnNo: item.salesReturnNo || item.docId || "",
            salesReturnDate: item.salesReturnDate || item.docDate || "",
            customerName: item.customerName || item.customer?.customerName || "",
            customerCode: item.customerCode || item.customer?.customerCode || "",
            plantName: item.branchName || item.branch?.branchName || "",
            invoiceNo: item.invoiceNo || "",
            invoiceDate: item.invoiceDate || "",
            totalAmount: item.totalAmount || 0,
            active: item.active,
            _raw: item,
          }))
        : [];

      transformed.sort((a, b) => (b.id || 0) - (a.id || 0));
      setItemData(transformed);
    } catch (error) {
      console.error("Error loading sales returns:", error);
      setItemData([]);
      addToast("Failed to fetch Sales Returns", "error");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadItems();
  }, [loadItems, refreshTrigger]);

  const handleDownloadPDF = (row) => {
    try {
      const raw = row._raw || {};

      const items = (
        raw.salesReturnItemDetailsDTO ||
        raw.salesReturnDetails ||
        []
      ).map((item) => ({
        itemCode: item.itemCode || item.item?.itemCode || "",
        itemDescription: item.itemDescription || item.item?.itemDescription || "",
        unit: item.unit || "",
        qty: item.qty || 0,
        rate: item.rate || 0,
        amount: item.amount || 0,
        returnReason: item.returnReason || "",
      }));

      const taxDetails = (
        raw.salesReturnTaxDetailsDTO ||
        raw.taxDetails ||
        []
      ).map((tax) => ({
        particulars: tax.particulars || "",
        amount: tax.amount || 0,
      }));

      const result = generateSalesReturnPDF({
        company: { name: row.plantName || "Company Name" },
        salesReturn: {
          salesReturnNo: row.salesReturnNo || "",
          salesReturnDate: row.salesReturnDate || "",
          customerName: row.customerName || "",
          customerCode: row.customerCode || "",
          plantName: row.plantName || "",
          invoiceNo: row.invoiceNo || "",
          invoiceDate: row.invoiceDate || "",
          totalAmount: row.totalAmount || 0,
          remarks: raw.remarks || "",
          preparedBy: raw.preparedBy || "",
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
      key: "salesReturnNo",
      label: "Sales Return No",
      accessor: "salesReturnNo",
      type: "text",
    },
    {
      key: "salesReturnDate",
      label: "Date",
      accessor: "salesReturnDate",
      type: "date",
    },
    {
      key: "customerName",
      label: "Customer",
      accessor: "customerName",
      type: "text",
    },
    {
      key: "customerCode",
      label: "Customer Code",
      accessor: "customerCode",
      type: "text",
    },
    {
      key: "plantName",
      label: "Plant",
      accessor: "plantName",
      type: "text",
    },
    {
      key: "invoiceNo",
      label: "Invoice No",
      accessor: "invoiceNo",
      type: "text",
    },
    {
      key: "totalAmount",
      label: "Total Amount",
      accessor: "totalAmount",
      type: "currency",
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
    "salesReturnNo",
    "customerName",
    "customerCode",
    "plantName",
    "invoiceNo",
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

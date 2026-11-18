import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import proformaInvoiceAPI from "../../../api/Sales/proformaInvoiceAPI";
import { useToast } from "../../Toast/ToastContext";
import generateProformaInvoicePDF from "./ProformaInvoicePDF";
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
      const list = Array.isArray(data) ? data : [];
      list.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(list);
    } catch (error) {
      console.error("Failed to load proforma invoices:", error);
      setRecords([]);
      addToast("Failed to fetch Proforma Invoices", "error");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID, addToast]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  /* =========================================================
     PDF DOWNLOAD
     ========================================================= */
  const handleDownloadPDF = async (row) => {
    try {
      const full = await proformaInvoiceAPI.getProformaInvoiceById(row.id);
      if (!full) {
        addToast("Invoice data not found", "error");
        return;
      }

      const items = (full.proformaInvoiceDetailsResponseDTO || []).map(
        (item) => {
          const itemMaster = item.item || {};
          const unitObj = itemMaster.unit || {};

          return {
            itemCode: safeStr(itemMaster.itemCode),
            customerPartNo: safeStr(itemMaster.customerPoNo),
            itemDescription: safeStr(itemMaster.itemDescription),
            hsCode: safeStr(item.hsnCode || itemMaster.hsnCode),
            taxType: safeStr(item.taxType),
            taxPercentage: safeNum(item.taxPercentage),
            dispatchQty: safeNum(item.despatchQty),
            unit:
              typeof unitObj === "object"
                ? safeStr(
                  unitObj.unitId ||
                  unitObj.unitDescription ||
                  unitObj.id,
                )
                : safeStr(unitObj),
            orderRate: safeNum(item.orderRate),
            amount: safeNum(item.amount),
            sgstRate: safeNum(item.sgstRate),
            sgstAmount: safeNum(item.sgstAmount),
            cgstRate: safeNum(item.cgstRate),
            cgstAmount: safeNum(item.cgstAmount),
            igstRate: safeNum(item.igstRate),
            igstAmount: safeNum(item.igstAmount),
          };
        },
      );

      const taxDetails = (
        full.proformaInvoiceTaxDetailsResponseDTO || []
      ).map((tax) => {
        let particulars = tax.particulars;
        if (particulars && typeof particulars === "object") {
          particulars = particulars.description || particulars.code || "";
        }
        return {
          particulars: safeStr(particulars),
          amount: safeNum(tax.amount),
        };
      });

      const result = generateProformaInvoicePDF({
        company: {
          name:
            full.branch?.branchName ||
            row.branch ||
            "Company Name",
        },
        invoice: {
          plantName: safeStr(full.branch?.branchName),
          invoiceNo: safeStr(full.docId),
          invoiceDate: full.docDate || "",
          customerName: safeStr(full.customer?.customerName),
          customerCode: safeStr(full.customer?.customerCode),
          belongsTo: safeStr(full.belongsTo),
          poNo: safeStr(full.purchaseOrderNo),
          poDate: full.purchaseOrderDate || "",
          gstnNo: safeStr(full.customer?.customerGstNo),
          grossAmount: safeNum(full.grossAmount),
          kindAttention: safeStr(full.kindAttention),
          designation: safeStr(full.designation),
          isIgstApplicable:
            full.customer?.gstApproval === "Yes" ? "Yes" : "No",
        },
        items,
        taxDetails,
        terms: {
          insurance:
            safeNum(full.insurance) > 0 ||
              full.insurance === "Yes" ||
              full.insurance === true
              ? "Yes"
              : "No",
          freight:
            safeNum(full.freight) > 0 ||
              full.freight === "Yes" ||
              full.freight === true
              ? "Yes"
              : "No",
          noOfPkg: safeStr(full.noOfPkg),
          pkgType: safeStr(full.pkgType),
          modeOfTransport: safeStr(full.modeOfTransport),
          rateOfDuty: safeStr(full.rateOfDuty),
          tariffNo: safeStr(full.tariffNo),
          basicValue: safeNum(full.basicValue),
          grossAmount: safeNum(full.grossAmount),
          amountInWords: safeStr(full.amountInWords),
          deliveryTo: safeStr(full.deliveryTo),
          paymentTerms: safeStr(full.paymentTerms),
          paymentPercentage: safeStr(full.paymentPercentage),
          narration: safeStr(full.narration),
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

  /* =========================================================
     COLUMNS
     ========================================================= */
  const columns = [
    {
      key: "docId",
      label: "Invoice No",
      accessor: (row) =>
        row.docId || row.invoiceNo || row.salesInvoiceNo,
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
      accessor: (row) =>
        row.customer?.customerName || row.customerName,
      type: "text",
    },
    {
      key: "branch",
      label: "Plant",
      accessor: (row) =>
        row.branch?.branchName || row.plantName || row.plantId,
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
      type: "currency",
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
            if (pdfPreview.blobUrl)
              URL.revokeObjectURL(pdfPreview.blobUrl);
            setPdfPreview(null);
          }}
        />
      )}
    </>
  );
};

export default ProformaInvoiceList;
import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import salesReturnAPI from "../../../api/Sales/salesReturnAPI";
import { useToast } from "../../Toast/ToastContext";
import generateSalesReturnPDF from "./SalesReturnPDF";
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
        response?.paramObjectsMap?.salesReturn ||
        response?.paramObjectsMap?.salesReturnList ||
        response?.paramObjectsMap?.salesReturnResponseVO ||
        [];

      const transformed = Array.isArray(list)
        ? list.map((item) => ({
          id: item.id,
          docNo: item.docId || item.docNo || item.salesReturnNo || "",
          date: item.date || item.docDate || item.salesReturnDate || "",
          customerName:
            item.customer?.customerName || item.customerName || "",
          customerCode:
            item.customer?.customerCode || item.customerCode || "",
          plantName:
            item.branch?.branchName || item.branchName || "",
          returnType: item.returnType || "",
          invoiceNo: item.invoiceNo || "",
          currency:
            item.currency?.currencyName || item.currency || "INR",
          netAmount: safeNum(item.netAmount ?? item.totalAmount),
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

      // ✅ Correct key: salesReturnDetails (not salesReturnItemDetailsDTO)
      const srcItems =
        raw.salesReturnDetails ||
        raw.salesReturnItemDetailsDTO ||
        raw.items ||
        [];

      const items = srcItems.map((item) => {
        const itemMaster = item.item || {};

        // Unit: prefer row-level unit, fall back to item-master unit
        const unitObj =
          (item.unit && typeof item.unit === "object" ? item.unit : null) ||
          (itemMaster.unit && typeof itemMaster.unit === "object"
            ? itemMaster.unit
            : null);
        const unitLabel = unitObj
          ? safeStr(
            unitObj.unitId || unitObj.unitDescription || unitObj.id,
          )
          : typeof item.unit === "string"
            ? safeStr(item.unit)
            : safeStr(item.unitId);

        // Tax %: can be a string "12", a number, or an object
        let taxPct = 0;
        if (
          item.taxPercentage &&
          typeof item.taxPercentage === "object"
        ) {
          taxPct = safeNum(item.taxPercentage.taxPercentage);
        } else {
          taxPct = safeNum(item.taxPercentage);
        }

        return {
          itemCode: safeStr(itemMaster.itemCode || item.itemCode),
          itemDescription: safeStr(
            itemMaster.itemDescription || item.itemDescription,
          ),
          hsCode: safeStr(
            item.hsnSacCode || item.hsnCode || item.hsCode,
          ),
          taxType: safeStr(item.taxType),
          taxPercentage: taxPct,
          unit: unitLabel,
          stock: safeNum(item.stock),
          qtySold: safeNum(item.qtySold),
          receivedQty: safeNum(item.receivedQty || item.qty),
          rate: safeNum(item.rate),
          rateInCurrency: safeNum(
            item.rateInSelectedCurrency || item.rateInCurrency,
          ),
          amountInCurrency: safeNum(
            item.amountInSelectedCurrency || item.amountInCurrency,
          ),
          amount: safeNum(item.amount),
          sgstRate: safeNum(item.sgstRate),
          sgstAmount: safeNum(item.sgstAmount),
          cgstRate: safeNum(item.cgstRate),
          cgstAmount: safeNum(item.cgstAmount),
          igstRate: safeNum(item.igstRate),
          igstAmount: safeNum(item.igstAmount),
        };
      });

      // ✅ Correct key: salesReturnTaxDetails (not salesReturnTaxDetailsDTO)
      const srcTax =
        raw.salesReturnTaxDetails ||
        raw.salesReturnTaxDetailsDTO ||
        raw.taxDetails ||
        [];

      const taxDetails = srcTax.map((tax) => ({
        particulars: safeStr(tax.particulars),
        amount: safeNum(tax.amount),
        glAccountName: safeStr(tax.glAccountName),
        sgstRate: safeNum(tax.sgstRate),
        sgstAmount: safeNum(tax.sgstAmount),
        cgstRate: safeNum(tax.cgstRate),
        cgstAmount: safeNum(tax.cgstAmount),
        igstRate: safeNum(tax.igstRate),
        igstAmount: safeNum(tax.igstAmount),
      }));

      const result = generateSalesReturnPDF({
        company: {
          name:
            raw.branch?.branchName || row.plantName || "Company Name",
        },
        salesReturn: {
          docNo: raw.docId || row.docNo || "",
          date: raw.date || raw.docDate || row.date || "",
          customerName:
            raw.customer?.customerName || row.customerName || "",
          customerCode:
            raw.customer?.customerCode || row.customerCode || "",
          plantName: raw.branch?.branchName || row.plantName || "",
          returnType: raw.returnType || row.returnType || "",
          invoiceNo: raw.invoiceNo || row.invoiceNo || "",
          currency:
            raw.currency?.currencyName || row.currency || "INR",
          netAmount: safeNum(raw.netAmount ?? row.netAmount),
          belongsTo: raw.belongsTo || "",
          partyGSTState: raw.customer?.gstState || "",
          isIGSTApplicable:
            raw.igstApplicable === true ||
              raw.customer?.igstApplicable === true
              ? "Yes"
              : "No",
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
    "docNo",
    "customerName",
    "customerCode",
    "plantName",
    "invoiceNo",
    "returnType",
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
            if (pdfPreview.blobUrl)
              URL.revokeObjectURL(pdfPreview.blobUrl);
            setPdfPreview(null);
          }}
        />
      )}
    </>
  );
};

export default SalesReturnList;
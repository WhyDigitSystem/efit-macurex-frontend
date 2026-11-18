import { useCallback, useEffect, useRef, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import PDFPreviewModal from "../../../utils/PDFPreviewModal";
import stockTransferChallanAPI from "../../../api/Sales/stockTranferChallanAPI";
import { generateStockTransferChallanPDF } from "./StockTransferChallanPDF";
import { useToast } from "../../Toast/ToastContext";

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

const normalizeActive = (value) => {
  if (value === true || value === "Yes" || value === "Active") return true;
  return false;
};

const StockTransferChallanList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfPreview, setPdfPreview] = useState({
    open: false,
    blobUrl: null,
    fileName: "",
  });
  const { addToast } = useToast();
  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
  const BRANCH = Number(localStorage.getItem("branchId")) || 0;
  const prevRefreshRef = useRef(refreshTrigger);

  const loadData = useCallback(async () => {
    if (!ORG_ID) return;
    setLoading(true);
    try {
      const res = await stockTransferChallanAPI.getStockTransferChallanByOrgId(
        ORG_ID,
        BRANCH,
      );
      const sorted = (res || []).sort((a, b) => (b.id || 0) - (a.id || 0));
      setData(sorted);
    } catch (error) {
      console.error("Failed to load Stock Transfer Challan records:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (prevRefreshRef.current !== refreshTrigger) {
      prevRefreshRef.current = refreshTrigger;
      loadData();
    }
  }, [refreshTrigger, loadData]);

  /* =========================================================
     PDF DOWNLOAD
     ========================================================= */
  const handleDownloadPDF = async (row) => {
    try {
      const fullData = await stockTransferChallanAPI.getStockTransferChallanById(
        row.id,
      );
      if (!fullData) {
        addToast("Stock Transfer Challan data not found", "error");
        return;
      }

      const items = (fullData.stockTransferChallanDetailsResponseDTO || []).map(
        (item) => {
          const itemMaster = item.item || {};

          // ✅ Correct: itemCode is a STRING on the item master
          const itemCode = safeStr(
            itemMaster.itemCode || item.itemCode || itemMaster.id,
          );
          const itemDescription = safeStr(
            itemMaster.itemDescription || item.itemDescription,
          );

          // ✅ Correct: unit comes from itemMaster.unit.unitId, not .id
          let unit = "-";
          if (itemMaster.unit && typeof itemMaster.unit === "object") {
            unit = safeStr(
              itemMaster.unit.unitId ||
              itemMaster.unit.unitDescription ||
              itemMaster.unit.id,
            );
          } else if (item.unit) {
            unit =
              typeof item.unit === "object"
                ? safeStr(item.unit.unitId || item.unit.id)
                : safeStr(item.unit);
          }

          const qty = safeNum(item.quantity);
          const rate = safeNum(item.rate);
          const amount =
            safeNum(item.totalAssessableValue) || qty * rate;

          return {
            itemCode,
            itemDescription,
            hsnSacCode: safeStr(item.hsnCode),
            taxType: safeStr(item.taxType),
            taxPerc: safeStr(item.taxPercentage),
            unit,
            stock: safeNum(item.stock),
            qty,
            rate,
            totalAssessableValue: amount,
            amount,
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
        fullData.stockTransferChallanTaxDetailsResponseDTO || []
      ).map((t) => ({
        particulars: safeStr(t.particularsDesc || t.particulars),
        acceptedQtyAmount: safeNum(t.acceptQtyAmount),
        revisedAmount: safeNum(t.revisedAmoount || t.revisedAmount),
      }));

      const pdfData = {
        invoice: {
          docId: safeStr(fullData.docId),
          transferDate:
            fullData.docDate || fullData.date || "",
          plantName: safeStr(
            fullData.branch?.branchName || fullData.branch?.id,
          ),
          plantId: safeStr(fullData.branch?.id),
          customerName: safeStr(fullData.customer?.customerName),
          customerId: safeStr(fullData.customer?.customerId),
          locationName: safeStr(fullData.location?.locationName),
          locationId: safeStr(fullData.location?.id),
          type: safeStr(
            fullData.types?.listDescription ||
            fullData.types?.valuesDescription ||
            fullData.types?.id,
          ),
          timeOfTransfer: safeStr(
            fullData.timeOfTranfer || fullData.timeOfTransfer,
          ),
          stockPosting: safeStr(fullData.stockPosting),
          noOfPackages: safeStr(fullData.noOfPackages),
          otherPackages: safeStr(fullData.otherPackages),
          partyGstState: safeStr(
            fullData.customer?.gstState || fullData.partyGstState,
          ),
          isIgstApplicable:
            fullData.customer?.igstApplicable === true ? "Yes" : "No",
          importLocal: safeStr(fullData.importLocal),
          gstinNo: safeStr(
            fullData.customer?.gstNo || fullData.gstinNo,
          ),
          grossAmount: safeNum(fullData.grossAmount),
        },
        items,
        taxDetails,
        terms: {
          totalInsurance: safeNum(fullData.totalInsurance),
          totalFreight: safeNum(fullData.totalFreight),
          totalAssessableValue: safeNum(fullData.totalAssVal),
          modeOfTransport: safeStr(fullData.modeOfTransport),
          salesTax: safeStr(fullData.salesTax),
          grossAmount: safeNum(fullData.grossAmount),
          amountInWords: safeStr(fullData.amountInWords),
          deliveryTo: safeStr(fullData.deliverTo),
          paymentTerms: safeStr(fullData.paymentTerms),
          narration: safeStr(fullData.narration),
        },
      };

      const { blobUrl, fileName } = generateStockTransferChallanPDF(pdfData);
      setPdfPreview({ open: true, blobUrl, fileName });
    } catch (error) {
      console.error("PDF generation error:", error);
      addToast("Failed to generate PDF", "error");
    }
  };

  /* =========================================================
     COLUMNS
     ========================================================= */
  const columns = [
    {
      key: "docId",
      label: "Doc ID",
      accessor: (row) => row.docId || "-",
      type: "text",
      noWrap: true,
    },
    {
      key: "docDate",
      label: "Transfer Date",
      accessor: (row) => row.docDate || row.date,
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
      label: "Branch",
      accessor: (row) =>
        row.branch?.branchName || row.branchName || row.plantId,
      type: "text",
    },
    {
      key: "location",
      label: "Location",
      accessor: (row) =>
        row.location?.locationName || row.locationId,
      type: "text",
      noWrap: true,
    },
    {
      key: "noOfPackages",
      label: "Packages",
      accessor: (row) => row.noOfPackages,
      type: "text",
      noWrap: true,
    },
    {
      key: "active",
      label: "Status",
      accessor: "active",
      render: (value) => {
        const isActive = normalizeActive(value);
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${isActive
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
              }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        );
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
    "customer.customerName",
    "customerName",
    "branch.branchName",
    "branchName",
    "location.locationName",
    "locationId",
  ];

  const filterOptions = [
    { value: "all", label: "All", filterFn: () => true },
    {
      value: "active",
      label: "Active",
      filterFn: (item) => normalizeActive(item.active),
    },
    {
      value: "inactive",
      label: "Inactive",
      filterFn: (item) => !normalizeActive(item.active),
    },
  ];

  return (
    <>
      <CommonListViewTable
        title="Stock Transfer Challan"
        subtitle="Manage Stock Transfer Challans"
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
        emptyMessage="No Stock Transfer Challan records found"
        loadingMessage="Loading Stock Transfer Challan records..."
        enableRefresh={true}
        onRefresh={loadData}
        enableExport={true}
        exportFileName="StockTransferChallan"
      />

      <PDFPreviewModal
        isOpen={pdfPreview.open}
        onClose={() => {
          if (pdfPreview.blobUrl) URL.revokeObjectURL(pdfPreview.blobUrl);
          setPdfPreview({ open: false, blobUrl: null, fileName: "" });
        }}
        blobUrl={pdfPreview.blobUrl}
        fileName={pdfPreview.fileName}
      />
    </>
  );
};

export default StockTransferChallanList;
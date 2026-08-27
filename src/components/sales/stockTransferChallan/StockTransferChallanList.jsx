import { useCallback, useEffect, useRef, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import PDFPreviewModal from "../../../utils/PDFPreviewModal";
import stockTransferChallanAPI from "../../../api/Sales/stockTranferChallanAPI";
import { generateStockTransferChallanPDF } from "../../../utils/generateStockTransferChallanPDF";
import { useToast } from "../../Toast/ToastContext";

const normalizeActive = (value) => {
  if (value === true || value === "Yes" || value === "Active") return true;
  return false;
};

const StockTransferChallanList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfPreview, setPdfPreview] = useState({ open: false, blobUrl: null, fileName: "" });
  const { addToast } = useToast();
  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
  const BRANCH = Number(localStorage.getItem("branchId")) || 0;
  const prevRefreshRef = useRef(refreshTrigger);

  const loadData = useCallback(async () => {
    if (!ORG_ID) return;
    setLoading(true);
    try {
      const res = await stockTransferChallanAPI.getStockTransferChallanByOrgId(ORG_ID, BRANCH);
      const sorted = (res || []).sort((a, b) => (b.id || 0) - (a.id || 0));
      setData(sorted);
    } catch (error) {
      console.error("Failed to load Stock Transfer Challan records:", error);
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
      const fullData = await stockTransferChallanAPI.getStockTransferChallanById(row.id);
      if (!fullData) {
        addToast("Stock Transfer Challan data not found", "error");
        return;
      }
      const pdfData = {
        invoice: {
          docId:             fullData.docId || "",
          transferDate:      fullData.docDate || fullData.date || "",
          plantName:         fullData.branch?.branchName || fullData.branch?.id || "",
          plantId:           fullData.branch?.id || "",
          customerName:      fullData.customer?.customerName || "",
          customerId:        fullData.customer?.customerId || "",
          locationName:      fullData.location?.locationName || "",
          locationId:        fullData.location?.id || "",
          type:              fullData.types?.valuesDescription || fullData.types?.id || "",
          timeOfTransfer:    fullData.timeOfTranfer || fullData.timeOfTransfer || "",
          stockPosting:      fullData.stockPosting || "",
          noOfPackages:      fullData.noOfPackages || "",
          otherPackages:     fullData.otherPackages || "",
          partyGstState:     fullData.customer?.gstState || fullData.partyGstState || "",
          isIgstApplicable:  fullData.customer?.igstApplicable === true ? "Yes" : "No",
          importLocal:       fullData.importLocal || "",
          gstinNo:           fullData.customer?.gstNo || fullData.gstinNo || "",
          grossAmount:       fullData.grossAmount || "",
        },
        items: (fullData.stockTransferChallanDetailsResponseDTO || []).map((item) => ({
          itemCode:              item.item?.id != null ? String(item.item.id) : "",
          itemDescription:       item.item?.itemDescription || "",
          hsnSacCode:            item.hsnCode || "",
          taxType:               item.taxType || "",
          taxPerc:               item.taxPercentage || "",
          unit:                  item.item?.unit?.id || item.unit || "",
          stock:                 item.stock || "",
          qty:                   item.quantity || "",
          rate:                  item.rate || "",
          totalAssessableValue:  item.totalAssessableValue || (item.quantity * item.rate) || 0,
          amount:                item.totalAssessableValue || (item.quantity * item.rate) || 0,
          sgstRate:              item.sgstRate || "",
          sgstAmount:            item.sgstAmount || "",
          cgstRate:              item.cgstRate || "",
          cgstAmount:            item.cgstAmount || "",
          igstRate:              item.igstRate || "",
          igstAmount:            item.igstAmount || "",
        })),
        taxDetails: (fullData.stockTransferChallanTaxDetailsResponseDTO || []).map((t) => ({
          particulars:        t.particularsDesc || t.particulars || "",
          acceptedQtyAmount:  t.acceptQtyAmount || "",
          revisedAmount:      t.revisedAmoount || "",
        })),
        terms: {
          totalInsurance:       fullData.totalInsurance || "",
          totalFreight:         fullData.totalFreight || "",
          totalAssessableValue: fullData.totalAssVal || "",
          modeOfTransport:      fullData.modeOfTransport || "",
          salesTax:             fullData.salesTax || "",
          grossAmount:          fullData.grossAmount || "",
          amountInWords:        fullData.amountInWords || "",
          deliveryTo:           fullData.deliverTo || "",
          paymentTerms:         fullData.paymentTerms || "",
          narration:            fullData.narration || "",
        },
      };
      const { blobUrl, fileName } = generateStockTransferChallanPDF(pdfData);
      setPdfPreview({ open: true, blobUrl, fileName });
    } catch (error) {
      console.error("PDF generation error:", error);
      addToast("Failed to generate PDF", "error");
    }
  };

  const columns = [
    {
      key: "docId", label: "Doc ID", accessor: (row) => row.docId || "-", type: "text", noWrap: true,
    },
    {
      key: "docDate", label: "Transfer Date", accessor: (row) => row.docDate || row.date, type: "date", noWrap: true,
    },
    {
      key: "customer", label: "Customer", accessor: (row) => row.customer?.customerName || row.customerName, type: "text",
    },
    {
      key: "branch", label: "Branch", accessor: (row) => row.branch?.branchName || row.branchName || row.plantId, type: "text",
    },
    {
      key: "location", label: "Location", accessor: (row) => row.location?.locationName || row.locationId, type: "text", noWrap: true,
    },
    {
      key: "noOfPackages", label: "Packages", accessor: (row) => row.noOfPackages, type: "text", noWrap: true,
    },
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

  const searchFields = ["docId", "customer.customerName", "customerName", "branch.branchName", "branchName", "location.locationName", "locationId"];

  const filterOptions = [
    { value: "all",      label: "All",      filterFn: () => true },
    { value: "active",   label: "Active",   filterFn: (item) => normalizeActive(item.active) },
    { value: "inactive", label: "Inactive", filterFn: (item) => !normalizeActive(item.active) },
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
        onClose={() => { URL.revokeObjectURL(pdfPreview.blobUrl); setPdfPreview({ open: false, blobUrl: null, fileName: "" }); }}
        blobUrl={pdfPreview.blobUrl}
        fileName={pdfPreview.fileName}
      />
    </>
  );
};

export default StockTransferChallanList;

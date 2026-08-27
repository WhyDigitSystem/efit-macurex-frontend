import { useCallback, useEffect, useRef, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import PDFPreviewModal from "../../../utils/PDFPreviewModal";
import docketInvoiceDetailsAPI from "../../../api/Sales/docketInvoiceDetailsAPI";
import { generateDocketInvoiceDetailsPDF } from "../../../utils/generateDocketInvoiceDetailsPDF";
import { useToast } from "../../Toast/ToastContext";

const normalizeActive = (value) => {
  if (value === true || value === "Yes" || value === "Active") return true;
  if (value === false || value === "No" || value === "Inactive") return false;
  return value !== false && value !== "Inactive" && value !== "No";
};

const DocketInvoiceDetailsList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfPreview, setPdfPreview] = useState({ open: false, blobUrl: null, fileName: "" });
  const { addToast } = useToast();
  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
  const BRANCH = Number(localStorage.getItem("branchId")) || 1000000001;
  const prevRefreshRef = useRef(refreshTrigger);

  const loadData = useCallback(async () => {
    if (!ORG_ID || !BRANCH) return;
    setLoading(true);
    try {
      const response = await docketInvoiceDetailsAPI.getAll(ORG_ID, BRANCH);
      const transformedData = (response || []).map((item) => ({
        id: item.id,
        docNo: item.docNo || `DK/${item.id}`,
        docDate: item.docDate || "",
        transportId: item.transport?.id || "",
        transportName: item.transport?.transportName || "",
        branchId: item.branch?.id || "",
        branchName: item.branch?.branchName || "",
        billNo: item.billNo || "",
        billDate: item.billDate || "",
        totalAmount: item.totalAmount || 0,
        orgId: item.orgId || ORG_ID,
        active: normalizeActive(item.active),
        createdBy: item.createdBy || "",
        cancelRemarks: item.cancelRemarks || "",
        docketDetails: (item.docketInvoiceDetResponseDTO || []).map((d) => ({
          docketNo: d.docketNo || "",
          docketDate: d.docketDate || "",
          invoiceNo: d.invoiceNo || "",
          qtyBoxes: d.noOfQty || 0,
          weightBoxes: d.weight || 0,
          totalValue: d.totalValue || 0,
          cumulativeTotal: d.cumulativeValue || 0,
          mode: d.mode || "",
        })),
      }));
      const sorted = transformedData.sort((a, b) => (b.id || 0) - (a.id || 0));
      setData(sorted);
    } catch (error) {
      console.error("Failed to load Docket/Invoice Details records:", error);
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
      const fullData = await docketInvoiceDetailsAPI.getById(row.id);
      if (!fullData) {
        addToast("Docket data not found", "error");
        return;
      }
      const pdfData = {
        invoice: {
          docNo:          fullData.docNo,
          docDate:        fullData.docDate,
          plantName:      fullData.branch?.branchName || fullData.branch?.id,
          plantId:        fullData.branch?.id,
          transportName:  fullData.transport?.transportName || "",
          billNo:         fullData.billNo,
          billDate:       fullData.billDate,
          totalAmount:    fullData.totalAmount,
        },
        dockets: (fullData.docketInvoiceDetResponseDTO || []).map((d) => ({
          docketNo:        d.docketNo || "",
          docketDate:      d.docketDate || "",
          invoiceNo:       d.invoiceNo || "",
          qtyBoxes:        d.noOfQty ?? "",
          weightBoxes:     d.weight ?? "",
          totalValue:      d.totalValue ?? "",
          cumulativeTotal: d.cumulativeValue ?? "",
          mode:            d.mode || "",
        })),
      };
      const { blobUrl, fileName } = generateDocketInvoiceDetailsPDF(pdfData);
      setPdfPreview({ open: true, blobUrl, fileName });
    } catch (error) {
      console.error("PDF generation error:", error);
      addToast("Failed to generate PDF", "error");
    }
  };

  const columns = [
    { key: "docNo",         label: "Doc No",        accessor: "docNo",         type: "text",   noWrap: true },
    { key: "docDate",       label: "Doc Date",      accessor: "docDate",       type: "date",   noWrap: true },
    { key: "transportName", label: "Transport",     accessor: "transportName", type: "text" },
    { key: "billNo",        label: "Bill No",       accessor: "billNo",        type: "text",   noWrap: true },
    { key: "billDate",      label: "Bill Date",     accessor: "billDate",      type: "date",   noWrap: true },
    {
      key: "totalAmount", label: "Total Amount", accessor: "totalAmount", type: "text", noWrap: true,
      render: (value) => {
        const num = parseFloat(value);
        return (
          <span className="text-gray-900 dark:text-white font-medium">
            {!isNaN(num) ? num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
          </span>
        );
      },
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

  const searchFields = ["docNo", "transportName", "billNo", "branchName"];

  const filterOptions = [
    { value: "all",      label: "All",      filterFn: () => true },
    { value: "active",   label: "Active",   filterFn: (item) => normalizeActive(item.active) },
    { value: "inactive", label: "Inactive", filterFn: (item) => !normalizeActive(item.active) },
  ];

  return (
    <>
      <CommonListViewTable
        title="Docket/Invoice Details"
        subtitle="Manage Docket/Invoice Details"
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
        emptyMessage="No Docket/Invoice Details records found"
        loadingMessage="Loading Docket/Invoice Details records..."
        enableRefresh={true}
        onRefresh={loadData}
        enableExport={true}
        exportFileName="DocketInvoiceDetails"
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

export default DocketInvoiceDetailsList;

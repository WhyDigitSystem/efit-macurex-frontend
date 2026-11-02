import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";
import orderAcceptanceForApprovalAPI from "../../../api/Reports/orderAcceptanceForApprovalAPI";

import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ============================================================
// DATE HELPERS
// ============================================================

const getToday = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getMonthStart = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}-01`;
};

// Converts YYYY-MM-DD (or ISO string) to DD-MM-YYYY
const formatDate = (value) => {
  if (!value) return "-";

  const text = String(value).slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);

  if (!match) return String(value);

  return `${match[3]}-${match[2]}-${match[1]}`;
};

// ============================================================
// APPROVAL STATUS HELPERS
// ============================================================

const getApprovalStatus = (value) => {
  if (value === null || value === undefined || value === "") {
    return "Pending";
  }

  const status = String(value).trim().toLowerCase();

  if (["true", "approved", "yes", "1"].includes(status)) {
    return "Approved";
  }

  if (["false", "rejected", "no", "0"].includes(status)) {
    return "Rejected";
  }

  return String(value);
};

const getStatusColors = (status) => {
  const value = String(status).toLowerCase();

  if (value === "approved") {
    return { background: "DCFCE7", text: "166534" };
  }

  if (value === "rejected") {
    return { background: "FEE2E2", text: "991B1B" };
  }

  return { background: "FEF3C7", text: "92400E" };
};

const hexToRgb = (hex) => [
  parseInt(hex.slice(0, 2), 16),
  parseInt(hex.slice(2, 4), 16),
  parseInt(hex.slice(4, 6), 16),
];

// ============================================================
// SMALL INLINE SVG ICONS
// ============================================================

const SheetIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M8 13h8M8 17h8M8 9h2" />
  </svg>
);

const PdfIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M9 15h6" />
  </svg>
);

const SearchIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const BackIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </svg>
);

// ============================================================
// ORDER ACCEPTANCE FOR APPROVAL LIST
// ============================================================

const OrderAcceptanceForApprovalList = ({ onBack, refreshTrigger }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const [fromDate, setFromDate] = useState(getMonthStart());
  const [toDate, setToDate] = useState(getToday());

  const navigate = useNavigate();

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  // ============================================================
  // BACK BUTTON
  // ============================================================

  const handleBack = () => {
    if (typeof onBack === "function") {
      onBack();
    } else {
      navigate(-1);
    }
  };

  // ============================================================
  // LOAD REPORT
  // ============================================================

  const loadRecords = useCallback(
    async (searchFromDate, searchToDate) => {
      try {
        if (!searchFromDate || !searchToDate) {
          toast.error("Please select From Date and To Date");
          return;
        }

        if (searchFromDate > searchToDate) {
          toast.error("From Date cannot be greater than To Date");
          return;
        }

        setLoading(true);

        const data =
          await orderAcceptanceForApprovalAPI.getOrderAcceptanceForApprovalReport(
            {
              branch: BRANCH_ID,
              fromDate: searchFromDate,
              orgId: ORG_ID,
              toDate: searchToDate,
            },
          );

        const sortedData = [...(Array.isArray(data) ? data : [])].sort(
          (a, b) =>
            (Number(b.orderAcceptanceBasicId) || 0) -
            (Number(a.orderAcceptanceBasicId) || 0),
        );

        setRecords(sortedData);
      } catch (error) {
        console.error(
          "Failed to load Order Acceptance For Approval Report:",
          error,
        );

        setRecords([]);

        toast.error("Failed to fetch Order Acceptance For Approval Report");
      } finally {
        setLoading(false);
      }
    },
    [ORG_ID, BRANCH_ID],
  );

  // ============================================================
  // INITIAL LOAD / REFRESH TRIGGER
  // ============================================================

  useEffect(() => {
    loadRecords(getMonthStart(), getToday());
  }, [loadRecords, refreshTrigger]);

  // ============================================================
  // EXCEL DOWNLOAD
  // ============================================================

  const downloadExcel = async () => {
    try {
      if (!records.length) {
        toast.error("No records available to export");
        return;
      }

      // Browser build of ExcelJS
      const excelModule = await import("exceljs/dist/exceljs.min.js");
      const ExcelJS = excelModule.default || excelModule;

      const workbook = new ExcelJS.Workbook();

      workbook.creator = "ERP System";
      workbook.title = "Order Acceptance For Approval";
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet("Approval Report", {
        views: [{ state: "frozen", ySplit: 5 }],
        pageSetup: {
          paperSize: 9,
          orientation: "landscape",
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 0,
        },
      });

      // COLORS
      const navy = "FF172B4D";
      const teal = "FF0D9488";
      const lightGray = "FFF3F6FA";
      const borderColor = "FFDCE3EC";
      const white = "FFFFFFFF";

      const TOTAL_COLS = 8;

      // COLUMN WIDTHS
      const widths = [8, 22, 20, 16, 16, 34, 18, 40];

      widths.forEach((w, i) => {
        worksheet.getColumn(i + 1).width = w;
      });

      const solid = (argb) => ({
        type: "pattern",
        pattern: "solid",
        fgColor: { argb },
      });

      // ---------- ROW 1 : TITLE ----------

      worksheet.mergeCells(1, 1, 1, TOTAL_COLS);

      const title = worksheet.getCell(1, 1);

      title.value = "ORDER ACCEPTANCE FOR APPROVAL";

      title.font = {
        name: "Calibri",
        size: 20,
        bold: true,
        color: { argb: white },
      };

      title.fill = solid(navy);

      title.alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      worksheet.getRow(1).height = 42;

      // ---------- ROW 2 : TEAL ACCENT ----------

      worksheet.mergeCells(2, 1, 2, TOTAL_COLS);

      worksheet.getCell(2, 1).fill = solid(teal);

      worksheet.getRow(2).height = 5;

      // ---------- ROW 3 : DATES ----------

      worksheet.mergeCells(3, 1, 3, 4);
      worksheet.mergeCells(3, 5, 3, TOTAL_COLS);

      worksheet.getCell(3, 1).value = `FROM DATE: ${formatDate(fromDate)}`;

      worksheet.getCell(3, 5).value = `TO DATE: ${formatDate(toDate)}`;

      [worksheet.getCell(3, 1), worksheet.getCell(3, 5)].forEach((cell) => {
        cell.font = {
          name: "Calibri",
          bold: true,
          size: 11,
          color: { argb: navy },
        };

        cell.fill = solid(lightGray);

        cell.alignment = {
          vertical: "middle",
          horizontal: "left",
          indent: 1,
        };
      });

      worksheet.getRow(3).height = 26;

      // ---------- ROW 4 : SUMMARY ----------

      worksheet.mergeCells(4, 1, 4, TOTAL_COLS);

      const summary = worksheet.getCell(4, 1);

      summary.value = `TOTAL RECORDS: ${records.length}     |     GENERATED ON: ${new Date().toLocaleString("en-IN")}`;

      summary.font = {
        name: "Calibri",
        size: 10,
        italic: true,
        color: { argb: "FF64748B" },
      };

      summary.alignment = {
        horizontal: "left",
        vertical: "middle",
        indent: 1,
      };

      worksheet.getRow(4).height = 22;

      // ---------- ROW 5 : HEADER ----------

      const headerRow = worksheet.getRow(5);

      [
        "S.NO",
        "ORDER ACCEPTANCE ID",
        "DOCUMENT NO.",
        "DOCUMENT DATE",
        "CUSTOMER ID",
        "CUSTOMER NAME",
        "APPROVAL STATUS",
        "NOTE",
      ].forEach((text, i) => {
        headerRow.getCell(i + 1).value = text;
      });

      headerRow.height = 32;

      for (let c = 1; c <= TOTAL_COLS; c++) {
        const cell = headerRow.getCell(c);

        cell.font = {
          name: "Calibri",
          size: 11,
          bold: true,
          color: { argb: white },
        };

        cell.fill = solid(navy);

        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };

        cell.border = {
          top: {
            style: "medium",
            color: { argb: teal },
          },
          bottom: {
            style: "medium",
            color: { argb: teal },
          },
          left: {
            style: "thin",
            color: { argb: borderColor },
          },
          right: {
            style: "thin",
            color: { argb: borderColor },
          },
        };
      }

      // ---------- DATA ----------

      const centerCols = [1, 2, 4, 5, 7];

      records.forEach((row, index) => {
        const status = getApprovalStatus(row.Approved);

        const rowNumber = 6 + index;

        const dataRow = worksheet.getRow(rowNumber);

        const values = [
          index + 1,
          String(row.orderAcceptanceBasicId ?? "-"),
          row.docId || "-",
          formatDate(row.docDate),
          String(row.customerId || "-"),
          row.customerName || "-",
          status,
          row.note || "-",
        ];

        values.forEach((value, i) => {
          dataRow.getCell(i + 1).value = value;
        });

        dataRow.height = 24;

        for (let c = 1; c <= TOTAL_COLS; c++) {
          const cell = dataRow.getCell(c);

          cell.font = {
            name: "Calibri",
            size: 11,
            color: { argb: "FF334155" },
          };

          cell.fill = solid(index % 2 === 0 ? white : lightGray);

          cell.alignment = {
            horizontal: centerCols.includes(c) ? "center" : "left",
            vertical: "middle",
            wrapText: true,
          };

          cell.border = {
            bottom: {
              style: "thin",
              color: { argb: borderColor },
            },
            left: {
              style: "thin",
              color: { argb: borderColor },
            },
            right: {
              style: "thin",
              color: { argb: borderColor },
            },
          };
        }

        // Status colour

        const colors = getStatusColors(status);

        const statusCell = dataRow.getCell(7);

        statusCell.fill = solid(`FF${colors.background}`);

        statusCell.font = {
          name: "Calibri",
          bold: true,
          size: 11,
          color: { argb: `FF${colors.text}` },
        };

        statusCell.alignment = {
          horizontal: "center",
          vertical: "middle",
        };
      });

      // ---------- PRINT SETTINGS ----------
      // No autoFilter is applied.
      // Excel will open without filter dropdowns.

      worksheet.headerFooter.oddFooter =
        "&LOrder Acceptance Approval Report&CConfidential&RPage &P of &N";

      // ---------- DOWNLOAD ----------

      const buffer = await workbook.xlsx.writeBuffer();

      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const fileName = `OrderAcceptanceApproval_${fromDate}_to_${toDate}.xlsx`;

      saveAs(blob, fileName);

      toast.success("Excel downloaded successfully");
    } catch (error) {
      console.error("Excel export error:", error);

      toast.error(
        `Failed to download Excel: ${error?.message || "Unknown error"}`,
      );
    }
  };

  // ============================================================
  // PDF DOWNLOAD
  // ============================================================

  const downloadPDF = () => {
    try {
      if (!records.length) {
        toast.error("No records available to export");
        return;
      }

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const navy = [23, 43, 77];
      const teal = [13, 148, 136];
      const lightGray = [243, 246, 250];
      const darkText = [51, 65, 85];
      const muted = [100, 116, 139];

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const tableData = records.map((row, index) => [
        index + 1,
        row.orderAcceptanceBasicId ?? "-",
        row.docId || "-",
        formatDate(row.docDate),
        row.customerId || "-",
        row.customerName || "-",
        getApprovalStatus(row.Approved),
        row.note || "-",
      ]);

      autoTable(doc, {
        startY: 40,

        head: [
          [
            "S.NO",
            "ORDER ACCEPTANCE ID",
            "DOCUMENT NO.",
            "DOCUMENT DATE",
            "CUSTOMER ID",
            "CUSTOMER NAME",
            "APPROVAL STATUS",
            "NOTE",
          ],
        ],

        body: tableData,

        theme: "grid",

        margin: {
          top: 40,
          left: 10,
          right: 10,
          bottom: 20,
        },

        styles: {
          font: "helvetica",
          fontSize: 8,
          textColor: darkText,
          cellPadding: 2.5,
          overflow: "linebreak",
          valign: "middle",
          lineColor: [220, 227, 236],
          lineWidth: 0.15,
          minCellHeight: 9,
        },

        headStyles: {
          fillColor: navy,
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 8,
          halign: "center",
          valign: "middle",
          minCellHeight: 12,
          lineColor: teal,
          lineWidth: 0.4,
        },

        alternateRowStyles: {
          fillColor: lightGray,
        },

        columnStyles: {
          0: { cellWidth: 14, halign: "center" },
          1: { cellWidth: 34, halign: "center" },
          2: { cellWidth: 34, halign: "left" },
          3: { cellWidth: 28, halign: "center" },
          4: { cellWidth: 28, halign: "center" },
          5: { cellWidth: 50, halign: "left" },
          6: { cellWidth: 30, halign: "center" },
          7: { cellWidth: "auto", halign: "left" },
        },

        didParseCell: (data) => {
          if (data.section === "body" && data.column.index === 6) {
            const colors = getStatusColors(data.cell.raw);

            data.cell.styles.fillColor = hexToRgb(colors.background);

            data.cell.styles.textColor = hexToRgb(colors.text);

            data.cell.styles.fontStyle = "bold";
          }
        },

        didDrawPage: (data) => {
          // HEADER BAR

          doc.setFillColor(...navy);
          doc.rect(0, 0, pageWidth, 27, "F");

          doc.setTextColor(255, 255, 255);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(16);

          doc.text("ORDER ACCEPTANCE FOR APPROVAL", 12, 12);

          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(220, 230, 245);

          doc.text("APPROVAL MANAGEMENT REPORT", 12, 19);

          doc.setFillColor(...teal);
          doc.rect(0, 27, pageWidth, 2, "F");

          // REPORT INFO

          doc.setTextColor(...darkText);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);

          doc.text(`From Date: ${formatDate(fromDate)}`, 12, 35);

          doc.text(`To Date: ${formatDate(toDate)}`, 75, 35);

          doc.text(`Total Records: ${records.length}`, pageWidth - 12, 35, {
            align: "right",
          });

          // FOOTER

          doc.setDrawColor(...teal);
          doc.setLineWidth(0.5);

          doc.line(10, pageHeight - 13, pageWidth - 10, pageHeight - 13);

          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(...muted);

          doc.text(
            "ERP | Order Acceptance Approval Report",
            10,
            pageHeight - 7,
          );

          doc.text(
            `Generated: ${new Date().toLocaleDateString("en-IN")}`,
            pageWidth / 2,
            pageHeight - 7,
            { align: "center" },
          );

          doc.text(`Page ${data.pageNumber}`, pageWidth - 10, pageHeight - 7, {
            align: "right",
          });
        },
      });

      doc.save(`OrderAcceptanceApproval_${fromDate}_to_${toDate}.pdf`);

      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to download PDF");
    }
  };

  // ============================================================
  // TABLE COLUMNS
  // ============================================================

  const columns = [
    {
      key: "orderAcceptanceBasicId",
      label: "Order Acceptance ID",
      accessor: (row) => row.orderAcceptanceBasicId,
      type: "text",
      noWrap: true,
    },
    {
      key: "docId",
      label: "Document No.",
      accessor: (row) => row.docId || "-",
      type: "text",
      noWrap: true,
    },
    {
      key: "docDate",
      label: "Document Date",
      accessor: (row) => formatDate(row.docDate),
      type: "text",
      noWrap: true,
    },
    {
      key: "customerId",
      label: "Customer ID",
      accessor: (row) => row.customerId || "-",
      type: "text",
    },
    {
      key: "customerName",
      label: "Customer Name",
      accessor: (row) => row.customerName || "-",
      type: "text",
    },
    {
      key: "Approved",
      label: "Approved",
      accessor: (row) => getApprovalStatus(row.Approved),
      type: "text",
    },
    {
      key: "note",
      label: "Note",
      accessor: (row) => row.note || "-",
      type: "text",
    },
  ];

  const searchFields = [
    "orderAcceptanceBasicId",
    "docId",
    "docDate",
    "customerId",
    "customerName",
    "Approved",
    "note",
  ];

  const filterOptions = [{ value: "all", label: "All", field: null }];

  // ============================================================
  // COMPACT INPUT AND BUTTON STYLES
  // ============================================================

  const inputClass =
    "h-8 w-32 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 text-xs text-gray-700 dark:text-gray-200 outline-none focus:border-blue-500";

  const btnBase =
    "h-8 inline-flex items-center justify-center gap-1.5 rounded px-3 text-xs font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-3">
      {/* PAGE TITLE WITH BACK BUTTON */}

      <div className="flex items-center gap-3 px-3 pt-2">
        <button
          type="button"
          onClick={handleBack}
          className="h-8 inline-flex items-center justify-center gap-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <BackIcon />
        </button>

        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Order Acceptance For Approval
          </h1>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            View Order Acceptance Approval Details
          </p>
        </div>
      </div>

      {/* FILTER + EXPORT BAR */}

      <div className="mx-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2">
        {/* DATE FILTERS + SEARCH */}

        <div className="flex flex-wrap items-center gap-2">
          {/* FROM DATE */}

          <div className="flex items-center gap-1.5">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
              From Date
            </label>

            <input
              type="date"
              value={fromDate}
              max={toDate}
              onChange={(e) => setFromDate(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* TO DATE */}

          <div className="flex items-center gap-1.5">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
              To Date
            </label>

            <input
              type="date"
              value={toDate}
              min={fromDate}
              max={getToday()}
              onChange={(e) => setToDate(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* SEARCH BUTTON */}

          <button
            type="button"
            onClick={() => loadRecords(fromDate, toDate)}
            disabled={loading}
            className={`${btnBase} bg-blue-600 hover:bg-blue-700`}
          >
            <SearchIcon />
            {loading ? "Loading..." : "Search"}
          </button>
        </div>

        {/* EXPORT BUTTONS */}

        <div className="flex items-center gap-2">
          {/* EXCEL */}

          <button
            type="button"
            onClick={downloadExcel}
            disabled={loading || records.length === 0}
            className={`${btnBase} bg-emerald-600 hover:bg-emerald-700`}
          >
            <SheetIcon />
            Excel
          </button>

          {/* PDF */}

          <button
            type="button"
            onClick={downloadPDF}
            disabled={loading || records.length === 0}
            className={`${btnBase} bg-rose-600 hover:bg-rose-700`}
          >
            <PdfIcon />
            PDF
          </button>
        </div>
      </div>

      {/* REPORT TABLE */}

      <CommonListViewTable
        title=""
        subtitle=""
        data={records}
        loading={loading}
        columns={columns}
        searchFields={searchFields}
        filterOptions={filterOptions}
        defaultFilter="all"
        onBack={onBack}
        onAddNew={false}
        onEdit={false}
        onView={false}
        showSerialNumber={true}
        itemsPerPageOptions={[5, 10, 20, 50, 100]}
        defaultItemsPerPage={10}
        emptyMessage="No Order Acceptance records found"
        loadingMessage="Loading Order Acceptance Report..."
        enableRefresh={true}
        onRefresh={() => loadRecords(fromDate, toDate)}
        enableExport={true}
        exportFileName="OrderAcceptanceForApproval"
      />
    </div>
  );
};

export default OrderAcceptanceForApprovalList;

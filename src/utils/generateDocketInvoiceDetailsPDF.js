import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const C = {
  primary:     [37, 99, 235],
  primaryDk:   [29, 78, 216],
  primaryTint: [239, 246, 255],
  white:       [255, 255, 255],
  black:       [0, 0, 0],
  gray200:     [229, 231, 235],
  gray500:     [107, 114, 128],
  gray900:     [17, 24, 39],
};

const fmt = (n) =>
  (Number(n) || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export function generateDocketInvoiceDetailsPDF(data) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const PAGE_W = doc.internal.pageSize.getWidth();
  const PAGE_H = doc.internal.pageSize.getHeight();
  const M = 30;
  const CW = PAGE_W - M * 2;

  let y = M;

  const inv     = data.invoice   || {};
  const dockets = data.dockets   || [];

  const setFont = (f, s, style) => {
    doc.setFont(f || "helvetica", style || "normal");
    doc.setFontSize(s || 10);
  };

  const checkPageBreak = (needed) => {
    if (y + needed > PAGE_H - M - 30) {
      doc.addPage();
      y = M;
      doc.setFillColor(...C.white);
      doc.setDrawColor(...C.primary);
      doc.setLineWidth(0.5);
      doc.rect(M, y, CW, 24, "FD");
      setFont("helvetica", 8, "bold");
      doc.setTextColor(...C.primary);
      doc.text(`Docket/Invoice Details — ${inv.docNo || ""}`, PAGE_W / 2, y + 15, { align: "center" });
      doc.setTextColor(...C.black);
      y += 30;
    }
  };

  const sectionHeading = (title) => {
    checkPageBreak(24);
    doc.setFillColor(...C.white);
    doc.setDrawColor(...C.primary);
    doc.setLineWidth(0.5);
    doc.rect(M, y - 2, CW, 18, "FD");
    setFont("helvetica", 9, "bold");
    doc.setTextColor(...C.primary);
    doc.text(title, M + 6, y + 10);
    doc.setTextColor(...C.black);
    y += 20;
  };

  /* ================================================================ */
  /* 1. TITLE BAR                                                      */
  /* ================================================================ */
  doc.setFillColor(...C.white);
  doc.setDrawColor(...C.primary);
  doc.setLineWidth(0.8);
  doc.rect(M, y, CW, 40, "FD");
  setFont("helvetica", 14, "bold");
  doc.setTextColor(...C.primary);
  doc.text("DOCKET / INVOICE DETAILS", PAGE_W / 2, y + 26, { align: "center" });
  doc.setTextColor(...C.black);
  y += 40;

  /* ================================================================ */
  /* 2. HEADER BLOCK                                                   */
  /* ================================================================ */
  const LEFT_X  = M + 8;
  const RIGHT_X = PAGE_W / 2 + 30;
  const HEADER_H = 110;

  doc.setDrawColor(...C.primary);
  doc.setLineWidth(0.8);
  doc.rect(M, y, CW, HEADER_H);
  doc.setDrawColor(...C.gray200);
  doc.setLineWidth(0.5);
  doc.line(PAGE_W / 2 + 20, y, PAGE_W / 2 + 20, y + HEADER_H);

  /* ---------- LEFT column ---------- */
  let ly = y + 16;

  setFont("helvetica", 12, "bold");
  doc.setTextColor(...C.primary);
  doc.text("Macurex Sensors Pvt.Ltd.", LEFT_X, ly);
  ly += 14;
  setFont("helvetica", 8, "normal");
  doc.setTextColor(...C.gray500);
  doc.text("NO.21/B, KIADB INDUSTRIAL AREA, 1ST PHASE,", LEFT_X, ly);
  ly += 11;
  doc.text("KUMBALGODU, BANGALORE - 562109", LEFT_X, ly);
  ly += 16;
  doc.setTextColor(...C.black);

  const leftRow = (label, value) => {
    setFont("helvetica", 8, "bold");
    doc.setTextColor(...C.gray900);
    doc.text(label, LEFT_X, ly);
    setFont("helvetica", 8, "normal");
    doc.setTextColor(...C.gray500);
    doc.text(String(value ?? ""), LEFT_X + doc.getTextWidth(label) + 6, ly);
    ly += 12;
  };

  leftRow("Plant :", inv.plantName || inv.plantId);
  leftRow("Transport :", inv.transportName);

  /* ---------- RIGHT column ---------- */
  let ry = y + 18;

  const rightRow = (label, value) => {
    setFont("helvetica", 8, "bold");
    doc.setTextColor(...C.gray900);
    doc.text(label, RIGHT_X, ry);
    setFont("helvetica", 8, "normal");
    doc.setTextColor(...C.gray500);
    doc.text(String(value ?? ""), RIGHT_X + 90, ry);
    ry += 14;
  };

  rightRow("Doc No :", inv.docNo);
  rightRow("Doc Date :", inv.docDate);
  rightRow("Bill No :", inv.billNo);
  rightRow("Bill Date :", inv.billDate);
  rightRow("Total Amount :", fmt(inv.totalAmount));

  doc.setTextColor(...C.black);
  y += HEADER_H;

  /* ================================================================ */
  /* 3. DOCKET DETAILS TABLE                                           */
  /* ================================================================ */
  sectionHeading("Docket Details");

  const headers = [
    "S.No",
    "Docket No",
    "Docket Date",
    "Invoice No",
    "Qty/Boxes",
    "Weight/Box",
    "Total Value",
    "Cumulative Total",
    "Mode",
  ];

  const rows = dockets.map((d, idx) => [
    idx + 1,
    d.docketNo   || "",
    d.docketDate || "",
    d.invoiceNo  || "",
    d.qtyBoxes   != null ? String(d.qtyBoxes)   : "",
    d.weightBoxes != null ? String(d.weightBoxes) : "",
    d.totalValue        != null ? fmt(d.totalValue)        : "",
    d.cumulativeTotal   != null ? fmt(d.cumulativeTotal)   : "",
    d.mode || "",
  ]);

  const tableResult = autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    head: [headers],
    body: rows,
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 3,
      lineColor: [...C.gray200],
      lineWidth: 0.5,
      overflow: "linebreak",
      textColor: C.gray900,
    },
    headStyles: {
      fillColor: C.white,
      textColor: C.primary,
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
      cellPadding: 3,
      lineColor: C.primary,
      lineWidth: 0.5,
    },
    columnStyles: {
      0: { cellWidth: 20, halign: "center" },
      4: { halign: "right" },
      5: { halign: "right" },
      6: { halign: "right" },
      7: { halign: "right" },
    },
    didDrawPage: (eventData) => { y = eventData.cursor.y; },
  });

  y = (tableResult && tableResult.finalY ? tableResult.finalY : y) + 12;

  /* ================================================================ */
  /* 4. TOTAL AMOUNT ROW                                               */
  /* ================================================================ */
  checkPageBreak(26);
  doc.setFillColor(...C.primaryTint);
  doc.setDrawColor(...C.primary);
  doc.setLineWidth(0.5);
  doc.rect(M, y, CW, 22, "FD");

  setFont("helvetica", 9, "bold");
  doc.setTextColor(...C.primary);
  doc.text("Total Amount :", PAGE_W - M - 170, y + 15);
  doc.setTextColor(...C.gray900);
  doc.text(fmt(inv.totalAmount), PAGE_W - M - 80, y + 15);

  doc.setTextColor(...C.black);
  y += 26;

  /* ================================================================ */
  /* 5. FOOTER                                                         */
  /* ================================================================ */
  y += 12;
  if (y + 30 > PAGE_H - M) {
    doc.addPage();
    y = M + 40;
  }

  doc.setFillColor(...C.primaryTint);
  doc.setDrawColor(...C.primary);
  doc.setLineWidth(0.5);
  doc.rect(M, y, CW, 30, "FD");

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.gray500);

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN");
  const timeStr = now.toLocaleTimeString("en-IN");
  const generatedBy = localStorage.getItem("userName") || "System";

  doc.text(`Generated: ${dateStr} ${timeStr}`, M + 8, y + 18);
  doc.text(`Page ${doc.internal.getNumberOfPages()}`, PAGE_W / 2, y + 18, { align: "center" });
  doc.text(`Generated by: ${generatedBy}`, PAGE_W - M - 8, y + 18, { align: "right" });

  doc.setTextColor(...C.black);

  const fileName = `Docket_Invoice_Details_${inv.docNo || "document"}.pdf`;
  const pdfArrayBuffer = doc.output("arraybuffer");
  const pdfBlob = new Blob([pdfArrayBuffer], { type: "application/pdf" });
  const blobUrl = URL.createObjectURL(pdfBlob);

  return { blobUrl, fileName, doc };
}

export default generateDocketInvoiceDetailsPDF;

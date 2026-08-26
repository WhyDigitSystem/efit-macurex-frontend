import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ================================================================ */
/* PROJECT COLOR PALETTE                                             */
/* ================================================================ */
const C = {
  primary:    [37, 99, 235],
  primaryDk:  [29, 78, 216],
  primaryTint:[239, 246, 255],
  white:      [255, 255, 255],
  black:      [0, 0, 0],
  gray200:    [229, 231, 235],
  gray500:    [107, 114, 128],
  gray900:    [17, 24, 39],
};

export function generateSalesReturnPDF(data) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const PAGE_W = doc.internal.pageSize.getWidth();
  const PAGE_H = doc.internal.pageSize.getHeight();
  const M = 30;
  const CW = PAGE_W - M * 2;

  let y = M;

  const company = data.company || {};
  const sr = data.salesReturn || {};
  const items = data.items || [];
  const taxDetails = data.taxDetails || [];

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
      doc.text(`${company.name || "Company Name"} — SALES RETURN`, PAGE_W / 2, y + 15, { align: "center" });
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

  const fmt = (n) =>
    (Number(n) || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  /* ================================================================ */
  /* 1. TITLE BAR                                                      */
  /* ================================================================ */
  doc.setFillColor(...C.white);
  doc.setDrawColor(...C.primary);
  doc.setLineWidth(0.8);
  doc.rect(M, y, CW, 40, "FD");
  setFont("helvetica", 14, "bold");
  doc.setTextColor(...C.primary);
  doc.text("SALES RETURN", PAGE_W / 2, y + 26, { align: "center" });
  doc.setTextColor(...C.black);
  y += 40;

  /* ================================================================ */
  /* 2. HEADER BLOCK                                                   */
  /* ================================================================ */
  const HEADER_H = 130;
  doc.setDrawColor(...C.primary);
  doc.setLineWidth(0.8);
  doc.rect(M, y, CW, HEADER_H);
  doc.setDrawColor(...C.gray200);
  doc.setLineWidth(0.5);
  doc.line(PAGE_W / 2 + 20, y, PAGE_W / 2 + 20, y + HEADER_H);

  /* Left: company info */
  let ly = y + 16;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...C.primary);
  doc.text(company.name || "Company Name", M + 8, ly);
  ly += 14;
  doc.setFontSize(10);
  doc.text("Macurex Sensors Pvt.Ltd.", M + 8, ly);
  ly += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.gray500);
  doc.text("NO.21/B, KIADB INDUSTRIAL AREA, 1ST PHASE,", M + 8, ly);
  ly += 11;
  doc.text("KUMBALGODU", M + 8, ly);
  ly += 14;
  doc.setTextColor(...C.black);

  const leftRow = (label, value) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...C.gray900);
    doc.text(label, M + 8, ly);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.gray500);
    doc.text(String(value || ""), M + 8 + doc.getTextWidth(label) + 6, ly);
    ly += 12;
  };
  leftRow("Plant :", sr.plantName);
  leftRow("Customer :", sr.customerName);
  leftRow("Customer Code :", sr.customerCode);

  /* Right: document numbers */
  let ry = y + 18;
  const rx = PAGE_W / 2 + 30;
  doc.setFontSize(8);
  const rightRow = (label, value) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...C.gray900);
    doc.text(label, rx, ry);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.gray500);
    doc.text(String(value || ""), rx + 90, ry);
    ry += 14;
  };
  rightRow("Return No :", sr.salesReturnNo);
  rightRow("Return Date :", sr.salesReturnDate);
  rightRow("Invoice No :", sr.invoiceNo);
  rightRow("Invoice Date :", sr.invoiceDate);
  rightRow("Total Amount :", fmt(sr.totalAmount));

  doc.setTextColor(...C.black);
  y += HEADER_H;

  /* ================================================================ */
  /* 3. ITEMS TABLE                                                    */
  /* ================================================================ */
  sectionHeading("Return Items");

  const itemRows = items.map((item, idx) => [
    idx + 1,
    item.itemCode || "",
    item.itemDescription || "",
    item.unit || "",
    item.qty != null ? String(item.qty) : "",
    item.rate != null ? fmt(item.rate) : "",
    item.amount != null ? fmt(item.amount) : "",
    item.returnReason || "",
  ]);

  const itemTableResult = autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    head: [["S.No", "Item Code", "Description", "Unit", "Qty", "Rate", "Amount", "Return Reason"]],
    body: itemRows,
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
      0: { cellWidth: 24, halign: "center" },
      4: { halign: "right" },
      5: { halign: "right" },
      6: { halign: "right" },
    },
    didDrawPage: (eventData) => { y = eventData.cursor.y; },
  });

  y = (itemTableResult && itemTableResult.finalY ? itemTableResult.finalY : y) + 12;

  /* ================================================================ */
  /* 4. TAX DETAILS TABLE                                              */
  /* ================================================================ */
  if (taxDetails.length > 0) {
    sectionHeading("Tax Details");
    const taxRows = taxDetails.map((tax, idx) => [
      idx + 1,
      tax.particulars || "",
      tax.amount != null ? fmt(tax.amount) : "",
    ]);
    const taxResult = autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      head: [["S.No", "Particulars", "Amount"]],
      body: taxRows,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 3, lineColor: [...C.gray200], lineWidth: 0.5, overflow: "linebreak", textColor: C.gray900 },
      headStyles: { fillColor: C.white, textColor: C.primary, fontStyle: "bold", fontSize: 8, halign: "center", cellPadding: 3, lineColor: C.primary, lineWidth: 0.5 },
      columnStyles: { 0: { cellWidth: 30, halign: "center" }, 2: { halign: "right" } },
      didDrawPage: (eventData) => { y = eventData.cursor.y; },
    });
    y = (taxResult && taxResult.finalY ? taxResult.finalY : y) + 12;
  }

  /* ================================================================ */
  /* 5. TERMS / REMARKS                                                */
  /* ================================================================ */
  sectionHeading("Remarks & Terms");

  const TERMS_LABEL_COL = M + 8;
  const TERMS_COLON_COL = M + 240;
  const TERMS_VAL_COL = M + 250;
  const TERMS_VAL_MAX_W = CW - 260;
  const TERMS_ROW_PAD = 14;
  const TERMS_HEADER_H = 20;

  const allPairs = [
    ["Total Amount", fmt(sr.totalAmount)],
    ["Remarks", sr.remarks],
  ];

  const rowHeights = allPairs.map(([, value]) => {
    const lines = doc.splitTextToSize(String(value || "—"), TERMS_VAL_MAX_W);
    return Math.max(lines.length * 10 + 4, TERMS_ROW_PAD);
  });

  const totalTermsH = rowHeights.reduce((a, b) => a + b, 0) + TERMS_HEADER_H + 8;
  checkPageBreak(totalTermsH + 10);

  doc.setDrawColor(...C.primary);
  doc.setLineWidth(0.5);
  doc.setFillColor(...C.white);
  doc.rect(M, y, CW, totalTermsH, "FD");

  doc.setFillColor(...C.white);
  doc.setDrawColor(...C.primary);
  doc.rect(M, y, CW, TERMS_HEADER_H, "FD");
  setFont("helvetica", 8, "bold");
  doc.setTextColor(...C.primary);
  doc.text("Field", TERMS_LABEL_COL, y + 13);
  doc.text("Value", TERMS_COLON_COL + 20, y + 13);
  doc.setTextColor(...C.black);

  let ty = y + TERMS_HEADER_H + 6;

  allPairs.forEach(([label, value], idx) => {
    const rowH = rowHeights[idx];
    setFont("helvetica", 8, "bold");
    doc.setTextColor(...C.gray900);
    doc.text(label, TERMS_LABEL_COL, ty + 8);
    doc.text(":", TERMS_COLON_COL, ty + 8);
    setFont("helvetica", 8, "normal");
    doc.setTextColor(...C.gray500);
    const valLines = doc.splitTextToSize(String(value || "—"), TERMS_VAL_MAX_W);
    doc.text(valLines, TERMS_VAL_COL, ty + 8);
    doc.setDrawColor(...C.gray200);
    doc.setLineWidth(0.3);
    doc.line(M + 4, ty + rowH - 2, PAGE_W - M - 4, ty + rowH - 2);
    ty += rowH;
  });

  doc.setTextColor(...C.black);
  y += totalTermsH;

  /* ================================================================ */
  /* 6. FOOTER                                                         */
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

  const fileName = `Sales_Return_${sr.salesReturnNo || "document"}.pdf`;
  const pdfArrayBuffer = doc.output("arraybuffer");
  const pdfBlob = new Blob([pdfArrayBuffer], { type: "application/pdf" });
  const blobUrl = URL.createObjectURL(pdfBlob);

  return { blobUrl, fileName, doc };
}

export default generateSalesReturnPDF;

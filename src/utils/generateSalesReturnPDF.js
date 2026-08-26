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

const fmt = (n) =>
  (Number(n) || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const numberToWords = (num) => {
  if (!num || isNaN(num)) return "";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven",
    "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen",
    "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty",
    "Seventy", "Eighty", "Ninety"];
  const twoD = (n) =>
    n < 20 ? ones[n] : tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
  const threeD = (n) => {
    const h = Math.floor(n / 100), r = n % 100;
    return (h ? ones[h] + " Hundred" + (r ? " " : "") : "") + (r ? twoD(r) : "");
  };
  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const rest = Math.floor(num % 1000);
  let words = "";
  if (crore) words += threeD(crore) + " Crore ";
  if (lakh) words += twoD(lakh) + " Lakh ";
  if (thousand) words += twoD(thousand) + " Thousand ";
  if (rest) words += threeD(rest);
  return (words || "Zero").trim() + " Rupees Only";
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
  const isIGST = sr.isIGSTApplicable === "Yes";

  const checkPageBreak = (needed) => {
    if (y + needed > PAGE_H - M - 30) {
      doc.addPage();
      y = M;
      doc.setFillColor(...C.white);
      doc.setDrawColor(...C.primary);
      doc.setLineWidth(0.5);
      doc.rect(M, y, CW, 24, "FD");
      doc.setFont("helvetica", 8, "bold");
      doc.setFontSize(8);
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
    doc.setFont("helvetica", 9, "bold");
    doc.setFontSize(9);
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
  doc.setFont("helvetica", 14, "bold");
  doc.setFontSize(14);
  doc.setTextColor(...C.primary);
  doc.text("SALES RETURN", PAGE_W / 2, y + 26, { align: "center" });
  doc.setTextColor(...C.black);
  y += 40;

  /* ================================================================ */
  /* 2. HEADER BLOCK                                                   */
  /* ================================================================ */
  const HEADER_H = 160;
  doc.setDrawColor(...C.primary);
  doc.setLineWidth(0.8);
  doc.rect(M, y, CW, HEADER_H);
  doc.setDrawColor(...C.gray200);
  doc.setLineWidth(0.5);
  doc.line(PAGE_W / 2 + 20, y, PAGE_W / 2 + 20, y + HEADER_H);

  /* Left: company + customer */
  let ly = y + 16;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...C.primary);
  doc.text(String(company.name || "Company Name"), M + 8, ly);
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
    doc.text(String(label || ""), M + 8, ly);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.gray500);
    doc.text(String(value ?? ""), M + 8 + doc.getTextWidth(String(label || "")) + 6, ly);
    ly += 12;
  };
  leftRow("Plant :", sr.plantName);
  leftRow("Customer :", sr.customerName);
  leftRow("Customer Code :", sr.customerCode);
  leftRow("Return Type :", sr.returnType);
  leftRow("Belongs To :", sr.belongsTo);

  /* Right: doc numbers */
  let ry = y + 18;
  const rx = PAGE_W / 2 + 30;
  doc.setFontSize(8);
  const rightRow = (label, value) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...C.gray900);
    doc.text(String(label || ""), rx, ry);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.gray500);
    doc.text(String(value ?? ""), rx + 90, ry);
    ry += 14;
  };
  rightRow("Doc No :", sr.docNo);
  rightRow("Date :", sr.date);
  rightRow("Invoice No :", sr.invoiceNo);
  rightRow("Currency :", sr.currency);
  rightRow("Net Amount :", fmt(sr.netAmount));

  doc.setTextColor(...C.black);
  y += HEADER_H;

  /* ================================================================ */
  /* 3. ITEMS TABLE                                                    */
  /* ================================================================ */
  sectionHeading("Return Items");

  const baseHeaders = ["S.No", "Item Code", "Description", "HSN", "Tax Type", "Tax %", "Unit", "Stock", "Qty Sold", "Rec'd Qty", "Rate", "Amount"];
  let taxHeaders;
  if (isIGST) {
    taxHeaders = ["IGST Rate", "IGST Amt"];
  } else {
    taxHeaders = ["SGST Rate", "SGST Amt", "CGST Rate", "CGST Amt"];
  }
  const allHeaders = [...baseHeaders, ...taxHeaders];

  const itemRows = items.map((item, idx) => {
    const row = [
      idx + 1,
      item.itemCode || "",
      item.itemDescription || "",
      item.hsCode || "",
      item.taxType || "",
      item.taxPercentage != null ? String(item.taxPercentage) : "",
      item.unit || "",
      item.stock != null ? String(item.stock) : "",
      item.qtySold != null ? String(item.qtySold) : "",
      item.receivedQty != null ? String(item.receivedQty) : "",
      item.rate != null ? fmt(item.rate) : "",
      item.amount != null ? fmt(item.amount) : "",
    ];
    if (isIGST) {
      row.push(
        item.igstRate != null ? String(item.igstRate) : "",
        item.igstAmount != null ? fmt(item.igstAmount) : "",
      );
    } else {
      row.push(
        item.sgstRate != null ? String(item.sgstRate) : "",
        item.sgstAmount != null ? fmt(item.sgstAmount) : "",
        item.cgstRate != null ? String(item.cgstRate) : "",
        item.cgstAmount != null ? fmt(item.cgstAmount) : "",
      );
    }
    return row;
  });

  const itemTableResult = autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    head: [allHeaders],
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
      7: { halign: "right" },
      8: { halign: "right" },
      9: { halign: "right" },
      10: { halign: "right" },
      11: { halign: "right" },
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
      tax.sgstRate != null ? String(tax.sgstRate) : "",
      tax.sgstAmount != null ? fmt(tax.sgstAmount) : "",
      tax.cgstRate != null ? String(tax.cgstRate) : "",
      tax.cgstAmount != null ? fmt(tax.cgstAmount) : "",
      tax.igstRate != null ? String(tax.igstRate) : "",
      tax.igstAmount != null ? fmt(tax.igstAmount) : "",
    ]);
    const taxResult = autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      head: [["S.No", "SGST Rate", "SGST Amount", "CGST Rate", "CGST Amount", "IGST Rate", "IGST Amount"]],
      body: taxRows,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 3, lineColor: [...C.gray200], lineWidth: 0.5, overflow: "linebreak", textColor: C.gray900 },
      headStyles: { fillColor: C.white, textColor: C.primary, fontStyle: "bold", fontSize: 8, halign: "center", cellPadding: 3, lineColor: C.primary, lineWidth: 0.5 },
      columnStyles: { 0: { cellWidth: 30, halign: "center" }, 2: { halign: "right" }, 4: { halign: "right" }, 6: { halign: "right" } },
      didDrawPage: (eventData) => { y = eventData.cursor.y; },
    });
    y = (taxResult && taxResult.finalY ? taxResult.finalY : y) + 12;
  }

  /* ================================================================ */
  /* 5. CHARGES SUMMARY                                                */
  /* ================================================================ */
  sectionHeading("Charges Summary");

  const TERMS_LABEL_COL = M + 8;
  const TERMS_COLON_COL = M + 240;
  const TERMS_VAL_COL = M + 250;
  const TERMS_VAL_MAX_W = CW - 260;
  const TERMS_ROW_PAD = 14;
  const TERMS_HEADER_H = 20;

  const amountInWords = sr.amountInWords || (sr.netAmount ? numberToWords(Number(sr.netAmount)) : "");

  const allPairs = [
    ["Net Amount", fmt(sr.netAmount)],
    ["Amount in Words", amountInWords || "—"],
    ["Narration", sr.narration || "—"],
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
  doc.setFont("helvetica", 8, "bold");
  doc.setFontSize(8);
  doc.setTextColor(...C.primary);
  doc.text("Field", TERMS_LABEL_COL, y + 13);
  doc.text("Value", TERMS_COLON_COL + 20, y + 13);
  doc.setTextColor(...C.black);

  let ty = y + TERMS_HEADER_H + 6;

  allPairs.forEach(([label, value], idx) => {
    const rowH = rowHeights[idx];
    doc.setFont("helvetica", 8, "bold");
    doc.setFontSize(8);
    doc.setTextColor(...C.gray900);
    doc.text(String(label || ""), TERMS_LABEL_COL, ty + 8);
    doc.text(":", TERMS_COLON_COL, ty + 8);
    doc.setFont("helvetica", "normal");
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

  const fileName = `Sales_Return_${sr.docNo || "document"}.pdf`;
  const pdfArrayBuffer = doc.output("arraybuffer");
  const pdfBlob = new Blob([pdfArrayBuffer], { type: "application/pdf" });
  const blobUrl = URL.createObjectURL(pdfBlob);

  return { blobUrl, fileName, doc };
}

export default generateSalesReturnPDF;

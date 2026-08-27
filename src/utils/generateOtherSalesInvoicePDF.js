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
    const h = Math.floor(n / 100);
    const r = n % 100;
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
  return (words || "Zero").trim() + " Only";
};

export function generateOtherSalesInvoicePDF(data) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const PAGE_W = doc.internal.pageSize.getWidth();
  const PAGE_H = doc.internal.pageSize.getHeight();
  const M = 30;
  const CW = PAGE_W - M * 2;

  let y = M;

  const inv     = data.invoice   || {};
  const items   = data.items     || [];
  const taxDtls = data.taxDetails || [];
  const terms   = data.terms     || {};
  const isIGST  = inv.isIgstApplicable === true || inv.isIgstApplicable === "Yes";

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
      doc.text(`Other Sales Invoice — ${inv.salesInvoiceNo || ""}`, PAGE_W / 2, y + 15, { align: "center" });
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
  doc.text("OTHER SALES INVOICE", PAGE_W / 2, y + 26, { align: "center" });
  doc.setTextColor(...C.black);
  y += 40;

  /* ================================================================ */
  /* 2. HEADER BLOCK — left: company/customer | right: doc fields     */
  /* ================================================================ */
  const LEFT_X  = M + 8;
  const RIGHT_X = PAGE_W / 2 + 30;
  const HEADER_H = 160;

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

  leftRow("Plant :", inv.plantId);
  leftRow("Customer :", inv.customerName);
  leftRow("Customer Code :", inv.customerCode);
  leftRow("Doc Type :", inv.docType);
  leftRow("Invoice Type :", inv.invoiceType);

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

  rightRow("Invoice No :", inv.salesInvoiceNo);
  rightRow("Invoice Date :", inv.invoiceDate);
  rightRow("Currency :", inv.currency);
  rightRow("GSTN No :", inv.gstnNo);
  rightRow("Belongs To :", inv.belongsTo);
  rightRow("Gross Amount :", fmt(inv.grossAmount));
  rightRow("Vehicle :", inv.vehicle);

  doc.setTextColor(...C.black);
  y += HEADER_H;

  /* ================================================================ */
  /* 3. SECONDARY HEADER ROW — time, exchange rate, toggles            */
  /* ================================================================ */
  checkPageBreak(28);
  doc.setFillColor(...C.white);
  doc.setDrawColor(...C.primary);
  doc.setLineWidth(0.5);
  doc.rect(M, y, CW, 20, "FD");

  setFont("helvetica", 8, "bold");
  doc.setTextColor(...C.gray900);

  let hx = M + 8;
  const secField = (label, val) => {
    doc.text(label, hx, y + 13);
    setFont("helvetica", 8, "normal");
    doc.setTextColor(...C.gray500);
    hx += doc.getTextWidth(label) + 4;
    doc.text(String(val ?? "—"), hx, y + 13);
    hx += doc.getTextWidth(String(val ?? "—")) + 16;
    setFont("helvetica", 8, "bold");
    doc.setTextColor(...C.gray900);
  };

  secField("Time of Issue:", inv.timeOfIssue);
  secField("Time of Removal:", inv.timeOfRemoval);
  secField("Exchange Rate:", inv.exchangeRate);
  secField("Month:", inv.monthYear);

  doc.setTextColor(...C.black);
  y += 24;

  /* ================================================================ */
  /* 4. ITEMS TABLE                                                    */
  /* ================================================================ */
  sectionHeading("Item Details");

  const baseHeaders = ["S.No", "Item Code", "Description", "HSN/SAC", "Tax Type", "Tax %", "Unit", "Stock", "Customer Part No", "Tariff No"];
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
      item.hsnSacCode || "",
      item.taxType || "",
      item.taxPerc != null ? String(item.taxPerc) : "",
      item.unit || "",
      item.stock != null ? String(item.stock) : "",
      item.customerPartNo || "",
      item.tariffNo || "",
    ];
    if (isIGST) {
      row.push(
        item.taxPerc != null ? String(item.taxPerc) : "",
        "",
      );
    } else {
      row.push(
        item.taxPerc != null ? String(item.taxPerc) : "",
        "",
        item.taxPerc != null ? String(item.taxPerc) : "",
        "",
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
      0: { cellWidth: 20, halign: "center" },
      5: { halign: "right" },
      7: { halign: "right" },
    },
    didDrawPage: (eventData) => { y = eventData.cursor.y; },
  });

  y = (itemTableResult && itemTableResult.finalY ? itemTableResult.finalY : y) + 12;

  /* ================================================================ */
  /* 5. TAX DETAILS TABLE                                              */
  /* ================================================================ */
  if (taxDtls.length > 0) {
    sectionHeading("Tax Details");
    const taxRows = taxDtls.map((tax, idx) => [
      idx + 1,
      tax.particulars || "",
      tax.taxId || "",
      tax.taxPerc != null ? String(tax.taxPerc) : "",
      fmt(tax.acceptedQtyAmount),
      fmt(tax.revisedAmount),
      tax.glAccountName || "",
    ]);
    const taxResult = autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      head: [["S.No", "Particulars", "Tax ID", "Tax %", "Accepted Amt", "Revised Amt", "GL Account"]],
      body: taxRows,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 3, lineColor: [...C.gray200], lineWidth: 0.5, overflow: "linebreak", textColor: C.gray900 },
      headStyles: { fillColor: C.white, textColor: C.primary, fontStyle: "bold", fontSize: 8, halign: "center", cellPadding: 3, lineColor: C.primary, lineWidth: 0.5 },
      columnStyles: { 0: { cellWidth: 25, halign: "center" }, 4: { halign: "right" }, 5: { halign: "right" } },
      didDrawPage: (eventData) => { y = eventData.cursor.y; },
    });
    y = (taxResult && taxResult.finalY ? taxResult.finalY : y) + 12;
  }

  /* ================================================================ */
  /* 6. TERMS & CONDITIONS                                             */
  /* ================================================================ */
  sectionHeading("Terms & Conditions");

  const TERMS_LABEL_COL = M + 8;
  const TERMS_COLON_COL = M + 240;
  const TERMS_VAL_COL   = M + 250;
  const TERMS_VAL_MAX_W = CW - 260;
  const TERMS_ROW_PAD   = 14;
  const TERMS_HEADER_H  = 20;

  const amountInWords = terms.amountInWords || (inv.grossAmount ? numberToWords(Number(inv.grossAmount)) : "");

  const allPairs = [
    ["Total Insurance",       fmt(terms.totalInsurance)],
    ["Total Freight",         fmt(terms.totalFreight)],
    ["Total Assessable Value", fmt(terms.totalAssessableValue)],
    ["Mode of Transport",     terms.modeOfTransport || "—"],
    ["Sales Tax",             fmt(terms.salesTax)],
    ["Gross Amount",          fmt(terms.grossAmount)],
    ["Amount in Words",       amountInWords || "—"],
    ["Delivery To",           terms.deliveryTo || "—"],
    ["Payment Terms",         terms.paymentTerms || "—"],
    ["Narration",             terms.narration || "—"],
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
  /* 7. FOOTER                                                         */
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

  const fileName = `Other_Sales_Invoice_${inv.salesInvoiceNo || "document"}.pdf`;
  const pdfArrayBuffer = doc.output("arraybuffer");
  const pdfBlob = new Blob([pdfArrayBuffer], { type: "application/pdf" });
  const blobUrl = URL.createObjectURL(pdfBlob);

  return { blobUrl, fileName, doc };
}

export default generateOtherSalesInvoicePDF;

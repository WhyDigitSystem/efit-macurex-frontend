import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ================================================================ */
/* PROJECT COLOR PALETTE (same as quotation / purchase contract)     */
/* ================================================================ */
const C = {
  primary: [37, 99, 235], // #2563eb  blue-600
  primaryDk: [29, 78, 216], // #1d4ed8  blue-700
  primaryLt: [59, 130, 246], // #3b82f6  blue-500
  primaryTint: [239, 246, 255], // #eff6ff  blue-50
  white: [255, 255, 255],
  black: [0, 0, 0],
  gray100: [243, 244, 246], // #f3f4f6
  gray200: [229, 231, 235], // #e5e7eb
  gray500: [107, 114, 128], // #6b7280
  gray900: [17, 24, 39], // #111827
};

/**
 * Generate a professional Purchase Indent PDF — project themed.
 * Layout/logic mirrors generateQuotationPDF.js / generatePurchaseContractPDF.js exactly.
 *
 * @param {Object} data
 * @param {Object}   data.company  - { name }
 * @param {Object}   data.indent   - { id, indentNo, plantId, belongsTo, indentDate, department,
 *                                     preparedBy, byWhom, approved, active, remarks, cancelRemarks }
 * @param {Array}    data.items    - [{ itemCode, itemDescription, primaryUnitLabel, purchaseUnitLabel,
 *                                     qtyInPrimaryUnit, conversionFactor, qtyInPurchaseUnit,
 *                                     requiredDate, purpose }]
 */
export function generatePurchaseIndentPDF(data) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const PAGE_W = doc.internal.pageSize.getWidth();
  const PAGE_H = doc.internal.pageSize.getHeight();
  const M = 30;
  const CW = PAGE_W - M * 2;

  let y = M;

  const company = data.company || {};
  const indent = data.indent || {};
  const items = data.items || [];

  /* ---- helpers ---- */
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
      doc.text(
        `${company.name || "Company Name"} — PURCHASE INDENT`,
        PAGE_W / 2,
        y + 15,
        { align: "center" },
      );
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
  /* 1. TOP TITLE BAR — white bg, blue text                            */
  /* ================================================================ */
  doc.setFillColor(...C.white);
  doc.setDrawColor(...C.primary);
  doc.setLineWidth(0.8);
  doc.rect(M, y, CW, 40, "FD");
  setFont("helvetica", 14, "bold");
  doc.setTextColor(...C.primary);
  doc.text("PURCHASE INDENT", PAGE_W / 2, y + 26, { align: "center" });
  doc.setTextColor(...C.black);
  y += 40;

  /* ================================================================ */
  /* 2. HEADER BLOCK — company (left) | indent details (right)         */
  /* ================================================================ */
  const leftRows = [
    ["Plant :", indent.plantId],
    ["Belongs To :", indent.belongsTo],
    ["Department :", indent.department],
    ["Prepared By :", indent.preparedBy],
    ["By Whom :", indent.byWhom],
  ];

  const rightRows = [
    ["Indent No :", indent.indentNo],
    ["Indent Date :", indent.indentDate],
    ["Approved :", indent.approved ? "Yes" : "No"],
    ["Status :", indent.active ? "Active" : "Inactive"],
  ];

  const LEFT_COMPANY_BLOCK_H = 58; // name + sub-name + 2 address lines
  const leftContentH = LEFT_COMPANY_BLOCK_H + leftRows.length * 12;
  const rightContentH = 18 + rightRows.length * 14;
  const HEADER_H = Math.max(leftContentH, rightContentH) + 16;

  doc.setDrawColor(...C.primary);
  doc.setLineWidth(0.8);
  doc.rect(M, y, CW, HEADER_H);
  doc.setDrawColor(...C.gray200);
  doc.setLineWidth(0.5);
  doc.line(PAGE_W / 2 + 20, y, PAGE_W / 2 + 20, y + HEADER_H);

  /* ---- Left: company info ---- */
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
  leftRows.forEach(([label, value]) => leftRow(label, value));

  /* ---- Right: document details ---- */
  let ry = y + 18;
  const rx = PAGE_W / 2 + 30;
  doc.setFontSize(8);
  const rightRow = (label, value) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...C.gray900);
    doc.text(label, rx, ry);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.gray500);
    doc.text(String(value || ""), rx + 100, ry);
    ry += 14;
  };
  rightRows.forEach(([label, value]) => rightRow(label, value));

  doc.setTextColor(...C.black);
  y += HEADER_H;

  /* ================================================================ */
  /* 3. ITEM DETAILS TABLE                                             */
  /* ================================================================ */
  sectionHeading("Item Details");

  const itemRows = items.map((item, idx) => [
    idx + 1,
    item.itemCode || "",
    item.itemDescription || "",
    item.primaryUnitLabel || "",
    item.purchaseUnitLabel || "",
    item.qtyInPrimaryUnit != null ? fmt(item.qtyInPrimaryUnit) : "",
    item.conversionFactor != null ? String(item.conversionFactor) : "",
    item.qtyInPurchaseUnit != null ? fmt(item.qtyInPurchaseUnit) : "",
    item.requiredDate || "",
    item.purpose || "",
  ]);

  const itemTableResult = autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    head: [
      [
        "S.No",
        "Item Code",
        "Description",
        "Primary Unit",
        "Purchase Unit",
        "Qty (Primary)",
        "Conv. Factor",
        "Qty (Purchase)",
        "Required Date",
        "Purpose",
      ],
    ],
    body: itemRows,
    theme: "grid",
    styles: {
      fontSize: 7,
      cellPadding: 2,
      lineColor: [...C.gray200],
      lineWidth: 0.5,
      overflow: "linebreak",
      textColor: C.gray900,
    },
    headStyles: {
      fillColor: C.white,
      textColor: C.primary,
      fontStyle: "bold",
      fontSize: 7,
      halign: "center",
      cellPadding: 2,
      lineColor: C.primary,
      lineWidth: 0.5,
    },
    columnStyles: {
      0: { cellWidth: 24, halign: "center" },
      5: { halign: "right" },
      6: { halign: "right" },
      7: { halign: "right" },
    },
    didDrawPage: (eventData) => {
      y = eventData.cursor.y;
    },
  });

  y =
    (itemTableResult && itemTableResult.finalY ? itemTableResult.finalY : y) +
    12;

  /* ================================================================ */
  /* 4. SUMMARY / REMARKS                                              */
  /* ================================================================ */
  sectionHeading("Summary");

  const TERMS_LABEL_COL = M + 8;
  const TERMS_COLON_COL = M + 240;
  const TERMS_VAL_COL = M + 250;
  const TERMS_VAL_MAX_W = CW - 260;
  const TERMS_ROW_PAD = 14;

  /* Pre-calculate row heights */
  const allPairs = [
    ["Remarks", indent.remarks],
    ["Cancel Remarks", indent.cancelRemarks],
  ];

  const rowHeights = allPairs.map(([, value]) => {
    const lines = doc.splitTextToSize(String(value || "—"), TERMS_VAL_MAX_W);
    return Math.max(lines.length * 10 + 4, TERMS_ROW_PAD);
  });

  const TERMS_HEADER_H = 20;
  const totalTermsContentH = rowHeights.reduce((a, b) => a + b, 0);
  const totalTermsH = totalTermsContentH + TERMS_HEADER_H + 8;

  checkPageBreak(totalTermsH + 10);

  /* Summary block rect */
  doc.setDrawColor(...C.primary);
  doc.setLineWidth(0.5);
  doc.setFillColor(...C.white);
  doc.rect(M, y, CW, totalTermsH, "FD");

  /* Header row */
  doc.setFillColor(...C.white);
  doc.setDrawColor(...C.primary);
  doc.setLineWidth(0.5);
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

    /* row separator */
    doc.setDrawColor(...C.gray200);
    doc.setLineWidth(0.3);
    doc.line(M + 4, ty + rowH - 2, PAGE_W - M - 4, ty + rowH - 2);

    ty += rowH;
  });

  doc.setTextColor(...C.black);
  y += totalTermsH;

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
  doc.text(`Page ${doc.internal.getNumberOfPages()}`, PAGE_W / 2, y + 18, {
    align: "center",
  });
  doc.text(`Generated by: ${generatedBy}`, PAGE_W - M - 8, y + 18, {
    align: "right",
  });

  doc.setTextColor(...C.black);

  /* ================================================================ */
  /* OUTPUT                                                            */
  /* ================================================================ */
  const fileName = `PurchaseIndent_${indent.indentNo || indent.id || "document"}.pdf`;

  const pdfArrayBuffer = doc.output("arraybuffer");
  const pdfBlob = new Blob([pdfArrayBuffer], { type: "application/pdf" });
  const blobUrl = URL.createObjectURL(pdfBlob);

  return { blobUrl, fileName, doc };
}

export default generatePurchaseIndentPDF;

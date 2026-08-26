import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ================================================================ */
/* PROJECT COLOR PALETTE (from tailwind.config / Profile.jsx theme)  */
/* ================================================================ */
const C = {
  primary:    [37, 99, 235],    // #2563eb  blue-600
  primaryDk:  [29, 78, 216],    // #1d4ed8  blue-700
  primaryLt:  [59, 130, 246],   // #3b82f6  blue-500
  primaryTint:[239, 246, 255],  // #eff6ff  blue-50
  white:      [255, 255, 255],
  black:      [0, 0, 0],
  gray100:    [243, 244, 246],  // #f3f4f6
  gray200:    [229, 231, 235],  // #e5e7eb
  gray500:    [107, 114, 128],  // #6b7280
  gray900:    [17, 24, 39],     // #111827
};

/**
 * Generate a professional Enquiry Report PDF — project themed.
 */
export function generateEnquiryReportPDF(data) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const PAGE_W = doc.internal.pageSize.getWidth();
  const PAGE_H = doc.internal.pageSize.getHeight();
  const M = 30;
  const CW = PAGE_W - M * 2;

  let y = M;

  const company = data.company || {};
  const enq = data.enquiry || {};
  const items = data.items || [];
  const terms = data.terms || {};

  /* ---- helpers ---- */
  const setFont = (f, s, style) => {
    doc.setFont(f || "helvetica", style || "normal");
    doc.setFontSize(s || 10);
  };

  const checkPageBreak = (needed) => {
    if (y + needed > PAGE_H - M - 30) {
      doc.addPage();
      y = M;
      /* continuation header */
      doc.setFillColor(...C.white);
      doc.setDrawColor(...C.primary);
      doc.setLineWidth(0.5);
      doc.rect(M, y, CW, 24, "FD");
      setFont("helvetica", 8, "bold");
      doc.setTextColor(...C.primary);
      doc.text(`${company.name || "Company Name"} — ENQUIRY REPORT`, PAGE_W / 2, y + 15, { align: "center" });
      doc.setTextColor(...C.black);
      y += 30;
    }
  };

  /* ================================================================ */
  /* 1. TOP TITLE BAR — blue filled header                             */
  /* ================================================================ */
  doc.setFillColor(...C.white);
  doc.setDrawColor(...C.primary);
  doc.setLineWidth(0.8);
  doc.rect(M, y, CW, 40, "FD");
  setFont("helvetica", 14, "bold");
  doc.setTextColor(...C.primary);
  doc.text("ENQUIRY REPORT", PAGE_W / 2, y + 26, { align: "center" });
  doc.setTextColor(...C.black);
  y += 40;

  /* ================================================================ */
  /* 2. HEADER BLOCK — company (left) | enquiry details (right)        */
  /* ================================================================ */
  const HEADER_H = 140;
  doc.setDrawColor(...C.primary);
  doc.setLineWidth(0.8);
  doc.rect(M, y, CW, HEADER_H);
  /* vertical divider */
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

  doc.setTextColor(...C.black);
  ly += 14;

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
  leftRow("Plant Id :", enq.plantId);
  leftRow("Enquiry Type :", enq.enquiryType);
  leftRow("Contact Name :", enq.contactName);

  /* Party name (may wrap) */
  if (enq.partyName) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...C.gray900);
    doc.text("Party Name :", M + 8, ly);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.gray500);
    const partyLines = doc.splitTextToSize(enq.partyName, CW / 2 - 60);
    doc.text(partyLines, M + 80, ly);
    ly += partyLines.length * 10 + 2;
  }

  /* ---- Right: document numbers ---- */
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
  rightRow("Enquiry No :", enq.enquiryNo);
  rightRow("Enquiry Date :", enq.enquiryDate);
  rightRow("Enquiry Due Date :", enq.enquiryDueDate);
  rightRow("Party Id :", enq.partyId);
  rightRow("Party Ref.No :", enq.partyRefNo);
  rightRow("Party Ref.Date :", enq.partyRefDate);

  doc.setTextColor(...C.black);
  y += HEADER_H;

  /* ================================================================ */
  /* 3. ENQUIRY DETAILS SECTION HEADING                                */
  /* ================================================================ */
  y += 10;
  checkPageBreak(20);
  /* Section heading */
  doc.setFillColor(...C.white);
  doc.setDrawColor(...C.primary);
  doc.setLineWidth(0.5);
  doc.rect(M, y - 2, CW, 18, "FD");
  setFont("helvetica", 9, "bold");
  doc.setTextColor(...C.primary);
  doc.text("Enquiry Details", M + 6, y + 10);
  doc.setTextColor(...C.black);
  y += 20;

  /* ================================================================ */
  /* 4. ITEM TABLE — blue header, blue-50 alternating rows             */
  /* ================================================================ */
  const tableRows = items.map((item) => [
    item.contactPartNo || "",
    item.itemDescription || "",
    item.annualQty != null ? String(item.annualQty) : "",
    item.dlryDate || "",
    item.needApproval || "",
    item.quoteDueDate || "",
    item.remarks || "",
  ]);

  const tableResult = autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    head: [
      [
        "Customer Part No",
        "Item Description",
        "Annual Qty",
        "Dlry. Date",
        "Need R&D Approval",
        "Quote Due Date",
        "Remarks",
      ],
    ],
    body: tableRows,
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
      2: { halign: "right" },
      3: { halign: "center" },
      4: { halign: "center" },
      5: { halign: "center" },
    },
    didDrawPage: (eventData) => {
      y = eventData.cursor.y;
    },
  });

  y = (tableResult && tableResult.finalY ? tableResult.finalY : y) + 14;

  /* ================================================================ */
  /* 5. TERMS AND CONDITIONS — dynamic height, no overlap              */
  /* ================================================================ */
  const termsPairs = [
    ["Any Additional Investment", terms.additionalInvestment],
    ["Additional Man Power", terms.additionalManPower],
    ["Likely Time Frame For Completion", terms.timeFrame],
    ["Expected Time For Delivery Sample", terms.expectedTime],
    ["Pilot Batch", terms.pilotBatch],
    ["Regular Production", terms.regularProduction],
    ["Initial Review Comments (Director Operations)", terms.reviewComments],
    ["Detail Review (Director Technical)", terms.detailReview],
    ["Statutory and Regulatory Req.", terms.statutory],
    ["Follow Up", terms.followUp],
    ["Remarks", terms.remarks],
    ["Conclusion", terms.conclusion],
  ];

  /* Pre-calculate actual row heights based on wrapped text */
  const TERMS_LABEL_COL = M + 8;
  const TERMS_COLON_COL = M + 240;
  const TERMS_VAL_COL = M + 250;
  const TERMS_VAL_MAX_W = CW - 260;
  const TERMS_ROW_PAD = 14; // min row height

  const rowHeights = termsPairs.map(([, value]) => {
    const valText = String(value || "Pending");
    const lines = doc.splitTextToSize(valText, TERMS_VAL_MAX_W);
    return Math.max(lines.length * 10 + 4, TERMS_ROW_PAD);
  });

  const totalTermsContentH = rowHeights.reduce((a, b) => a + b, 0);
  const TERMS_HEADER_H = 20;
  const totalTermsH = totalTermsContentH + TERMS_HEADER_H + 8;

  checkPageBreak(totalTermsH + 10);

  /* Section heading — blue text on blue-50 background */
  /* Section heading */
  doc.setFillColor(...C.white);
  doc.setDrawColor(...C.primary);
  doc.setLineWidth(0.5);
  doc.rect(M, y - 2, CW, 18, "FD");
  setFont("helvetica", 9, "bold");
  doc.setTextColor(...C.primary);
  doc.text("Terms And Conditions", M + 6, y + 10);
  doc.setTextColor(...C.black);
  y += 20;

  /* Draw terms block rect */
  doc.setDrawColor(...C.primary);
  doc.setLineWidth(0.5);
  doc.setFillColor(...C.white);
  doc.rect(M, y, CW, totalTermsH, "FD");

  /* Header row inside terms */
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

  termsPairs.forEach(([label, value], idx) => {
    const rowH = rowHeights[idx];

    setFont("helvetica", 8, "bold");
    doc.setTextColor(...C.gray900);
    doc.text(label, TERMS_LABEL_COL, ty + 8);

    doc.text(":", TERMS_COLON_COL, ty + 8);

    setFont("helvetica", 8, "normal");
    doc.setTextColor(...C.gray500);
    const valLines = doc.splitTextToSize(
      String(value || "Pending"),
      TERMS_VAL_MAX_W
    );
    doc.text(valLines, TERMS_VAL_COL, ty + 8);

    /* subtle row separator */
    doc.setDrawColor(...C.gray200);
    doc.setLineWidth(0.3);
    doc.line(M + 4, ty + rowH - 2, PAGE_W - M - 4, ty + rowH - 2);

    ty += rowH;
  });

  doc.setTextColor(...C.black);
  y += totalTermsH;

  /* ================================================================ */
  /* 6. FOOTER — blue-tinted rect                                      */
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
  doc.text(
    `Page ${doc.internal.getNumberOfPages()}`,
    PAGE_W / 2,
    y + 18,
    { align: "center" },
  );
  doc.text(`Generated by: ${generatedBy}`, PAGE_W - M - 8, y + 18, {
    align: "right",
  });

  doc.setTextColor(...C.black);

  /* ================================================================ */
  /* OUTPUT                                                            */
  /* ================================================================ */
  const fileName = `Enquiry_Report_${enq.enquiryNo || "document"}.pdf`;

  const pdfArrayBuffer = doc.output("arraybuffer");
  const pdfBlob = new Blob([pdfArrayBuffer], { type: "application/pdf" });
  const blobUrl = URL.createObjectURL(pdfBlob);

  return { blobUrl, fileName, doc };
}

export default generateEnquiryReportPDF;

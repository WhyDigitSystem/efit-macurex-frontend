import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { companySetupAPI } from "../api/companySetupApi";

/* ================================================================ */
/* PROJECT COLOR PALETTE (same as quotation report)                  */
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

const fmtAmount = (n) =>
  (Number(n) || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/** Title-case a string like "BENGALURU" -> "Bengaluru" */
const titleCase = (str = "") =>
  str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

/** Build the address lines array from the company object's location fields */
const buildAddressLines = (company) => {
  const lines = [];
  if (company.registeredAddress) lines.push(company.registeredAddress);

  const cityName =
    company.city && typeof company.city === "object"
      ? company.city.cityName
      : company.city;
  const stateName =
    company.state && typeof company.state === "object"
      ? company.state.stateName
      : company.state;
  const countryName =
    company.country && typeof company.country === "object"
      ? company.country.countryName
      : company.country;

  const cityStateLine = [
    titleCase(cityName),
    titleCase(stateName),
    company.pincode,
  ]
    .filter(Boolean)
    .join(", ");
  if (cityStateLine) lines.push(cityStateLine);
  if (countryName) lines.push(titleCase(countryName));

  return lines;
};

/* ================================================================ */
/* Main generator — same design & page-flow logic as the Quotation   */
/* PDF (top title bar, bordered header block, blue section headings, */
/* dynamic Field/Value block, generated-by footer), returning        */
/* { blobUrl, fileName, doc } so it can be used with PDFPreviewModal  */
/* exactly like the Quotation flow.                                  */
/* ================================================================ */
/**
 * @param {Object} bill - a row from PurchaseBillList's purchaseData
 */
export async function generatePurchaseBillPdf(bill) {
  const orgId = localStorage.getItem("orgId");
  let company = {};

  try {
    company = (await companySetupAPI.getCompanyById(orgId)) || {};
  } catch (err) {
    console.error("Error loading company for PDF:", err);
  }

  const addressLines = buildAddressLines(company);

  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const PAGE_W = doc.internal.pageSize.getWidth();
  const PAGE_H = doc.internal.pageSize.getHeight();
  const M = 30;
  const CW = PAGE_W - M * 2;

  let y = M;

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
        `${company.companyName || "Company Name"} — PURCHASE BILL`,
        PAGE_W / 2,
        y + 15,
        {
          align: "center",
        },
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

  /* ================================================================ */
  /* 1. TOP TITLE BAR — white bg, blue text                            */
  /* ================================================================ */
  doc.setFillColor(...C.white);
  doc.setDrawColor(...C.primary);
  doc.setLineWidth(0.8);
  doc.rect(M, y, CW, 40, "FD");
  setFont("helvetica", 14, "bold");
  doc.setTextColor(...C.primary);
  doc.text("PURCHASE BILL", PAGE_W / 2, y + 26, { align: "center" });
  doc.setTextColor(...C.black);
  y += 40;

  /* ================================================================ */
  /* 2. HEADER BLOCK — company (left) | bill details (right)           */
  /* ================================================================ */
  const HEADER_H = 130;
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
  doc.text(company.companyName || "Company Name", M + 8, ly);
  ly += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.gray500);
  addressLines.forEach((line) => {
    doc.text(line, M + 8, ly);
    ly += 11;
  });
  ly += 3;
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
  if (company.gst) leftRow("GSTIN :", company.gst);
  if (company.panNo) leftRow("PAN :", company.panNo);
  if (company.cin) leftRow("CIN :", company.cin);
  ly += 4;
  leftRow("Supplier :", bill.supplierName);

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
    doc.text(String(value ?? ""), rx + 90, ry);
    ry += 14;
  };
  rightRow("PB No :", bill.pbNo || "");
  rightRow("PB Date :", bill.pbDate || "");
  rightRow("GRN No :", bill.grnNo || "");
  rightRow("Status :", bill.status || "");

  doc.setTextColor(...C.black);
  y += HEADER_H;

  /* ================================================================ */
  /* 3. AMOUNT SUMMARY                                                 */
  /* ================================================================ */
  sectionHeading("Amount Summary");

  const amountRows = [["Total Amount", fmtAmount(bill.totalAmount)]];

  const amountTableResult = autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    head: [["Particulars", "Amount"]],
    body: amountRows,
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 3,
      lineColor: [...C.gray200],
      lineWidth: 0.5,
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
      1: { halign: "right" },
    },
    didParseCell: (data) => {
      data.cell.styles.fontStyle = "bold";
    },
    didDrawPage: (eventData) => {
      y = eventData.cursor.y;
    },
  });

  y =
    (amountTableResult && amountTableResult.finalY
      ? amountTableResult.finalY
      : y) + 12;

  /* ================================================================ */
  /* 4. SIGNATURE ROW                                                  */
  /* ================================================================ */
  checkPageBreak(40);
  doc.setDrawColor(...C.primary);
  doc.setLineWidth(0.5);
  doc.setFillColor(...C.white);
  doc.rect(M, y, CW, 30, "FD");
  setFont("helvetica", 9, "normal");
  doc.setTextColor(...C.gray900);
  doc.text("Prepared By", M + 8, y + 20);
  doc.text("Checked By", PAGE_W / 2 - 20, y + 20);
  doc.text(`For ${company.companyName || ""}`, PAGE_W - M - 8, y + 20, {
    align: "right",
  });
  doc.setTextColor(...C.black);
  y += 30;

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
  /* OUTPUT — same blob-preview pattern as the Quotation PDF           */
  /* ================================================================ */
  const fileName = `PurchaseBill_${(bill.pbNo || "document").replace(/\//g, "-")}.pdf`;

  const pdfArrayBuffer = doc.output("arraybuffer");
  const pdfBlob = new Blob([pdfArrayBuffer], { type: "application/pdf" });
  const blobUrl = URL.createObjectURL(pdfBlob);

  return { blobUrl, fileName, doc };
}

export default generatePurchaseBillPdf;

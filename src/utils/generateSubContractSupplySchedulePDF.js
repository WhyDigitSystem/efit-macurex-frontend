import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { companySetupAPI } from "../api/companySetupApi";

/* ================================================================ */
/* PROJECT COLOR PALETTE (same as other reports)                     */
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

const fmtDate = (d) => {
  if (!d) return "";
  const s = String(d);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, day] = s.split("-");
    return `${day}-${m}-${y}`;
  }
  return s;
};

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
/* Main generator — same design & page-flow logic as other reports.  */
/* ================================================================ */
/**
 * @param {Object} record - a row from SubContractSupplyScheduleList's data
 *                          (header fields + scheduleItemDetails array + schedule array + summary)
 */
export async function generateSubContractSupplySchedulePDF(record) {
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
        `${company.companyName || "Company Name"} — SUB CONTRACT SUPPLY SCHEDULE`,
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

  /* ================================================================ */
  /* 1. TOP TITLE BAR — white bg, blue text                            */
  /* ================================================================ */
  doc.setFillColor(...C.white);
  doc.setDrawColor(...C.primary);
  doc.setLineWidth(0.8);
  doc.rect(M, y, CW, 40, "FD");
  setFont("helvetica", 14, "bold");
  doc.setTextColor(...C.primary);
  doc.text("SUB CONTRACT SUPPLY SCHEDULE", PAGE_W / 2, y + 26, {
    align: "center",
  });
  doc.setTextColor(...C.black);
  y += 40;

  /* ================================================================ */
  /* 2. HEADER BLOCK — company/party (left) | schedule details (right)*/
  /* ================================================================ */
  const HEADER_H = 150;
  doc.setDrawColor(...C.primary);
  doc.setLineWidth(0.8);
  doc.rect(M, y, CW, HEADER_H);
  doc.setDrawColor(...C.gray200);
  doc.setLineWidth(0.5);
  doc.line(PAGE_W / 2 + 20, y, PAGE_W / 2 + 20, y + HEADER_H);

  /* ---- Left: company info + party ---- */
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
  leftRow("Plant Id :", record.plantId);
  leftRow("Belongs To :", record.belongsTo);
  leftRow("Party Name :", record.partyName);
  leftRow("Contract No :", record.contractNo);
  leftRow("Job Order No :", record.jobOrderNo);

  /* ---- Right: schedule/document numbers ---- */
  let ry = y + 18;
  const rx = PAGE_W / 2 + 30;
  doc.setFontSize(8);
  const rightRow = (label, value) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...C.gray900);
    doc.text(label, rx, ry);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.gray500);
    doc.text(String(value ?? ""), rx + 100, ry);
    ry += 14;
  };
  rightRow("Doc No :", record.docNo || "");
  rightRow("Doc Date :", fmtDate(record.docDate));
  rightRow("Sch. Start Date :", fmtDate(record.schStartDate));
  rightRow("Sch. End Date :", fmtDate(record.schEndDate));
  rightRow("Date :", fmtDate(record.date));
  rightRow("Status :", record.active !== false ? "Active" : "Inactive");

  doc.setTextColor(...C.black);
  y += HEADER_H;

  /* ================================================================ */
  /* 3. SCHEDULE ITEM DETAILS TABLE                                    */
  /* ================================================================ */
  sectionHeading("Schedule Item Details");

  const items = record.scheduleItemDetails || record.scheduleItemDetail || [];

  const itemRows = items.map((d, idx) => [
    idx + 1,
    d.itemCode || "",
    d.itemDescription || "",
    d.primaryUnit || d.unit || "",
    d.stock ?? "",
    d.qty ?? "",
    fmtAmount(d.rate),
  ]);

  const itemTableResult = autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    head: [
      ["S.No", "Item Code", "Item Description", "Unit", "Stock", "Qty", "Rate"],
    ],
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
      0: { cellWidth: 28, halign: "center" },
      3: { halign: "center" },
      4: { halign: "right" },
      5: { halign: "right" },
      6: { halign: "right" },
    },
    didDrawPage: (eventData) => {
      y = eventData.cursor.y;
    },
  });

  y =
    (itemTableResult && itemTableResult.finalY ? itemTableResult.finalY : y) +
    12;

  /* ================================================================ */
  /* 4. SCHEDULE SECTION TABLE (plan dates & quantities)               */
  /* ================================================================ */
  sectionHeading("Supply Schedule");

  const schedule = record.schedule || record.supplySchedule || [];

  const scheduleRows = schedule.map((d, idx) => [
    idx + 1,
    fmtDate(d.planDate),
    d.scheduleQty ?? "",
  ]);

  const scheduleTableResult = autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    head: [["S.No", "Plan Date", "Schedule Qty"]],
    body: scheduleRows,
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
      0: { cellWidth: 40, halign: "center" },
      1: { halign: "center" },
      2: { halign: "right" },
    },
    didDrawPage: (eventData) => {
      y = eventData.cursor.y;
    },
  });

  y =
    (scheduleTableResult && scheduleTableResult.finalY
      ? scheduleTableResult.finalY
      : y) + 12;

  /* ================================================================ */
  /* 5. SUMMARY BLOCK                                                  */
  /* ================================================================ */
  sectionHeading("Summary");

  const summaryMap = record.summary || {};

  const TERMS_LABEL_COL = M + 8;
  const TERMS_COLON_COL = M + 150;
  const TERMS_VAL_COL = M + 160;
  const TERMS_VAL_MAX_W = CW - 170;
  const TERMS_ROW_PAD = 14;

  const allPairs = [
    ["Prepared By", summaryMap.preparedBy || ""],
    ["Authorised By", summaryMap.authorizedBy || ""],
    ["Remarks", summaryMap.remarks || ""],
  ];

  const rowHeights = allPairs.map(([, value]) => {
    const lines = doc.splitTextToSize(String(value || "—"), TERMS_VAL_MAX_W);
    return Math.max(lines.length * 10 + 4, TERMS_ROW_PAD);
  });

  const TERMS_HEADER_H = 20;
  const totalTermsContentH = rowHeights.reduce((a, b) => a + b, 0);
  const totalTermsH = totalTermsContentH + TERMS_HEADER_H + 8;

  checkPageBreak(totalTermsH + 10);

  doc.setDrawColor(...C.primary);
  doc.setLineWidth(0.5);
  doc.setFillColor(...C.white);
  doc.rect(M, y, CW, totalTermsH, "FD");

  doc.setFillColor(...C.white);
  doc.setDrawColor(...C.primary);
  doc.setLineWidth(0.5);
  doc.rect(M, y, CW, TERMS_HEADER_H, "FD");
  setFont("helvetica", 8, "bold");
  doc.setTextColor(...C.primary);
  doc.text("Field", TERMS_LABEL_COL, y + 13);
  doc.text("Value", TERMS_VAL_COL, y + 13);
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
  /* 6. SIGNATURE ROW                                                  */
  /* ================================================================ */
  checkPageBreak(40);
  doc.setDrawColor(...C.primary);
  doc.setLineWidth(0.5);
  doc.setFillColor(...C.white);
  doc.rect(M, y, CW, 30, "FD");
  setFont("helvetica", 9, "normal");
  doc.setTextColor(...C.gray900);
  doc.text(
    `Prepared By : ${summaryMap.preparedBy || ""}`,
    M + 8,
    y + 20,
  );
  doc.text(
    `Authorised By : ${summaryMap.authorizedBy || ""}`,
    PAGE_W / 2 - 20,
    y + 20,
  );
  doc.text(`For ${company.companyName || ""}`, PAGE_W - M - 8, y + 20, {
    align: "right",
  });
  doc.setTextColor(...C.black);
  y += 30;

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
  doc.text(`Page ${doc.internal.getNumberOfPages()}`, PAGE_W / 2, y + 18, {
    align: "center",
  });
  doc.text(`Generated by: ${generatedBy}`, PAGE_W - M - 8, y + 18, {
    align: "right",
  });

  doc.setTextColor(...C.black);

  /* ================================================================ */
  /* OUTPUT — blob-preview pattern                                     */
  /* ================================================================ */
  const fileName = `SubContractSupplySchedule_${(record.docNo || "document").replace(/\//g, "-")}.pdf`;

  const pdfArrayBuffer = doc.output("arraybuffer");
  const pdfBlob = new Blob([pdfArrayBuffer], { type: "application/pdf" });
  const blobUrl = URL.createObjectURL(pdfBlob);

  return { blobUrl, fileName, doc };
}

export default generateSubContractSupplySchedulePDF;

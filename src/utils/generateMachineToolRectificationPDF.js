import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ================================================================ */
/* PROJECT COLOR PALETTE                                             */
/* ================================================================ */

const C = {
  primary: [37, 99, 235],
  primaryDk: [29, 78, 216],
  primaryLt: [59, 130, 246],
  primaryTint: [239, 246, 255],
  white: [255, 255, 255],
  black: [0, 0, 0],
  gray100: [243, 244, 246],
  gray200: [229, 231, 235],
  gray500: [107, 114, 128],
  gray900: [17, 24, 39],
};

/**
 * Generate Machine / Tool Rectification PDF
 *
 * Expected data:
 *
 * {
 *   company: { name },
 *   rectification: {
 *     id,
 *     header: {
 *       plant,
 *       docNo,
 *       department,
 *       date,
 *       breakdownNo,
 *       breakdownDate,
 *       attendBy,
 *       time,
 *       rectifiedOn,
 *       machineToolNo,
 *       rectificationTime,
 *       description,
 *       cause,
 *       maintenanceType,
 *       actionTaken,
 *       natureOfProblem,
 *       carriedOutBy,
 *       timeTakenForRectification,
 *       sparesUsed,
 *       location,
 *       preparedBy,
 *       remarks,
 *       approvedBy
 *     },
 *     active
 *   }
 * }
 */

export function generateMachineToolRectificationPDF(data) {
  const doc = new jsPDF({
    unit: "pt",
    format: "a4",
  });

  const PAGE_W = doc.internal.pageSize.getWidth();
  const PAGE_H = doc.internal.pageSize.getHeight();

  const M = 30;
  const CW = PAGE_W - M * 2;

  let y = M;

  const company = data?.company || {};
  const rectification = data?.rectification || {};
  const header = rectification?.header || {};

  /* ================================================================ */
  /* HELPERS                                                          */
  /* ================================================================ */

  const setFont = (font = "helvetica", size = 10, style = "normal") => {
    doc.setFont(font, style);
    doc.setFontSize(size);
  };

  const safeValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return "";
    }

    return String(value);
  };

  const checkPageBreak = (needed = 30) => {
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
        `${company.name || "Company Name"} — MACHINE / TOOL RECTIFICATION`,
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
  /* 1. TITLE                                                         */
  /* ================================================================ */

  doc.setFillColor(...C.white);
  doc.setDrawColor(...C.primary);
  doc.setLineWidth(0.8);

  doc.rect(M, y, CW, 40, "FD");

  setFont("helvetica", 14, "bold");

  doc.setTextColor(...C.primary);

  doc.text("MACHINE / TOOL RECTIFICATION", PAGE_W / 2, y + 26, {
    align: "center",
  });

  doc.setTextColor(...C.black);

  y += 40;

  /* ================================================================ */
  /* 2. BASIC INFORMATION                                             */
  /* ================================================================ */

  sectionHeading("Basic Information");

  const basicRows = [
    ["Plant ID", header.plant],
    ["Doc No.", header.docNo],
    ["Department", header.department],
    ["Date", header.date],
    ["Breakdown No.", header.breakdownNo],
    ["Breakdown Date", header.breakdownDate],
    ["Attend By", header.attendBy],
    ["Time", header.time],
    ["Rectified On", header.rectifiedOn],
    ["Machine No. / Tool No.", header.machineToolNo],
    ["Rectification Time", header.rectificationTime],
    ["Maintenance Type", header.maintenanceType],
    ["Location", header.location],
  ];

  const COL1_X = M + 8;
  const COL2_X = M + 150;
  const COL3_X = M + 305;
  const COL4_X = M + 445;

  const BASIC_ROW_H = 22;

  const basicRowsCount = Math.ceil(basicRows.length / 2);

  const BASIC_H = basicRowsCount * BASIC_ROW_H + 8;

  checkPageBreak(BASIC_H + 10);

  doc.setDrawColor(...C.primary);
  doc.setLineWidth(0.5);

  doc.rect(M, y, CW, BASIC_H);

  for (let i = 0; i < basicRowsCount; i++) {
    const left = basicRows[i * 2];
    const right = basicRows[i * 2 + 1];

    const rowY = y + 16 + i * BASIC_ROW_H;

    if (left) {
      setFont("helvetica", 8, "bold");

      doc.setTextColor(...C.gray900);

      doc.text(`${left[0]} :`, COL1_X, rowY);

      setFont("helvetica", 8, "normal");

      doc.setTextColor(...C.gray500);

      doc.text(safeValue(left[1]), COL2_X, rowY);
    }

    if (right) {
      setFont("helvetica", 8, "bold");

      doc.setTextColor(...C.gray900);

      doc.text(`${right[0]} :`, COL3_X, rowY);

      setFont("helvetica", 8, "normal");

      doc.setTextColor(...C.gray500);

      doc.text(safeValue(right[1]), COL4_X, rowY);
    }

    if (i < basicRowsCount - 1) {
      doc.setDrawColor(...C.gray200);
      doc.setLineWidth(0.3);

      doc.line(M + 4, rowY + 7, PAGE_W - M - 4, rowY + 7);
    }
  }

  doc.setTextColor(...C.black);

  y += BASIC_H;

  /* ================================================================ */
  /* 3. PROBLEM DETAILS                                               */
  /* ================================================================ */

  sectionHeading("Problem Details");

  const problemPairs = [
    ["Description", header.description],
    ["Cause", header.cause],
    ["Nature of Problem", header.natureOfProblem],
  ];

  const PROBLEM_LABEL_X = M + 8;
  const PROBLEM_VALUE_X = M + 150;
  const PROBLEM_VALUE_W = CW - 165;

  const problemHeights = problemPairs.map(([, value]) => {
    const lines = doc.splitTextToSize(safeValue(value) || "—", PROBLEM_VALUE_W);

    return Math.max(lines.length * 11 + 10, 28);
  });

  const problemTotalH = problemHeights.reduce((sum, h) => sum + h, 0) + 8;

  checkPageBreak(problemTotalH + 10);

  doc.setDrawColor(...C.primary);
  doc.setLineWidth(0.5);

  doc.rect(M, y, CW, problemTotalH);

  let py = y + 18;

  problemPairs.forEach(([label, value], index) => {
    const rowH = problemHeights[index];

    setFont("helvetica", 8, "bold");

    doc.setTextColor(...C.gray900);

    doc.text(label, PROBLEM_LABEL_X, py);

    doc.text(":", M + 135, py);

    setFont("helvetica", 8, "normal");

    doc.setTextColor(...C.gray500);

    const lines = doc.splitTextToSize(safeValue(value) || "—", PROBLEM_VALUE_W);

    doc.text(lines, PROBLEM_VALUE_X, py);

    if (index < problemPairs.length - 1) {
      doc.setDrawColor(...C.gray200);
      doc.setLineWidth(0.3);

      doc.line(M + 4, py + rowH - 7, PAGE_W - M - 4, py + rowH - 7);
    }

    py += rowH;
  });

  doc.setTextColor(...C.black);

  y += problemTotalH;

  /* ================================================================ */
  /* 4. RECTIFICATION DETAILS                                        */
  /* ================================================================ */

  sectionHeading("Rectification Details");

  const rectificationPairs = [
    ["Action Taken", header.actionTaken],
    ["Carried Out By", header.carriedOutBy],
    ["Time Taken for Rectification", header.timeTakenForRectification],
    ["Spares Used", header.sparesUsed],
    ["Approved By", header.approvedBy],
  ];

  const RECT_LABEL_X = M + 8;
  const RECT_VALUE_X = M + 190;
  const RECT_VALUE_W = CW - 205;

  const rectHeights = rectificationPairs.map(([, value]) => {
    const lines = doc.splitTextToSize(safeValue(value) || "—", RECT_VALUE_W);

    return Math.max(lines.length * 11 + 10, 24);
  });

  const rectTotalH = rectHeights.reduce((sum, h) => sum + h, 0) + 8;

  checkPageBreak(rectTotalH + 10);

  doc.setDrawColor(...C.primary);
  doc.setLineWidth(0.5);

  doc.rect(M, y, CW, rectTotalH);

  let ry = y + 17;

  rectificationPairs.forEach(([label, value], index) => {
    const rowH = rectHeights[index];

    setFont("helvetica", 8, "bold");

    doc.setTextColor(...C.gray900);

    doc.text(label, RECT_LABEL_X, ry);

    doc.text(":", M + 175, ry);

    setFont("helvetica", 8, "normal");

    doc.setTextColor(...C.gray500);

    const lines = doc.splitTextToSize(safeValue(value) || "—", RECT_VALUE_W);

    doc.text(lines, RECT_VALUE_X, ry);

    if (index < rectificationPairs.length - 1) {
      doc.setDrawColor(...C.gray200);
      doc.setLineWidth(0.3);

      doc.line(M + 4, ry + rowH - 7, PAGE_W - M - 4, ry + rowH - 7);
    }

    ry += rowH;
  });

  doc.setTextColor(...C.black);

  y += rectTotalH;

  /* ================================================================ */
  /* 5. REMARKS / STATUS                                              */
  /* ================================================================ */

  sectionHeading("Summary");

  const summaryPairs = [
    ["Remarks", header.remarks],
    ["Status", rectification.active === false ? "Inactive" : "Active"],
  ];

  const SUMMARY_LABEL_X = M + 8;
  const SUMMARY_VALUE_X = M + 150;
  const SUMMARY_VALUE_W = CW - 165;

  const summaryHeights = summaryPairs.map(([, value]) => {
    const lines = doc.splitTextToSize(safeValue(value) || "—", SUMMARY_VALUE_W);

    return Math.max(lines.length * 11 + 10, 24);
  });

  const summaryTotalH = summaryHeights.reduce((sum, h) => sum + h, 0) + 8;

  checkPageBreak(summaryTotalH + 10);

  doc.setDrawColor(...C.primary);
  doc.setLineWidth(0.5);

  doc.rect(M, y, CW, summaryTotalH);

  let sy = y + 17;

  summaryPairs.forEach(([label, value], index) => {
    const rowH = summaryHeights[index];

    setFont("helvetica", 8, "bold");

    doc.setTextColor(...C.gray900);

    doc.text(label, SUMMARY_LABEL_X, sy);

    doc.text(":", M + 135, sy);

    setFont("helvetica", 8, "normal");

    doc.setTextColor(...C.gray500);

    const lines = doc.splitTextToSize(safeValue(value) || "—", SUMMARY_VALUE_W);

    doc.text(lines, SUMMARY_VALUE_X, sy);

    if (index < summaryPairs.length - 1) {
      doc.setDrawColor(...C.gray200);
      doc.setLineWidth(0.3);

      doc.line(M + 4, sy + rowH - 7, PAGE_W - M - 4, sy + rowH - 7);
    }

    sy += rowH;
  });

  doc.setTextColor(...C.black);

  y += summaryTotalH;

  /* ================================================================ */
  /* 6. FOOTER                                                        */
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

  setFont("helvetica", 7, "normal");

  doc.setTextColor(...C.gray500);

  const now = new Date();

  const dateStr = now.toLocaleDateString("en-IN");

  const timeStr = now.toLocaleTimeString("en-IN");

  const generatedBy =
    localStorage.getItem("userName") ||
    localStorage.getItem("username") ||
    "System";

  doc.text(`Generated: ${dateStr} ${timeStr}`, M + 8, y + 18);

  doc.text(`Page ${doc.internal.getNumberOfPages()}`, PAGE_W / 2, y + 18, {
    align: "center",
  });

  doc.text(`Generated by: ${generatedBy}`, PAGE_W - M - 8, y + 18, {
    align: "right",
  });

  doc.setTextColor(...C.black);

  /* ================================================================ */
  /* OUTPUT                                                           */
  /* ================================================================ */

  const fileName = `MachineToolRectification_${
    header.docNo || rectification.id || "document"
  }.pdf`;

  const pdfArrayBuffer = doc.output("arraybuffer");

  const pdfBlob = new Blob([pdfArrayBuffer], {
    type: "application/pdf",
  });

  const blobUrl = URL.createObjectURL(pdfBlob);

  return {
    blobUrl,
    fileName,
    doc,
  };
}

export default generateMachineToolRectificationPDF;

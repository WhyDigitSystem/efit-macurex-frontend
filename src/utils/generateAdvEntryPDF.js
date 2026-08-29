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
 * Generate ADV Entry PDF
 *
 * @param {Object} data
 * @param {Object} data.company
 * @param {Object} data.adv
 * @param {Array} data.items
 */
export function generateAdvEntryPDF(data) {
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
  const adv = data?.adv || {};
  const items = data?.items || [];

  /* -------------------------------------------------------------- */
  /* Helpers                                                         */
  /* -------------------------------------------------------------- */

  const setFont = (font = "helvetica", size = 10, style = "normal") => {
    doc.setFont(font, style);
    doc.setFontSize(size);
  };

  const fmt = (value) => {
    if (value === null || value === undefined || value === "") {
      return "";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return String(value);
    }

    return number.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
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
        `${company.name || "Company Name"} — ADV FOR STORES`,
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

  doc.text("ADV FOR STORES", PAGE_W / 2, y + 26, {
    align: "center",
  });

  doc.setTextColor(...C.black);

  y += 40;

  /* ================================================================ */
  /* 2. HEADER                                                        */
  /* ================================================================ */

  const leftRows = [
    ["Plant :", adv.plantName || adv.plantId],
    ["Belongs To :", adv.belongsTo],
    ["Party Id :", adv.partyId],
    ["Party Name :", adv.partyName],
    ["Incoming Part No :", adv.incomingPartNo],
    ["Part Name :", adv.partName],
  ];

  const rightRows = [
    ["Doc No :", adv.docNo],
    ["Doc Date :", adv.docDate],
    ["BOM Id :", adv.bomId],
    ["Time :", adv.time],
    ["Prepared By :", adv.preparedBy],
    ["Status :", adv.active ? "Active" : "Inactive"],
  ];

  const HEADER_H = 116;

  doc.setDrawColor(...C.primary);
  doc.setLineWidth(0.8);

  doc.rect(M, y, CW, HEADER_H);

  const dividerX = PAGE_W / 2 + 10;

  doc.setDrawColor(...C.gray200);
  doc.setLineWidth(0.5);

  doc.line(
    dividerX,
    y,
    dividerX,
    y + HEADER_H,
  );

  /* -------------------------------------------------------------- */
  /* Left side                                                       */
  /* -------------------------------------------------------------- */

  let ly = y + 18;

  leftRows.forEach(([label, value]) => {
    setFont("helvetica", 8, "bold");

    doc.setTextColor(...C.gray900);

    doc.text(label, M + 8, ly);

    setFont("helvetica", 8, "normal");

    doc.setTextColor(...C.gray500);

    const labelWidth = doc.getTextWidth(label);

    const valueText =
      value === null || value === undefined
        ? ""
        : String(value);

    doc.text(
      valueText,
      M + 8 + labelWidth + 6,
      ly,
    );

    ly += 16;
  });

  /* -------------------------------------------------------------- */
  /* Right side                                                      */
  /* -------------------------------------------------------------- */

  let ry = y + 18;

  const rx = dividerX + 10;

  rightRows.forEach(([label, value]) => {
    setFont("helvetica", 8, "bold");

    doc.setTextColor(...C.gray900);

    doc.text(label, rx, ry);

    setFont("helvetica", 8, "normal");

    doc.setTextColor(...C.gray500);

    doc.text(
      value === null || value === undefined
        ? ""
        : String(value),
      rx + 85,
      ry,
    );

    ry += 16;
  });

  doc.setTextColor(...C.black);

  y += HEADER_H;

  /* ================================================================ */
  /* 3. ADV DETAILS                                                   */
  /* ================================================================ */

  sectionHeading("ADV Details");

  const itemRows = items.map((item, index) => [
    index + 1,
    item.itemCode || "",
    item.itemDescription || "",
    item.unitLabel || item.unit || "",
    item.bomQty !== null && item.bomQty !== undefined
      ? fmt(item.bomQty)
      : "",
    item.issueQty !== null && item.issueQty !== undefined
      ? fmt(item.issueQty)
      : "",
  ]);

  if (itemRows.length === 0) {
    itemRows.push([
      1,
      "",
      "",
      "",
      "",
      "",
    ]);
  }

  const itemTableResult = autoTable(doc, {
    startY: y,

    margin: {
      left: M,
      right: M,
    },

    head: [
      [
        "S.No",
        "Item Code",
        "Item Description",
        "Unit",
        "BOM Qty",
        "Issue Qty",
      ],
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
      valign: "middle",
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
      0: {
        cellWidth: 35,
        halign: "center",
      },

      1: {
        cellWidth: 75,
      },

      2: {
        cellWidth: 190,
      },

      3: {
        cellWidth: 65,
      },

      4: {
        cellWidth: 65,
        halign: "right",
      },

      5: {
        cellWidth: 70,
        halign: "right",
      },
    },

    didDrawPage: (eventData) => {
      y = eventData.cursor.y;
    },
  });

  y =
    (itemTableResult?.finalY || y) +
    12;

  /* ================================================================ */
  /* 4. SUMMARY                                                       */
  /* ================================================================ */

  sectionHeading("ADV Summary");

  const LABEL_X = M + 8;
  const COLON_X = M + 190;
  const VALUE_X = M + 200;

  const VALUE_MAX_W = CW - 215;

  const summaryPairs = [
    ["Remarks", adv.remarks],
    ["Prepared By", adv.preparedBy],
  ];

  const rowHeights = summaryPairs.map(([, value]) => {
    const lines = doc.splitTextToSize(
      String(value || "—"),
      VALUE_MAX_W,
    );

    return Math.max(
      lines.length * 11 + 6,
      20,
    );
  });

  const SUMMARY_HEADER_H = 20;

  const totalSummaryH =
    SUMMARY_HEADER_H +
    rowHeights.reduce(
      (sum, height) => sum + height,
      0,
    ) +
    8;

  checkPageBreak(totalSummaryH + 10);

  doc.setDrawColor(...C.primary);
  doc.setLineWidth(0.5);
  doc.setFillColor(...C.white);

  doc.rect(
    M,
    y,
    CW,
    totalSummaryH,
    "FD",
  );

  /* Header */

  doc.setFillColor(...C.white);
  doc.setDrawColor(...C.primary);

  doc.rect(
    M,
    y,
    CW,
    SUMMARY_HEADER_H,
    "FD",
  );

  setFont("helvetica", 8, "bold");

  doc.setTextColor(...C.primary);

  doc.text(
    "Field",
    LABEL_X,
    y + 13,
  );

  doc.text(
    "Value",
    VALUE_X,
    y + 13,
  );

  let sy =
    y +
    SUMMARY_HEADER_H +
    6;

  summaryPairs.forEach(
    ([label, value], index) => {
      const rowH = rowHeights[index];

      setFont(
        "helvetica",
        8,
        "bold",
      );

      doc.setTextColor(...C.gray900);

      doc.text(
        label,
        LABEL_X,
        sy + 8,
      );

      doc.text(
        ":",
        COLON_X,
        sy + 8,
      );

      setFont(
        "helvetica",
        8,
        "normal",
      );

      doc.setTextColor(...C.gray500);

      const lines =
        doc.splitTextToSize(
          String(value || "—"),
          VALUE_MAX_W,
        );

      doc.text(
        lines,
        VALUE_X,
        sy + 8,
      );

      doc.setDrawColor(...C.gray200);
      doc.setLineWidth(0.3);

      doc.line(
        M + 4,
        sy + rowH - 2,
        PAGE_W - M - 4,
        sy + rowH - 2,
      );

      sy += rowH;
    },
  );

  doc.setTextColor(...C.black);

  y += totalSummaryH;

  /* ================================================================ */
  /* 5. FOOTER                                                        */
  /* ================================================================ */

  y += 12;

  if (y + 30 > PAGE_H - M) {
    doc.addPage();

    y = M + 40;
  }

  doc.setFillColor(...C.primaryTint);
  doc.setDrawColor(...C.primary);
  doc.setLineWidth(0.5);

  doc.rect(
    M,
    y,
    CW,
    30,
    "FD",
  );

  setFont("helvetica", 7, "normal");

  doc.setTextColor(...C.gray500);

  const now = new Date();

  const dateStr =
    now.toLocaleDateString("en-IN");

  const timeStr =
    now.toLocaleTimeString("en-IN");

  const generatedBy =
    localStorage.getItem("userName") ||
    localStorage.getItem("username") ||
    "System";

  doc.text(
    `Generated: ${dateStr} ${timeStr}`,
    M + 8,
    y + 18,
  );

  doc.text(
    `Page ${doc.internal.getNumberOfPages()}`,
    PAGE_W / 2,
    y + 18,
    {
      align: "center",
    },
  );

  doc.text(
    `Generated by: ${generatedBy}`,
    PAGE_W - M - 8,
    y + 18,
    {
      align: "right",
    },
  );

  doc.setTextColor(...C.black);

  /* ================================================================ */
  /* OUTPUT                                                           */
  /* ================================================================ */

  const fileName =
    `ADV_${adv.docNo || adv.id || "document"}.pdf`;

  const pdfArrayBuffer =
    doc.output("arraybuffer");

  const pdfBlob = new Blob(
    [pdfArrayBuffer],
    {
      type: "application/pdf",
    },
  );

  const blobUrl =
    URL.createObjectURL(pdfBlob);

  return {
    blobUrl,
    fileName,
    doc,
  };
}

export default generateAdvEntryPDF;
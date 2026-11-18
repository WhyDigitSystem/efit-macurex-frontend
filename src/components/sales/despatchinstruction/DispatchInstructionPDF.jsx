import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Professional, well-aligned PDF for a Dispatch Instruction.
 * Mirrors the visual style of all other module PDFs.
 *
 * @param {Object} payload
 * @param {Object} payload.company          - { name }
 * @param {Object} payload.dispatch         - header fields
 * @param {Array}  payload.dispatchDetails  - item rows
 * @returns {{ blobUrl: string, fileName: string }}
 */
export const generateDispatchInstructionPDF = ({
  company,
  dispatch,
  dispatchDetails,
}) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const MARGIN = 12;
  const CONTENT_W = pageWidth - MARGIN * 2;
  const RIGHT = pageWidth - MARGIN;

  // ---------- Palette ----------
  const PRIMARY = [30, 64, 175];
  const DARK = [31, 41, 55];
  const MUTED = [107, 114, 128];
  const LIGHT_BG = [243, 244, 246];
  const BORDER = [209, 213, 219];
  const WHITE = [255, 255, 255];

  // ---------- Helpers ----------
  const safe = (v) => {
    if (v === undefined || v === null) return "-";
    const s = String(v).trim();
    return s.length === 0 ? "-" : s;
  };

  const formatDate = (d) => {
    if (!d) return "-";
    try {
      const date = new Date(d);
      if (isNaN(date.getTime())) return safe(d);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return safe(d);
    }
  };

  const formatCurrency = (v) => {
    const n = Number(v) || 0;
    return n.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatQty = (v) => {
    const n = Number(v) || 0;
    return n.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 3,
    });
  };

  let y = MARGIN;

  /* =========================================================
     HEADER BAND
     ========================================================= */
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, pageWidth, 26, "F");

  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("DISPATCH INSTRUCTION", MARGIN, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    company?.name || "Dispatch Instruction Document",
    MARGIN,
    18,
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(safe(`Dispatch No: ${dispatch.docId}`), RIGHT, 11, {
    align: "right",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(safe(`Date: ${formatDate(dispatch.docDate)}`), RIGHT, 17, {
    align: "right",
  });
  doc.text(safe(`Branch: ${dispatch.branchName}`), RIGHT, 22, {
    align: "right",
  });

  y = 34;

  /* =========================================================
     SECTION TITLE HELPER
     ========================================================= */
  const drawSectionTitle = (title) => {
    doc.setFillColor(...LIGHT_BG);
    doc.rect(MARGIN, y, CONTENT_W, 6.5, "F");
    doc.setTextColor(...PRIMARY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(safe(title).toUpperCase(), MARGIN + 3, y + 4.3);
    y += 8.5;
  };

  /* =========================================================
     DISPATCH INFO — 3-column grid
     ========================================================= */
  drawSectionTitle("Dispatch Information");

  const infoRows = [
    [
      { label: "Dispatch No", value: dispatch.docId },
      { label: "Dispatch Date", value: formatDate(dispatch.docDate) },
      { label: "Schedule No", value: dispatch.scheduleNo },
    ],
    [
      { label: "Schedule Date", value: formatDate(dispatch.scheduleDate) },
      { label: "Invoice Type", value: dispatch.invoiceType },
      { label: "Payment Terms", value: dispatch.paymentTerms },
    ],
    [
      { label: "Customer Name", value: dispatch.customerName },
      { label: "Branch / Plant", value: dispatch.branchName },
      { label: "From Location", value: dispatch.locationName },
    ],
    [
      { label: "Mode of Transport", value: dispatch.modeOfTransport },
      { label: "Consignee", value: dispatch.consignee },
      { label: "Status", value: dispatch.active },
    ],
    [
      { label: "Net Weight", value: formatQty(dispatch.netWeight) },
      { label: "Gross Weight", value: formatQty(dispatch.grossWeight) },
      { label: "Created By", value: dispatch.createdBy },
    ],
    [
      {
        label: "Delivery Instructions",
        value: dispatch.deliveryInstructions,
        span: 3,
      },
    ],
  ];

  const COL_W = CONTENT_W / 3;
  const CELL_PAD_X = 1.5;
  const CELL_PAD_TOP = 1.5;
  const CELL_PAD_BOTTOM = 0;
  const LABEL_H = 3;
  const LABEL_TO_VALUE_GAP = 3.5;
  const VALUE_H = 3.6;
  const MIN_ROW_H = 6;

  infoRows.forEach((row) => {
    const cellHeights = row.map((cell) => {
      const cellW = COL_W * (cell.span || 1);
      const valueLines = doc.splitTextToSize(
        safe(cell.value),
        cellW - CELL_PAD_X * 2,
      );
      const linesCount = Math.max(valueLines.length, 1);
      return (
        CELL_PAD_TOP +
        LABEL_H +
        LABEL_TO_VALUE_GAP +
        (linesCount - 1) * VALUE_H +
        VALUE_H * 0.75 +
        CELL_PAD_BOTTOM
      );
    });
    const rowH = Math.max(...cellHeights, MIN_ROW_H);

    if (y + rowH > pageHeight - 20) {
      doc.addPage();
      y = MARGIN;
    }

    let col = 0;
    row.forEach((cell) => {
      const span = cell.span || 1;
      const cellW = COL_W * span;
      const x = MARGIN + col * COL_W;

      if (col > 0) {
        doc.setDrawColor(...BORDER);
        doc.setLineWidth(0.1);
        doc.line(x, y, x, y + rowH);
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(...MUTED);
      doc.text(
        safe(cell.label),
        x + CELL_PAD_X,
        y + CELL_PAD_TOP + 2.3,
      );

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...DARK);
      const valueLines = doc.splitTextToSize(
        safe(cell.value),
        cellW - CELL_PAD_X * 2,
      );
      let vy = y + CELL_PAD_TOP + LABEL_H + LABEL_TO_VALUE_GAP;
      valueLines.forEach((line) => {
        doc.text(String(line), x + CELL_PAD_X, vy);
        vy += VALUE_H;
      });

      col += span;
    });

    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.1);
    doc.line(MARGIN, y + rowH, RIGHT, y + rowH);

    y += rowH;
  });

  y += 4;

  /* =========================================================
     DISPATCH DETAILS TABLE
     ========================================================= */
  drawSectionTitle("Dispatch Details");

  const details = Array.isArray(dispatchDetails) ? dispatchDetails : [];

  const detailRows =
    details.length > 0
      ? details.map((item, idx) => {
          const itemMaster = item.item || {};
          const itemCode = safe(itemMaster.itemCode || item.itemCode);
          const desc = safe(
            itemMaster.itemDescription || item.itemDescription,
          );

          let unit = "-";
          if (itemMaster.unit && typeof itemMaster.unit === "object") {
            unit = safe(
              itemMaster.unit.unitId ||
                itemMaster.unit.unitDescription ||
                itemMaster.unit.id,
            );
          } else if (item.unit) {
            unit =
              typeof item.unit === "object"
                ? safe(item.unit.unitId || item.unit.id)
                : safe(item.unit);
          }

          return [
            idx + 1,
            safe(item.ordAccpContrNo),
            formatDate(item.date),
            itemCode,
            desc,
            unit,
            formatQty(item.plannedQty),
            formatQty(item.pendingQty),
            formatQty(item.availableQty),
            formatQty(item.descQty),
            safe(item.noOfPackage),
            safe(item.packageType),
            safe(item.pdi),
            formatDate(item.pdiDate),
            safe(item.schduleMonth),
          ];
        })
      : [
          [
            "-",
            "-",
            "-",
            "No items",
            "-",
            "-",
            "-",
            "-",
            "-",
            "-",
            "-",
            "-",
            "-",
            "-",
            "-",
          ],
        ];

  autoTable(doc, {
    startY: y,
    head: [
      [
        "#",
        "Order/Contract No",
        "Date",
        "Item Code",
        "Description",
        "Unit",
        "Planned Qty",
        "Pending Qty",
        "Available Qty",
        "Desp. Qty",
        "No of Pkg",
        "Pkg Type",
        "PDI",
        "PDI Date",
        "Month",
      ],
    ],
    body: detailRows,
    theme: "grid",
    margin: { left: MARGIN, right: MARGIN },
    tableWidth: CONTENT_W,
    styles: {
      fontSize: 6,
      cellPadding: { top: 1.3, bottom: 1.3, left: 1.1, right: 1.1 },
      textColor: DARK,
      lineColor: BORDER,
      lineWidth: 0.1,
      overflow: "linebreak",
      valign: "middle",
    },
    headStyles: {
      fillColor: PRIMARY,
      textColor: WHITE,
      fontStyle: "bold",
      fontSize: 6,
      halign: "center",
    },
    bodyStyles: { fontSize: 6 },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: {
      0: { halign: "center", cellWidth: 5 },
      1: { cellWidth: 20 },
      2: { cellWidth: 12, halign: "center" },
      3: { cellWidth: 15 },
      4: { cellWidth: 26 },
      5: { cellWidth: 8, halign: "center" },
      6: { cellWidth: 12, halign: "right" },
      7: { cellWidth: 12, halign: "right" },
      8: { cellWidth: 14, halign: "right" },
      9: { cellWidth: 12, halign: "right" },
      10: { cellWidth: 9, halign: "center" },
      11: { cellWidth: 12, halign: "center" },
      12: { cellWidth: 12, halign: "center" },
      13: { cellWidth: 12, halign: "center" },
      14: { cellWidth: 12, halign: "center" },
    },
  });

  y = doc.lastAutoTable.finalY + 5;

  /* =========================================================
     SUMMARY BAR
     ========================================================= */
  if (y + 14 > pageHeight - 20) {
    doc.addPage();
    y = MARGIN;
  }

  // Compute totals from details
  const totalPlanned = details.reduce(
    (s, d) => s + (Number(d.plannedQty) || 0),
    0,
  );
  const totalPending = details.reduce(
    (s, d) => s + (Number(d.pendingQty) || 0),
    0,
  );
  const totalAvailable = details.reduce(
    (s, d) => s + (Number(d.availableQty) || 0),
    0,
  );
  const totalDespQty = details.reduce(
    (s, d) => s + (Number(d.descQty) || 0),
    0,
  );
  const totalPackages = details.reduce(
    (s, d) => s + (Number(d.noOfPackage) || 0),
    0,
  );

  const boxW = 90;
  const boxX = RIGHT - boxW;

  const summaryRows = [
    { label: "Total Planned Qty", value: formatQty(totalPlanned) },
    { label: "Total Pending Qty", value: formatQty(totalPending) },
    { label: "Total Available Qty", value: formatQty(totalAvailable) },
  ];

  summaryRows.forEach((row) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(row.label, boxX + 3, y + 4);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...DARK);
    doc.text(row.value, RIGHT - 3, y + 4, { align: "right" });
    y += 5;
  });

  // Grand total bar — dispatch qty + packages
  y += 1;
  doc.setFillColor(...PRIMARY);
  doc.rect(boxX, y, boxW, 9, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...WHITE);
  doc.text("TOTAL DESP. QTY", boxX + 3, y + 5.8);
  doc.setFontSize(10);
  doc.text(formatQty(totalDespQty), RIGHT - 3, y + 5.8, {
    align: "right",
  });

  y += 9;

  // Packages line (below total bar)
  doc.setFillColor(...PRIMARY);
  doc.rect(boxX, y, boxW, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...WHITE);
  doc.text("TOTAL PACKAGES", boxX + 3, y + 5.5);
  doc.setFontSize(9);
  doc.text(
    `${totalPackages} (${details.length} item${details.length > 1 ? "s" : ""})`,
    RIGHT - 3,
    y + 5.5,
    { align: "right" },
  );

  y += 14;

  /* =========================================================
     WEIGHT / DELIVERY INFO
     ========================================================= */
  const hasWeights =
    dispatch.netWeight || dispatch.grossWeight || dispatch.deliveryInstructions;

  if (hasWeights) {
    if (y > pageHeight - 60) {
      doc.addPage();
      y = MARGIN;
    }

    drawSectionTitle("Weight & Delivery");

    const weightRows = [
      [
        { label: "Net Weight", value: formatQty(dispatch.netWeight) },
        { label: "Gross Weight", value: formatQty(dispatch.grossWeight) },
        { label: "Mode of Transport", value: dispatch.modeOfTransport },
      ],
      [
        {
          label: "Delivery Instructions",
          value: dispatch.deliveryInstructions,
          span: 3,
        },
      ],
    ];

    const W_COL_W = CONTENT_W / 3;
    const W_PAD_X = 1.5;
    const W_PAD_TOP = 1.5;
    const W_PAD_BOTTOM = 1.5;
    const W_LABEL_H = 3;
    const W_GAP = 3.5;
    const W_VALUE_H = 3.6;
    const W_MIN_ROW_H = 10;

    weightRows.forEach((row) => {
      const cellHeights = row.map((cell) => {
        const cellW = W_COL_W * (cell.span || 1);
        const valueLines = doc.splitTextToSize(
          safe(cell.value),
          cellW - W_PAD_X * 2,
        );
        const linesCount = Math.max(valueLines.length, 1);
        return (
          W_PAD_TOP +
          W_LABEL_H +
          W_GAP +
          (linesCount - 1) * W_VALUE_H +
          W_VALUE_H * 0.75 +
          W_PAD_BOTTOM
        );
      });
      const rowH = Math.max(...cellHeights, W_MIN_ROW_H);

      if (y + rowH > pageHeight - 20) {
        doc.addPage();
        y = MARGIN;
      }

      let col = 0;
      row.forEach((cell) => {
        const span = cell.span || 1;
        const cellW = W_COL_W * span;
        const x = MARGIN + col * W_COL_W;

        if (col > 0) {
          doc.setDrawColor(...BORDER);
          doc.setLineWidth(0.1);
          doc.line(x, y, x, y + rowH);
        }

        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.5);
        doc.setTextColor(...MUTED);
        doc.text(
          safe(cell.label),
          x + W_PAD_X,
          y + W_PAD_TOP + 2.3,
        );

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...DARK);
        const valueLines = doc.splitTextToSize(
          safe(cell.value),
          cellW - W_PAD_X * 2,
        );
        let vy = y + W_PAD_TOP + W_LABEL_H + W_GAP;
        valueLines.forEach((line) => {
          doc.text(String(line), x + W_PAD_X, vy);
          vy += W_VALUE_H;
        });

        col += span;
      });

      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.1);
      doc.line(MARGIN, y + rowH, RIGHT, y + rowH);

      y += rowH;
    });

    y += 3;
  }

  /* =========================================================
     SIGNATURE BLOCK
     ========================================================= */
  if (y > pageHeight - 30) {
    doc.addPage();
    y = MARGIN;
  }

  const sigY = Math.max(y + 10, pageHeight - 32);

  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.3);

  const SIGN_W = (CONTENT_W - 20) / 2;

  doc.line(MARGIN, sigY, MARGIN + SIGN_W, sigY);
  doc.line(MARGIN + SIGN_W + 20, sigY, RIGHT, sigY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("Prepared By", MARGIN + SIGN_W / 2, sigY + 5, {
    align: "center",
  });
  doc.text(
    "Authorised Signatory",
    MARGIN + SIGN_W + 20 + SIGN_W / 2,
    sigY + 5,
    { align: "center" },
  );

  /* =========================================================
     FOOTER
     ========================================================= */
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.1);
    doc.line(MARGIN, pageHeight - 12, RIGHT, pageHeight - 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);

    const now = new Date();
    const stamp = `${now.toLocaleDateString("en-GB")} ${now.toLocaleTimeString(
      "en-GB",
      { hour: "2-digit", minute: "2-digit" },
    )}`;

    doc.text(`Generated: ${stamp}`, MARGIN, pageHeight - 7);
    doc.text(
      `Dispatch Instruction — ${safe(dispatch.docId)}`,
      pageWidth / 2,
      pageHeight - 7,
      { align: "center" },
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      RIGHT,
      pageHeight - 7,
      { align: "right" },
    );
  }

  const safeName = (dispatch.docId || "DispatchInstruction")
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .replace(/_+/g, "_");

  const blob = doc.output("blob");
  const blobUrl = URL.createObjectURL(blob);

  return { blobUrl, fileName: `${safeName}.pdf` };
};

export default generateDispatchInstructionPDF;
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Professional PDF for a Sales Invoice / Rejection / Other Sales Invoice.
 * Auto-titles based on docType.
 */
export const generateSalesInvoicePDF = ({
  company,
  invoice,
  items,
  taxDetails,
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

  // Title based on docType
  const docTypeRaw = String(invoice.docType || "").trim();
  const TITLE_MAP = {
    Invoice: "SALES INVOICE",
    Rejection: "REJECTION INVOICE",
    "Other Sales Invoice": "OTHER SALES INVOICE",
  };
  const SUBTITLE_MAP = {
    Invoice: "Sales Invoice Document",
    Rejection: "Sales Rejection Invoice",
    "Other Sales Invoice": "Other Sales Invoice",
  };
  const TITLE = TITLE_MAP[docTypeRaw] || "SALES INVOICE";
  const SUBTITLE = SUBTITLE_MAP[docTypeRaw] || "Sales Invoice Document";

  let y = MARGIN;

  /* =========================================================
     HEADER BAND
     ========================================================= */
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, pageWidth, 26, "F");

  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(TITLE, MARGIN, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(company?.name || SUBTITLE, MARGIN, 18);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(safe(`Invoice No: ${invoice.docId}`), RIGHT, 11, {
    align: "right",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(safe(`Date: ${formatDate(invoice.docDate)}`), RIGHT, 17, {
    align: "right",
  });
  doc.text(safe(`Branch: ${invoice.branchName}`), RIGHT, 22, {
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
     INVOICE & CUSTOMER INFO — 3-column grid
     ========================================================= */
  drawSectionTitle("Invoice & Customer Information");

  const infoRows = [
    [
      { label: "Invoice No", value: invoice.docId },
      { label: "Invoice Date", value: formatDate(invoice.docDate) },
      { label: "Doc Type", value: invoice.docType },
    ],
    [
      { label: "Customer Name", value: invoice.customerName },
      { label: "Customer Code", value: invoice.customerCode },
      { label: "Customer GST No", value: invoice.customerGstNo },
    ],
    [
      { label: "GST State", value: invoice.customerGstState },
      { label: "Customer Type", value: invoice.customerGstType },
      { label: "Currency", value: invoice.currencyName },
    ],
    [
      { label: "Branch / Plant", value: invoice.branchName },
      { label: "Location", value: invoice.locationName },
      { label: "Vehicle No", value: invoice.vehicle },
    ],
    [
      { label: "Schedule No", value: invoice.scheduleNo },
      { label: "Schedule Date", value: formatDate(invoice.scheduleDate) },
      { label: "Dispatch Instr. No", value: invoice.dispatchInstructionNo },
    ],
    [
      {
        label: "Dispatch Instr. Date",
        value: formatDate(invoice.dispatchInstructionDate),
      },
      { label: "Mode of Transport", value: invoice.modeOfTransport },
      { label: "Financial Year", value: invoice.financialYear },
    ],
    [
      { label: "Time of Issue", value: invoice.timeOfIssue },
      { label: "Time of Removal", value: invoice.timeOfRemoval },
      { label: "Created By", value: invoice.createdBy },
    ],
    [
      {
        label: "Shipping Address",
        value: invoice.shippingAddress,
        span: 2,
      },
      {
        label: "City / Pincode",
        value: `${safe(invoice.shippingCity)} - ${safe(invoice.shippingPincode)}`,
      },
    ],
    [
      { label: "Ref No", value: invoice.refNo },
      { label: "Supplier Invoice No", value: invoice.supplierInvoiceNo },
      { label: "Kanban Card No", value: invoice.kanbanCardNo },
    ],
    [
      { label: "Purchase Order", value: invoice.purchaseOrder },
      {
        label: "Purchase Order Date",
        value: formatDate(invoice.purchaseOrderDate),
      },
      { label: "Delivery To", value: invoice.deliveryTo },
    ],
  ];

  const COL_W = CONTENT_W / 3;
  const CELL_PAD_X = 1.5;
  const CELL_PAD_TOP = 1.5;
  const CELL_PAD_BOTTOM = 0;
  const LABEL_H = 3;
  const LABEL_TO_VALUE_GAP = 3.5;
  const VALUE_H = 3.6;
  const MIN_ROW_H = 2;

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
     ITEM DETAILS TABLE
     ========================================================= */
  drawSectionTitle("Invoice Items");

  const detailRows =
    Array.isArray(items) && items.length > 0
      ? items.map((item, idx) => {
          const itemMaster = item.item || {};
          const itemCode = safe(itemMaster.itemCode || item.itemCode);
          const desc = safe(
            itemMaster.itemDescription || item.itemDescription,
          );
          const hsn = safe(item.hsnSacCode || item.hsnCode);

          let unit = "-";
          if (item.unit && typeof item.unit === "object") {
            unit = safe(
              item.unit.unitId ||
                item.unit.unitDescription ||
                item.unit.id,
            );
          } else if (
            itemMaster.unit &&
            typeof itemMaster.unit === "object"
          ) {
            unit = safe(
              itemMaster.unit.unitId ||
                itemMaster.unit.unitDescription ||
                itemMaster.unit.id,
            );
          }

          const qty = Number(item.despatchQty) || 0;
          const rate = Number(item.rateInSelectedCurrency) || 0;
          const amount =
            Number(item.amountInRs || item.amountInSelectedCurrency) || 0;

          return [
            idx + 1,
            itemCode,
            desc,
            hsn,
            safe(item.customerPartNo),
            unit,
            formatQty(qty),
            formatCurrency(rate),
            formatCurrency(amount),
            safe(item.taxType),
            `${Number(item.taxPercentage) || 0}%`,
            safe(item.salesOrderContractNo),
          ];
        })
      : [
          [
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
          ],
        ];

  autoTable(doc, {
    startY: y,
    head: [
      [
        "#",
        "Item Code",
        "Description",
        "HSN",
        "Cust Part No",
        "Unit",
        "Qty",
        "Rate",
        "Amount",
        "Tax",
        "Tax %",
        "Contract No",
      ],
    ],
    body: detailRows,
    theme: "grid",
    margin: { left: MARGIN, right: MARGIN },
    tableWidth: CONTENT_W,
    styles: {
      fontSize: 7,
      cellPadding: { top: 1.6, bottom: 1.6, left: 1.4, right: 1.4 },
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
      fontSize: 7,
      halign: "center",
    },
    bodyStyles: { fontSize: 7 },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: {
      0: { halign: "center", cellWidth: 7 },
      1: { cellWidth: 20 },
      2: { cellWidth: 36 },
      3: { cellWidth: 12, halign: "center" },
      4: { cellWidth: 15 },
      5: { cellWidth: 9, halign: "center" },
      6: { cellWidth: 12, halign: "right" },
      7: { cellWidth: 16, halign: "right" },
      8: { cellWidth: 20, halign: "right" },
      9: { cellWidth: 10, halign: "center" },
      10: { cellWidth: 10, halign: "right" },
      11: { cellWidth: 19 },
    },
  });

  y = doc.lastAutoTable.finalY + 5;

  /* =========================================================
     TAX DETAILS TABLE
     ========================================================= */
  if (Array.isArray(taxDetails) && taxDetails.length > 0) {
    if (y > pageHeight - 70) {
      doc.addPage();
      y = MARGIN;
    }

    drawSectionTitle("Tax Details");

    const taxRows = taxDetails.map((t, idx) => {
      let label = t.particulars;
      if (label && typeof label === "object") {
        label = label.description || label.code || "-";
      }
      const amount = Number(t.amount) || 0;
      return [idx + 1, safe(label), formatCurrency(amount)];
    });

    autoTable(doc, {
      startY: y,
      head: [["#", "Particulars", "Amount"]],
      body: taxRows,
      theme: "grid",
      margin: { left: MARGIN, right: MARGIN },
      tableWidth: CONTENT_W,
      styles: {
        fontSize: 8,
        cellPadding: { top: 1.8, bottom: 1.8, left: 1.8, right: 1.8 },
        textColor: DARK,
        lineColor: BORDER,
        lineWidth: 0.1,
        valign: "middle",
      },
      headStyles: {
        fillColor: PRIMARY,
        textColor: WHITE,
        fontStyle: "bold",
        fontSize: 8,
        halign: "center",
      },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      columnStyles: {
        0: { halign: "center", cellWidth: 14 },
        1: { cellWidth: 136 },
        2: { halign: "right", cellWidth: 36 },
      },
    });

    y = doc.lastAutoTable.finalY + 5;
  }

  /* =========================================================
     AMOUNT SUMMARY BAR
     ========================================================= */
  if (y + 20 > pageHeight - 20) {
    doc.addPage();
    y = MARGIN;
  }

  const boxW = 90;
  const boxX = RIGHT - boxW;

  const summaryRows = [
    {
      label: "Total Ass. Value",
      value: formatCurrency(invoice.totalAssVal),
    },
    { label: "Total Freight", value: formatCurrency(invoice.totalFreight) },
    {
      label: "Total Insurance",
      value: formatCurrency(invoice.totalInsurance),
    },
    { label: "TCS Amount", value: formatCurrency(invoice.tcsAmount) },
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

  // Amount in words (left column)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.text("AMOUNT IN WORDS", MARGIN, y - 20 + 4);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...DARK);
  const wordsLines = doc.splitTextToSize(
    safe(invoice.amountInWords),
    boxX - MARGIN - 6,
  );
  let wy = y - 20 + 8;
  wordsLines.slice(0, 3).forEach((line) => {
    doc.text(String(line), MARGIN, wy);
    wy += 3.8;
  });

  // Grand total bar
  y += 1;
  doc.setFillColor(...PRIMARY);
  doc.rect(boxX, y, boxW, 9, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...WHITE);
  doc.text("NET AMOUNT", boxX + 3, y + 5.8);
  doc.setFontSize(10);
  doc.text(
    `Rs. ${formatCurrency(invoice.netAmount)}`,
    RIGHT - 3,
    y + 5.8,
    { align: "right" },
  );

  y += 14;

  /* =========================================================
     TERMS & NARRATION
     ========================================================= */
  const hasTerms =
    invoice.paymentTerms ||
    invoice.narration ||
    invoice.deliveryTo ||
    invoice.purchaseOrder;

  if (hasTerms) {
    if (y > pageHeight - 50) {
      doc.addPage();
      y = MARGIN;
    }

    drawSectionTitle("Terms & Narration");

    const termRows = [
      [
        { label: "Payment Terms", value: invoice.paymentTerms },
        { label: "Delivery To", value: invoice.deliveryTo },
        { label: "Purchase Order", value: invoice.purchaseOrder },
      ],
      [{ label: "Narration", value: invoice.narration, span: 3 }],
    ];

    const T_COL_W = CONTENT_W / 3;
    const T_PAD_X = 1.5;
    const T_PAD_TOP = 1.5;
    const T_PAD_BOTTOM = 1.5;
    const T_LABEL_H = 3;
    const T_GAP = 3.5;
    const T_VALUE_H = 3.6;
    const T_MIN_ROW_H = 10;

    termRows.forEach((row) => {
      const cellHeights = row.map((cell) => {
        const cellW = T_COL_W * (cell.span || 1);
        const valueLines = doc.splitTextToSize(
          safe(cell.value),
          cellW - T_PAD_X * 2,
        );
        const linesCount = Math.max(valueLines.length, 1);
        return (
          T_PAD_TOP +
          T_LABEL_H +
          T_GAP +
          (linesCount - 1) * T_VALUE_H +
          T_VALUE_H * 0.75 +
          T_PAD_BOTTOM
        );
      });
      const rowH = Math.max(...cellHeights, T_MIN_ROW_H);

      if (y + rowH > pageHeight - 20) {
        doc.addPage();
        y = MARGIN;
      }

      let col = 0;
      row.forEach((cell) => {
        const span = cell.span || 1;
        const cellW = T_COL_W * span;
        const x = MARGIN + col * T_COL_W;

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
          x + T_PAD_X,
          y + T_PAD_TOP + 2.3,
        );

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...DARK);
        const valueLines = doc.splitTextToSize(
          safe(cell.value),
          cellW - T_PAD_X * 2,
        );
        let vy = y + T_PAD_TOP + T_LABEL_H + T_GAP;
        valueLines.forEach((line) => {
          doc.text(String(line), x + T_PAD_X, vy);
          vy += T_VALUE_H;
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
      `${TITLE} — ${safe(invoice.docId)}`,
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

  const safeName = (invoice.docId || "SalesInvoice")
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .replace(/_+/g, "_");

  const blob = doc.output("blob");
  const blobUrl = URL.createObjectURL(blob);

  return { blobUrl, fileName: `${safeName}.pdf` };
};

export default generateSalesInvoicePDF;
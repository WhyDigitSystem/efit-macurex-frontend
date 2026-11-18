import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Professional, well-aligned PDF for a Sales Contract.
 * Mirrors the visual style of generateOrderAcceptancePDF /
 * generateSalesReturnPDF / generateCustomerComplaintPDF.
 *
 * @param {Object} payload
 * @param {Object} payload.contract  - the transformed/raw contract row
 * @returns {{ blobUrl: string, fileName: string }}
 */
export const generateSalesContractPDF = ({ contract }) => {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const MARGIN = 12;
    const CONTENT_W = pageWidth - MARGIN * 2; // 186mm
    const RIGHT = pageWidth - MARGIN; // 198mm

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

    let y = MARGIN;

    /* =========================================================
       HEADER BAND
       ========================================================= */
    doc.setFillColor(...PRIMARY);
    doc.rect(0, 0, pageWidth, 26, "F");

    doc.setTextColor(...WHITE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("SALES CONTRACT", MARGIN, 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Sales Contract Document", MARGIN, 18);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(safe(`Contract No: ${contract.contractNo}`), RIGHT, 11, {
        align: "right",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
        safe(`Date: ${formatDate(contract.contractDate || contract.docDate)}`),
        RIGHT,
        17,
        { align: "right" },
    );
    doc.text(safe(`Branch: ${contract.branchName}`), RIGHT, 22, {
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
       CUSTOMER & CONTRACT INFO — 3-column grid
       ========================================================= */
    drawSectionTitle("Customer & Contract Information");

    const infoRows = [
        [
            { label: "Customer Name", value: contract.customerName },
            { label: "Customer GST No", value: contract.gstnNo },
            { label: "Contract Type", value: contract.contractType },
        ],
        [
            { label: "With Quotation", value: contract.withQuotation },
            { label: "Quotation No", value: contract.quotationNo },
            {
                label: "Quotation Date",
                value: formatDate(contract.quotationDate),
            },
        ],
        [
            { label: "Customer PO No", value: contract.customerPoNo },
            {
                label: "Customer PO Date",
                value: formatDate(contract.customerPoDate),
            },
            { label: "Invoice Type", value: contract.invoiceType },
        ],
        [
            {
                label: "Effective From",
                value: formatDate(contract.effectiveFrom),
            },
            {
                label: "Effective To",
                value: formatDate(contract.effectiveTo),
            },
            { label: "Post Rate", value: contract.postRate },
        ],
        [
            { label: "Belongs To", value: contract.belongsTo },
            {
                label: "IGST Applicable",
                value: contract.isIgstApplicable,
            },
            { label: "Financial Year", value: contract.financialYear },
        ],
        [
            { label: "Created By", value: contract.createdBy },
            { label: "Updated By", value: contract.updatedBy },
            { label: "Status", value: contract.active ? "Active" : "Inactive" },
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
            const valueLines = doc.splitTextToSize(
                safe(cell.value),
                COL_W - CELL_PAD_X * 2,
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

        row.forEach((cell, idx) => {
            const x = MARGIN + idx * COL_W;

            if (idx > 0) {
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
                COL_W - CELL_PAD_X * 2,
            );
            let vy = y + CELL_PAD_TOP + LABEL_H + LABEL_TO_VALUE_GAP;
            valueLines.forEach((line) => {
                doc.text(String(line), x + CELL_PAD_X, vy);
                vy += VALUE_H;
            });
        });

        doc.setDrawColor(...BORDER);
        doc.setLineWidth(0.1);
        doc.line(MARGIN, y + rowH, RIGHT, y + rowH);

        y += rowH;
    });

    y += 4;

    /* =========================================================
       CONTRACT DETAILS TABLE
       ========================================================= */
    drawSectionTitle("Contract Details");

    const details = Array.isArray(contract.details) ? contract.details : [];

    const detailRows =
        details.length > 0
            ? details.map((item, idx) => {
                const itemMaster = item.item || {};
                const itemCode = safe(itemMaster.itemCode || item.itemCode);
                const desc = safe(
                    itemMaster.itemDescription || item.itemDescription,
                );
                const hsn = safe(
                    itemMaster.hsnCode ||
                    item.hsnCode ||
                    item.hsCode,
                );

                let unit = "-";
                if (item.unit && typeof item.unit === "object") {
                    unit = safe(
                        item.unit.unitId ||
                        item.unit.unitName ||
                        item.unit.id,
                    );
                } else if (item.unit) {
                    unit = safe(item.unit);
                }

                const qty = Number(item.quantity) || 0;
                const orderRate = Number(item.orderRate) || 0;
                const discountPct = Number(item.discountPercentage) || 0;
                const discountAmt = Number(item.discountAmount) || 0;
                const amount = Number(item.amount) || 0;

                const taxPct =
                    item.taxPercentage &&
                        typeof item.taxPercentage === "object"
                        ? Number(item.taxPercentage.taxPercentage) || 0
                        : Number(item.taxPercentage) || 0;

                return [
                    idx + 1,
                    itemCode,
                    desc,
                    hsn,
                    unit,
                    qty,
                    formatCurrency(orderRate),
                    `${discountPct}%`,
                    formatCurrency(discountAmt),
                    formatCurrency(amount),
                    `${safe(item.taxType)} ${taxPct}%`,
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
                "Unit",
                "Qty",
                "Rate",
                "Disc %",
                "Disc Amt",
                "Amount",
                "Tax",
            ],
        ],
        body: detailRows,
        theme: "grid",
        margin: { left: MARGIN, right: MARGIN },
        tableWidth: CONTENT_W,
        styles: {
            fontSize: 7,
            cellPadding: { top: 1.6, bottom: 1.6, left: 1.6, right: 1.6 },
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
            0: { halign: "center", cellWidth: 8 },
            1: { cellWidth: 22 },
            2: { cellWidth: 38 },
            3: { halign: "center", cellWidth: 14 },
            4: { halign: "center", cellWidth: 11 },
            5: { halign: "right", cellWidth: 11 },
            6: { halign: "right", cellWidth: 16 },
            7: { halign: "right", cellWidth: 11 },
            8: { halign: "right", cellWidth: 15 },
            9: { halign: "right", cellWidth: 18 },
            10: { halign: "center", cellWidth: 22 },
        },
    });

    y = doc.lastAutoTable.finalY + 5;

    /* =========================================================
       TAX DETAILS TABLE
       ========================================================= */
    const taxSrc = Array.isArray(contract.taxDetails)
        ? contract.taxDetails
        : [];

    if (taxSrc.length > 0) {
        if (y > pageHeight - 70) {
            doc.addPage();
            y = MARGIN;
        }

        drawSectionTitle("Tax Details");

        const taxRows = taxSrc.map((t, idx) => {
            const particulars =
                t.particulars && typeof t.particulars === "object"
                    ? t.particulars.description ||
                    t.particulars.code ||
                    "-"
                    : safe(t.particulars);
            const amount = Number(t.amount) || 0;
            return [idx + 1, safe(particulars), formatCurrency(amount)];
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
       TOTAL AMOUNT SUMMARY BAR
       ========================================================= */
    if (y + 14 > pageHeight - 20) {
        doc.addPage();
        y = MARGIN;
    }

    const boxW = 90;
    const boxX = RIGHT - boxW;

    // Amount in Words (left)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text("AMOUNT IN WORDS", MARGIN, y + 3);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...DARK);
    const wordsLines = doc.splitTextToSize(
        safe(contract.amountInWords),
        boxX - MARGIN - 6,
    );
    let wy = y + 7;
    wordsLines.slice(0, 3).forEach((line) => {
        doc.text(String(line), MARGIN, wy);
        wy += 3.8;
    });

    // Total label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text("Total Amount", boxX + 3, y + 4);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.text(
        `Rs. ${formatCurrency(contract.totalAmount)}`,
        RIGHT - 3,
        y + 4,
        { align: "right" },
    );

    // Grand total bar
    y += 5;
    doc.setFillColor(...PRIMARY);
    doc.rect(boxX, y, boxW, 9, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...WHITE);
    doc.text("TOTAL", boxX + 3, y + 5.8);
    doc.setFontSize(10);
    doc.text(
        `Rs. ${formatCurrency(contract.totalAmount)}`,
        RIGHT - 3,
        y + 5.8,
        { align: "right" },
    );

    y += 14;

    /* =========================================================
       CHARGES SUMMARY / TERMS — 3-column grid
       ========================================================= */
    const hasTerms =
        contract.paymentTerms ||
        contract.priceTerms ||
        contract.terms ||
        contract.notes;

    if (hasTerms) {
        if (y > pageHeight - 50) {
            doc.addPage();
            y = MARGIN;
        }

        drawSectionTitle("Charges Summary & Terms");

        const termRows = [
            [
                { label: "Payment Terms", value: contract.paymentTerms },
                { label: "Price Terms", value: contract.priceTerms },
                { label: "Terms", value: contract.terms },
            ],
            [{ label: "Note", value: contract.notes, span: 3 }],
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
       ATTACHMENTS LIST
       ========================================================= */
    const attachments = Array.isArray(contract.attachments)
        ? contract.attachments
        : [];

    if (attachments.length > 0) {
        if (y > pageHeight - 40) {
            doc.addPage();
            y = MARGIN;
        }

        drawSectionTitle("Attached PO Copies");

        const attachRows = attachments.map((a, idx) => {
            const path =
                a.pdfAttached || a.filePath || a.fileName || "Attachment";
            const fileName = String(path).split(/[\\/]/).pop();
            return [idx + 1, safe(fileName)];
        });

        autoTable(doc, {
            startY: y,
            head: [["#", "File Name"]],
            body: attachRows,
            theme: "grid",
            margin: { left: MARGIN, right: MARGIN },
            tableWidth: CONTENT_W,
            styles: {
                fontSize: 8,
                cellPadding: { top: 1.8, bottom: 1.8, left: 1.8, right: 1.8 },
                textColor: DARK,
                lineColor: BORDER,
                lineWidth: 0.1,
            },
            headStyles: {
                fillColor: PRIMARY,
                textColor: WHITE,
                fontStyle: "bold",
                fontSize: 8,
                halign: "center",
            },
            columnStyles: {
                0: { halign: "center", cellWidth: 14 },
                1: { cellWidth: 172 },
            },
        });

        y = doc.lastAutoTable.finalY + 5;
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
            `Sales Contract — ${safe(contract.contractNo)}`,
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

    const safeName = (contract.contractNo || "SalesContract")
        .replace(/[^a-zA-Z0-9-_]/g, "_")
        .replace(/_+/g, "_");

    const blob = doc.output("blob");
    const blobUrl = URL.createObjectURL(blob);

    return { blobUrl, fileName: `${safeName}.pdf` };
};

export default generateSalesContractPDF;
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Professional, well-aligned PDF for a Quotation.
 * Mirrors the visual style of generateOrderAcceptancePDF /
 * generateSalesReturnPDF / generateSalesContractPDF.
 *
 * Returns { blobUrl, fileName } so it can be shown in PDFPreviewModal.
 */
export const generateQuotationPDF = ({ company, quotation, items, taxDetails }) => {
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

    let y = MARGIN;

    /* =========================================================
       HEADER BAND
       ========================================================= */
    doc.setFillColor(...PRIMARY);
    doc.rect(0, 0, pageWidth, 26, "F");

    doc.setTextColor(...WHITE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("QUOTATION", MARGIN, 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
        company?.name || "Quotation Document",
        MARGIN,
        18,
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(safe(`Quotation No: ${quotation.quotationNo}`), RIGHT, 11, {
        align: "right",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(safe(`Date: ${formatDate(quotation.date)}`), RIGHT, 17, {
        align: "right",
    });
    doc.text(safe(`Branch: ${quotation.branchName}`), RIGHT, 22, {
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
       CUSTOMER & QUOTATION INFO — 3-column grid
       ========================================================= */
    drawSectionTitle("Customer & Quotation Information");

    const infoRows = [
        [
            { label: "Customer Name", value: quotation.partyName },
            { label: "Quotation No", value: quotation.quotationNo },
            { label: "Serial No", value: quotation.serialNo },
        ],
        [
            { label: "Date", value: formatDate(quotation.date) },
            { label: "Valid Till", value: formatDate(quotation.validTill) },
            { label: "With Enquiry", value: quotation.withEnquiry },
        ],
        [
            { label: "Enquiry No", value: quotation.enquiryNo },
            { label: "Enquiry Date", value: formatDate(quotation.enquiryDate) },
            {
                label: "Customer Enquiry No",
                value: quotation.customerEnquiryNo,
            },
        ],
        [
            {
                label: "Customer Enquiry Date",
                value: formatDate(quotation.customerEnquiryDate),
            },
            { label: "Kind Attention", value: quotation.kindAttention },
            { label: "Prepared By", value: quotation.preparedBy },
        ],
        [
            { label: "Branch", value: quotation.branchName },
            { label: "Freight", value: formatCurrency(quotation.freight) },
            { label: "Freight By", value: quotation.freightBy },
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
       ITEM DETAILS TABLE
       ========================================================= */
    drawSectionTitle("Quotation Items");

    const detailRows =
        Array.isArray(items) && items.length > 0
            ? items.map((item, idx) => {
                return [
                    idx + 1,
                    safe(item.itemCode),
                    safe(item.itemDescription),
                    safe(item.unit),
                    Number(item.qtyOffered) || 0,
                    formatCurrency(item.basicPrice),
                    `${Number(item.discPercent) || 0}%`,
                    formatCurrency(item.discountAmount),
                    formatCurrency(item.quotAmount),
                    safe(item.currencyName || "INR"),
                    formatDate(item.date),
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
                "Unit",
                "Qty",
                "Rate",
                "Disc %",
                "Disc Amt",
                "Amount",
                "Currency",
                "Delivery",
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
            2: { cellWidth: 42 },
            3: { halign: "center", cellWidth: 12 },
            4: { halign: "right", cellWidth: 12 },
            5: { halign: "right", cellWidth: 18 },
            6: { halign: "right", cellWidth: 12 },
            7: { halign: "right", cellWidth: 16 },
            8: { halign: "right", cellWidth: 20 },
            9: { halign: "center", cellWidth: 12 },
            10: { halign: "center", cellWidth: 12 },
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

        // Map numeric particular IDs to human-readable labels
        const particularLabelMap = {
            "1000000092": "Gross Amount",
            "1000000093": "IGST",
            "1000000096": "PKG & FWN Charges",
            "1000000097": "CGST + SGST",
            "1000000098": "TCS %",
            "1000000099": "Freight",
        };

        const taxRows = taxDetails.map((t, idx) => {
            const raw = t.particulars;
            let label = raw;

            // If it's an object with a description, use that
            if (raw && typeof raw === "object") {
                label = raw.description || raw.code || "-";
            } else if (particularLabelMap[String(raw)]) {
                label = particularLabelMap[String(raw)];
            }

            return [idx + 1, safe(label), formatCurrency(t.amount)];
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
       TOTAL SUMMARY BAR
       ========================================================= */
    if (y + 14 > pageHeight - 20) {
        doc.addPage();
        y = MARGIN;
    }

    const boxW = 90;
    const boxX = RIGHT - boxW;

    // Amount breakdown rows
    const amountRows = [
        { label: "Sub Total", value: formatCurrency(quotation.amount) },
        { label: "Freight", value: formatCurrency(quotation.freight) },
    ];

    amountRows.forEach((row) => {
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

    // Grand total bar
    y += 1;
    doc.setFillColor(...PRIMARY);
    doc.rect(boxX, y, boxW, 9, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...WHITE);
    doc.text("TOTAL", boxX + 3, y + 5.8);
    doc.setFontSize(10);
    doc.text(
        `Rs. ${formatCurrency(quotation.totalAmount)}`,
        RIGHT - 3,
        y + 5.8,
        { align: "right" },
    );

    y += 14;

    /* =========================================================
       TERMS & REMARKS — 3-column grid
       ========================================================= */
    const hasTerms = quotation.terms || quotation.remarks;

    if (hasTerms) {
        if (y > pageHeight - 50) {
            doc.addPage();
            y = MARGIN;
        }

        drawSectionTitle("Terms & Remarks");

        const termRows = [
            [
                { label: "Terms", value: quotation.terms, span: 2 },
                { label: "Remarks", value: quotation.remarks, span: 1 },
            ],
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
       ATTACHMENTS
       ========================================================= */
    const attachments =
        quotation.attachments || [];

    if (Array.isArray(attachments) && attachments.length > 0) {
        if (y > pageHeight - 40) {
            doc.addPage();
            y = MARGIN;
        }

        drawSectionTitle("Attached Files");

        const attachRows = attachments.map((a, idx) => {
            const path =
                a.filePath || a.pdfAttached || a.fileName || "Attachment";
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
            `Quotation — ${safe(quotation.quotationNo)}`,
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

    const safeName = (quotation.quotationNo || "Quotation")
        .replace(/[^a-zA-Z0-9-_]/g, "_")
        .replace(/_+/g, "_");

    const blob = doc.output("blob");
    const blobUrl = URL.createObjectURL(blob);

    return { blobUrl, fileName: `${safeName}.pdf` };
};

export default generateQuotationPDF;
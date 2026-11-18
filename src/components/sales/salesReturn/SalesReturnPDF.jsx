import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Professional, well-aligned PDF for a Sales Return.
 * Mirrors the visual style of generateOrderAcceptancePDF.
 */
export const generateSalesReturnPDF = ({
    company,
    salesReturn,
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

    const PRIMARY = [30, 64, 175];
    const DARK = [31, 41, 55];
    const MUTED = [107, 114, 128];
    const LIGHT_BG = [243, 244, 246];
    const BORDER = [209, 213, 219];
    const WHITE = [255, 255, 255];

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

    /* HEADER */
    doc.setFillColor(...PRIMARY);
    doc.rect(0, 0, pageWidth, 26, "F");

    doc.setTextColor(...WHITE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("SALES RETURN", MARGIN, 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(company?.name || "Sales Return Document", MARGIN, 18);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(safe(`Doc No: ${salesReturn.docNo}`), RIGHT, 11, {
        align: "right",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(safe(`Date: ${formatDate(salesReturn.date)}`), RIGHT, 17, {
        align: "right",
    });
    doc.text(safe(`Plant: ${salesReturn.plantName}`), RIGHT, 22, {
        align: "right",
    });

    y = 34;

    const drawSectionTitle = (title) => {
        doc.setFillColor(...LIGHT_BG);
        doc.rect(MARGIN, y, CONTENT_W, 6.5, "F");
        doc.setTextColor(...PRIMARY);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text(safe(title).toUpperCase(), MARGIN + 3, y + 4.3);
        y += 8.5;
    };

    /* CUSTOMER & RETURN INFO */
    drawSectionTitle("Customer & Return Information");

    const infoRows = [
        [
            { label: "Customer Name", value: salesReturn.customerName },
            { label: "Customer Code", value: salesReturn.customerCode },
            { label: "Return Type", value: salesReturn.returnType },
        ],
        [
            { label: "Invoice No", value: salesReturn.invoiceNo },
            { label: "Party GST State", value: salesReturn.partyGSTState },
            {
                label: "Is IGST Applicable",
                value: salesReturn.isIGSTApplicable,
            },
        ],
        [
            { label: "Currency", value: salesReturn.currency },
            { label: "Belongs To", value: salesReturn.belongsTo },
            {
                label: "Net Amount",
                value: formatCurrency(salesReturn.netAmount),
            },
        ],
        [
            {
                label: "Amount in Words",
                value: salesReturn.amountInWords,
                span: 3,
            },
        ],
        [{ label: "Narration", value: salesReturn.narration, span: 3 }],
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

    /* ITEMS TABLE */
    drawSectionTitle("Sales Return Details");

    const detailRows =
        Array.isArray(items) && items.length > 0
            ? items.map((item, idx) => {
                // API nests item master under `item` (single object).
                // SalesReturnList flattens it, but handle both shapes.
                const itemMaster = item.item || {};
                const itemCode = safe(
                    itemMaster.itemCode || item.itemCode || item.code,
                );
                const desc = safe(
                    itemMaster.itemDescription || item.itemDescription,
                );
                const hsn = safe(
                    item.hsnSacCode || item.hsCode || item.hsnCode,
                );

                // Unit may be an object { id, unitId, unitDescription } or string
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
                } else if (item.unit !== undefined && item.unit !== null) {
                    unit = safe(item.unit);
                } else if (item.unitId) {
                    unit = safe(item.unitId);
                }

                // Tax %: string, number, or object
                let taxPct = 0;
                if (
                    item.taxPercentage &&
                    typeof item.taxPercentage === "object"
                ) {
                    taxPct = Number(item.taxPercentage.taxPercentage) || 0;
                } else if (item.taxPercentage !== undefined) {
                    taxPct = Number(item.taxPercentage) || 0;
                } else if (item.taxRs !== undefined) {
                    taxPct = Number(item.taxRs) || 0;
                }

                return [
                    idx + 1,
                    itemCode,
                    desc,
                    hsn,
                    unit,
                    Number(item.receivedQty || item.qty) || 0,
                    formatCurrency(item.rate),
                    formatCurrency(item.amount),
                    safe(item.taxType),
                    taxPct,
                ];
            })
            : [["-", "-", "No items", "-", "-", "-", "-", "-", "-", "-"]];

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
                "Amount",
                "Tax Type",
                "Tax %",
            ],
        ],
        body: detailRows,
        theme: "grid",
        margin: { left: MARGIN, right: MARGIN },
        tableWidth: CONTENT_W,
        styles: {
            fontSize: 7.5,
            cellPadding: { top: 1.8, bottom: 1.8, left: 1.8, right: 1.8 },
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
            fontSize: 7.5,
            halign: "center",
        },
        bodyStyles: { fontSize: 7.5 },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        columnStyles: {
            0: { halign: "center", cellWidth: 9 },
            1: { cellWidth: 26 },
            2: { cellWidth: 50 },
            3: { halign: "center", cellWidth: 16 },
            4: { halign: "center", cellWidth: 13 },
            5: { halign: "right", cellWidth: 12 },
            6: { halign: "right", cellWidth: 18 },
            7: { halign: "right", cellWidth: 22 },
            8: { halign: "center", cellWidth: 12 },
            9: { halign: "right", cellWidth: 8 },
        },
    });

    y = doc.lastAutoTable.finalY + 5;

    /* TAX DETAILS TABLE */
    if (Array.isArray(taxDetails) && taxDetails.length > 0) {
        if (y > pageHeight - 70) {
            doc.addPage();
            y = MARGIN;
        }

        drawSectionTitle("Tax Details");

        const taxRows = taxDetails.map((t, idx) => {
            // Shape A: { particulars, amount } — flattened by SalesReturnList
            if (t.particulars !== undefined && t.amount !== undefined) {
                const firstItem =
                    Array.isArray(items) && items.length > 0 ? items[0] : null;
                const taxPct =
                    firstItem && Number(firstItem.taxPercentage)
                        ? Number(firstItem.taxPercentage)
                        : 0;

                let particularsLabel = safe(t.particulars);
                if (
                    taxPct > 0 &&
                    ["IGST", "CGST", "SGST", "GST", "CGST + SGST"].includes(
                        String(t.particulars).toUpperCase(),
                    )
                ) {
                    particularsLabel = `${particularsLabel} @ ${taxPct}%`;
                }

                return [idx + 1, particularsLabel, formatCurrency(t.amount)];
            }

            // Shape B: { sgstRate, sgstAmount, ... }
            const parts = [];
            if (Number(t.sgstRate) || Number(t.sgstAmount)) {
                parts.push(
                    `SGST ${Number(t.sgstRate) || 0}% → ${formatCurrency(
                        t.sgstAmount,
                    )}`,
                );
            }
            if (Number(t.cgstRate) || Number(t.cgstAmount)) {
                parts.push(
                    `CGST ${Number(t.cgstRate) || 0}% → ${formatCurrency(
                        t.cgstAmount,
                    )}`,
                );
            }
            if (Number(t.igstRate) || Number(t.igstAmount)) {
                parts.push(
                    `IGST ${Number(t.igstRate) || 0}% → ${formatCurrency(
                        t.igstAmount,
                    )}`,
                );
            }

            const total =
                (Number(t.sgstAmount) || 0) +
                (Number(t.cgstAmount) || 0) +
                (Number(t.igstAmount) || 0);

            return [
                idx + 1,
                parts.length ? parts.join("  |  ") : "—",
                formatCurrency(total),
            ];
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

    /* NET AMOUNT SUMMARY BAR */
    if (y + 12 > pageHeight - 20) {
        doc.addPage();
        y = MARGIN;
    }

    const boxW = 90;
    const boxX = RIGHT - boxW;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text("Net Amount", boxX + 3, y + 4);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.text(
        `Rs. ${formatCurrency(salesReturn.netAmount)}`,
        RIGHT - 3,
        y + 4,
        { align: "right" },
    );

    y += 5;
    doc.setFillColor(...PRIMARY);
    doc.rect(boxX, y, boxW, 9, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...WHITE);
    doc.text("TOTAL", boxX + 3, y + 5.8);
    doc.setFontSize(10);
    doc.text(
        `Rs. ${formatCurrency(salesReturn.netAmount)}`,
        RIGHT - 3,
        y + 5.8,
        { align: "right" },
    );

    y += 14;

    /* TERMS */
    const hasTerms =
        salesReturn.amountInWords || salesReturn.narration;

    if (hasTerms) {
        if (y > pageHeight - 50) {
            doc.addPage();
            y = MARGIN;
        }

        drawSectionTitle("Terms & Conditions");

        const termRows = [
            [
                {
                    label: "Amount in Words",
                    value: salesReturn.amountInWords,
                    span: 2,
                },
                { label: "Narration", value: salesReturn.narration, span: 1 },
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

    /* SIGNATURE */
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

    /* FOOTER */
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
            `Sales Return — ${safe(salesReturn.docNo)}`,
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

    const safeName = (salesReturn.docNo || "SalesReturn")
        .replace(/[^a-zA-Z0-9-_]/g, "_")
        .replace(/_+/g, "_");

    const blob = doc.output("blob");
    const blobUrl = URL.createObjectURL(blob);

    return { blobUrl, fileName: `${safeName}.pdf` };
};

export default generateSalesReturnPDF;
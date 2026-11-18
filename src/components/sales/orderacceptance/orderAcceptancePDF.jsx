import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Professional, well-aligned PDF for a single Order Acceptance.
 * @param {Object} order - The transformed order acceptance row object
 */
export const generateOrderAcceptancePDF = (order) => {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const MARGIN = 12;
    const CONTENT_W = pageWidth - MARGIN * 2; // = 186mm
    const RIGHT = pageWidth - MARGIN; // = 198mm

    // ---------- Color Palette ----------
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
    doc.text("ORDER ACCEPTANCE", MARGIN, 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Sales Order Acceptance Document", MARGIN, 18);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(safe(`Order No: ${order.orderNo}`), RIGHT, 11, {
        align: "right",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(safe(`Date: ${formatDate(order.docDate)}`), RIGHT, 17, {
        align: "right",
    });
    doc.text(safe(`Branch: ${order.branch}`), RIGHT, 22, {
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
       CUSTOMER & ORDER INFO — 3-column grid
       ========================================================= */
    drawSectionTitle("Customer & Order Information");

    const infoRows = [
        [
            { label: "Customer Name", value: order.customerName },
            { label: "Customer GST No", value: order.customerGstNo },
            { label: "SO Type", value: order.soType },
        ],
        [
            { label: "With Quotation", value: order.withQuotation },
            { label: "Quotation No", value: order.quotationNo },
            { label: "Quotation Date", value: formatDate(order.quotationDate) },
        ],
        [
            { label: "Enquiry No", value: order.enquiryNo },
            { label: "Enquiry Date", value: formatDate(order.enquiryDate) },
            { label: "Cust PO No", value: order.customerPurchaseOrderNo },
        ],
        [
            {
                label: "Cust PO Date",
                value: formatDate(order.customerPurchaseOrderDate),
            },
            { label: "Belongs To", value: order.belongsTo },
            { label: "Post Rate", value: order.postRate },
        ],
        [
            { label: "GST Approval", value: order.gstApproval },
            { label: "Financial Year", value: order.financialYear },
            { label: "Created By", value: order.createdBy },
        ],
        [
            { label: "Updated By", value: order.updatedBy },
            { label: "Branch", value: order.branch },
            { label: "Doc Date", value: formatDate(order.docDate) },
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

            let vy =
                y + CELL_PAD_TOP + LABEL_H + LABEL_TO_VALUE_GAP;
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
       ORDER ACCEPTANCE DETAILS TABLE
       ========================================================= */
    drawSectionTitle("Order Acceptance Details");

    const details = Array.isArray(order.orderAcceptanceDetails)
        ? order.orderAcceptanceDetails
        : [];

    const detailRows =
        details.length > 0
            ? details.map((item, idx) => {
                // 🔑 API nests the item master under `items` (plural).
                //    Fall back to `item` for older payloads.
                const itemMaster = item.items || item.item || {};

                const itemCode = safe(
                    itemMaster.itemCode || item.itemCode,
                );
                const desc = safe(
                    itemMaster.itemDescription || item.itemDescription,
                );
                const hsn = safe(
                    itemMaster.hsnCode ||
                    item.hsCode ||
                    item.hsnCode ||
                    item.hsnSacCode,
                );

                // Unit may be an object { id, unitId, unitName } or a raw string
                let unit = "-";
                if (item.unit && typeof item.unit === "object") {
                    unit = safe(
                        item.unit.unitName ||
                        item.unit.unitId ||
                        item.unit.id,
                    );
                } else if (item.unit !== undefined && item.unit !== null) {
                    unit = safe(item.unit);
                } else if (item.unitId) {
                    unit = safe(item.unitId);
                }

                const qty = Number(item.quantity) || 0;

                // orderRate is the per-unit price.
                const orderRate =
                    Number(
                        item.orderRate ||
                        item.unitRate ||
                        item.quantityRate,
                    ) || 0;
                const discount =
                    Number(item.discount || item.dis) || 0;
                const amount = Number(item.amount) || 0;

                const taxType = safe(item.taxType);

                // taxPercentage may be an object { id, taxPercentage } or a raw value
                let taxPct = 0;
                if (
                    item.taxPercentage &&
                    typeof item.taxPercentage === "object"
                ) {
                    taxPct =
                        Number(item.taxPercentage.taxPercentage) || 0;
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
                    qty,
                    formatCurrency(orderRate),
                    `${discount}%`,
                    formatCurrency(amount),
                    `${taxType} ${taxPct}%`,
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
                "Disc",
                "Amount",
                "Tax",
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
            1: { cellWidth: 24 },
            2: { cellWidth: 45 },
            3: { halign: "center", cellWidth: 16 },
            4: { halign: "center", cellWidth: 13 },
            5: { halign: "right", cellWidth: 12 },
            6: { halign: "right", cellWidth: 18 },
            7: { halign: "right", cellWidth: 12 },
            8: { halign: "right", cellWidth: 21 },
            9: { halign: "center", cellWidth: 16 },
        },
    });

    y = doc.lastAutoTable.finalY + 5;

    /* =========================================================
       TAX DETAILS TABLE
       ========================================================= */
    if (Array.isArray(order.taxDetails) && order.taxDetails.length > 0) {
        if (y > pageHeight - 70) {
            doc.addPage();
            y = MARGIN;
        }

        drawSectionTitle("Tax Details");

        const taxRows = order.taxDetails.map((t, idx) => {
            let particulars = t.particulars;
            const labelMap = {
                "1000000092": "Gross Amount",
                "1000000093": "GST",
            };
            if (labelMap[String(particulars)]) {
                particulars = labelMap[String(particulars)];
            }
            return [
                idx + 1,
                safe(particulars),
                formatCurrency(t.acceptedQtyAmount || t.acceptedAmount || 0),
                formatCurrency(t.revisedAmount || 0),
            ];
        });

        autoTable(doc, {
            startY: y,
            head: [
                ["#", "Particulars", "Accepted Amount", "Revised Amount"],
            ],
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
                1: { cellWidth: 100 },
                2: { halign: "right", cellWidth: 36 },
                3: { halign: "right", cellWidth: 36 },
            },
        });

        y = doc.lastAutoTable.finalY + 5;
    }

    /* =========================================================
       TERMS & CONDITIONS — 3-column grid (same style as info)
       ========================================================= */
    const hasTerms =
        order.destination ||
        order.freight ||
        order.modeOfTransport ||
        order.grossValue ||
        order.deliveryTerms ||
        order.paymentTerms ||
        order.specification ||
        order.note;

    if (hasTerms) {
        if (y > pageHeight - 50) {
            doc.addPage();
            y = MARGIN;
        }

        drawSectionTitle("Terms & Conditions");

        const termRows = [
            [
                { label: "Destination", value: order.destination },
                { label: "Freight", value: order.freight },
                { label: "Mode of Transport", value: order.modeOfTransport },
            ],
            [
                {
                    label: "Gross Value",
                    value: formatCurrency(order.grossValue),
                },
                { label: "Delivery Terms", value: order.deliveryTerms },
                { label: "Payment Terms", value: order.paymentTerms },
            ],
            [
                { label: "Specification", value: order.specification },
                { label: "Note", value: order.note },
            ],
        ];

        const T_COL_W = CONTENT_W / 3;
        const T_PAD_X = 1.5;
        const T_PAD_TOP = 1.5;
        const T_PAD_BOTTOM = 0;
        const T_LABEL_H = 3;
        const T_GAP = 3.5;
        const T_VALUE_H = 3.6;
        const T_MIN_ROW_H = 6;

        termRows.forEach((row) => {
            const cellHeights = row.map((cell) => {
                const valueLines = doc.splitTextToSize(
                    safe(cell.value),
                    T_COL_W - T_PAD_X * 2,
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

            row.forEach((cell, idx) => {
                const x = MARGIN + idx * T_COL_W;

                // Vertical divider
                if (idx > 0) {
                    doc.setDrawColor(...BORDER);
                    doc.setLineWidth(0.1);
                    doc.line(x, y, x, y + rowH);
                }

                // Label
                doc.setFont("helvetica", "normal");
                doc.setFontSize(6.5);
                doc.setTextColor(...MUTED);
                doc.text(
                    safe(cell.label),
                    x + T_PAD_X,
                    y + T_PAD_TOP + 2.3,
                );

                // Value
                doc.setFont("helvetica", "bold");
                doc.setFontSize(8);
                doc.setTextColor(...DARK);
                const valueLines = doc.splitTextToSize(
                    safe(cell.value),
                    T_COL_W - T_PAD_X * 2,
                );

                let vy = y + T_PAD_TOP + T_LABEL_H + T_GAP;
                valueLines.forEach((line) => {
                    doc.text(String(line), x + T_PAD_X, vy);
                    vy += T_VALUE_H;
                });
            });

            // Bottom rule
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
    if (Array.isArray(order.attachments) && order.attachments.length > 0) {
        if (y > pageHeight - 40) {
            doc.addPage();
            y = MARGIN;
        }

        drawSectionTitle("Attached PO Copies");

        const attachRows = order.attachments.map((a, idx) => [
            idx + 1,
            safe(a.fileName || a.name),
            safe(a.fileSize),
        ]);

        autoTable(doc, {
            startY: y,
            head: [["#", "File Name", "Size"]],
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
                1: { cellWidth: 132 },
                2: { halign: "center", cellWidth: 40 },
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
       FOOTER on every page
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
            `Order Acceptance — ${safe(order.orderNo)}`,
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

    /* =========================================================
       SAVE
       ========================================================= */
    const safeName = (order.orderNo || "OrderAcceptance")
        .replace(/[^a-zA-Z0-9-_]/g, "_")
        .replace(/_+/g, "_");
    doc.save(`${safeName}.pdf`);
};

export default generateOrderAcceptancePDF;
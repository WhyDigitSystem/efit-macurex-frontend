import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Professional, well-aligned PDF for a Customer Complaint.
 * Mirrors the visual style of generateSalesReturnPDF / generateOrderAcceptancePDF.
 *
 * @param {Object} payload
 * @param {Object} payload.company    - { name }
 * @param {Object} payload.complaint  - header fields
 * @returns {{ blobUrl: string, fileName: string }}
 */
export const generateCustomerComplaintPDF = ({ company, complaint }) => {
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

    let y = MARGIN;

    /* =========================================================
       HEADER BAND
       ========================================================= */
    doc.setFillColor(...PRIMARY);
    doc.rect(0, 0, pageWidth, 26, "F");

    doc.setTextColor(...WHITE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("CUSTOMER COMPLAINT", MARGIN, 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
        company?.name || "Customer Complaint Document",
        MARGIN,
        18,
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(
        safe(`Complaint No: ${complaint.complaintNo}`),
        RIGHT,
        11,
        { align: "right" },
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
        safe(`Date: ${formatDate(complaint.complaintDate)}`),
        RIGHT,
        17,
        { align: "right" },
    );
    doc.text(
        safe(`Plant: ${complaint.branchName}`),
        RIGHT,
        22,
        { align: "right" },
    );

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
       COMPLAINT INFO — 3-column grid
       ========================================================= */
    drawSectionTitle("Complaint Information");

    const infoRows = [
        [
            { label: "Complaint No", value: complaint.complaintNo },
            { label: "Complaint Date", value: formatDate(complaint.complaintDate) },
            { label: "Complaint Type", value: complaint.complaintType },
        ],
        [
            { label: "Customer Ref No", value: complaint.customerRefNo },
            { label: "Customer Name", value: complaint.customerName },
            { label: "Buyer Name", value: complaint.buyerName },
        ],
        [
            { label: "Plant", value: complaint.branchName },
            { label: "Department", value: complaint.departmentName },
            { label: "Belongs To", value: complaint.userCategory },
        ],
        [
            { label: "Item Code", value: complaint.itemCode },
            { label: "Item Description", value: complaint.itemDescription },
            { label: "Qty No", value: complaint.qtyNo },
        ],
        [
            { label: "Prepared By", value: complaint.preparedBy },
            { label: "Financial Year", value: complaint.financialYear },
            { label: "Status", value: complaint.active ? "Active" : "Inactive" },
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
            const cellW = COL_W;
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
       COMPLAINT DETAILS
       ========================================================= */
    drawSectionTitle("Complaint Details");

    const detailsRows = [
        [
            {
                label: "Details of Complaint",
                value: complaint.detailsOfComplaint,
                span: 3,
            },
        ],
        [
            { label: "Remarks", value: complaint.remarks, span: 3 },
        ],
    ];

    detailsRows.forEach((row) => {
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
       ATTACHED IMAGE
       ========================================================= */
    if (complaint.image) {
        if (y > pageHeight - 60) {
            doc.addPage();
            y = MARGIN;
        }

        drawSectionTitle("Attached Image");

        autoTable(doc, {
            startY: y,
            head: [["#", "File Name"]],
            body: [["1", safe(complaint.image)]],
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
            `Customer Complaint — ${safe(complaint.complaintNo)}`,
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

    const safeName = (complaint.complaintNo || "CustomerComplaint")
        .replace(/[^a-zA-Z0-9-_]/g, "_")
        .replace(/_+/g, "_");

    const blob = doc.output("blob");
    const blobUrl = URL.createObjectURL(blob);

    return { blobUrl, fileName: `${safeName}.pdf` };
};

export default generateCustomerComplaintPDF;
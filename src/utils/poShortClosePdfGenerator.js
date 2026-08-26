import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const COMPANY = {
  name: "Macurex Sensors Pvt.Ltd.",
  legalName: "MACUREX SENSORS PVT LTD",
  addressLines: ["NO.21/B, KIADB INDUSTRIAL AREA, 1ST PHASE,", "KUMBALGODU"],
  gstin: "29AABCM1363N1Z6",
};

/**
 * @param {Object} record - a row from PoShortCloseListView's data
 *                          (has `details` = purchaseOrderDeliveryScheduleShortCloseDetailsResponseDTO)
 */
export function generatePoShortClosePdf(record) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 30;
  let y = margin;

  /* ---- Title ---- */
  doc.setDrawColor(0);
  doc.setLineWidth(1);
  doc.rect(margin, y, pageWidth - margin * 2, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("PO / Delivery Schedule Short Close", pageWidth / 2, y + 25, {
    align: "center",
  });
  y += 40;

  /* ---- Company header ---- */
  const headerHeight = 90;
  doc.rect(margin, y, pageWidth - margin * 2, headerHeight);
  doc.line(pageWidth / 2 + 20, y, pageWidth / 2 + 20, y + headerHeight);

  let ly = y + 18;
  doc.setFontSize(11);
  doc.text(COMPANY.name, margin + 8, ly);
  ly += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  COMPANY.addressLines.forEach((line) => {
    doc.text(line, margin + 8, ly);
    ly += 12;
  });
  ly += 6;
  doc.text(`Plant : ${record.plantId || ""}`, margin + 8, ly);

  let ry = y + 20;
  const rx = pageWidth / 2 + 30;
  doc.setFontSize(9);
  const rightRow = (label, value) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, rx, ry);
    doc.setFont("helvetica", "normal");
    doc.text(String(value ?? ""), rx + 110, ry);
    ry += 15;
  };
  rightRow("Short Close No :", record.shortCloseNo || "");
  rightRow("Short Close Date :", record.shortCloseDate || "");
  rightRow("PO/Del.Sch.No :", record.poNo || "");
  rightRow("Status :", record.orderStatus || "");

  y += headerHeight;

  /* ---- Supplier ---- */
  doc.rect(margin, y, pageWidth - margin * 2, 40);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Supplier :", margin + 8, y + 16);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${record.supplierCode || ""} - ${record.supplierName || ""}`,
    margin + 70,
    y + 16,
  );
  doc.text(
    `Reference: ${record.referenceForShortClose || record.narration || ""}`,
    margin + 8,
    y + 30,
  );
  y += 40;

  /* ---- Item lines ---- */
  const details = record.details || [];
  const rows = details.map((d, idx) => [
    idx + 1,
    d.item?.itemCode || "",
    d.item?.itemDescription || "",
    d.item?.unit?.unitId || d.item?.unit?.id || "",
    d.orderedQty ?? "",
    d.suppliedQty ?? "",
    d.pendingQty ?? "",
    d.shortCloseQty ?? "",
    d.newRequiredQty ?? "",
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [
      [
        "S.No",
        "Item Code",
        "Item Description",
        "Unit",
        "Ordered Qty",
        "Supplied Qty",
        "Pending Qty",
        "Short Close Qty",
        "New Req. Qty",
      ],
    ],
    body: rows,
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 3,
      lineColor: [0, 0, 0],
      lineWidth: 0.5,
    },
    headStyles: { fillColor: [255, 255, 255], textColor: 0, fontStyle: "bold" },
  });

  y = doc.lastAutoTable.finalY + 10;

  /* ---- Total pending qty ---- */
  doc.rect(margin, y, pageWidth - margin * 2, 24);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Total Pending Qty", margin + 8, y + 16);
  doc.setFont("helvetica", "normal");
  doc.text(
    String(record.totalPendingQty ?? "0.000"),
    pageWidth - margin - 10,
    y + 16,
    { align: "right" },
  );
  y += 24;

  /* ---- Signature row ---- */
  doc.rect(margin, y, pageWidth - margin * 2, 30);
  doc.text("Prepared By", margin + 8, y + 20);
  doc.text("Checked By", pageWidth / 2 - 20, y + 20);
  doc.text(`For ${COMPANY.legalName}`, pageWidth - margin - 8, y + 20, {
    align: "right",
  });

  const fileName = (record.shortCloseNo || "PoShortClose").replace(/\//g, "-");
  doc.save(`${fileName}.pdf`);
}

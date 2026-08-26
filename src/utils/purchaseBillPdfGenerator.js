import jsPDF from "jspdf";

const COMPANY = {
  name: "Macurex Sensors Pvt.Ltd.",
  legalName: "MACUREX SENSORS PVT LTD",
  addressLines: ["NO.21/B, KIADB INDUSTRIAL AREA, 1ST PHASE,", "KUMBALGODU"],
  gstin: "29AABCM1363N1Z6",
  pan: "AABCM1363N",
  cin: "U32109KA1992PTC013678",
};

const fmtAmount = (n) =>
  (Number(n) || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/**
 * @param {Object} bill - a row from PurchaseBillList's purchaseData
 *                        (extend with more fields once real API data is wired up)
 */
export function generatePurchaseBillPdf(bill) {
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
  doc.text("Purchase Bill", pageWidth / 2, y + 25, { align: "center" });
  y += 40;

  /* ---- Company header ---- */
  const headerHeight = 100;
  doc.rect(margin, y, pageWidth - margin * 2, headerHeight);
  doc.line(pageWidth / 2 + 20, y, pageWidth / 2 + 20, y + headerHeight);

  let ly = y + 18;
  doc.setFontSize(11);
  doc.text(COMPANY.name, margin + 8, ly);
  ly += 14;
  doc.text(COMPANY.legalName, margin + 8, ly);
  ly += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  COMPANY.addressLines.forEach((line) => {
    doc.text(line, margin + 8, ly);
    ly += 12;
  });
  ly += 6;
  doc.text(`GSTIN: ${COMPANY.gstin}`, margin + 8, ly);
  ly += 12;
  doc.text(`PAN: ${COMPANY.pan}`, margin + 8, ly);

  let ry = y + 20;
  const rx = pageWidth / 2 + 30;
  doc.setFontSize(9);
  const rightRow = (label, value) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, rx, ry);
    doc.setFont("helvetica", "normal");
    doc.text(String(value ?? ""), rx + 90, ry);
    ry += 15;
  };
  rightRow("PB No :", bill.pbNo || "");
  rightRow("PB Date :", bill.pbDate || "");
  rightRow("GRN No :", bill.grnNo || "");
  rightRow("Status :", bill.status || "");

  y += headerHeight;

  /* ---- Supplier ---- */
  doc.rect(margin, y, pageWidth - margin * 2, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Supplier :", margin + 8, y + 16);
  doc.setFont("helvetica", "normal");
  doc.text(bill.supplierName || "", margin + 70, y + 16);
  y += 40;

  /* ---- Amount block ---- */
  doc.rect(margin, y, pageWidth - margin * 2, 30);
  doc.setFont("helvetica", "bold");
  doc.text("Total Amount", margin + 8, y + 19);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Rs. ${fmtAmount(bill.totalAmount)}`,
    pageWidth - margin - 10,
    y + 19,
    { align: "right" },
  );
  y += 30;

  /* ---- Signature row ---- */
  doc.rect(margin, y, pageWidth - margin * 2, 30);
  doc.setFontSize(9);
  doc.text("Prepared By", margin + 8, y + 20);
  doc.text("Checked By", pageWidth / 2 - 20, y + 20);
  doc.text(`For ${COMPANY.legalName}`, pageWidth - margin - 8, y + 20, {
    align: "right",
  });

  const fileName = (bill.pbNo || "PurchaseBill").replace(/\//g, "-");
  doc.save(`${fileName}.pdf`);
}

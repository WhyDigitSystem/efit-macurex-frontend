import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDateForDisplay } from "./dateFormatter";

/* -------------------------------------------------------------------------- */
/* Fixed company letterhead (same on every PO)                                */
/* -------------------------------------------------------------------------- */
const COMPANY = {
  name: "Macurex Sensors Pvt.Ltd.",
  legalName: "MACUREX SENSORS PVT LTD",
  addressLines: ["NO.21/B, KIADB INDUSTRIAL AREA, 1ST PHASE,", "KUMBALGODU"],
  gstin: "29AABCM1363N1Z6",
  pan: "AABCM1363N",
  cin: "U32109KA1992PTC013678",
};

const NOTES = [
  "1.PLEASE MENTION OUR PART NAME, PART NUMBER AND PO NUMBER, DELIVERY SCHEDULE IN YOUR INVOICE",
  "2.INSPECTION REPORT SHOULD BE SUBMITTED ALONG WITH SUPPLIES,WITHOUT INSPECTION REPORT MATERIAL WILL NOT BE INSPECTED AT INWARDQC.",
  "3.REJECTED MATERIAL SHOULD BE COLLECTED FROM OUR FACTORY WITHIN 2 DAYS FROM THE DATE OF INTIMATION, OTHERWISE IT WILL BE SENT THROUGH AVAILABLE TRANSPORT ON TO PAY BASIS.",
  "4.IF YOU COULD NOT ABLE TO SUPPLY THE MATERIAL WITHIN THE SPECIFIED DATE PLEASE INFORM US BEFORE ONE WEEK WITH VALID REASON.",
  "5.WITHOUT PROPER INVOICE MATERIAL WILL NOT BE INWARDED / ACCEPTED.",
  "6.PLEASE ENSURE THAT MATERIAL, REACHES TO THE FACTORY ON SCHEDULE DATE/WEEK",
  "7.PURCHASE ORDER VALID FOR THE YEAR 2026 - 27",
  "8.SCHEDULE WILL BE GIVEN EVERY MONTH",
  "9.ANY CHANGE IN TERMS & CONDITION WILL BE THROUGH AMENDMENTS.",
  "10.IF ANY SEGGREGATION MADE,SEGGREGATION CHARGES WILL BE DEBITED TO YOUR ACCOUNT.",
  "11.ALL PROCESSES EMPLOYED AND PARTS MANUFACTURED OR SUBCONTRACTED BY SUPPLIERS SHALL SATISFY CURRENT",
  "   GOVERMENTAL AND SAFETY REGULATIONS ON RESTRICTED TOXIC AND HAZARDOUS MATERIALS.",
  "12.MOTOR VEHICLE REGULATION (MVR)",
  "   -FITTNESS CERTIFICATE (FC) MUST BE AVALABLE",
  "   -DRIVING LICENCE (DL)",
  "   -PUC (POLLUTION UNDER CHECK)",
  "   -ZERO ALLCHOHALL",
  "13.MSDS AS APPLICABLE",
  "14.PLASTIC LESS THEM 120 MICRONS NOT ALLOWED",
  "   AS PER PLASTIC WASTE MANAGEMENT RULES",
  "15.TREM (TRANSPORT EMERGENCY MANUAL) CARD AS APPLICABLE",
  "16.(IF RAW MATERIAL / CHILD PART / NOT MEET AS PER DRAWING SPECIFICATION LOT WILL BE REJECT)",
  "17.SUPPLIER MUST COMPLY WITH EHS & OHSAS REQUIREMENT,",
  "18.SUPPLIER MUST MEET RoHS REQUIREMENT AS APPLICABLE TO THE PRODUCT, SPECIFIC",
];

/* -------------------------------------------------------------------------- */
/* Number -> Indian words (for "Total PO Value in Words")                     */
/* -------------------------------------------------------------------------- */
const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

function twoDigits(n) {
  if (n < 20) return ONES[n];
  return TENS[Math.floor(n / 10)] + (n % 10 ? " " + ONES[n % 10] : "");
}

function threeDigits(n) {
  if (n >= 100) {
    return (
      ONES[Math.floor(n / 100)] +
      " Hundred" +
      (n % 100 ? " and " + twoDigits(n % 100) : "")
    );
  }
  return twoDigits(n);
}

export function numberToIndianWords(num) {
  const n = Math.round(Number(num) || 0);
  if (n === 0) return "Zero";

  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const rest = n % 1000;

  let words = "";
  if (crore) words += threeDigits(crore) + " Crore ";
  if (lakh) words += threeDigits(lakh) + " Lakh ";
  if (thousand) words += threeDigits(thousand) + " Thousand ";
  if (rest) words += threeDigits(rest);

  return words.trim();
}

const fmtAmount = (n) =>
  (Number(n) || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/* -------------------------------------------------------------------------- */
/* Main generator                                                             */
/* -------------------------------------------------------------------------- */
/**
 * @param {Object} po - a row from PurchaseOrderList's itemData (already transformed),
 *                       OR a fresh object from getPurchaseOrderById if you fetch full detail on click.
 */
export function generatePurchaseOrderPdf(po) {
  const doc = new jsPDF({ unit: "pt", format: "a4" }); // 595 x 842 pt
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 30;
  let y = margin;

  /* ---- Outer border + title ---- */
  doc.setDrawColor(0);
  doc.setLineWidth(1);
  doc.rect(margin, margin, pageWidth - margin * 2, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Purchase Order", pageWidth / 2, margin + 25, { align: "center" });
  y = margin + 40;

  /* ---- Header block: company (left) + doc numbers (right) ---- */
  const headerHeight = 130;
  doc.rect(margin, y, pageWidth - margin * 2, headerHeight);
  doc.line(pageWidth / 2 + 20, y, pageWidth / 2 + 20, y + headerHeight);

  let ly = y + 18;
  doc.setFont("helvetica", "bold");
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
  doc.setFont("helvetica", "bold");
  doc.text("To :", margin + 8, ly);
  doc.setFont("helvetica", "normal");
  ly += 13;
  doc.text(po.supplierCode || "", margin + 8, ly);
  ly += 12;
  doc.text(po.supplierName || "", margin + 8, ly);

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
  rightRow("PO NO :", po.docId || po.poNo || "");
  rightRow(
    "PO DT :",
    formatDateForDisplay(po.docDate || po.orderPlacedDate) || "",
  );
  rightRow("REF NO :", po.refNo || "");
  rightRow("REF DT :", formatDateForDisplay(po.refDate) || "");
  rightRow("GSTIN No :", po.supplierGstin || "");
  rightRow("INDENT No :", po.indentNo || "");
  rightRow("INDENT DATE:", formatDateForDisplay(po.indentDate) || "");

  y += headerHeight;

  /* ---- Dear Sir intro line ---- */
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  const intro =
    "We have pleasure in placing order on you for the supply of the following items as per the terms mentioned below. " +
    "Kindly send your acceptance of the purchase order per return post. Any clarification in this order will not be entertained after 1 week of receipt of Purchase Order";
  doc.rect(margin, y, pageWidth - margin * 2, 40);
  doc.text("Dear Sir,", margin + 8, y + 12);
  doc.text(
    doc.splitTextToSize(intro, pageWidth - margin * 2 - 16),
    margin + 8,
    y + 24,
  );
  y += 40;

  /* ---- Item lines (pick the right array for Local vs Import) ---- */
  const items =
    (po.poType === "Import"
      ? po.purchaseOrderImportDetailsDTO
      : po.purchaseOrderLocalDetailsDTO) || [];

  const rows = items.map((it, idx) => [
    idx + 1,
    it.partNo || it.itemCode || "",
    it.partName || it.itemDesc || it.itemName || "",
    it.customerPartNo || "",
    it.hsnCode || "NA",
    `${it.taxPercentage ?? 0}%`,
    it.unit || it.unitName || "",
    it.qty ?? it.quantity ?? "",
    fmtAmount(it.rate),
    fmtAmount(it.amount ?? (it.rate || 0) * (it.qty || it.quantity || 0)),
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [
      [
        "S.NO",
        "Part No",
        "Part Name",
        "Customer part no",
        "HsnCode",
        "Tax(%)",
        "Unit",
        "Qty",
        "Rate(Rs)",
        "Amount",
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
    columnStyles: {
      0: { cellWidth: 28 },
      8: { halign: "right" },
      9: { halign: "right" },
    },
  });

  y = doc.lastAutoTable.finalY;

  /* ---- Totals block ---- */
  const totalsX = pageWidth - margin - 200;
  doc.rect(margin, y, pageWidth - margin * 2, 60);
  doc.setFontSize(9);
  const totalsRow = (label, val, bold) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.text(label, totalsX, y + 15);
    doc.text(String(val), pageWidth - margin - 10, y + 15, { align: "right" });
    y += 15;
  };
  totalsRow("CGST Total", `0 % 0`);
  totalsRow("SGST Total", `0 % 0`);
  totalsRow("GST Total Tax Value", 0);
  totalsRow(
    "Total Value",
    fmtAmount(po.totalPoValueInr || po.totalAmount),
    true,
  );
  y += 5;

  /* ---- Terms / delivery block ---- */
  const termsStart = y;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const termsHeight = 130;
  doc.rect(margin, termsStart, pageWidth - margin * 2, termsHeight);
  let ty = termsStart + 14;
  const termsRow = (label, value) => {
    doc.text(label, margin + 8, ty);
    doc.text(":", margin + 130, ty);
    doc.text(
      doc.splitTextToSize(String(value ?? ""), pageWidth - margin * 2 - 150),
      margin + 140,
      ty,
    );
    ty += 14;
  };
  doc.text(
    `Total GST Tax Value in Words: Rupees ${numberToIndianWords(0)} Only`,
    margin + 8,
    ty,
  );
  ty += 14;
  doc.text(
    `Total PO Value in Words: Rupees ${numberToIndianWords(po.totalPoValueInr || po.totalAmount)} only`,
    margin + 8,
    ty,
  );
  ty += 16;
  termsRow("Delivery", po.deliveryTerms || "");
  termsRow("Payment Terms", po.paymentTerms || "");
  termsRow("Freight charges", po.freightCharges || "");
  termsRow("Mode of Transport", po.modeOfDespatch || "");
  termsRow("Fright Type", po.freightType || "");
  termsRow("Packing Type", po.packingType || "");
  termsRow("Insurance", po.insurance ?? 0);
  termsRow("Special Notes", po.notes || "");
  y = termsStart + termsHeight;

  /* ---- Remarks ---- */
  doc.rect(margin, y, pageWidth - margin * 2, 30);
  doc.text(`Remarks : ${po.remarks || ""}`, margin + 8, y + 18);
  y += 30;

  /* ---- Notes footer ---- */
  const notesHeight = NOTES.length * 9 + 12;
  doc.rect(margin, y, pageWidth - margin * 2, notesHeight);
  doc.setFontSize(6.5);
  let ny = y + 10;
  doc.text("Note", margin + 8, ny);
  ny += 9;
  NOTES.forEach((line) => {
    doc.text(line, margin + 8, ny);
    ny += 8.5;
  });
  y += notesHeight;

  /* ---- Signature row ---- */
  doc.rect(margin, y, pageWidth - margin * 2, 30);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Prepared By", margin + 8, y + 20);
  doc.text(po.preparedBy || "", margin + 8, y + 32 > y + 30 ? y + 20 : y + 20);
  doc.text("Checked By", pageWidth / 2 - 20, y + 20);
  doc.text(`For ${COMPANY.legalName}`, pageWidth - margin - 8, y + 20, {
    align: "right",
  });

  /* ---- Save ---- */
  const fileName = (po.docId || po.poNo || "PurchaseOrder").replace(/\//g, "-");
  doc.save(`${fileName}.pdf`);
}

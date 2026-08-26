import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDateForDisplay } from "./dateFormatter";
import { companySetupAPI } from "../api/companySetupApi";

/** Title-case a string like "BENGALURU" -> "Bengaluru" */
const titleCase = (str = "") =>
  str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

/** Build the address lines array from the company object's location fields */
const buildAddressLines = (company) => {
  const lines = [];
  if (company.registeredAddress) lines.push(company.registeredAddress);

  const cityName =
    company.city && typeof company.city === "object"
      ? company.city.cityName
      : company.city;
  const stateName =
    company.state && typeof company.state === "object"
      ? company.state.stateName
      : company.state;
  const countryName =
    company.country && typeof company.country === "object"
      ? company.country.countryName
      : company.country;

  const cityStateLine = [
    titleCase(cityName),
    titleCase(stateName),
    company.pincode,
  ]
    .filter(Boolean)
    .join(", ");
  if (cityStateLine) lines.push(cityStateLine);
  if (countryName) lines.push(titleCase(countryName));

  return lines;
};

/**
 * @param {Object} record - a row from PoShortCloseListView's data
 *                          (has `details` = purchaseOrderDeliveryScheduleShortCloseDetailsResponseDTO)
 */
export async function generatePoShortClosePdf(record) {
  const orgId = localStorage.getItem("orgId");
  let company = {};

  try {
    company = (await companySetupAPI.getCompanyById(orgId)) || {};
  } catch (err) {
    console.error("Error loading company for PDF:", err);
  }

  const addressLines = buildAddressLines(company);

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
  const headerHeight = 130;
  doc.rect(margin, y, pageWidth - margin * 2, headerHeight);
  doc.line(pageWidth / 2 + 20, y, pageWidth / 2 + 20, y + headerHeight);

  let ly = y + 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(company.companyName || "", margin + 8, ly);
  ly += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  addressLines.forEach((line) => {
    doc.text(line, margin + 8, ly);
    ly += 12;
  });
  ly += 6;
  if (company.gst) {
    doc.text(`GSTIN: ${company.gst}`, margin + 8, ly);
    ly += 12;
  }
  if (company.panNo) {
    doc.text(`PAN: ${company.panNo}`, margin + 8, ly);
    ly += 12;
  }
  if (company.cin) {
    doc.text(`CIN: ${company.cin}`, margin + 8, ly);
    ly += 12;
  }
  ly += 4;
  doc.setFont("helvetica", "bold");
  doc.text("Plant :", margin + 8, ly);
  doc.setFont("helvetica", "normal");
  doc.text(String(record.plantId || ""), margin + 60, ly);

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
  rightRow(
    "Short Close Date :",
    formatDateForDisplay(record.shortCloseDate) || "",
  );
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
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Prepared By", margin + 8, y + 20);
  doc.text("Checked By", pageWidth / 2 - 20, y + 20);
  doc.text(`For ${company.companyName || ""}`, pageWidth - margin - 8, y + 20, {
    align: "right",
  });

  /* ---- Save ---- */
  const fileName = (record.shortCloseNo || "PoShortClose").replace(/\//g, "-");
  doc.save(`${fileName}.pdf`);
}

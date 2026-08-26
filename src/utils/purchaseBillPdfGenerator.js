import jsPDF from "jspdf";
import { companySetupAPI } from "../api/companySetupApi";

const fmtAmount = (n) =>
  (Number(n) || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

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
 * Fetches the current org's company details and generates the Purchase Bill PDF.
 * @param {Object} bill - a row from PurchaseBillList's purchaseData
 */
export async function generatePurchaseBillPdf(bill) {
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
  doc.text("Purchase Bill", pageWidth / 2, y + 25, { align: "center" });
  y += 40;

  /* ---- Company header ---- */
  const headerHeight = 100;
  doc.rect(margin, y, pageWidth - margin * 2, headerHeight);
  doc.line(pageWidth / 2 + 20, y, pageWidth / 2 + 20, y + headerHeight);

  let ly = y + 18;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
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
  }

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
  doc.text(`For ${company.companyName || ""}`, pageWidth - margin - 8, y + 20, {
    align: "right",
  });

  const fileName = (bill.pbNo || "PurchaseBill").replace(/\//g, "-");
  doc.save(`${fileName}.pdf`);
}

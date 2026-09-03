import PDFDocument from "pdfkit";
import QRCode from "qrcode";

const BRAND_NAME = "E-Library";
const ACCENT_COLOR = "#4338CA";
const MUTED_COLOR = "#6B7280";
const BORDER_COLOR = "#E5E7EB";

/**
 * @param {Object} opts
 * @param {string} opts.title
 * @param {string} opts.referenceCode - encoded into the QR image
 * @param {Array<{label: string, value: string}>} opts.fields
 * @param {string} [opts.footerNote]
 * @param {string} [opts.statusLine]
 * @returns {Promise<Buffer>}
 */
export const buildReceiptPdf = async ({
  title,
  referenceCode,
  fields,
  footerNote = "",
  statusLine = "",
}) => {
  const qrDataUrl = await QRCode.toDataURL(referenceCode, { margin: 1, width: 220 });
  const qrBuffer = Buffer.from(qrDataUrl.split(",")[1], "base64");

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  const donePromise = new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  doc.fillColor(ACCENT_COLOR).fontSize(20).font("Helvetica-Bold").text(BRAND_NAME, 50, 50);
  doc.fillColor("#111827").fontSize(16).font("Helvetica-Bold").text(title, 50, 85);

  if (statusLine) {
    doc.fillColor(MUTED_COLOR).fontSize(10).font("Helvetica").text(statusLine, 50, 110);
  }

  doc.moveTo(50, 135).lineTo(545, 135).strokeColor(BORDER_COLOR).stroke();
  doc.image(qrBuffer, 430, 50, { width: 100, height: 100 });

  let y = 160;
  doc.font("Helvetica").fontSize(11);
  for (const { label, value } of fields) {
    doc.fillColor(MUTED_COLOR).text(label, 50, y);
    doc.fillColor("#111827").font("Helvetica-Bold").text(String(value ?? "—"), 220, y, { width: 325 });
    doc.font("Helvetica");
    y += 26;
  }

  y += 10;
  doc.moveTo(50, y).lineTo(545, y).strokeColor(BORDER_COLOR).stroke();
  y += 20;

  doc.fillColor(ACCENT_COLOR).fontSize(13).font("Helvetica-Bold").text(`Reference: ${referenceCode}`, 50, y);
  y += 30;

  if (footerNote) {
    doc.fillColor(MUTED_COLOR).fontSize(10).font("Helvetica-Oblique").text(footerNote, 50, y, { width: 495 });
  }

  doc
    .fillColor(MUTED_COLOR)
    .fontSize(8)
    .font("Helvetica")
    .text(
      `Generated ${new Date().toLocaleString()} — this document is a system-generated receipt, not a legal invoice.`,
      50,
      770,
      { width: 495, align: "center" },
    );

  doc.end();
  return donePromise;
};

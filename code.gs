// Google Apps Script for Invoice Checker with priority and QTY remaining logic
// This version supports multi-sheet with accurate invoice readiness check

function doGet(e) {
  const invoiceNumber = e.parameter.invoice;
  if (!invoiceNumber) return ContentService.createTextOutput('Invoice number required');
  return ContentService.createTextOutput(checkInvoiceStatus(invoiceNumber)).setMimeType(ContentService.MimeType.TEXT);
}

function checkInvoiceStatus(invoiceNumber) {
  const ss = SpreadsheetApp.openById("1XoV7020NTZk1kzqn3F2ks3gOVFJ5arr5NVgUdewWPNQ");
  const sheetNames = ["AWAY", "BEIS", "BRIC`S", "DURAVO", "TUMI", "victorinox"];
  const today = new Date();
  const resultLines = ["\uD83D\uDCE6 " + invoiceNumber + "\n"];

  let grandTotal = 0;
  let found = false;

  for (const name of sheetNames) {
    const sheet = ss.getSheetByName(name);
    if (!sheet) continue;

    const data = sheet.getDataRange().getValues();
    const headers = data[2]; // baris ke-3 adalah header
    const exportedRow = data[0]; // baris ke-1 untuk EXPORT STATUS

    const colIndex = headers.reduce((acc, h, i) => { acc[h] = i; return acc; }, {});
    const startCol = 12; // kolom M = 12

    // Cari kolom untuk invoice
    let invoiceCol = -1;
    for (let c = startCol; c < exportedRow.length; c++) {
      const val = (data[3][c] || "").toString().toUpperCase();
      if (val === invoiceNumber.toUpperCase()) {
        invoiceCol = c;
        break;
      }
    }
    if (invoiceCol === -1) continue;

    const exportDateMap = {};
    const invoiceDateRaw = exportedRow[invoiceCol];
    const invoiceDate = parseDate(invoiceDateRaw);
    const isExported = /exported/i.test(invoiceDateRaw);

    // Hitung total invoice lebih dulu yang tanggalnya lebih awal
    for (let c = startCol; c < exportedRow.length; c++) {
      const inv = (data[3][c] || "").toString().toUpperCase();
      const dateStr = exportedRow[c];
      const date = parseDate(dateStr);

      if (inv && inv !== invoiceNumber.toUpperCase() && date && (!invoiceDate || date < invoiceDate)) {
        exportDateMap[inv] = c;
      }
    }

    for (let r = 4; r < data.length; r++) {
      const row = data[r];
      if (!row[invoiceCol]) continue;

      found = true;
      const po = row[colIndex["PO"]] || "-";
      const type = row[colIndex["TYPE"]] || "-";
      const color = row[colIndex["COLOR"]] || "-";
      const size = row[colIndex["SIZE"]] || "-";
      const qty = Number(row[invoiceCol]) || 0;
      const inQty = Number(row[colIndex["InQty"]]) || 0;
      const rework = Number(row[colIndex["REWORK"]]) || 0;

      // Hitung total used untuk invoice yang prioritasnya lebih dulu
      let used = 0;
      for (const [inv, col] of Object.entries(exportDateMap)) {
        used += Number(data[r][col]) || 0;
      }

      const remaining = inQty - used;
      const status = (!invoiceDate || qty > remaining) ? "\u274C Belum ready" : "\u2705 OK";

      grandTotal += qty;
      resultLines.push(`${po} | ${type} | ${color} | ${size} | ${qty} | ${remaining} | ${rework} | ${status}`);
    }
  }

  if (!found) return `Invoice ${invoiceNumber} not found.`;
  resultLines.push(`\n\uD83D\uDCCA Total ${invoiceNumber}: ${grandTotal}`);
  resultLines.push("\uD83D\uDCDE Jika ada yang tak beres, hubungi Emilio.");
  return resultLines.join("\n");
}

function parseDate(str) {
  if (!str || typeof str !== "string") return null;
  const parts = str.trim().match(/(\w+ \d{1,2}, \d{4})/);
  if (!parts) return null;
  const date = new Date(parts[1]);
  return isNaN(date.getTime()) ? null : date;
}

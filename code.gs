function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("IN");
  const range = sheet.getDataRange();
  const data = range.getValues();

  const brand = e.parameter.brand;
  const invoice = e.parameter.invoice;
  if (!brand || !invoice) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: "Missing parameters" })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  const headerRow = 5;
  const startRow = 6;
  const startCol = 16; // Kolom P = 16

  const brandRow = data[0];
  const dateRow = data[1];
  const invoiceRow = data[4];

  const invoiceColIndex = invoiceRow.findIndex(
    (val) => val.toString().trim().toUpperCase() === invoice.toUpperCase()
  );

  if (invoiceColIndex === -1) {
    return ContentService.createTextOutput(
      JSON.stringify({ found: false })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  const invoiceDate = dateRow[invoiceColIndex];
  const today = new Date(sheet.getRange("K1").getValue());
  const exportDate = new Date(invoiceDate);

  const results = [];
  let remainingMap = {};

  for (let i = startRow; i < data.length; i++) {
    const row = data[i];
    const rowBrand = row[3];
    if (!rowBrand || rowBrand.toString().toUpperCase() !== brand.toUpperCase()) continue;

    const key = [row[0], row[1], row[3], row[4], row[5], row[7], row[8]].join("|");

    if (!remainingMap[key]) {
      // Hitung total invoice sebelum tanggal sekarang
      let totalUsed = 0;
      for (let j = startCol; j < data[0].length; j++) {
        const invDate = dateRow[j];
        const invKey = invoiceRow[j];
        const cellQty = parseFloat(data[i][j]) || 0;

        if (
          invKey &&
          !isNaN(new Date(invDate)) &&
          new Date(invDate) <= today
        ) {
          totalUsed += cellQty;
        }
      }
      const qtyIn = parseFloat(row[9]) || 0; // kolom J
      const reworkQty = parseFloat(row[13]) || 0; // kolom N
      remainingMap[key] = qtyIn + reworkQty - totalUsed;
    }

    const qtyThisInvoice = parseFloat(data[i][invoiceColIndex]) || 0;
    const status =
      !invoiceDate
        ? "❌ No schedule"
        : remainingMap[key] >= qtyThisInvoice
        ? "✅ Ready"
        : "❌ Not enough";

    if (qtyThisInvoice > 0) {
      results.push({
        po: row[0],
        type: row[4],
        color: row[7],
        size: row[5],
        qty: qtyThisInvoice,
        remain: remainingMap[key],
        rework: row[13] || 0,
        status,
      });
    }
  }

  return ContentService.createTextOutput(
    JSON.stringify({ found: true, invoice, results })
  ).setMimeType(ContentService.MimeType.JSON);
}

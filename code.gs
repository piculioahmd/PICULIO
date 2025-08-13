function doGet(e) {
  const ss = SpreadsheetApp.openById("1XoV7020NTZk1kzqn3F2ks3gOVFJ5arr5NVgUdewWPNQ");
  const sheet = ss.getSheetByName("IN");
  const data = sheet.getDataRange().getValues();

  const brand = e.parameter.brand;
  const invoice = e.parameter.invoice;

  if (!brand || !invoice) {
    return jsonOutput({ error: "Missing parameters", found: false });
  }

  const headerRow = 5;
  const startRow = 5;   // Baris ke-6 di sheet (0-based index 5)
  const startCol = 14;  // Kolom O (0-based index 14)

  const dateRow = data[1];     // Baris ke-2 di sheet
  const invoiceRow = data[4];  // Baris ke-5 di sheet

  const invoiceColIndex = invoiceRow.findIndex(
    (val) => val && val.toString().trim().toUpperCase() === invoice.toUpperCase()
  );

  if (invoiceColIndex === -1) {
    return jsonOutput({ found: false });
  }

  const today = new Date(sheet.getRange("K1").getValue());
  const invoiceDate = dateRow[invoiceColIndex];
  const results = [];
  const remainingMap = {};

  for (let i = startRow; i < data.length; i++) {
    const row = data[i];
    const rowBrand = row[3]; // Kolom D
    if (!rowBrand || rowBrand.toString().toUpperCase() !== brand.toUpperCase()) continue;

    const key = [row[0], row[1], row[3], row[4], row[5], row[7], row[8]].join("|");

    if (!remainingMap[key]) {
      let totalUsed = 0;
      for (let j = startCol; j < data[0].length; j++) {
        const invDate = dateRow[j];
        const invKey = invoiceRow[j];
        const cellQty = parseFloat(data[i][j]) || 0;

        if (invKey && !isNaN(new Date(invDate)) && new Date(invDate) <= today) {
          totalUsed += cellQty;
        }
      }
      const qtyIn = parseFloat(row[9]) || 0;     // Kolom J
      const reworkQty = parseFloat(row[13]) || 0; // Kolom N
      remainingMap[key] = qtyIn + reworkQty - totalUsed;
    }

    const qtyThisInvoice = parseFloat(data[i][invoiceColIndex]) || 0;
    const forThis = remainingMap[key];
    const status =
      !invoiceDate
        ? "❌ No schedule"
        : forThis >= qtyThisInvoice
        ? "✅ Ready"
        : "❌ Not enough";

    if (qtyThisInvoice > 0) {
      results.push({
        po: row[0],          // Kolom A
        type: row[4],        // Kolom E
        color: row[7],       // Kolom H
        size: row[5],        // Kolom F
        qty: qtyThisInvoice,
        remain: row[10],     // Kolom K
        forThis,
        rework: row[13] || 0,
        status,
      });
    }
  }

  return jsonOutput({ found: true, invoice, exportDate: invoiceDate, results });
}

function jsonOutput(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "GET")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}

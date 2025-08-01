function doGet(e) {
  const brand = e.parameter.brand;
  const invoice = e.parameter.invoice;
  const spreadsheetId = "1XoV7020NTZk1kzqn3F2ks3gOVFJ5arr5NVgUdewWPNQ";
  const ss = SpreadsheetApp.openById("1XoV7020NTZk1kzqn3F2ks3gOVFJ5arr5NVgUdewWPNQ");
  const sheet = ss.getSheetByName("IN");

  const headers = sheet.getRange(5, 1, 1, sheet.getLastColumn()).getValues()[0];
  const data = sheet.getRange(6, 1, sheet.getLastRow() - 5, sheet.getLastColumn()).getValues();
  const dateRef = new Date(sheet.getRange("K1").getValue());

  const invoiceColRow = sheet.getRange(5, 16, 1, sheet.getLastColumn()).getValues()[0];
  const exportDateRow = sheet.getRange(2, 16, 1, sheet.getLastColumn()).getValues()[0];
  const exportedRow = sheet.getRange(3, 16, 1, sheet.getLastColumn()).getValues()[0];

  let result = [];
  let ready = true;

  const invoiceIndex = invoiceColRow.findIndex(v => v === invoice);
  if (invoiceIndex === -1) {
    return ContentService.createTextOutput(JSON.stringify({ status: "not found" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const qtyNeeded = row[6]; // PO QTY
    const inQty = row[10]; // QTY IN (K)
    const rework = row[11] || 0; // L
    const type = row[3];
    const size = row[4];
    const color = row[5];
    const po = row[0];

    // Hitung total qty dari semua invoice yang tanggal export <= K1 dan sudah exported
    let usedQty = 0;
    for (let c = 15; c < sheet.getLastColumn(); c++) {
      const invDate = exportDateRow[c - 15];
      const invExported = exportedRow[c - 15];
      const invQty = data[i][c];

      if (invDate && new Date(invDate) <= dateRef && invExported === "Y") {
        usedQty += parseInt(invQty || 0);
      }
    }

    const remaining = inQty - usedQty;
    const forThisInvoice = data[i][15 + invoiceIndex] || 0;
    const status = (remaining >= forThisInvoice ? "✅ OK" : "❌ Short");

    if (remaining < forThisInvoice) ready = false;

    if (forThisInvoice > 0) {
      result.push({
        po, type, size, color,
        qty: qtyNeeded,
        remaining,
        forThisInvoice,
        rework,
        status
      });
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok", ready, items: result }))
    .setMimeType(ContentService.MimeType.JSON);
}

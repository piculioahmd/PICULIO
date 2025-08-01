function doGet(e) {
  const ss = SpreadsheetApp.openById('1XoV7020NTZk1kzqn3F2ks3gOVFJ5arr5NVgUdewWPNQ');
  const sheetName = e.parameter.brand || "";
  const invoice = e.parameter.invoice || "";

  if (!sheetName || !invoice) {
    return ContentService.createTextOutput(JSON.stringify({ error: "Missing brand or invoice" })).setMimeType(ContentService.MimeType.JSON);
  }

  const sheet = ss.getSheetByName(sheetName);
  const sheetIN = ss.getSheetByName("IN");
  const data = sheet.getDataRange().getValues();
  const headerRow = 5; // data mulai dari baris 6
  const targetColStart = 15; // kolom P = 15

  const invoiceRow = data[4]; // baris ke-5 (index ke-4)
  const brandRow = data[0];   // baris ke-1
  const dateRow = data[1];    // baris ke-2
  const totalRow = data[2];   // baris ke-3

  const today = new Date(sheet.getRange("K1").getValue());

  // Cari kolom tempat invoice
  let colIndex = -1;
  for (let c = targetColStart; c < invoiceRow.length; c++) {
    if (String(invoiceRow[c]).toUpperCase().trim() === invoice) {
      colIndex = c;
      break;
    }
  }

  if (colIndex === -1) {
    return ContentService.createTextOutput(JSON.stringify({ error: "Invoice not found" })).setMimeType(ContentService.MimeType.JSON);
  }

  const invoiceDate = new Date(dateRow[colIndex]);
  const entries = [];

  for (let r = headerRow; r < data.length; r++) {
    const po = data[r][0];
    const wo = data[r][1];
    const model = data[r][3];
    const size = data[r][4];
    const color = data[r][5];
    const poQty = Number(data[r][6]);
    const inQty = Number(data[r][10]);
    const remaining = Number(data[r][11]);
    const rework = Number(data[r][12]);
    const thisINV = Number(data[r][colIndex]) || 0;

    if (!po || thisINV === 0) continue;

    // Hitung pemakaian oleh invoice lain sebelum atau sama dengan tanggal ini
    let usedQty = 0;
    for (let c = targetColStart; c < data[4].length; c++) {
      const otherDate = new Date(dateRow[c]);
      const otherInv = String(invoiceRow[c]).toUpperCase().trim();

      if (c !== colIndex && otherDate <= invoiceDate) {
        usedQty += Number(data[r][c]) || 0;
      }
    }

    const availableQty = inQty - usedQty;
    const status = availableQty >= thisINV ? "✅ Ready to Export" : "❌ Not Ready";

    entries.push({
      po,
      wo,
      model,
      size,
      color,
      qty: thisINV,
      remaining,
      forThisINV: availableQty,
      rework,
      status
    });
  }

  return ContentService.createTextOutput(JSON.stringify({
    invoice,
    brand: sheetName,
    entries
  })).setMimeType(ContentService.MimeType.JSON);
}

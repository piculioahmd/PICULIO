function doGet(e) {
  const ss = SpreadsheetApp.openById("1XoV7020NTZk1kzqn3F2ks3gOVFJ5arr5NVgUdewWPNQ");
  const sheet = ss.getSheetByName("INVOICE CHECKER");
  const brand = e.parameter.brand;
  const invoice = e.parameter.invoice;

  if (!brand || !invoice) {
    return ContentService.createTextOutput(JSON.stringify({ error: "Missing parameters" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const lastColumn = sheet.getLastColumn();
  const lastRow = sheet.getLastRow();

  const brandRow = sheet.getRange(1, 16, 1, lastColumn - 15).getValues()[0]; // Baris 1 dari kolom P (16)
  const dateRow = sheet.getRange(2, 16, 1, lastColumn - 15).getValues()[0]; // Baris 2
  const qtyRow = sheet.getRange(3, 16, 1, lastColumn - 15).getValues()[0]; // Baris 3

  // Cari kolom yang sesuai brand
  let brandCol = -1;
  for (let i = 0; i < brandRow.length; i++) {
    if (brandRow[i] && brandRow[i].toString().toUpperCase() === brand.toUpperCase()) {
      brandCol = i + 16; // Karena mulai dari kolom P (16)
      break;
    }
  }

  if (brandCol === -1) {
    return ContentService.createTextOutput(JSON.stringify({ found: false, message: `Brand ${brand} not found` }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const invoices = sheet.getRange(5, brandCol, lastRow - 4).getValues(); // Baris 5 ke bawah di kolom brandCol
  for (let i = 0; i < invoices.length; i++) {
    if (invoices[i][0] && invoices[i][0].toString().toUpperCase() === invoice.toUpperCase()) {
      const tanggal = dateRow[brandCol - 16];
      const qty = qtyRow[brandCol - 16];
      return ContentService.createTextOutput(JSON.stringify({
        found: true,
        brand,
        invoice,
        date: tanggal,
        qty: qty
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService.createTextOutput(JSON.stringify({
    found: false,
    message: `❌ We didn't find ${invoice}. Check your data.`
  })).setMimeType(ContentService.MimeType.JSON);
}

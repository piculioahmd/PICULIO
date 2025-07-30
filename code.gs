function doGet(e) {
  const ss = SpreadsheetApp.openById("1XoV7020NTZk1kzqn3F2ks3gOVFJ5arr5NVgUdewWPNQ");

  const brand = e.parameter.brand;
  const invoice = e.parameter.invoice;
  const sheet = ss.getSheetByName(brand);
  if (!sheet) return ContentService.createTextOutput(JSON.stringify({ found: false })).setMimeType(ContentService.MimeType.JSON);

  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const poIndex = headers.indexOf("PO");
  const modelIndex = headers.indexOf("TYPE");
  const colorIndex = headers.indexOf("COLOR");
  const sizeIndex = headers.indexOf("SIZE");
  const qtyIndex = headers.indexOf("QTY");
  const inIndex = headers.indexOf("In");
  const reworkIndex = headers.indexOf("Rework");
  const invoiceIndex = headers.indexOf("INVOICE");

  const rows = data.slice(1);
  const styles = sheet.getRange(2, qtyIndex + 1, rows.length, 1).getTextStyles(); // gaya teks QTY

  const matchingRows = rows
    .map((row, i) => ({ row, style: styles[i][0], index: i }))
    .filter(r => (r.row[invoiceIndex] + '').toUpperCase() === invoice.toUpperCase());

  if (matchingRows.length === 0) {
    return ContentService.createTextOutput(JSON.stringify({ found: false })).setMimeType(ContentService.MimeType.JSON);
  }

  const response = {
    found: true,
    invoice: invoice,
    items: [],
    totalQty: 0
  };

  matchingRows.forEach(({ row, style }) => {
    const status = style.isBold() ? "✅ Ready to go" : "❌ Not ready";

    response.items.push({
      po: row[poIndex],
      itemType: row[modelIndex],
      color: row[colorIndex],
      size: row[sizeIndex],
      qty: Number(row[qtyIndex]) || 0,
      remaining: Number(row[inIndex]) || 0,
      rework: Number(row[reworkIndex]) || 0,
      status: status
    });
    response.totalQty += Number(row[qtyIndex]) || 0;
  });

  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

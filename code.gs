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
  const readyForSIndex = headers.indexOf("Ready For S");
  const statusIndex = headers.indexOf("STATUS");

  const rows = data.slice(1);
  const matchingRows = rows.filter(r => (r[invoiceIndex] + '').toUpperCase() === invoice.toUpperCase());

  if (matchingRows.length === 0) {
    return ContentService.createTextOutput(JSON.stringify({ found: false })).setMimeType(ContentService.MimeType.JSON);
  }

  // Group by PO+TYPE+COLOR+SIZE
  const grouped = {};

  rows.forEach(row => {
    const key = `${row[poIndex]}|${row[modelIndex]}|${row[colorIndex]}|${row[sizeIndex]}`;
    const inVal = Number(row[inIndex]) || 0;
    if (!grouped[key]) grouped[key] = { totalIN: 0, rows: [] };
    grouped[key].totalIN += inVal;
    grouped[key].rows.push(row);
  });

  // Apply accurate allocation logic
Object.values(grouped).forEach(group => {
  let remainingIN = group.totalIN;

  // Urutkan berdasarkan tanggal, kalau tidak ada DATE, urutkan default
  const sortedRows = dateIndex >= 0
    ? group.rows.sort((a, b) => {
        const d1 = a[dateIndex], d2 = b[dateIndex];
        const v1 = d1 instanceof Date ? d1.getTime() : Infinity;
        const v2 = d2 instanceof Date ? d2.getTime() : Infinity;
        return v1 - v2;
      })
    : group.rows;

  sortedRows.forEach(row => {
    const readyForS = Number(row[readyForSIndex]) || 0;
    const requestQty = Math.max(0, -readyForS);

    if (remainingIN <= 0) {
      row[statusIndex] = "❌ NOT READY";
    } else if (remainingIN >= requestQty) {
      row[statusIndex] = "✅ OK";
      remainingIN -= requestQty;
    } else {
      row[statusIndex] = `⚠️ PARTIAL (${remainingIN}/${requestQty})`;
      remainingIN = 0;
    }
  });
});

  // Siapkan response JSON
  const response = {
    found: true,
    invoice: invoice,
    items: [],
    totalQty: 0
  };

  matchingRows.forEach(row => {
    response.items.push({
      po: row[poIndex],
      itemType: row[modelIndex],
      color: row[colorIndex],
      size: row[sizeIndex],
      qty: Number(row[qtyIndex]) || 0,
      remaining: Number(row[inIndex]) || 0,
      rework: Number(row[reworkIndex]) || 0,
      status: row[statusIndex]
    });
    response.totalQty += Number(row[qtyIndex]) || 0;
  });

  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

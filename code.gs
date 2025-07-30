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
  const dateIndex = headers.indexOf("DATE");

  const rows = data.slice(1);

  // Kelompokkan berdasarkan kombinasi unik item
  const grouped = {};
  rows.forEach(row => {
    const key = `${row[poIndex]}|${row[modelIndex]}|${row[colorIndex]}|${row[sizeIndex]}`;
    const inVal = Number(row[inIndex]) || 0;
    if (!grouped[key]) grouped[key] = { totalIN: 0, rows: [] };
    grouped[key].totalIN += inVal;
    grouped[key].rows.push(row);
  });

  // Alokasikan berdasarkan urutan tanggal (FIFO)
  Object.values(grouped).forEach(group => {
    let remainingIN = group.totalIN;

    const sortedRows = group.rows.sort((a, b) => {
      const d1 = a[dateIndex], d2 = b[dateIndex];
      const v1 = d1 instanceof Date ? d1.getTime() : Infinity;
      const v2 = d2 instanceof Date ? d2.getTime() : Infinity;
      return v1 - v2;
    });

    sortedRows.forEach(row => {
      const readyForS = Number(row[readyForSIndex]) || 0;
      const requestQty = Math.max(0, -readyForS);

      if (remainingIN <= 0) {
        row.push("❌ Not ready");
      } else if (remainingIN >= requestQty) {
        row.push("✅ Ready to go");
        remainingIN -= requestQty;
      } else {
        row.push(`⚠️ Partial (${remainingIN}/${requestQty})`);
        remainingIN = 0;
      }
    });
  });

  // Filter baris sesuai invoice yang diminta
  const result = {
    found: true,
    invoice: invoice,
    items: [],
    totalQty: 0
  };

  rows.forEach(row => {
    if ((row[invoiceIndex] + '').toUpperCase() === invoice.toUpperCase()) {
      const status = row[row.length - 1]; // status yang baru ditambahkan di .push()

      result.items.push({
        po: row[poIndex],
        itemType: row[modelIndex],
        color: row[colorIndex],
        size: row[sizeIndex],
        qty: Number(row[qtyIndex]) || 0,
        remaining: Number(row[inIndex]) || 0,
        rework: Number(row[reworkIndex]) || 0,
        status: status
      });

      result.totalQty += Number(row[qtyIndex]) || 0;
    }
  });

  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

const SPREADSHEET_ID = '1XoV7020NTZk1kzqn3F2ks3gOVFJ5arr5NVgUdewWPNQ'; // Ganti jika spreadsheet ID kamu berbeda

function doGet(e) {
  const invoice = e.parameter.invoice;
  const brand = e.parameter.brand;

  if (!invoice || !brand) {
    return ContentService
      .createTextOutput(JSON.stringify({ found: false, error: 'Missing parameter' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const result = getInvoiceData(invoice, brand);
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function getInvoiceData(invoice, brand) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(brand);
  if (!sheet) return { found: false };

  const data = sheet.getDataRange().getValues();
  const headerRow1 = data[0]; // baris 1: cek Exported
  const headerRow3 = data[2]; // baris 3: invoice list
  const invoiceIndex = headerRow3.indexOf(invoice);
  if (invoiceIndex === -1) return { found: false };

  // Hitung used qty dari invoice lain yang sudah exported
  let usedQtyMap = {};
  for (let col = 12; col < headerRow3.length; col++) {
    const isExported = (headerRow1[col] || '').toString().toLowerCase().includes("exported");
    const currentInvoice = headerRow3[col];
    if (!isExported || currentInvoice === invoice) continue;

    for (let row = 3; row < data.length; row++) {
      const qtyUsed = Number(data[row][col]) || 0;
      usedQtyMap[row] = (usedQtyMap[row] || 0) + qtyUsed;
    }
  }

  let items = [];
  let totalQty = 0;

  for (let i = 3; i < data.length; i++) {
    const qty = Number(data[i][invoiceIndex]);
    if (!qty || isNaN(qty)) continue;

    const po = data[i][0] || '-';
    const type = data[i][3] || '-';
    const size = data[i][4] || '-';
    const color = (data[i][5] || '-').toString().split('#')[0];
    const rework = Number(data[i][9] || 0);
    const inQty = Number(data[i][10] || 0);
    const usedQty = usedQtyMap[i] || 0;
    const remaining = inQty - usedQty;
    const status = (remaining >= qty) ? "✅ OK" : `❌ Short (${qty - remaining})`;

    items.push({
      po,
      itemType: type,
      color,
      size,
      qty,
      rework,
      remaining,
      status
    });

    totalQty += qty;
  }

  return {
    found: true,
    invoice,
    items,
    totalQty
  };
}

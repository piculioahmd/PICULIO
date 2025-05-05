const SPREADSHEET_ID = '1XoV7020NTZk1kzqn3F2ks3gOVFJ5arr5NVgUdewWPNQ';

function doGet(e) {
  const invoice = e.parameter.invoice;
  const brand = e.parameter.brand;
  if (!invoice) {
    return ContentService.createTextOutput(JSON.stringify({ error: 'No invoice provided' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const result = getInvoiceData(invoice, brand);
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function getInvoiceData(invoice, brand) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const allSheets = ss.getSheets();
  let found = false;
  let items = [];
  let totalQty = 0;

  for (const sheet of allSheets) {
    if (brand && sheet.getName().toLowerCase() !== brand.toLowerCase()) continue;

    const data = sheet.getDataRange().getValues();
    const invoiceIndex = data[2].indexOf(invoice);
    if (invoiceIndex === -1) continue;

    found = true;

    for (let i = 3; i < data.length; i++) {
      const qty = Number(data[i][invoiceIndex]);
      if (!qty || isNaN(qty)) continue;

      const po = data[i][0] || '-';
      const type = data[i][3] || '-';
      const size = data[i][4] || '-';
      const color = (data[i][5] || '-').toString().split('#')[0];
      const rework = Number(data[i][9] || 0);
      const inQty = Number(data[i][10] || 0);

      let item = {
        po,
        itemType: type,
        color,
        size,
        qty,
        inQty,
        rework
      };

      items.push(item);
      totalQty += qty;
    }

    break; // Stop after first found
  }

  return found
    ? { found: true, invoice, items, totalQty }
    : { found: false };
}

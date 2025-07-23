function getInvoiceData(invoice, brand) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const allSheets = ss.getSheets();
  let found = false;
  let items = [];
  let totalQty = 0;

  for (const sheet of allSheets) {
    if (brand && sheet.getName().toLowerCase() !== brand.toLowerCase()) continue;

    const data = sheet.getDataRange().getValues();
    const headerRow1 = data[0]; // Baris 1
    const headerRow3 = data[2]; // Baris 3
    const invoiceIndex = headerRow3.indexOf(invoice);
    if (invoiceIndex === -1) continue;

    // Step 1: Hitung qty dari invoice yang sudah exported (selain invoice yang diminta)
    let usedQtyMap = {};
    for (let col = 12; col < headerRow3.length; col++) { // kol M (index 12)
      const isExported = (headerRow1[col] || '').toString().toLowerCase().includes("exported");
      const currentInvoice = headerRow3[col];
      if (!isExported || currentInvoice === invoice) continue;

      for (let row = 3; row < data.length; row++) {
        const qty = Number(data[row][col]) || 0;
        usedQtyMap[row] = (usedQtyMap[row] || 0) + qty;
      }
    }

    // Step 2: Ambil item dari invoice yg dicari
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

      items.push({
        po,
        itemType: type,
        color,
        size,
        qty,
        inQty,
        rework,
        remaining
      });

      totalQty += qty;
    }

    found = true;
    break;
  }

  return found
    ? { found: true, invoice, items, totalQty }
    : { found: false };
}

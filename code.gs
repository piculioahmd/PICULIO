function doGet(e) {
  const brand = e.parameter.brand;
  const invoice = e.parameter.invoice;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('IN');
  const data = sheet.getDataRange().getValues();

  const today = new Date(sheet.getRange('K1').getValue());
  const headerRow = 5; // baris header utama
  const startRow = 6;
  const startCol = 16; // kolom P

  // Buat index invoice
  const invoiceIndex = [];
  for (let col = startCol; col < data[4].length; col++) {
    const inv = data[4][col];
    const invBrand = data[0][col];
    const invDateRaw = data[1][col];
    let invDate = new Date("9999-12-31");
    if (invDateRaw instanceof Date && !isNaN(invDateRaw)) invDate = invDateRaw;
    if (invBrand === brand && inv) {
      invoiceIndex.push({ inv, col, date: invDate });
    }
  }

  // Sort invoice berdasarkan tanggal
  invoiceIndex.sort((a, b) => a.date - b.date);

  // Buat cache qty tersisa
  const remainingQtyMap = {};

  // Siapkan hasil akhir
  const result = {
    invoice: invoice,
    found: false,
    totalQty: 0,
    items: []
  };

  for (let row = startRow; row < data.length; row++) {
    const po = data[row][0];
    const wo = data[row][1];
    const brandCell = data[row][3];
    const model = data[row][4];
    const size = data[row][5];
    const color = data[row][7];
    const poQty = data[row][8];
    const inQty = data[row][9];
    const rework = data[row][13] || 0;
    const key = `${po}|${wo}|${brandCell}|${model}|${size}|${color}`;

    if (!remainingQtyMap[key]) remainingQtyMap[key] = inQty;

    for (const entry of invoiceIndex) {
      const thisQty = data[row][entry.col];
      if (!thisQty || typeof thisQty !== 'number') continue;

      const usedQty = Math.min(thisQty, remainingQtyMap[key]);
      const isCurrent = entry.inv === invoice;

      if (usedQty > 0) {
        remainingQtyMap[key] -= usedQty;
      }

      if (isCurrent && brandCell === brand) {
        result.found = true;
        result.totalQty += thisQty;

        let status = '✅ Ready';
        if (entry.date > today) status = '⏳ Scheduled';
        if (thisQty > inQty || remainingQtyMap[key] < 0) status = '❌ Not enough';

        result.items.push({
          po,
          itemType: model,
          color,
          size,
          qty: thisQty,
          remaining: remainingQtyMap[key],
          rework,
          status
        });
      }
    }
  }

  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

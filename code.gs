const SPREADSHEET_ID = '1XoV7020NTZk1kzqn3F2ks3gOVFJ5arr5NVgUdewWPNQ';

function doGet(e) {
  const invoiceParam = (e.parameter.invoice || '').toUpperCase();
  const brandParam = e.parameter.brand || '';
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('IN');
  const data = sheet.getDataRange().getValues();
  const today = sheet.getRange("K1").getValue(); // Tanggal cut-off

  const headers = data[4]; // Header ada di baris ke-5
  const rows = data.slice(5); // Data mulai dari baris ke-6

  // Mapping kolom berdasarkan header
  const columnMap = {
    po: 0,
    wo: 1,
    partNo: 2,
    brand: 3,
    model: 4,
    size: 5,
    color: 7,
    poQty: 8,
    in: 9,
    remaining: 10,
    forShipment: 11,
    readyForShipment: 12,
    reworkQty: 13,
    reworkResults: 14,
  };

  // Ambil data invoice dari kolom P ke kanan
  const invoiceHeaders = headers.slice(15);
  const brandsRow = data[0].slice(15);
  const datesRow = data[1].slice(15);

  const invoiceMap = {};

  invoiceHeaders.forEach((inv, i) => {
    const invoiceName = (inv || '').toString().toUpperCase().trim();
    if (!invoiceMap[invoiceName]) invoiceMap[invoiceName] = [];
    invoiceMap[invoiceName].push({
      colIndex: i + 15,
      brand: brandsRow[i],
      date: datesRow[i]
    });
  });

  const result = {
    found: false,
    invoice: invoiceParam,
    totalQty: 0,
    items: []
  };

  rows.forEach((row, rowIndex) => {
    const key = [row[columnMap.po], row[columnMap.model], row[columnMap.size], row[columnMap.color]].join('|');
    const qtyIn = Number(row[columnMap.in]) || 0;
    const rework = Number(row[columnMap.reworkQty]) || 0;
    let available = qtyIn + rework;

    // Kurangi QTY karena invoice yang sudah diekspor (tanggal <= K1)
    Object.keys(invoiceMap).forEach(inv => {
      if (inv === invoiceParam) return; // skip invoice target

      invoiceMap[inv].forEach(info => {
        const exportDate = info.date;
        const isExported = exportDate && exportDate <= today;

        if (isExported) {
          const usedQty = Number(data[rowIndex + 5][info.colIndex]) || 0;
          available -= usedQty;
        }
      });
    });

    // Periksa apakah baris ini bagian dari invoice yang diminta
    const targetInfos = invoiceMap[invoiceParam];
    if (!targetInfos) return;

    targetInfos.forEach(info => {
      const usedQty = Number(data[rowIndex + 5][info.colIndex]) || 0;
      if (usedQty > 0 && row[columnMap.brand].toUpperCase() === brandParam.toUpperCase()) {
        const status = (available >= usedQty) ? '✅ Ready to go' :
                      (available > 0) ? `⚠️ Partial (${available}/${usedQty})` :
                                        '❌ Not ready';

        result.found = true;
        result.totalQty += usedQty;

        result.items.push({
          po: row[columnMap.po],
          wo: row[columnMap.wo],
          partNo: row[columnMap.partNo],
          model: row[columnMap.model],
          size: row[columnMap.size],
          color: row[columnMap.color],
          qty: usedQty,
          in: qtyIn,
          rework: rework,
          status: status
        });
      }
    });
  });

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

const SPREADSHEET_ID = '1XoV7020NTZk1kzqn3F2ks3gOVFJ5arr5NVgUdewWPNQ';

function doGet(e) {
  const invoiceParam = (e.parameter.invoice || '').toUpperCase();
  const brandParam = (e.parameter.brand || '').toUpperCase();
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('IN');
  const data = sheet.getDataRange().getValues();
  const today = sheet.getRange("K1").getValue(); // 📅 當前參考日期 FIFO cutoff

  const headers = data[4]; // 第5列標題
  const rows = data.slice(5); // 第6列起為資料

  const columnMap = {
    po: 0,                      // 訂單號碼 PO. NO.
    wo: 1,                      // 工單號碼 NO. WO.
    partNo: 2,                  // 產品料號 PART. NO.
    brand: 3,                   // 客戶 Customer
    model: 4,                   // 產品型號 ITEM Type
    size: 5,                    // 尺寸 Size
    color: 7,                   // 顏色 Color
    poQty: 8,                   // 訂單量 PO QTY
    in: 9,                      // In
    productionRemaining: 10,    // Production Remaining
    forShipment: 11,           // For Shipment
    readyForShipment: 12,      // Ready For Shipment
    reworkQty: 13,             // Rework QTY
    reworkResults: 14          // Rework Results
  };

  const invoiceHeaders = headers.slice(15);
  const brandsRow = data[0].slice(15);
  const datesRow = data[1].slice(15);
  const qtyRow = data[2].slice(15);

  const invoiceMap = {};

  invoiceHeaders.forEach((inv, i) => {
    const invoiceName = (inv || '').toString().toUpperCase().trim();
    if (!invoiceMap[invoiceName]) invoiceMap[invoiceName] = [];
    invoiceMap[invoiceName].push({
      colIndex: i + 15,
      brand: (brandsRow[i] || '').toUpperCase(),
      date: datesRow[i],
      qty: Number(qtyRow[i]) || 0
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

    Object.keys(invoiceMap).forEach(inv => {
      if (inv === invoiceParam) return;

      invoiceMap[inv].forEach(info => {
        if (info.date && info.date <= today) {
          const usedQty = Number(data[rowIndex + 5][info.colIndex]) || 0;
          available -= usedQty;
        }
      });
    });

    const targetInfos = invoiceMap[invoiceParam];
    if (!targetInfos) return;

    targetInfos.forEach(info => {
      const usedQty = Number(data[rowIndex + 5][info.colIndex]) || 0;
      if (usedQty > 0 && info.brand === brandParam) {
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

  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

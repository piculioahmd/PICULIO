function getInvoiceData(invoice, brand) {
  const ss = SpreadsheetApp.openById(1XoV7020NTZk1kzqn3F2ks3gOVFJ5arr5NVgUdewWPNQ);
  const allSheets = ss.getSheets();
  let found = false;
  let items = [];
  let totalQty = 0;

  for (const sheet of allSheets) {
    if (brand && sheet.getName().toLowerCase() !== brand.toLowerCase()) continue;

    const data = sheet.getDataRange().getValues();
    const headerRow1 = data[0]; // Exported status
    const headerRow2 = data[1]; // Optional (skip)
    const headerRow3 = data[2]; // Baris invoice
    const invoiceIndex = headerRow3.indexOf(invoice);
    if (invoiceIndex === -1) continue;

    // ✅ Langkah 1: Hitung qty dari invoice lain yang sudah exported (selain invoice yang dicari)
    let usedQtyMap = {};
    for (let col = 12; col < headerRow3.length; col++) {
      const isExported = (headerRow1[col] || '').toString().toLowerCase().includes("exported");
      const currentInvoice = headerRow3[col];
      if (!isExported || currentInvoice === invoice) continue;

      for (let row = 3; row < data.length; row++) {
        const qty = Number(data[row][col]) || 0;
        usedQtyMap[row] = (usedQtyMap[row] || 0) + qty;
      }
    }

    // ✅ Langkah 2: Kelompokkan berdasarkan PO+TYPE+COLOR+SIZE
    const grouped = {};
    for (let row = 3; row < data.length; row++) {
      const qty = Number(data[row][invoiceIndex]) || 0;
      const po = data[row][0] || '-';
      const type = data[row][3] || '-';
      const size = data[row][4] || '-';
      const color = (data[row][5] || '-').toString().split('#')[0];
      const key = `${po}|${type}|${color}|${size}`;

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push({
        rowIndex: row,
        date: data[row][11], // kolom DATE = kolom L = index 11
        qty,
        po,
        type,
        size,
        color,
        rework: Number(data[row][9]) || 0,
        inQty: Number(data[row][10]) || 0,
        usedQty: usedQtyMap[row] || 0
      });
    }

    // ✅ Langkah 3: FIFO berdasarkan urutan tanggal
    Object.values(grouped).forEach(groupRows => {
      const sorted = groupRows.sort((a, b) => {
        const d1 = a.date instanceof Date ? a.date.getTime() : Infinity;
        const d2 = b.date instanceof Date ? b.date.getTime() : Infinity;
        return d1 - d2;
      });

      let remainingIN = sorted.reduce((sum, r) => sum + (r.inQty - r.usedQty), 0);

      for (const r of sorted) {
        if (!r.qty || isNaN(r.qty)) continue;

        const { po, type, size, color, qty, rework, inQty, usedQty } = r;
        const available = inQty - usedQty;
        const status = (remainingIN >= qty)
          ? "✅ Ready to go"
          : `❌ Not ready`;

        items.push({
          po,
          itemType: type,
          color,
          size,
          qty,
          rework,
          remaining: available,
          status
        });

        totalQty += qty;
        remainingIN -= qty;
      }
    });

    found = true;
    break; // Hanya baca sheet pertama yang match
  }

  return found
    ? { found: true, invoice, items, totalQty }
    : { found: false };
}

const SPREADSHEET_ID = '1XoV7020NTZk1kzqn3F2ks3gOVFJ5arr5NVgUdewWPNQ'; // ganti kalau perlu

function doGet(e) {
  const invoice = (e.parameter.invoice || '').toUpperCase().trim();
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
  const headerDates = data[0];    // baris tanggal
  const headerInvoices = data[2]; // baris invoice

  let invoiceList = [];

  for (let col = 12; col < headerInvoices.length; col++) {
    const inv = headerInvoices[col];
    const rawDate = headerDates[col];
    let date = null;

    if (rawDate instanceof Date) {
      date = rawDate;
    } else if (typeof rawDate === "string") {
      const tryDate = new Date(rawDate);
      if (!isNaN(tryDate)) date = tryDate;
    }

    if (inv) {
      invoiceList.push({
        invoice: inv.toUpperCase(),
        col,
        date,
        dateValue: date ? date.getTime() : Infinity
      });
    }
  }

  invoiceList.sort((a, b) => a.dateValue - b.dateValue); // urutkan berdasarkan tanggal, tanpa tanggal = Infinity

  // Alokasi qty
  let readyMap = {};
  let itemMap = {};

  for (let row = 3; row < data.length; row++) {
    const totalQty = Number(data[row][6]) || 0; // kolom G
    const readyQty = Number(data[row][10]) || 0; // kolom K
    readyMap[row] = {
      ready: readyQty,
      allocated: 0
    };
    itemMap[row] = {
      po: data[row][0] || '-',
      type: data[row][3] || '-',
      size: data[row][4] || '-',
      color: (data[row][5] || '-').toString().split('#')[0],
      rework: Number(data[row][9]) || 0,
      totalQty
    };
  }

  // Alokasikan ready qty ke semua invoice secara urut
  let invoiceAllocMap = {};

  for (const inv of invoiceList) {
    invoiceAllocMap[inv.invoice] = [];

    for (let row = 3; row < data.length; row++) {
      const needed = Number(data[row][inv.col]) || 0;
      if (!needed) continue;

      const available = readyMap[row].ready - readyMap[row].allocated;
      const allocatedNow = Math.min(available, needed);

      invoiceAllocMap[inv.invoice].push({
        row,
        allocated: allocatedNow,
        needed
      });

      readyMap[row].allocated += allocatedNow;
    }
  }

  if (!invoiceAllocMap[invoice]) return { found: false };

  // Format hasil untuk invoice yang diminta
  const items = invoiceAllocMap[invoice].map(entry => {
    const { row, allocated, needed } = entry;
    const info = itemMap[row];
    const status = (allocated >= needed)
      ? "✅ OK"
      : `❌ Not Ready (${needed - allocated})`;

    return {
      po: info.po,
      itemType: info.type,
      color: info.color,
      size: info.size,
      qty: needed,
      remaining: allocated,
      rework: info.rework,
      status
    };
  });

  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);

  return {
    found: true,
    invoice,
    items,
    totalQty
  };
}

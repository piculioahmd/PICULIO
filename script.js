.then((data) => {
  if (!data || !data.found) {
    resultDiv.innerHTML = `❌ Invoice ${invoice} not found.`;
    return;
  }

  let result = `📦 ${data.invoice}\n`;
  let totalQty = 0;

  data.items.forEach((item) => {
    const { po, itemType, color, size, qty, inQty, rework } = item;
    let diff = qty - inQty;
    let status = '';

    if (inQty >= qty) {
      if (rework > 0) {
        status = `✅ Already OK with rework ${rework} pcs`;
      } else {
        status = '✅ Already OK';
      }
    } else if (rework > 0 && rework >= diff) {
      status = `❌ Still short (${diff}) with rework ${rework} pcs`;
    } else if (rework > 0 && rework < diff) {
      status = `❌ Still missing (${diff}) with rework ${rework} pcs`;
    } else {
      status = `❌ Still lacking (${diff})`;
    }

    result += `${po} ${itemType} ${color} ${size} for ${qty} ${status}\n`;
    totalQty += qty;
  });

  result += `\n📊 Total ${data.invoice}: ${totalQty}\n📞 If there is any mistake, please contact Emilio!`;
  resultDiv.innerHTML = `<pre>${result}</pre>`;
})

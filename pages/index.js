// pages/index.js
import { useEffect, useState } from 'react';

export default function Home() {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function ambilData() {
      const res = await fetch(`/api/fetch-data?so=YOE-25030003&wo=WO123456`);
      const json = await res.json();
      setData(json.data);
    }
    ambilData();
  }, []);

  return (
    <div>
      <h1>Data Produksi</h1>
      <table border="1">
        <thead>
          <tr>
            <th>SO</th>
            <th>WO</th>
            <th>Brand</th>
            <th>Model</th>
            <th>Size</th>
            <th>Color</th>
            <th>PO QTY</th>
            <th>IN</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td>{row[0]}</td>
              <td>{row[1]}</td>
              <td>{row[2]}</td>
              <td>{row[3]}</td>
              <td>{row[4]}</td>
              <td>{row[5]}</td>
              <td>{row[6]}</td>
              <td>{row[7]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

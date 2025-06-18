import React, { useState } from 'react';

function App() {
  const [namaFurniture, setNamaFurniture] = useState('');
  const [panjang, setPanjang] = useState('');
  const [tinggi, setTinggi] = useState('');
  const [tebal, setTebal] = useState('');
  const [finishing, setFinishing] = useState('');
  const [harga, setHarga] = useState(null);

  const handleHitung = () => {
    const luas = (panjang * tinggi) / 10000;
    const faktorTebal = tebal > 60 ? 1.5 : 1;
    let hargaPerM2 = 0;
    if (finishing === 'Decosheet') hargaPerM2 = 120000;
    else if (finishing === 'HPL') hargaPerM2 = 250000;
    else if (finishing === 'Duco') hargaPerM2 = 300000;

    const total = luas * hargaPerM2 * faktorTebal;
    setHarga(total);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Mapan Interior Furniture Price Generator</h1>
      <input placeholder="Nama Furniture" value={namaFurniture} onChange={e => setNamaFurniture(e.target.value)} />
      <input placeholder="Panjang (cm)" type="number" value={panjang} onChange={e => setPanjang(e.target.value)} />
      <input placeholder="Tinggi (cm)" type="number" value={tinggi} onChange={e => setTinggi(e.target.value)} />
      <input placeholder="Tebal (mm)" type="number" value={tebal} onChange={e => setTebal(e.target.value)} />
      <select value={finishing} onChange={e => setFinishing(e.target.value)}>
        <option value="">Pilih Finishing</option>
        <option value="Decosheet">Decosheet</option>
        <option value="HPL">HPL</option>
        <option value="Duco">Duco</option>
      </select>
      <button onClick={handleHitung}>Hitung Harga</button>
      {harga !== null && <h2>Estimasi Harga: Rp {harga.toLocaleString()}</h2>}
    </div>
  );
}

export default App;

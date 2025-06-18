import React from 'react';

const App = () => {
  const [form, setForm] = useState({
    nama: '',
    alamat: '',
    telepon: '',
    furniture: '',
    material: 'Plywood',
    jenis: 'Fix',
    finishing: 'Decosheet',
    tabletop: 'HPL Standar',
    panjang: 0,
    tinggi: 0,
    tebal: 0
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const FINISHING_PRICES = { 'Decosheet': 2650000, 'HPL': 3250000, 'Duco': 4750000 };
  const MATERIAL_FACTORS = { 'Plywood': 1.0, 'PVC': 1.75 };
  const TABLE_TOP_PRICES = { 'HPL Standar': 0, 'HPL Khusus': 550000, 'Solid Surface': 1950000, 'Granit': 750000, 'Marmer': 2850000 };
  const FURNITURE_FACTORS = { 'Fix': 1.0, 'Loose': 1.5 };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const calculatePrice = () => {
    let panjang = parseFloat(form.panjang) || 0;
    let tinggi = parseFloat(form.tinggi) || 0;
    let tebal = parseFloat(form.tebal) || 0;

    if (panjang === 0 || tinggi === 0 || tebal === 0) {
      return {
        luas_m2: '0',
        faktor_tebal: '0',
        biaya_dasar: '0',
        biaya_tabletop: '0',
        total_harga: '0'
      };
    }

    panjang = Math.max(100, panjang);
    tinggi = Math.max(100, tinggi);

    let luas_m2 = Math.max((panjang * tinggi) / 10000, 1);
    let biaya_dasar = luas_m2 * FINISHING_PRICES[form.finishing];

    let tebal_factor = 1.0;
    if ((form.jenis === 'Fix' && tebal > 60) || (form.jenis === 'Loose' && tebal > 80)) tebal_factor = 1.5;

    biaya_dasar *= tebal_factor * MATERIAL_FACTORS[form.material] * FURNITURE_FACTORS[form.jenis];

    let panjang_m = Math.max(panjang / 100, 1);
    let biaya_tabletop = panjang_m * TABLE_TOP_PRICES[form.tabletop];

    let total_harga = biaya_dasar + biaya_tabletop;

    return {
      luas_m2: luas_m2.toFixed(2),
      faktor_tebal: tebal_factor,
      biaya_dasar: biaya_dasar.toLocaleString('id-ID'),
      biaya_tabletop: biaya_tabletop.toLocaleString('id-ID'),
      total_harga: total_harga.toLocaleString('id-ID')
    };
  };

  const result = calculatePrice();

 const exportPDF = () => {
  const doc = new jsPDF();

  doc.addImage('https://i.imghippo.com/files/jeLf8293ko.png', 'PNG', 10, 10, 50, 20); // Logo Mapan
  doc.setFontSize(16);
  doc.text('Hasil Perhitungan Mapan Interior', 10, 40);

  doc.setFontSize(12);
  doc.text(`Nama: ${form.nama}`, 10, 50);
  doc.text(`Alamat: ${form.alamat}`, 10, 60);
  doc.text(`Telepon: ${form.telepon}`, 10, 70);
  doc.text(`Furniture: ${form.furniture}`, 10, 80);
  doc.text(`Luas (m2): ${result.luas_m2}`, 10, 90);
  doc.text(`Faktor Tebal: ${result.faktor_tebal}`, 10, 100);
  doc.text(`Biaya Dasar: Rp ${result.biaya_dasar}`, 10, 110);
  doc.text(`Biaya Tabletop: Rp ${result.biaya_tabletop}`, 10, 120);
  doc.text(`Total Harga: Rp ${result.total_harga}`, 10, 130);

  doc.save('hasil_perhitungan.pdf');
  setToast('Export PDF berhasil!');
};

 const sendWhatsApp = () => {
  if (!form.telepon) {
    setToast('Nomor telepon belum diisi!');
    return;
  }

  // Bersihkan input: hanya angka
  const phoneNumber = form.telepon.replace(/\D/g, '');

  // Pastikan awalan +62 (Indonesia)
  const waNumber = phoneNumber.startsWith('62') ? phoneNumber : `62${phoneNumber.replace(/^0/, '')}`;

  const message = `Halo, berikut hasil perhitungan:\nNama: ${form.nama}\nAlamat: ${form.alamat}\nTelepon: ${form.telepon}\nFurniture: ${form.furniture}\nTotal Harga: Rp ${result.total_harga}`;
  const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
  setToast('WhatsApp terbuka!');
};

  const saveToGoogleSheet = async () => {
    setLoading(true);
    const resultCalc = calculatePrice();
    const payload = {
      ...form,
      biaya_dasar: resultCalc.biaya_dasar,
      biaya_tabletop: resultCalc.biaya_tabletop,
      total_harga: resultCalc.total_harga
    };

    try {
      await fetch('https://script.google.com/macros/s/AKfycbx5D46GC2rMoZyTUnrZtIMchGJaIrtjTv_QiQJVs8gA3HbxfykEdB0rahIHIex8FIEF/exec', {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(payload)
      });
      setToast('Data berhasil disimpan ke Google Spreadsheet!');
    } catch (error) {
      setToast('Gagal menyimpan data: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '20px', fontFamily: 'Arial', background: 'linear-gradient(to bottom, #ffffff, #f0f0f0)', textAlign: 'center', color: '#333' }}>
      <img src="https://i.imghippo.com/files/jeLf8293ko.png" alt="Logo Mapan Interior" style={{ display: 'block', margin: '0 auto 20px', maxWidth: '200px', height: 'auto' }} />
      <h2 style={{ fontWeight: 'bold', fontSize: '2rem', marginBottom: '2rem' }}>Mapan Interior Price Generator</h2>
      <form style={{ display: 'inline-block', textAlign: 'left', maxWidth: '400px', width: '100%' }}>
        {['nama', 'alamat', 'telepon', 'furniture'].map((field) => (
          <div key={field} style={{ marginBottom: '10px' }}>
            <label style={{ fontWeight: 'bold' }}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
            <input type="text" name={field} value={form[field]} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
          </div>
        ))}
        {[['Material Dasar', 'material', MATERIAL_FACTORS], ['Jenis Furniture', 'jenis', FURNITURE_FACTORS], ['Jenis Finishing', 'finishing', FINISHING_PRICES], ['Table Top', 'tabletop', TABLE_TOP_PRICES]].map(([label, name, options]) => (
          <div key={name} style={{ marginBottom: '10px' }}>
            <label style={{ fontWeight: 'bold' }}>{label}</label>
            <select name={name} value={form[name]} onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
              {Object.keys(options).map(key => <option key={key}>{key}</option>)}
            </select>
          </div>
        ))}
        {['panjang', 'tinggi', 'tebal'].map((field) => (
          <div key={field} style={{ marginBottom: '10px' }}>
            <label style={{ fontWeight: 'bold' }}>{field.charAt(0).toUpperCase() + field.slice(1)} (cm)</label>
            <input type="number" name={field} value={form[field]} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
          </div>
        ))}
      </form>
      <div style={{ marginTop: '20px' }}>
        <button onClick={saveToGoogleSheet} disabled={loading} style={{ margin: '5px', padding: '10px 20px', background: 'linear-gradient(to right, #800000, #ff6666)', color: 'white', border: 'none', borderRadius: '5px' }}>Hitung & Simpan ke Google Sheet</button>
        <button onClick={exportPDF} style={{ margin: '5px', padding: '10px 20px', background: 'linear-gradient(to right, #800000, #ff6666)', color: 'white', border: 'none', borderRadius: '5px' }}>Export PDF</button>
        <button onClick={sendWhatsApp} style={{ margin: '5px', padding: '10px 20px', background: 'linear-gradient(to right, #800000, #ff6666)', color: 'white', border: 'none', borderRadius: '5px' }}>Kirim WhatsApp</button>
      </div>
      <h3>Hasil Perhitungan Rinci:</h3>
      <p>Luas (m2): {result.luas_m2}</p>
      <p>Biaya Dasar: Rp {result.biaya_dasar}</p>
      <p>Biaya Tabletop: Rp {result.biaya_tabletop}</p>
      <p><strong>Total Harga: Rp {result.total_harga}</strong></p>
      {toast && <div style={{ marginTop: '20px', color: 'green', fontWeight: 'bold' }}>{toast}</div>}
      <footer style={{ marginTop: '40px', fontSize: '0.7rem', color: '#777' }}>
        PT ENIGMA PRISMA DELAPAN | V1.0
      </footer>
    </div>
  );
};

export default App;

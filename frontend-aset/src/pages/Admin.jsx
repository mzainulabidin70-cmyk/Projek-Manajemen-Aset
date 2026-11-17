import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3000';

// Mengirim permintaan ke server. Data otomatis diubah menjadi JSON.
async function request(path, method = 'GET', data) {
  const options = { method };

  if (data !== undefined) {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(data);
  }

  return fetch(`${API_URL}${path}`, options);
}

export default function Admin() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('assets');
  const [categories, setCategories] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loans, setLoans] = useState([]);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [condition, setCondition] = useState('Bagus');
  const [newCat, setNewCat] = useState('');
  const [newRoom, setNewRoom] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPass, setUserPass] = useState('');
  const [createdUserName, setCreatedUserName] = useState('');

  const fetchData = async () => {
    const [resA, resC, resR, resL] = await Promise.all([
      request('/assets'),
      request('/categories'),
      request('/rooms'),
      request('/loans'),
    ]);
    setAssets(await resA.json());
    setCategories(await resC.json());
    setRooms(await resR.json());
    setLoans(await resL.json());
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
  }, []);

  const resetForm = () => {
    setEditId(null);
    setName('');
    setCategoryId('');
    setRoomId('');
    setCondition('Bagus');
  };

  const handleSaveAsset = async (e) => {
    e.preventDefault();
    const payload = {
      name,
      category_id: categoryId || null,
      room_id: roomId || null,
      condition,
    };

    const method = editId ? 'PUT' : 'POST';
    const path = editId ? `/assets/${editId}` : '/assets';

    await request(path, method, payload);

    resetForm();
    fetchData();
  };

  const handleEditAsset = (item) => {
    setEditId(item.id);
    setName(item.name);
    setCategoryId(item.category_id || '');
    setRoomId(item.room_id || '');
    setCondition(item.condition);
  };

  const handleDeleteAsset = async (id) => {
    if (!confirm('Hapus barang ini?')) return;
    await request(`/assets/${id}`, 'DELETE');
    fetchData();
  };

  const addCategory = async (e) => {
    e.preventDefault();
    await request('/categories', 'POST', { name: newCat });
    setNewCat('');
    fetchData();
  };

  const addRoom = async (e) => {
    e.preventDefault();
    await request('/rooms', 'POST', { name: newRoom });
    setNewRoom('');
    fetchData();
  };

  const addUser = async (e) => {
    e.preventDefault();
    const response = await request('/users', 'POST', {
      name: userName,
      email: userEmail,
      password: userPass,
      role: 'user',
    });
    if (!response.ok) return;
    setCreatedUserName(userName);
    setUserName('');
    setUserEmail('');
    setUserPass('');
  };

  const handleCheckout = async (loan) => {
    await request(`/loans/${loan.id}/checkout`, 'PUT', {
      asset_id: loan.asset_id,
    });
    fetchData();
  };

  const handleCheckin = async (loan, cond) => {
    await request(`/loans/${loan.id}/checkin`, 'PUT', {
      asset_id: loan.asset_id,
      condition: cond,
    });
    fetchData();
  };

  const logout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-blue-700 text-white p-4 flex justify-between items-center print:hidden">
        <h1 className="text-xl font-bold">Dashboard Admin - Manajemen Aset</h1>
        <button onClick={logout} className="bg-red-500 px-3 py-1 rounded text-sm hover:bg-red-600">
          Keluar
        </button>
      </div>

      <div className="bg-white shadow px-6 flex gap-4 border-b print:hidden">
        {/* Tombol untuk memilih bagian dashboard. */}
        {[
          { id: 'assets', label: 'Daftar Barang' },
          { id: 'master', label: 'Data Awal' },
          { id: 'loans', label: 'Check-out & Check-in' },
          { id: 'report', label: 'Laporan' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`py-3 px-2 font-medium border-b-2 ${
              tab === item.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        {/* Formulir tambah/ubah dan tabel daftar barang. */}
        {tab === 'assets' && (
          <div className="space-y-6">
            <form onSubmit={handleSaveAsset} className="bg-white p-4 rounded shadow grid grid-cols-1 md:grid-cols-3 gap-4">
              <h2 className="md:col-span-3 font-bold text-lg">
                {editId ? 'Ubah Data Barang' : 'Tambah Barang Baru'}
              </h2>
              <input required placeholder="Nama Barang" value={name} onChange={(e) => setName(e.target.value)} className="border p-2 rounded" />
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="border p-2 rounded">
                <option value="">-- Pilih Jenis --</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={roomId} onChange={(e) => setRoomId(e.target.value)} className="border p-2 rounded">
                <option value="">-- Pilih Ruangan --</option>
                {rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
              <select value={condition} onChange={(e) => setCondition(e.target.value)} className="border p-2 rounded">
                <option value="Bagus">Kondisi: Bagus</option>
                <option value="Rusak">Kondisi: Rusak</option>
              </select>
              <div className="md:col-span-3 flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                  {editId ? 'Simpan Perubahan' : 'Tambah Barang'}
                </button>
                {editId && <button type="button" onClick={resetForm} className="bg-gray-400 text-white px-4 py-2 rounded">Batal</button>}
              </div>
            </form>

            <div className="bg-white rounded shadow overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-3">Nama Barang</th>
                    <th className="p-3">Jenis</th>
                    <th className="p-3">Ruangan</th>
                    <th className="p-3">Kondisi</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((a) => (
                    <tr key={a.id} className="border-t">
                      <td className="p-3 font-medium">{a.name}</td>
                      <td className="p-3">{a.category_name || '-'}</td>
                      <td className="p-3">{a.room_name || '-'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${a.condition === 'Bagus' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {a.condition}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${a.status === 'Tersedia' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="p-3 space-x-2">
                        <button onClick={() => handleEditAsset(a)} className="text-blue-600 hover:underline">Ubah</button>
                        <button onClick={() => handleDeleteAsset(a.id)} className="text-red-600 hover:underline">Hapus</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Formulir untuk mengelola data awal dan akun peminjam. */}
        {tab === 'master' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded shadow space-y-4">
              <h2 className="font-bold">Tambah Jenis Barang</h2>
              <form onSubmit={addCategory} className="flex gap-2">
                <input required placeholder="Misal: Buku" value={newCat} onChange={(e) => setNewCat(e.target.value)} className="border p-2 rounded w-full" />
                <button className="bg-blue-600 text-white px-3 rounded">Tambah</button>
              </form>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {categories.map((c) => <li key={c.id}>{c.name}</li>)}
              </ul>
            </div>

            <div className="bg-white p-4 rounded shadow space-y-4">
              <h2 className="font-bold">Tambah Daftar Ruangan</h2>
              <form onSubmit={addRoom} className="flex gap-2">
                <input required placeholder="Misal: " value={newRoom} onChange={(e) => setNewRoom(e.target.value)} className="border p-2 rounded w-full" />
                <button className="bg-blue-600 text-white px-3 rounded">Tambah</button>
              </form>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {rooms.map((r) => <li key={r.id}>{r.name}</li>)}
              </ul>
            </div>

            <div className="bg-white p-4 rounded shadow space-y-4">
              <h2 className="font-bold">Buat Akun Peminjam</h2>
              <form onSubmit={addUser} className="space-y-2">
                <input required placeholder="Nama Siswa/Siswi" value={userName} onChange={(e) => setUserName(e.target.value)} className="border p-2 rounded w-full" />
                <input required type="email" placeholder="Email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} className="border p-2 rounded w-full" />
                <input required placeholder="Password" value={userPass} onChange={(e) => setUserPass(e.target.value)} className="border p-2 rounded w-full" />
                <button className="bg-green-600 text-white w-full py-2 rounded">Simpan Akun</button>
              </form>
            </div>
          </div>
        )}

        {/* Daftar peminjaman yang masih perlu tindakan admin. */}
        {tab === 'loans' && (
          <div className="bg-white rounded shadow overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-3">Peminjam</th>
                  <th className="p-3">Barang</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Catatan Kerusakan</th>
                  <th className="p-3">Tindakan Admin</th>
                </tr>
              </thead>
              <tbody>
                {loans.filter((l) => l.status !== 'Dikembalikan').map((l) => (
                  <tr key={l.id} className="border-t">
                    <td className="p-3">{l.user_name}</td>
                    <td className="p-3">{l.asset_name}</td>
                    <td className="p-3">{l.status}</td>
                    <td className="p-3 text-red-600">{l.damage_report || '-'}</td>
                    <td className="p-3 space-x-2">
                      {l.status === 'Menunggu' && (
                        <button onClick={() => handleCheckout(l)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
                          Setujui (Check-out)
                        </button>
                      )}
                      {l.status === 'Disetujui' && (
                        <>
                          <button onClick={() => handleCheckin(l, 'Bagus')} className="bg-green-600 text-white px-3 py-1 rounded text-sm">
                            Kembali (Bagus)
                          </button>
                          <button onClick={() => handleCheckin(l, 'Rusak')} className="bg-red-600 text-white px-3 py-1 rounded text-sm">
                            Kembali (Rusak)
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Riwayat peminjaman dan tombol untuk mencetak laporan. */}
        {tab === 'report' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Laporan Riwayat Peminjaman Aset</h2>
              <button onClick={() => window.print()} className="bg-gray-800 text-white px-4 py-2 rounded print:hidden">
                Cetak Laporan
              </button>
            </div>
            <div className="bg-white rounded shadow overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-3">Nama Peminjam</th>
                    <th className="p-3">Barang</th>
                    <th className="p-3">Tgl Pinjam</th>
                    <th className="p-3">Tgl Kembali</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Laporan Kerusakan</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((l) => (
                    <tr key={l.id} className="border-t">
                      <td className="p-3">{l.user_name}</td>
                      <td className="p-3">{l.asset_name}</td>
                      <td className="p-3">{new Date(l.borrow_date).toLocaleDateString('id-ID')}</td>
                      <td className="p-3">{l.return_date ? new Date(l.return_date).toLocaleDateString('id-ID') : '-'}</td>
                      <td className="p-3">{l.status}</td>
                      <td className="p-3">{l.damage_report || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {createdUserName && (
        <div
          onClick={() => setCreatedUserName('')}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-lg bg-white p-6 text-center shadow-xl"
          >
            <h2 className="mb-2 text-lg font-bold">Akun Berhasil Dibuat</h2>
            <p>Akun peminjam {createdUserName} berhasil ditambahkan.</p>
            <p className="mt-3 text-sm text-gray-500">Klik di luar pop-up untuk menutup.</p>
          </div>
        </div>
      )}
    </div>
  );
}

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
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 shrink-0 bg-blue-800 text-white flex flex-col print:hidden">
        <h1 className="p-5 text-xl font-bold border-b border-white">Dashboard Admin</h1>
        <nav className="flex-1 p-3 space-y-1">
          {[
            { id: 'assets', label: 'Daftar Barang' },
            { id: 'master', label: 'Data Awal' },
            { id: 'loans', label: 'Check-out & Check-in' },
            { id: 'report', label: 'Laporan' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full rounded px-4 py-3 text-left font-medium ${
                tab === item.id ? 'bg-blue-600 text-white' : 'text-blue-100 hover:bg-blue-700 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <button onClick={logout} className="m-3 rounded bg-red-500 px-4 py-2 text-sm hover:bg-red-600">
          Keluar
        </button>
      </aside>

      <main className="min-w-0 flex-1 bg-slate-50">
      <div className="p-6 max-w-6xl mx-auto">
        {tab === 'assets' && (
          <div className="space-y-6">
            <header className="border border-slate-300 bg-white px-5 py-5">
              <p className="text-sm font-medium text-blue-700">Inventaris sekolah</p>
              <div className="mt-1 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Daftar Barang</h2>
                  <p className="mt-1 text-sm text-slate-500">Kelola data aset beserta jenis, lokasi, dan kondisinya.</p>
                </div>
                <div className="hidden border-l-2 border-blue-600 pl-4 text-right sm:block">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total barang</p>
                  <p className="text-2xl font-bold text-slate-900">{assets.length}</p>
                </div>
              </div>
            </header>

            <section className="border border-slate-300 bg-white">
              <div className="border-b border-slate-300 px-5 py-4">
                <h3 className="font-bold text-slate-800">{editId ? 'Ubah Data Barang' : 'Tambah Barang Baru'}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {editId ? 'Perbarui informasi barang yang dipilih.' : 'Lengkapi informasi berikut untuk menambahkan aset.'}
                </p>
              </div>
              <form onSubmit={handleSaveAsset} className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Nama Barang</span>
                  <input required placeholder="Contoh: Buku ...." value={name} onChange={(e) => setName(e.target.value)} className="h-11 w-full border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Jenis Barang</span>
                  <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="h-11 w-full border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600">
                    <option value="">-- Pilih Jenis --</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Ruangan</span>
                  <select value={roomId} onChange={(e) => setRoomId(e.target.value)} className="h-11 w-full border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600">
                    <option value="">-- Pilih Ruangan --</option>
                    {rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Kondisi</span>
                  <select value={condition} onChange={(e) => setCondition(e.target.value)} className="h-11 w-full border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600">
                    <option value="Bagus">Bagus</option>
                    <option value="Rusak">Rusak</option>
                  </select>
                </label>
                <div className="flex gap-2 md:col-span-2 xl:col-span-4">
                  <button type="submit" className="border border-blue-700 bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800">
                    {editId ? 'Simpan Perubahan' : 'Tambah Barang'}
                  </button>
                  {editId && <button type="button" onClick={resetForm} className="border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">Batal</button>}
                </div>
              </form>
            </section>

            <section className="border border-slate-300 bg-white">
              <div className="flex items-center justify-between border-b border-slate-300 px-5 py-4">
                <div>
                  <h3 className="font-bold text-slate-800">Data aset</h3>
                  <p className="mt-1 text-sm text-slate-500">Menampilkan seluruh barang yang terdaftar.</p>
                </div>
                <span className="border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">{assets.length} data</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead className="border-b border-slate-300 bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                    <tr>
                      <th className="border-r border-slate-200 px-5 py-3 font-semibold">Nama Barang</th>
                      <th className="border-r border-slate-200 px-5 py-3 font-semibold">Jenis</th>
                      <th className="border-r border-slate-200 px-5 py-3 font-semibold">Ruangan</th>
                      <th className="border-r border-slate-200 px-5 py-3 font-semibold">Kondisi</th>
                      <th className="border-r border-slate-200 px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {assets.length ? assets.map((a) => (
                      <tr key={a.id} className="text-sm transition hover:bg-blue-50/40">
                        <td className="border-r border-slate-200 px-5 py-4 font-semibold text-slate-800">{a.name}</td>
                        <td className="border-r border-slate-200 px-5 py-4 text-slate-600">{a.category_name || '-'}</td>
                        <td className="border-r border-slate-200 px-5 py-4 text-slate-600">{a.room_name || '-'}</td>
                        <td className="border-r border-slate-200 px-5 py-4">
                          <span className={`border px-2.5 py-1 text-xs font-semibold ${a.condition === 'Bagus' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                            {a.condition}
                          </span>
                        </td>
                        <td className="border-r border-slate-200 px-5 py-4">
                          <span className={`border px-2.5 py-1 text-xs font-semibold ${a.status === 'Tersedia' ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex min-w-max gap-2">
                            <button onClick={() => handleEditAsset(a)} className="border border-blue-300 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-50">Ubah</button>
                            <button onClick={() => handleDeleteAsset(a.id)} className="border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50">Hapus</button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="6" className="px-5 py-12 text-center">
                          <p className="font-semibold text-slate-700">Belum ada barang terdaftar</p>
                          <p className="mt-1 text-sm text-slate-500">Gunakan formulir di atas untuk menambah barang.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {tab === 'master' && (
          <div className="space-y-6">
            <header className="rounded-lg border border-slate-200 bg-white p-5">
              <p className="text-sm font-medium text-blue-700">Pengaturan inventaris</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">Data Awal</h2>
              <p className="mt-2 text-sm text-slate-600">Kelola jenis barang, ruangan, dan akun peminjam.</p>
            </header>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <div className="border-b border-slate-200 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-blue-700">Master barang</p>
                      <h3 className="mt-1 text-lg font-bold text-slate-800">Jenis Barang</h3>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">{categories.length}</span>
                  </div>
                </div>
                <div className="space-y-4 p-5">
                  <form onSubmit={addCategory} className="flex gap-2">
                    <input required placeholder="Contoh: Buku" value={newCat} onChange={(e) => setNewCat(e.target.value)} className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                    <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">Tambah</button>
                  </form>
                  <ul className="divide-y divide-slate-100">
                    {categories.length ? categories.map((c) => (
                      <li key={c.id} className="flex items-center gap-3 py-3 text-sm text-slate-700">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />{c.name}
                      </li>
                    )) : <li className="py-4 text-center text-sm text-slate-400">Belum ada jenis barang.</li>}
                  </ul>
                </div>
              </section>

              <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <div className="border-b border-slate-200 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-blue-700">Lokasi aset</p>
                      <h3 className="mt-1 text-lg font-bold text-slate-800">Daftar Ruangan</h3>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">{rooms.length}</span>
                  </div>
                </div>
                <div className="space-y-4 p-5">
                  <form onSubmit={addRoom} className="flex gap-2">
                    <input required placeholder="Contoh: Ruang kelas 1" value={newRoom} onChange={(e) => setNewRoom(e.target.value)} className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                    <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">Tambah</button>
                  </form>
                  <ul className="divide-y divide-slate-100">
                    {rooms.length ? rooms.map((r) => (
                      <li key={r.id} className="flex items-center gap-3 py-3 text-sm text-slate-700">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />{r.name}
                      </li>
                    )) : <li className="py-4 text-center text-sm text-slate-400">Belum ada ruangan.</li>}
                  </ul>
                </div>
              </section>

              <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <div className="border-b border-slate-200 p-5">
                  <p className="text-xs font-medium text-blue-700">Akses pengguna</p>
                  <h3 className="mt-1 text-lg font-bold text-slate-800">Buat Akun Peminjam</h3>
                  <p className="mt-1 text-sm text-slate-500">Tambahkan akun untuk siswa atau siswi.</p>
                </div>
                <form onSubmit={addUser} className="space-y-3 p-5">
                  <input required placeholder="Nama Siswa/Siswi" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                  <input required type="email" placeholder="Email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                  <input required placeholder="Password" value={userPass} onChange={(e) => setUserPass(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                  <button className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">Simpan Akun</button>
                </form>
              </section>
            </div>
          </div>
        )}

        {tab === 'loans' && (
          <div className="space-y-6">
            <header className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Peminjaman barang</p>
              <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Check-out &amp; Check-in</h2>
                  <p className="mt-1 text-sm text-slate-500">Setujui permintaan yang masuk, lalu catat kondisi barang saat dikembalikan.</p>
                </div>
                <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                  {loans.filter((l) => l.status !== 'Dikembalikan').length} transaksi aktif
                </span>
              </div>
            </header>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { label: 'Menunggu persetujuan', count: loans.filter((l) => l.status === 'Menunggu').length, style: 'border-amber-200 bg-amber-50 text-amber-800', marker: 'bg-amber-500' },
                { label: 'Sedang dipinjam', count: loans.filter((l) => l.status === 'Disetujui').length, style: 'border-blue-200 bg-blue-50 text-blue-800', marker: 'bg-blue-500' },
                { label: 'Perlu tindak lanjut', count: loans.filter((l) => l.status === 'Disetujui' && l.damage_report).length, style: 'border-red-200 bg-red-50 text-red-800', marker: 'bg-red-500' },
              ].map((item) => (
                <div key={item.label} className={`rounded-xl border p-4 ${item.style}`}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{item.label}</p>
                    <span className={`h-2.5 w-2.5 rounded-full ${item.marker}`} />
                  </div>
                  <p className="mt-2 text-3xl font-bold">{item.count}</p>
                </div>
              ))}
            </div>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <h3 className="font-bold text-slate-800">Daftar peminjaman</h3>
                <p className="mt-1 text-sm text-slate-500">Permintaan yang belum disetujui dan barang yang masih dipinjam.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Peminjam</th>
                      <th className="px-5 py-3 font-semibold">Barang</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 font-semibold">Catatan kerusakan</th>
                      <th className="px-5 py-3 font-semibold">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loans.filter((l) => l.status !== 'Dikembalikan').length ? loans.filter((l) => l.status !== 'Dikembalikan').map((l) => (
                      <tr key={l.id} className="transition hover:bg-slate-50">
                        <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-800">{l.user_name}</td>
                        <td className="whitespace-nowrap px-5 py-4 text-slate-600">{l.asset_name}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${l.status === 'Menunggu' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                            {l.status}
                          </span>
                        </td>
                        <td className="max-w-xs px-5 py-4 text-sm text-red-700">{l.damage_report || <span className="text-slate-400">Tidak ada</span>}</td>
                        <td className="px-5 py-4">
                          <div className="flex min-w-max flex-wrap gap-2">
                            {l.status === 'Menunggu' && (
                              <button onClick={() => handleCheckout(l)} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300">
                                Setujui check-out
                              </button>
                            )}
                            {l.status === 'Disetujui' && (
                              <>
                                <button onClick={() => handleCheckin(l, 'Bagus')} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300">
                                  Kembali: Bagus
                                </button>
                                <button onClick={() => handleCheckin(l, 'Rusak')} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300">
                                  Kembali: Rusak
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="px-5 py-12 text-center">
                          <p className="font-semibold text-slate-700">Tidak ada peminjaman yang perlu ditangani</p>
                          <p className="mt-1 text-sm text-slate-500">Permintaan baru akan muncul di sini.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {tab === 'report' && (
          <div className="space-y-6">
            <header className="rounded-xl border border-slate-200 bg-white px-5 py-5 shadow-sm print:border-0 print:shadow-none">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Rekapitulasi inventaris</p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-900">Laporan Riwayat Peminjaman Aset</h2>
                  <p className="mt-1 text-sm text-slate-500">Ringkasan seluruh transaksi peminjaman dan pengembalian aset.</p>
                </div>
                <button onClick={() => window.print()} className="w-fit rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900 print:hidden">
                  Cetak Laporan
                </button>
              </div>
            </header>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { label: 'Total transaksi', count: loans.length, style: 'border-slate-200 bg-white text-slate-800', marker: 'bg-slate-500' },
                { label: 'Menunggu', count: loans.filter((l) => l.status === 'Menunggu').length, style: 'border-amber-200 bg-amber-50 text-amber-800', marker: 'bg-amber-500' },
                { label: 'Sedang dipinjam', count: loans.filter((l) => l.status === 'Disetujui').length, style: 'border-blue-200 bg-blue-50 text-blue-800', marker: 'bg-blue-500' },
                { label: 'Dikembalikan', count: loans.filter((l) => l.status === 'Dikembalikan').length, style: 'border-emerald-200 bg-emerald-50 text-emerald-800', marker: 'bg-emerald-500' },
              ].map((item) => (
                <div key={item.label} className={`rounded-xl border p-4 ${item.style}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{item.label}</p>
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.marker}`} />
                  </div>
                  <p className="mt-2 text-3xl font-bold">{item.count}</p>
                </div>
              ))}
            </div>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <h3 className="font-bold text-slate-800">Daftar riwayat peminjaman</h3>
                  <p class="mt-1 text-sm text-slate-500">{loans.length} transaksi tercatat</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Nama Peminjam</th>
                      <th className="px-5 py-3 font-semibold">Barang</th>
                      <th className="whitespace-nowrap px-5 py-3 font-semibold">Tgl Pinjam</th>
                      <th className="whitespace-nowrap px-5 py-3 font-semibold">Tgl Kembali</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 font-semibold">Laporan Kerusakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loans.length ? loans.map((l) => (
                      <tr key={l.id} className="transition hover:bg-slate-50">
                        <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-800">{l.user_name}</td>
                        <td className="whitespace-nowrap px-5 py-4 text-slate-600">{l.asset_name}</td>
                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">{new Date(l.borrow_date).toLocaleDateString('id-ID')}</td>
                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">{l.return_date ? new Date(l.return_date).toLocaleDateString('id-ID') : '-'}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${l.status === 'Menunggu' ? 'bg-amber-100 text-amber-800' : l.status === 'Disetujui' ? 'bg-blue-100 text-blue-800' : l.status === 'Dikembalikan' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                            {l.status}
                          </span>
                        </td>
                        <td className="max-w-xs px-5 py-4 text-sm text-red-700">{l.damage_report || <span className="text-slate-400">Tidak ada</span>}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="6" className="px-5 py-12 text-center">
                          <p className="font-semibold text-slate-700">Belum ada riwayat peminjaman</p>
                          <p class="mt-1 text-sm text-slate-500">Data transaksi akan tampil di sini setelah peminjaman dibuat.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </div>
      </main>

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

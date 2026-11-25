import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

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
  const [masterTab, setMasterTab] = useState('categories');
  const [categories, setCategories] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loans, setLoans] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersError, setUsersError] = useState('');
  const [userFormError, setUserFormError] = useState('');
  const [editId, setEditId] = useState(null);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [condition, setCondition] = useState('Bagus');
  const [newCat, setNewCat] = useState('');
  const [newRoom, setNewRoom] = useState('');
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editRoomId, setEditRoomId] = useState(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPass, setUserPass] = useState('');
  const [createdUserName, setCreatedUserName] = useState('');
  const [createdAssetName, setCreatedAssetName] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [assetSearch, setAssetSearch] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchData = async () => {
    const [resA, resC, resR, resL, resU] = await Promise.all([
      request('/assets'),
      request('/categories'),
      request('/rooms'),
      request('/loans'),
      request('/users'),
    ]);
    setAssets(await resA.json());
    setCategories(await resC.json());
    setRooms(await resR.json());
    setLoans(await resL.json());
    if (resU.ok) {
      try {
        const userData = await resU.json();
        const userList = Array.isArray(userData) ? userData : userData.users || userData.data;
        if (Array.isArray(userList)) {
          setUsers(userList);
          setUsersError('');
        } else {
          setUsers([]);
          setUsersError('Respons endpoint /users bukan berupa daftar akun. Periksa format data dari backend.');
        }
      } catch {
        setUsers([]);
        setUsersError('Data dari endpoint /users tidak dapat dibaca. Periksa backend.');
      }
    } else {
      setUsers([]);
      setUsersError(`Gagal memuat akun (HTTP ${resU.status}). Pastikan backend menyediakan GET /users.`);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    setCurrentUser(user);
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

    const response = await request(path, method, payload);
    if (!response.ok) return;

    if (!editId) setCreatedAssetName(name);
    resetForm();
    setShowAssetModal(false);
    fetchData();
  };

  const handleEditAsset = (item) => {
    setEditId(item.id);
    setName(item.name);
    setCategoryId(item.category_id || '');
    setRoomId(item.room_id || '');
    setCondition(item.condition);
    setShowAssetModal(true);
  };

  const handleDeleteAsset = async (id) => {
    if (!confirm('Hapus barang ini?')) return;
    await request(`/assets/${id}`, 'DELETE');
    fetchData();
  };

  const addCategory = async (e) => {
    e.preventDefault();
    await request(editCategoryId ? `/categories/${editCategoryId}` : '/categories', editCategoryId ? 'PUT' : 'POST', { name: newCat });
    setNewCat('');
    setEditCategoryId(null);
    fetchData();
  };

  const addRoom = async (e) => {
    e.preventDefault();
    await request(editRoomId ? `/rooms/${editRoomId}` : '/rooms', editRoomId ? 'PUT' : 'POST', { name: newRoom });
    setNewRoom('');
    setEditRoomId(null);
    fetchData();
  };

  const deleteCategory = async (id) => {
    if (!confirm('Hapus jenis barang ini?')) return;
    await request(`/categories/${id}`, 'DELETE');
    fetchData();
  };

  const deleteRoom = async (id) => {
    if (!confirm('Hapus ruangan ini?')) return;
    await request(`/rooms/${id}`, 'DELETE');
    fetchData();
  };

  const addUser = async (e) => {
    e.preventDefault();
    setUserFormError('');
    const response = await request('/users', 'POST', {
      name: userName,
      email: userEmail,
      password: userPass,
      role: 'user',
    });
    if (!response.ok) {
      setUserFormError(`Akun gagal disimpan (HTTP ${response.status}). Periksa endpoint POST /users di backend.`);
      return;
    }
    setCreatedUserName(userName);
    setUserName('');
    setUserEmail('');
    setUserPass('');
    await fetchData();
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

  const filteredAssets = assets.filter((asset) => {
    const query = assetSearch.trim().toLocaleLowerCase('id-ID');
    const matchesQuery = !query || [asset.name, asset.category_name, asset.room_name]
      .some((value) => String(value || '').toLocaleLowerCase('id-ID').includes(query));
    return matchesQuery
      && (!conditionFilter || asset.condition === conditionFilter)
      && (!statusFilter || asset.status === statusFilter);
  });

  const logout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const borrowerUsers = users.filter((user) => ['user', 'peminjam', 'siswa', 'borrower'].includes(String(user.role || '').toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      <aside className="flex w-full shrink-0 flex-col bg-blue-800 text-white print:hidden md:min-h-screen md:w-64">
        <h1 className="flex items-center justify-between border-b border-white px-4 py-3 text-lg font-bold md:block md:p-5 md:text-xl">
          Dashboard
          <button onClick={logout} className="rounded bg-red-500 px-3 py-1.5 text-xs font-medium hover:bg-red-600 md:hidden">
            Keluar
          </button>
        </h1>
        {currentUser && (
          <div className="border-b border-blue-700 px-4 py-3 text-sm md:px-5">
            <p className="font-semibold">{currentUser.name || currentUser.email}</p>
            <p className="mt-0.5 text-xs text-blue-200">Masuk sebagai {currentUser.role === 'guru' ? 'Guru' : currentUser.role === 'admin' ? 'Admin' : 'Pengguna'}</p>
          </div>
        )}
        <nav className="grid grid-cols-2 gap-2 p-3 md:block md:flex-1 md:space-y-1 md:p-3" aria-label="Menu admin">
          {[
            {
              id: 'assets',
              label: 'Data Barang',
              icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 shrink-0" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 7.5 7.5 4.2 7.5-4.2M12 12v9" /></svg>,
            },
            {
              id: 'master',
              label: 'Master Data',
              icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 shrink-0" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M8 4h8l3 3v13H5V4h3Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 4v4h8V4M8 12h8M8 16h5" /></svg>,
            },
            {
              id: 'loans',
              label: 'Transaksi',
              icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 shrink-0" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h12l-3-3M17 17H5l3 3M19 7a7 7 0 0 1 1 8M5 17a7 7 0 0 1-1-8" /></svg>,
            },
            {
              id: 'report',
              label: 'Laporan',
              icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 shrink-0" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4 20V4m0 16h16M8 16v-5m5 5V7m5 9v-8" /></svg>,
            },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex min-h-12 w-full items-center gap-3 rounded px-3 py-2.5 text-left text-xs font-medium leading-snug sm:text-sm md:min-h-0 md:px-4 md:py-3 md:text-base ${
                tab === item.id ? 'bg-blue-600 text-white' : 'text-blue-100 hover:bg-blue-700 hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <button onClick={logout} className="mx-3 mb-3 mt-0 hidden rounded bg-red-500 px-4 py-2 text-sm hover:bg-red-600 md:m-3 md:block">
          Keluar
        </button>
      </aside>

      <main className="min-w-0 flex-1 bg-slate-50">
      <div className="mx-auto w-full max-w-6xl p-3 sm:p-5 md:p-6">
        {tab === 'assets' && (
          <div className="space-y-6">
            <header className="border border-slate-300 bg-white px-4 py-4 sm:px-5 sm:py-5">
              <p className="text-sm font-medium text-blue-700">Inventaris sekolah</p>
              <div className="mt-1 flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Daftar Barang</h2>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">Kelola data aset beserta jenis, lokasi, dan kondisinya.</p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
                  <div className="hidden border-l-2 border-blue-600 pl-4 text-right sm:block">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total barang</p>
                    <p className="text-2xl font-bold text-slate-900">{assets.length}</p>
                  </div>
                  <button type="button" onClick={() => { resetForm(); setShowAssetModal(true); }} className="border border-blue-700 bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 sm:px-5">Tambah Barang</button>
                </div>
              </div>
            </header>

            <section className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Ringkasan kondisi inventaris">
              {[
                { label: 'Total aset', count: assets.length, style: 'border-blue-200 bg-blue-50 text-blue-900' },
                { label: 'Kondisi bagus', count: assets.filter((a) => a.condition === 'Bagus').length, style: 'border-emerald-200 bg-emerald-50 text-emerald-900' },
                { label: 'Perlu diperiksa', count: assets.filter((a) => a.condition === 'Rusak').length, style: 'border-amber-200 bg-amber-50 text-amber-900' },
                { label: 'Sedang dipinjam', count: assets.filter((a) => a.status && !['Tersedia', 'Dikembalikan'].includes(a.status)).length, style: 'border-violet-200 bg-violet-50 text-violet-900' },
              ].map((item) => (
                <div key={item.label} className={`border p-4 ${item.style}`}>
                  <p className="text-xs font-medium sm:text-sm">{item.label}</p>
                  <p className="mt-1 text-2xl font-bold">{item.count}</p>
                </div>
              ))}
            </section>

            <section className="border border-slate-300 bg-white">
              <div className="flex items-center justify-between gap-3 border-b border-slate-300 px-4 py-4 sm:px-5">
                <div>
                  <h3 className="font-bold text-slate-800">Data aset</h3>
                  <p className="mt-1 text-sm text-slate-500">Cari aset berdasarkan nama, jenis, atau ruangan; gunakan filter untuk pemeriksaan inventaris.</p>
                </div>
                <span className="border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">{filteredAssets.length} dari {assets.length}</span>
              </div>
              <div className="grid grid-cols-1 gap-2 border-b border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
                <input aria-label="Cari aset" value={assetSearch} onChange={(e) => setAssetSearch(e.target.value)} placeholder="Cari nama, jenis, ruangan..." className="min-w-0 border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 sm:col-span-2" />
                <select aria-label="Filter kondisi" value={conditionFilter} onChange={(e) => setConditionFilter(e.target.value)} className="border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600">
                  <option value="">Semua kondisi</option>
                  {[...new Set(assets.map((asset) => asset.condition).filter(Boolean))].map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
                <div className="flex gap-2">
                  <select aria-label="Filter status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="min-w-0 flex-1 border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600">
                    <option value="">Semua status</option>
                    {[...new Set(assets.map((asset) => asset.status).filter(Boolean))].map((value) => <option key={value} value={value}>{value}</option>)}
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-left">
                  <thead className="border-b border-slate-300 bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                    <tr>
                      <th className="border-r border-slate-200 px-5 py-3 font-semibold">Nama Barang</th>
                      <th className="border-r border-slate-200 px-5 py-3 font-semibold">Jenis</th>
                      <th className="border-r border-slate-200 px-5 py-3 font-semibold">Ruangan</th>
                      <th className="border-r border-slate-200 px-5 py-3 font-semibold">Kondisi</th>
                      <th className="border-r border-slate-200 px-5 py-3 font-semibold">Status</th>
                      <th className="border-r border-slate-200 px-5 py-3 font-semibold">Dipinjam oleh</th>
                      <th className="px-5 py-3 font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredAssets.length ? filteredAssets.map((a) => (
                      <tr key={a.id} className="text-sm transition hover:bg-blue-50/40">
                        <td className="border-r border-slate-200 px-5 py-4 font-semibold text-slate-800">{a.name}</td>
                        <td className="border-r border-slate-200 px-5 py-4 text-slate-600">{a.category_name || '-'}</td>
                        <td className="border-r border-slate-200 px-5 py-4 text-slate-600">{a.room_name || '-'}</td>
                        <td className="border-r border-slate-200 px-5 py-4">
                          <span className="text-xs font-semibold text-slate-700">
                            {a.condition}
                          </span>
                        </td>
                        <td className="border-r border-slate-200 px-5 py-4">
                          <span className="text-xs font-semibold text-slate-700">
                            {a.status}
                          </span>
                        </td>
                        <td className="border-r border-slate-200 px-5 py-4 text-slate-600">
                          {loans.find((loan) => String(loan.asset_id) === String(a.id) && loan.status === 'Disetujui')?.user_name || '-'}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex min-w-max gap-2">
                            <button onClick={() => handleEditAsset(a)} className="border border-amber-500 bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-600">Edit</button>
                            <button onClick={() => handleDeleteAsset(a.id)} className="border border-red-600 bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700">Hapus</button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="7" className="px-5 py-12 text-center">
                          <p className="font-semibold text-slate-700">{assets.length ? 'Aset tidak ditemukan' : 'Belum ada barang terdaftar'}</p>
                          <p className="mt-1 text-sm text-slate-500">{assets.length ? 'Coba ubah kata kunci atau reset filter.' : 'Gunakan tombol Tambah Barang untuk mulai mencatat inventaris sekolah.'}</p>
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
            <header className="border border-slate-300 bg-white p-4 sm:p-5">
              <p className="text-sm font-medium text-blue-700">Pengaturan inventaris</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">Data Awal</h2>
              <p className="mt-2 text-sm text-slate-600">Pilih satu menu untuk mengelola data inventaris.</p>
            </header>

            <nav className="flex min-w-0 gap-2 overflow-x-auto border-b border-slate-300 md:flex-wrap md:overflow-visible" aria-label="Menu Data Awal">
              {[
                { id: 'categories', label: 'Jenis Barang' },
                { id: 'rooms', label: 'Daftar Ruangan' },
                { id: 'users', label: 'Buat Akun Peminjam' },
              ].map((item) => (
                <button key={item.id} onClick={() => setMasterTab(item.id)} className={`shrink-0 border-b-2 px-3 py-3 text-left text-xs font-semibold transition sm:text-sm md:px-4 ${masterTab === item.id ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                  {item.label}
                </button>
              ))}
            </nav>

            {masterTab === 'categories' && (
              <section className="border border-slate-300 bg-white">
                <div className="flex items-center justify-between gap-3 border-b border-slate-300 px-4 py-4 sm:px-5">
                  <div><p className="text-xs font-medium text-blue-700">Master barang</p><h3 className="mt-1 text-lg font-bold text-slate-800">Jenis Barang</h3></div>
                  <span className="bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">{categories.length} data</span>
                </div>
                <div className="space-y-4 p-4 sm:p-5">
                  <form onSubmit={addCategory} className="flex flex-col gap-2 sm:flex-row">
                    <input required placeholder="Contoh: Buku" value={newCat} onChange={(e) => setNewCat(e.target.value)} className="min-w-0 flex-1 border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600" />
                    <button className="w-full bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 sm:w-auto">{editCategoryId ? 'Simpan Perubahan' : 'Tambah Jenis'}</button>
                    {editCategoryId && <button type="button" onClick={() => { setEditCategoryId(null); setNewCat(''); }} className="w-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 sm:w-auto">Batal</button>}
                  </form>
                  <div className="overflow-x-auto border-y border-slate-200">
                    <table className="w-full min-w-[520px] text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-3 py-2">Jenis Barang</th><th className="px-3 py-2">Jumlah</th><th className="px-3 py-2">Nama Barang</th><th className="px-3 py-2">Aksi</th></tr></thead>
                      <tbody className="divide-y divide-slate-200">
                        {categories.length ? categories.map((c) => {
                          const categoryAssets = assets.filter((a) => String(a.category_id) === String(c.id));
                          return <tr key={c.id} className="text-slate-700"><td className="px-3 py-3 font-semibold">{c.name}</td><td className="px-3 py-3">{categoryAssets.length} barang</td><td className="px-3 py-3">{categoryAssets.length ? categoryAssets.map((a) => a.name).join(', ') : <span className="text-slate-400">Belum ada barang</span>}</td><td className="px-3 py-3"><div className="flex gap-2"><button onClick={() => { setEditCategoryId(c.id); setNewCat(c.name); }} className="border border-amber-500 bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600">Ubah</button><button onClick={() => deleteCategory(c.id)} className="border border-red-600 bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700">Hapus</button></div></td></tr>;
                        }) : <tr><td colSpan="4" className="py-8 text-center text-slate-400">Belum ada jenis barang.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {masterTab === 'rooms' && (
              <section className="border border-slate-300 bg-white">
                <div className="flex items-center justify-between gap-3 border-b border-slate-300 px-4 py-4 sm:px-5">
                  <div><p className="text-xs font-medium text-blue-700">Lokasi aset</p><h3 className="mt-1 text-lg font-bold text-slate-800">Daftar Ruangan</h3></div>
                  <span className="bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">{rooms.length} data</span>
                </div>
                <div className="space-y-4 p-4 sm:p-5">
                  <form onSubmit={addRoom} className="flex flex-col gap-2 sm:flex-row">
                    <input required placeholder="Contoh: Ruang kelas 1" value={newRoom} onChange={(e) => setNewRoom(e.target.value)} className="min-w-0 flex-1 border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600" />
                    <button className="w-full bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 sm:w-auto">{editRoomId ? 'Simpan Perubahan' : 'Tambah Ruangan'}</button>
                    {editRoomId && <button type="button" onClick={() => { setEditRoomId(null); setNewRoom(''); }} className="w-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 sm:w-auto">Batal</button>}
                  </form>
                  <div className="overflow-x-auto border-y border-slate-200">
                    <table className="w-full min-w-[520px] text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-3 py-2">Ruangan</th><th className="px-3 py-2">Jumlah</th><th className="px-3 py-2">Nama Barang</th><th className="px-3 py-2">Aksi</th></tr></thead>
                      <tbody className="divide-y divide-slate-200">
                        {rooms.length ? rooms.map((r) => {
                          const roomAssets = assets.filter((a) => String(a.room_id) === String(r.id));
                          return <tr key={r.id} className="text-slate-700"><td className="px-3 py-3 font-semibold">{r.name}</td><td className="px-3 py-3">{roomAssets.length} barang</td><td className="px-3 py-3">{roomAssets.length ? roomAssets.map((a) => a.name).join(', ') : <span className="text-slate-400">Belum ada barang</span>}</td><td className="px-3 py-3"><div className="flex gap-2"><button onClick={() => { setEditRoomId(r.id); setNewRoom(r.name); }} className="border border-amber-500 bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600">Ubah</button><button onClick={() => deleteRoom(r.id)} className="border border-red-600 bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700">Hapus</button></div></td></tr>;
                        }) : <tr><td colSpan="4" className="py-8 text-center text-slate-400">Belum ada ruangan.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {masterTab === 'users' && (
              <section className="w-full max-w-2xl border border-slate-300 bg-white">
                <div className="border-b border-slate-300 p-4 sm:p-5">
                  <p className="text-xs font-medium text-blue-700">Akses pengguna</p>
                  <h3 className="mt-1 text-lg font-bold text-slate-800">Buat Akun Peminjam</h3>
                  <p className="mt-1 text-sm text-slate-500">Isi nama, email, dan password lalu pilih Simpan Akun. Bagikan email dan password kepada siswa agar mereka bisa masuk dan mengajukan peminjaman.</p>
                </div>
                <form onSubmit={addUser} className="space-y-3 p-4 sm:p-5">
                  <input required placeholder="Nama Siswa/Siswi" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600" />
                  <input required type="email" placeholder="Email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} className="w-full border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600" />
                  <input required type="password" placeholder="Password" value={userPass} onChange={(e) => setUserPass(e.target.value)} className="w-full border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600" />
                  <button className="w-full bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 sm:w-auto">Simpan Akun</button>
                </form>
                <div className="border-t border-slate-200 p-4 sm:p-5">
                  <div className="mb-3 flex items-center justify-between gap-3"><h4 className="font-semibold text-slate-800">Daftar akun peminjam</h4><span className="bg-slate-100 px-3 py-1 text-sm text-slate-700">{borrowerUsers.length} akun</span></div>
                  {userFormError && <p role="alert" className="mb-3 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{userFormError}</p>}
                  {usersError && <p role="alert" className="mb-3 border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">{usersError}</p>}
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[420px] text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-3 py-2">Nama</th><th className="px-3 py-2">Email</th><th className="px-3 py-2">Peran</th></tr></thead>
                      <tbody className="divide-y divide-slate-200">
                        {borrowerUsers.length ? borrowerUsers.map((u) => <tr key={u.id} className="text-slate-700"><td className="px-3 py-3 font-medium">{u.name || '-'}</td><td className="px-3 py-3">{u.email || '-'}</td><td className="px-3 py-3">Peminjam</td></tr>) : <tr><td colSpan="3" className="py-8 text-center text-slate-400">{usersError ? 'Daftar akun tidak dapat dimuat. Lihat pesan di atas.' : 'Belum ada akun. Buat akun lewat formulir di atas; setelah disimpan, akun akan muncul di daftar ini.'}</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}

        {tab === 'loans' && (
          <div className="space-y-6">
            <header className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <p className="text-sm font-medium text-slate-500">Peminjaman barang</p>
              <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Peminjaman &amp; Pengembalian</h2>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">Setujui permintaan peminjaman, lalu catat kondisi barang saat dikembalikan.</p>
                </div>
                <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                  {loans.filter((l) => l.status !== 'Dikembalikan').length} transaksi aktif
                </span>
              </div>
            </header>

            <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:grid-cols-3 sm:gap-4">
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
                <table className="w-full min-w-[700px] text-left">
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
                                Setujui Peminjaman
                              </button>
                            )}
                            {l.status === 'Disetujui' && (
                              <>
                                <button onClick={() => handleCheckin(l, 'Bagus')} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300">
                                  Catat Pengembalian: Bagus
                                </button>
                                <button onClick={() => handleCheckin(l, 'Rusak')} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300">
                                  Catat Pengembalian: Rusak
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
            <header className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-5 sm:py-5 print:border-0 print:shadow-none">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Rekapitulasi inventaris</p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">Laporan Riwayat Peminjaman Aset</h2>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">Ringkasan seluruh transaksi peminjaman dan pengembalian aset.</p>
                </div>
                <button onClick={() => window.print()} className="w-fit rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900 print:hidden">
                  Cetak Laporan
                </button>
              </div>
            </header>

            <div className="grid grid-cols-2 gap-2 min-[420px]:gap-3 sm:gap-4 lg:grid-cols-4">
              {[
                { label: 'Total transaksi', count: loans.length, style: 'border-slate-200 bg-white text-slate-800', marker: 'bg-slate-500' },
                { label: 'Menunggu', count: loans.filter((l) => l.status === 'Menunggu').length, style: 'border-amber-200 bg-amber-50 text-amber-800', marker: 'bg-amber-500' },
                { label: 'Sedang dipinjam', count: loans.filter((l) => l.status === 'Disetujui').length, style: 'border-blue-200 bg-blue-50 text-blue-800', marker: 'bg-blue-500' },
                { label: 'Dikembalikan', count: loans.filter((l) => l.status === 'Dikembalikan').length, style: 'border-emerald-200 bg-emerald-50 text-emerald-800', marker: 'bg-emerald-500' },
              ].map((item) => (
                <div key={item.label} className={`rounded-xl border p-3 sm:p-4 ${item.style}`}>
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
                  <p className="mt-1 text-sm text-slate-500">{loans.length} transaksi tercatat</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left">
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
                          <p className="mt-1 text-sm text-slate-500">Data transaksi akan tampil di sini setelah peminjaman dibuat.</p>
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

      {showAssetModal && (
        <div onClick={() => { setShowAssetModal(false); resetForm(); }} className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/50 p-3 sm:items-center sm:p-4">
            <section onClick={(e) => e.stopPropagation()} className="my-auto w-full max-w-2xl border border-slate-300 bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-300 px-5 py-4">
              <div>
                <h3 className="font-bold text-slate-800">{editId ? 'Ubah Data Barang' : 'Tambah Barang Baru'}</h3>
                <p className="mt-1 text-sm text-slate-500">{editId ? 'Perbarui informasi barang yang dipilih.' : 'Lengkapi informasi berikut untuk menambahkan aset.'}</p>
              </div>
              <button type="button" aria-label="Tutup" onClick={() => { setShowAssetModal(false); resetForm(); }} className="text-xl leading-none text-slate-500 hover:text-slate-800">&times;</button>
            </div>
            <form onSubmit={handleSaveAsset} className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5">
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
              <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => { setShowAssetModal(false); resetForm(); }} className="w-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:w-auto">Batal</button>
                <button type="submit" className="w-full border border-blue-700 bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 sm:w-auto">{editId ? 'Simpan Perubahan' : 'Tambah Barang'}</button>
              </div>
            </form>
          </section>
        </div>
      )}

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
      {createdAssetName && (
        <div
          onClick={() => setCreatedAssetName('')}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-lg bg-white p-6 text-center shadow-xl"
          >
            <h2 className="text-lg font-bold">Barang Berhasil Ditambahkan</h2>
          </div>
        </div>
      )}
    </div>
  );
}

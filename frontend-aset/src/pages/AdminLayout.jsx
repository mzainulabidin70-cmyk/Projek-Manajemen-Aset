import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import { API_URL } from '../config';

async function request(path, method = 'GET', data) {
  const options = { method };

  if (data !== undefined) {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(data);
  }

  return fetch(`${API_URL}${path}`, options);
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const pathParts = pathname.split('/').filter(Boolean);
  const currentSection = pathParts[1] || 'home';
  const tab = currentSection === 'master' ? 'master' : currentSection;

  // Data yang dipakai bersama oleh halaman admin.
  const [categories, setCategories] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loans, setLoans] = useState([]);
  const [users, setUsers] = useState([]);
  const [dataError, setDataError] = useState('');
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
  const [currentUser] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [assetSearch, setAssetSearch] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [
        assetsResponse,
        categoriesResponse,
        roomsResponse,
        loansResponse,
        usersResponse,
      ] = await Promise.all([
        request('/assets'),
        request('/categories'),
        request('/rooms'),
        request('/loans'),
        request('/users'),
      ]);

      if (!assetsResponse.ok) throw new Error(`Gagal memuat aset (HTTP ${assetsResponse.status}).`);
      if (!categoriesResponse.ok) throw new Error(`Gagal memuat jenis barang (HTTP ${categoriesResponse.status}).`);
      if (!roomsResponse.ok) throw new Error(`Gagal memuat ruangan (HTTP ${roomsResponse.status}).`);
      if (!loansResponse.ok) throw new Error(`Gagal memuat peminjaman (HTTP ${loansResponse.status}).`);

      const [assetsData, categoriesData, roomsData, loansData] = await Promise.all([
        assetsResponse.json(),
        categoriesResponse.json(),
        roomsResponse.json(),
        loansResponse.json(),
      ]);
      if (
        !Array.isArray(assetsData)
        || !Array.isArray(categoriesData)
        || !Array.isArray(roomsData)
        || !Array.isArray(loansData)
      ) {
        throw new Error('Format data aset, master data, atau peminjaman dari backend tidak valid.');
      }

      setAssets(assetsData);
      setCategories(categoriesData);
      setRooms(roomsData);
      setLoans(loansData);
      setDataError('');

      if (!usersResponse.ok) {
        setUsers([]);
        setUsersError(`Gagal memuat akun (HTTP ${usersResponse.status}). Pastikan backend menyediakan GET /users.`);
        return;
      }

      const usersData = await usersResponse.json();
      const userList = Array.isArray(usersData) ? usersData : usersData.users || usersData.data;
      if (!Array.isArray(userList)) {
        setUsers([]);
        setUsersError('Respons endpoint /users bukan berupa daftar akun. Periksa format data dari backend.');
        return;
      }

      setUsers(userList);
      setUsersError('');
    } catch (error) {
      setDataError(`Tidak dapat memuat data dari backend: ${error.message}`);
    }
  }, []);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/');
      return;
    }

    fetchData();
  }, [currentUser, fetchData, navigate]);

  // Mengosongkan formulir aset setelah ditutup atau berhasil disimpan.
  const resetForm = () => {
    setEditId(null);
    setName('');
    setCategoryId('');
    setRoomId('');
    setCondition('Bagus');
  };

  // Simpan aset baru atau perubahan pada aset yang dipilih.
  const handleSaveAsset = async (event) => {
    event.preventDefault();
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

  const handleEditAsset = (asset) => {
    setEditId(asset.id);
    setName(asset.name);
    setCategoryId(asset.category_id || '');
    setRoomId(asset.room_id || '');
    setCondition(asset.condition);
    setShowAssetModal(true);
  };

  const handleDeleteAsset = async (id) => {
    if (!confirm('Hapus barang ini?')) return;
    await request(`/assets/${id}`, 'DELETE');
    fetchData();
  };

  // Tambah atau ubah data master.
  const addCategory = async (event) => {
    event.preventDefault();
    const path = editCategoryId ? `/categories/${editCategoryId}` : '/categories';
    await request(path, editCategoryId ? 'PUT' : 'POST', { name: newCat });
    setNewCat('');
    setEditCategoryId(null);
    fetchData();
  };

  const addRoom = async (event) => {
    event.preventDefault();
    const path = editRoomId ? `/rooms/${editRoomId}` : '/rooms';
    await request(path, editRoomId ? 'PUT' : 'POST', { name: newRoom });
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

  const addUser = async (event) => {
    event.preventDefault();
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
    await request(`/loans/${loan.id}/checkout`, 'PUT', { asset_id: loan.asset_id });
    fetchData();
  };

  const handleCheckin = async (loan, nextCondition) => {
    await request(`/loans/${loan.id}/checkin`, 'PUT', {
      asset_id: loan.asset_id,
      condition: nextCondition,
    });
    fetchData();
  };

  const searchText = assetSearch.trim().toLocaleLowerCase('id-ID');
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = !searchText || [asset.name, asset.category_name, asset.room_name]
      .some((value) => String(value || '').toLocaleLowerCase('id-ID').includes(searchText));
    return matchesSearch
      && (!conditionFilter || asset.condition === conditionFilter)
      && (!statusFilter || asset.status === statusFilter);
  });
  const borrowerUsers = users.filter((user) => ['user', 'peminjam', 'siswa', 'borrower'].includes(String(user.role || '').toLowerCase()));

  // Data dan fungsi yang dipakai oleh halaman admin di dalam Outlet.
  const context = {
    assets,
    categories,
    rooms,
    loans,
    users,
    borrowerUsers,
    usersError,
    userFormError,
    currentUser,
    filteredAssets,
    assetSearch,
    setAssetSearch,
    conditionFilter,
    setConditionFilter,
    statusFilter,
    setStatusFilter,
    resetForm,
    handleEditAsset,
    handleDeleteAsset,
    setShowAssetModal,
    newCat,
    setNewCat,
    editCategoryId,
    setEditCategoryId,
    addCategory,
    deleteCategory,
    newRoom,
    setNewRoom,
    editRoomId,
    setEditRoomId,
    addRoom,
    deleteRoom,
    userName,
    setUserName,
    userEmail,
    setUserEmail,
    userPass,
    setUserPass,
    addUser,
    handleCheckout,
    handleCheckin,
  };

  const logout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-100 md:flex-row">
      <AdminSidebar tab={tab} currentUser={currentUser} onLogout={logout} />
      <main className="min-w-0 flex-1 bg-slate-50">
        <div className="mx-auto w-full max-w-6xl p-3 sm:p-5 md:p-6">
          {dataError && <p role="alert" className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{dataError}</p>}
          <Outlet context={context} />
        </div>
      </main>

      {showAssetModal && (
        <div onClick={() => { setShowAssetModal(false); resetForm(); }} className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/50 p-3 sm:items-center sm:p-4">
          <section onClick={(event) => event.stopPropagation()} className="my-auto w-full max-w-2xl border border-slate-300 bg-white shadow-xl">
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
                <input required value={name} onChange={(event) => setName(event.target.value)} className="h-11 w-full border border-slate-300 px-3 text-sm" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Jenis Barang</span>
                <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="h-11 w-full border border-slate-300 px-3 text-sm">
                  <option value="">-- Pilih Jenis --</option>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Ruangan</span>
                <select value={roomId} onChange={(event) => setRoomId(event.target.value)} className="h-11 w-full border border-slate-300 px-3 text-sm">
                  <option value="">-- Pilih Ruangan --</option>
                  {rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Kondisi</span>
                <select value={condition} onChange={(event) => setCondition(event.target.value)} className="h-11 w-full border border-slate-300 px-3 text-sm">
                  <option value="Bagus">Bagus</option>
                  <option value="Rusak">Rusak</option>
                </select>
              </label>
              <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => { setShowAssetModal(false); resetForm(); }} className="border border-slate-300 px-5 py-2.5 text-sm font-semibold">Batal</button>
                <button type="submit" className="bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">{editId ? 'Simpan Perubahan' : 'Tambah Barang'}</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {createdUserName && (
        <div onClick={() => setCreatedUserName('')} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div onClick={(event) => event.stopPropagation()} className="w-full max-w-sm rounded-lg bg-white p-6 text-center shadow-xl">
            <h2 className="mb-2 text-lg font-bold">Akun Berhasil Dibuat</h2>
            <p>Akun peminjam {createdUserName} berhasil ditambahkan.</p>
            <p className="mt-3 text-sm text-gray-500">Klik di luar pop-up untuk menutup.</p>
          </div>
        </div>
      )}
      {createdAssetName && (
        <div onClick={() => setCreatedAssetName('')} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div onClick={(event) => event.stopPropagation()} className="w-full max-w-sm rounded-lg bg-white p-6 text-center shadow-xl">
            <h2 className="text-lg font-bold">Barang Berhasil Ditambahkan</h2>
          </div>
        </div>
      )}
    </div>
  );
}

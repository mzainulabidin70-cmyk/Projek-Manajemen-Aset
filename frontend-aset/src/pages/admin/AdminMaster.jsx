import { Link, useParams, useOutletContext } from 'react-router-dom';

const masterMenus = [
  { id: 'categories', label: 'Jenis Barang' },
  { id: 'rooms', label: 'Daftar Ruangan' },
  { id: 'users', label: 'Buat Akun Peminjam' },
];

function getRelatedAssets(assets, field, id) {
  return assets.filter((asset) => String(asset[field]) === String(id));
}

export default function AdminMaster() {
  const { section = 'categories' } = useParams();
  const {
    assets, categories, rooms, borrowerUsers, usersError, userFormError,
    newCat, setNewCat, editCategoryId, setEditCategoryId, addCategory, deleteCategory,
    newRoom, setNewRoom, editRoomId, setEditRoomId, addRoom, deleteRoom,
    userName, setUserName, userEmail, setUserEmail, userPass, setUserPass, addUser,
  } = useOutletContext();

  const selectedMenu = masterMenus.some((menu) => menu.id === section)
    ? section
    : 'categories';

  return (
    <div className="space-y-6">
      <header className="border border-slate-300 bg-white p-4 sm:p-5">
        <p className="text-sm font-medium text-blue-700">Pengaturan inventaris</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">Master Data</h2>
        <p className="mt-2 text-sm text-slate-600">Kelola jenis barang, ruangan, dan akun peminjam.</p>
      </header>

      <nav className="flex gap-2 overflow-x-auto border-b border-slate-300" aria-label="Menu master data">
        {masterMenus.map((menu) => (
          <Link
            key={menu.id}
            to={`/admin/master/${menu.id}`}
            aria-current={selectedMenu === menu.id ? 'page' : undefined}
            className={`shrink-0 border-b-2 px-3 py-3 text-sm font-semibold ${
              selectedMenu === menu.id ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {menu.label}
          </Link>
        ))}
      </nav>

      {selectedMenu === 'categories' && (
        <section className="border border-slate-300 bg-white">
          <div className="flex items-center justify-between border-b border-slate-300 px-4 py-4">
            <h3 className="text-lg font-bold text-slate-800">Jenis Barang</h3>
            <span className="bg-slate-100 px-3 py-1 text-sm text-slate-700">{categories.length} data</span>
          </div>
          <div className="space-y-4 p-4">
            <form onSubmit={addCategory} className="flex flex-col gap-2 sm:flex-row">
              <input
                required
                placeholder="Contoh: Buku"
                value={newCat}
                onChange={(event) => setNewCat(event.target.value)}
                className="min-w-0 flex-1 border border-slate-300 px-3 py-2.5 text-sm"
              />
              <button className="bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">{editCategoryId ? 'Simpan Perubahan' : 'Tambah Jenis'}</button>
              {editCategoryId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditCategoryId(null);
                    setNewCat('');
                  }}
                  className="border border-slate-300 px-5 py-2.5 text-sm"
                >
                  Batal
                </button>
              )}
            </form>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] table-fixed text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="w-1/2 px-3 py-2">Jenis Barang</th>
                    <th className="w-1/4 px-3 py-2 text-center">Jumlah</th>
                    <th className="w-1/4 px-3 py-2 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {categories.length ? categories.map((category) => {
                    const relatedAssets = getRelatedAssets(assets, 'category_id', category.id);
                    return (
                      <tr key={category.id}>
                        <td className="px-3 py-3 font-semibold">{category.name}</td>
                        <td className="px-3 py-3 text-center">{relatedAssets.length} barang</td>
                        <td className="px-3 py-3">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => {
                                setEditCategoryId(category.id);
                                setNewCat(category.name);
                              }}
                              className="bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white"
                            >
                              Ubah
                            </button>
                            <button
                              onClick={() => deleteCategory(category.id)}
                              className="bg-red-600 px-3 py-1.5 text-xs font-semibold text-white"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }) : <tr><td colSpan="3" className="py-8 text-center text-slate-500">Belum ada jenis barang.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {selectedMenu === 'rooms' && (
        <section className="border border-slate-300 bg-white">
          <div className="flex items-center justify-between border-b border-slate-300 px-4 py-4">
            <h3 className="text-lg font-bold text-slate-800">Daftar Ruangan</h3>
            <span className="bg-slate-100 px-3 py-1 text-sm text-slate-700">{rooms.length} data</span>
          </div>
          <div className="space-y-4 p-4">
            <form onSubmit={addRoom} className="flex flex-col gap-2 sm:flex-row">
              <input
                required
                placeholder="Contoh: Ruang kelas 1"
                value={newRoom}
                onChange={(event) => setNewRoom(event.target.value)}
                className="min-w-0 flex-1 border border-slate-300 px-3 py-2.5 text-sm"
              />
              <button className="bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">{editRoomId ? 'Simpan Perubahan' : 'Tambah Ruangan'}</button>
              {editRoomId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditRoomId(null);
                    setNewRoom('');
                  }}
                  className="border border-slate-300 px-5 py-2.5 text-sm"
                >
                  Batal
                </button>
              )}
            </form>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] table-fixed text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="w-1/2 px-3 py-2">Ruangan</th>
                    <th className="w-1/4 px-3 py-2 text-center">Jumlah</th>
                    <th className="w-1/4 px-3 py-2 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {rooms.length ? rooms.map((room) => {
                    const relatedAssets = getRelatedAssets(assets, 'room_id', room.id);
                    return (
                      <tr key={room.id}>
                        <td className="px-3 py-3 font-semibold">{room.name}</td>
                        <td className="px-3 py-3 text-center">{relatedAssets.length} barang</td>
                        <td className="px-3 py-3">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => {
                                setEditRoomId(room.id);
                                setNewRoom(room.name);
                              }}
                              className="bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white"
                            >
                              Ubah
                            </button>
                            <button
                              onClick={() => deleteRoom(room.id)}
                              className="bg-red-600 px-3 py-1.5 text-xs font-semibold text-white"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }) : <tr><td colSpan="3" className="py-8 text-center text-slate-500">Belum ada ruangan.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {selectedMenu === 'users' && (
        <section className="w-full max-w-2xl border border-slate-300 bg-white">
          <div className="border-b border-slate-300 p-4">
            <h3 className="text-lg font-bold text-slate-800">Buat Akun Peminjam</h3>
            <p className="mt-1 text-sm text-slate-500">Isi nama, email, dan password untuk membuat akun.</p>
          </div>
          <form onSubmit={addUser} className="space-y-3 p-4">
            <input required placeholder="Nama Siswa/Siswi" value={userName} onChange={(event) => setUserName(event.target.value)} className="w-full border border-slate-300 px-3 py-2.5 text-sm" />
            <input required type="email" placeholder="Email" value={userEmail} onChange={(event) => setUserEmail(event.target.value)} className="w-full border border-slate-300 px-3 py-2.5 text-sm" />
            <input required type="password" placeholder="Password" value={userPass} onChange={(event) => setUserPass(event.target.value)} className="w-full border border-slate-300 px-3 py-2.5 text-sm" />
            <button className="bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">Simpan Akun</button>
          </form>
          <div className="border-t border-slate-200 p-4">
            <h4 className="mb-3 font-semibold text-slate-800">Daftar akun peminjam ({borrowerUsers.length})</h4>
            {userFormError && <p role="alert" className="mb-3 bg-red-50 px-3 py-2 text-sm text-red-700">{userFormError}</p>}
            {usersError && <p role="alert" className="mb-3 bg-amber-50 px-3 py-2 text-sm text-amber-800">{usersError}</p>}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-3 py-2">Nama</th><th className="px-3 py-2">Email</th><th className="px-3 py-2">Peran</th></tr></thead>
                <tbody className="divide-y divide-slate-200">
                  {borrowerUsers.length ? borrowerUsers.map((user) => <tr key={user.id}><td className="px-3 py-3">{user.name || '-'}</td><td className="px-3 py-3">{user.email || '-'}</td><td className="px-3 py-3">Peminjam</td></tr>) : <tr><td colSpan="3" className="py-8 text-center text-slate-500">Belum ada akun peminjam.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

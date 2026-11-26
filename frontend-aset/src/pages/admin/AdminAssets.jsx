import { useOutletContext } from 'react-router-dom';

export default function AdminAssets() {
  const {
    assets, loans, filteredAssets, assetSearch, setAssetSearch,
    conditionFilter, setConditionFilter, statusFilter, setStatusFilter,
    resetForm, setShowAssetModal, handleEditAsset, handleDeleteAsset,
  } = useOutletContext();

  const summaries = [
    { label: 'Total aset', count: assets.length, style: 'border-blue-700 bg-blue-700 text-white' },
    { label: 'Kondisi bagus', count: assets.filter((asset) => asset.condition === 'Bagus').length, style: 'border-emerald-700 bg-emerald-700 text-white' },
    { label: 'Perlu diperiksa', count: assets.filter((asset) => asset.condition === 'Rusak').length, style: 'border-amber-700 bg-amber-700 text-white' },
    { label: 'Sedang dipinjam', count: assets.filter((asset) => asset.status && !['Tersedia', 'Dikembalikan'].includes(asset.status)).length, style: 'border-violet-700 bg-violet-700 text-white' },
  ];
  const conditions = [...new Set(assets.map((asset) => asset.condition).filter(Boolean))];
  const statuses = [...new Set(assets.map((asset) => asset.status).filter(Boolean))];

  return (
    <div className="space-y-6">
      <header className="border border-slate-300 bg-white px-4 py-4 sm:px-5 sm:py-5">
        <p className="text-sm font-medium text-blue-700">Inventaris sekolah</p>
        <div className="mt-1 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Daftar Barang</h2>
            <p className="mt-1 text-sm text-slate-500">Kelola data aset beserta jenis, lokasi, dan kondisinya.</p>
          </div>
          <button type="button" onClick={() => { resetForm(); setShowAssetModal(true); }} className="bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">
            Tambah Barang
          </button>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Ringkasan kondisi inventaris">
        {summaries.map((item) => (
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
            <p className="mt-1 text-sm text-slate-500">Cari dan filter aset berdasarkan nama, jenis, ruangan, kondisi, atau status.</p>
          </div>
          <span className="shrink-0 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{filteredAssets.length} / {assets.length}</span>
        </div>
        <div className="grid grid-cols-1 gap-2 border-b border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-3">
          <input aria-label="Cari aset" value={assetSearch} onChange={(event) => setAssetSearch(event.target.value)} placeholder="Cari nama, jenis, ruangan..." className="border border-slate-300 bg-white px-3 py-2.5 text-sm sm:col-span-2 lg:col-span-1" />
          <select aria-label="Filter kondisi" value={conditionFilter} onChange={(event) => setConditionFilter(event.target.value)} className="border border-slate-300 bg-white px-3 py-2.5 text-sm">
            <option value="">Semua kondisi</option>
            {conditions.map((condition) => <option key={condition} value={condition}>{condition}</option>)}
          </select>
          <select aria-label="Filter status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="border border-slate-300 bg-white px-3 py-2.5 text-sm">
            <option value="">Semua status</option>
            {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
              <tr>
                {['Nama Barang', 'Jenis', 'Ruangan', 'Kondisi', 'Status', 'Dipinjam oleh', 'Aksi'].map((heading) => <th key={heading} className="px-4 py-3 font-semibold">{heading}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredAssets.length ? filteredAssets.map((asset) => (
                <tr key={asset.id} className="text-sm hover:bg-blue-50/40">
                  <td className="px-4 py-4 font-semibold text-slate-800">{asset.name}</td>
                  <td className="px-4 py-4 text-slate-600">{asset.category_name || '-'}</td>
                  <td className="px-4 py-4 text-slate-600">{asset.room_name || '-'}</td>
                  <td className="px-4 py-4">{asset.condition}</td>
                  <td className="px-4 py-4">{asset.status}</td>
                  <td className="px-4 py-4 text-slate-600">{loans.find((loan) => String(loan.asset_id) === String(asset.id) && loan.status === 'Disetujui')?.user_name || '-'}</td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEditAsset(asset)} className="bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600">Edit</button>
                      <button onClick={() => handleDeleteAsset(asset.id)} className="bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700">Hapus</button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="7" className="px-5 py-12 text-center text-slate-500">{assets.length ? 'Aset tidak ditemukan.' : 'Belum ada barang terdaftar.'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

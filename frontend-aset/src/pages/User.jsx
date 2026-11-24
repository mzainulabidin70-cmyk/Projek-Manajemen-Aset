import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

export default function User() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [assets, setAssets] = useState([]);
  const [assetInitial, setAssetInitial] = useState('');
  const [myLoans, setMyLoans] = useState([]);
  const [borrowingAssets, setBorrowingAssets] = useState([]);
  const [reportingLoans, setReportingLoans] = useState([]);
  const [deletingLoans, setDeletingLoans] = useState([]);
  const [loanToCancel, setLoanToCancel] = useState(null);
  const [cancelError, setCancelError] = useState('');
  const [borrowMessage, setBorrowMessage] = useState('');
  const borrowingLock = useRef(new Set());
  const reportingLock = useRef(new Set());
  const deletingLock = useRef(new Set());

  // Mengambil daftar barang tersedia dan riwayat pinjaman pengguna.
  const fetchData = async (userId) => {
    const [resA, resL] = await Promise.all([
      fetch(`${API_URL}/assets`),
      fetch(`${API_URL}/loans`),
    ]);

    const allAssets = await resA.json();
    const allLoans = await resL.json();

    setAssets(allAssets.filter((a) => a.status === 'Tersedia' && a.condition === 'Bagus'));

    setMyLoans(allLoans.filter((l) => l.user_id === userId));
  };

  // Memeriksa apakah barang sudah diajukan oleh pengguna.
  const hasLoanForAsset = (assetId) =>
    myLoans.some((loan) => String(loan.asset_id) === String(assetId));

  // Memeriksa login pengguna dan memuat data awal.
  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem('user'));
    if (!loggedUser || loggedUser.role !== 'user') {
      navigate('/');
      return;
    }
    setUser(loggedUser);
    fetchData(loggedUser.id);
  }, []);

  // Mengirim pengajuan peminjaman barang.
  const handleBorrow = async (assetId) => {
    if (borrowingLock.current.has(assetId) || hasLoanForAsset(assetId)) return;
    borrowingLock.current.add(assetId);
    setBorrowingAssets(a => [...a, assetId]);
    try {
      const res = await fetch(`${API_URL}/loans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asset_id: assetId, user_id: user.id })
      });
      if (!res.ok) throw new Error();
      setBorrowMessage('Permintaan pinjam terkirim! Silakan tunggu persetujuan Admin.');
      await fetchData(user.id);
    } finally {
      borrowingLock.current.delete(assetId);
      setBorrowingAssets(a => a.filter(id => id !== assetId));
    }
  };

  // Mengirim laporan kerusakan barang.
  const handleReportDamage = async (loanId) => {
    if (reportingLock.current.has(loanId)) return;
    const note = prompt('Tuliskan keterangan kerusakan barang:');
    if (!note) return;
    reportingLock.current.add(loanId);
    setReportingLoans(a => [...a, loanId]);
    try {
      await fetch(`${API_URL}/loans/${loanId}/damage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ damage_report: note })
      });
      alert('Laporan kerusakan berhasil dikirim ke Admin.');
      await fetchData(user.id);
    } finally {
      reportingLock.current.delete(loanId);
      setReportingLoans(a => a.filter(id => id !== loanId));
    }
  };

  // Membatalkan pengajuan peminjaman.
  const handleCancelLoan = async (loanId) => {
    if (deletingLock.current.has(loanId)) return;
    deletingLock.current.add(loanId);
    setDeletingLoans(a => [...a, loanId]);
    try {
      const res = await fetch(`${API_URL}/loans/${loanId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      await fetchData(user.id);
      setLoanToCancel(null);
    } catch (e) {
      setCancelError(e.message || 'Gagal membatalkan pengajuan pinjam.');
    } finally {
      deletingLock.current.delete(loanId);
      setDeletingLoans(a => a.filter(id => id !== loanId));
    }
  };

  // Keluar dari akun.
  const logout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  // Menampilkan barang sesuai kata pencarian.
  const filteredAssets = assets.filter(asset =>
    asset.name?.toLowerCase().includes(assetInitial.trim().toLowerCase())
  );

  return (
    <div className="min-h-screen bg-stone-100 text-gray-800">
      {/* Header dan tombol keluar */}
      <div className="border-b-4 border-green-900 bg-green-800 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-green-200">Manajemen Aset</p>
            <h1 className="text-xl font-bold sm:text-2xl">Dashboard Peminjam Aset</h1>
            <p className="mt-1 text-sm text-green-100">Selamat datang, {user?.name}</p>
          </div>
          <button onClick={logout} className="border border-green-200/50 px-4 py-2 text-sm font-medium hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-white">
            Keluar
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-7 sm:px-8 sm:py-9">
        <div className="border border-stone-500 bg-white px-5 py-4 shadow-sm">
          <h2 className="font-semibold text-gray-800">Ringkasan akun</h2>
          <p className="mt-1 text-sm text-gray-600">
            Tersedia <span className="font-semibold text-green-800">{assets.length} barang</span> untuk diajukan dan Anda memiliki <span className="font-semibold text-green-800">{myLoans.length} riwayat peminjaman</span>.
          </p>
        </div>

        {/* Daftar barang yang dapat dipinjam */}
        <section className="overflow-hidden border border-stone-500 bg-white shadow-sm">
          <div className="border-b border-stone-300 px-5 py-4 sm:px-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-bold text-gray-800">Barang tersedia</h2>
              <span className="text-sm text-gray-500">{filteredAssets.length} barang ditampilkan</span>
            </div>
            <p className="mt-1 text-sm text-gray-600">Pilih barang yang ingin Anda ajukan untuk dipinjam.</p>
          </div>
          <div className="p-5 sm:px-6">
          <label htmlFor="asset-initial" className="mb-4 block text-sm font-medium text-gray-700">
            Cari nama barang
            <input
              id="asset-initial"
              type="search"
              value={assetInitial}
              onChange={(event) => setAssetInitial(event.target.value)}
              placeholder="Masukkan nama barang"
              className="mt-1.5 block w-full max-w-sm border border-stone-500 bg-stone-50 p-2.5 font-normal placeholder:text-gray-400 focus:border-green-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-green-700"
            />
          </label>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-stone-100 text-xs uppercase tracking-wide text-gray-600">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Nama Barang</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Jenis</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Lokasi Ruangan</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((a) => (
                  <tr key={a.id} className="border-t border-stone-300 hover:bg-stone-50">
                    <td className="px-4 py-3.5 font-medium text-gray-800">{a.name}</td>
                    <td className="px-4 py-3.5 text-gray-600">{a.category_name || '-'}</td>
                    <td className="px-4 py-3.5 text-gray-600">{a.room_name || '-'}</td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <button
                        onClick={() => handleBorrow(a.id)}
                        disabled={
                          borrowingAssets.includes(a.id) || hasLoanForAsset(a.id)
                        }
                        className="bg-green-800 px-3.5 py-2 text-sm font-medium text-white hover:bg-green-900 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
                      >
                        {borrowingAssets.includes(a.id)
                          ? 'Mengirim...'
                          : hasLoanForAsset(a.id)
                            ? 'Sudah Diajukan'
                            : 'Ajukan Pinjam'}
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredAssets.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                      {assets.length === 0
                        ? 'Tidak ada barang yang tersedia saat ini.'
                        : 'Tidak ada barang dengan nama tersebut.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          </div>
        </section>

        {/* Daftar pinjaman dan riwayat pengguna */}
        <section className="overflow-hidden border border-stone-500 bg-white shadow-sm">
          <div className="border-b border-stone-300 px-5 py-4 sm:px-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-bold text-gray-800">Pinjaman &amp; riwayat saya</h2>
              <span className="text-sm text-gray-500">{myLoans.length} pengajuan</span>
            </div>
            <p className="mt-1 text-sm text-gray-600">Pantau status pengajuan dan catatan barang yang Anda pinjam.</p>
          </div>
          <div className="p-5 sm:px-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-stone-100 text-xs uppercase tracking-wide text-gray-600">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Barang</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Tanggal Pinjam</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Status</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Catatan Kerusakan</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {myLoans.map((l) => (
                  <tr key={l.id} className="border-t border-stone-300 hover:bg-stone-50">
                    <td className="px-4 py-3.5 font-medium text-gray-800">
                      {l.asset_name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-gray-600">{new Date(l.borrow_date).toLocaleDateString('id-ID')}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-block border px-2.5 py-1 text-xs font-medium ${l.status === 'Disetujui' ? 'border-green-200 bg-green-50 text-green-800' : (l.status === 'Ditolak' ? 'border-red-200 bg-red-50 text-red-700' : 'border-amber-200 bg-amber-50 text-amber-800')}`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">{l.damage_report || '-'}</td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      {l.status === 'Disetujui' && (
                        <button
                          onClick={() => handleReportDamage(l.id)}
                          disabled={reportingLoans.includes(l.id)}
                          className="border border-orange-300 bg-orange-50 px-3 py-2 text-sm font-medium text-orange-800 hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {reportingLoans.includes(l.id) ? 'Mengirim...' : 'Lapor Rusak'}
                        </button>
                      )}
                      {(l.status === 'Menunggu' || l.status === 'Menunggu Persetujuan' || l.status === 'Pending') && (
                        <button
                          onClick={() => {
                            setLoanToCancel(l);
                            setCancelError('');
                          }}
                          disabled={deletingLoans.includes(l.id)}
                          className="ml-2 border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingLoans.includes(l.id) ? 'Menghapus...' : 'Batalkan'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {myLoans.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                      Belum ada riwayat peminjaman.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          </div>
        </section>
      </main>

      {/* Pesan setelah pengajuan pinjam berhasil */}
      {borrowMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4"
          onClick={() => setBorrowMessage('')}
        >
          <div
            className="w-full max-w-sm border border-stone-500 bg-white p-6 text-center shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-label="Permintaan pinjam berhasil"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-green-800">{borrowMessage}</p>
          </div>
        </div>
      )}

      {/* Konfirmasi pembatalan pengajuan pinjam */}
      {loanToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
          <div className="w-full max-w-sm border border-stone-500 bg-white p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="cancel-loan-title">
            <h2 id="cancel-loan-title" className="mb-2 text-lg font-bold text-gray-800">
              Batalkan pengajuan pinjam?
            </h2>
            <p className="mb-4 text-sm text-gray-600">
              Anda yakin ingin membatalkan pengajuan pinjam {loanToCancel.asset_name || 'ini'}?
            </p>
            {cancelError && <p className="mb-4 text-sm text-red-600">{cancelError}</p>}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setLoanToCancel(null)}
                disabled={deletingLoans.includes(loanToCancel.id)}
                className="bg-gray-200 px-4 py-2 text-sm text-gray-800 hover:bg-gray-300 disabled:opacity-50"
              >
                Kembali
              </button>
              <button
                onClick={() => handleCancelLoan(loanToCancel.id)}
                disabled={deletingLoans.includes(loanToCancel.id)}
                className="bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600 disabled:opacity-50"
              >
                {deletingLoans.includes(loanToCancel.id) ? 'Membatalkan...' : 'Ya, batalkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

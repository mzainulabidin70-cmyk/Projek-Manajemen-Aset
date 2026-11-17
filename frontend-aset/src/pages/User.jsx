import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

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
      fetch('http://localhost:3000/assets'),
      fetch('http://localhost:3000/loans'),
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
      const res = await fetch('http://localhost:3000/loans', {
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
      await fetch(`http://localhost:3000/loans/${loanId}/damage`, {
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
      const res = await fetch(`http://localhost:3000/loans/${loanId}`, { method: 'DELETE' });
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
    <div className="min-h-screen bg-gray-100">
      {/* Header dan tombol keluar */}
      <div className="bg-green-700 text-white p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Dashboard Peminjam Aset</h1>
          <p className="text-sm text-green-100">Halo, {user?.name}</p>
        </div>
        <button onClick={logout} className="bg-red-500 px-3 py-1 rounded text-sm hover:bg-red-600">
          Keluar
        </button>
      </div>

      <div className="p-6 max-w-5xl mx-auto space-y-8">
        {/* Daftar barang yang dapat dipinjam */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-bold mb-4 text-gray-800">Daftar Barang Tersedia (Siap Dipinjam)</h2>
          <label htmlFor="asset-initial" className="mb-3 block text-sm text-gray-700">
            Cari nama barang
            <input
              id="asset-initial"
              type="search"
              value={assetInitial}
              onChange={(event) => setAssetInitial(event.target.value)}
              placeholder="Masukkan nama barang"
              className="mt-1 block w-full max-w-sm rounded border border-gray-300 p-2"
            />
          </label>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-3">Kode</th>
                  <th className="p-3">Nama Barang</th>
                  <th className="p-3">Jenis</th>
                  <th className="p-3">Lokasi Ruangan</th>
                  <th className="p-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((a) => (
                  <tr key={a.id} className="border-t">
                    <td className="p-3 font-medium">{a.name}</td>
                    <td className="p-3">{a.category_name || '-'}</td>
                    <td className="p-3">{a.room_name || '-'}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleBorrow(a.id)}
                        disabled={
                          borrowingAssets.includes(a.id) || hasLoanForAsset(a.id)
                        }
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <td colSpan="5" className="p-4 text-center text-gray-500">
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

        {/* Daftar pinjaman dan riwayat pengguna */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-bold mb-4 text-gray-800">Pinjaman & Riwayat Saya</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-3">Barang</th>
                  <th className="p-3">Tanggal Pinjam</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Catatan Kerusakan</th>
                  <th className="p-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {myLoans.map((l) => (
                  <tr key={l.id} className="border-t">
                    <td className="p-3 font-medium">
                      {l.asset_name}
                    </td>
                    <td className="p-3">{new Date(l.borrow_date).toLocaleDateString('id-ID')}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                        {l.status}
                      </span>
                    </td>
                    <td className="p-3 text-red-600">{l.damage_report || '-'}</td>
                    <td className="p-3">
                      {l.status === 'Disetujui' && (
                        <button
                          onClick={() => handleReportDamage(l.id)}
                          disabled={reportingLoans.includes(l.id)}
                          className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
                          className="ml-2 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingLoans.includes(l.id) ? 'Menghapus...' : 'Batalkan'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {myLoans.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-gray-500">
                      Belum ada riwayat peminjaman.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pesan setelah pengajuan pinjam berhasil */}
      {borrowMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setBorrowMessage('')}
        >
          <div
            className="w-full max-w-sm rounded-lg bg-white p-6 text-center shadow-xl"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="cancel-loan-title">
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
                className="rounded bg-gray-200 px-4 py-2 text-sm text-gray-800 hover:bg-gray-300 disabled:opacity-50"
              >
                Kembali
              </button>
              <button
                onClick={() => handleCancelLoan(loanToCancel.id)}
                disabled={deletingLoans.includes(loanToCancel.id)}
                className="rounded bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600 disabled:opacity-50"
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

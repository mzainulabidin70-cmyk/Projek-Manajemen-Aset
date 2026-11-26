import { useOutletContext } from 'react-router-dom';

export default function AdminLoans() {
  const { loans, handleCheckout, handleCheckin } = useOutletContext();
  const activeLoans = loans.filter((loan) => loan.status !== 'Dikembalikan');

  return (
    <div className="space-y-6">
      <header className="border border-slate-300 bg-white p-5">
        <p className="text-sm font-medium text-blue-700">Peminjaman barang</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">Peminjaman &amp; Pengembalian</h2>
        <p className="mt-1 text-sm text-slate-500">Setujui permintaan dan catat kondisi barang saat dikembalikan.</p>
        <p className="mt-3 text-sm font-medium text-slate-600">{activeLoans.length} transaksi aktif</p>
      </header>
      <section className="overflow-hidden border border-slate-300 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="font-bold text-slate-800">Daftar peminjaman</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>{['Peminjam', 'Barang', 'Status', 'Catatan kerusakan', 'Tindakan'].map((title) => <th key={title} className="px-5 py-3 font-semibold">{title}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeLoans.length ? activeLoans.map((loan) => {
                const isWaiting = loan.status === 'Menunggu';
                const isApproved = loan.status === 'Disetujui';

                return (
                  <tr key={loan.id}>
                    <td className="px-5 py-4 font-medium">{loan.user_name}</td>
                    <td className="px-5 py-4">{loan.asset_name}</td>
                    <td className="px-5 py-4">{loan.status}</td>
                    <td className="px-5 py-4 text-red-700">{loan.damage_report || 'Tidak ada'}</td>
                    <td className="px-5 py-4">
                      <div className="flex min-w-max gap-2">
                        {isWaiting && (
                          <button
                            onClick={() => handleCheckout(loan)}
                            className="bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                          >
                            Setujui Peminjaman
                          </button>
                        )}
                        {isApproved && (
                          <>
                            <button
                              onClick={() => handleCheckin(loan, 'Bagus')}
                              className="bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                            >
                              Kembali: Bagus
                            </button>
                            <button
                              onClick={() => handleCheckin(loan, 'Rusak')}
                              className="bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                            >
                              Kembali: Rusak
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center text-slate-500">
                    Tidak ada peminjaman yang perlu ditangani.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

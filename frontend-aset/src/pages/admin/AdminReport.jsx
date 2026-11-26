import { useOutletContext } from 'react-router-dom';

export default function AdminReport() {
  const { loans } = useOutletContext();

  const statuses = [
    {
      label: 'Total transaksi',
      style: 'bg-emerald-700',
      count: loans.length,
    },
    {
      label: 'Menunggu',
      style: 'bg-amber-500',
      count: loans.filter((loan) => loan.status === 'Menunggu').length,
    },
    {
      label: 'Sedang dipinjam',
      style: 'bg-blue-700',
      count: loans.filter((loan) => loan.status === 'Disetujui').length,
    },
    {
      label: 'Dikembalikan',
      style: 'bg-slate-700',
      count: loans.filter((loan) => loan.status === 'Dikembalikan').length,
    },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 border border-slate-300 bg-white p-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-blue-700">Rekapitulasi inventaris</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Laporan Riwayat Peminjaman Aset</h2>
          <p className="mt-1 text-sm text-slate-500">Ringkasan transaksi peminjaman dan pengembalian aset.</p>
        </div>
        <button onClick={() => window.print()} className="w-fit bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-900 print:hidden">Cetak Laporan</button>
      </header>
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statuses.map((status) => (
          <div key={status.label} className={`border border-transparent p-4 text-white ${status.style}`}>
            <p className="text-sm text-white/90">{status.label}</p>
            <p className="mt-2 text-2xl font-bold">{status.count}</p>
          </div>
        ))}
      </section>
      <section className="overflow-x-auto border border-slate-300 bg-white">
        <table className="w-full min-w-[720px] text-left">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>{['Nama Peminjam', 'Barang', 'Tgl Pinjam', 'Tgl Kembali', 'Status', 'Laporan Kerusakan'].map((title) => <th key={title} className="px-5 py-3 font-semibold">{title}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loans.length ? loans.map((loan) => (
              <tr key={loan.id} className="text-sm">
                <td className="px-5 py-4 font-medium">{loan.user_name}</td>
                <td className="px-5 py-4">{loan.asset_name}</td>
                <td className="px-5 py-4">
                  {new Date(loan.borrow_date).toLocaleDateString('id-ID')}
                </td>
                <td className="px-5 py-4">
                  {loan.return_date
                    ? new Date(loan.return_date).toLocaleDateString('id-ID')
                    : '-'}
                </td>
                <td className="px-5 py-4">{loan.status}</td>
                <td className="px-5 py-4 text-red-700">{loan.damage_report || 'Tidak ada'}</td>
              </tr>
            )) : <tr><td colSpan="6" className="px-5 py-12 text-center text-slate-500">Belum ada riwayat peminjaman.</td></tr>}
          </tbody>
        </table>
      </section>
    </div>
  );
}

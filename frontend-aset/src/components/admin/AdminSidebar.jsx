import { Link } from 'react-router-dom';

const menuItems = [
  {
    id: 'home',
    label: 'Beranda',
    path: '/admin',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 shrink-0" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-6h-4v6H4a1 1 0 0 1-1-1V10Z" /></svg>,
  },
  {
    id: 'daftar-barang',
    label: 'Daftar Barang',
    path: '/admin/daftar-barang',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 shrink-0" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 7.5 7.5 4.2 7.5-4.2M12 12v9" /></svg>,
  },
  {
    id: 'master',
    label: 'Master Data',
    path: '/admin/master/categories',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 shrink-0" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M8 4h8l3 3v13H5V4h3Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 4v4h8V4M8 12h8M8 16h5" /></svg>,
  },
  {
    id: 'transaksi',
    label: 'Transaksi',
    path: '/admin/transaksi',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 shrink-0" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h12l-3-3M17 17H5l3 3M19 7a7 7 0 0 1 1 8M5 17a7 7 0 0 1-1-8" /></svg>,
  },
  {
    id: 'laporan',
    label: 'Laporan',
    path: '/admin/laporan',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 shrink-0" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4 20V4m0 16h16M8 16v-5m5 5V7m5 9v-8" /></svg>,
  },
];

const roleLabels = {
  guru: 'Guru',
  admin: 'Admin',
};

export default function AdminSidebar({ tab, currentUser, onLogout }) {
  return (
    <aside className="flex w-full shrink-0 flex-col bg-blue-800 text-white print:hidden md:min-h-screen md:w-64">
      <h1 className="flex items-center justify-between border-b border-white px-4 py-3 text-lg font-bold md:block md:p-5 md:text-xl">
        Dashboard
        <button onClick={onLogout} className="rounded bg-red-500 px-3 py-1.5 text-xs font-medium hover:bg-red-600 md:hidden">
          Keluar
        </button>
      </h1>
      {currentUser && (
        <div className="border-b border-blue-700 px-4 py-3 text-sm md:px-5">
          <p className="font-semibold">{currentUser.name || currentUser.email}</p>
          <p className="mt-0.5 text-xs text-blue-200">
            Masuk sebagai {roleLabels[currentUser.role] || 'Pengguna'}
          </p>
        </div>
      )}
      <nav className="grid grid-cols-2 gap-2 p-3 md:block md:flex-1 md:space-y-1 md:p-3" aria-label="Menu admin">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            aria-current={tab === item.id ? 'page' : undefined}
            className={`flex min-h-12 w-full items-center gap-3 rounded px-3 py-2.5 text-left text-xs font-medium leading-snug sm:text-sm md:min-h-0 md:px-4 md:py-3 md:text-base ${
              tab === item.id ? 'bg-blue-600 text-white' : 'text-blue-100 hover:bg-blue-700 hover:text-white'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <button onClick={onLogout} className="mx-3 mb-3 mt-0 hidden rounded bg-red-500 px-4 py-2 text-sm hover:bg-red-600 md:m-3 md:block">
        Keluar
      </button>
    </aside>
  );
}

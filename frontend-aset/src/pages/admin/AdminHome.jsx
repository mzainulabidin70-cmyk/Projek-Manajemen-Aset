import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';

function getActivityDescription(status, userName) {
  let action = 'Pengajuan peminjaman';

  if (status === 'Dikembalikan') {
    action = 'Pengembalian';
  } else if (status === 'Disetujui') {
    action = 'Sedang dipinjam';
  }

  return `${action} · ${userName || 'Peminjam'}`;
}

function getActivityType(status) {
  if (status === 'Dikembalikan') return 'return';
  if (status === 'Disetujui') return 'loan';
  return 'service';
}

const Icon = ({ name, size = 20 }) => {
  const paths = {
    assets: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M8 4V2m8 2V2M3 10h18M8 14h3m-3 3h7" />
      </>
    ),
    loan: (
      <>
        <path d="M4 5h16v15H4z" />
        <path d="M8 5V3h8v2M8 10h8m-8 4h5m-5 3h7" />
      </>
    ),
    check: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.5 2.5L16 9" />
      </>
    ),
    alert: (
      <>
        <path d="m12 3 10 18H2L12 3Z" />
        <path d="M12 9v5m0 3h.01" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14m-6-6 6 6-6 6" />
      </>
    ),
    box: (
      <>
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="M3 8v9l9 5 9-5V8M12 13v9" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
};

export default function AdminHome() {
  const { assets, loans } = useOutletContext();
  const today = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const activityBadgeStyles = {
    loan: 'border-blue-200 bg-blue-50 text-blue-700',
    return: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    service: 'border-amber-200 bg-amber-50 text-amber-700',
  };
  const activityIconNames = {
    loan: 'loan',
    return: 'check',
    service: 'alert',
  };

  const stats = [
    {
      title: 'Total Aset',
      value: assets.length,
      note: 'Terdaftar di inventaris',
      icon: 'assets',
      cardClass: 'border-blue-700 bg-blue-600 text-white',
      iconWrapClass: 'bg-blue-700/80 text-white',
    },
    {
      title: 'Sedang Dipinjam',
      value: loans.filter((loan) => loan.status === 'Disetujui').length,
      note: 'Aset digunakan',
      icon: 'loan',
      cardClass: 'border-amber-600 bg-amber-500 text-white',
      iconWrapClass: 'bg-amber-600/80 text-white',
    },
    {
      title: 'Siap Digunakan',
      value: assets.filter((asset) => asset.status === 'Tersedia' && asset.condition === 'Bagus').length,
      note: 'Aset dalam kondisi baik',
      icon: 'check',
      cardClass: 'border-emerald-700 bg-emerald-600 text-white',
      iconWrapClass: 'bg-emerald-700/80 text-white',
    },
    {
      title: 'Perlu Perhatian',
      value: assets.filter((asset) => asset.condition === 'Rusak').length,
      note: 'Perlu pemeriksaan',
      icon: 'alert',
      cardClass: 'border-rose-700 bg-rose-600 text-white',
      iconWrapClass: 'bg-rose-700/80 text-white',
    },
  ];

  const activities = loans.slice(0, 3).map((loan) => ({
    title: loan.asset_name || 'Aset',
    detail: getActivityDescription(loan.status, loan.user_name),
    time: loan.borrow_date
      ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'short' }).format(new Date(loan.borrow_date))
      : 'Menunggu',
    type: getActivityType(loan.status),
  }));

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <header className="border border-slate-300 bg-white px-4 py-4 sm:px-5 sm:py-5">
        <p className="text-sm font-medium text-blue-700">Dashboard</p>
        <div className="mt-1 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Selamat datang, Admin
            </h1>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              Pantau inventaris dan aktivitas peminjaman aset sekolah dengan mudah.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 sm:text-sm">
            <Icon name="clock" size={16} />
            <span>{today}</span>
          </div>
        </div>
      </header>

      <section
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
        aria-label="Ringkasan aset"
      >
        {stats.map((item) => (
          <article
            key={item.title}
            className={`border p-4 sm:p-5 ${item.cardClass}`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-semibold sm:text-sm">{item.title}</span>
              <span className={`grid h-8 w-8 shrink-0 place-items-center ${item.iconWrapClass}`}>
                <Icon name={item.icon} size={18} />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold sm:text-3xl">{item.value}</div>
            <div className="mt-1 text-xs opacity-85">{item.note}</div>
          </article>
        ))}
      </section>

      <section className="border border-slate-300 bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-slate-300 px-4 py-4 sm:px-5">
          <div>
            <h2 className="font-bold text-slate-800">Aktivitas Peminjaman Terbaru</h2>
            <p className="mt-1 text-sm text-slate-500">
              Riwayat peminjaman dan pengembalian aset terkini.
            </p>
          </div>
          <Link
            to="/admin/transaksi"
            className="inline-flex items-center gap-1.5 border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-blue-600 hover:text-blue-700"
          >
            <span>Lihat semua</span>
            <Icon name="arrow" size={14} />
          </Link>
        </div>

        <ul className="divide-y divide-slate-200">
          {activities.length ? activities.map((activity) => (
            <li
              key={activity.title}
              className="flex items-center justify-between gap-3 px-4 py-3.5 transition hover:bg-blue-50/40 sm:px-5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center border ${
                    activityBadgeStyles[activity.type]
                  }`}
                >
                  <Icon name={activityIconNames[activity.type]} size={17} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {activity.title}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {activity.detail}
                  </p>
                </div>
              </div>
              <time className="shrink-0 border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                {activity.time}
              </time>
            </li>
          )) : <li className="px-5 py-8 text-center text-sm text-slate-500">Belum ada aktivitas peminjaman.</li>}
        </ul>
      </section>
    </div>
  );
}

export default function MobileMenuButton({ isOpen, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
      aria-expanded={isOpen}
      aria-controls="admin-sidebar-menu"
      className="flex h-10 w-10 items-center justify-center rounded border border-blue-600 text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:hidden"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5" aria-hidden="true">
        {isOpen
          ? <path d="m6 6 12 12M18 6 6 18" />
          : <path d="M4 6h16M4 12h16M4 18h16" />}
      </svg>
    </button>
  );
}

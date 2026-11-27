import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import sawah from "../assets/sawah.jpg";
import logo from "../assets/gunacipta.jpg";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || 'Email atau password salah');
        return;
      }

      localStorage.setItem('user', JSON.stringify(result.user));
      setEmail('');
      setPassword('');

      if (result.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/user');
      }
    } catch {
      setError('Gagal terhubung ke server');
    }
  };

  return (
    <div className="relative flex min-h-[100svh] flex-col items-center justify-start gap-1 overflow-hidden p-3 sm:p-5 md:justify-center">
      <img
        src={sawah}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-blue-950/55" aria-hidden="true" />
      <header className="relative z-10 flex w-full max-w-[480px] items-center justify-start gap-3 text-white md:hidden">
        <img src={logo} alt="Logo SMK Guna Cipta" className="h-12 w-12 shrink-0 object-cover" />
        <div>
          <h1 className="text-sm font-bold tracking-wide">SMK GUNA CIPTA</h1>
          <p className="mt-0.5 text-xs leading-snug text-blue-50">Sistem Informasi Manajemen Aset Sekolah</p>
        </div>
      </header>

      <div className="relative z-10 my-auto grid min-h-0 w-full max-w-[480px] translate-x-0 grid-cols-1 overflow-hidden rounded-xl border border-white/70 bg-white shadow-2xl md:my-0 md:max-w-[1100px] md:min-h-[580px] md:-translate-x-4 md:grid-cols-[46%_54%] md:rounded-none">
        <section className="relative hidden min-h-[220px] flex-col items-center justify-center overflow-hidden bg-blue-700 px-5 pb-7 pt-24 text-center text-white/90 md:flex md:min-h-[580px] md:p-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-blue-700/15 to-sky-400/10" aria-hidden="true" />
          <div className="absolute left-1/2 top-5 z-10 flex -translate-x-1/2 items-center gap-3 whitespace-nowrap md:left-8 md:top-8 md:translate-x-0">
            <img src={logo} alt="Logo SMK Guna Cipta" className="h-10 w-10 rounded-none object-cover sm:h-12 sm:w-12" />
            <span className="text-left text-sm font-bold tracking-wide sm:text-lg">SMK GUNA CIPTA</span>
          </div>
          <h1 className="relative max-w-sm text-center text-xl font-bold leading-tight sm:text-3xl">
            Sistem Informasi Manajemen Aset Sekolah
          </h1>
        </section>

        <section className="flex flex-col justify-center bg-blue-50/95 px-5 py-5 sm:px-12 sm:py-9 md:px-16">
          <h2 className="mb-2 text-center text-lg font-bold text-blue-900 sm:mb-3 sm:text-2xl">
            Masuk Ke Manajemen Aset
          </h2>
          <div className="mx-auto mb-3 h-0.5 w-24 bg-black sm:mb-6" aria-hidden="true" />
          <p className="mb-3 text-center text-xs font-bold text-gray-500 sm:mb-4 sm:text-sm">
            Masuk dengan akun yang sudah saya buat
          </p>

          {error && (
            <div className="mb-3 rounded-none bg-red-100 p-3 text-sm text-red-700 sm:mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-medium text-blue-900">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="kepalasekolah@email.com"
                className="mt-1.5 w-full rounded-none border border-blue-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:mt-2 sm:px-4 sm:py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-900">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="******"
                className="mt-1.5 w-full rounded-none border border-blue-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:mt-2 sm:px-4 sm:py-3"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-none bg-gradient-to-r from-blue-500 to-blue-800 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:from-blue-600 hover:to-blue-900 sm:py-3.5"
            >
              Masuk
            </button>
          </form>

          <p className="mt-4 border-t border-blue-200 pt-3 text-center text-xs text-blue-700 sm:mt-6 sm:pt-5 sm:text-sm">
            2026-2027 MANAJEMEN ASET SEKOLAH
          </p>
        </section>
      </div>
    </div>
  );
}

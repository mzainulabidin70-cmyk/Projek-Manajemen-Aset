import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import sawah from "../assets/sawah.jpg";
import logo from "../assets/gunacipta.jpg";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Email atau password salah');
        return;
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      setEmail('');
      setPassword('');

      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/user');
      }
    } catch (err) {
      setError('Gagal terhubung ke server');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-3 sm:p-5">
      <img
        src={sawah}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-blue-950/55" aria-hidden="true" />
      <div className="relative z-10 grid min-h-0 w-full max-w-[480px] translate-x-0 grid-cols-1 overflow-hidden rounded-xl border border-white/70 bg-white shadow-2xl md:max-w-[1100px] md:min-h-[580px] md:-translate-x-4 md:grid-cols-[46%_54%] md:rounded-none">
        <section className="relative flex min-h-[220px] flex-col items-center justify-center overflow-hidden bg-blue-700 px-5 pb-7 pt-24 text-center text-white/90 sm:min-h-[240px] md:min-h-[580px] md:p-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-blue-700/15 to-sky-400/10" aria-hidden="true" />
          <div className="absolute left-1/2 top-5 z-10 flex -translate-x-1/2 items-center gap-3 whitespace-nowrap md:left-8 md:top-8 md:translate-x-0">
            <img src={logo} alt="Logo SMK Guna Cipta" className="h-10 w-10 rounded-none object-cover sm:h-12 sm:w-12" />
            <span className="text-left text-sm font-bold tracking-wide sm:text-lg">SMK GUNA CIPTA</span>
          </div>
          <h1 className="relative max-w-sm text-center text-xl font-bold leading-tight sm:text-3xl">
            Sistem Informasi Manajemen Aset Sekolah
          </h1>
        </section>

        <section className="flex flex-col justify-center bg-blue-50/95 px-5 py-7 sm:px-12 sm:py-9 md:px-16">
          <h2 className="mb-3 text-center text-xl font-bold text-blue-900 sm:text-2xl">
            Masuk Ke Manajemen Aset
          </h2>
          <div className="mx-auto mb-6 h-0.5 w-24 bg-black" aria-hidden="true" />
          <p className="mb-4 text-center text-sm font-bold text-gray-500">
            Masuk dengan akun yang sudah saya buat
          </p>

          {error && (
            <div className="mb-4 rounded-none bg-red-100 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-blue-900">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kepalasekolah@email.com"
                className="mt-2 w-full rounded-none border border-blue-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-900">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="******"
                className="mt-2 w-full rounded-none border border-blue-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-none bg-gradient-to-r from-blue-500 to-blue-800 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:from-blue-600 hover:to-blue-900"
            >
              Masuk
            </button>
          </form>

          <p className="mt-6 border-t border-blue-200 pt-5 text-center text-sm text-blue-700">
            2026-2027 MANAJEMEN ASET SEKOLAH
          </p>
        </section>
      </div>
    </div>
  );
}

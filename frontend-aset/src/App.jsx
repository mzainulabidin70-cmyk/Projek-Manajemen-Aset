import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import Login from './pages/Login';
import AdminLayout from './pages/AdminLayout';
import AdminHome from './pages/admin/AdminHome';
import AdminAssets from './pages/admin/AdminAssets';
import AdminMaster from './pages/admin/AdminMaster';
import AdminLoans from './pages/admin/AdminLoans';
import AdminReport from './pages/admin/AdminReport';
import User from './pages/User';

const adminRoutes = [
  { index: true, element: <AdminHome /> },
  { path: 'daftar-barang', element: <AdminAssets /> },
  { path: 'master-data', element: <Navigate to="/admin/master/categories" replace /> },
  { path: 'master/:section', element: <AdminMaster /> },
  { path: 'transaksi', element: <AdminLoans /> },
  { path: 'laporan', element: <AdminReport /> },
];

const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: adminRoutes,
  },
  {
    path: '/user',
    element: <User />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
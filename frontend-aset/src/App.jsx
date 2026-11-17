import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './pages/Login';
import Admin from './pages/Admin';
import User from './pages/User';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/admin',
    element: <Admin />,
  },
  {
    path: '/user',
    element: <User/>,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
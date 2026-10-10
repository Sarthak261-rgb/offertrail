import { useState } from 'react';
import toast from 'react-hot-toast';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { ApplicationFormModal } from './ApplicationFormModal.jsx';

const NAV_ITEMS = [
  { to: '/', label: 'Board', end: true },
  { to: '/applications', label: 'List' },
  { to: '/stats', label: 'Stats' },
];

const navClass = ({ isActive }) =>
  `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
    isActive
      ? 'bg-indigo-50 text-indigo-700'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`;

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // `false` = closed, otherwise the status to pre-select in the new application form.
  const [createStatus, setCreateStatus] = useState(false);

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      toast.error(error.message);
    }
  }

  const openCreate = (status = 'applied') => setCreateStatus(status);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <NavLink to="/" className="flex items-center gap-2 font-bold text-slate-900">
            <img src="/favicon.svg" alt="" className="h-7 w-7" />
            OfferTrail
          </NavLink>

          <nav aria-label="Main" className="order-last flex w-full gap-1 sm:order-none sm:w-auto">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button type="button" className="btn btn-primary" onClick={() => openCreate()}>
              <span aria-hidden="true">+</span> New
            </button>
            <span className="hidden text-sm text-slate-500 md:inline">{user.name}</span>
            <button type="button" className="btn btn-secondary" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet context={{ openCreate }} />
      </main>

      <ApplicationFormModal
        open={createStatus !== false}
        defaultStatus={createStatus || undefined}
        onClose={() => setCreateStatus(false)}
      />
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { fieldErrorsFrom } from '../api/client.js';
import { useAuth } from '../hooks/useAuth.js';

const DEMO = { email: 'demo@offertrail.dev', password: 'demo1234' };

const COPY = {
  login: {
    title: 'Welcome back',
    submit: 'Log in',
    switchText: 'New here?',
    switchLink: { to: '/register', label: 'Create an account' },
  },
  register: {
    title: 'Start tracking your job search',
    submit: 'Create account',
    switchText: 'Already have an account?',
    switchLink: { to: '/login', label: 'Log in' },
  },
};

/** Login and register share one layout; `mode` switches the fields and the action. */
export function AuthPage({ mode }) {
  const { login, register } = useAuth();
  const [values, setValues] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const copy = COPY[mode];
  const isRegister = mode === 'register';

  const update = (event) => setValues((v) => ({ ...v, [event.target.name]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      // On success the auth state changes and GuestRoute redirects; nothing else to do here.
      if (isRegister) await register(values);
      else await login({ email: values.email, password: values.password });
    } catch (error) {
      setErrors({ ...fieldErrorsFrom(error), form: error.message });
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-sky-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <img src="/favicon.svg" alt="" className="mx-auto h-12 w-12" />
          <h1 className="mt-3 text-2xl font-bold text-slate-900">OfferTrail</h1>
          <p className="mt-1 text-sm text-slate-500">{copy.title}</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="card space-y-4 p-6">
          {errors.form && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {errors.form}
            </p>
          )}

          {isRegister && (
            <div>
              <label htmlFor="name" className="label">
                Name
              </label>
              <input
                id="name"
                name="name"
                className="input"
                autoComplete="name"
                value={values.name}
                onChange={update}
                required
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>
          )}

          <div>
            <label htmlFor="email" className="label">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              autoComplete="email"
              value={values.email}
              onChange={update}
              required
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="input"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              value={values.password}
              onChange={update}
              required
            />
            {isRegister && !errors.password && (
              <p className="mt-1 text-xs text-slate-500">At least 8 characters.</p>
            )}
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
            {submitting ? 'Please wait…' : copy.submit}
          </button>

          {!isRegister && (
            <button
              type="button"
              className="btn btn-secondary w-full"
              onClick={() => setValues((v) => ({ ...v, ...DEMO }))}
            >
              Fill in demo account
            </button>
          )}
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          {copy.switchText}{' '}
          <Link to={copy.switchLink.to} className="font-medium text-indigo-600 hover:underline">
            {copy.switchLink.label}
          </Link>
        </p>
      </div>
    </div>
  );
}

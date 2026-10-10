import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-5xl font-bold text-indigo-600">404</p>
      <p className="text-slate-600">This page doesn't exist.</p>
      <Link to="/" className="btn btn-primary">
        Go to your board
      </Link>
    </div>
  );
}

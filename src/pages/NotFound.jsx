import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export function NotFound() {
  return (
    <div className="py-20 text-center space-y-4 max-w-md mx-auto">
      <h1 className="text-6xl font-black text-emerald-400">404</h1>
      <h2 className="text-lg font-bold text-slate-100">Page Not Found</h2>
      <p className="text-xs text-slate-400">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-glow-green"
      >
        <Home className="w-4 h-4" />
        <span>Return to Store</span>
      </Link>
    </div>
  );
}

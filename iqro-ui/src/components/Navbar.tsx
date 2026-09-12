import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Code2, Home } from 'lucide-react';

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export const Navbar: React.FC = () => {
  const location = useLocation();
  const BASE_URL = import.meta.env.BASE_URL;

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/' || location.pathname === '';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src={`${BASE_URL}icon.png`}
            alt="Logo Iqro"
            className="w-9 h-9 object-contain rounded-lg border border-slate-200 shadow-xs bg-white p-0.5 group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-900 tracking-wider text-base leading-tight">
              IQRO' DIGITAL
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              Open Data Al-Qur'an
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              isActive('/')
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Beranda</span>
          </Link>

          <Link
            to="/baca"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              isActive('/baca')
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Baca Iqro</span>
          </Link>

          <Link
            to="/developer"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              isActive('/developer')
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Developer</span>
          </Link>

          <a
            href="https://github.com/dyazincahya/iqro-json"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 ml-2 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-lg hover:bg-slate-50 transition-all"
            title="Repositori GitHub"
          >
            <GithubIcon className="w-4 h-4" />
            <span>GitHub</span>
          </a>
        </nav>
      </div>
    </header>
  );
};
